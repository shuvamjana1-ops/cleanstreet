/**
 * CleanStreet — authority.js
 * Municipal Authority & Field Operations Portal Controller
 */

'use strict';

const PASSCODE = 'cleanstreet2026';
let allReports = [];
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
  const isAuth = sessionStorage.getItem('cleanstreet_authority_auth') === 'granted';
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
      sessionStorage.setItem('cleanstreet_authority_auth', 'granted');
      checkAuth();
      showToast('Authority session authorized. Welcome back, Supervisor.', 'success');
    } else {
      showToast('Incorrect passcode. Use: cleanstreet2026', 'error');
      input.value = '';
      input.focus();
    }
  });

  lockBtn?.addEventListener('click', () => {
    sessionStorage.removeItem('cleanstreet_authority_auth');
    checkAuth();
    showToast('Authority session locked.', '');
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
      renderAuthorityList();
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
    console.error('[Authority] Error loading reports:', err);
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

function getFilteredAuthorityReports() {
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

function renderAuthorityList() {
  const container = document.getElementById('authority-reports-list');
  const emptyState = document.getElementById('authority-empty-state');
  const countBadge = document.getElementById('filter-count-badge');
  if (!container) return;

  container.innerHTML = '';
  const filtered = getFilteredAuthorityReports();

  if (countBadge) {
    countBadge.textContent = `Showing ${filtered.length} of ${allReports.length} complaints`;
  }

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    container.style.display = 'none';
    return;
  }

  emptyState.classList.add('hidden');
  container.style.display = 'flex';

  filtered.forEach(report => {
    const card = createAuthorityComplaintCard(report);
    container.appendChild(card);
  });
}

function createAuthorityComplaintCard(report) {
  const card = document.createElement('article');
  card.className = 'authority-complaint-card';
  card.id = `report-card-${report.id}`;

  const typeLabel = ISSUE_LABELS[report.type] || '📋 Other';
  const dateFormatted = formatAuthorityDate(report.created_at || report.createdAt);
  const photoSrc = report.photo_url || report.photoDataUrl;

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

  const isPending = report.status === 'new';

  card.innerHTML = `
    <!-- Left Column: Complaint Details -->
    <div>
      <div class="complaint-header-row">
        <div>
          <span class="complaint-type-tag">${typeLabel}</span>
          <h2 class="complaint-location">${escHtml(report.location)}</h2>
        </div>
        ${statusBadgeHtml(report.status)}
      </div>

      ${report.description ? `<p class="complaint-desc">"${escHtml(report.description)}"</p>` : ''}

      ${photoHtml}

      <div class="complaint-meta-row">
        <span>📅 Logged: ${dateFormatted}</span>
        <span>ID: <code>${report.id}</code></span>
        <span class="confirm-badge-indicator">👍 ${report.confirmations || 1} Citizen Support</span>
      </div>

      ${timeline.length > 0 ? `
        <div class="authority-timeline-wrap">
          <button type="button" class="authority-timeline-toggle" data-id="${report.id}">
            <span>🕒 Field Inspection &amp; Activity Log (${timeline.length})</span>
            <span>▾</span>
          </button>
          <div class="authority-timeline-list hidden" id="timeline-${report.id}">
            ${timelineStepsHtml}
          </div>
        </div>
      ` : ''}
    </div>

    <!-- Right Column: Dispatch & Quick Confirm Action Form -->
    <div class="authority-dispatch-box">
      <div>
        <h3 class="dispatch-box-title">
          <span>⚙️</span> Authority Field Action
        </h3>

        ${isPending ? `
          <div style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.25);border-radius:8px;padding:0.75rem;margin-bottom:0.75rem;">
            <p style="margin:0 0 0.5rem 0;font-size:0.8rem;color:#0369a1;font-weight:600;">Status is New / Pending Inspection</p>
            <button type="button" class="btn-quick-confirm" data-id="${report.id}" style="width:100%;padding:0.5rem;background:#0284c7;color:#fff;border:none;border-radius:6px;font-weight:700;font-size:0.82rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.4rem;">
              <span>⚡</span> Confirm Issue &amp; Set In Progress
            </button>
          </div>
        ` : ''}

        <label for="status-${report.id}" style="font-size:.78rem;font-weight:600;color:#475569;display:block;margin-bottom:4px;">Set Tracking Status:</label>
        <select id="status-${report.id}" class="admin-select" style="width:100%;box-sizing:border-box;">
          <option value="new"        ${report.status === 'new' ? 'selected' : ''}>🔵 New (Pending Inspection)</option>
          <option value="inprogress" ${report.status === 'inprogress' ? 'selected' : ''}>🟡 In Progress (Crew Dispatched)</option>
          <option value="resolved"   ${report.status === 'resolved' ? 'selected' : ''}>🟢 Resolved (Cleared &amp; Closed)</option>
        </select>

        <label for="note-${report.id}" style="font-size:.78rem;font-weight:600;color:#475569;display:block;margin-top:8px;">Dispatch / Ground Log Note:</label>
        <textarea id="note-${report.id}" class="dispatch-note-input" placeholder="e.g. Assigned Ward 12 compactor crew; debris cleared on site"></textarea>
      </div>

      <div class="dispatch-actions-row">
        <button type="button" class="btn-dispatch-save" data-id="${report.id}">
          ✓ Update &amp; Dispatch
        </button>
        <button type="button" class="btn-delete-report" data-id="${report.id}" title="Delete complaint">
          🗑
        </button>
      </div>
    </div>
  `;

  // Attach event handlers
  // 1. Quick Confirm button
  const quickConfirmBtn = card.querySelector('.btn-quick-confirm');
  quickConfirmBtn?.addEventListener('click', async () => {
    quickConfirmBtn.disabled = true;
    quickConfirmBtn.textContent = 'Confirming…';
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(report.id)}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'inprogress',
          note: 'Inspected and confirmed by Municipal Authority. Tracking status changed to In Progress.',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Issue ${report.id} confirmed! Tracking status changed to In Progress 🟡`, 'success');
        await loadDashboard();
      } else {
        showToast(data.error || 'Failed to confirm issue', 'error');
        quickConfirmBtn.disabled = false;
      }
    } catch (err) {
      showToast('Network error confirming issue', 'error');
      quickConfirmBtn.disabled = false;
    }
  });

  // 2. Dispatch Update
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
        showToast(`Complaint status updated to "${newStatus}".`, 'success');
        await loadDashboard();
      } else {
        showToast(data.error || 'Failed to update status', 'error');
        updateBtn.disabled = false;
        updateBtn.textContent = '✓ Update & Dispatch';
      }
    } catch (err) {
      showToast('Network error while updating status', 'error');
      updateBtn.disabled = false;
      updateBtn.textContent = '✓ Update & Dispatch';
    }
  });

  // 3. Delete / Dismiss
  const delBtn = card.querySelector('.btn-delete-report');
  delBtn?.addEventListener('click', async () => {
    if (!confirm(`Are you sure you want to dismiss complaint ${report.id}? This will remove it from the system.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(report.id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Complaint ${report.id} dismissed.`, 'success');
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

// Helpers
function statusBadgeHtml(status) {
  const map = {
    new:        { cls: 'status-pill-new',        label: '🔵 New (Pending)' },
    inprogress: { cls: 'status-pill-inprogress', label: '🟡 In Progress' },
    resolved:   { cls: 'status-pill-resolved',   label: '🟢 Resolved' },
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

// Init Toolbar Filters
function initFilters() {
  document.getElementById('filter-authority-status')?.addEventListener('change', renderAuthorityList);
  document.getElementById('filter-authority-type')?.addEventListener('change', renderAuthorityList);
  document.getElementById('search-authority-query')?.addEventListener('input', renderAuthorityList);
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
  initPhotoModal();
  checkAuth();
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(hidePreloader, prefersReducedMotion ? 0 : 600);
});
