/**
 * database.js
 * SQLite via the 'sqlite3' package — has pre-built binaries for Linux/Render.
 * Wrapped in promises for clean async usage.
 */

const sqlite3 = require('sqlite3').verbose();
const path    = require('path');
const fs      = require('fs');

const DB_PATH = process.env.DB_PATH || './data/contacts.db';

// Ensure /data directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Open (or create) the database file
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Failed to open database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database at', DB_PATH);
});

// Enable WAL mode for performance
db.run("PRAGMA journal_mode=WAL");

// Create contacts table
db.run(`
  CREATE TABLE IF NOT EXISTS contacts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid        TEXT    NOT NULL UNIQUE,
    first_name  TEXT    NOT NULL,
    last_name   TEXT,
    email       TEXT    NOT NULL,
    phone       TEXT,
    company     TEXT,
    service     TEXT,
    message     TEXT,
    ip_address  TEXT,
    user_agent  TEXT,
    status      TEXT    DEFAULT 'new',
    created_at  DATETIME DEFAULT (datetime('now','localtime'))
  )
`, (err) => {
  if (err) console.error('❌ Table creation error:', err.message);
  else console.log('✅ contacts table ready');
});

// ── Promise helpers ──────────────────────────────────────────────────────────

const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    if (err) reject(err);
    else resolve({ id: this.lastID, changes: this.changes });
  });
});

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

// ── Named statement functions (mirrors old stmts API) ───────────────────────

const stmts = {
  insert: (data) => dbRun(`
    INSERT INTO contacts
      (uuid, first_name, last_name, email, phone, company, service, message, ip_address, user_agent)
    VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [data.uuid, data.firstName, data.lastName, data.email,
     data.phone, data.company, data.service, data.message,
     data.ipAddress, data.userAgent]
  ),

  getAll:  ()   => dbAll(`SELECT * FROM contacts ORDER BY created_at DESC`),
  getById: (id) => dbGet(`SELECT * FROM contacts WHERE id = ?`, [id]),
  updateStatus: (status, id) => dbRun(`UPDATE contacts SET status = ? WHERE id = ?`, [status, id]),
  delete:  (id) => dbRun(`DELETE FROM contacts WHERE id = ?`, [id]),
  count:   ()   => dbGet(`SELECT COUNT(*) as total FROM contacts`),
  countByStatus: () => dbAll(`SELECT status, COUNT(*) as count FROM contacts GROUP BY status`),
  recent:  (n)  => dbAll(`SELECT * FROM contacts ORDER BY created_at DESC LIMIT ?`, [n])
};

module.exports = { db, stmts };