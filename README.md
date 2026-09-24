# CleanStreet 🌿 — Full-Stack Civic Waste Reporting & Smart Civic System

**A mobile-first civic web application for reporting local neighbourhood waste issues, verifying community issues, tracking resolution activity timelines, and discovering waste-sorting guidance.**
Built with a full **Express REST API backend**, an **ACID-compliant SQLite DBMS (`cleanstreet.db`)**, an automated **Image Compressor Engine (≤ 200 KB)**, and honest prototype disclaimers.

> **Hackathon Prototype Notice:**  
> CleanStreet is an educational civic-tech hackathon prototype. It is not connected to a municipal control room and does not represent official municipal endorsement or verification. All supervisor logs and ward crew assignments are simulated demo logs.

---

## 🚀 Quick Start (Production / Full-Stack Mode)

### Prerequisites
- Node.js (v20+ recommended; built and tested on Node v26.3.1 with native `node:sqlite`)
- npm

### 1. Start Server & DBMS
```bash
npm start
```
The server will boot on `http://localhost:3000`, initialize the SQLite DBMS schema, auto-migrate columns (`confirmations`, `timeline`), create performance indices, and auto-seed realistic test data if empty.

```
====================================================
🌿 CleanStreet Full-Stack Server Running!
📡 URL:       http://localhost:3000
💾 DBMS:      SQLite3 (cleanstreet.db)
📁 Uploads:   D:\HACKTOBER\uploads
🗜️  Target:    ≤ 200 KB Image Compression for Complaints
====================================================
```

### 2. Open in Browser
Open `http://localhost:3000` in your web browser.

> **Dual-Mode Offline Fallback:** If you open `index.html` directly via `file:///` without the server running, CleanStreet automatically falls back to `localStorage` mode, indicated by the `⚡ Local Mode` status badge in the header. When connected to the server, it displays `🟢 SQLite Online`.

---

## ✨ Upgraded Hackathon Features

CleanStreet features **four high-impact, cohesive demo upgrades** designed to give hackathon judges a memorable, realistic civic tech experience:

### 1. 🕒 Report Activity Timeline
- Every report card now includes an interactive **Activity Timeline Drawer** (`🕒 Activity Timeline`).
- Shows the full lifecycle from `Report Submitted` ➔ `Assigned to Ward Crew` ➔ `Resolved & Cleared`.
- Each step displays a relative timestamp, supervisor log notes, and a **`Prototype Log`** badge distinguishing demo data from official municipal verification.
- **Dynamic Admin Updates:** When an admin modifies a report's status via the Admin panel, a new chronological entry with the timestamp and note is automatically appended to SQLite and instantly visible in the timeline.

### 2. 👍 Community Confirmations ("Still an Issue")
- Residents can click **`Still an Issue (+1)`** on any existing complaint to confirm the waste issue is still present and urgent.
- **Client-Side Deduplication:** Tracks confirmed reports in `localStorage` (`cleanstreet_confirmed_reports_v1`) to prevent accidental repeated submissions from the same device.
- **Atomic Server Counter:** Increments the `confirmations` column in SQLite and switches the button to `Confirmed by you` (disabled).
- Clearly labeled as community support, not municipal verification.

### 3. 📊 Neighbourhood Issue Overview & Distribution Bar
- Positioned above the reports feed in the **All Reports** tab (`#view-reports`).
- **Locality Quick-Filter Chips:** Interactive filter chips (`All Localities`, `Mumbai`, `Bengaluru`, `Delhi`, `Noida`, `Pune`, `Kolkata`) allow instant neighbourhood filtering with zero paid map APIs or tracking.
- **Visual Issue Distribution Bar:** A dynamic proportional distribution bar displaying real-time percentages of overflowing bins (blue), missed pickups (amber), illegal dumping (red), blocked drains (teal), and other complaints.
- Includes prototype data disclaimers.

### 4. 🔍 Waste-Sorting Helper & Quick-Checker
- Located prominently at the top of the **Sorting Guide** (`#view-guide`).
- **Real-Time Item Search:** Instant bilingual search (English & Hindi) across a dictionary of **35+ common Indian household items** (e.g. banana peel, milk pouches, cardboard boxes, lithium batteries, CFL bulbs, expired medicines).
- **Category Filter Chips:** Quick filters for `All`, `Wet Waste` (Green Bin), `Dry Waste` (Blue Bin), `E-Waste` (Red Bin), and `Hazardous & Sanitary` (Black Bin).
- **Practical Disposal Advice:** Each card details which bin to use and actionable disposal advice (e.g. *"Rinse milk pouches before binning to prevent odors"*).

