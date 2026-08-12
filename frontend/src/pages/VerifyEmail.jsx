import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Icon from '../components/Icon';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }
    async function verify() {
      try {
        const { data } = await axiosInstance.get(`/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(data.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed.');
      }
    }
    verify();
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-branding">
        <div className="auth-branding-logo">P</div>
        <h2>Email Verification</h2>
        <p>We're confirming your identity to keep your account secure.</p>
      </div>

      <div className="auth-form-side">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          {status === 'verifying' && (
            <>
              <div className="loading-spinner" style={{ margin: '0 auto 16px' }}></div>
              <h1>Verifying...</h1>
              <p className="auth-subtitle">Please wait while we confirm your email</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="status-emblem status-emblem-success"><Icon name="checkCircle" size={34} /></div>
              <h1>Verified!</h1>
              <div className="alert alert-success" style={{ marginTop: '16px' }}>{message}</div>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                Continue to Sign In
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="status-emblem status-emblem-error"><Icon name="alertCircle" size={34} /></div>
              <h1>Verification Failed</h1>
              <div className="alert alert-error" style={{ marginTop: '16px' }}>{message}</div>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                Go to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
