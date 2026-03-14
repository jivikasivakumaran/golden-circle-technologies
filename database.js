/**
 * database.js
 * SQLite database setup using better-sqlite3 (synchronous, fast, zero-config)
 * Database file is auto-created at DB_PATH on first run.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/contacts.db';

// Ensure the data directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create contacts table
db.exec(`
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
`);

// Prepared statements
const stmts = {
  insert: db.prepare(`
    INSERT INTO contacts (uuid, first_name, last_name, email, phone, company, service, message, ip_address, user_agent)
    VALUES (@uuid, @firstName, @lastName, @email, @phone, @company, @service, @message, @ipAddress, @userAgent)
  `),

  getAll: db.prepare(`
    SELECT * FROM contacts ORDER BY created_at DESC
  `),

  getById: db.prepare(`
    SELECT * FROM contacts WHERE id = ?
  `),

  updateStatus: db.prepare(`
    UPDATE contacts SET status = ? WHERE id = ?
  `),

  delete: db.prepare(`
    DELETE FROM contacts WHERE id = ?
  `),

  count: db.prepare(`
    SELECT COUNT(*) as total FROM contacts
  `),

  countByStatus: db.prepare(`
    SELECT status, COUNT(*) as count FROM contacts GROUP BY status
  `),

  recent: db.prepare(`
    SELECT * FROM contacts ORDER BY created_at DESC LIMIT ?
  `)
};

module.exports = { db, stmts };
