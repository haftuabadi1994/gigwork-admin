import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { Pagination, Modal, Alert, EmptyState } from '../components/UI';
import api from '../utils/api';

const CATS = ['Video Rating','Writing','Data Entry','Survey','Delivery','Translation','Social Engagement','Content Creation','Lead Generation','Other'];
const LEVELS = ['intern','job1','job2','job3','job4','job5','job6','job7','job8','job9','job10'];
const BADGE_COLORS = { 'Video Rating':'badge-green','Writing':'badge-blue','Data Entry':'badge-gray','Survey':'badge-amber','Delivery':'badge-green','Translation':'badge-blue','Social Engagement':'badge-amber','Other':'badge-gray' };

const emptyTask = { title:'', description:'', category:'Video Rating', requirements:[''], earningETB:50, estimatedMinutes:15, totalSlots:100, isActive:true, minLevel:'intern', workDepositETB:0, trailerVideoUrl:'', trailerPlatform:'youtube' };

function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(task ? { ...task, requirements: task.requirements?.length ? task.requirements : [''] } : { ...emptyTask });
  const [msg, setMsg]   = useState(null);
  const [loading, setLoading] = useState(false);

  const addReq = () => setForm(f => ({ ...f, requirements:[...f.requirements,''] }));
  const setReq = (i,v) => setForm(f => { const r=[...f.requirements]; r[i]=v; return {...f,requirements:r}; });
  const delReq = (i) => setForm(f => ({ ...f, requirements:f.requirements.filter((_,j)=>j!==i) }));

  const save = async () => {
    setLoading(true); setMsg(null);
    try {
      if (task?._id) await api.patch(`/admin/tasks/${task._id}`, form);
      else await api.post('/admin/tasks', form);
      onSave(); onClose();
    } catch (e) { setMsg({ type:'error', text: e.response?.data?.message||'Error' }); }
    finally { setLoading(false); }
  };

  return (
    <Modal title={task ? 'Edit task' : 'Create new task'} onClose={onClose} maxWidth={640}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={loading||!form.title}>{loading?'Saving…':task?'Save changes':'Create task'}</button></>}>
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}
      <div className="form-group"><label className="form-label">Task title</label><input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} /></div>
      <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} /></div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
        <div className="form-group"><label className="form-label">Category</label>
          <select className="form-select" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="form-group"><label className="form-label">Earning (ETB)</label><input className="form-input" type="number" min={1} value={form.earningETB} onChange={e=>setForm(f=>({...f,earningETB:Number(e.target.value)}))} /></div>
        <div className="form-group"><label className="form-label">Est. minutes</label><input className="form-input" type="number" min={1} value={form.estimatedMinutes} onChange={e=>setForm(f=>({...f,estimatedMinutes:Number(e.target.value)}))} /></div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
        <div className="form-group"><label className="form-label">Total slots</label><input className="form-input" type="number" min={1} value={form.totalSlots} onChange={e=>setForm(f=>({...f,totalSlots:Number(e.target.value)}))} /></div>
        <div className="form-group"><label className="form-label">Work deposit (ETB)</label><input className="form-input" type="number" min={0} value={form.workDepositETB} onChange={e=>setForm(f=>({...f,workDepositETB:Number(e.target.value)}))} /></div>
        <div className="form-group"><label className="form-label">Min level</label>
          <select className="form-select" value={form.minLevel} onChange={e=>setForm(f=>({...f,minLevel:e.target.value}))}>{LEVELS.map(l=><option key={l} value={l}>{l.toUpperCase()}</option>)}</select></div>
      </div>
      {/* Trailer video */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div className="form-group"><label className="form-label">Trailer video URL (optional)</label><input className="form-input" placeholder="https://youtube.com/watch?v=..." value={form.trailerVideoUrl} onChange={e=>setForm(f=>({...f,trailerVideoUrl:e.target.value}))} /></div>
        <div className="form-group"><label className="form-label">Platform</label>
          <select className="form-select" value={form.trailerPlatform||'youtube'} onChange={e=>setForm(f=>({...f,trailerPlatform:e.target.value}))}>
            <option value="youtube">YouTube</option><option value="tiktok">TikTok</option><option value="instagram">Instagram</option><option value="other">Other</option>
          </select></div>
      </div>
      {/* Requirements */}
      <div className="form-group">
        <label className="form-label" style={{ marginBottom:8 }}>Requirements</label>
        {form.requirements.map((r,i) => (
          <div key={i} style={{ display:'flex', gap:8, marginBottom:8 }}>
            <input className="form-input" value={r} onChange={e=>setReq(i,e.target.value)} placeholder={`Requirement ${i+1}`} />
            <button className="btn btn-danger" style={{ padding:'8px 10px', flexShrink:0 }} onClick={()=>delReq(i)}><i className="ti ti-trash" /></button>
          </div>
        ))}
        <button className="btn btn-ghost" style={{ fontSize:12 }} onClick={addReq}><i className="ti ti-plus" /> Add requirement</button>
      </div>
      {/* Active toggle */}
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <label className="toggle"><input type="checkbox" checked={form.isActive} onChange={e=>setForm(f=>({...f,isActive:e.target.checked}))} /><span className="toggle-slider" /></label>
        <span style={{ fontSize:13, color:'var(--text-2)' }}>Task is active (visible to workers)</span>
      </div>
    </Modal>
  );
}

