// server.js — CommonJS + gated capture

// 0) ENV + deps (keep dotenv first)
require('dotenv').config(); // if your .env is one folder up, use: config({ path: '../.env' })
const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.static('public'));
app.use(express.json()); // Parse JSON request bodies
const PORT = 3000;

// 1) Supabase (server key ONLY on backend)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 2) Serial port + parser (declare before any use of `parser`)
const SERIAL_PATH = 'COM3'; // change for mac/linux (e.g. '/dev/tty.usbmodemXXXX')
const port = new SerialPort({ path: SERIAL_PATH, baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

port.on('open', () => console.log('Serial port opened:', SERIAL_PATH));
port.on('error', (e) => console.error('Serial error:', e.message));

let latest = null;          // last parsed reading cached in memory
let captureInFlight = false; // prevents double-captures

// 3) Helpers
function parseReadingFromLine(line) {
  const s = String(line).trim();
  // JSON first
  try {
    const obj = JSON.parse(s);
    return { ...obj, t: Date.now(), raw: s };
  } catch (_) {}
  // CSV "analog, digital"
  const m = s.match(/^\s*(\d+)\s*,\s*(\d+)\s*$/);
  if (m) {
    return {
      analog: Number(m[1]),
      digital: Number(m[2]),
      t: Date.now(),
      raw: s
    };
  }
  return null;
}

async function saveReadingToDB(reading, userInfo = null) {
  const insertData = {
    analog: reading.analog ?? null,
    digital: reading.digital ?? null,
    raw: reading.raw ?? null
  };
  
  // Add user information if provided
  if (userInfo) {
    insertData.name = userInfo.name;
    insertData.date_of_birth = userInfo.dateOfBirth;
    insertData.insurance = userInfo.insurance;
  }
  
  const { data, error } = await supabase
    .from('readings') // table must exist with columns: analog int, digital int, raw text, name text, date_of_birth date, insurance text, created_at timestamptz
    .insert(insertData)
    .select();
  if (error) throw error;
  return data?.[0];
}

// Wait for exactly ONE next valid reading (optional timeout)
function getNextReading(timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const onData = (line) => {
      const r = parseReadingFromLine(line);
      if (r) {
        parser.off('data', onData);
        clearTimeout(timer);
        resolve(r);
      }
    };
    const timer = setTimeout(() => {
      parser.off('data', onData);
      reject(new Error('Timed out waiting for a reading'));
    }, timeoutMs);
    parser.on('data', onData);
  });
}

// 4) Serial listener — cache ONLY (don’t auto-insert)
parser.on('data', (line) => {
  const r = parseReadingFromLine(line);
  if (r) {
    latest = r;
    // console.log('serial:', r); // uncomment for debugging
  }
});

// 5) Routes

// Live preview (from memory)
app.get('/api/sensor', (_req, res) => {
  if (!latest) return res.status(204).end();
  res.json(latest);
});

// Latest from DB
app.get('/api/sensor/db-latest', async (_req, res) => {
  const { data, error } = await supabase
    .from('readings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) return res.status(500).json({ error: error.message });
  if (!data || !data.length) return res.status(204).end();
  res.json(data[0]);
});

// Gated: user clicks Submit → capture ONE new reading, then insert
app.post('/api/capture-and-save', async (req, res) => {
  if (captureInFlight) return res.status(409).json({ error: 'Capture already in progress' });
  captureInFlight = true;
  try {
    const reading = await getNextReading(5000);
    const userInfo = req.body.name ? req.body : null; // Include user info if provided
    const saved = await saveReadingToDB(reading, userInfo);
    res.json({ saved });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    captureInFlight = false;
  }
});

// Gated: save whatever is currently cached in `latest`
app.post('/api/save-latest', async (req, res) => {
  if (!latest) return res.status(409).json({ error: 'No reading available yet' });
  try {
    const userInfo = req.body.name ? req.body : null; // Include user info if provided
    const saved = await saveReadingToDB(latest, userInfo);
    res.json({ saved });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Manual test insert (handy while wiring things up)
app.post('/api/test-insert', async (_req, res) => {
  const { data, error } = await supabase
    .from('readings')
    .insert({ analog: 123, digital: 1, raw: 'manual test' })
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ inserted: data });
});


// Debug
app.get('/api/debug', (_req, res) => res.json({ latest }));

// 6) Start + graceful shutdown
process.on('SIGINT', () => {
  console.log('\nClosing serial port…');
  port.close(() => process.exit(0));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
