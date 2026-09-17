/* admin-buses.js — Bus CRUD */

let allBuses = [];

// ── Load & Render ─────────────────────────────────────────────────────────
function loadBuses() {
    fetch(BASE + '/api/bus?action=all')
        .then(r => r.json())
        .then(data => { allBuses = data; renderBuses(); })
        .catch(() => showToast('Failed to load buses', 'error'));
}

function renderBuses() {
    const tbody = document.getElementById('bus-tbody');
    if (!allBuses.length) {
        tbody.innerHTML = '<tr><td colspan="7"><div class="empty"><i class="fa fa-bus"></i>No buses found. Add one!</div></td></tr>';
        return;
    }
    tbody.innerHTML = allBuses.map(b => `
        <tr>
            <td>${b.busId}</td>
            <td><strong>${b.busName}</strong></td>
            <td><code style="color:var(--teal)">${b.busNumber}</code></td>
            <td><span class="badge badge-${b.busType === 'AC' ? 'ac' : b.busType === 'Luxury' ? 'luxury' : 'nonac'}">${b.busType}</span></td>
            <td>${b.totalSeats}</td>
            <td style="color:${b.availableSeats > 0 ? 'var(--green)' : 'var(--red)'}">${b.availableSeats}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="openEditBus(${b.busId})">
                    <i class="fa fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteBus(${b.busId}, '${b.busName}')">
                    <i class="fa fa-trash"></i> Delete
                </button>
            </td>
        </tr>`).join('');
}

// ── Modal Open/Close ──────────────────────────────────────────────────────
function openAddBus() {
    document.getElementById('bus-modal-title').textContent = 'Add New Bus';
    document.getElementById('bus-id').value     = '';
    document.getElementById('bus-name').value   = '';
    document.getElementById('bus-number').value = '';
    document.getElementById('bus-seats').value  = '';
    document.getElementById('bus-type').value   = 'AC';
    document.getElementById('bus-modal').classList.add('open');
}

function openEditBus(busId) {
    const b = allBuses.find(x => x.busId === busId);
    if (!b) return;
    document.getElementById('bus-modal-title').textContent = 'Edit Bus';
    document.getElementById('bus-id').value     = b.busId;
    document.getElementById('bus-name').value   = b.busName;
    document.getElementById('bus-number').value = b.busNumber;
    document.getElementById('bus-seats').value  = b.totalSeats;
    document.getElementById('bus-type').value   = b.busType;
    document.getElementById('bus-modal').classList.add('open');
}

function closeBusModal() {
    document.getElementById('bus-modal').classList.remove('open');
}

// ── Save (Add or Edit) ────────────────────────────────────────────────────
function saveBus() {
    const busId    = document.getElementById('bus-id').value;
    const busName  = document.getElementById('bus-name').value.trim();
    const busNum   = document.getElementById('bus-number').value.trim();
    const seats    = document.getElementById('bus-seats').value;
    const busType  = document.getElementById('bus-type').value;
    const adminId  = localStorage.getItem('userId') || 1;

    if (!busName || !busNum || !seats) { showToast('Please fill all fields', 'error'); return; }

    const isEdit = !!busId;
    const body   = isEdit
        ? `action=edit&busId=${busId}&busName=${encodeURIComponent(busName)}&busNumber=${encodeURIComponent(busNum)}&totalSeats=${seats}&busType=${busType}`
        : `action=add&busName=${encodeURIComponent(busName)}&busNumber=${encodeURIComponent(busNum)}&totalSeats=${seats}&busType=${busType}&operatorId=${adminId}`;

    fetch(BASE + '/api/bus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            showToast(data.message);
            closeBusModal();
            loadBuses();
            loadStats();
        } else {
            showToast(data.message, 'error');
        }
    })
    .catch(() => showToast('Server error', 'error'));
}

// ── Delete ────────────────────────────────────────────────────────────────
function deleteBus(busId, busName) {
    if (!confirm(`Delete bus "${busName}" and all its routes/bookings?`)) return;
    fetch(BASE + '/api/bus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=delete&busId=${busId}`
    })
    .then(r => r.json())
    .then(data => {
        showToast(data.message, data.status === 'success' ? 'success' : 'error');
        if (data.status === 'success') { loadBuses(); loadStats(); }
    })
    .catch(() => showToast('Server error', 'error'));
}
