import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { Pagination, Modal, Alert, EmptyState, StatCard } from '../components/UI';
import api from '../utils/api';

const STATUS_BADGE = {
  open:      'badge-blue',
  active:    'badge-green',
  completed: 'badge-gray',
  cancelled: 'badge-red',
};

const TYPE_BADGE = {
  rotation: 'badge-purple',
  lottery:  'badge-amber',
};

const SCHEDULE_LABEL = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };

// ── Create / Edit Modal ───────────────────────────────────────────────────────
function EqubFormModal({ equb, onClose, onSaved }) {
  const [form, setForm] = useState(equb ? {
    name:             equb.name,
    description:      equb.description || '',
    type:             equb.type,
    contributionETB:  equb.contributionETB,
    maxMembers:       equb.maxMembers,
    schedule:         equb.schedule,
    contributionMode: equb.contributionMode,
    payoutMethod:     equb.payoutMethod,
    missedPolicy:     equb.missedPolicy,
    penaltyETB:       equb.penaltyETB || 0,
  } : {
    name: '', description: '', type: 'rotation',
    contributionETB: 100, maxMembers: 10,
    schedule: 'monthly', contributionMode: 'both',
    payoutMethod: 'wallet', missedPolicy: 'penalize', penaltyETB: 0,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name) return setErr('Name is required.');
    setLoading(true); setErr('');
    try {
      if (equb?._id) await api.patch(`/admin/equb/${equb._id}`, form);
      else           await api.post('/admin/equb', form);
      onSaved();
    } catch (e) { setErr(e.response?.data?.error || 'Failed to save.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal title={equb ? 'Edit Equb' : 'Create new Equb'} onClose={onClose} maxWidth={560}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save'}</button></>}>
      {err && <Alert type="error">{err}</Alert>}
      <div className="form-group"><label className="form-label">Name</label>
        <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. GigWork Monthly Equb" /></div>
      <div className="form-group"><label className="form-label">Description</label>
        <textarea className="form-textarea" rows={2} value={form.description} onChange={e => set('description', e.target.value)} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group"><label className="form-label">Type</label>
          <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="rotation">🔄 Rotation</option>
            <option value="lottery">🎲 Lottery</option>
          </select></div>
        <div className="form-group"><label className="form-label">Schedule</label>
          <select className="form-select" value={form.schedule} onChange={e => set('schedule', e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select></div>
        <div className="form-group"><label className="form-label">Contribution (ETB)</label>
          <input className="form-input" type="number" min={10} value={form.contributionETB} onChange={e => set('contributionETB', Number(e.target.value))} /></div>
        <div className="form-group"><label className="form-label">Max members</label>
          <input className="form-input" type="number" min={2} max={200} value={form.maxMembers} onChange={e => set('maxMembers', Number(e.target.value))} /></div>
        <div className="form-group"><label className="form-label">Contribution mode</label>
          <select className="form-select" value={form.contributionMode} onChange={e => set('contributionMode', e.target.value)}>
            <option value="auto">Auto (deducted)</option>
            <option value="manual">Manual</option>
            <option value="both">Both</option>
          </select></div>
        <div className="form-group"><label className="form-label">Payout method</label>
          <select className="form-select" value={form.payoutMethod} onChange={e => set('payoutMethod', e.target.value)}>
            <option value="wallet">Income wallet</option>
            <option value="bank">Bank transfer</option>
            <option value="both">Both</option>
          </select></div>
        <div className="form-group"><label className="form-label">Missed contribution policy</label>
          <select className="form-select" value={form.missedPolicy} onChange={e => set('missedPolicy', e.target.value)}>
            <option value="penalize">Penalize</option>
            <option value="kick">Kick</option>
            <option value="replace">Replace from waitlist</option>
          </select></div>
        <div className="form-group"><label className="form-label">Penalty amount (ETB)</label>
          <input className="form-input" type="number" min={0} value={form.penaltyETB} onChange={e => set('penaltyETB', Number(e.target.value))} /></div>
      </div>
      <div style={{ background: '#F0FDF4', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#065F46', marginTop: 4 }}>
        💡 Pot per round = <strong>{form.contributionETB} × {form.maxMembers} = {(form.contributionETB * form.maxMembers).toLocaleString()} ETB</strong>
      </div>
    </Modal>
  );
}

// ── Group Detail Modal ────────────────────────────────────────────────────────
function EqubDetailModal({ equb: initial, onClose, onRefresh }) {
  const [equb, setEqub]   = useState(initial);
  const [detail, setDetail] = useState(null);
  const [tab, setTab]     = useState('members');
  const [msg, setMsg]     = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/admin/equb/${initial._id}`)
      .then(r => setDetail(r.data))
      .catch(console.error);
  }, [initial._id]);

  const action = async (fn, successMsg) => {
    setLoading(true); setMsg(null);
    try { await fn(); setMsg({ type: 'success', text: successMsg }); onRefresh(); }
    catch (e) { setMsg({ type: 'error', text: e.response?.data?.error || 'Failed.' }); }
    finally { setLoading(false); }
  };

  const start      = () => action(() => api.post(`/admin/equb/${equb._id}/start`), 'Equb started!');
  const forceRound = () => action(() => api.post(`/admin/equb/${equb._id}/force-round`), 'Round forced and payout triggered!');
  const cancel     = () => { if (window.confirm('Cancel this Equb?')) action(() => api.delete(`/admin/equb/${equb._id}`), 'Equb cancelled.'); };
  const kick = (uid, name) => { if (window.confirm(`Kick ${name}?`)) action(() => api.post(`/admin/equb/${equb._id}/kick/${uid}`), `${name} kicked.`); };

  const activeMembers = detail?.equb.members.filter(m => m.status === 'active') || [];
  const rounds        = detail?.rounds || [];

  return (
    <Modal title={equb.name} onClose={onClose} maxWidth={700}
      footer={
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          {equb.status === 'open'   && <button className="btn btn-primary" onClick={start} disabled={loading}>▶ Start Equb</button>}
          {equb.status === 'active' && <button className="btn btn-primary" onClick={forceRound} disabled={loading}>⚡ Force round</button>}
          {['open','active'].includes(equb.status) && <button className="btn btn-danger" onClick={cancel} disabled={loading}>✕ Cancel</button>}
        </div>
      }>
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Members',     value: `${activeMembers.length} / ${equb.maxMembers}` },
          { label: 'Round',       value: `${equb.currentRound} / ${equb.totalRounds || '∞'}` },
          { label: 'Pot/round',   value: `${(equb.contributionETB * activeMembers.length).toLocaleString()} ETB` },
          { label: 'Total paid',  value: `${(equb.totalPayoutETB || 0).toLocaleString()} ETB` },
        ].map(s => (
          <div key={s.label} style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[{ k: 'members', l: 'Members' }, { k: 'rounds', l: 'Round history' }, { k: 'transactions', l: 'Transactions' }].map(t => (
          <button key={t.k} className={`btn ${tab === t.k ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => setTab(t.k)}>{t.l}</button>
        ))}
      </div>

      {/* Members */}
      {tab === 'members' && (
        !detail ? <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-3)' }}>Loading…</div> : (
          <table className="data-table">
            <thead><tr><th>#</th><th>Member</th><th>Status</th><th>Won</th><th></th></tr></thead>
            <tbody>
              {detail.equb.members.map((m, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-3)', fontWeight: 600 }}>{m.order}</td>
                  <td><div style={{ fontWeight: 500 }}>{m.user?.name || '—'}</div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>{m.user?.email}</div></td>
                  <td><span className={`badge ${m.status === 'active' ? 'badge-green' : m.status === 'kicked' ? 'badge-red' : 'badge-gray'}`}>{m.status}</span></td>
                  <td>{m.hasWon ? <span className="badge badge-purple">✓ Won</span> : <span style={{ color: 'var(--text-3)', fontSize: 12 }}>—</span>}</td>
                  <td>{m.status === 'active' && equb.status === 'active' && (
                    <button className="btn btn-danger" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => kick(m.user?._id, m.user?.name)}>Kick</button>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {/* Rounds */}
      {tab === 'rounds' && (
        !rounds.length ? <EmptyState icon="🔄" title="No rounds yet" /> : (
          <table className="data-table">
            <thead><tr><th>Round</th><th>Winner</th><th>Pot</th><th>Due</th><th>Status</th></tr></thead>
            <tbody>
              {rounds.map(r => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 700 }}>#{r.roundNumber}</td>
                  <td>{r.winner?.name || <span style={{ color: 'var(--text-3)' }}>TBD</span>}</td>
                  <td style={{ fontWeight: 600, color: 'var(--green)' }}>{(r.potETB || 0).toLocaleString()} ETB</td>
                  <td style={{ fontSize: 12, color: 'var(--text-3)' }}>{new Date(r.dueDate).toLocaleDateString()}</td>
                  <td><span className={`badge ${r.status === 'completed' ? 'badge-green' : r.status === 'collecting' ? 'badge-blue' : 'badge-gray'}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {/* Transactions */}
      {tab === 'transactions' && (
        !detail?.transactions?.length ? <EmptyState icon="💸" title="No transactions yet" /> : (
          <table className="data-table">
            <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {detail.transactions.map(tx => (
                <tr key={tx._id}>
                  <td style={{ fontWeight: 500 }}>{tx.user?.name || '—'}</td>
                  <td><span className={`badge ${tx.type === 'payout' ? 'badge-green' : tx.type === 'penalty' ? 'badge-red' : 'badge-blue'}`} style={{ fontSize: 10 }}>{tx.type}</span></td>
                  <td style={{ fontWeight: 700, color: tx.type === 'payout' ? 'var(--green)' : tx.type === 'penalty' ? 'var(--red)' : 'var(--text)' }}>
                    {tx.type === 'contribution' || tx.type === 'penalty' ? '-' : '+'}{tx.amountETB.toLocaleString()} ETB
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-3)' }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {/* Waitlist */}
      {detail?.equb.waitlist?.length > 0 && (
        <div style={{ marginTop: 16, background: '#FEF3C7', borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#92400E', marginBottom: 6 }}>Waitlist ({detail.equb.waitlist.length})</div>
          {detail.equb.waitlist.map((w, i) => (
            <div key={i} style={{ fontSize: 13, color: '#92400E' }}>#{i + 1} {w.user?.name}</div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ── Main Equb Page ────────────────────────────────────────────────────────────
export function DigitalEqub() {
  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [summary, setSummary]   = useState(null);
  const [page, setPage]         = useState(1);
  const [statusFilter, setStatus] = useState('');
  const [typeFilter, setType]   = useState('');
  const [loading, setLoading]   = useState(true);
  const [msg, setMsg]           = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/admin/equb', { params: { page, limit: 20, status: statusFilter || undefined, type: typeFilter || undefined } })
      .then(r => { setItems(r.data.equbs); setTotal(r.data.total); setSummary(r.data.summary); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, statusFilter, typeFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <Layout title="Digital Equb" subtitle="Manage rotating savings groups">
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}

      {/* Summary cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total groups',    value: summary.totalGroups },
            { label: 'Active groups',   value: summary.activeGroups },
            { label: 'Total pot (ETB)', value: (summary.totalPotETB || 0).toLocaleString() },
            { label: 'Total paid out',  value: (summary.totalPayoutETB || 0).toLocaleString() + ' ETB' },
          ].map(c => (
            <div key={c.label} style={{ background: 'var(--bg-2)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{c.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="table-wrap">
        <div className="table-head">
          <h3>Equb groups ({total})</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select className="filter-select" value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All status</option>
              <option value="open">Open</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select className="filter-select" value={typeFilter} onChange={e => { setType(e.target.value); setPage(1); }}>
              <option value="">All types</option>
              <option value="rotation">Rotation</option>
              <option value="lottery">Lottery</option>
            </select>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <i className="ti ti-plus" /> New Equb
            </button>
          </div>
        </div>

        {loading ? <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>Loading…</div>
          : items.length === 0 ? <EmptyState icon="🤝" title="No Equb groups yet" />
          : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Schedule</th>
                  <th>Members</th>
                  <th>Contribution</th>
                  <th>Pot/round</th>
                  <th>Round</th>
                  <th>Status</th>
                  <th>Next round</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map(eq => {
                  const activeMembers = eq.members?.filter(m => m.status === 'active').length || 0;
                  return (
                    <tr key={eq._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{eq.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>by {eq.createdBy?.name}</div>
                      </td>
                      <td><span className={`badge ${TYPE_BADGE[eq.type]}`} style={{ fontSize: 10 }}>{eq.type}</span></td>
                      <td style={{ fontSize: 13 }}>{SCHEDULE_LABEL[eq.schedule]}</td>
                      <td style={{ fontWeight: 600 }}>{activeMembers} / {eq.maxMembers}</td>
                      <td style={{ fontWeight: 600 }}>{eq.contributionETB.toLocaleString()} ETB</td>
                      <td style={{ fontWeight: 700, color: 'var(--green)' }}>{(eq.contributionETB * activeMembers).toLocaleString()} ETB</td>
                      <td style={{ fontWeight: 600 }}>{eq.currentRound} / {eq.totalRounds || '∞'}</td>
                      <td><span className={`badge ${STATUS_BADGE[eq.status]}`}>{eq.status}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text-3)' }}>
                        {eq.nextRoundDate ? new Date(eq.nextRoundDate).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <button className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => setSelected(eq)}>
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        }
        <Pagination page={page} pages={Math.ceil(total / 20)} total={total} onPage={setPage} />
      </div>

      {showCreate && (
        <EqubFormModal onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); load(); setMsg({ type: 'success', text: 'Equb created!' }); }} />
      )}

      {selected && (
        <EqubDetailModal equb={selected} onClose={() => setSelected(null)} onRefresh={load} />
      )}
    </Layout>
  );
}
