/* admin-main.js — Tab switching, Toast, Auth guard, Stats */

const BASE = '..';

// ── Auth Guard ────────────────────────────────────────────────────────────
window.onload = function () {
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    if (!name || role !== 'ADMIN') {
        window.location.href = '../index.html';
        return;
    }
    document.getElementById('admin-name').textContent = name;
    loadStats();
    loadBuses();
};

// ── Tab Switching ─────────────────────────────────────────────────────────
const tabTitles = {
    dashboard: 'Dashboard',
    buses:     'Bus Management',
    routes:    'Route Management',
    bookings:  'All Bookings',
    users:     'All Users'
};

function showTab(tab) {
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('nav-' + tab).classList.add('active');
    document.getElementById('page-title').textContent = tabTitles[tab];

    if (tab === 'dashboard')  loadStats();
    if (tab === 'buses')      loadBuses();
    if (tab === 'routes')     loadRoutes();
    if (tab === 'bookings')   loadBookings();
    if (tab === 'users')      loadUsers();
}

// ── Stats ─────────────────────────────────────────────────────────────────
function loadStats() {
    fetch(BASE + '/api/user?action=stats')
        .then(r => r.json())
        .then(s => {
            document.getElementById('stat-buses').textContent    = s.totalBuses    || 0;
            document.getElementById('stat-routes').textContent   = s.totalRoutes   || 0;
            document.getElementById('stat-bookings').textContent = s.totalBookings || 0;
            document.getElementById('stat-users').textContent    = s.totalUsers    || 0;
            document.getElementById('stat-revenue').textContent  = '₹' + (s.totalRevenue || 0).toLocaleString('en-IN');
        })
        .catch(() => showToast('Failed to load stats', 'error'));
}

// ── Toast ─────────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className   = 'show ' + type;
    setTimeout(() => { t.className = ''; }, 3000);
}

// ── Logout ────────────────────────────────────────────────────────────────
function logout() {
    localStorage.clear();
    window.location.href = '../index.html';
}
