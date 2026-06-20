// ── COMMISSIONS ──────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { Pagination, Alert, EmptyState } from '../components/UI';
import api from '../utils/api';

export function Commissions() {
  // ── summary state
  const [summary, setSummary] = useState(null);

  // ── transactions state
  const [txs, setTxs]           = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [tierFilter, setTier]   = useState('');
  const [startDate, setStart]   = useState('');
  const [endDate, setEnd]       = useState('');
  const [txLoading, setTxLoad]  = useState(true);

  // ── level rules state
  const [rules, setRules]       = useState([]);
  const [rulesSaving, setSaving]= useState(false);
  const [rulesMsg, setRulesMsg] = useState(null);

  const [tab, setTab]           = useState('transactions');
  const [msg, setMsg]           = useState(null);

  // ── load summary
  useEffect(() => {
    api.get('/admin/commissions/summary')
      .then(r => setSummary(r.data))
      .catch(console.error);
  }, []);

  // ── load transactions
  const loadTxs = useCallback(() => {
    setTxLoad(true);
    api.get('/admin/commissions', {
      params: { page, limit: 20, search: search || undefined, tier: tierFilter || undefined, startDate: startDate || undefined, endDate: endDate || undefined }
    }).then(r => { setTxs(r.data.data); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setTxLoad(false));
  }, [page, search, tierFilter, startDate, endDate]);

  useEffect(() => { loadTxs(); }, [loadTxs]);

  // ── load level rules
  useEffect(() => {
    if (tab !== 'rates') return;
    api.get('/admin/level-rules')
      .then(r => setRules(r.data.data))
      .catch(console.error);
  }, [tab]);

  const setRule = (level, key, val) =>
    setRules(prev => prev.map(r => r.level === level ? { ...r, [key]: val } : r));

  const saveRule = async (level) => {
    const rule = rules.find(r => r.level === level);
    setSaving(true); setRulesMsg(null);
    try {
      await api.patch(`/admin/level-rules/${level}`, {
        referralCommission: rule.referralCommission,
        teamBonusPercent:   rule.teamBonusPercent
      });
      setRulesMsg({ type: 'success', text: `${level} rates saved!` });
    } catch (e) {
      setRulesMsg({ type: 'error', text: e.response?.data?.message || 'Failed to save.' });
    } finally { setSaving(false); }
  };

  const LEVEL_COLORS = {
    intern:'#6B7280',job1:'#10B981',job2:'#3B82F6',job3:'#8B5CF6',
    job4:'#F59E0B',job5:'#EF4444',job6:'#EC4899',job7:'#14B8A6',
    job8:'#F97316',job9:'#6366F1',job10:'#D97706'
  };

  const fmt = n => (n || 0).toLocaleString() + ' ETB';

  return (
    <Layout title="Commission management" subtitle="Referral bonuses, tier payouts, and commission rates">
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}

      {/* ── summary cards */}
      {summary && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
          {[
            { label:'Total paid out',    value: fmt(summary.overall?.totalPaid),  sub: `${summary.overall?.count || 0} transactions` },
            { label:'This month',        value: fmt(summary.monthly?.total),       sub: `${summary.monthly?.count || 0} this month` },
            { label:'Tier A (referral)', value: fmt(summary.overall?.tierA),       sub: 'First task commissions' },
            { label:'Tier B (team)',     value: fmt(summary.overall?.tierB),       sub: 'Ongoing team bonuses' },
          ].map(c => (
            <div key={c.label} style={{ background:'var(--bg-2)', borderRadius:10, padding:'14px 16px' }}>
              <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:4 }}>{c.label}</div>
              <div style={{ fontSize:18, fontWeight:700, color:'var(--text-1)' }}>{c.value}</div>
              <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>{c.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {[{ k:'transactions', l:'💸 Transactions' }, { k:'earners', l:'🏆 Top earners' }, { k:'rates', l:'⚙️ Commission rates' }].map(t => (
          <button key={t.k} className={`btn ${tab === t.k ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t.k)}>{t.l}</button>
        ))}
      </div>

      {/* ── TRANSACTIONS TAB */}
      {tab === 'transactions' && (
        <div className="table-wrap">
          <div className="table-head">
            <h3>Referral bonus transactions ({total})</h3>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <input className="filter-input" placeholder="Search name or email…" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ width:200 }} />
              <select className="filter-select" value={tierFilter} onChange={e => { setTier(e.target.value); setPage(1); }}>
                <option value="">All tiers</option>
                <option value="A">Tier A only</option>
                <option value="B">Tier B only</option>
              </select>
              <input type="date" className="filter-select" value={startDate}
                onChange={e => { setStart(e.target.value); setPage(1); }} />
              <input type="date" className="filter-select" value={endDate}
                onChange={e => { setEnd(e.target.value); setPage(1); }} />
            </div>
          </div>
          {txLoading
            ? <div style={{ padding:32, textAlign:'center', color:'var(--text-3)' }}>Loading…</div>
            : txs.length === 0
              ? <EmptyState icon="💸" title="No commission transactions found" />
              : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Tier</th>
                      <th>Referrer</th>
                      <th>Worker</th>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txs.map(tx => (
                      <tr key={tx._id}>
                        <td style={{ fontSize:12, color:'var(--text-3)', whiteSpace:'nowrap' }}>
                          {new Date(tx.createdAt).toLocaleString('en-ET', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                        </td>
                        <td>
                          <span className={`badge ${tx.tier === 'A' ? 'badge-purple' : 'badge-blue'}`} style={{ fontSize:10 }}>
                            Tier {tx.tier}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight:500 }}>{tx.referrer?.name || '—'}</div>
                          <div style={{ fontSize:11, color:'var(--text-3)' }}>{tx.referrer?.referralCode}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight:500 }}>{tx.worker?.name || '—'}</div>
                          <div style={{ fontSize:11, color:'var(--text-3)' }}>{tx.worker?.email}</div>
                        </td>
                        <td style={{ fontSize:12, color:'var(--text-2)', maxWidth:200 }}>{tx.description}</td>
                        <td style={{ fontWeight:700, color:'var(--green)', whiteSpace:'nowrap' }}>
                          +{(tx.amountETB || 0).toLocaleString()} ETB
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
          }
          <Pagination page={page} pages={Math.ceil(total / 20)} total={total} onPage={setPage} />
        </div>
      )}

      {/* ── TOP EARNERS TAB */}
      {tab === 'earners' && (
        <div className="table-wrap">
          <div className="table-head"><h3>Top commission earners</h3></div>
          {!summary?.topEarners?.length
            ? <EmptyState icon="🏆" title="No data yet" />
            : (
              <table className="data-table">
                <thead>
                  <tr><th>Rank</th><th>Referrer</th><th>Referral code</th><th>Total earned</th></tr>
                </thead>
                <tbody>
                  {summary.topEarners.map((e, i) => (
                    <tr key={e._id}>
                      <td style={{ fontWeight:700, fontSize:16, color: i===0?'#F59E0B':i===1?'#9CA3AF':i===2?'#D97706':'var(--text-3)' }}>
                        #{i + 1}
                      </td>
                      <td>
                        <div style={{ fontWeight:500 }}>{e.user?.name}</div>
                        <div style={{ fontSize:11, color:'var(--text-3)' }}>{e.user?.email}</div>
                      </td>
                      <td><code style={{ fontSize:12, background:'#F3F4F6', padding:'2px 8px', borderRadius:4 }}>{e.user?.referralCode}</code></td>
                      <td style={{ fontWeight:700, color:'var(--green)', fontSize:15 }}>{(e.earned || 0).toLocaleString()} ETB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      )}

      {/* ── COMMISSION RATES TAB */}
      {tab === 'rates' && (
        <div>
          {rulesMsg && <Alert type={rulesMsg.type}>{rulesMsg.text}</Alert>}
          <p style={{ fontSize:13, color:'var(--text-2)', marginBottom:16 }}>
            <strong>Tier A</strong> = % of referred worker's first completed task paid to referrer.&nbsp;
            <strong>Tier B</strong> = % of every task the referred worker completes, paid to their referrer's referrer.
          </p>
          {rules.length === 0
            ? <div style={{ padding:32, textAlign:'center', color:'var(--text-3)' }}>Loading…</div>
            : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>Level</th><th>Tier A — referral %</th><th>Tier B — team bonus %</th><th></th></tr>
                  </thead>
                  <tbody>
                    {rules.map(r => (
                      <tr key={r.level}>
                        <td>
                          <span style={{ background: LEVEL_COLORS[r.level] + '22', color: LEVEL_COLORS[r.level], fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:8, textTransform:'uppercase' }}>
                            {r.level}
                          </span>
                        </td>
                        <td>
                          <input type="number" min={0} max={100} step={0.5}
                            value={r.referralCommission || 0}
                            onChange={e => setRule(r.level, 'referralCommission', Number(e.target.value))}
                            style={{ width:90, padding:'6px 8px', border:'1px solid var(--border)', borderRadius:6, fontSize:13, fontFamily:'inherit' }} />
                          <span style={{ fontSize:12, color:'var(--text-3)', marginLeft:6 }}>%</span>
                        </td>
                        <td>
                          <input type="number" min={0} max={100} step={0.1}
                            value={r.teamBonusPercent || 0}
                            onChange={e => setRule(r.level, 'teamBonusPercent', Number(e.target.value))}
                            style={{ width:90, padding:'6px 8px', border:'1px solid var(--border)', borderRadius:6, fontSize:13, fontFamily:'inherit' }} />
                          <span style={{ fontSize:12, color:'var(--text-3)', marginLeft:6 }}>%</span>
                        </td>
                        <td>
                          <button className="btn btn-primary" style={{ fontSize:12, padding:'5px 14px' }}
                            onClick={() => saveRule(r.level)} disabled={rulesSaving}>
                            Save
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      )}
    </Layout>
  );
}
