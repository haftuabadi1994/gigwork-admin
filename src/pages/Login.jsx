import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login }   = useAuth();
  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(form.email, form.password); }
    catch (err) { setError(err.response?.data?.error || err.message || 'Login failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ background:'#fff', borderRadius:16, padding:'40px 36px', width:380, boxShadow:'0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:56, height:56, background:'var(--green)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:28, fontWeight:800, color:'#fff', fontFamily:'Sora,sans-serif' }}>G</div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text)', fontFamily:'Sora,sans-serif' }}>GigWork Admin</h1>
          <p style={{ fontSize:13, color:'var(--text-3)', marginTop:4 }}>Sign in to manage the platform</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handle}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" placeholder="admin@gigwork.et" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width:'100%', padding:12, marginTop:8, fontSize:15 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
