// server.js — CommonJS + gated capture

// 0) ENV + deps (keep dotenv first)
require('dotenv').config(); // if your .env is one folder up, use: config({ path: '../.env' })
const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// CORS middleware for frontend communication
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins for now
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

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
let port = null;
let parser = null;

console.log('Attempting to connect to Arduino on:', SERIAL_PATH);
try {
  port = new SerialPort({ path: SERIAL_PATH, baudRate: 9600 });
  parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

  port.on('open', () => {
    console.log('✅ Serial port opened successfully:', SERIAL_PATH);
    console.log('Arduino connected - ready to receive data');
  });
  port.on('error', (e) => {
    console.error('❌ Serial error:', e.message);
    console.log('Arduino connection failed - no sensor data will be available');
    port = null;
    parser = null;
  });
} catch (e) {
  console.error('❌ Failed to initialize serial port:', e.message);
  console.log('Arduino connection failed - no sensor data will be available');
  port = null;
  parser = null;
}

// Ensure parser is null if port failed to initialize
if (!port) {
  parser = null;
}

let latest = null;          // last parsed reading cached in memory
let captureInFlight = false; // prevents double-captures
let collecting = true;
function pauseCollecting() {
  collecting = false;
  console.log('⏸️ Collecting paused (latest will no longer update)');
}

function resumeCollecting() {
  collecting = true;
  console.log('▶️ Collecting resumed');
}

// 3) Helpers
function parseReadingFromLine(line) {
  const s = String(line).trim();

  // 1) JSON first (e.g., {"heart_rate":..., "spo":..., "TempC":..., "TempF":..., "alcohol_detected":..., "alcohol_level":...})
  try {
    const obj = JSON.parse(s);
    return { ...obj, t: Date.now(), raw: s };
  } catch (_) {}

  // 2) CSV with six values: heart_rate,spo,TempC,TempF,alcohol_detected,alcohol_level
  let m = s.match(/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*$/);
  if (m) {
    return {
      heart_rate: +m[1], spo: +m[2],
      TempC: +m[3], TempF: +m[4],
      alcohol_detected: +m[5], alcohol_level: +m[6],
      t: Date.now(), raw: s
    };
  }

  // 3) CSV with four values: heart_rate,spo,TempC,TempF
  m = s.match(/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*$/);
  if (m) {
    return { heart_rate: +m[1], spo: +m[2], TempC: +m[3], TempF: +m[4], t: Date.now(), raw: s };
  }

  // 4) Legacy CSV with two values: heart_rate,spo
  m = s.match(/^\s*(\d+)\s*,\s*(\d+)\s*$/);
  if (m) {
    return { heart_rate: +m[1], spo: +m[2], t: Date.now(), raw: s };
  }

  return null;
}



async function saveReadingToDB(reading, userInfo = null) {
  const insertData = {
    // New multi-sensor fields
    heart_rate: reading.heart_rate ?? null,
    spo: reading.spo ?? null,
    TempC: reading.TempC ?? null,
    TempF: reading.TempF ?? null,
    alcohol_detected: reading.alcohol_detected ?? null,
    alcohol_level: reading.alcohol_level ?? null,


    raw: reading.raw ?? null,
  };

  if (userInfo) {
    insertData.first_name = userInfo.firstName ?? null;
    insertData.last_name = userInfo.lastName ?? null;
    insertData.date_of_birth = userInfo.dateOfBirth ?? null;
    insertData.insurance = userInfo.insurance ?? null;
    insertData.insurance_ID = userInfo.insuranceId ?? null;
    insertData.symptoms = userInfo.symptoms ?? null;
  }

  // If you added a JSONB 'payload' column, uncomment this:
  // insertData.payload = reading;

  // Local fallback if env not set
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const fs = require('fs');
    const path = require('path');
    const dataFile = path.join(__dirname, '..', 'saved_data.json');
    const arr = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : [];
    arr.push(insertData);
    fs.writeFileSync(dataFile, JSON.stringify(arr, null, 2));
    return { ...insertData, id: arr.length, saved_locally: true };
  }

  const { data, error } = await supabase.from('readings').insert(insertData).select();
  if (error) throw error;
  return data?.[0];
}

