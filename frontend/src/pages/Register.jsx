import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import PasswordInput from '../components/PasswordInput';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', matricNumber: '', email: '', password: '',
    faculty: '', department: '', level: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/auth/register', form);
      setSuccess(data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-branding">
        <div className="auth-branding-logo">P</div>
        <h2>Join Praxis</h2>
        <p>
          Create your account to participate in student union elections. 
          Your vote matters — make it count.
        </p>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <h1>Create Account</h1>
          <p className="auth-subtitle">Fill in your details to get started</p>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label>Matric Number</label>
                <input name="matricNumber" value={form.matricNumber} onChange={handleChange} placeholder="UNI/2024/001" required />
              </div>
            </div>
            <div className="form-group">
              <label>School Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@university.edu" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <PasswordInput name="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" required minLength={8} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Faculty</label>
                <input name="faculty" value={form.faculty} onChange={handleChange} placeholder="Engineering" required />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input name="department" value={form.department} onChange={handleChange} placeholder="Computer Science" required />
              </div>
            </div>
            <div className="form-group">
              <label>Level</label>
              <select name="level" value={form.level} onChange={handleChange} required>
                <option value="">Select your level</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="auth-link">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
