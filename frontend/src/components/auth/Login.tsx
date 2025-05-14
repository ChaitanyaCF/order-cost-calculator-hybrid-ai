import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setMessage('Please enter both username and password');
      return;
    }

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled in the auth context
      console.error('Login error:', err);
    }
  };

  return (
    <div className="card">
      <h2>Login to ProCost</h2>
      
      {message && <div className="alert alert-danger">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            className="form-control"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              clearError();
              setMessage('');
            }}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError();
              setMessage('');
            }}
          />
        </div>
        
        <div className="form-group">
          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </div>
        
        <div>
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;