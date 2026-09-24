/**
 * CleanStreet — admin.js
 * Central System Administrator & Management Portal Controller
 */

'use strict';

const PASSCODE = 'cleanstreet2026';
let allReports = [];
let selectedReportIds = new Set();
let refreshTimer = null;

const ISSUE_LABELS = {
  overflow: '🗑 Overflowing Bin',
  missed:   '🚛 Missed Pickup',
  dumping:  '⚠️ Illegal Dumping',
  drain:    '🌊 Blocked Drain',
  other:    '📋 Other Issue',
};

// ====================================================
// AUTHENTICATION GATE
// ====================================================

function checkAuth() {
  const gateModal = document.getElementById('auth-gate-modal');
  const isAuth = sessionStorage.getItem('cleanstreet_admin_auth') === 'granted';
  if (isAuth) {
    if (gateModal) gateModal.classList.add('hidden');
    loadDashboard();
    startAutoRefresh();
  } else {
    if (gateModal) gateModal.classList.remove('hidden');
    stopAutoRefresh();
  }
}

function initAuth() {
  const form = document.getElementById('auth-gate-form');
  const input = document.getElementById('auth-passcode');
  const lockBtn = document.getElementById('btn-lock-session');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value.trim() === PASSCODE) {
      sessionStorage.setItem('cleanstreet_admin_auth', 'granted');
      checkAuth();
      showToast('Admin console unlocked. Welcome Administrator.', 'success');
    } else {
      showToast('Incorrect passcode. Use: cleanstreet2026', 'error');
      input.value = '';
      input.focus();
    }
  });

  lockBtn?.addEventListener('click', () => {
    sessionStorage.removeItem('cleanstreet_admin_auth');
    checkAuth();
    showToast('Admin session locked.', '');
  });
}

// ====================================================
// DASHBOARD METRICS & DATA FETCHING
// ====================================================

async function loadDashboard() {
  try {
    const [reportsRes, statsRes] = await Promise.all([
      fetch('/api/reports'),
      fetch('/api/stats'),
    ]);

    if (reportsRes.ok) {
      const data = await reportsRes.json();
      allReports = Array.isArray(data.reports) ? data.reports : [];
      renderAdminList();
    }

    if (statsRes.ok) {
      const data = await statsRes.json();
      const stats = data.stats || {};
      document.getElementById('metric-total').textContent = stats.total || 0;
      document.getElementById('metric-new').textContent = stats.new || 0;
      document.getElementById('metric-progress').textContent = stats.inprogress || 0;
      document.getElementById('metric-resolved').textContent = stats.resolved || 0;
    }
  } catch (err) {
    console.error('[Admin] Error loading reports:', err);
  }
}

function startAutoRefresh() {
  stopAutoRefresh();
  refreshTimer = setInterval(() => {
    loadDashboard();
  }, 10000); // 10s live interval
}

function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

// ====================================================
// FILTERING & RENDERING
// ====================================================

function getFilteredReports() {
  const statusFilter = document.getElementById('filter-authority-status')?.value || 'all';
  const typeFilter = document.getElementById('filter-authority-type')?.value || 'all';
  const query = (document.getElementById('search-authority-query')?.value || '').trim().toLowerCase();

  return allReports.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (query) {
      const loc = (r.location || '').toLowerCase();
      const desc = (r.description || '').toLowerCase();
      const id = (r.id || '').toLowerCase();
      if (!loc.includes(query) && !desc.includes(query) && !id.includes(query)) return false;
    }
    return true;
  }).sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
}

function renderAdminList() {
  const container = document.getElementById('authority-reports-list');
  const emptyState = document.getElementById('authority-empty-state');
  const countBadge = document.getElementById('filter-count-badge');
  if (!container) return;

  container.innerHTML = '';
  const filtered = getFilteredReports();

  if (countBadge) {
    countBadge.textContent = `Showing ${filtered.length} of ${allReports.length} complaints`;
  }

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    container.style.display = 'none';
    updateBulkControls();
    return;
  }

  emptyState.classList.add('hidden');
  container.style.display = 'flex';

  filtered.forEach(report => {
    const card = createAdminComplaintCard(report);
    container.appendChild(card);
  });

  updateBulkControls();
}

