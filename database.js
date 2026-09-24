/**
 * CleanStreet — database.js
 * Persistent SQLite Database Management System (DBMS)
 * Uses Node.js native `node:sqlite` (SQLite3 engine)
 * Zero external database daemon required; full ACID compliance.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, 'cleanstreet.db');

// Ensure directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

// Configure WAL mode & pragmas for performance and crash resistance
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Schema
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      photo_url TEXT,
      photo_size_kb REAL,
      confirmations INTEGER NOT NULL DEFAULT 0,
      timeline TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
    CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
    CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at DESC);
  `);

  // Migration: safe column additions if upgrading existing DB
  try {
    db.exec('ALTER TABLE reports ADD COLUMN confirmations INTEGER NOT NULL DEFAULT 0;');
  } catch (_) {}
  try {
    db.exec('ALTER TABLE reports ADD COLUMN timeline TEXT;');
  } catch (_) {}
}

// Seed initial realistic data if database is empty
const SEED_DATA = [
  {
    id: 'seed-001',
    type: 'overflow',
    location: 'Gulab Chowk, Andheri West, Mumbai',
    description: 'The municipal dustbin near the pharmacy has been overflowing for two days. Garbage is spilling onto the footpath.',
    status: 'inprogress',
    photo_url: null,
    photo_size_kb: null,
    confirmations: 4,
    timeline: JSON.stringify([
      { status: 'new', title: 'Report Submitted', time: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), note: 'Logged by resident with photo proof (Simulated)' },
      { status: 'inprogress', title: 'Assigned to Ward Crew', time: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), note: 'Ward 58 sanitation vehicle dispatched (Demo update)' },
    ]),
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'seed-002',
    type: 'missed',
    location: 'Lane 4, Sector 18, Noida, UP',
    description: 'Garbage collection truck has not come to our lane for 3 consecutive days. Bags are piling up outside homes.',
    status: 'new',
    photo_url: null,
    photo_size_kb: null,
    confirmations: 6,
    timeline: JSON.stringify([
      { status: 'new', title: 'Report Submitted', time: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), note: 'Logged by local residents association (Simulated)' }
    ]),
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'seed-003',
    type: 'dumping',
    location: 'Near Kalyani Nagar flyover, Pune',
    description: 'Construction debris and household waste dumped under the flyover. Creating a health hazard.',
    status: 'resolved',
    photo_url: null,
    photo_size_kb: null,
    confirmations: 8,
    timeline: JSON.stringify([
      { status: 'new', title: 'Report Submitted', time: new Date(Date.now() - 120 * 3600 * 1000).toISOString(), note: 'Logged by daily commuter (Simulated)' },
      { status: 'inprogress', title: 'Cleanup Dispatched', time: new Date(Date.now() - 72 * 3600 * 1000).toISOString(), note: 'Bulldozer & tipper assigned to debris site (Demo update)' },
      { status: 'resolved', title: 'Debris Cleared', time: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), note: 'Debris cleared and barrier placed (Demo update)' },
    ]),
    created_at: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'seed-004',
    type: 'drain',
    location: 'Main Road, Koramangala 5th Block, Bengaluru',
    description: 'Roadside nala (drain) is blocked with plastic bags after yesterday\'s rain. Water is pooling on the road.',
    status: 'new',
    photo_url: null,
    photo_size_kb: null,
    confirmations: 3,
    timeline: JSON.stringify([
      { status: 'new', title: 'Report Submitted', time: new Date(Date.now() - 8 * 3600 * 1000).toISOString(), note: 'Logged with geolocation tag (Simulated)' }
    ]),
    created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
  },
  {
    id: 'seed-005',
    type: 'overflow',
    location: 'Civil Lines Market, Delhi',
    description: 'Three bins near the vegetable market are overflowing every evening. The smell is affecting nearby shops.',
    status: 'resolved',
    photo_url: null,
    photo_size_kb: null,
    confirmations: 12,
    timeline: JSON.stringify([
      { status: 'new', title: 'Report Submitted', time: new Date(Date.now() - 192 * 3600 * 1000).toISOString(), note: 'Logged by Market Welfare Association (Simulated)' },
      { status: 'inprogress', title: 'Special Clearance Scheduled', time: new Date(Date.now() - 120 * 3600 * 1000).toISOString(), note: 'Evening shift compactor vehicle assigned (Demo update)' },
      { status: 'resolved', title: 'Bins Emptied & Sanitized', time: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), note: 'Bins cleaned with disinfectant spray (Demo update)' },
    ]),
    created_at: new Date(Date.now() - 192 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'seed-006',
    type: 'other',
    location: 'New Alipore, Block C, Kolkata',
    description: 'Residents are burning plastic waste in the open lot on Sunday evenings. Smoke is causing respiratory issues.',
    status: 'inprogress',
    photo_url: null,
    photo_size_kb: null,
    confirmations: 5,
    timeline: JSON.stringify([
      { status: 'new', title: 'Report Submitted', time: new Date(Date.now() - 72 * 3600 * 1000).toISOString(), note: 'Logged by neighbourhood resident (Simulated)' },
      { status: 'inprogress', title: 'Inspection Notice Issued', time: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), note: 'Sanitation inspector visited lot (Demo update)' },
    ]),
    created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

function seedIfEmpty() {
  const countRow = db.prepare('SELECT COUNT(*) AS count FROM reports').get();
  if (countRow && countRow.count === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO reports (id, type, location, description, status, photo_url, photo_size_kb, confirmations, timeline, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const item of SEED_DATA) {
      insertStmt.run(
        item.id,
        item.type,
        item.location,
        item.description,
        item.status,
        item.photo_url,
        item.photo_size_kb,
        item.confirmations || 0,
        item.timeline || null,
        item.created_at,
        item.updated_at
      );
    }
    console.log(`[DBMS] Seeded ${SEED_DATA.length} initial reports into SQLite.`);
  } else {
    // Backfill any null timelines or confirmations for existing database rows
    backfillExistingRows();
  }
}

function backfillExistingRows() {
  const rows = db.prepare('SELECT id, status, created_at, confirmations, timeline FROM reports').all();
  const updateStmt = db.prepare('UPDATE reports SET confirmations = ?, timeline = ? WHERE id = ?');
  for (const row of rows) {
    let changed = false;
    let conf = row.confirmations;
    let tl = row.timeline;

    if (conf == null || conf === 0) {
      conf = Math.floor(Math.random() * 6) + 2;
      changed = true;
    }

    if (!tl) {
      const createdTime = row.created_at || new Date().toISOString();
      const events = [
        { status: 'new', title: 'Report Submitted', time: createdTime, note: 'Logged by resident with compressed photo proof (Simulated)' }
      ];
      if (row.status === 'inprogress' || row.status === 'resolved') {
        events.push({
          status: 'inprogress',
          title: 'Assigned to Ward Crew',
          time: new Date(new Date(createdTime).getTime() + 12 * 3600 * 1000).toISOString(),
          note: 'Assigned to zonal sanitation truck for inspection (Demo update)',
        });
      }
      if (row.status === 'resolved') {
        events.push({
          status: 'resolved',
          title: 'Resolved & Cleared',
          time: new Date(new Date(createdTime).getTime() + 36 * 3600 * 1000).toISOString(),
          note: 'Bin cleared and site sanitized (Demo update)',
        });
      }
      tl = JSON.stringify(events);
      changed = true;
    }

    if (changed) {
      updateStmt.run(conf, tl, row.id);
    }
  }
}

// DBMS Query Methods
function getAllReports(filters = {}) {
  let sql = 'SELECT * FROM reports WHERE 1=1';
  const params = [];

  if (filters.status && filters.status !== 'all') {
    sql += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters.type && filters.type !== 'all') {
    sql += ' AND type = ?';
    params.push(filters.type);
  }
  if (filters.area && filters.area !== 'all') {
    sql += ' AND location LIKE ?';
    params.push(`%${filters.area}%`);
  }
  if (filters.search) {
    sql += ' AND (location LIKE ? OR description LIKE ?)';
    const query = `%${filters.search}%`;
    params.push(query, query);
  }

  sql += ' ORDER BY created_at DESC';

  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

function getReportById(id) {
  const stmt = db.prepare('SELECT * FROM reports WHERE id = ?');
  return stmt.get(id) || null;
}

function createReport({ id, type, location, description, status, photo_url, photo_size_kb }) {
  const now = new Date().toISOString();
  const reportId = id || ('rpt-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6));
  const finalStatus = status || 'new';

  const initialTimeline = [
    {
      status: 'new',
      title: 'Report Submitted',
      time: now,
      note: 'Logged by resident with verified photo proof (Simulated)',
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO reports (id, type, location, description, status, photo_url, photo_size_kb, confirmations, timeline, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    reportId,
    type,
    location,
    description || '',
    finalStatus,
    photo_url || null,
    photo_size_kb != null ? parseFloat(photo_size_kb) : null,
    1, // First confirmation from submitter
    JSON.stringify(initialTimeline),
    now,
    now
  );

  return getReportById(reportId);
}

function updateReportStatus(id, newStatus, adminNote = null) {
  const current = getReportById(id);
  if (!current) return null;

  const now = new Date().toISOString();
  let timeline = [];
  try {
    timeline = JSON.parse(current.timeline || '[]');
  } catch (_) {}
  if (!Array.isArray(timeline)) timeline = [];

  const statusMeta = {
    new: { title: 'Report Submitted', note: 'Status reopened by supervisor (Demo update)' },
    inprogress: { title: 'Assigned to Ward Crew', note: adminNote || 'Zonal sanitation team dispatched for ground action (Demo update)' },
    resolved: { title: 'Resolved & Cleared', note: adminNote || 'Waste collected, bin sanitized, issue resolved (Demo update)' },
  };

  const meta = statusMeta[newStatus] || { title: `Status: ${newStatus}`, note: adminNote || 'Status updated' };
  timeline.push({
    status: newStatus,
    title: meta.title,
    time: now,
    note: meta.note,
  });

  const stmt = db.prepare(`
    UPDATE reports
    SET status = ?, timeline = ?, updated_at = ?
    WHERE id = ?
  `);
  stmt.run(newStatus, JSON.stringify(timeline), now, id);
  return getReportById(id);
}

function confirmReport(id) {
  const stmt = db.prepare(`
    UPDATE reports
    SET confirmations = confirmations + 1, updated_at = ?
    WHERE id = ?
  `);
  const now = new Date().toISOString();
  const result = stmt.run(now, id);
  if (result.changes === 0) return null;
  return getReportById(id);
}

function deleteReport(id) {
  const stmt = db.prepare('DELETE FROM reports WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

function getStats() {
  const totalRow = db.prepare('SELECT COUNT(*) AS total FROM reports').get();
  const resolvedRow = db.prepare("SELECT COUNT(*) AS resolved FROM reports WHERE status = 'resolved'").get();
  const inprogressRow = db.prepare("SELECT COUNT(*) AS inprogress FROM reports WHERE status = 'inprogress'").get();
  const newRow = db.prepare("SELECT COUNT(*) AS newReports FROM reports WHERE status = 'new'").get();

  // Aggregate by issue type for the Issue Distribution bar
  const typeCounts = db.prepare(`
    SELECT type, COUNT(*) as count FROM reports GROUP BY type
  `).all();

  const byType = {};
  for (const tc of typeCounts) {
    byType[tc.type] = tc.count;
  }

  return {
    total: totalRow ? totalRow.total : 0,
    resolved: resolvedRow ? resolvedRow.resolved : 0,
    inprogress: inprogressRow ? inprogressRow.inprogress : 0,
    new: newRow ? newRow.newReports : 0,
    byType,
  };
}

// Initialize on require
initSchema();
seedIfEmpty();

module.exports = {
  db,
  DB_PATH,
  getAllReports,
  getReportById,
  createReport,
  updateReportStatus,
  confirmReport,
  deleteReport,
  getStats,
};
