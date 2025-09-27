// server.js (CommonJS)

require('dotenv').config(); // load .env FIRST
const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.static('public'));
const PORT = 3000;

// --- Supabase (server key only on backend) ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- Arduino serial setup ---
const port = new SerialPort({ path: 'COM3', baudRate: 9600 }); // adjust for your OS
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

let latest = null;

// Fire-and-forget insert (don’t block serial parser loop)
async function saveReadingToDB(reading) {
  try {
    const { error } = await supabase.from('readings').insert({
      analog: reading.analog ?? null,
      digital: reading.digital ?? null,
      raw: reading.raw ?? null
    });
    if (error) console.error('Supabase insert error:', error.message);
  } catch (e) {
    console.error('Supabase insert exception:', e);
  }
}

parser.on('data', (line) => {
  const s = String(line).trim();

  // 1) Try JSON
  try {
    const obj = JSON.parse(s);
    latest = { ...obj, t: Date.now(), raw: s };
    void saveReadingToDB(latest);
    return;
  } catch (_) {}

  // 2) CSV "analog, digital" (e.g., 512, 1)
  const m = s.match(/^\s*(\d+)\s*,\s*(\d+)\s*$/);
  if (m) {
    latest = {
      analog: Number(m[1]),
      digital: Number(m[2]),
      t: Date.now(),
      raw: s
    };
    void saveReadingToDB(latest);
    return;
  }

  // 3) Not JSON or CSV — ignore (or log)
  // console.log('Unrecognized line:', s);
});

// API to fetch most recent reading (from memory)
app.get('/api/sensor', (_req, res) => {
  if (!latest) return res.status(204).end();
  res.json(latest);
});

// Optional: fetch most recent from DB instead of memory
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

// Quick debug
app.get('/api/debug', (_req, res) => res.json({ latest }));

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nClosing serial port…');
  port.close(() => process.exit(0));
});
// Quick manual test: insert a dummy row into Supabase
app.post('/api/test-insert', async (_req, res) => {
  const { data, error } = await supabase
    .from('readings')        // must match your Supabase table name
    .insert({
      analog: 123,           // sample analog value
      digital: 1,            // sample digital value
      raw: 'manual test'     // optional debug text
    })
    .select();               // returns inserted row(s)

  if (error) return res.status(500).json({ error: error.message });
  res.json({ inserted: data });
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