function createAdminComplaintCard(report) {
  const card = document.createElement('article');
  card.className = 'authority-complaint-card';
  card.id = `report-card-${report.id}`;

  const typeLabel = ISSUE_LABELS[report.type] || '📋 Other';
  const dateFormatted = formatAuthorityDate(report.created_at || report.createdAt);
  const photoSrc = report.photo_url || report.photoDataUrl;
  const isSelected = selectedReportIds.has(report.id);

  const photoHtml = photoSrc ? `
    <div class="complaint-photo-box">
      <img src="${photoSrc}" class="complaint-photo-img" alt="Photo for ${escHtml(report.location)}" data-full="${photoSrc}" />
      <span class="complaint-photo-badge">📷 ${report.photo_size_kb || '≤ 200'} KB</span>
    </div>
  ` : '';

  // Parse timeline
  let timeline = [];
  if (Array.isArray(report.timeline)) {
    timeline = report.timeline;
  } else if (typeof report.timeline === 'string') {
    try { timeline = JSON.parse(report.timeline); } catch (_) { timeline = []; }
  }

  const timelineStepsHtml = timeline.map(step => `
    <div class="authority-timeline-item">
      <strong>${escHtml(step.title || step.status)}</strong>
      <span>${formatAuthorityDate(step.timestamp || step.time)}</span>
      ${step.note ? `<div style="color:#475569;margin-top:2px;">${escHtml(step.note)}</div>` : ''}
    </div>
  `).join('');

  const nextActionHtml = report.status === 'new' ? `
    <div style="background:rgba(2,132,199,0.06);border:1px solid rgba(2,132,199,0.2);border-radius:8px;padding:0.75rem;margin-bottom:0.75rem;">
      <p style="margin:0 0 0.4rem 0;font-size:0.78rem;color:#0369a1;font-weight:700;">Complaint is New &amp; Unconfirmed</p>
      <button type="button" class="btn-card-confirm" data-id="${report.id}" style="width:100%;padding:0.5rem;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:700;font-size:0.82rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.4rem;">
        <span>⚡</span> Confirm Issue &amp; Set In Progress
      </button>
    </div>
  ` : (report.status === 'inprogress' ? `
    <div style="background:rgba(22,163,74,0.06);border:1px solid rgba(22,163,74,0.2);border-radius:8px;padding:0.75rem;margin-bottom:0.75rem;">
      <p style="margin:0 0 0.4rem 0;font-size:0.78rem;color:#15803d;font-weight:700;">Issue is In Progress</p>
      <button type="button" class="btn-card-resolve" data-id="${report.id}" style="width:100%;padding:0.5rem;background:#16a34a;color:#fff;border:none;border-radius:6px;font-weight:700;font-size:0.82rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.4rem;">
        <span>✓</span> Mark Cleared &amp; Resolved
      </button>
    </div>
  ` : '');

  card.innerHTML = `
    <!-- Left Column: Complaint Details -->
    <div>
      <div class="complaint-header-row">
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <input type="checkbox" class="report-select-checkbox item-select-box" data-id="${report.id}" ${isSelected ? 'checked' : ''} aria-label="Select report ${report.id}" />
          <div>
            <span class="complaint-type-tag">${typeLabel}</span>
            <h2 class="complaint-location" style="margin-top:2px;">${escHtml(report.location)}</h2>
          </div>
        </div>
        ${statusBadgeHtml(report.status)}
      </div>

      ${report.description ? `<p class="complaint-desc">"${escHtml(report.description)}"</p>` : ''}

      ${photoHtml}

      <div class="complaint-meta-row">
        <span>📅 Logged: ${dateFormatted}</span>
        <span>ID: <code>${report.id}</code></span>
        <span class="confirm-badge-indicator">👍 ${report.confirmations || 1} Citizen Confirmations</span>
      </div>

      ${timeline.length > 0 ? `
        <div class="authority-timeline-wrap">
          <button type="button" class="authority-timeline-toggle" data-id="${report.id}">
            <span>🕒 System Audit Trail (${timeline.length} events)</span>
            <span>▾</span>
          </button>
          <div class="authority-timeline-list hidden" id="timeline-${report.id}">
            ${timelineStepsHtml}
          </div>
        </div>
      ` : ''}
    </div>

    <!-- Right Column: Admin Ground / Master Status Action Form -->
    <div class="authority-dispatch-box">
      <div>
        <h3 class="dispatch-box-title">
          <span>🏛️</span> Administrator Action
        </h3>

        ${nextActionHtml}

        <label for="status-${report.id}" style="font-size:.78rem;font-weight:600;color:#475569;display:block;margin-bottom:4px;">Master Status Control:</label>
        <select id="status-${report.id}" class="admin-select" style="width:100%;box-sizing:border-box;">
          <option value="new"        ${report.status === 'new' ? 'selected' : ''}>🔵 New (Unconfirmed)</option>
          <option value="inprogress" ${report.status === 'inprogress' ? 'selected' : ''}>🟡 In Progress (Confirmed / Dispatched)</option>
          <option value="resolved"   ${report.status === 'resolved' ? 'selected' : ''}>🟢 Resolved (Cleared &amp; Closed)</option>
        </select>

        <label for="note-${report.id}" style="font-size:.78rem;font-weight:600;color:#475569;display:block;margin-top:8px;">Administrative Audit Note:</label>
        <textarea id="note-${report.id}" class="dispatch-note-input" placeholder="e.g. Verified by Central Sanitation Admin; priority escalated"></textarea>
      </div>

      <div class="dispatch-actions-row">
        <button type="button" class="btn-dispatch-save" data-id="${report.id}">
          ✓ Save Status
        </button>
        <button type="button" class="btn-delete-report" data-id="${report.id}" title="Permanently delete complaint">
          🗑
        </button>
      </div>
    </div>
  `;

  // Attach event handlers
  // 0. Checkbox selection
  const chk = card.querySelector('.item-select-box');
  chk?.addEventListener('change', (e) => {
    if (e.target.checked) {
      selectedReportIds.add(report.id);
    } else {
      selectedReportIds.delete(report.id);
    }
    updateBulkControls();
  });

  // 1. Quick Confirm button
  const confirmBtn = card.querySelector('.btn-card-confirm');
  confirmBtn?.addEventListener('click', async () => {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Confirming…';
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(report.id)}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'inprogress',
          note: 'Confirmed by Administrator. Tracking status changed to In Progress.',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Issue ${report.id} confirmed! Tracking status changed to In Progress 🟡`, 'success');
        await loadDashboard();
      } else {
        showToast(data.error || 'Failed to confirm', 'error');
        confirmBtn.disabled = false;
      }
    } catch (_) {
      showToast('Network error confirming issue', 'error');
      confirmBtn.disabled = false;
    }
  });

  // 1b. Quick Resolve button
  const resolveBtn = card.querySelector('.btn-card-resolve');
  resolveBtn?.addEventListener('click', async () => {
    resolveBtn.disabled = true;
    resolveBtn.textContent = 'Resolving…';
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(report.id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'resolved',
          note: 'Marked resolved and closed by Central Administrator.',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Issue ${report.id} marked Resolved 🟢`, 'success');
        await loadDashboard();
      } else {
        showToast(data.error || 'Failed to resolve', 'error');
        resolveBtn.disabled = false;
      }
    } catch (_) {
      showToast('Network error resolving issue', 'error');
      resolveBtn.disabled = false;
    }
  });

  // 2. Dispatch Save Update
  const updateBtn = card.querySelector('.btn-dispatch-save');
  updateBtn?.addEventListener('click', async () => {
    const sel = card.querySelector(`#status-${report.id}`);
    const noteInput = card.querySelector(`#note-${report.id}`);
    const newStatus = sel.value;
    const note = noteInput.value.trim();

    updateBtn.disabled = true;
    updateBtn.textContent = 'Saving…';

    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(report.id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Report ${report.id} status updated to "${newStatus}".`, 'success');
        await loadDashboard();
      } else {
        showToast(data.error || 'Failed to update status', 'error');
        updateBtn.disabled = false;
        updateBtn.textContent = '✓ Save Status';
      }
    } catch (err) {
      showToast('Network error while updating status', 'error');
      updateBtn.disabled = false;
      updateBtn.textContent = '✓ Save Status';
    }
  });

  // 3. Delete
  const delBtn = card.querySelector('.btn-delete-report');
  delBtn?.addEventListener('click', async () => {
    if (!confirm(`Are you sure you want to permanently delete complaint ${report.id}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(report.id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        selectedReportIds.delete(report.id);
        showToast(`Complaint ${report.id} deleted.`, 'success');
        await loadDashboard();
      } else {
        showToast(data.error || 'Failed to delete complaint', 'error');
      }
    } catch (err) {
      showToast('Network error while deleting', 'error');
    }
  });

  // 4. Toggle Timeline Drawer
  const timelineToggle = card.querySelector('.authority-timeline-toggle');
  const timelineList = card.querySelector(`#timeline-${report.id}`);
  timelineToggle?.addEventListener('click', () => {
    timelineList?.classList.toggle('hidden');
  });

  // 5. Photo Lightbox
  const photoImg = card.querySelector('.complaint-photo-img');
  photoImg?.addEventListener('click', () => {
    openPhotoModal(photoImg.dataset.full);
  });

  return card;
}

