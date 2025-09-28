// app.js — form-driven submit + consent gate

// ---- Consent gate (index/app pages only) ----
(function () {
  console.log('Consent check running...');
  const onConsentPage = /\/consent\.html$/.test(location.pathname);
  const consentGranted = sessionStorage.getItem('medicalConsent') === 'true';
  
  console.log('Current path:', location.pathname);
  console.log('On consent page:', onConsentPage);
  console.log('Consent granted:', consentGranted);

  if (!onConsentPage && !consentGranted) {
    console.log('Redirecting to consent page...');
    // Not consented → go to consent first
    location.replace('/consent.html');
  } else {
    console.log('No redirect needed');
  }
  // If we're on consent OR consent is granted, continue loading the app code below
})();

// ---- DOM refs ----
const analogEl  = document.getElementById('analog');
const digitalEl = document.getElementById('digital');
const tEl       = document.getElementById('t');
const statusEl  = document.getElementById('status');
const outEl     = document.getElementById('out');

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
    if (analogEl)  analogEl.textContent  = data.analog  ?? '—';
    if (digitalEl) digitalEl.textContent = data.digital ?? '—';
    if (tEl)       tEl.textContent       = data.t       ?? '—';
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
    firstName: (fd.get('firstName') || '').toString().trim(),
    lastName: (fd.get('lastName') || '').toString().trim(),
    dateOfBirth: (fd.get('dateOfBirth') || '').toString(),
    insurance: (fd.get('insurance') || '').toString(),
    insuranceId: (fd.get('insuranceId') || '').toString().trim(),
    symptoms: (fd.get('symptoms') || '').toString().trim()
  };
}

function validateUserData(u) {
  if (!u.firstName || !u.lastName || !u.dateOfBirth || !u.insurance || !u.insuranceId || !u.symptoms) {
    throw new Error('Please fill in all required fields.');
  }
}

// ---- form submit: capture ONE new reading + save with patient info ----
if (userForm) {
  userForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // stop default form submit/reload
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
