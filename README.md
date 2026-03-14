# GoldenCircle Technologies — Backend

**Stack:** Node.js · Express · SQLite (better-sqlite3)

## Project Structure

```
goldencircle-backend/
├── server.js            ← Main Express app
├── database.js          ← SQLite setup & prepared statements
├── routes/
│   ├── contact.js       ← POST /api/contact  (saves form submissions)
│   └── admin.js         ← GET  /admin        (dashboard to view leads)
├── middleware/
│   └── auth.js          ← Password-based admin login
├── public/              ← All 4 frontend HTML files (served as static)
│   ├── index.html
│   ├── about.html
│   ├── services.html
│   └── contact.html
├── data/                ← Auto-created; holds contacts.db
├── .env                 ← Your environment config (don't commit!)
└── package.json
```

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Copy and edit environment file
cp .env.example .env

# 3. Start server
npm start

# Open: http://localhost:3000
# Admin: http://localhost:3000/admin
```

## Environment Variables (.env)

| Variable        | Description                          | Default              |
|-----------------|--------------------------------------|----------------------|
| PORT            | Server port                          | 3000                 |
| NODE_ENV        | production / development             | production           |
| ADMIN_PASSWORD  | Password for /admin dashboard        | goldencircle@2025    |
| FRONTEND_URL    | Your website domain (for CORS)       | *                    |
| DB_PATH         | Path to SQLite database file         | ./data/contacts.db   |

**Change ADMIN_PASSWORD before going live!**

---

## Deploy to a VPS (DigitalOcean / Hostinger / AWS EC2)

### Step 1 — Upload to your server
```bash
# On your local machine
scp -r goldencircle-backend/ user@YOUR_SERVER_IP:/var/www/goldencircle/
```

### Step 2 — Install Node.js on server
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 3 — Install dependencies
```bash
cd /var/www/goldencircle
npm install --production
```

### Step 4 — Configure .env
```bash
nano .env
# Set PORT=3000, ADMIN_PASSWORD=yourSecurePassword, FRONTEND_URL=https://yourdomain.com
```

### Step 5 — Run with PM2 (keeps it alive forever)
```bash
sudo npm install -g pm2
pm2 start server.js --name goldencircle-backend
pm2 startup       # auto-start on reboot
pm2 save
```

### Step 6 — Nginx reverse proxy (optional but recommended)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 7 — HTTPS with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## API Reference

### POST /api/contact
Submit contact form. Body (JSON):
```json
{
  "firstName": "Ravi",
  "lastName": "Kumar",
  "email": "ravi@example.com",
  "phone": "+91 9876543210",
  "company": "Acme Corp",
  "service": "AI & Machine Learning",
  "message": "We need a recommendation engine."
}
```
Response: `{ "success": true, "message": "..." }`

### GET /admin
Protected dashboard. Visit in browser → enter password.

### GET /health
Returns `{ status: "ok", ... }` — useful for uptime monitoring.

---

## Admin Dashboard Features
- View all contact submissions in a table
- Click any row to see full details
- Update status: New → Read → Replied → Archived
- Reply button (opens email client)
- Delete submissions
- Auto-marks submissions as "read" when opened
