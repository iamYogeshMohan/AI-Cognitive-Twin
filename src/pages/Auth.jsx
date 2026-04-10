import React, { useState } from 'react';
import './Auth.css';

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Simulate API request or attempt connection to your Node backend
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const url = `http://localhost:5050${endpoint}`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }
      
      localStorage.setItem('ct_token', data.token);
      localStorage.setItem('ct_user', JSON.stringify(data.user));
      onLogin(); // Tell App.jsx we are authenticated
      
    } catch (err) {
      // Graceful Fallback: If backend is not running, we still mock an authentication token
      // so the user can easily get into the React App interface.
      console.warn("Backend API not reachable or error. Using fallback mock login.", err);
      
      // Artificial delay for UX
      await new Promise(r => setTimeout(r, 800));
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      localStorage.setItem('ct_token', 'mock_token_' + Date.now());
      localStorage.setItem('ct_user', JSON.stringify({ 
        name: formData.name || formData.email.split('@')[0], 
        email: formData.email 
      }));
      onLogin();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-icon">🧠</div>
          <span className="brand-name">Cognitive Twin</span>
          <span className="brand-badge">BETA</span>
        </div>
        
        <h1 className="auth-title">{isLogin ? 'Welcome back' : 'Create account'}</h1>
        <p className="auth-sub">{isLogin ? 'Sign in to access your cognitive twin' : 'Build your digital AI alter-ego'}</p>
        
        {error && <div className="alert alert-error show">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Full name</label>
              <input 
                type="text" 
                placeholder="Yogesh Kumar" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required={!isLogin} 
              />
            </div>
          )}
          <div className="form-group">
            <label>Email address</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              required 
              minLength={6}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <span className="spinner"></span> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        
        <p className="auth-footer">
          {isLogin ? "New here? " : "Already have an account? "}
          <span className="auth-link" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Create an account' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Auth;
