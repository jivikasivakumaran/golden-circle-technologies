/**
 * routes/admin.js
 * Admin dashboard — view, filter, update and delete contact submissions
 */
const express = require('express');
const router  = express.Router();
const adminAuth = require('../middleware/auth');
const { stmts } = require('../database');

router.use(adminAuth);

// Helper to render status badge
function badge(s) {
  const colors = { new:'#D4A827', read:'#4a8a6a', replied:'#3a6a9a', archived:'#5a5a5a' };
  return `<span style="background:${colors[s]||'#555'};color:#fff;padding:3px 10px;border-radius:20px;font-size:11px;letter-spacing:.05em;text-transform:uppercase;">${s}</span>`;
}

// Dashboard
router.get('/', (req, res) => {
  const contacts = stmts.getAll.all();
  const total    = stmts.count.get().total;
  const byStatus = stmts.countByStatus.all();
  const stats    = Object.fromEntries(byStatus.map(r => [r.status, r.count]));

  const rows = contacts.map(c => `
    <tr onclick="window.location='/admin/${c.id}'" style="cursor:pointer;">
      <td>${c.id}</td>
      <td><strong>${c.first_name} ${c.last_name}</strong></td>
      <td><a href="mailto:${c.email}" style="color:var(--gold)">${c.email}</a></td>
      <td>${c.phone||'—'}</td>
      <td>${c.service||'—'}</td>
      <td>${badge(c.status)}</td>
      <td style="color:#7a7060;font-size:12px;">${c.created_at}</td>
    </tr>`).join('');

  res.send(`<!DOCTYPE html><html lang="en"><head>
  <meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>GC Admin – Contacts</title>
  <style>
  :root{--gold:#D4A827;--black:#080808;--dark:#0f0f0f;--card:#141414;--border:rgba(212,168,39,0.18);--text:#e8e2d5;--muted:#7a7060;}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:var(--black);color:var(--text);font-family:'Segoe UI',sans-serif;font-size:14px;}
  header{background:var(--dark);border-bottom:1px solid var(--border);padding:18px 36px;display:flex;align-items:center;justify-content:space-between;}
  header h1{color:var(--gold);font-size:20px;font-weight:400;letter-spacing:.05em;}
  header span{color:var(--muted);font-size:12px;}
  .stats{display:flex;gap:2px;padding:24px 36px;}
  .stat{background:var(--card);padding:20px 28px;flex:1;border-left:3px solid var(--border);}
  .stat.new{border-color:var(--gold);}
  .stat h3{font-size:32px;font-weight:400;color:var(--gold);}
  .stat p{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-top:4px;}
  .content{padding:0 36px 36px;}
  table{width:100%;border-collapse:collapse;}
  th{text-align:left;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);padding:12px 16px;border-bottom:1px solid var(--border);}
  td{padding:14px 16px;border-bottom:1px solid rgba(212,168,39,0.07);}
  tr:hover td{background:rgba(212,168,39,0.04);}
  a{color:inherit;text-decoration:none;}
  .logout{color:var(--muted);font-size:12px;text-decoration:none;padding:6px 14px;border:1px solid var(--border);border-radius:2px;}
  .logout:hover{border-color:var(--gold);color:var(--gold);}
  </style></head>
  <body>
  <header>
    <h1>⬡ GoldenCircle Admin</h1>
    <div style="display:flex;align-items:center;gap:16px;">
      <span>${total} total submissions</span>
      <a class="logout" href="/admin/logout">Logout</a>
    </div>
  </header>
  <div class="stats">
    <div class="stat new"><h3>${stats.new||0}</h3><p>New</p></div>
    <div class="stat"><h3>${stats.read||0}</h3><p>Read</p></div>
    <div class="stat"><h3>${stats.replied||0}</h3><p>Replied</p></div>
    <div class="stat"><h3>${stats.archived||0}</h3><p>Archived</p></div>
  </div>
  <div class="content">
    <table>
      <thead><tr>
        <th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Service</th><th>Status</th><th>Received</th>
      </tr></thead>
      <tbody>${rows || '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--muted);">No submissions yet</td></tr>'}</tbody>
    </table>
  </div></body></html>`);
});

