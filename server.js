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

// ── Allowed origins
const ALLOWED_ORIGINS = [
  'https://goldencircletechnologies.netlify.app',
  'http://localhost',
  'http://localhost:3000',
  'http://127.0.0.1',
  process.env.FRONTEND_URL
].filter(Boolean);

// ── Security headers
app.use(helmet({ contentSecurityPolicy: false }));

// ── CORS — handle preflight + actual requests
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('CORS: origin not allowed — ' + origin));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// ── Explicitly handle OPTIONS preflight for ALL routes
app.options('*', cors());

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
  console.error('Unhandled error:', err.message);
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