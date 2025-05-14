import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!username || !password || !confirmPassword) {
      setMessage('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      await register(username, password, email);
      setSuccess(true);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      // Error is handled in the auth context
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="card">
      <h2>Register for ProCost</h2>
      
      {message && <div className="alert alert-danger">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Registration successful! Redirecting to login...</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username*</label>
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
          <label htmlFor="password">Password*</label>
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
          <label htmlFor="confirm-password">Confirm Password*</label>
          <input
            type="password"
            id="confirm-password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearError();
              setMessage('');
            }}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email (optional)</label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <button type="submit" className="btn btn-primary" disabled={success}>
            Register
          </button>
        </div>
        
        <div>
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </form>
    </div>
  );
};

export default Register;