// Detail view
router.get('/:id', (req, res) => {
  const c = stmts.getById.get(req.params.id);
  if (!c) return res.status(404).send('Not found');
  // Auto-mark as read
  if (c.status === 'new') stmts.updateStatus.run('read', c.id);

  res.send(`<!DOCTYPE html><html lang="en"><head>
  <meta charset="UTF-8"/><title>Submission #${c.id}</title>
  <style>
  :root{--gold:#D4A827;--black:#080808;--dark:#0f0f0f;--card:#141414;--border:rgba(212,168,39,0.18);--text:#e8e2d5;--muted:#7a7060;}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:var(--black);color:var(--text);font-family:'Segoe UI',sans-serif;}
  header{background:var(--dark);border-bottom:1px solid var(--border);padding:18px 36px;display:flex;align-items:center;gap:16px;}
  header a{color:var(--gold);font-size:13px;text-decoration:none;}
  header h1{color:var(--text);font-size:18px;font-weight:400;}
  .wrap{max-width:700px;margin:36px auto;padding:0 24px;}
  .card{background:var(--card);border:1px solid var(--border);border-radius:2px;padding:32px;}
  .field{display:grid;grid-template-columns:140px 1fr;gap:8px;padding:14px 0;border-bottom:1px solid rgba(212,168,39,0.07);}
  .field:last-child{border:none;}
  .field label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);padding-top:2px;}
  .field span{color:var(--text);line-height:1.7;}
  .actions{display:flex;gap:10px;margin-top:24px;flex-wrap:wrap;}
  .btn{padding:9px 20px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;border:none;border-radius:2px;cursor:pointer;text-decoration:none;display:inline-block;}
  .btn-gold{background:var(--gold);color:#080808;font-weight:600;}
  .btn-ghost{background:transparent;border:1px solid var(--border);color:var(--text);}
  .btn-ghost:hover{border-color:var(--gold);color:var(--gold);}
  .btn-red{background:transparent;border:1px solid #7a3030;color:#e07070;}
  .btn-red:hover{background:#7a3030;color:#fff;}
  a.btn{text-align:center;}
  </style></head>
  <body>
  <header>
    <a href="/admin">← Back</a>
    <h1>Submission #${c.id} — ${c.first_name} ${c.last_name}</h1>
  </header>
  <div class="wrap">
    <div class="card">
      <div class="field"><label>Name</label><span>${c.first_name} ${c.last_name}</span></div>
      <div class="field"><label>Email</label><span><a href="mailto:${c.email}" style="color:var(--gold)">${c.email}</a></span></div>
      <div class="field"><label>Phone</label><span>${c.phone||'—'}</span></div>
      <div class="field"><label>Company</label><span>${c.company||'—'}</span></div>
      <div class="field"><label>Service</label><span>${c.service||'—'}</span></div>
      <div class="field"><label>Message</label><span>${c.message||'—'}</span></div>
      <div class="field"><label>Status</label><span>${c.status}</span></div>
      <div class="field"><label>Received</label><span>${c.created_at}</span></div>
      <div class="field"><label>IP</label><span>${c.ip_address||'—'}</span></div>
    </div>
    <div class="actions">
      <a class="btn btn-gold" href="mailto:${c.email}">Reply via Email</a>
      <form method="POST" action="/admin/${c.id}/status" style="display:inline">
        <select name="status" style="background:#141414;border:1px solid rgba(212,168,39,0.2);color:#e8e2d5;padding:9px 12px;border-radius:2px;font-size:12px;margin-right:6px;">
          <option value="new" ${c.status==='new'?'selected':''}>New</option>
          <option value="read" ${c.status==='read'?'selected':''}>Read</option>
          <option value="replied" ${c.status==='replied'?'selected':''}>Replied</option>
          <option value="archived" ${c.status==='archived'?'selected':''}>Archived</option>
        </select>
        <button class="btn btn-ghost" type="submit">Update Status</button>
      </form>
      <form method="POST" action="/admin/${c.id}/delete" onsubmit="return confirm('Delete this submission?')">
        <button class="btn btn-red" type="submit">Delete</button>
      </form>
    </div>
  </div></body></html>`);
});

// Update status
router.post('/:id/status', (req, res) => {
  const { status } = req.body;
  const valid = ['new', 'read', 'replied', 'archived'];
  if (!valid.includes(status)) return res.status(400).send('Invalid status');
  stmts.updateStatus.run(status, req.params.id);
  res.redirect(`/admin/${req.params.id}`);
});

// Delete
router.post('/:id/delete', (req, res) => {
  stmts.delete.run(req.params.id);
  res.redirect('/admin');
});

// Logout
router.get('/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'gc_admin=0; Path=/admin; HttpOnly; Max-Age=0');
  res.redirect('/admin');
});

// JSON API for external use
router.get('/api/all', (req, res) => {
  res.json(stmts.getAll.all());
});

module.exports = router;
