/* admin-routes.js — Route CRUD */

let allRoutes = [];

// ── Helpers ───────────────────────────────────────────────────────────────
function fmtDateTime(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}
function toInputDT(dt) {
    if (!dt) return '';
    const d = new Date(dt);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── Load & Render ─────────────────────────────────────────────────────────
function loadRoutes() {
    fetch(BASE + '/api/route?action=all')
        .then(r => r.json())
        .then(data => { allRoutes = data; renderRoutes(); })
        .catch(() => showToast('Failed to load routes', 'error'));
}

function renderRoutes() {
    const tbody = document.getElementById('route-tbody');
    if (!allRoutes.length) {
        tbody.innerHTML = '<tr><td colspan="8"><div class="empty"><i class="fa fa-route"></i>No routes yet. Add one!</div></td></tr>';
        return;
    }
    tbody.innerHTML = allRoutes.map(r => `
        <tr>
            <td>${r.routeId}</td>
            <td><strong>${r.busName}</strong><br><small style="color:var(--muted)">${r.busNumber}</small></td>
            <td>${r.source}</td>
            <td>${r.destination}</td>
            <td>${fmtDateTime(r.departureTime)}</td>
            <td>${fmtDateTime(r.arrivalTime)}</td>
            <td><strong style="color:var(--green)">₹${r.fare}</strong></td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="openEditRoute(${r.routeId})">
                    <i class="fa fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteRoute(${r.routeId})">
                    <i class="fa fa-trash"></i> Delete
                </button>
            </td>
        </tr>`).join('');
}

// ── Populate Bus Dropdown ─────────────────────────────────────────────────
function populateBusDropdown(selectedBusId) {
    const sel = document.getElementById('route-bus-id');
    sel.innerHTML = '';
    allBuses.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.busId;
        opt.textContent = `${b.busName} (${b.busNumber})`;
        if (b.busId === selectedBusId) opt.selected = true;
        sel.appendChild(opt);
    });
}

// ── Modal Open/Close ──────────────────────────────────────────────────────
function openAddRoute() {
    if (!allBuses.length) { showToast('Please add a bus first!', 'error'); return; }
    document.getElementById('route-modal-title').textContent = 'Add New Route';
    document.getElementById('route-id').value          = '';
    document.getElementById('route-source').value      = '';
    document.getElementById('route-destination').value = '';
    document.getElementById('route-departure').value   = '';
    document.getElementById('route-arrival').value     = '';
    document.getElementById('route-fare').value        = '';
    populateBusDropdown(null);
    document.getElementById('route-modal').classList.add('open');
}

function openEditRoute(routeId) {
    const r = allRoutes.find(x => x.routeId === routeId);
    if (!r) return;
    document.getElementById('route-modal-title').textContent = 'Edit Route';
    document.getElementById('route-id').value          = r.routeId;
    document.getElementById('route-source').value      = r.source;
    document.getElementById('route-destination').value = r.destination;
    document.getElementById('route-departure').value   = toInputDT(r.departureTime);
    document.getElementById('route-arrival').value     = toInputDT(r.arrivalTime);
    document.getElementById('route-fare').value        = r.fare;
    populateBusDropdown(r.busId);
    document.getElementById('route-modal').classList.add('open');
}

function closeRouteModal() {
    document.getElementById('route-modal').classList.remove('open');
}

// ── Save (Add or Edit) ────────────────────────────────────────────────────
function saveRoute() {
    const routeId   = document.getElementById('route-id').value;
    const busId     = document.getElementById('route-bus-id').value;
    const source    = document.getElementById('route-source').value.trim();
    const dest      = document.getElementById('route-destination').value.trim();
    const departure = document.getElementById('route-departure').value;
    const arrival   = document.getElementById('route-arrival').value;
    const fare      = document.getElementById('route-fare').value;

    if (!busId || !source || !dest || !departure || !arrival || !fare) {
        showToast('Please fill all fields', 'error'); return;
    }

    const isEdit = !!routeId;
    const body   = isEdit
        ? `action=edit&routeId=${routeId}&busId=${busId}&source=${encodeURIComponent(source)}&destination=${encodeURIComponent(dest)}&departureTime=${encodeURIComponent(departure)}&arrivalTime=${encodeURIComponent(arrival)}&fare=${fare}`
        : `action=add&busId=${busId}&source=${encodeURIComponent(source)}&destination=${encodeURIComponent(dest)}&departureTime=${encodeURIComponent(departure)}&arrivalTime=${encodeURIComponent(arrival)}&fare=${fare}`;

    fetch(BASE + '/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
    })
    .then(r => r.json())
    .then(data => {
        showToast(data.message, data.status === 'success' ? 'success' : 'error');
        if (data.status === 'success') { closeRouteModal(); loadRoutes(); loadStats(); }
    })
    .catch(() => showToast('Server error', 'error'));
}

// ── Delete ────────────────────────────────────────────────────────────────
function deleteRoute(routeId) {
    if (!confirm('Delete this route and all its bookings?')) return;
    fetch(BASE + '/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=delete&routeId=${routeId}`
    })
    .then(r => r.json())
    .then(data => {
        showToast(data.message, data.status === 'success' ? 'success' : 'error');
        if (data.status === 'success') { loadRoutes(); loadStats(); }
    })
    .catch(() => showToast('Server error', 'error'));
}
