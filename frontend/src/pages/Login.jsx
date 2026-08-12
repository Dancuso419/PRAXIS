import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user.role === 'STUDENT') {
        navigate('/dashboard');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-branding">
        <div className="auth-branding-logo">P</div>
        <h2>Welcome Back</h2>
        <p>
          Sign in to access your student union elections, view candidates, 
          and cast your vote securely.
        </p>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h1>Sign In</h1>
          <p className="auth-subtitle">Enter your credentials to continue</p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="auth-link">
            <Link to="/forgot-password">Forgot your password?</Link>
          </p>
          <p className="auth-link">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
