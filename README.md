# CleanStreet 🌿 — Full-Stack Civic Waste Tracking & Management Platform

**A clean, accessible full-stack civic platform for reporting neighbourhood waste issues, prioritizing community concerns via upvoting, discovering waste-sorting rules, and coordinating municipal field dispatch.**

Built with an **Express.js REST API**, **native SQLite DBMS (`cleanstreet.db`)**, an automated **Canvas Image Compressor (≤ 200 KB)**, and **WCAG 2.2 AA compliance**.

> **Civic Hackathon Notice:**  
> CleanStreet is a civic tech prototype designed for community demonstration. Status updates reflect simulated prototype operations and are not connected to real municipal dispatch unless integrated with official city APIs.

---

## 🏛️ Platform Architecture & Dedicated Portals

CleanStreet provides **three distinct, isolated portals** tailored for different stakeholders:

```
                               ┌──────────────────────────────────────────────┐
                               │       CleanStreet Full-Stack Server          │
                               │           http://localhost:3000              │
                               └──────┬──────────────┬──────────────┬─────────┘
                                      │              │              │
                   ┌──────────────────┘              │              └──────────────────┐
                   ▼                                 ▼                                 ▼
    ┌─────────────────────────────┐   ┌─────────────────────────────┐   ┌─────────────────────────────┐
    │     Resident Portal (/)     │   │   Authority Desk (/authority│   │    Admin Console (/admin)   │
    │  - Blank report sheet       │   │  - Passcode: cleanstreet2026│   │  - Passcode: cleanstreet2026│
    │  - Duplicate suggestion     │   │  - Real-time field KPIs     │   │  - Master status override   │
    │  - Upvote priority system   │   │  - 1-click crew dispatch    │   │  - Bulk actions & CSV export│
    │  - Sorting by Upvotes       │   │  - Ground inspection logs   │   │  - Database purge action    │
    │  - SWM 2016 sorting guide   │   │  - Photo lightbox preview   │   │                             │
    └──────────────┬──────────────┘   └──────────────┬──────────────┘   └──────────────┬──────────────┘
                   │                                 │                                 │
                   └────────────────────────┬────────┴─────────────────────────────────┘
                                            ▼
                               ┌─────────────────────────────┐
                               │     SQLite DBMS Engine      │
                               │      (cleanstreet.db)       │
                               │   WAL Mode · Full ACID      │
                               └─────────────────────────────┘
```

| Portal | URL | Access Level | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Public Resident App** | [`http://localhost:3000/`](http://localhost:3000/) | Public (Citizens) | File reports without personal data, receive instant duplicate alerts, upvote urgent issues, filter by locality, view waste sorting guide. |
| **Field Operations Desk** | [`http://localhost:3000/authority`](http://localhost:3000/authority) | Protected (`cleanstreet2026`) | Ward supervisor desk, 1-click **"⚡ Acknowledge & Confirm"**, ground crew assignment, photo inspection, and activity notes. |
| **Central Admin Portal** | [`http://localhost:3000/admin`](http://localhost:3000/admin) | Protected (`cleanstreet2026`) | Executive overview, **Bulk Confirm / Resolve**, **Official CSV Export**, and **`🗑 Clear All Data (Purge Database)`**. |

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v20+ recommended; uses native `node:sqlite`)
- npm

### 1. Boot the Server & Database
```bash
npm start
```
The server will start on `http://localhost:3000`, automatically initialize `cleanstreet.db` in high-concurrency WAL mode, and ensure upload folders are created.

```
====================================================
🌿 CleanStreet Full-Stack Server Running!
📡 URL:       http://localhost:3000
💾 DBMS:      SQLite3 (cleanstreet.db)
📁 Uploads:   D:\HACKTOBER\uploads
🗜️  Target:    ≤ 200 KB Image Compression for Complaints
====================================================
```

### 2. Access the Applications
- **Resident Web App**: [http://localhost:3000](http://localhost:3000)
- **Field Authority Desk**: [http://localhost:3000/authority](http://localhost:3000/authority) *(Passcode: `cleanstreet2026`)*
- **Central Admin Console**: [http://localhost:3000/admin](http://localhost:3000/admin) *(Passcode: `cleanstreet2026`)*

---

## ✨ Core Features & Innovations

### 1. 🔥 Community Upvoting & Priority Highlighting
- Residents can click **`▲ Upvote Issue`** on any report to indicate urgency to ward authorities.
- The default view sort (**`🔥 Most Upvoted (High Priority)`**) dynamically floats the most critical issues to the top of the feed.
- High-upvote issues receive a **`🔥 Top Priority (X Upvotes)`** badge.
- Upvoting an unconfirmed issue automatically advances its status to **`In Progress (Review)`**.

### 2. 🔍 Proactive Duplicate Detection & Privacy Preservation
- **Zero Personal Data Required:** Submissions require only issue type, locality, and description. No names, phone numbers, emails, or exact GPS coordinates are requested.
- **Smart Duplicate Suggestion:** Typing a location checks for existing community reports of the same category nearby and offers to upvote the existing issue instead of creating duplicate tickets, while never blocking the user from filing a new report.

### 3. 🗑️ Centralized Data Purge
- Regular citizen pages are kept strictly read/write for civic complaints without administrative destructive controls.
- Central Administrators have a dedicated **`🗑 Clear All Data (Purge Database)`** control in `/admin` with confirmation guards to wipe test submissions across both the database and public feeds.

### 4. 🗜️ Integrated Canvas Image Compressor (≤ 200 KB Standard)
- Standardizes civic photo uploads using HTML5 canvas downscaling and progressive quantization.
- Compresses 3–8 MB camera photos to **50–140 KB (80–90% bandwidth reduction)** before transmission.

### 5. 🔍 Bilingual Waste-Sorting Quick-Checker (SWM Rules 2016)
- Instant search across **35+ Indian household waste items** in English and Hindi.
- Categorization into **Green Bin (Wet)**, **Blue Bin (Dry)**, **Red Bin (E-Waste)**, and **Black Bin (Hazardous/Sanitary)** with transparent MoEFCC SWM 2016 metadata.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Server health check and SQLite connection diagnostics |
| `GET` | `/api/stats` | Aggregate counters (Total, New, In Progress, Resolved) |
| `GET` | `/api/reports` | Retrieve reports with optional filters (`status`, `type`, `area`, `search`) |
| `GET` | `/api/reports/:id` | Fetch single report details with timeline and confirmation history |
| `POST` | `/api/reports` | Submit a new waste complaint (supports multipart and base64) |
| `POST` | `/api/reports/:id/confirm` | Upvote / confirm an issue and advance status to In Progress |
| `PATCH` | `/api/reports/:id/status` | Update complaint status and append an audit timeline log |
| `DELETE`| `/api/reports/:id` | Permanently remove an individual complaint |
| `POST` | `/api/reports/bulk-status` | Bulk update status for multiple selected reports |
| `POST` | `/api/reports/reset` | Purge all complaints from SQLite DBMS (Admin only) |
| `GET` | `/api/reports/export/csv` | Download official municipal CSV export of all reports |

---

## ♿ Accessibility & Standards Compliance

- **WCAG 2.2 AA Verified:** Strict heading hierarchy, semantic elements (`<main>`, `<section>`, `<article>`, `<fieldset>`), and accessible form labels with `aria-describedby` error announcements.
- **Keyboard Navigation:** Full keyboard operability across navigation tabs, sorting chips, modals, and photo lightboxes.
- **Motion Resilience:** Fully respects `prefers-reduced-motion` settings.
- **Bilingual English & Hindi:** Instant one-click language toggle across the entire application.
