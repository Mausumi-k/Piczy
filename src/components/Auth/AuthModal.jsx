import React, { useState } from 'react';
import { API, Auth } from '../../utils/api';
import './AuthModal.css';

export default function AuthModal({ onLoginSuccess, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await API.login(username, password);
      } else {
        res = await API.register(username, password);
      }

      if (res.success) {
        Auth.setToken(res.token);
        Auth.setUser(res.user);
        onLoginSuccess();
      } else {
        setError(res.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Connection failed. Is the server running?');
    }
    setLoading(false);
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal glass-panel">
        <button className="auth-close" onClick={onClose}>×</button>
        <h2>{isLogin ? 'Welcome Back!' : 'Join Pixelia'}</h2>
        <p className="auth-subtitle">
          {isLogin ? 'Log in to access your pixel studio.' : 'Create an account to save your art.'}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <input 
            type="text" 
            placeholder="Artist Name" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="auth-input"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          <button type="submit" className="cozy-button huge-button auth-submit" disabled={loading}>
            {loading ? '...' : isLogin ? 'Enter Studio ✨' : 'Create Account 🚀'}
          </button>
        </form>

        <p className="auth-toggle">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
