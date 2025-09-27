// app.js - Arduino Live MQ-3 Sensor Application

// DOM element references
const analogEl = document.getElementById('analog');
const digitalEl = document.getElementById('digital');
const tEl = document.getElementById('t');
const statusEl = document.getElementById('status');
const outEl = document.getElementById('out');
const submitBtn = document.getElementById('submit');
const saveLatestBtn = document.getElementById('save-latest');
const dbLatestBtn = document.getElementById('db-latest');
const userForm = document.getElementById('user-form');
const userResponseEl = document.getElementById('user-response');

// Live sensor data polling
async function tick() {
  try {
    const res = await fetch('/api/sensor', { cache: 'no-store' });
    if (res.status === 204) {
      statusEl.textContent = 'no data yet…';
      return;
    }
    const data = await res.json();
    analogEl.textContent = data.analog ?? '—';
    digitalEl.textContent = data.digital ?? '—';
    tEl.textContent = data.t ?? '—';
    statusEl.textContent = 'live';
  } catch (e) {
    statusEl.textContent = 'error fetching';
  }
}

// Start live polling
setInterval(tick, 200);
tick();

// Utility function for POST requests
async function postJSON(path, data = null) {
  const options = { method: 'POST' };
  if (data) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(data);
  }
  const r = await fetch(path, options);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || r.statusText);
  return j;
}

// Get user data from form
function getUserData() {
  const formData = new FormData(userForm);
  return {
    name: formData.get('name'),
    dateOfBirth: formData.get('dateOfBirth'),
    insurance: formData.get('insurance')
  };
}

// Validate user data
function validateUserData(userData) {
  if (!userData.name || !userData.dateOfBirth || !userData.insurance) {
    throw new Error('Please fill in all user information fields before capturing sensor data');
  }
}

// Show user response message
function showUserResponse(message, isSuccess = true) {
  userResponseEl.style.display = 'block';
  userResponseEl.textContent = message;
  if (isSuccess) {
    userResponseEl.style.background = '#d4edda';
    userResponseEl.style.color = '#155724';
  } else {
    userResponseEl.style.background = '#f8d7da';
    userResponseEl.style.color = '#721c24';
  }
}

// Submit button - capture new reading with user info
submitBtn.addEventListener('click', async () => {
  submitBtn.disabled = true;
  outEl.textContent = 'Capturing the next reading and saving…';
  
  try {
    const userData = getUserData();
    validateUserData(userData);
    
    const res = await postJSON('/api/capture-and-save', userData);
    outEl.textContent = JSON.stringify(res, null, 2);
    showUserResponse('Success! Sensor reading saved with user information.');
  } catch (e) {
    outEl.textContent = 'Error: ' + e.message;
    showUserResponse('Error: ' + e.message, false);
  } finally {
    submitBtn.disabled = false;
  }
});

// Save latest button - save cached reading with user info
saveLatestBtn.addEventListener('click', async () => {
  saveLatestBtn.disabled = true;
  outEl.textContent = 'Saving the currently cached reading…';
  
  try {
    const userData = getUserData();
    validateUserData(userData);
    
    const res = await postJSON('/api/save-latest', userData);
    outEl.textContent = JSON.stringify(res, null, 2);
    showUserResponse('Success! Cached sensor reading saved with user information.');
  } catch (e) {
    outEl.textContent = 'Error: ' + e.message;
    showUserResponse('Error: ' + e.message, false);
  } finally {
    saveLatestBtn.disabled = false;
  }
});

// Show latest from DB button
dbLatestBtn.addEventListener('click', async () => {
  dbLatestBtn.disabled = true;
  outEl.textContent = 'Fetching latest from database…';
  
  try {
    const r = await fetch('/api/sensor/db-latest');
    if (r.status === 204) {
      outEl.textContent = 'No rows in DB yet.';
    } else {
      const j = await r.json();
      outEl.textContent = JSON.stringify(j, null, 2);
    }
  } catch (e) {
    outEl.textContent = 'Error: ' + e.message;
  } finally {
    dbLatestBtn.disabled = false;
  }
});
