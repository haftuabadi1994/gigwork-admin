import React, { useState } from 'react';

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ page, pages, total, onPage }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1);
  return (
    <div className="pagination">
      <button className="page-btn" disabled={page===1} onClick={() => onPage(page-1)}><i className="ti ti-chevron-left" /></button>
      {nums.map(p => <button key={p} className={`page-btn ${p===page?'active':''}`} onClick={() => onPage(p)}>{p}</button>)}
      <button className="page-btn" disabled={page===pages} onClick={() => onPage(page+1)}><i className="ti ti-chevron-right" /></button>
      <span style={{ fontSize:12, color:'var(--text-3)', marginLeft:8 }}>{total} total</span>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, footer, maxWidth=560 }) {
  return (
    <div className="modal-bg" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="btn btn-ghost" style={{ padding:'5px 9px' }} onClick={onClose}><i className="ti ti-x" /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color='', onClick }) {
  return (
    <div className={`stat-card ${color}`} style={{ cursor: onClick?'pointer':undefined }} onClick={onClick}>
      <div className="s-label">{label}</div>
      <div className="s-value" style={color==='green'?{color:'var(--green)'}:color==='red'?{color:'var(--red)'}:color==='blue'?{color:'var(--blue)'}:color==='amber'?{color:'var(--amber)'}:{}}>{value}</div>
      {sub && <div className="s-sub">{sub}</div>}
    </div>
  );
}

// ── Mini bar chart ────────────────────────────────────────────────────────────
export function MiniBarChart({ data, valueKey='total', labelKey='_id', color='var(--green)', height=80 }) {
  if (!data?.length) return <div style={{ height, display:'flex', alignItems:'center', color:'var(--text-3)', fontSize:13 }}>No data yet</div>;
  const max = Math.max(...data.map(d => d[valueKey]||0), 1);
  return (
    <div>
      <div className="chart-bar-row" style={{ height, alignItems:'flex-end' }}>
        {data.map((d,i) => {
          const h = Math.max(3, ((d[valueKey]||0)/max)*height);
          return <div key={i} className="chart-bar" style={{ flex:1, height:h, background:color, opacity:0.5+(i/data.length)*0.5 }} title={`${d[labelKey]}: ${d[valueKey]||0}`} />;
        })}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:10, color:'var(--text-3)' }}>
        {data.slice(0,1).map(d => <span key="s">{String(d[labelKey]).slice(-5)}</span>)}
        {data.slice(-1).map(d => <span key="e">{String(d[labelKey]).slice(-5)}</span>)}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon='📋', title, action, onAction }) {
  return (
    <div className="empty">
      <span className="empty-icon">{icon}</span>
      <p>{title}</p>
      {action && <button className="btn btn-primary" style={{ marginTop:12 }} onClick={onAction}>{action}</button>}
    </div>
  );
}

// ── Alert ─────────────────────────────────────────────────────────────────────
export function Alert({ type='success', children }) {
  return <div className={`alert alert-${type}`}>{children}</div>;
}

// ── User avatar ───────────────────────────────────────────────────────────────
export function UserAvatar({ name, size=32, color='#1D9E75' }) {
  const initials = name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || '?';
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:color+'22', color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.35, fontWeight:700, flexShrink:0 }}>
      {initials}
    </div>
  );
}

// ── Confirm dialog (inline) ───────────────────────────────────────────────────
export function useConfirm() {
  const confirm = (message) => window.confirm(message);
  return confirm;
}