---

## 🗜️ Integrated Image Compressor (≤ 200 KB Standard)

Civic portals, municipal servers, and mobile network bandwidth in rural and semi-urban localities require strict image size limits. CleanStreet features an automated in-browser image compressor built directly into the waste reporting workflow:

- When a resident snaps or selects a photo in the **Report an Issue** form:
  - The compressor engine uses HTML5 Canvas with adaptive resolution downscaling and progressive JPEG quality quantization.
  - It **guarantees that every uploaded photo is strictly ≤ 200 KB** (typically achieving 50–120 KB from 3–5 MB camera originals, an 80–95% bandwidth saving).
  - Real-time visual feedback badge renders below the upload zone:
    - **Original size** (e.g. `3.4 MB`)
    - **Compressed size** (e.g. `60.2 KB`)
    - **Space saved** (e.g. `-83%`)
    - **Dimensions** (e.g. `1024 × 1024 px`)
    - **Status tag**: `⚡ Auto-compressed to ≤ 200 KB`
- Prevents database bloating and municipal server timeouts while preserving forensic visual clarity for sanitation workers.

---

## 💾 Database Management System (DBMS)

CleanStreet uses **SQLite 3** via Node.js native `node:sqlite.DatabaseSync`:
- **Database file:** `cleanstreet.db` (in project root)
- **WAL Mode enabled (`PRAGMA journal_mode = WAL`)** for high concurrency and crash resilience.
- **Synchronous Normal (`PRAGMA synchronous = NORMAL`)** for fast write transactions.

### Database Schema
```sql
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  photo_url TEXT,
  photo_size_kb REAL,
  confirmations INTEGER DEFAULT 1,
  timeline TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_confirmations ON reports(confirmations DESC);
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health, uptime, DBMS status, and database record count |
| `GET` | `/api/stats` | Aggregated report counts (`total`, `resolved`, `inprogress`, `new`, and `byType`) |
| `GET` | `/api/reports` | List reports with query filters (`?status=new&type=overflow&area=Bengaluru&search=lane`) |
| `GET` | `/api/reports/:id` | Fetch single report details with timeline and confirmation count |
| `POST` | `/api/reports` | Create report with multipart photo upload (`photo` file) or JSON |
| `POST` | `/api/reports/:id/confirm` | Atomically increment community confirmation count for a report |
| `PATCH` | `/api/reports/:id/status` | Update report status (`new`, `inprogress`, `resolved`) and append timeline log |
| `DELETE` | `/api/reports/:id` | Remove report from SQLite database |

---

## 📁 Project Structure

```
d:\HACKTOBER\
├── cleanstreet.db          # Persistent SQLite 3 Database (WAL mode)
├── database.js             # DBMS schema, queries, indices, migrations & timeline logger
├── server.js               # Express.js REST API server & static asset handler
├── uploads/                # Physical storage directory for compressed evidence photos
├── package.json            # Node.js project manifest and start scripts
├── index.html              # Frontend SPA markup with Overview Dashboard & Sorting Helper
├── style.css               # Mobile-first design system with rich aesthetic tokens
├── app.js                  # Frontend controller, compressor engine, dual-mode API & timeline
├── icon.png                # App favicon & brand logo
├── sample-waste-photo.png  # Sample image for testing compression
├── README.md               # Complete architecture & deployment guide
└── DEMO.md                 # 60-Second Judge Presentation Demo Script
```

---

## 🌐 Bilingual Support (EN / हि)
CleanStreet supports English and Hindi for all navigation tabs, report forms, status badges, the waste sorting guide, activity timelines, community confirmations, and the quick-checker tool. Toggle instantly between **EN** and **हि** in the header.

---

## ⚙️ Administration & Status Workflow
1. Navigate to the **⚙ Admin** tab in the top navigation.
2. View all submitted reports with photo thumbnails, compressed sizes, and confirmation counts.
3. Update status from `New` 🔵 to `In Progress` 🟡 to `Resolved` 🟢.
4. Changes are committed immediately to `cleanstreet.db` via `PATCH /api/reports/:id/status` and automatically append a new log entry to the report's Activity Timeline.
