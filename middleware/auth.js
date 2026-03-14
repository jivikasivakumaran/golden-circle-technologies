/**
 * Simple password-based admin auth via query param or session cookie
 * Usage: GET /admin?password=YOUR_PASSWORD
 */
function adminAuth(req, res, next) {
  const pw = process.env.ADMIN_PASSWORD || 'goldencircle@2025';
  // Check cookie
  const cookie = req.headers.cookie || '';
  if (cookie.includes('gc_admin=1')) return next();
  // Check query param
  if (req.query.password === pw) {
    res.setHeader('Set-Cookie', 'gc_admin=1; Path=/admin; HttpOnly; Max-Age=86400');
    return next();
  }
  // Show login form
  res.send(`<!DOCTYPE html><html><head><title>Admin Login</title>
  <style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#080808;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;}
  .box{background:#141414;border:1px solid rgba(212,168,39,0.2);padding:48px;border-radius:4px;text-align:center;width:340px;}
  h2{color:#D4A827;font-size:22px;margin-bottom:8px;font-weight:400;}
  p{color:#7a7060;font-size:13px;margin-bottom:28px;}
  input{width:100%;padding:12px 14px;background:#0f0f0f;border:1px solid rgba(212,168,39,0.2);color:#e8e2d5;border-radius:2px;font-size:14px;margin-bottom:14px;outline:none;}
  input:focus{border-color:#D4A827;}
  button{width:100%;padding:12px;background:#D4A827;color:#080808;border:none;font-size:12px;letter-spacing:.15em;text-transform:uppercase;font-weight:600;cursor:pointer;border-radius:2px;}
  button:hover{background:#F0C84A;}</style></head>
  <body><div class="box">
    <h2>GoldenCircle Admin</h2>
    <p>Enter admin password to continue</p>
    <form method="GET">
      <input type="password" name="password" placeholder="Admin password" autofocus/>
      <button type="submit">Login</button>
    </form>
  </div></body></html>`);
}
module.exports = adminAuth;
