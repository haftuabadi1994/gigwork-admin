import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const NAV = [
  { section:'Overview',    items:[
    { path:'/dashboard',    label:'Dashboard',        icon:'ti-layout-dashboard' },
    { path:'/analytics',    label:'Analytics',        icon:'ti-chart-bar' },
  ]},
  { section:'Management',  items:[
    { path:'/users',        label:'Users',            icon:'ti-users' },
    { path:'/tasks',        label:'Tasks',            icon:'ti-checklist' },
    { path:'/withdrawals',  label:'Withdrawals',      icon:'ti-arrow-up-right', badge:'withdrawal' },
    { path:'/deposits',     label:'Deposits',         icon:'ti-download',       badge:'deposit' },
    { path:'/transactions', label:'Transactions',     icon:'ti-receipt' },
  ]},
  { section:'Content',     items:[
    { path:'/handbook',     label:'Handbook & Levels',icon:'ti-book' },
    { path:'/broadcast',    label:'Broadcast',        icon:'ti-speakerphone' },
    { path:'/team',         label:'Team & Referrals', icon:'ti-users-group' },
    { path:'/statements',   label:'Statements',       icon:'ti-file-spreadsheet' },
  ]},
  { section:'System',      items:[
    { path:'/settings',     label:'Settings',         icon:'ti-adjustments-horizontal' },
  ]},
];

export default function Layout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [pending, setPending] = useState({ w:0, d:0 });

  useEffect(() => {
    const fetch = () => {
      Promise.all([
        api.get('/admin/withdrawals', { params:{ status:'pending', limit:1 } }),
        api.get('/admin/deposits',    { params:{ status:'pending', limit:1 } }),
      ]).then(([w, d]) => setPending({ w: w.data.total||0, d: d.data.pendingCount||0 })).catch(()=>{});
    };
    fetch();
    const iv = setInterval(fetch, 30000);
    return () => clearInterval(iv);
  }, []);

  const initials = user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">ስራ-Sira <span>Admin Portal</span></div>

        {NAV.map(section => (
          <div key={section.section}>
            <div className="sidebar-section">{section.section}</div>
            {section.items.map(item => {
              const badgeCount = item.badge === 'withdrawal' ? pending.w : item.badge === 'deposit' ? pending.d : 0;
              return (
                <button key={item.path} className={`sidebar-item ${location.pathname === item.path ? 'active':''}`}
                  onClick={() => navigate(item.path)}>
                  <i className={`ti ${item.icon}`} />
                  {item.label}
                  {badgeCount > 0 && <span className="sidebar-badge">{badgeCount}</span>}
                </button>
              );
            })}
          </div>
        ))}

        <div className="sidebar-footer">
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'#1D9E75', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>{initials}</div>
            <div style={{ overflow:'hidden' }}>
              <div style={{ fontSize:13, fontWeight:500, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>Administrator</div>
            </div>
          </div>
          <button className="sidebar-item" style={{ width:'100%', color:'#E24B4A' }} onClick={logout}>
            <i className="ti ti-logout" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <div className="topbar">
          <div className="topbar-title">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {(pending.w + pending.d) > 0 && (
              <div style={{ background:'#FEF3C7', border:'1px solid #FCD34D', borderRadius:8, padding:'6px 12px', fontSize:12, color:'#92400E', fontWeight:500 }}>
                <i className="ti ti-bell" style={{ marginRight:6 }} />
                {pending.w + pending.d} pending action{pending.w+pending.d>1?'s':''}
              </div>
            )}
            <div style={{ fontSize:12, color:'var(--text-3)' }}>
              {new Date().toLocaleDateString('en-ET', { weekday:'long', month:'long', day:'numeric' })}
            </div>
          </div>
        </div>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
