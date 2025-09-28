import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import SensorDashboard from './components/SensorDashboard';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleLogin = (data) => {
    setUserData(data);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUserData(null);
    setIsLoggedIn(false);
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <SensorDashboard userData={userData} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
