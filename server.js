/**
 * CleanStreet — server.js
 * Production-ready Express.js REST API Server
 * Integrates SQLite DBMS and real file storage for compressed waste photos
 */

'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const db = require('./database.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads folder exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext.toLowerCase()) ? ext.toLowerCase() : '.jpg';
    const uniqueName = `waste-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB hard ceiling, client-side compresses to <= 200KB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve uploaded photos
app.use('/uploads', express.static(UPLOADS_DIR));

// Serve frontend static assets
app.use(express.static(path.join(__dirname)));

/* =====================================================
   REST API ROUTES
   ===================================================== */

// 1. Health check & system status
app.get('/api/health', (req, res) => {
  try {
    const stats = db.getStats();
    res.json({
      status: 'healthy',
      server: 'CleanStreet Node/Express Server',
      dbms: 'SQLite3 (node:sqlite)',
      databaseFile: 'cleanstreet.db',
      uptimeSeconds: Math.round(process.uptime()),
      reportsInDb: stats.total,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// 2. Aggregate statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. List all reports (with status, type, and search filters)
app.get('/api/reports', (req, res) => {
  try {
    const filters = {
      status: req.query.status || 'all',
      type: req.query.type || 'all',
      area: req.query.area || 'all',
      search: req.query.search || '',
    };
    const reports = db.getAllReports(filters);
    res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Get single report by ID
app.get('/api/reports/:id', (req, res) => {
  try {
    const report = db.getReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Create new report (supports multipart/form-data OR json with base64)
app.post('/api/reports', upload.single('photo'), (req, res) => {
  try {
    const { type, location, description } = req.body;

    if (!type || !location || location.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Type and Location (at least 3 characters) are required.',
      });
    }

    let photoUrl = null;
    let photoSizeKb = null;

    // A. Handled via multipart file upload
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
      photoSizeKb = +(req.file.size / 1024).toFixed(2);
    }
    // B. Handled via Base64 dataUrl in JSON body
    else if (req.body.photo_base64 && req.body.photo_base64.startsWith('data:image/')) {
      const base64Data = req.body.photo_base64;
      const matches = base64Data.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `waste-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
        const filePath = path.join(UPLOADS_DIR, filename);
        fs.writeFileSync(filePath, buffer);
        photoUrl = `/uploads/${filename}`;
        photoSizeKb = +(buffer.length / 1024).toFixed(2);
      }
    }

    const newReport = db.createReport({
      id: req.body.id,
      type: type.trim(),
      location: location.trim(),
      description: (description || '').trim(),
      status: 'new',
      photo_url: photoUrl,
      photo_size_kb: photoSizeKb,
    });

    res.status(201).json({
      success: true,
      message: 'Report filed successfully and persisted in SQLite DBMS.',
      report: newReport,
    });
  } catch (err) {
    console.error('[API Error] POST /api/reports:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Community confirmation endpoint
app.post('/api/reports/:id/confirm', (req, res) => {
  try {
    const updated = db.confirmReport(req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    res.json({
      success: true,
      message: 'Community confirmation recorded in SQLite.',
      confirmations: updated.confirmations,
      report: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Update report status (Admin workflow)
app.patch('/api/reports/:id/status', (req, res) => {
  try {
    const { status, note } = req.body;
    const allowed = ['new', 'inprogress', 'resolved'];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Allowed values: ${allowed.join(', ')}`,
      });
    }

    const updated = db.updateReportStatus(req.params.id, status, note);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    res.json({
      success: true,
      message: `Status updated to "${status}" in SQLite database.`,
      report: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Delete report
app.delete('/api/reports/:id', (req, res) => {
  try {
    const success = db.deleteReport(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    res.json({ success: true, message: 'Report deleted from SQLite.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Compression validation utility endpoint
app.post('/api/compress-verify', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No image provided' });
  }
  const sizeBytes = req.file.size;
  const sizeKb = +(sizeBytes / 1024).toFixed(2);
  const isUnder200Kb = sizeBytes <= 200 * 1024;

  // Clean up test file
  try { fs.unlinkSync(req.file.path); } catch (_) {}

  res.json({
    success: true,
    sizeBytes,
    sizeKb,
    targetKb: 200,
    isCompliant: isUnder200Kb,
    message: isUnder200Kb
      ? `Image verified under 200KB limit (${sizeKb} KB). Ideal for waste complaint.`
      : `Image is ${sizeKb} KB (exceeds 200KB limit).`,
  });
});

// Fallback to index.html for SPA routing (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Express Error]', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Start Server
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🌿 CleanStreet Full-Stack Server Running!`);
    console.log(`📡 URL:       http://localhost:${PORT}`);
    console.log(`💾 DBMS:      SQLite3 (cleanstreet.db)`);
    console.log(`📁 Uploads:   ${UPLOADS_DIR}`);
    console.log(`🗜️  Target:    ≤ 200 KB Image Compression for Complaints`);
    console.log(`====================================================`);
  });

  const cleanup = () => {
    console.log('\n[Server] Shutting down gracefully...');
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

module.exports = app;
