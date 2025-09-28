import React, { useState, useEffect } from 'react';
import './SensorDashboard.css';

const SensorDashboard = ({ userData, onLogout }) => {
  const [sensorData, setSensorData] = useState({
    analog: '—',
    digital: '—',
    timestamp: '—'
  });
  const [status, setStatus] = useState('waiting…');
  const [isCapturing, setIsCapturing] = useState(false);
  const [response, setResponse] = useState('');
  const [userResponse, setUserResponse] = useState('');

  // Live sensor data polling
  useEffect(() => {
    const tick = async () => {
      try {
        const res = await fetch('/api/sensor', { cache: 'no-store' });
        if (res.status === 204) {
          setStatus('no data yet…');
          return;
        }
        const data = await res.json();
        setSensorData({
          analog: data.analog ?? '—',
          digital: data.digital ?? '—',
          timestamp: data.t ?? '—'
        });
        setStatus('live');
      } catch (e) {
        setStatus('error fetching');
      }
    };

    const interval = setInterval(tick, 200);
    tick(); // Initial call

    return () => clearInterval(interval);
  }, []);

  const postJSON = async (path, data = null) => {
    const options = { method: 'POST' };
    if (data) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(data);
    }
    const r = await fetch(path, options);
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || r.statusText);
    return j;
  };

  const showUserResponse = (message, isSuccess = true) => {
    setUserResponse(message);
    setTimeout(() => setUserResponse(''), 5000);
  };

  const handleCaptureAndSave = async () => {
    setIsCapturing(true);
    setResponse('Capturing the next reading and saving…');
    
    try {
      const res = await postJSON('/api/capture-and-save', userData);
      setResponse(JSON.stringify(res, null, 2));
      showUserResponse('Success! Sensor reading saved with user information.');
    } catch (e) {
      setResponse('Error: ' + e.message);
      showUserResponse('Error: ' + e.message, false);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSaveLatest = async () => {
    setIsCapturing(true);
    setResponse('Saving the currently cached reading…');
    
    try {
      const res = await postJSON('/api/save-latest', userData);
      setResponse(JSON.stringify(res, null, 2));
      showUserResponse('Success! Cached sensor reading saved with user information.');
    } catch (e) {
      setResponse('Error: ' + e.message);
      showUserResponse('Error: ' + e.message, false);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleShowLatest = async () => {
    setIsCapturing(true);
    setResponse('Fetching latest from database…');
    
    try {
      const r = await fetch('/api/sensor/db-latest');
      if (r.status === 204) {
        setResponse('No rows in DB yet.');
      } else {
        const j = await r.json();
        setResponse(JSON.stringify(j, null, 2));
      }
    } catch (e) {
      setResponse('Error: ' + e.message);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="user-info">
          <h1>🏥 Medical Sensor Dashboard</h1>
          <div className="user-details">
            <span className="user-name">Welcome, {userData.name}</span>
            <span className="user-details-text">
              DOB: {userData.dateOfBirth} | Insurance: {userData.insurance}
            </span>
          </div>
        </div>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="sensor-card">
          <h2>Live Sensor Data</h2>
          <div className="sensor-readings">
            <div className="reading-item">
              <span className="reading-label">Analog Reading:</span>
              <span className="reading-value analog">{sensorData.analog}</span>
            </div>
            <div className="reading-item">
              <span className="reading-label">Digital Output:</span>
              <span className="reading-value digital">{sensorData.digital}</span>
            </div>
            <div className="reading-item">
              <span className="reading-label">Timestamp:</span>
              <span className="reading-value timestamp">{sensorData.timestamp}</span>
            </div>
            <div className="reading-item">
              <span className="reading-label">Status:</span>
              <span className={`status-indicator ${status.replace(' ', '-')}`}>
                {status}
              </span>
            </div>
          </div>
        </div>

        <div className="user-info-card">
          <h2>Patient Information</h2>
          <div className="patient-details">
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{userData.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date of Birth:</span>
              <span className="detail-value">{userData.dateOfBirth}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Insurance:</span>
              <span className="detail-value">{userData.insurance}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Symptoms:</span>
              <span className="detail-value symptoms">{userData.symptoms}</span>
            </div>
          </div>
        </div>

        <div className="controls-card">
          <h2>Sensor Controls</h2>
          <div className="control-buttons">
            <button 
              onClick={handleCaptureAndSave}
              disabled={isCapturing}
              className="control-button primary"
            >
              {isCapturing ? 'Capturing...' : 'Capture & Save New Reading'}
            </button>
            <button 
              onClick={handleSaveLatest}
              disabled={isCapturing}
              className="control-button secondary"
            >
              {isCapturing ? 'Saving...' : 'Save Latest Reading'}
            </button>
            <button 
              onClick={handleShowLatest}
              disabled={isCapturing}
              className="control-button tertiary"
            >
              {isCapturing ? 'Loading...' : 'Show Latest from DB'}
            </button>
          </div>
        </div>

        {userResponse && (
          <div className="user-response">
            {userResponse}
          </div>
        )}

        <div className="response-card">
          <h3>Server Response</h3>
          <pre className="response-content">{response || '—'}</pre>
        </div>
      </div>
    </div>
  );
};

export default SensorDashboard;
