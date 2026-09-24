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

// Blank report sheet mode: No demo reports seeded
const SEED_DATA = [];

function seedIfEmpty() {
  // Kept empty so the application starts with a clean, blank report sheet.
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
      title: 'Report Logged in Demo App',
      time: now,
      note: 'Recorded in prototype database. No municipal agency has been dispatched.',
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

function updateReportStatus(id, newStatus, adminNote = null, uploadsDir = null) {
  const current = getReportById(id);
  if (!current) return null;

  const now = new Date().toISOString();
  let timeline = [];
  try {
    timeline = JSON.parse(current.timeline || '[]');
  } catch (_) {}
  if (!Array.isArray(timeline)) timeline = [];

  const statusMeta = {
    new: { title: 'Report Logged in Demo App', note: adminNote || 'Status reset in prototype database (Simulated)' },
    inprogress: { title: 'In-App Review / Simulated Dispatch', note: adminNote || 'Simulated status: marked in progress by prototype operator (No real crew dispatched)' },
    resolved: { title: 'Marked Resolved & Problem Photo Cleared', note: adminNote || 'Issue resolved and problem photo file permanently removed from storage' },
  };

  const meta = statusMeta[newStatus] || { title: `Status: ${newStatus}`, note: adminNote || 'Status updated in prototype' };
  timeline.push({
    status: newStatus,
    title: meta.title,
    time: now,
    note: meta.note,
  });

  // When a case is resolved, automatically delete the problem image from the uploads directory and clear DB photo reference
  let photoUrl = current.photo_url;
  let photoSizeKb = current.photo_size_kb;
  if (newStatus === 'resolved' && current.photo_url) {
    if (uploadsDir) {
      deleteReportPhotoFile(current.photo_url, uploadsDir);
    }
    photoUrl = null;
    photoSizeKb = null;
  }

  const stmt = db.prepare(`
    UPDATE reports
    SET status = ?, photo_url = ?, photo_size_kb = ?, timeline = ?, updated_at = ?
    WHERE id = ?
  `);
  stmt.run(newStatus, photoUrl, photoSizeKb, JSON.stringify(timeline), now, id);
  return getReportById(id);
}

function confirmReport(id, requestedStatus = null, note = null) {
  const current = getReportById(id);
  if (!current) return null;

  const now = new Date().toISOString();
  let timeline = [];
  try {
    timeline = JSON.parse(current.timeline || '[]');
  } catch (_) {}
  if (!Array.isArray(timeline)) timeline = [];

  // When confirmed, tracking status changes!
  // If status is 'new', advance it to 'inprogress' (Confirmed / Under Review in Demo)
  // If status is 'resolved', re-open to 'inprogress'
  let newStatus = requestedStatus;
  if (!newStatus) {
    if (current.status === 'new' || current.status === 'resolved') {
      newStatus = 'inprogress';
    } else {
      newStatus = current.status;
    }
  }

  const newConfirmations = (current.confirmations || 0) + 1;
  const statusLabel = newStatus === 'inprogress' ? 'In Progress (Simulated Review)' : (newStatus === 'resolved' ? 'Resolved (Demo)' : 'New (Demo)');
  const confirmNote = note || `In-app community confirmation recorded (${newConfirmations} confirmations). Tracking status changed to ${statusLabel}.`;

  timeline.push({
    status: newStatus,
    title: 'In-App Community Confirmation',
    time: now,
    note: confirmNote,
  });

  const stmt = db.prepare(`
    UPDATE reports
    SET confirmations = ?, status = ?, timeline = ?, updated_at = ?
    WHERE id = ?
  `);
  stmt.run(newConfirmations, newStatus, JSON.stringify(timeline), now, id);
  return getReportById(id);
}

// Helper to remove photo file associated with a report
function deleteReportPhotoFile(photoUrl, uploadsDir) {
  if (!photoUrl || typeof photoUrl !== 'string') return false;
  try {
    const filename = path.basename(photoUrl);
    if (filename && uploadsDir) {
      const fullPath = path.join(uploadsDir, filename);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
    }
  } catch (err) {
    console.warn(`[DBMS] Could not remove photo file for ${photoUrl}:`, err.message);
  }
  return false;
}

function clearAllDemoReports(uploadsDir = null) {
  // First clean up all photo files associated with reports
  let deletedPhotos = 0;
  if (uploadsDir) {
    const rows = db.prepare('SELECT photo_url FROM reports WHERE photo_url IS NOT NULL').all();
    for (const r of rows) {
      if (deleteReportPhotoFile(r.photo_url, uploadsDir)) {
        deletedPhotos++;
      }
    }
  }

  const stmt = db.prepare('DELETE FROM reports');
  const result = stmt.run();
  return { deletedCount: result.changes, deletedPhotos };
}

function deleteResolvedReports(uploadsDir = null) {
  const resolvedRows = db.prepare("SELECT id, photo_url FROM reports WHERE status = 'resolved'").all();
  let deletedPhotos = 0;

  if (uploadsDir && resolvedRows.length > 0) {
    for (const r of resolvedRows) {
      if (deleteReportPhotoFile(r.photo_url, uploadsDir)) {
        deletedPhotos++;
      }
    }
  }

  const stmt = db.prepare("DELETE FROM reports WHERE status = 'resolved'");
  const result = stmt.run();
  return { deletedCount: result.changes, deletedPhotos };
}

function bulkUpdateStatus(ids, newStatus, note = 'Bulk status updated by administrator', uploadsDir = null) {
  if (!Array.isArray(ids) || ids.length === 0) return 0;
  let count = 0;
  for (const id of ids) {
    const updated = updateReportStatus(id, newStatus, note, uploadsDir);
    if (updated) count++;
  }
  return count;
}

function deleteBulkReports(ids, uploadsDir = null) {
  if (!Array.isArray(ids) || ids.length === 0) return { deletedCount: 0, deletedPhotos: 0 };
  let deletedPhotos = 0;

  if (uploadsDir) {
    for (const id of ids) {
      const report = getReportById(id);
      if (report && deleteReportPhotoFile(report.photo_url, uploadsDir)) {
        deletedPhotos++;
      }
    }
  }

  const placeholders = ids.map(() => '?').join(',');
  const stmt = db.prepare(`DELETE FROM reports WHERE id IN (${placeholders})`);
  const result = stmt.run(...ids);
  return { deletedCount: result.changes, deletedPhotos };
}

function deleteReport(id, uploadsDir = null) {
  const report = getReportById(id);
  if (!report) return false;

  if (uploadsDir) {
    deleteReportPhotoFile(report.photo_url, uploadsDir);
  }

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
  bulkUpdateStatus,
  confirmReport,
  deleteReport,
  deleteResolvedReports,
  deleteBulkReports,
  clearAllDemoReports,
  deleteReportPhotoFile,
  getStats,
};

