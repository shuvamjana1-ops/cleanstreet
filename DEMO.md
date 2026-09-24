# CleanStreet 🌿 — Live Demo & Presentation Script

**Presentation Length:** 60 to 90 Seconds  
**Portals Setup:**
- Server running: `npm start` (`http://localhost:3000`)
- Tab 1: Resident Portal — `http://localhost:3000/#reports`
- Tab 2: Field Authority Desk — `http://localhost:3000/authority` (Passcode: `cleanstreet2026`)
- Tab 3: Central Admin Console — `http://localhost:3000/admin` (Passcode: `cleanstreet2026`)

---

## ⏱️ Step-by-Step Presentation Walkthrough

### 1. Citizen Portal: Reporting & Smart Duplicate Alert (20s)
1. Navigate to **Report Issue** (`#form`).
2. Show the **Privacy Notice**: zero personal data (no names, phones, or GPS) required.
3. Select **"Blocked Drain"** and type **"Market Road"** in Location.
4. Point out the **Similar Report Suggestion**:
   > *"CleanStreet proactively prevents duplicate complaints. If an issue is already reported nearby, citizens can simply upvote the existing ticket or continue submitting their new report."*
5. Submit the complaint to show instant SQLite persistence and canvas image compression (≤ 200 KB).

---

### 2. View Format & Community Upvoting Priority (25s)
1. Go to **Track Reports** (`#reports`).
2. Point out the **Sort by** dropdown set to **`🔥 Most Upvoted (High Priority)`**:
   > *"Reports are prioritized dynamically based on citizen upvotes. The most urgent community issues float to the top with a 'Top Priority' badge."*
3. Click **`▲ Upvote Issue`** on a report:
   > *"Notice that upvoting atomically updates the database and immediately changes the status from New to In Progress (Review), alerting sanitation teams."*
4. Expand the **`🕒 Activity Timeline`** to show the transparent in-app audit history.

---

### 3. Field Authority Desk & Ground Crew Dispatch (20s)
1. Switch to **Field Authority Desk** (`/authority`).
2. Unlock with passcode `cleanstreet2026`.
3. Show the **Real-Time Operations Dashboard** (Pending, Dispatched, Resolved).
4. Locate the newly logged complaint and click **`⚡ Confirm Issue & Set In Progress`**:
   > *"Field supervisors can inspect photos, type dispatch log notes, and update ground status in real time."*

---

### 4. Central Admin Console & Data Purge (15s)
1. Switch to **Central Admin Console** (`/admin`).
2. Point out the **`📥 Export CSV`** and **`🗑 Clear All Data (Purge Database)`** buttons:
   > *"Admins have complete control: they can export reports for municipal records or purge demo data in one click to reset the entire public system cleanly."*

---

## 🏆 Checklist of Key Strengths

| Capability | Where to Find | Value |
| :--- | :--- | :--- |
| **Three Isolated Portals** | `/`, `/authority`, `/admin` | Clean separation between citizens, field supervisors, and system administrators |
| **Upvote Priority Sorting** | Resident view (`#reports`) | Identifies the most critical community issues without complex algorithms |
| **Proactive Duplicate Detection** | Report form (`#form`) | Suggests existing tickets without blocking new submissions |
| **Canvas Photo Compressor** | Report form (`#form`) | Downscales photos to strictly ≤ 200 KB, saving 85%+ civic bandwidth |
| **ACID SQLite DBMS** | `cleanstreet.db` | High-concurrency WAL mode with native Node.js SQLite integration |
| **WCAG 2.2 AA & Bilingual** | Throughout the app | Screen-reader accessible, keyboard-operable, and bilingual in English & Hindi |
