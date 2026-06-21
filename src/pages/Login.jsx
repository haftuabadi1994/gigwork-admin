import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handle = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(form.email, form.password); }
    catch (err) { setError(err.response?.data?.error || err.message || 'Login failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdf8 0%, #e6f7f1 50%, #f0fdf8 100%)',
      fontFamily: 'Sora, sans-serif',
      position: 'fixed',
      top: 0, left: 0,
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(29,158,117,0.06)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(29,158,117,0.04)', pointerEvents: 'none' }} />

      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: '44px 40px',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
        position: 'relative',
        zIndex: 1,
        margin: '0 16px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #1D9E75, #15795a)',
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 16px rgba(29,158,117,0.30)',
          }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>ስ</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}> ስራ-Sira Admin</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 6 }}>Sign in to manage the platform</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 10, padding: '10px 14px',
            fontSize: 13, color: '#DC2626', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span></span> {error}
          </div>
        )}

        <form onSubmit={handle}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email"
              placeholder="admin@gigwork.et"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '11px 14px', fontSize: 14,
                border: '1.5px solid #E5E7EB', borderRadius: 10,
                outline: 'none', color: '#111827',
                fontFamily: 'inherit',
                transition: 'border-color .15s',
              }}
              onFocus={e => e.target.style.borderColor = '#1D9E75'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '11px 42px 11px 14px', fontSize: 14,
                  border: '1.5px solid #E5E7EB', borderRadius: 10,
                  outline: 'none', color: '#111827',
                  fontFamily: 'inherit',
                  transition: 'border-color .15s',
                }}
                onFocus={e => e.target.style.borderColor = '#1D9E75'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
              <button type="button" onClick={() => setShowPwd(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9CA3AF', padding: 0 }}>
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #1D9E75, #15795a)',
              color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(29,158,117,0.35)',
              transition: 'all .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                Signing in…
              </>
            ) : 'Sign in →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#D1D5DB', marginTop: 28, marginBottom: 0 }}>
          GigWork Admin Portal · ስራ-Sira
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
