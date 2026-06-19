import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Layout from '../components/Layout';
import { StatCard, UserAvatar } from '../components/UI';
import api from '../utils/api';

export default function Dashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Dashboard"><div style={{ padding:40, textAlign:'center', color:'var(--text-3)' }}>Loading…</div></Layout>;
  if (!data)   return null;

  const { stats, recentUsers, recentTxs, dailyEarnings } = data;

  return (
    <Layout title="Dashboard" subtitle={new Date().toLocaleDateString('en-ET', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}>

      {/* Alerts */}
      {(stats.pendingWithdrawals > 0 || (stats.pendingDeposits||0) > 0) && (
        <div style={{ background:'#FEF3C7', border:'1px solid #FCD34D', borderRadius:10, padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
          <i className="ti ti-alert-triangle" style={{ fontSize:18, color:'#D97706' }} />
          <span style={{ fontSize:14, color:'#92400E', fontWeight:500 }}>
            {stats.pendingWithdrawals > 0 && `${stats.pendingWithdrawals} pending withdrawal${stats.pendingWithdrawals>1?'s':''}`}
            {stats.pendingWithdrawals > 0 && (stats.pendingDeposits||0) > 0 && ' · '}
            {(stats.pendingDeposits||0) > 0 && `${stats.pendingDeposits} deposit${stats.pendingDeposits>1?'s':''} awaiting review`}
          </span>
        </div>
      )}

      {/* Stats grid */}
      <div className="stat-grid">
        <StatCard label="Total workers"       value={stats.totalUsers}              sub={`${stats.activeUsers} active this week`} />
        <StatCard label="Tasks completed"      value={stats.completedAssignments}    sub={`${stats.completionRate}% rate`}          color="green" />
        <StatCard label="Pending withdrawals"  value={stats.pendingWithdrawals}      sub="Needs approval"                           color={stats.pendingWithdrawals>0?'amber':''} />
        <StatCard label="Pending deposits"     value={stats.pendingDeposits||0}      sub="Awaiting review"                          color={(stats.pendingDeposits||0)>0?'red':''} />
        <StatCard label="Total deposited (ETB)" value={(stats.totalDepositedETB||0).toLocaleString()} sub="All approved"            color="blue" />
        <StatCard label="Total paid out (ETB)" value={stats.totalWithdrawnETB.toLocaleString()} sub="All withdrawals"               color="green" />
        <StatCard label="Active tasks"         value={stats.activeTasks}             sub={`of ${stats.totalTasks} total`} />
        <StatCard label="Total assignments"    value={stats.totalAssignments}        sub={`${stats.completedAssignments} done`} />
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:20 }}>
        <div className="card">
          <h3 style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>Daily earnings — last 7 days (ETB)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dailyEarnings.slice(-7)} margin={{ top:0, right:0, bottom:0, left:0 }}>
              <XAxis dataKey="_id" tick={{ fontSize:11 }} tickFormatter={v => v?.slice(5)} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip formatter={(v) => `${v.toLocaleString()} ETB`} />
              <Bar dataKey="total" fill="#1D9E75" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>Platform overview</h3>
          {[
            { label:'Tasks (active/total)',    value:`${stats.activeTasks} / ${stats.totalTasks}` },
            { label:'Assignments (done/all)',  value:`${stats.completedAssignments} / ${stats.totalAssignments}` },
            { label:'Workers (active/all)',    value:`${stats.activeUsers} / ${stats.totalUsers}` },
            { label:'Completion rate',         value:`${stats.completionRate}%` },
          ].map(row => (
            <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid var(--border-light)' }}>
              <span style={{ fontSize:13, color:'var(--text-2)' }}>{row.label}</span>
              <span style={{ fontSize:14, fontWeight:700 }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent tables */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div className="table-wrap">
          <div className="table-head"><h3>Recent signups</h3></div>
          <table className="data-table">
            <thead><tr><th>User</th><th>Level</th><th>Tasks</th><th>Joined</th></tr></thead>
            <tbody>
              {recentUsers.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <UserAvatar name={u.name} size={28} />
                      <div>
                        <div style={{ fontWeight:500 }}>{u.name}</div>
                        <div style={{ fontSize:11, color:'var(--text-3)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-gray" style={{ textTransform:'uppercase', fontSize:10 }}>{u.level||'intern'}</span></td>
                  <td style={{ fontWeight:600 }}>{u.tasksCompleted}</td>
                  <td style={{ fontSize:12, color:'var(--text-3)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-wrap">
          <div className="table-head"><h3>Recent transactions</h3></div>
          <table className="data-table">
            <thead><tr><th>User</th><th>Type</th><th>Amount</th></tr></thead>
            <tbody>
              {recentTxs.map(tx => (
                <tr key={tx._id}>
                  <td style={{ fontWeight:500, fontSize:12 }}>{tx.user?.name||'—'}</td>
                  <td>
                    <span className={`badge ${tx.type==='task_earning'?'badge-green':tx.type==='referral_bonus'?'badge-purple':tx.type==='withdrawal'?'badge-blue':'badge-gray'}`} style={{ fontSize:10 }}>
                      {tx.type?.replace(/_/g,' ')}
                    </span>
                  </td>
                  <td style={{ fontWeight:700, color: tx.amountETB>0?'var(--green)':'var(--red)' }}>
                    {tx.amountETB>0?'+':''}{tx.amountETB?.toLocaleString()} ETB
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