function SubmissionsModal({ task, onClose }) {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]   = useState(null);

  useEffect(() => {
    api.get(`/admin/tasks/${task._id}/submissions`)
      .then(r => setSubs(r.data.submissions)).finally(() => setLoading(false));
  }, [task._id]);

  const review = async (assignmentId, action) => {
    const note = action==='reject' ? window.prompt('Rejection reason (optional):') || '' : '';
    try {
      await api.patch(`/admin/submissions/${assignmentId}/review`, { action, reviewNote:note });
      setMsg({ type:'success', text:`Submission ${action}d!` });
      const r = await api.get(`/admin/tasks/${task._id}/submissions`);
      setSubs(r.data.submissions);
    } catch (e) { setMsg({ type:'error', text:'Error.' }); }
  };

  const STATUS_BADGE = { submitted:'badge-amber', completed:'badge-green', rejected:'badge-red', in_progress:'badge-blue' };

  return (
    <Modal title={`Submissions — ${task.title}`} onClose={onClose} maxWidth={720}
      footer={<button className="btn btn-ghost" onClick={onClose}>Close</button>}>
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}
      {loading ? <div style={{ padding:32, textAlign:'center', color:'var(--text-3)' }}>Loading…</div> : subs.length===0 ? <EmptyState icon="📋" title="No submissions yet" /> : (
        <table className="data-table">
          <thead><tr><th>Worker</th><th>Status</th><th>Note</th><th>Submitted</th><th>Actions</th></tr></thead>
          <tbody>
            {subs.map(s => (
              <tr key={s._id}>
                <td><div style={{ fontWeight:500 }}>{s.user?.name}</div><div style={{ fontSize:11, color:'var(--text-3)' }}>{s.user?.email}</div></td>
                <td><span className={`badge ${STATUS_BADGE[s.status]||'badge-gray'}`}>{s.status.replace('_',' ')}</span></td>
                <td style={{ fontSize:12, color:'var(--text-3)', maxWidth:180 }}>{s.submissionNote?.slice(0,60)||'—'}</td>
                <td style={{ fontSize:12, color:'var(--text-3)' }}>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}</td>
                <td>
                  {s.status==='submitted' && (
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-primary" style={{ padding:'4px 10px', fontSize:11 }} onClick={() => review(s._id,'approve')}>✓ Approve</button>
                      <button className="btn btn-danger" style={{ padding:'4px 10px', fontSize:11 }} onClick={() => review(s._id,'reject')}>✗ Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
}

export default function Tasks() {
  const [tasks, setTasks]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [editTask, setEditTask]   = useState(null);
  const [subTask, setSubTask]     = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading]     = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/admin/tasks', { params:{ page, limit:15, search, category:catFilter } })
      .then(r => { setTasks(r.data.tasks); setTotal(r.data.total); })
      .catch(console.error).finally(() => setLoading(false));
  }, [page, search, catFilter]);

  useEffect(() => { load(); }, [load]);

  const deleteTask = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    await api.delete(`/admin/tasks/${id}`); load();
  };

  const toggleActive = async (task) => {
    await api.patch(`/admin/tasks/${task._id}`, { isActive:!task.isActive }); load();
  };

  return (
    <Layout title="Task management" subtitle="Create, edit and review all platform tasks">
      <div className="table-wrap">
        <div className="table-head">
          <h3>All tasks <span style={{ color:'var(--text-3)', fontWeight:400 }}>({total})</span></h3>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            <input className="filter-input" placeholder="Search tasks…" value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }} style={{ width:180 }} />
            <select className="filter-select" value={catFilter} onChange={e=>{ setCatFilter(e.target.value); setPage(1); }}>
              <option value="">All categories</option>{CATS.map(c=><option key={c}>{c}</option>)}
            </select>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}><i className="ti ti-plus" /> New task</button>
          </div>
        </div>
        {loading ? <div style={{ padding:32, textAlign:'center', color:'var(--text-3)' }}>Loading…</div> : (
          <table className="data-table">
            <thead><tr><th>Title</th><th>Category</th><th>Earning</th><th>Slots</th><th>Level</th><th>Video</th><th>Active</th><th>Actions</th></tr></thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t._id}>
                  <td><div style={{ fontWeight:500 }}>{t.title}</div><div style={{ fontSize:11, color:'var(--text-3)' }}>~{t.estimatedMinutes}m · {t.filledSlots}/{t.totalSlots} filled</div></td>
                  <td><span className={`badge ${BADGE_COLORS[t.category]||'badge-gray'}`} style={{ fontSize:10 }}>{t.category}</span></td>
                  <td style={{ fontWeight:600, color:'var(--green)' }}>{t.earningETB} ETB</td>
                  <td>{t.totalSlots-t.filledSlots} left</td>
                  <td><span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', color:'var(--text-3)' }}>{t.minLevel}</span></td>
                  <td>{t.trailerVideoUrl ? <span className="badge badge-blue" style={{ fontSize:10 }}>🎬 {t.trailerPlatform}</span> : <span style={{ color:'var(--text-3)', fontSize:12 }}>—</span>}</td>
                  <td><label className="toggle"><input type="checkbox" checked={t.isActive} onChange={()=>toggleActive(t)}/><span className="toggle-slider"/></label></td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-ghost" style={{ padding:'4px 8px', fontSize:12 }} title="Submissions" onClick={()=>setSubTask(t)}><i className="ti ti-list-check" /></button>
                      <button className="btn btn-ghost" style={{ padding:'4px 8px', fontSize:12 }} onClick={()=>setEditTask(t)}><i className="ti ti-edit" /></button>
                      <button className="btn btn-danger" style={{ padding:'4px 8px', fontSize:12 }} onClick={()=>deleteTask(t._id,t.title)}><i className="ti ti-trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={page} pages={Math.ceil(total/15)} total={total} onPage={setPage} />
      </div>
      {(showCreate||editTask) && <TaskModal task={editTask} onClose={()=>{ setShowCreate(false); setEditTask(null); }} onSave={load} />}
      {subTask && <SubmissionsModal task={subTask} onClose={()=>setSubTask(null)} />}
    </Layout>
  );
}
