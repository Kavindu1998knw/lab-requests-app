import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLab } from '../context/LabContext';
import { FlaskConical, Lock, Mail, User, ArrowRight } from 'lucide-react';

export const LoginRegister = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, register, isLoading } = useAuth();
  const { addToast } = useLab();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isRegister && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    let result;
    if (isRegister) {
      result = await register(name, email, password);
    } else {
      result = await login(email, password);
    }

    if (result.success) {
      addToast(result.message || 'Authenticated successfully!', 'success');
    } else {
      setError(result.error || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'radial-gradient(circle at 50% 20%, rgba(14, 165, 233, 0.15), transparent 60%), var(--bg-primary)',
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            className="brand-logo-icon"
            style={{ width: '52px', height: '52px', margin: '0 auto 1rem auto' }}
          >
            <FlaskConical size={28} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            gsmbLab <span className="brand-badge" style={{ fontSize: '0.8rem', padding: '3px 8px' }}>LIMS</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
            {isRegister
              ? 'Create your laboratory staff account'
              : 'Sign in to access laboratory requests'}
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-rose-bg)',
              color: 'var(--accent-rose)',
              fontSize: '0.85rem',
              fontWeight: 500,
              marginBottom: '1.25rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <User
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-input"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            <span>{isLoading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}
        >
          {isRegister ? (
            <div>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--brand-600)', fontWeight: 700, cursor: 'pointer' }}
              >
                Sign In
              </button>
            </div>
          ) : (
            <div>
              New laboratory officer?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--brand-600)', fontWeight: 700, cursor: 'pointer' }}
              >
                Register Here
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
