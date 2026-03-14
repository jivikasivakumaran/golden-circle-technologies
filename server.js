/**
 * server.js — GoldenCircle Technologies Backend
 * Stack: Node.js + Express + SQLite (better-sqlite3)
 */

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';




// ── Security headers
app.use(helmet({ contentSecurityPolicy: false }));

// ── CORS — only allow your frontend domain
app.use(cors({
  origin: FRONTEND_URL === '*' ? '*' : [FRONTEND_URL, 'http://localhost'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// ── Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Serve static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes
app.use('/api/contact', require('./routes/contact'));

// ── Admin dashboard
app.use('/admin', require('./routes/admin'));

// ── Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'GoldenCircle Technologies Backend', time: new Date().toISOString() });
});

// ── 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Start
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║  GoldenCircle Technologies Backend              ║
  ║  Running at http://localhost:${PORT}               ║
  ║  Admin panel: http://localhost:${PORT}/admin       ║
  ╚══════════════════════════════════════════════════╝
  `);
});