// ====================================================
// BULK ACTIONS & EXPORT
// ====================================================

function updateBulkControls() {
  const countSpan = document.getElementById('bulk-selected-count');
  const confirmBtn = document.getElementById('btn-bulk-confirm-action');
  const resolveBtn = document.getElementById('btn-bulk-resolve-action');
  const deleteBtn = document.getElementById('btn-bulk-delete-action');
  const selectAllChk = document.getElementById('bulk-select-all');

  const count = selectedReportIds.size;
  if (countSpan) countSpan.textContent = `(${count} selected)`;
  if (confirmBtn) confirmBtn.disabled = count === 0;
  if (resolveBtn) resolveBtn.disabled = count === 0;
  if (deleteBtn) deleteBtn.disabled = count === 0;

  const filtered = getFilteredReports();
  if (selectAllChk) {
    selectAllChk.checked = filtered.length > 0 && filtered.every(r => selectedReportIds.has(r.id));
  }
}

function initBulkActions() {
  const selectAllChk = document.getElementById('bulk-select-all');
  const confirmBtn = document.getElementById('btn-bulk-confirm-action');
  const resolveBtn = document.getElementById('btn-bulk-resolve-action');
  const deleteBtn = document.getElementById('btn-bulk-delete-action');
  const purgeResolvedBtn = document.getElementById('btn-admin-purge-resolved');
  const exportBtn = document.getElementById('btn-export-csv');

  selectAllChk?.addEventListener('change', (e) => {
    const filtered = getFilteredReports();
    if (e.target.checked) {
      filtered.forEach(r => selectedReportIds.add(r.id));
    } else {
      filtered.forEach(r => selectedReportIds.delete(r.id));
    }
    renderAdminList();
  });

  confirmBtn?.addEventListener('click', async () => {
    const ids = Array.from(selectedReportIds);
    if (ids.length === 0) return;
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Processing…';

    try {
      const res = await fetch('/api/reports/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids,
          status: 'inprogress',
          note: 'Bulk confirmed and marked In Progress by Central Administrator.',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Bulk confirmation completed for ${data.updatedCount} reports.`, 'success');
        selectedReportIds.clear();
        await loadDashboard();
      } else {
        showToast(data.error || 'Bulk update failed', 'error');
      }
    } catch (_) {
      showToast('Network error during bulk update', 'error');
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = '<span>⚡</span> Confirm &amp; Mark In Progress';
    }
  });

  resolveBtn?.addEventListener('click', async () => {
    const ids = Array.from(selectedReportIds);
    if (ids.length === 0) return;
    resolveBtn.disabled = true;
    resolveBtn.textContent = 'Processing…';

    try {
      const res = await fetch('/api/reports/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids,
          status: 'resolved',
          note: 'Bulk marked Resolved and cleared by Central Administrator.',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Bulk resolved ${data.updatedCount} reports.`, 'success');
        selectedReportIds.clear();
        await loadDashboard();
      } else {
        showToast(data.error || 'Bulk resolve failed', 'error');
      }
    } catch (_) {
      showToast('Network error during bulk resolve', 'error');
    } finally {
      resolveBtn.disabled = false;
      resolveBtn.innerHTML = '<span>✓</span> Mark Resolved';
    }
  });

  // Bulk Delete Selected Reports & Their Images
  deleteBtn?.addEventListener('click', async () => {
    const ids = Array.from(selectedReportIds);
    if (ids.length === 0) return;
    if (!confirm(`Permanently delete ${ids.length} selected complaints?\n\nAll associated problem photos will be erased from storage and database.`)) {
      return;
    }

    deleteBtn.disabled = true;
    deleteBtn.textContent = 'Deleting…';

    try {
      const res = await fetch('/api/reports/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Deleted ${data.deletedCount} reports and removed ${data.deletedPhotos} problem photos from storage.`, 'success');
        selectedReportIds.clear();
        await loadDashboard();
      } else {
        showToast(data.error || 'Bulk delete failed', 'error');
      }
    } catch (_) {
      showToast('Network error during bulk delete', 'error');
    } finally {
      deleteBtn.disabled = false;
      deleteBtn.innerHTML = '<span>🗑</span> Delete Selected';
    }
  });

  // Remove All Solved / Resolved Reports & Their Images
  purgeResolvedBtn?.addEventListener('click', async () => {
    const confirmed = window.confirm(
      '🧹 REMOVE ALL SOLVED REPORTS\n\nAre you sure you want to delete all Resolved complaints?\n\nAll problem photos associated with resolved reports will be permanently deleted from the database and storage.'
    );
    if (!confirmed) return;

    purgeResolvedBtn.disabled = true;
    purgeResolvedBtn.textContent = 'Cleaning…';

    try {
      const res = await fetch('/api/reports/delete-resolved', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Cleaned! Removed ${data.deletedCount} solved reports and deleted ${data.deletedPhotos} photo files from storage.`, 'success');
        selectedReportIds.clear();
        await loadDashboard();
      } else {
        showToast(data.error || 'Failed to remove solved reports', 'error');
      }
    } catch (err) {
      showToast('Network error while removing solved reports', 'error');
    } finally {
      purgeResolvedBtn.disabled = false;
      purgeResolvedBtn.innerHTML = '<span>🧹</span> Remove Solved Reports (Delete Images)';
    }
  });

  exportBtn?.addEventListener('click', () => {
    window.location.href = '/api/reports/export/csv';
    showToast('Generating official CSV export…', 'success');
  });

  const purgeBtn = document.getElementById('btn-admin-purge-all');
  purgeBtn?.addEventListener('click', async () => {
    const confirmed = window.confirm(
      '⚠️ PERMANENT DATABASE PURGE\n\nAre you sure you want to delete ALL reports from the entire system?\n\nThis will remove all complaints and erase all problem photo files from the storage and SQLite database.'
    );
    if (!confirmed) return;

    purgeBtn.disabled = true;
    purgeBtn.textContent = 'Purging…';

    try {
      const res = await fetch('/api/reports/reset', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Database purged! Removed ${data.deletedCount} reports and deleted ${data.deletedPhotos} image files.`, 'success');
        selectedReportIds.clear();
        await loadDashboard();
      } else {
        showToast(data.error || 'Failed to purge database', 'error');
      }
    } catch (err) {
      showToast('Network error during database purge', 'error');
    } finally {
      purgeBtn.disabled = false;
      purgeBtn.innerHTML = '<span>🗑</span> Clear All Data (Purge Database)';
    }
  });
}


