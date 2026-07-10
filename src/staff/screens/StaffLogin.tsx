import React, { useState } from 'react';
import { useStaffAuth } from '../context/StaffAuthContext';

export default function StaffLogin() {
  const { login } = useStaffAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim())    { setError('Email is required.');    return; }
    if (!password.trim()) { setError('Password is required.'); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Brand */}
        <div style={s.brand}>
          <span style={s.brandEmoji}>🏓</span>
          <div>
            <div style={s.brandTitle}>PicklePro</div>
            <div style={s.brandSub}>Staff Portal</div>
          </div>
        </div>

        <h2 style={s.heading}>Sign in to your account</h2>
        <p style={s.hint}>This portal is for staff only. Contact your admin if you need access.</p>

        <form onSubmit={handleSubmit} noValidate style={s.form}>
          {error && (
            <div style={s.errorBox} role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          <div style={s.field}>
            <label htmlFor="staff-email" style={s.label}>Email address</label>
            <input
              id="staff-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              style={s.input}
              placeholder="staff@picklepro.com"
              disabled={loading}
            />
          </div>

          <div style={s.field}>
            <label htmlFor="staff-password" style={s.label}>Password</label>
            <div style={s.pwWrap}>
              <input
                id="staff-password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                style={{ ...s.input, paddingRight: 44 }}
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={s.eyeBtn}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...s.submitBtn, opacity: loading ? 0.65 : 1 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={s.demoBox}>
          <span style={s.demoLabel}>Demo credentials</span>
          <code style={s.code}>staff@picklepro.com</code>
          <span style={s.demoSlash}>/</span>
          <code style={s.code}>staff123</code>
        </div>
      </div>
    </div>
  );
}

const GREEN = '#16a34a';
const s: Record<string, React.CSSProperties> = {
  page:      { minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "system-ui, -apple-system, sans-serif" },
  card:      { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.09)', padding: '36px 40px', width: '100%', maxWidth: 420 },
  brand:     { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 },
  brandEmoji:{ fontSize: 44 },
  brandTitle:{ fontSize: 22, fontWeight: 900, color: '#0f172a' },
  brandSub:  { fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const },
  heading:   { fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 4, marginTop: 0 },
  hint:      { fontSize: 13, color: '#64748b', marginBottom: 22, lineHeight: 1.5, marginTop: 0 },
  form:      { display: 'flex', flexDirection: 'column', gap: 0 },
  errorBox:  { background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, fontWeight: 500, display: 'flex', gap: 8, alignItems: 'flex-start' },
  field:     { display: 'flex', flexDirection: 'column', marginBottom: 16 },
  label:     { fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 6 },
  input:     { padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, color: '#0f172a', background: '#f8fafc', outline: 'none', width: '100%', boxSizing: 'border-box' as const },
  pwWrap:    { position: 'relative' as const },
  eyeBtn:    { position: 'absolute' as const, right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4 },
  submitBtn: { marginTop: 8, padding: '13px', background: GREEN, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: 'pointer', width: '100%' },
  demoBox:   { marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' as const, padding: '10px 14px', background: '#f1f5f9', borderRadius: 8 },
  demoLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 600 },
  demoSlash: { fontSize: 11, color: '#cbd5e1' },
  code:      { background: '#e2e8f0', color: '#475569', padding: '2px 7px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 },
};
