import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Layout from '../components/Layout';
import { StatCard } from '../components/UI';
import api from '../utils/api';

const COLORS = ['#1D9E75','#378ADD','#EF9F27','#E24B4A','#8B5CF6','#EC4899','#6B7280'];

export default function Analytics() {
  const [data, setData]   = useState(null);
  const [days, setDays]   = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/admin/analytics', { params:{ days } }).then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [days]);

  if (loading) return <Layout title="Analytics"><div style={{ padding:40, textAlign:'center', color:'var(--text-3)' }}>Loading…</div></Layout>;
  if (!data)   return null;

  const { signups, earnings, tasksByCategory, topEarners, withdrawalStats } = data;
  const wStats = {}; withdrawalStats.forEach(w => { wStats[w._id] = w; });
  const totalEarned  = earnings.reduce((s,d) => s+d.total, 0);
  const totalSignups = signups.reduce((s,d) => s+d.count, 0);

  return (
    <Layout title="Analytics" subtitle="Platform performance insights">
      {/* Period buttons */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {[7,14,30,90].map(d => (
          <button key={d} className={`btn ${days===d?'btn-primary':'btn-ghost'}`} style={{ fontSize:12 }} onClick={() => setDays(d)}>
            Last {d} days
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatCard label="Total paid out"         value={`${totalEarned.toLocaleString()} ETB`} sub={`Last ${days} days`} color="green" />
        <StatCard label="New signups"            value={totalSignups}                          sub={`Last ${days} days`} color="blue" />
        <StatCard label="Completed withdrawals"  value={`${(wStats.completed?.total||0).toLocaleString()} ETB`} sub={`${wStats.completed?.count||0} transactions`} />
        <StatCard label="Pending withdrawals"    value={`${(wStats.pending?.total||0).toLocaleString()} ETB`}  sub={`${wStats.pending?.count||0} requests`} color="amber" />
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <div className="card">
          <h3 style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>Daily earnings (ETB)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={earnings} margin={{ top:0, right:0, bottom:0, left:0 }}>
              <XAxis dataKey="_id" tick={{ fontSize:10 }} tickFormatter={v => v?.slice(5)} interval={Math.floor(earnings.length/6)} />
              <YAxis tick={{ fontSize:10 }} />
              <Tooltip formatter={v => `${v.toLocaleString()} ETB`} />
              <Bar dataKey="total" fill="#1D9E75" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>Daily signups</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={signups} margin={{ top:0, right:0, bottom:0, left:0 }}>
              <XAxis dataKey="_id" tick={{ fontSize:10 }} tickFormatter={v => v?.slice(5)} interval={Math.floor(signups.length/6)} />
              <YAxis tick={{ fontSize:10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#378ADD" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Category pie */}
        <div className="card">
          <h3 style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>Completions by category</h3>
          {tasksByCategory.length === 0 ? (
            <div style={{ textAlign:'center', color:'var(--text-3)', padding:32 }}>No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={tasksByCategory} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={70} label={({ _id, percent }) => `${_id} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                    {tasksByCategory.map((_, i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v,n,p) => [`${v} tasks`, p.payload._id]} />
                </PieChart>
              </ResponsiveContainer>
              <table className="data-table" style={{ marginTop:8 }}>
                <thead><tr><th>Category</th><th>Tasks</th><th>Paid (ETB)</th></tr></thead>
                <tbody>
                  {tasksByCategory.map((c,i) => (
                    <tr key={c._id}>
                      <td><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:COLORS[i%COLORS.length], marginRight:8 }} />{c._id}</td>
                      <td style={{ fontWeight:600 }}>{c.count}</td>
                      <td style={{ color:'var(--green)', fontWeight:600 }}>{(c.totalETB||0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Top earners */}
        <div className="card">
          <h3 style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>Top 10 earners</h3>
          {topEarners.length === 0 ? (
            <div style={{ textAlign:'center', color:'var(--text-3)', padding:32 }}>No data yet</div>
          ) : (
            topEarners.map((u, i) => {
              const max = topEarners[0]?.totalEarnedETB || 1;
              const pct = (u.totalEarnedETB / max) * 100;
              return (
                <div key={u._id} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ width:20, fontSize:12, color:i<3?'#D97706':'var(--text-3)', fontWeight:700 }}>#{i+1}</span>
                      <span style={{ fontSize:13, fontWeight:500 }}>{u.name}</span>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <span style={{ fontSize:13, fontWeight:700, color:'var(--green)' }}>{u.totalEarnedETB.toLocaleString()} ETB</span>
                      <span style={{ fontSize:11, color:'var(--text-3)', marginLeft:6 }}>{u.tasksCompleted} tasks</span>
                    </div>
                  </div>
                  <div style={{ height:4, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:i===0?'#D97706':'var(--green)', borderRadius:2 }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