// Wait for exactly ONE next valid reading (optional timeout)
function getNextReading(timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    if (!parser) { 
      reject(new Error('No Arduino connected - cannot capture sensor data'));
      return;
    }

    // real serial path
    const onData = (line) => {
      const r = parseReadingFromLine(line);
      if (r) { cleanup(); resolve(r); }
    };
    const timer = setTimeout(() => { cleanup(); reject(new Error('Timed out waiting for a reading')); }, timeoutMs);
    const cleanup = () => { try { parser.off('data', onData); } catch {} clearTimeout(timer); };

    parser.on('data', onData);
  });
}

// 4) Serial listener — cache ONLY (don't auto-insert)
if (parser) {
  console.log('Setting up Arduino data listener...');
  parser.on('data', (line) => {
    console.log('📡 Received from Arduino:', line.trim());
    const r = parseReadingFromLine(line);
    if (r) {
      console.log('✅ Parsed data successfully:', r);
      if (collecting) {
        latest = r;
        console.log('💾 Data cached as latest reading');
      } else {
        console.log('⏸️ Data received but collecting is paused');
      }
    } else {
      console.log('❌ Failed to parse data from line:', line.trim());
    }
  });
} else {
  console.log('No Arduino connected - waiting for real sensor data');
}

// 5) Routes

// Live preview (from memory)
app.get('/api/sensor', (_req, res) => {
  console.log('🔍 API request - latest data:', latest);
  if (!latest) {
    console.log('❌ No data available - returning 204');
    return res.status(204).end();
  }
  console.log('✅ Sending data to frontend:', latest);
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

// Get all readings with user data for doctor view
app.get('/api/readings/all', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const { data, error } = await supabase
      .from('readings')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    res.json({ readings: data || [], count: data?.length || 0 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Gated: user clicks Submit → capture ONE new reading, then insert
app.post('/api/capture-and-save', async (req, res) => {
  if (captureInFlight) return res.status(409).json({ error: 'Capture already in progress' });
  captureInFlight = true;
  try {
    console.log('Received request body:', req.body); // Debug log
    const reading = await getNextReading(5000);
    console.log('Captured reading:', reading); // Debug log
    const userInfo = req.body.firstName ? req.body : null; // Include user info if provided
    console.log('User info to save:', userInfo); // Debug log
    const saved = await saveReadingToDB(reading, userInfo);
    console.log('Saved to database:', saved); // Debug log
    res.json({ saved, message: 'Data successfully saved to database' });
  } catch (e) {
    console.error('Error in capture-and-save:', e); // Debug log
    res.status(500).json({ error: e.message });
  } finally {
    captureInFlight = false;
  }
});

// Gated: save whatever is currently cached in `latest`
app.post('/api/save-latest', async (req, res) => {
  if (!latest) return res.status(409).json({ error: 'No reading available yet' });
  try {
    const userInfo = req.body.firstName ? req.body : null;
    const saved = await saveReadingToDB(latest, userInfo);

    pauseCollecting(); // <-- stop updating `latest` after this save

    res.json({ saved, collecting }); // return the new state for UI
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Manual test insert (handy while wiring things up)
app.post('/api/test-insert', async (_req, res) => {
  const { data, error } = await supabase
    .from('readings')
    .insert({ heart_rate: 123, spo: 1, raw: 'manual test' })
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ inserted: data });
});

// Test endpoint - requires Arduino connection
app.post('/api/test-submit', async (req, res) => {
  try {
    console.log('Test submit - received data:', req.body);
    
    if (!parser) {
      return res.status(400).json({ 
        error: 'No Arduino connected - cannot capture sensor data for testing' 
      });
    }
    
    // Capture real sensor data
    const reading = await getNextReading(5000);
    const userInfo = req.body.firstName ? req.body : null;
    
    console.log('Test submit - captured reading:', reading);
    console.log('Test submit - user info:', userInfo);
    
    const saved = await saveReadingToDB(reading, userInfo);
    console.log('Test submit - saved to database:', saved);
    
    res.json({ 
      success: true, 
      message: 'Real sensor data captured and saved successfully',
      saved,
      reading,
      userInfo 
    });
  } catch (e) {
    console.error('Test submit error:', e);
    res.status(500).json({ error: e.message });
  }
});


// Debug
app.get('/api/debug', (_req, res) => {
  res.json({ 
    latest,
    parser: !!parser,
    port: !!port,
    collecting,
    serialPath: SERIAL_PATH
  });
});

// 6) Start + graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server…');
  if (port) {
    port.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));  