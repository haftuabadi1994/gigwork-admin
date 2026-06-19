import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { Pagination, Modal, StatCard, UserAvatar, Alert } from '../components/UI';
import api from '../utils/api';

const LEVELS = ['intern','job1','job2','job3','job4','job5','job6','job7','job8','job9','job10'];

function UserModal({ user, onClose, onSave }) {
  const [form, setForm]   = useState({ name:user.name, email:user.email, phone:user.phone||'', role:user.role, isActive:user.isActive, level:user.level||'intern', qualityScore:user.qualityScore||100 });
  const [adj, setAdj]     = useState({ amountETB:'', description:'' });
  const [tab, setTab]     = useState('profile');
  const [msg, setMsg]     = useState(null);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true); setMsg(null);
    try { await api.patch(`/admin/users/${user._id}`, form); setMsg({ type:'success', text:'Saved!' }); onSave(); }
    catch (e) { setMsg({ type:'error', text: e.response?.data?.error||'Error' }); }
    finally { setLoading(false); }
  };

  const adjustWallet = async () => {
    if (!adj.amountETB || !adj.description) return;
    setLoading(true); setMsg(null);
    try {
      const r = await api.post(`/admin/users/${user._id}/adjust-wallet`, { amountETB:Number(adj.amountETB), description:adj.description });
      setMsg({ type:'success', text:`Wallet adjusted. New balance: ${r.data.newBalanceETB} ETB` });
      setAdj({ amountETB:'', description:'' });
    } catch (e) { setMsg({ type:'error', text: e.response?.data?.error||'Error' }); }
    finally { setLoading(false); }
  };

  const del = async () => {
    if (!window.confirm(`Delete ${user.name}? This is permanent.`)) return;
    await api.delete(`/admin/users/${user._id}`);
    onSave(); onClose();
  };

  const TABS = ['profile','wallet','danger'];

  return (
    <Modal title={`Edit — ${user.name}`} onClose={onClose} maxWidth={600}
      footer={
        <div style={{ display:'flex', gap:8, width:'100%' }}>
          <button className="btn btn-danger" onClick={del}>Delete</button>
          <div style={{ flex:1 }} />
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          {tab === 'profile' && <button className="btn btn-primary" onClick={save} disabled={loading}>{loading?'Saving…':'Save changes'}</button>}
          {tab === 'wallet' && <button className="btn btn-primary" onClick={adjustWallet} disabled={loading||!adj.amountETB}>Apply</button>}
        </div>
      }>
      {/* Mini stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
        {[['Balance', `${(user.incomeWalletETB||user.balanceETB||0).toLocaleString()} ETB`], ['Tasks done', user.tasksCompleted], ['Referrals', user.referralCount]].map(([l,v]) => (
          <div key={l} style={{ background:'#F9FAFB', borderRadius:8, padding:'10px 12px' }}>
            <div style={{ fontSize:11, color:'var(--text-3)' }}>{l}</div>
            <div style={{ fontSize:18, fontWeight:700 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, borderBottom:'1px solid var(--border)', marginBottom:20 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:'8px 14px', fontSize:13, fontWeight:500, background:'none', border:'none', cursor:'pointer', color:tab===t?'var(--green)':'var(--text-3)', borderBottom:tab===t?'2px solid var(--green)':'2px solid transparent', fontFamily:'inherit' }}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {msg && <Alert type={msg.type}>{msg.text}</Alert>}

      {tab === 'profile' && (
        <>
          {[['name','Full name','text'],['email','Email','email'],['phone','Phone','tel']].map(([k,l,t]) => (
            <div className="form-group" key={k}>
              <label className="form-label">{l}</label>
              <input className="form-input" type={t} value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} />
            </div>
          ))}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}>
                <option value="worker">Worker</option><option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Level</label>
              <select className="form-select" value={form.level} onChange={e => setForm(f=>({...f,level:e.target.value}))}>
                {LEVELS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quality score</label>
              <input className="form-input" type="number" min={0} max={100} value={form.qualityScore} onChange={e => setForm(f=>({...f,qualityScore:Number(e.target.value)}))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.isActive?'active':'banned'} onChange={e => setForm(f=>({...f,isActive:e.target.value==='active'}))}>
              <option value="active">Active</option><option value="banned">Banned</option>
            </select>
          </div>
        </>
      )}

      {tab === 'wallet' && (
        <>
          <p style={{ fontSize:13, color:'var(--text-2)', marginBottom:16 }}>
            Current income wallet: <strong>{(user.incomeWalletETB||user.balanceETB||0).toLocaleString()} ETB</strong>. Enter a positive number to add funds, negative to deduct.
          </p>
          <div className="form-group">
            <label className="form-label">Adjustment amount (ETB)</label>
            <input className="form-input" type="number" placeholder="e.g. 100 or -50" value={adj.amountETB} onChange={e => setAdj(a=>({...a,amountETB:e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Reason / description</label>
            <input className="form-input" placeholder="e.g. Manual bonus" value={adj.description} onChange={e => setAdj(a=>({...a,description:e.target.value}))} />
          </div>
        </>
      )}

      {tab === 'danger' && (
        <div style={{ background:'var(--red-light)', borderRadius:10, padding:20 }}>
          <h3 style={{ color:'#991B1B', marginBottom:8 }}>Danger zone</h3>
          <p style={{ fontSize:13, color:'#7F1D1D', marginBottom:16 }}>Deleting a user is permanent and cannot be undone. All their data, wallet balance, and task history will be removed.</p>
          <button className="btn btn-danger" onClick={del} style={{ background:'var(--red)', color:'#fff' }}>Delete user account</button>
        </div>
      )}
    </Modal>
  );
}

export default function Users() {
  const [users, setUsers]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/admin/users', { params:{ page, limit:15, search, role:roleFilter, status:statusFilter } })
      .then(r => { setUsers(r.data.users); setTotal(r.data.total); })
      .catch(console.error).finally(() => setLoading(false));
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const LEVEL_COLORS = { intern:'#6B7280',job1:'#10B981',job2:'#3B82F6',job3:'#8B5CF6',job4:'#F59E0B',job5:'#EF4444',job6:'#EC4899',job7:'#14B8A6',job8:'#F97316',job9:'#6366F1',job10:'#D97706' };

  return (
    <Layout title="User management" subtitle="View, edit and manage all platform users">
      <div className="table-wrap">
        <div className="table-head">
          <h3>All users <span style={{ color:'var(--text-3)', fontWeight:400 }}>({total})</span></h3>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <input className="filter-input" placeholder="Search name or email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ width:200 }} />
            <select className="filter-select" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
              <option value="">All roles</option><option value="worker">Worker</option><option value="admin">Admin</option>
            </select>
            <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All status</option><option value="active">Active</option><option value="banned">Banned</option>
            </select>
          </div>
        </div>
        {loading ? <div style={{ padding:32, textAlign:'center', color:'var(--text-3)' }}>Loading…</div> : (
          <table className="data-table">
            <thead><tr><th>User</th><th>Level</th><th>Balance</th><th>Tasks</th><th>Quality</th><th>Status</th><th>Joined</th><th></th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <UserAvatar name={u.name} size={30} color={LEVEL_COLORS[u.level||'intern']} />
                      <div>
                        <div style={{ fontWeight:500, fontSize:13 }}>{u.name}</div>
                        <div style={{ fontSize:11, color:'var(--text-3)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ background:LEVEL_COLORS[u.level||'intern']+'22', color:LEVEL_COLORS[u.level||'intern'], fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:8, textTransform:'uppercase' }}>{u.level||'intern'}</span></td>
                  <td style={{ fontWeight:600, color:'var(--green)' }}>{(u.incomeWalletETB||u.balanceETB||0).toLocaleString()} ETB</td>
                  <td>{u.tasksCompleted}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:40, height:4, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${u.qualityScore||100}%`, background: (u.qualityScore||100)>=80?'var(--green)':'var(--red)', borderRadius:2 }} />
                      </div>
                      <span style={{ fontSize:11 }}>{u.qualityScore||100}%</span>
                    </div>
                  </td>
                  <td><span className={`badge ${u.isActive?'badge-green':'badge-red'}`}>{u.isActive?'Active':'Banned'}</span></td>
                  <td style={{ fontSize:12, color:'var(--text-3)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td><button className="btn btn-ghost" style={{ padding:'5px 10px', fontSize:12 }} onClick={() => setSelected(u)}><i className="ti ti-edit" /> Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={page} pages={Math.ceil(total/15)} total={total} onPage={setPage} />
      </div>
      {selected && <UserModal user={selected} onClose={() => setSelected(null)} onSave={() => { load(); setSelected(null); }} />}
    </Layout>
  );
}
