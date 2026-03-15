/**
 * database.js
 * PostgreSQL via 'pg' package — connects to Supabase
 */

const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // required for Supabase
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Failed to connect to Supabase:', err.message);
    process.exit(1);
  }
  release();
  console.log('✅ Connected to Supabase PostgreSQL');
});

// ── Query helper ─────────────────────────────────────────────────────────────
const query = (text, params) => pool.query(text, params);

// ── Named statement functions ─────────────────────────────────────────────────
const stmts = {

  insert: (data) => query(`
    INSERT INTO contacts
      (uuid, first_name, last_name, email, phone, company, service, message, ip_address, user_agent)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [data.uuid, data.firstName, data.lastName, data.email,
     data.phone, data.company, data.service, data.message,
     data.ipAddress, data.userAgent]
  ),

  getAll: () => query(
    `SELECT * FROM contacts ORDER BY created_at DESC`
  ).then(r => r.rows),

  getById: (id) => query(
    `SELECT * FROM contacts WHERE id = $1`, [id]
  ).then(r => r.rows[0]),

  updateStatus: (status, id) => query(
    `UPDATE contacts SET status = $1 WHERE id = $2`, [status, id]
  ),

  delete: (id) => query(
    `DELETE FROM contacts WHERE id = $1`, [id]
  ),

  count: () => query(
    `SELECT COUNT(*) as total FROM contacts`
  ).then(r => r.rows[0]),

  countByStatus: () => query(
    `SELECT status, COUNT(*) as count FROM contacts GROUP BY status`
  ).then(r => r.rows),

  recent: (n) => query(
    `SELECT * FROM contacts ORDER BY created_at DESC LIMIT $1`, [n]
  ).then(r => r.rows)

};

module.exports = { pool, stmts };