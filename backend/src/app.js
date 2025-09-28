// app.js — four-sensor UI + form-driven submit

// ---- DOM refs (four sensors) ----
const heart_rateEl = document.getElementById('heart_rate');
const spoEl = document.getElementById('spo');
const TempCEl = document.getElementById('TempC');
const TempFEl = document.getElementById('TempF');
const alcohol_detectedEl = document.getElementById('alcohol_detected');
const alcohol_levelEl = document.getElementById('alcohol_level');

const tEl      = document.getElementById('t');
const statusEl = document.getElementById('status');
const outEl    = document.getElementById('out');

// Form + buttons
const userForm       = document.getElementById('user-form');
const userResponseEl = document.getElementById('user-response');
const saveLatestBtn  = document.getElementById('save-latest');
const dbLatestBtn    = document.getElementById('db-latest');

// ---- Live polling ----
async function tick() {
  try {
    const res = await fetch('/api/sensor', { cache: 'no-store' });
    if (res.status === 204) {
      if (statusEl) {
        statusEl.textContent = 'no data yet…';
        statusEl.className = 'status-indicator status-waiting';
      }
      return;
    }

    const data = await res.json();

    // Multi-sensor data mapping
    const heart_rate = data.heart_rate ?? null;
    const spo = data.spo ?? null;
    const TempC = data.TempC ?? null;
    const TempF = data.TempF ?? null;
    const alcohol_detected = data.alcohol_detected ?? null;
    const alcohol_level = data.alcohol_level ?? null;
    

    if (heart_rateEl) heart_rateEl.textContent = heart_rate ?? '—';
    if (spoEl) spoEl.textContent = spo ?? '—';
    if (TempCEl) TempCEl.textContent = TempC ?? '—';
    if (TempFEl) TempFEl.textContent = TempF ?? '—';
    if (alcohol_detectedEl) alcohol_detectedEl.textContent = alcohol_detected ?? '—';
    if (alcohol_levelEl) alcohol_levelEl.textContent = alcohol_level ?? '—';

    if (tEl)  tEl.textContent  = data.t ?? '—';

    if (statusEl) {
      statusEl.textContent = 'live';
      statusEl.className = 'status-indicator status-live';
    }
  } catch {
    if (statusEl) {
      statusEl.textContent = 'error fetching';
      statusEl.className = 'status-indicator status-error';
    }
  }
}
setInterval(tick, 200);
tick();

// ---- helpers ----
function showUserResponse(msg, ok = true) {
  if (!userResponseEl) return;
  userResponseEl.style.display = 'block';
  userResponseEl.className = `user-response ${ok ? 'success' : 'error'}`;
  userResponseEl.textContent = msg;
}

async function postJSON(path, body) {
  const r = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {})
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || r.statusText);
  return j;
}

function getFormData() {
  const fd = new FormData(userForm);
  return {
    name: (fd.get('name') || '').toString().trim(),
    dateOfBirth: (fd.get('dateOfBirth') || '').toString(),
    insurance: (fd.get('insurance') || '').toString(),
    symptoms: (fd.get('symptoms') || '').toString().trim()
  };
}

function validateUserData(u) {
  if (!u.name || !u.dateOfBirth || !u.insurance || !u.symptoms) {
    throw new Error('Please fill in all required fields.');
  }
}

// ---- form submit: capture ONE new reading + save with patient info ----
if (userForm) {
  userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!userForm.reportValidity()) return;

    const payload = getFormData();

    try {
      validateUserData(payload);
      const submitBtn = userForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      if (outEl) outEl.textContent = 'Submitting (waiting for sensor)…';

      const res = await postJSON('/api/capture-and-save', payload);
      if (outEl) outEl.textContent = JSON.stringify(res, null, 2);
      showUserResponse('✅ Submission saved!');
      userForm.reset();
    } catch (e) {
      if (outEl) outEl.textContent = 'Error: ' + e.message;
      showUserResponse('Error: ' + e.message, false);
    } finally {
      const submitBtn = userForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// ---- save cached reading (no new capture), optional patient info ----
if (saveLatestBtn) {
  saveLatestBtn.addEventListener('click', async () => {
    saveLatestBtn.disabled = true;
    if (outEl) outEl.textContent = 'Saving latest reading…';
    try {
      const payload = userForm ? getFormData() : {};
      const res = await postJSON('/api/save-latest', payload);
      if (outEl) outEl.textContent = JSON.stringify(res, null, 2);
      showUserResponse('Saved latest reading.');
    } catch (e) {
      if (outEl) outEl.textContent = 'Error: ' + e.message;
      showUserResponse('Error: ' + e.message, false);
    } finally {
      saveLatestBtn.disabled = false;
    }
  });
}

// ---- show latest row from DB ----
if (dbLatestBtn) {
  dbLatestBtn.addEventListener('click', async () => {
    dbLatestBtn.disabled = true;
    if (outEl) outEl.textContent = 'Fetching latest from DB…';
    try {
      const r = await fetch('/api/sensor/db-latest');
      if (r.status === 204) {
        if (outEl) outEl.textContent = 'No rows yet.';
      } else {
        const j = await r.json();
        if (outEl) outEl.textContent = JSON.stringify(j, null, 2);
      }
    } catch (e) {
      if (outEl) outEl.textContent = 'Error: ' + e.message;
    } finally {
      dbLatestBtn.disabled = false;
    }
  });
}
