# CleanStreet 🌿 — 60-Second Hackathon Judge Demo Script

**Target time:** Exactly 60 seconds (with optional 30-second Q&A buffer)  
**Presenter setup:**  
- Server running: `npm start` (port 3000)
- Browser open at: `http://localhost:3000` (Mobile viewport recommended: 390px × 844px)

---

## ⏱️ 60-Second Presentation Flow

### 00:00 – 00:15 | 1. Neighbourhood Overview & Issue Breakdown (15s)
1. Open **All Reports** (`#reports`).
2. Point out the **Neighbourhood & Issue Overview** dashboard at the top:
   > *"CleanStreet gives citizens and ward supervisors an instant breakdown of civic issues without requiring paid map APIs. Watch the issue distribution bar—it dynamically calculates proportions of overflowing bins, missed pickups, and blocked drains."*
3. Click the **Bengaluru** locality chip:
   > *"With one tap, we isolate Bengaluru neighbourhood complaints. Clicking 'All Localities' instantly brings back the national prototype view."*

---

### 00:15 – 00:30 | 2. Community Confirmations & Activity Timeline (15s)
1. Scroll to the first report card.
2. Click **`🕒 Activity Timeline`**:
   > *"Residents need transparency. CleanStreet's Activity Timeline reveals the complete journey—from initial submission to ward team dispatch and clearing, complete with supervisor notes and prototype disclaimers."*
3. Click **`👍 Still an Issue`**:
   > *"Neighbours can support existing reports. Clicking 'Still an Issue' atomically increments the SQLite confirmation counter and switches to 'Confirmed by you'—with local deduplication preventing repeated accidental clicks."*

---

### 00:30 – 00:45 | 3. Waste-Sorting Quick-Checker (15s)
1. Click **Sorting Guide** (`#guide`) in top navigation.
2. Focus on the **Waste-Sorting Quick-Checker**:
   > *"Residents often struggle with daily sorting. Instead of reading endless municipal PDFs, users type any household item into our bilingual Quick-Checker."*
3. Type **`battery`**:
   > *"Searching 'battery' instantly surfaces AA cells and power banks categorized into the Red Bin with strict hazard warnings."*
4. Click the **Wet Waste** category chip:
   > *"Or tap chips like 'Wet Waste' to view practical tips on composting peels, tea leaves, and coconut husks."*

---

### 00:45 – 01:00 | 4. Auto-Compressing Report & Live Admin Sync (15s)
1. Click **📸 Report an Issue** (`#form`).
2. Show the **Image Compressor**:
   > *"To protect civic bandwidth, any uploaded complaint photo is auto-compressed directly on canvas to strictly under 200 KB before upload."*
3. Click **⚙ Admin** tab:
   > *"When a municipal officer updates a report's status to 'Resolved', CleanStreet doesn't just change a flag—it automatically generates and logs a new chronological event into the Activity Timeline in our SQLite database."*
4. Toggle language **हि**:
   > *"And the entire experience seamlessly supports both English and Hindi."*

---

## 🏆 Summary Checklist for Judges

| Feature | Where to See It | Hackathon Value |
|---|---|---|
| **Activity Timeline** | Report cards (`#reports`) | Transparent civic resolution history with prototype disclaimers |
| **Community Confirmations** | Report cards (`#reports`) | Prevents duplicate reports; client deduplication + SQLite counter |
| **Locality Overview** | Top of Reports feed (`#reports`) | Accessible neighbourhood filtering without expensive map APIs |
| **Waste-Sorting Helper** | Top of Guide tab (`#guide`) | 35+ Indian household waste items with bilingual tips & category chips |
| **Photo Auto-Compressor** | Report Form (`#form`) | Canvas downscaling strictly ≤ 200 KB saving 85%+ civic bandwidth |
| **SQLite DBMS** | Header pill (`🟢 SQLite Online`) | Full ACID persistence with WAL mode & dual-mode offline resilience |
