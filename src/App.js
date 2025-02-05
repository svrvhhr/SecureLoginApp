import React, { useState } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSubmit = async (type) => {
    try {
      const res = await fetch(`http://localhost:3000/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      setMessage(data.message);
      setMessageType(res.ok ? 'success' : 'error');
    } catch (error) {
      setMessage('Erreur de connexion');
      setMessageType('error');
    }
  };

  const handleReset = () => {
    setUsername('');
    setPassword('');
    setMessage('');
  };

  return (
    <div className="app-container">
      <div className="login-box">
        <div className="header">
          <div className="logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path fill="#4a90e2" d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4z"/>
            </svg>
          </div>
          <h1>Système de Login</h1>
        </div>

        <div className="input-group">
          <label>Identifiant</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Entrez votre identifiant"
          />
        </div>

        <div className="input-group">
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Entrez votre mot de passe"
          />
        </div>

        <div className="button-group">
          <button 
            className="btn-login"
            onClick={() => handleSubmit('login')}
          >
            OK
          </button>
          
          <button 
            className="btn-reset"
            onClick={handleReset}
          >
            Reset
          </button>
          
          <button 
            className="btn-register"
            onClick={() => handleSubmit('register')}
          >
            Ajout compte
          </button>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;