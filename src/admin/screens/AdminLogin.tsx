import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!password)     { setError('Password is required.'); return; }
    setLoading(true);
    const err = await login(email.trim(), password);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Logo / brand */}
        <div style={s.brand}>
          <span style={s.brandIcon}>🏓</span>
          <div style={s.brandName}>PicklePro</div>
          <div style={s.brandSub}>Admin Portal</div>
        </div>

        <h1 style={s.title}>Sign in</h1>
        <p style={s.subtitle}>admin@picklepro.com · admin123</p>

        {error && <div style={s.error} role="alert">⚠️ {error}</div>}

        <div style={s.field}>
          <label style={s.label} htmlFor="email">Email</label>
          <input
            id="email" type="email" value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            style={s.input} placeholder="admin@picklepro.com"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <div style={s.field}>
          <label style={s.label} htmlFor="password">Password</label>
          <input
            id="password" type="password" value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            style={s.input} placeholder="••••••••"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} onClick={handleLogin} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:      { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: "system-ui, sans-serif" },
  card:      { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 16 },
  brand:     { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 8 },
  brandIcon: { fontSize: 40 },
  brandName: { fontSize: 22, fontWeight: 900, color: '#fff' },
  brandSub:  { fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: 2, textTransform: 'uppercase' },
  title:     { fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, textAlign: 'center' },
  subtitle:  { fontSize: 12, color: '#475569', margin: 0, textAlign: 'center', fontFamily: 'monospace' },
  error:     { background: '#450a0a', border: '1px solid #7f1d1d', color: '#fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13 },
  field:     { display: 'flex', flexDirection: 'column', gap: 6 },
  label:     { fontSize: 12, fontWeight: 700, color: '#94a3b8' },
  input:     { padding: '11px 14px', background: '#0f172a', border: '1.5px solid #334155', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none' },
  btn:       { padding: '13px', background: '#7c3aed', border: 'none', borderRadius: 8, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4 },
};
