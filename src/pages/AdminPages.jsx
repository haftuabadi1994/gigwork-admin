// ─────────────────────────────────────────────────────────────────────────────
// All remaining admin pages
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { Pagination, Modal, Alert, StatCard, EmptyState, MiniBarChart, UserAvatar } from '../components/UI';
import api from '../utils/api';

// ── WITHDRAWALS ───────────────────────────────────────────────────────────────
export function Withdrawals() {
  const [items, setItems] = useState([]); const [total,setTotal]=useState(0); const [page,setPage]=useState(1);
  const [filter,setFilter]=useState('pending'); const [loading,setLoading]=useState(true); const [msg,setMsg]=useState(null);
  const load=useCallback(()=>{ setLoading(true); api.get('/admin/withdrawals',{params:{status:filter||undefined,page,limit:20}}).then(r=>{setItems(r.data.withdrawals);setTotal(r.data.total);}).catch(console.error).finally(()=>setLoading(false)); },[filter,page]);
  useEffect(()=>{load();},[load]);
  const process=async(id,action)=>{ const note=action==='reject'?window.prompt('Reason:')||'':''; setMsg(null); try{ await api.patch(`/admin/withdrawals/${id}`,{action,adminNote:note}); setMsg({type:'success',text:`Withdrawal ${action}d.`}); load(); }catch(e){setMsg({type:'error',text:e.response?.data?.error||'Error'});} };
  const METHOD={telebirr:'📱 Telebirr',mpesa:'💚 M-Pesa',cbe_birr:'💙 CBE Birr',bank_transfer:'🏦 Bank',other:'Other'};
  const STATUS={pending:'badge-amber',processing:'badge-blue',completed:'badge-green',rejected:'badge-red'};
  return (
    <Layout title="Withdrawal requests" subtitle="Approve or reject worker payment requests">
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}
      <div className="table-wrap">
        <div className="table-head"><h3>Withdrawals ({total})</h3>
          <div style={{display:'flex',gap:8}}>
            {['pending','completed','rejected',''].map((s,i)=>(
              <button key={i} className={`btn ${filter===s?'btn-primary':'btn-ghost'}`} style={{fontSize:12,padding:'6px 12px'}} onClick={()=>{setFilter(s);setPage(1);}}>
                {s===''?'All':s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {loading?<div style={{padding:32,textAlign:'center',color:'var(--text-3)'}}>Loading…</div>:(
          items.length===0?<EmptyState icon="✅" title={`No ${filter} withdrawals`} />:(
          <table className="data-table">
            <thead><tr><th>Worker</th><th>Amount</th><th>Method</th><th>Account</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>{items.map(w=>(
              <tr key={w._id}>
                <td><div style={{fontWeight:500}}>{w.user?.name}</div><div style={{fontSize:11,color:'var(--text-3)'}}>{w.user?.phone||w.user?.email}</div></td>
                <td style={{fontWeight:700,fontSize:15}}>{w.amountETB.toLocaleString()} ETB</td>
                <td><span className="badge badge-blue" style={{fontSize:10}}>{METHOD[w.method]||w.method}</span></td>
                <td><div className="mono">{w.accountNumber}</div><div style={{fontSize:11,color:'var(--text-3)'}}>{w.accountName}</div></td>
                <td><span className={`badge ${STATUS[w.status]}`}>{w.status}</span></td>
                <td style={{fontSize:12,color:'var(--text-3)'}}>{new Date(w.createdAt).toLocaleDateString()}</td>
                <td>{w.status==='pending'&&(<div style={{display:'flex',gap:6}}>
                  <button className="btn btn-primary" style={{fontSize:11,padding:'4px 10px'}} onClick={()=>process(w._id,'complete')}>✓ Approve</button>
                  <button className="btn btn-danger" style={{fontSize:11,padding:'4px 10px'}} onClick={()=>process(w._id,'reject')}>✗ Reject</button>
                </div>)}{w.adminNote&&<div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>{w.adminNote}</div>}</td>
              </tr>
            ))}</tbody>
          </table>)
        )}
        <Pagination page={page} pages={Math.ceil(total/20)} total={total} onPage={setPage} />
      </div>
    </Layout>
  );
}

// ── DEPOSITS ──────────────────────────────────────────────────────────────────
export function Deposits() {
  const [items,setItems]=useState([]); const [total,setTotal]=useState(0); const [pendingTotal,setPendingTotal]=useState(0); const [pendingCount,setPendingCount]=useState(0);
  const [filter,setFilter]=useState('pending'); const [methodFilter,setMethodFilter]=useState(''); const [page,setPage]=useState(1);
  const [selected,setSelected]=useState(null); const [loading,setLoading]=useState(true); const [msg,setMsg]=useState(null);
  const load=useCallback(()=>{ setLoading(true); api.get('/admin/deposits',{params:{status:filter||undefined,method:methodFilter||undefined,page,limit:20}}).then(r=>{setItems(r.data.deposits);setTotal(r.data.total);setPendingTotal(r.data.pendingTotal);setPendingCount(r.data.pendingCount);}).catch(console.error).finally(()=>setLoading(false)); },[filter,methodFilter,page]);
  useEffect(()=>{load();},[load]);
  const review=async(id,action)=>{ const note=action==='reject'?window.prompt('Rejection reason:')||'':''; setMsg(null); try{ await api.patch(`/admin/deposits/${id}`,{action,adminNote:note}); setMsg({type:'success',text:`Deposit ${action}d!`}); load(); setSelected(null); }catch(e){setMsg({type:'error',text:e.response?.data?.error||'Error'});} };
  const MM={telebirr:{icon:'📱',label:'Telebirr'},mpesa:{icon:'💚',label:'M-Pesa'},cbe:{icon:'🏦',label:'CBE Bank'},cbe_birr:{icon:'💙',label:'CBE Birr'}};
  const STATUS={pending:'badge-amber',under_review:'badge-blue',approved:'badge-green',rejected:'badge-red'};
  return (
    <Layout title="Deposit requests" subtitle="Review and approve worker deposits">
      {msg&&<Alert type={msg.type}>{msg.text}</Alert>}
      {pendingCount>0&&<div style={{background:'#FEF3C7',border:'1px solid #FCD34D',borderRadius:10,padding:'12px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:10}}><i className="ti ti-alert-triangle" style={{fontSize:18,color:'#D97706'}}/><span style={{fontSize:14,color:'#92400E',fontWeight:500}}>{pendingCount} deposit{pendingCount>1?'s':''} — <strong>{pendingTotal.toLocaleString()} ETB</strong> awaiting review</span></div>}
      <div className="table-wrap">
        <div className="table-head"><h3>Deposits ({total})</h3>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <select className="filter-select" value={filter} onChange={e=>{setFilter(e.target.value);setPage(1);}}>
              <option value="">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
            </select>
            <select className="filter-select" value={methodFilter} onChange={e=>{setMethodFilter(e.target.value);setPage(1);}}>
              <option value="">All methods</option><option value="telebirr">Telebirr</option><option value="mpesa">M-Pesa</option><option value="cbe">CBE Bank</option><option value="cbe_birr">CBE Birr</option>
            </select>
          </div>
        </div>
        {loading?<div style={{padding:32,textAlign:'center',color:'var(--text-3)'}}>Loading…</div>:items.length===0?<EmptyState icon="📥" title={`No ${filter} deposits`} />:(
          <table className="data-table">
            <thead><tr><th>User</th><th>Method</th><th>Amount</th><th>Reference</th><th>Receipt</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody>{items.map(d=>{const mm=MM[d.method]||{icon:'💰',label:d.method}; return (
              <tr key={d._id}>
                <td><div style={{fontWeight:500}}>{d.user?.name}</div><div style={{fontSize:11,color:'var(--text-3)'}}>{d.senderPhone||d.user?.email}</div></td>
                <td><span style={{display:'flex',alignItems:'center',gap:6,fontSize:13,fontWeight:500}}>{mm.icon} {mm.label}</span></td>
                <td style={{fontWeight:700,fontSize:15}}>{d.amountETB.toLocaleString()} ETB</td>
                <td><span className="mono">{d.paymentReference||'—'}</span></td>
                <td>{d.receiptPath?<span className="badge badge-green" style={{fontSize:10}}>✓ Uploaded</span>:<span className="badge badge-gray" style={{fontSize:10}}>None</span>}</td>
                <td><span className={`badge ${STATUS[d.status]||'badge-gray'}`}>{d.status.replace('_',' ')}</span></td>
                <td style={{fontSize:12,color:'var(--text-3)'}}>{new Date(d.createdAt).toLocaleDateString()}</td>
                <td><button className={`btn ${d.status==='pending'?'btn-primary':'btn-ghost'}`} style={{fontSize:12,padding:'5px 12px'}} onClick={()=>setSelected(d)}>{d.status==='pending'?'Review':'View'}</button></td>
              </tr>
            );})}
            </tbody>
          </table>
        )}
        <Pagination page={page} pages={Math.ceil(total/20)} total={total} onPage={setPage} />
      </div>
      {selected&&(
        <Modal title={`Deposit review — ${selected.user?.name}`} onClose={()=>setSelected(null)} maxWidth={600}
          footer={<><button className="btn btn-ghost" onClick={()=>setSelected(null)}>Close</button>{selected.status==='pending'&&<><button className="btn btn-danger" onClick={()=>review(selected._id,'reject')}>✗ Reject</button><button className="btn btn-primary" onClick={()=>review(selected._id,'approve')}>✓ Approve & Credit</button></>}</>}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:18}}>
            {[['User',selected.user?.name],['Phone',selected.senderPhone||'—'],['Method',MM[selected.method]?.label||selected.method],['Amount',`${selected.amountETB.toLocaleString()} ETB`],['Sender name',selected.senderName||'—'],['Reference',selected.paymentReference||'—']].map(([l,v])=>(
              <div key={l} style={{background:'#F9FAFB',borderRadius:8,padding:'10px 12px'}}><div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>{l}</div><div style={{fontSize:14,fontWeight:500}}>{v}</div></div>
            ))}
          </div>
          {selected.receiptPath&&(
            <div style={{marginBottom:16}}>
              <p style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:8}}>Receipt</p>
              {selected.receiptPath.match(/\.(jpg|jpeg|png|heic)$/i)
                ?<img src={`http://10.10.3.209:5000/uploads/receipts/${selected.receiptPath}`} alt="Receipt" style={{width:'100%',maxHeight:260,objectFit:'contain',borderRadius:10,border:'1px solid var(--border)',cursor:'pointer'}} onClick={()=>window.open(`http://10.10.3.209:5000/uploads/receipts/${selected.receiptPath}`, '_blank')} />
                :<a href={`http://10.10.3.209:5000/uploads/receipts/${selected.receiptPath}`} target="_blank" rel="noreferrer" className="btn btn-outline">📄 View PDF receipt</a>
              }
            </div>
          )}
          {!selected.receiptPath&&<div style={{background:'#FEF3C7',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#92400E',marginBottom:16}}>⚠️ No receipt uploaded — verify using reference: <strong>{selected.paymentReference||'N/A'}</strong></div>}
        </Modal>
      )}
    </Layout>
  );
}

// ── TRANSACTIONS ──────────────────────────────────────────────────────────────
export function Transactions() {
  const [txs,setTxs]=useState([]); const [total,setTotal]=useState(0); const [page,setPage]=useState(1); const [typeFilter,setTypeFilter]=useState(''); const [loading,setLoading]=useState(true);
  const load=useCallback(()=>{ setLoading(true); api.get('/admin/transactions',{params:{page,limit:25,type:typeFilter}}).then(r=>{setTxs(r.data.transactions||[]);setTotal(r.data.total||0);}).catch(console.error).finally(()=>setLoading(false)); },[page,typeFilter]);
  useEffect(()=>{load();},[load]);
  const TYPE_BADGE={task_earning:'badge-green',referral_bonus:'badge-purple',withdrawal:'badge-blue',adjustment:'badge-gray'};
  return (
    <Layout title="Transaction ledger" subtitle="Immutable record of every ETB movement">
      <div className="table-wrap">
        <div className="table-head"><h3>Transactions ({total})</h3>
          <select className="filter-select" value={typeFilter} onChange={e=>{setTypeFilter(e.target.value);setPage(1);}}>
            <option value="">All types</option><option value="task_earning">Task earnings</option><option value="referral_bonus">Referral bonus</option><option value="withdrawal">Withdrawals</option><option value="adjustment">Adjustments</option>
          </select>
        </div>
        {loading?<div style={{padding:32,textAlign:'center',color:'var(--text-3)'}}>Loading…</div>:txs.length===0?<EmptyState icon="📊" title="No transactions found" />:(
          <table className="data-table">
            <thead><tr><th>User</th><th>Description</th><th>Type</th><th>Amount</th><th>Balance after</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>{txs.map(tx=>(
              <tr key={tx._id}>
                <td><div style={{fontWeight:500,fontSize:12}}>{tx.user?.name||'—'}</div><div style={{fontSize:11,color:'var(--text-3)'}}>{tx.user?.email}</div></td>
                <td style={{maxWidth:200}}><div style={{fontSize:13}}>{tx.description}</div><div className="mono" style={{color:'var(--text-3)'}}>{String(tx._id).slice(-8)}</div></td>
                <td><span className={`badge ${TYPE_BADGE[tx.type]||'badge-gray'}`} style={{fontSize:10}}>{tx.type?.replace(/_/g,' ')}</span></td>
                <td style={{fontWeight:700,color:tx.amountETB>=0?'var(--green)':'var(--red)',whiteSpace:'nowrap'}}>{tx.amountETB>=0?'+':''}{tx.amountETB?.toLocaleString()} ETB</td>
                <td style={{fontSize:13,color:'var(--text-3)',whiteSpace:'nowrap'}}>{tx.balanceAfterETB?.toLocaleString()} ETB</td>
                <td><span className={`badge ${tx.status==='completed'?'badge-green':tx.status==='failed'?'badge-red':'badge-amber'}`}>{tx.status}</span></td>
                <td style={{fontSize:12,color:'var(--text-3)',whiteSpace:'nowrap'}}>{new Date(tx.createdAt).toLocaleString('en-ET',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
        <Pagination page={page} pages={Math.ceil(total/25)} total={total} onPage={setPage} />
      </div>
    </Layout>
  );
}

// ── HANDBOOK & LEVELS ─────────────────────────────────────────────────────────
export function Handbook() {
  const [sections,setSections]=useState([]); const [rules,setRules]=useState([]); const [tab,setTab]=useState('handbook');
  const [editSection,setEditSection]=useState(null); const [showCreate,setShowCreate]=useState(false); const [msg,setMsg]=useState(null); const [saving,setSaving]=useState(false);
  const load=()=>{ api.get('/admin/handbook').then(r=>{setSections(r.data.sections);setRules(r.data.levelRules);}).catch(console.error); };
  useEffect(()=>{load();},[]);
  const deleteSection=async(id)=>{ if(!window.confirm('Delete this section?'))return; await api.delete(`/admin/handbook/${id}`); load(); };
  const saveRules=async()=>{ setSaving(true); setMsg(null); try{ await api.put('/admin/level-rules',{rules}); setMsg({type:'success',text:'Level rules saved!'});} catch{ setMsg({type:'error',text:'Failed'});} finally{setSaving(false);}};
  const setRule=(level,key,val)=>setRules(prev=>prev.map(r=>r.level===level?{...r,[key]:val}:r));
  const LEVEL_COLORS={intern:'#6B7280',job1:'#10B981',job2:'#3B82F6',job3:'#8B5CF6',job4:'#F59E0B',job5:'#EF4444',job6:'#EC4899',job7:'#14B8A6',job8:'#F97316',job9:'#6366F1',job10:'#D97706'};
  function SectionForm({section,onClose}){
    const [form,setForm]=useState(section||{slug:'',title:'',content:'',order:0,isPublished:true});
    const [loading,setLoading]=useState(false);
    const save=async()=>{ setLoading(true); try{ if(section?._id) await api.patch(`/admin/handbook/${section._id}`,form); else await api.post('/admin/handbook',form); load();onClose();} catch(e){alert(e.response?.data?.error||'Error');} finally{setLoading(false);}};
    return (
      <Modal title={section?'Edit section':'New section'} onClose={onClose} footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={loading}>{loading?'Saving…':'Save'}</button></>}>
        <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} /></div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div className="form-group"><label className="form-label">Slug</label><input className="form-input" value={form.slug} onChange={e=>setForm(f=>({...f,slug:e.target.value}))} placeholder="e.g. how-it-works" /></div>
          <div className="form-group"><label className="form-label">Order</label><input className="form-input" type="number" value={form.order} onChange={e=>setForm(f=>({...f,order:Number(e.target.value)}))} /></div>
        </div>
        <div className="form-group"><label className="form-label">Content</label><textarea className="form-textarea" rows={8} value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} /></div>
        <div style={{display:'flex',alignItems:'center',gap:10}}><label className="toggle"><input type="checkbox" checked={form.isPublished} onChange={e=>setForm(f=>({...f,isPublished:e.target.checked}))}/><span className="toggle-slider"/></label><span style={{fontSize:13,color:'var(--text-2)'}}>Published</span></div>
      </Modal>
    );
  }
  return (
    <Layout title="Handbook & Level rules" subtitle="Edit the employee handbook and income level configuration">
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {[{k:'handbook',l:'📖 Handbook sections'},{k:'levels',l:'📊 Level income rules'}].map(t=>(
          <button key={t.k} className={`btn ${tab===t.k?'btn-primary':'btn-ghost'}`} onClick={()=>setTab(t.k)}>{t.l}</button>
        ))}
      </div>
      {tab==='handbook'&&(
        <div className="table-wrap">
          <div className="table-head"><h3>Sections ({sections.length})</h3><button className="btn btn-primary" onClick={()=>setShowCreate(true)}><i className="ti ti-plus"/> New section</button></div>
          {sections.length===0?<EmptyState icon="📖" title="No sections yet" />:(
            <table className="data-table">
              <thead><tr><th>#</th><th>Title</th><th>Slug</th><th>Status</th><th>Updated</th><th></th></tr></thead>
              <tbody>{sections.map(s=>(
                <tr key={s._id}>
                  <td style={{fontWeight:600,color:'var(--text-3)'}}>{s.order}</td>
                  <td style={{fontWeight:500}}>{s.title}</td>
                  <td><code style={{fontSize:11,background:'#F3F4F6',padding:'2px 6px',borderRadius:4}}>{s.slug}</code></td>
                  <td><span className={`badge ${s.isPublished?'badge-green':'badge-gray'}`}>{s.isPublished?'Published':'Draft'}</span></td>
                  <td style={{fontSize:12,color:'var(--text-3)'}}>{new Date(s.updatedAt).toLocaleDateString()}</td>
                  <td><div style={{display:'flex',gap:6}}><button className="btn btn-ghost" style={{padding:'4px 8px'}} onClick={()=>setEditSection(s)}><i className="ti ti-edit"/></button><button className="btn btn-danger" style={{padding:'4px 8px'}} onClick={()=>deleteSection(s._id)}><i className="ti ti-trash"/></button></div></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}
      {tab==='levels'&&(
        <div>
          {msg&&<Alert type={msg.type}>{msg.text}</Alert>}
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}>
            <button className="btn btn-primary" onClick={saveRules} disabled={saving}>{saving?'Saving…':<><i className="ti ti-device-floppy"/> Save all rules</>}</button>
          </div>
          {rules.map(r=>(
            <div key={r.level} style={{background:'#fff',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden',marginBottom:12}}>
              <div style={{background:LEVEL_COLORS[r.level],padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <span style={{fontSize:14,fontWeight:700,color:'#fff',textTransform:'uppercase'}}>{r.level}</span>
                  <input value={r.label} onChange={e=>setRule(r.level,'label',e.target.value)} style={{fontSize:13,background:'rgba(255,255,255,0.2)',border:'none',color:'#fff',borderRadius:6,padding:'3px 8px',width:180,fontFamily:'inherit'}}/>
                </div>
                <label className="toggle"><input type="checkbox" checked={r.isActive} onChange={e=>setRule(r.level,'isActive',e.target.checked)}/><span className="toggle-slider"/></label>
              </div>
              <div style={{padding:'12px 16px',display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10}}>
                {[['depositRequiredETB','Deposit (ETB)'],['taskCountPerDay','Tasks/day'],['rewardPerTaskETB','Reward/task (ETB)'],['referralCommission','Referral %'],['teamBonusPercent','Team bonus %'],['minTasksToAdvance','Min tasks']].map(([k,l])=>(
                  <div key={k}><label style={{fontSize:10,color:'var(--text-3)',display:'block',marginBottom:3}}>{l}</label>
                  <input type="number" value={r[k]||0} onChange={e=>setRule(r.level,k,Number(e.target.value))} style={{width:'100%',padding:'6px 8px',border:'1px solid var(--border)',borderRadius:6,fontSize:13,fontFamily:'inherit',outline:'none'}}/></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {(showCreate||editSection)&&<SectionForm section={editSection} onClose={()=>{setShowCreate(false);setEditSection(null);}}/>}
    </Layout>
  );
}

// ── BROADCAST ─────────────────────────────────────────────────────────────────
export function Broadcast() {
  const [form,setForm]=useState({title:'',body:'',type:'system',targetRole:'worker'}); const [msg,setMsg]=useState(null); const [loading,setLoading]=useState(false); const [history,setHistory]=useState([]);
  const TEMPLATES=[{label:'Maintenance',title:'Scheduled maintenance',body:'Our platform will be under maintenance on [DATE]. Please complete your tasks before then.'},{label:'New tasks',title:'New tasks added!',body:"We've added new tasks. Log in now to claim them before they fill up!"},{label:'Withdrawal update',title:'Withdrawal processing',body:'We are processing all pending withdrawals. You will receive payment within 24 hours.'},{label:'Referral reminder',title:'Invite friends & earn!',body:'Share your referral code and earn bonuses for every friend who joins and completes tasks.'}];
  const send=async()=>{ if(!form.title||!form.body)return setMsg({type:'error',text:'Title and message required.'}); setLoading(true);setMsg(null); try{ const r=await api.post('/admin/broadcast',form); setMsg({type:'success',text:r.data.message}); setHistory(h=>[{...form,sentAt:new Date(),id:Date.now()},...h]); setForm({title:'',body:'',type:'system',targetRole:'worker'});} catch(e){setMsg({type:'error',text:e.response?.data?.error||'Failed'});} finally{setLoading(false);}};
  return (
    <Layout title="Broadcast notifications" subtitle="Send messages to all workers at once">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <div className="card">
          <h3 style={{fontSize:15,fontWeight:600,marginBottom:20}}>📢 Compose broadcast</h3>
          {msg&&<Alert type={msg.type}>{msg.text}</Alert>}
          <div className="form-group"><label className="form-label">Type</label>
            <select className="form-select" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
              <option value="system">📢 System</option><option value="income_update">💰 Income</option><option value="task_assigned">📋 Task</option><option value="team_activity">👥 Team</option>
            </select></div>
          <div className="form-group"><label className="form-label">Target</label>
            <select className="form-select" value={form.targetRole} onChange={e=>setForm(f=>({...f,targetRole:e.target.value}))}>
              <option value="worker">All workers</option><option value="admin">Admins only</option>
            </select></div>
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Notification headline"/></div>
          <div className="form-group"><label className="form-label">Message</label><textarea className="form-textarea" rows={4} value={form.body} onChange={e=>setForm(f=>({...f,body:e.target.value}))} placeholder="Write the notification message…"/></div>
          {(form.title||form.body)&&(<div style={{background:'#F9FAFB',borderRadius:10,padding:14,marginBottom:16,border:'1px solid var(--border)'}}>
            <p style={{fontSize:11,color:'var(--text-3)',marginBottom:8,fontWeight:600}}>PREVIEW</p>
            <div style={{display:'flex',gap:10}}><div style={{width:36,height:36,borderRadius:10,background:'var(--green-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>🔔</div>
            <div><p style={{fontWeight:600,fontSize:14}}>{form.title||'Title…'}</p><p style={{fontSize:13,color:'var(--text-2)',marginTop:2}}>{form.body||'Message…'}</p></div></div>
          </div>)}
          <button className="btn btn-primary" style={{width:'100%',padding:11}} onClick={send} disabled={loading}>{loading?'Sending…':<><i className="ti ti-send"/> Send to all {form.targetRole}s</>}</button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="card">
            <h3 style={{fontSize:14,fontWeight:600,marginBottom:14}}>📝 Quick templates</h3>
            {TEMPLATES.map(t=>(
              <button key={t.label} className="btn btn-ghost" style={{width:'100%',textAlign:'left',justifyContent:'flex-start',padding:'10px 12px',marginBottom:6}} onClick={()=>setForm(f=>({...f,title:t.title,body:t.body}))}>
                <div><div style={{fontWeight:600,fontSize:13}}>{t.label}</div><div style={{fontSize:11,color:'var(--text-3)',marginTop:1}}>{t.title}</div></div>
              </button>
            ))}
          </div>
          {history.length>0&&<div className="card"><h3 style={{fontSize:14,fontWeight:600,marginBottom:12}}>📬 Recently sent</h3>{history.map(h=>(
            <div key={h.id} style={{padding:'10px 0',borderBottom:'1px solid var(--border-light)'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontWeight:600,fontSize:13}}>{h.title}</span><span style={{fontSize:11,color:'var(--text-3)'}}>{new Date(h.sentAt).toLocaleTimeString()}</span></div>
              <p style={{fontSize:12,color:'var(--text-2)',marginTop:3}}>{h.body.slice(0,80)}{h.body.length>80?'…':''}</p>
            </div>
          ))}</div>}
        </div>
      </div>
    </Layout>
  );
}

// ── TEAM & REFERRALS ──────────────────────────────────────────────────────────
export function Team() {
  const [leaderboard,setLeaderboard]=useState([]); const [users,setUsers]=useState([]); const [total,setTotal]=useState(0); const [search,setSearch]=useState(''); const [page,setPage]=useState(1); const [tab,setTab]=useState('leaderboard'); const [selected,setSelected]=useState(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{ api.get('/admin/team/leaderboard').then(r=>setLeaderboard(r.data.leaderboard)).catch(console.error).finally(()=>setLoading(false)); },[]);
  const loadUsers=useCallback(()=>{ setLoading(true); api.get('/admin/users',{params:{page,limit:20,search}}).then(r=>{setUsers(r.data.users);setTotal(r.data.total);}).catch(console.error).finally(()=>setLoading(false)); },[page,search]);
  useEffect(()=>{ if(tab==='manual')loadUsers(); },[tab,loadUsers]);
  const LEVEL_COLORS={intern:'#6B7280',job1:'#10B981',job2:'#3B82F6',job3:'#8B5CF6',job4:'#F59E0B',job5:'#EF4444',job6:'#EC4899',job7:'#14B8A6',job8:'#F97316',job9:'#6366F1',job10:'#D97706'};
  function BonusModal({user,onClose}){
    const [form,setForm]=useState({amountETB:'',description:''}); const [msg,setMsg]=useState(null); const [loading,setLoading]=useState(false);
    const submit=async()=>{ if(!form.amountETB||!form.description)return setMsg({type:'error',text:'All fields required.'}); setLoading(true); try{ const r=await api.post(`/admin/users/${user._id}/adjust-wallet`,{amountETB:Number(form.amountETB),description:form.description}); setMsg({type:'success',text:`Credited! New balance: ${r.data.newBalanceETB} ETB`}); } catch(e){setMsg({type:'error',text:e.response?.data?.error||'Error'});} finally{setLoading(false);}};
    return (<Modal title={`Referral bonus — ${user.name}`} onClose={onClose} footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={submit} disabled={loading}>{loading?'Crediting…':'Credit bonus'}</button></>}>
      {msg&&<Alert type={msg.type}>{msg.text}</Alert>}
      <p style={{fontSize:13,color:'var(--text-2)',marginBottom:14}}>Current balance: <strong>{(user.incomeWalletETB||user.balanceETB||0).toLocaleString()} ETB</strong></p>
      <div className="form-group"><label className="form-label">Amount (ETB)</label><input className="form-input" type="number" min={1} value={form.amountETB} onChange={e=>setForm(f=>({...f,amountETB:e.target.value}))} placeholder="e.g. 500"/></div>
      <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Manual referral bonus"/></div>
    </Modal>);
  }
  return (
    <Layout title="Team & Referral oversight" subtitle="Leaderboard and manual bonus crediting">
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {[{k:'leaderboard',l:'🏆 Referral leaderboard'},{k:'manual',l:'🎁 Manual bonus'}].map(t=>(
          <button key={t.k} className={`btn ${tab===t.k?'btn-primary':'btn-ghost'}`} onClick={()=>setTab(t.k)}>{t.l}</button>
        ))}
      </div>
      {tab==='leaderboard'&&(<div className="table-wrap">
        <div className="table-head"><h3>Top referrers</h3></div>
        {loading?<div style={{padding:32,textAlign:'center',color:'var(--text-3)'}}>Loading…</div>:leaderboard.length===0?<EmptyState icon="🏆" title="No referral data yet"/>:(
          <table className="data-table"><thead><tr><th>Rank</th><th>User</th><th>Level</th><th>Referrals</th><th>Tasks</th><th>Total earned</th></tr></thead>
          <tbody>{leaderboard.map((u,i)=>(
            <tr key={u._id}>
              <td style={{fontWeight:700,fontSize:16,color:i===0?'#F59E0B':i===1?'#9CA3AF':i===2?'#D97706':'var(--text-3)'}}>#{i+1}</td>
              <td><div style={{display:'flex',alignItems:'center',gap:10}}><UserAvatar name={u.name} size={28} color={LEVEL_COLORS[u.level||'intern']}/><span style={{fontWeight:500}}>{u.name}</span></div></td>
              <td><span style={{background:LEVEL_COLORS[u.level||'intern']+'22',color:LEVEL_COLORS[u.level||'intern'],fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:8,textTransform:'uppercase'}}>{u.level||'intern'}</span></td>
              <td style={{fontWeight:700,color:'var(--green)',fontSize:15}}>{u.referralCount}</td>
              <td>{u.tasksCompleted}</td>
              <td style={{fontWeight:700}}>{u.totalEarnedETB.toLocaleString()} ETB</td>
            </tr>
          ))}</tbody></table>
        )}
      </div>)}
      {tab==='manual'&&(<div className="table-wrap">
        <div className="table-head"><h3>Credit manual bonus</h3><input className="filter-input" placeholder="Search user…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{width:200}}/></div>
        {loading?<div style={{padding:32,textAlign:'center',color:'var(--text-3)'}}>Loading…</div>:(
          <table className="data-table"><thead><tr><th>User</th><th>Level</th><th>Referrals</th><th>Wallet</th><th></th></tr></thead>
          <tbody>{users.filter(u=>u.role==='worker').map(u=>(
            <tr key={u._id}>
              <td><div style={{fontWeight:500}}>{u.name}</div><div style={{fontSize:11,color:'var(--text-3)'}}>{u.email}</div></td>
              <td><span style={{background:LEVEL_COLORS[u.level||'intern']+'22',color:LEVEL_COLORS[u.level||'intern'],fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:8,textTransform:'uppercase'}}>{u.level||'intern'}</span></td>
              <td>{u.referralCount||0}</td>
              <td style={{fontWeight:600,color:'var(--green)'}}>{(u.incomeWalletETB||u.balanceETB||0).toLocaleString()} ETB</td>
              <td><button className="btn btn-primary" style={{fontSize:12,padding:'5px 12px'}} onClick={()=>setSelected(u)}><i className="ti ti-gift"/> Credit</button></td>
            </tr>
          ))}</tbody></table>
        )}
        <Pagination page={page} pages={Math.ceil(total/20)} total={total} onPage={setPage}/>
      </div>)}
      {selected&&<BonusModal user={selected} onClose={()=>setSelected(null)}/>}
    </Layout>
  );
}

// ── STATEMENTS ────────────────────────────────────────────────────────────────
export function Statements() {
  const [mode,setMode]=useState('platform'); const [date,setDate]=useState(new Date().toISOString().slice(0,10)); const [userId,setUserId]=useState(''); const [userSearch,setUserSearch]=useState(''); const [users,setUsers]=useState([]); const [preview,setPreview]=useState([]); const [summary,setSummary]=useState(null); const [loading,setLoading]=useState(false); const [msg,setMsg]=useState(null);
  const searchUsers=async()=>{ if(!userSearch.trim())return; const r=await api.get('/admin/users',{params:{search:userSearch,limit:10}}); setUsers(r.data.users); };
  const generate=async()=>{ setLoading(true);setMsg(null);setPreview([]); try{
    const start=new Date(date);start.setHours(0,0,0,0); const end=new Date(date);end.setHours(23,59,59,999);
    const r=await api.get('/admin/transactions',{params:{limit:500,page:1}});
    const all=r.data.transactions||[];
    const filtered=all.filter(tx=>{ const d=new Date(tx.createdAt); return d>=start&&d<=end&&(mode==='platform'||(!userId)?true:String(tx.user?._id)===String(userId)); });
    const rows=[['Date','User','Email','Type','Description','Amount (ETB)','Balance After (ETB)','Status']];
    let credit=0,debit=0;
    filtered.forEach(tx=>{ rows.push([new Date(tx.createdAt).toLocaleString(),tx.user?.name||'',tx.user?.email||'',tx.type?.replace(/_/g,' ')||'',tx.description||'',tx.amountETB||0,tx.balanceAfterETB||0,tx.status||'']); if(tx.amountETB>0)credit+=tx.amountETB; else debit+=Math.abs(tx.amountETB); });
    setPreview(rows.slice(1,11)); setSummary({total:filtered.length,credit,debit,date});
    if(filtered.length===0){setMsg({type:'error',text:'No transactions found for this date.'});return;}
    const csv=rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob); const a=document.createElement('a');
    a.href=url; a.download=`gigwork_statement_${date}.csv`; a.click(); URL.revokeObjectURL(url);
    setMsg({type:'success',text:`Downloaded ${filtered.length} transactions.`});
  }catch(e){setMsg({type:'error',text:'Failed.'});}finally{setLoading(false);}};
  return (
    <Layout title="Statements & export" subtitle="Generate CSV statements for any date or user">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <div className="card">
          <h3 style={{fontSize:15,fontWeight:600,marginBottom:20}}>📊 Generate statement</h3>
          {msg&&<Alert type={msg.type}>{msg.text}</Alert>}
          <div className="form-group"><label className="form-label">Type</label>
            <div style={{display:'flex',gap:8}}>{[{v:'platform',l:'🌐 Platform'},{v:'user',l:'👤 Single user'}].map(o=>(
              <button key={o.v} className={`btn ${mode===o.v?'btn-primary':'btn-ghost'}`} style={{flex:1}} onClick={()=>setMode(o.v)}>{o.l}</button>
            ))}</div></div>
          <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={date} onChange={e=>setDate(e.target.value)} max={new Date().toISOString().slice(0,10)}/></div>
          {mode==='user'&&(<div className="form-group"><label className="form-label">Search user</label>
            <div style={{display:'flex',gap:8}}><input className="form-input" placeholder="Name or email…" value={userSearch} onChange={e=>setUserSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&searchUsers()} style={{flex:1}}/><button className="btn btn-ghost" onClick={searchUsers}><i className="ti ti-search"/></button></div>
            {users.length>0&&<div style={{marginTop:8,border:'1px solid var(--border)',borderRadius:8,overflow:'hidden'}}>{users.map(u=>(
              <div key={u._id} onClick={()=>{setUserId(u._id);setUserSearch(u.name);setUsers([]);}} style={{padding:'10px 14px',cursor:'pointer',fontSize:13,borderBottom:'1px solid var(--border-light)',background:userId===u._id?'var(--green-light)':'#fff',display:'flex',justifyContent:'space-between'}}>
                <span><strong>{u.name}</strong> <span style={{color:'var(--text-3)'}}>{u.email}</span></span>
                {userId===u._id&&<i className="ti ti-check" style={{color:'var(--green)'}}/>}
              </div>
            ))}</div>}
          </div>)}
          <button className="btn btn-primary" style={{width:'100%',padding:11,marginTop:8}} onClick={generate} disabled={loading||(mode==='user'&&!userId)}>
            {loading?'Generating…':<><i className="ti ti-download"/> Generate & Download CSV</>}
          </button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {summary&&(<div className="card">
            <h3 style={{fontSize:14,fontWeight:600,marginBottom:14}}>Summary — {summary.date}</h3>
            {[['Total transactions',summary.total,'var(--text)'],['Total credits',`+${summary.credit.toLocaleString()} ETB`,'var(--green)'],['Total debits',`-${summary.debit.toLocaleString()} ETB`,'var(--red)'],['Net flow',`${(summary.credit-summary.debit).toLocaleString()} ETB`,'var(--text)']].map(([l,v,c])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid var(--border-light)'}}>
                <span style={{fontSize:13,color:'var(--text-2)'}}>{l}</span><span style={{fontSize:14,fontWeight:700,color:c}}>{v}</span>
              </div>
            ))}
          </div>)}
          {preview.length>0&&(<div className="card"><h3 style={{fontSize:14,fontWeight:600,marginBottom:12}}>Preview (first 10 rows)</h3>
            <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead><tr>{['User','Type','Amount','Status'].map(h=><th key={h} style={{textAlign:'left',padding:'6px 8px',color:'var(--text-3)',fontWeight:600,borderBottom:'1px solid var(--border)'}}>{h}</th>)}</tr></thead>
              <tbody>{preview.map((row,i)=>(
                <tr key={i} style={{borderBottom:'1px solid var(--border-light)'}}><td style={{padding:'6px 8px',fontWeight:500}}>{row[1]}</td><td style={{padding:'6px 8px'}}><span className={`badge ${row[3]==='task earning'?'badge-green':'badge-gray'}`} style={{fontSize:10}}>{row[3]}</span></td><td style={{padding:'6px 8px',fontWeight:700,color:Number(row[5])>0?'var(--green)':'var(--red)'}}>{Number(row[5])>0?'+':''}{Number(row[5]).toLocaleString()}</td><td style={{padding:'6px 8px'}}><span className={`badge ${row[7]==='completed'?'badge-green':'badge-amber'}`} style={{fontSize:10}}>{row[7]}</span></td>
                </tr>
              ))}</tbody>
            </table></div>
          </div>)}
          <div className="card"><h3 style={{fontSize:14,fontWeight:600,marginBottom:10}}>ℹ️ About statements</h3>
            <p style={{fontSize:13,color:'var(--text-2)',lineHeight:1.7}}>CSV files open in Excel, Google Sheets, or any accounting software. Each row includes timestamp, user details, type, amount, and running balance.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
export function Settings() {
  const [settings,setSettings]=useState(null); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [msg,setMsg]=useState(null);
  useEffect(()=>{ api.get('/admin/settings').then(r=>setSettings(r.data.settings)).catch(console.error).finally(()=>setLoading(false)); },[]);
  const save=async()=>{ setSaving(true);setMsg(null); try{ const r=await api.patch('/admin/settings',settings); setSettings(r.data.settings); setMsg({type:'success',text:'✅ Settings saved!'});} catch(e){setMsg({type:'error',text:e.response?.data?.error||'Failed.'});} finally{setSaving(false);}};
  const set=(k,v)=>setSettings(s=>({...s,[k]:v}));
  const setN=(p,k,v)=>setSettings(s=>({...s,[p]:{...s[p],[k]:v}}));
  if(loading)return <Layout title="Settings"><div style={{padding:40,textAlign:'center',color:'var(--text-3)'}}>Loading…</div></Layout>;
  if(!settings)return null;
  return (
    <Layout title="Platform settings" subtitle="Configure all platform-wide options">
      {msg&&<Alert type={msg.type}>{msg.text}</Alert>}
      <div className="settings-grid">
        {/* General */}
        <div className="card"><h3 style={{marginBottom:16}}><i className="ti ti-settings" style={{marginRight:8}}/>General</h3>
          <div className="form-group"><label className="form-label">App name</label><input className="form-input" value={settings.appName} onChange={e=>set('appName',e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Support email</label><input className="form-input" type="email" value={settings.supportEmail} onChange={e=>set('supportEmail',e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Announcement banner</label><input className="form-input" placeholder="Leave blank to hide" value={settings.announcementBanner} onChange={e=>set('announcementBanner',e.target.value)}/></div>
          {[{k:'maintenanceMode',l:'Maintenance mode',s:'Disables app for non-admins'},{k:'allowNewRegistrations',l:'Allow registrations',s:'Toggle to pause sign-ups'}].map(row=>(
            <div key={row.k} className="settings-row"><div><div className="settings-row-label">{row.l}</div><div className="settings-row-sub">{row.s}</div></div>
            <label className="toggle"><input type="checkbox" checked={settings[row.k]} onChange={e=>set(row.k,e.target.checked)}/><span className="toggle-slider"/></label></div>
          ))}
        </div>
        {/* Finance */}
        <div className="card"><h3 style={{marginBottom:16}}><i className="ti ti-coin" style={{marginRight:8}}/>Finance</h3>
          <div className="form-group"><label className="form-label">ETB → USD rate</label><input className="form-input" type="number" min={1} step={0.5} value={settings.etbToUsdRate} onChange={e=>set('etbToUsdRate',Number(e.target.value))}/><p style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>1 USD = {settings.etbToUsdRate} ETB</p></div>
          <div className="form-group"><label className="form-label">Min withdrawal (ETB)</label><input className="form-input" type="number" min={1} value={settings.minWithdrawalETB} onChange={e=>set('minWithdrawalETB',Number(e.target.value))}/></div>
          <div className="form-group"><label className="form-label">Referral bonus %</label><input className="form-input" type="number" min={0} max={100} value={settings.referralBonusPercent} onChange={e=>set('referralBonusPercent',Number(e.target.value))}/></div>
          <div className="settings-row"><div><div className="settings-row-label">Auto-approve withdrawals</div><div className="settings-row-sub">Skip manual review</div></div>
          <label className="toggle"><input type="checkbox" checked={settings.autoApproveWithdrawals} onChange={e=>set('autoApproveWithdrawals',e.target.checked)}/><span className="toggle-slider"/></label></div>
        </div>
        {/* Tasks */}
        <div className="card"><h3 style={{marginBottom:16}}><i className="ti ti-checklist" style={{marginRight:8}}/>Tasks & quality</h3>
          <div className="form-group"><label className="form-label">Max tasks per user per day</label><input className="form-input" type="number" min={1} value={settings.maxTasksPerDay} onChange={e=>set('maxTasksPerDay',Number(e.target.value))}/></div>
          <div className="form-group"><label className="form-label">Intern task count (free trial)</label><input className="form-input" type="number" min={1} value={settings.internTaskCount} onChange={e=>set('internTaskCount',Number(e.target.value))}/></div>
          <div className="form-group"><label className="form-label">Min quality score (%)</label><input className="form-input" type="number" min={0} max={100} value={settings.minQualityScore||80} onChange={e=>set('minQualityScore',Number(e.target.value))}/></div>
        </div>
        {/* Payment methods */}
        <div className="card"><h3 style={{marginBottom:16}}><i className="ti ti-credit-card" style={{marginRight:8}}/>Deposit methods</h3>
          {[{k:'telebirr',l:'Telebirr',s:'Ethiopian mobile money'},{k:'cbeBirr',l:'CBE Birr',s:'CBE mobile wallet'},{k:'bankTransfer',l:'Bank transfer',s:'Direct bank account'}].map(m=>(
            <div key={m.k} className="settings-row"><div><div className="settings-row-label">{m.l}</div><div className="settings-row-sub">{m.s}</div></div>
            <label className="toggle"><input type="checkbox" checked={settings.withdrawalMethods?.[m.k]??true} onChange={e=>setN('withdrawalMethods',m.k,e.target.checked)}/><span className="toggle-slider"/></label></div>
          ))}
        </div>
      </div>
      <div style={{marginTop:24,display:'flex',justifyContent:'flex-end',gap:12}}>
        <button className="btn btn-ghost" onClick={()=>window.location.reload()}>Reset</button>
        <button className="btn btn-primary" style={{padding:'10px 28px',fontSize:14}} onClick={save} disabled={saving}>{saving?'Saving…':<><i className="ti ti-device-floppy"/> Save all settings</>}</button>
      </div>
    </Layout>
  );
}

// ── COMMISSIONS ──────────────────────────────────────────────────────────────
export function Commissions() {
  const [summary, setSummary] = useState(null);
  const [txs, setTxs] = useState([]); const [total, setTotal] = useState(0); const [page, setPage] = useState(1);
  const [search, setSearch] = useState(''); const [tierFilter, setTier] = useState('');
  const [startDate, setStart] = useState(''); const [endDate, setEnd] = useState('');
  const [txLoading, setTxLoad] = useState(true);
  const [rules, setRules] = useState([]); const [rulesSaving, setSaving] = useState(false); const [rulesMsg, setRulesMsg] = useState(null);
  const [tab, setTab] = useState('transactions');

  useEffect(() => { api.get('/admin/commissions/summary').then(r => setSummary(r.data)).catch(console.error); }, []);

  const loadTxs = useCallback(() => {
    setTxLoad(true);
    api.get('/admin/commissions', { params:{ page, limit:20, search:search||undefined, tier:tierFilter||undefined, startDate:startDate||undefined, endDate:endDate||undefined } })
      .then(r => { setTxs(r.data.data); setTotal(r.data.total); }).catch(console.error).finally(() => setTxLoad(false));
  }, [page, search, tierFilter, startDate, endDate]);
  useEffect(() => { loadTxs(); }, [loadTxs]);

  useEffect(() => {
    if (tab !== 'rates') return;
    api.get('/admin/level-rules').then(r => setRules(r.data.data)).catch(console.error);
  }, [tab]);

  const setRule = (level, key, val) => setRules(prev => prev.map(r => r.level === level ? {...r, [key]: val} : r));
  const saveRule = async (level) => {
    const rule = rules.find(r => r.level === level); setSaving(true); setRulesMsg(null);
    try { await api.patch(`/admin/level-rules/${level}`, { referralCommission: rule.referralCommission, teamBonusPercent: rule.teamBonusPercent }); setRulesMsg({type:'success', text:`${level} rates saved!`}); }
    catch(e) { setRulesMsg({type:'error', text: e.response?.data?.message||'Failed to save.'}); } finally { setSaving(false); }
  };
  const LEVEL_COLORS = {intern:'#6B7280',job1:'#10B981',job2:'#3B82F6',job3:'#8B5CF6',job4:'#F59E0B',job5:'#EF4444',job6:'#EC4899',job7:'#14B8A6',job8:'#F97316',job9:'#6366F1',job10:'#D97706'};
  const fmt = n => (n||0).toLocaleString() + ' ETB';
  return (
    <Layout title="Commission management" subtitle="Referral bonuses, tier payouts, and commission rates">
      {summary && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[{label:'Total paid out',value:fmt(summary.overall?.totalPaid),sub:`${summary.overall?.count||0} transactions`},{label:'This month',value:fmt(summary.monthly?.total),sub:`${summary.monthly?.count||0} this month`},{label:'Tier A (referral)',value:fmt(summary.overall?.tierA),sub:'First task commissions'},{label:'Tier B (team)',value:fmt(summary.overall?.tierB),sub:'Ongoing team bonuses'}].map(c=>(
            <div key={c.label} style={{background:'var(--bg-2)',borderRadius:10,padding:'14px 16px'}}>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:4}}>{c.label}</div>
              <div style={{fontSize:18,fontWeight:700,color:'var(--text-1)'}}>{c.value}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>{c.sub}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {[{k:'transactions',l:'Transactions'},{k:'earners',l:'Top earners'},{k:'rates',l:'Commission rates'}].map(t=>(
          <button key={t.k} className={`btn ${tab===t.k?'btn-primary':'btn-ghost'}`} onClick={()=>setTab(t.k)}>{t.l}</button>
        ))}
      </div>
      {tab==='transactions'&&(
        <div className="table-wrap">
          <div className="table-head"><h3>Referral bonus transactions ({total})</h3>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <input className="filter-input" placeholder="Search name or email..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} style={{width:200}}/>
              <select className="filter-select" value={tierFilter} onChange={e=>{setTier(e.target.value);setPage(1);}}>
                <option value="">All tiers</option><option value="A">Tier A only</option><option value="B">Tier B only</option>
              </select>
              <input type="date" className="filter-select" value={startDate} onChange={e=>{setStart(e.target.value);setPage(1);}}/>
              <input type="date" className="filter-select" value={endDate} onChange={e=>{setEnd(e.target.value);setPage(1);}}/>
            </div>
          </div>
          {txLoading?<div style={{padding:32,textAlign:'center',color:'var(--text-3)'}}>Loading...</div>:txs.length===0?<EmptyState icon="x" title="No commission transactions found"/>:(
            <table className="data-table">
              <thead><tr><th>Date</th><th>Tier</th><th>Referrer</th><th>Worker</th><th>Description</th><th>Amount</th></tr></thead>
              <tbody>{txs.map(tx=>(
                <tr key={tx._id}>
                  <td style={{fontSize:12,color:'var(--text-3)',whiteSpace:'nowrap'}}>{new Date(tx.createdAt).toLocaleString('en-ET',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</td>
                  <td><span className={`badge ${tx.tier==='A'?'badge-purple':'badge-blue'}`} style={{fontSize:10}}>Tier {tx.tier}</span></td>
                  <td><div style={{fontWeight:500}}>{tx.referrer?.name||'--'}</div><div style={{fontSize:11,color:'var(--text-3)'}}>{tx.referrer?.referralCode}</div></td>
                  <td><div style={{fontWeight:500}}>{tx.worker?.name||'--'}</div><div style={{fontSize:11,color:'var(--text-3)'}}>{tx.worker?.email}</div></td>
                  <td style={{fontSize:12,color:'var(--text-2)',maxWidth:200}}>{tx.description}</td>
                  <td style={{fontWeight:700,color:'var(--green)',whiteSpace:'nowrap'}}>+{(tx.amountETB||0).toLocaleString()} ETB</td>
                </tr>
              ))}</tbody>
            </table>
          )}
          <Pagination page={page} pages={Math.ceil(total/20)} total={total} onPage={setPage}/>
        </div>
      )}
      {tab==='earners'&&(
        <div className="table-wrap">
          <div className="table-head"><h3>Top commission earners</h3></div>
          {!summary?.topEarners?.length?<EmptyState icon="x" title="No data yet"/>:(
            <table className="data-table">
              <thead><tr><th>Rank</th><th>Referrer</th><th>Referral code</th><th>Total earned</th></tr></thead>
              <tbody>{summary.topEarners.map((e,i)=>(
                <tr key={e._id}>
                  <td style={{fontWeight:700,fontSize:16,color:i===0?'#F59E0B':i===1?'#9CA3AF':i===2?'#D97706':'var(--text-3)'}}>#{i+1}</td>
                  <td><div style={{fontWeight:500}}>{e.user?.name}</div><div style={{fontSize:11,color:'var(--text-3)'}}>{e.user?.email}</div></td>
                  <td><code style={{fontSize:12,background:'#F3F4F6',padding:'2px 8px',borderRadius:4}}>{e.user?.referralCode}</code></td>
                  <td style={{fontWeight:700,color:'var(--green)',fontSize:15}}>{(e.earned||0).toLocaleString()} ETB</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}
      {tab==='rates'&&(
        <div>
          {rulesMsg&&<Alert type={rulesMsg.type}>{rulesMsg.text}</Alert>}
          <p style={{fontSize:13,color:'var(--text-2)',marginBottom:16}}><strong>Tier A</strong> = percentage of referred worker first completed task paid to referrer. <strong>Tier B</strong> = percentage of every task the referred worker completes paid to their referrer.</p>
          {rules.length===0?<div style={{padding:32,textAlign:'center',color:'var(--text-3)'}}>Loading...</div>:(
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Level</th><th>Tier A - referral %</th><th>Tier B - team bonus %</th><th></th></tr></thead>
                <tbody>{rules.map(r=>(
                  <tr key={r.level}>
                    <td><span style={{background:LEVEL_COLORS[r.level]+'22',color:LEVEL_COLORS[r.level],fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:8,textTransform:'uppercase'}}>{r.level}</span></td>
                    <td><input type="number" min={0} max={100} step={0.5} value={r.referralCommission||0} onChange={e=>setRule(r.level,'referralCommission',Number(e.target.value))} style={{width:90,padding:'6px 8px',border:'1px solid var(--border)',borderRadius:6,fontSize:13,fontFamily:'inherit'}}/><span style={{fontSize:12,color:'var(--text-3)',marginLeft:6}}>%</span></td>
                    <td><input type="number" min={0} max={100} step={0.1} value={r.teamBonusPercent||0} onChange={e=>setRule(r.level,'teamBonusPercent',Number(e.target.value))} style={{width:90,padding:'6px 8px',border:'1px solid var(--border)',borderRadius:6,fontSize:13,fontFamily:'inherit'}}/><span style={{fontSize:12,color:'var(--text-3)',marginLeft:6}}>%</span></td>
                    <td><button className="btn btn-primary" style={{fontSize:12,padding:'5px 14px'}} onClick={()=>saveRule(r.level)} disabled={rulesSaving}>Save</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}

// ── DIGITAL EQUB ─────────────────────────────────────────────────────────────
const STATUS_BADGE_EQ = { open:'badge-blue', active:'badge-green', completed:'badge-gray', cancelled:'badge-red' };
const TYPE_BADGE_EQ   = { rotation:'badge-purple', lottery:'badge-amber' };
const SCHEDULE_LABEL  = { daily:'Daily', weekly:'Weekly', monthly:'Monthly' };

function EqubFormModal({ equb, onClose, onSaved }) {
  const [form, setForm] = useState(equb ? {
    name: equb.name, description: equb.description||'', type: equb.type,
    contributionETB: equb.contributionETB, maxMembers: equb.maxMembers,
    schedule: equb.schedule, contributionMode: equb.contributionMode,
    payoutMethod: equb.payoutMethod, missedPolicy: equb.missedPolicy, penaltyETB: equb.penaltyETB||0,
  } : {
    name:'', description:'', type:'rotation', contributionETB:100, maxMembers:10,
    schedule:'monthly', contributionMode:'both', payoutMethod:'wallet', missedPolicy:'penalize', penaltyETB:0,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const save = async () => {
    if (!form.name) return setErr('Name is required.');
    setLoading(true); setErr('');
    try {
      if (equb?._id) await api.patch(`/admin/equb/${equb._id}`, form);
      else           await api.post('/admin/equb', form);
      onSaved();
    } catch(e) { setErr(e.response?.data?.error||'Failed to save.'); }
    finally { setLoading(false); }
  };
  return (
    <Modal title={equb?'Edit Equb':'Create new Equb'} onClose={onClose} maxWidth={560}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={loading}>{loading?'Saving...':'Save'}</button></>}>
      {err&&<Alert type="error">{err}</Alert>}
      <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. GigWork Monthly Equb"/></div>
      <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={2} value={form.description} onChange={e=>set('description',e.target.value)}/></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div className="form-group"><label className="form-label">Type</label>
          <select className="form-select" value={form.type} onChange={e=>set('type',e.target.value)}>
            <option value="rotation">Rotation</option><option value="lottery">Lottery</option>
          </select></div>
        <div className="form-group"><label className="form-label">Schedule</label>
          <select className="form-select" value={form.schedule} onChange={e=>set('schedule',e.target.value)}>
            <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
          </select></div>
        <div className="form-group"><label className="form-label">Contribution (ETB)</label><input className="form-input" type="number" min={10} value={form.contributionETB} onChange={e=>set('contributionETB',Number(e.target.value))}/></div>
        <div className="form-group"><label className="form-label">Max members</label><input className="form-input" type="number" min={2} max={200} value={form.maxMembers} onChange={e=>set('maxMembers',Number(e.target.value))}/></div>
        <div className="form-group"><label className="form-label">Contribution mode</label>
          <select className="form-select" value={form.contributionMode} onChange={e=>set('contributionMode',e.target.value)}>
            <option value="auto">Auto</option><option value="manual">Manual</option><option value="both">Both</option>
          </select></div>
        <div className="form-group"><label className="form-label">Payout method</label>
          <select className="form-select" value={form.payoutMethod} onChange={e=>set('payoutMethod',e.target.value)}>
            <option value="wallet">Wallet</option><option value="bank">Bank</option><option value="both">Both</option>
          </select></div>
        <div className="form-group"><label className="form-label">Missed policy</label>
          <select className="form-select" value={form.missedPolicy} onChange={e=>set('missedPolicy',e.target.value)}>
            <option value="penalize">Penalize</option><option value="kick">Kick</option><option value="replace">Replace</option>
          </select></div>
        <div className="form-group"><label className="form-label">Penalty (ETB)</label><input className="form-input" type="number" min={0} value={form.penaltyETB} onChange={e=>set('penaltyETB',Number(e.target.value))}/></div>
      </div>
      <div style={{background:'#F0FDF4',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#065F46',marginTop:4}}>
        Pot per round: <strong>{(form.contributionETB*form.maxMembers).toLocaleString()} ETB</strong>
      </div>
    </Modal>
  );
}

function EqubDetailModal({ equb, onClose, onRefresh }) {
  const [detail, setDetail] = useState(null);
  const [tab, setTab]       = useState('members');
  const [msg, setMsg]       = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(()=>{ api.get(`/admin/equb/${equb._id}`).then(r=>setDetail(r.data)).catch(console.error); },[equb._id]);
  const action = async(fn, txt) => { setLoading(true);setMsg(null); try{ await fn(); setMsg({type:'success',text:txt}); onRefresh(); }catch(e){setMsg({type:'error',text:e.response?.data?.error||'Failed.'});} finally{setLoading(false);}};
  const start      = ()=>action(()=>api.post(`/admin/equb/${equb._id}/start`),'Equb started!');
  const forceRound = ()=>action(()=>api.post(`/admin/equb/${equb._id}/force-round`),'Round forced!');
  const cancel     = ()=>{ if(window.confirm('Cancel this Equb?')) action(()=>api.delete(`/admin/equb/${equb._id}`),'Cancelled.'); };
  const kick=(uid,name)=>{ if(window.confirm(`Kick ${name}?`)) action(()=>api.post(`/admin/equb/${equb._id}/kick/${uid}`),`${name} kicked.`); };
  const activeMembers = detail?.equb.members.filter(m=>m.status==='active')||[];
  const rounds        = detail?.rounds||[];
  return (
    <Modal title={equb.name} onClose={onClose} maxWidth={700}
      footer={<div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <button className="btn btn-ghost" onClick={onClose}>Close</button>
        {equb.status==='open'   &&<button className="btn btn-primary" onClick={start} disabled={loading}>Start Equb</button>}
        {equb.status==='active' &&<button className="btn btn-primary" onClick={forceRound} disabled={loading}>Force round</button>}
        {['open','active'].includes(equb.status)&&<button className="btn btn-danger" onClick={cancel} disabled={loading}>Cancel</button>}
      </div>}>
      {msg&&<Alert type={msg.type}>{msg.text}</Alert>}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
        {[{label:'Members',value:`${activeMembers.length}/${equb.maxMembers}`},{label:'Round',value:`${equb.currentRound}/${equb.totalRounds||'inf'}`},{label:'Pot/round',value:`${(equb.contributionETB*activeMembers.length).toLocaleString()} ETB`},{label:'Total paid',value:`${(equb.totalPayoutETB||0).toLocaleString()} ETB`}].map(s=>(
          <div key={s.label} style={{background:'#F9FAFB',borderRadius:8,padding:'10px 12px'}}>
            <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>{s.label}</div>
            <div style={{fontSize:15,fontWeight:700}}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {[{k:'members',l:'Members'},{k:'rounds',l:'Rounds'},{k:'transactions',l:'Transactions'}].map(t=>(
          <button key={t.k} className={`btn ${tab===t.k?'btn-primary':'btn-ghost'}`} style={{fontSize:12,padding:'6px 14px'}} onClick={()=>setTab(t.k)}>{t.l}</button>
        ))}
      </div>
      {tab==='members'&&(!detail?<div style={{textAlign:'center',padding:32,color:'var(--text-3)'}}>Loading...</div>:(
        <table className="data-table">
          <thead><tr><th>#</th><th>Member</th><th>Status</th><th>Won</th><th></th></tr></thead>
          <tbody>{detail.equb.members.map((m,i)=>(
            <tr key={i}>
              <td style={{color:'var(--text-3)',fontWeight:600}}>{m.order}</td>
              <td><div style={{fontWeight:500}}>{m.user?.name||'--'}</div><div style={{fontSize:11,color:'var(--text-3)'}}>{m.user?.email}</div></td>
              <td><span className={`badge ${m.status==='active'?'badge-green':m.status==='kicked'?'badge-red':'badge-gray'}`}>{m.status}</span></td>
              <td>{m.hasWon?<span className="badge badge-purple">Won</span>:<span style={{color:'var(--text-3)',fontSize:12}}>--</span>}</td>
              <td>{m.status==='active'&&equb.status==='active'&&<button className="btn btn-danger" style={{fontSize:11,padding:'3px 8px'}} onClick={()=>kick(m.user?._id,m.user?.name)}>Kick</button>}</td>
            </tr>
          ))}</tbody>
        </table>
      ))}
      {tab==='rounds'&&(!rounds.length?<EmptyState icon="x" title="No rounds yet"/>:(
        <table className="data-table">
          <thead><tr><th>Round</th><th>Winner</th><th>Pot</th><th>Due</th><th>Status</th></tr></thead>
          <tbody>{rounds.map(r=>(
            <tr key={r._id}>
              <td style={{fontWeight:700}}>#{r.roundNumber}</td>
              <td>{r.winner?.name||<span style={{color:'var(--text-3)'}}>TBD</span>}</td>
              <td style={{fontWeight:600,color:'var(--green)'}}>{(r.potETB||0).toLocaleString()} ETB</td>
              <td style={{fontSize:12,color:'var(--text-3)'}}>{new Date(r.dueDate).toLocaleDateString()}</td>
              <td><span className={`badge ${r.status==='completed'?'badge-green':r.status==='collecting'?'badge-blue':'badge-gray'}`}>{r.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
      ))}
      {tab==='transactions'&&(!detail?.transactions?.length?<EmptyState icon="x" title="No transactions yet"/>:(
        <table className="data-table">
          <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Date</th></tr></thead>
          <tbody>{detail.transactions.map(tx=>(
            <tr key={tx._id}>
              <td style={{fontWeight:500}}>{tx.user?.name||'--'}</td>
              <td><span className={`badge ${tx.type==='payout'?'badge-green':tx.type==='penalty'?'badge-red':'badge-blue'}`} style={{fontSize:10}}>{tx.type}</span></td>
              <td style={{fontWeight:700,color:tx.type==='payout'?'var(--green)':tx.type==='penalty'?'var(--red)':'var(--text)'}}>{tx.type==='contribution'||tx.type==='penalty'?'-':'+'}{tx.amountETB.toLocaleString()} ETB</td>
              <td style={{fontSize:12,color:'var(--text-3)'}}>{new Date(tx.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}</tbody>
        </table>
      ))}
    </Modal>
  );
}

export function DigitalEqub() {
  const [items,setItems]=useState([]); const [total,setTotal]=useState(0); const [summary,setSummary]=useState(null);
  const [page,setPage]=useState(1); const [statusFilter,setStatus]=useState(''); const [typeFilter,setType]=useState('');
  const [loading,setLoading]=useState(true); const [msg,setMsg]=useState(null);
  const [showCreate,setShowCreate]=useState(false); const [selected,setSelected]=useState(null);
  const load=useCallback(()=>{ setLoading(true); api.get('/admin/equb',{params:{page,limit:20,status:statusFilter||undefined,type:typeFilter||undefined}}).then(r=>{setItems(r.data.equbs);setTotal(r.data.total);setSummary(r.data.summary);}).catch(console.error).finally(()=>setLoading(false)); },[page,statusFilter,typeFilter]);
  useEffect(()=>{load();},[load]);
  return (
    <Layout title="Digital Equb" subtitle="Manage rotating savings groups">
      {msg&&<Alert type={msg.type}>{msg.text}</Alert>}
      {summary&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[{label:'Total groups',value:summary.totalGroups},{label:'Active groups',value:summary.activeGroups},{label:'Total pot (ETB)',value:(summary.totalPotETB||0).toLocaleString()},{label:'Total paid out',value:(summary.totalPayoutETB||0).toLocaleString()+' ETB'}].map(c=>(
            <div key={c.label} style={{background:'var(--bg-2)',borderRadius:10,padding:'14px 16px'}}>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:4}}>{c.label}</div>
              <div style={{fontSize:20,fontWeight:700}}>{c.value}</div>
            </div>
          ))}
        </div>
      )}
      <div className="table-wrap">
        <div className="table-head"><h3>Equb groups ({total})</h3>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <select className="filter-select" value={statusFilter} onChange={e=>{setStatus(e.target.value);setPage(1);}}>
              <option value="">All status</option><option value="open">Open</option><option value="active">Active</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
            </select>
            <select className="filter-select" value={typeFilter} onChange={e=>{setType(e.target.value);setPage(1);}}>
              <option value="">All types</option><option value="rotation">Rotation</option><option value="lottery">Lottery</option>
            </select>
            <button className="btn btn-primary" onClick={()=>setShowCreate(true)}><i className="ti ti-plus"/> New Equb</button>
          </div>
        </div>
        {loading?<div style={{padding:32,textAlign:'center',color:'var(--text-3)'}}>Loading...</div>:items.length===0?<EmptyState icon="x" title="No Equb groups yet"/>:(
          <table className="data-table">
            <thead><tr><th>Name</th><th>Type</th><th>Schedule</th><th>Members</th><th>Contribution</th><th>Pot/round</th><th>Round</th><th>Status</th><th>Next round</th><th></th></tr></thead>
            <tbody>{items.map(eq=>{
              const activeMembers=eq.members?.filter(m=>m.status==='active').length||0;
              return (
                <tr key={eq._id}>
                  <td><div style={{fontWeight:600}}>{eq.name}</div><div style={{fontSize:11,color:'var(--text-3)'}}>by {eq.createdBy?.name}</div></td>
                  <td><span className={`badge ${TYPE_BADGE_EQ[eq.type]}`} style={{fontSize:10}}>{eq.type}</span></td>
                  <td style={{fontSize:13}}>{SCHEDULE_LABEL[eq.schedule]}</td>
                  <td style={{fontWeight:600}}>{activeMembers}/{eq.maxMembers}</td>
                  <td style={{fontWeight:600}}>{eq.contributionETB.toLocaleString()} ETB</td>
                  <td style={{fontWeight:700,color:'var(--green)'}}>{(eq.contributionETB*activeMembers).toLocaleString()} ETB</td>
                  <td style={{fontWeight:600}}>{eq.currentRound}/{eq.totalRounds||'inf'}</td>
                  <td><span className={`badge ${STATUS_BADGE_EQ[eq.status]}`}>{eq.status}</span></td>
                  <td style={{fontSize:12,color:'var(--text-3)'}}>{eq.nextRoundDate?new Date(eq.nextRoundDate).toLocaleDateString():'--'}</td>
                  <td><button className="btn btn-ghost" style={{fontSize:12,padding:'5px 12px'}} onClick={()=>setSelected(eq)}>Manage</button></td>
                </tr>
              );
            })}</tbody>
          </table>
        )}
        <Pagination page={page} pages={Math.ceil(total/20)} total={total} onPage={setPage}/>
      </div>
      {showCreate&&<EqubFormModal onClose={()=>setShowCreate(false)} onSaved={()=>{setShowCreate(false);load();setMsg({type:'success',text:'Equb created!'});}}/>}
      {selected&&<EqubDetailModal equb={selected} onClose={()=>setSelected(null)} onRefresh={load}/>}
    </Layout>
  );
}
