// server.js
const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
app.use(express.static('public'));
const PORT = 3000;

// --- Arduino serial setup ---
const port = new SerialPort({ path: 'COM3', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

let latest = null;

parser.on('data', (line) => {
  const s = String(line).trim();

  // 1) Try JSON (future-proof if you switch Arduino to JSON later)
  try {
    const obj = JSON.parse(s);
    latest = obj;
    return;
  } catch (_) {}

  // 2) Fallback: CSV "analog, digital" (e.g., 512, 1)
  const m = s.match(/^\s*(\d+)\s*,\s*(\d+)\s*$/);
  if (m) {
    latest = {
      analog: Number(m[1]),
      digital: Number(m[2]),
      t: Date.now()
    };
    return;
  }

  // 3) Not JSON or CSV — ignore
});

// API to fetch most recent reading
app.get('/api/sensor', (_req, res) => {
  if (!latest) return res.status(204).end();
  res.json(latest);
});

// (Optional) quick debug endpoint
app.get('/api/debug', (_req, res) => {
  res.json({ latest });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