// Helpers
function statusBadgeHtml(status) {
  const map = {
    new:        { cls: 'status-pill-new',        label: '🔵 New (Unconfirmed)' },
    inprogress: { cls: 'status-pill-inprogress', label: '🟡 In Progress (Confirmed)' },
    resolved:   { cls: 'status-pill-resolved',   label: '🟢 Resolved (Closed)' },
  };
  const cfg = map[status] || map.new;
  return `<span class="authority-status-pill ${cfg.cls}">${cfg.label}</span>`;
}

function formatAuthorityDate(isoStr) {
  if (!isoStr) return 'Just now';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (_) {
    return isoStr;
  }
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function openPhotoModal(src) {
  const modal = document.getElementById('photo-modal');
  const img = document.getElementById('modal-photo-img');
  if (modal && img) {
    img.src = src;
    modal.classList.remove('hidden');
  }
}

function initPhotoModal() {
  const modal = document.getElementById('photo-modal');
  modal?.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
}

function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 4000);
}

function initFilters() {
  document.getElementById('filter-authority-status')?.addEventListener('change', renderAdminList);
  document.getElementById('filter-authority-type')?.addEventListener('change', renderAdminList);
  document.getElementById('search-authority-query')?.addEventListener('input', renderAdminList);
  document.getElementById('btn-refresh-data')?.addEventListener('click', () => {
    loadDashboard();
    showToast('Dashboard data refreshed.', '');
  });
}

function hidePreloader() {
  const preloader = document.getElementById('app-preloader');
  if (!preloader) return;
  preloader.classList.add('preloader-hidden');
  setTimeout(() => {
    preloader.hidden = true;
    preloader.style.display = 'none';
  }, 300);
}

// DOM Ready Boot
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initFilters();
  initBulkActions();
  initPhotoModal();
  checkAuth();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    const statusText = document.getElementById('preloader-status-text');
    setTimeout(() => { if (statusText) statusText.textContent = 'Verifying Administrative Credentials…'; }, 1400);
    setTimeout(() => { if (statusText) statusText.textContent = 'Loading Central Database Management Engine…'; }, 2900);
    setTimeout(() => { if (statusText) statusText.textContent = 'Ready! Launching Admin Console…'; }, 4400);
  }
  setTimeout(hidePreloader, prefersReducedMotion ? 0 : 5000);
});
