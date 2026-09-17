/* passenger-main.js — Auth guard, tab switching, toast, logout */

const BASE = '..';

window.onload = function () {
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    if (!name || role !== 'PASSENGER') {
        window.location.href = '../index.html';
        return;
    }
    document.getElementById('sidebar-name').textContent  = name;
    document.getElementById('passenger-badge').textContent = name;

    loadCities();       // load city names for autocomplete
    showTab('search');
};

// ── Tab Switch ────────────────────────────────────────────────────────────
const tabTitles = { search: 'Search Buses', bookings: 'My Bookings' };

function showTab(tab) {
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('nav-' + tab).classList.add('active');
    document.getElementById('page-title').textContent = tabTitles[tab];
    if (tab === 'bookings') loadMyBookings();
}

// ── Toast ─────────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className   = 'show ' + type;
    setTimeout(() => { t.className = ''; }, 3200);
}

// ── Logout ────────────────────────────────────────────────────────────────
function logout() {
    localStorage.clear();
    window.location.href = '../index.html';
}
