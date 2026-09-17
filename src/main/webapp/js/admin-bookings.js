/* admin-bookings.js — View all bookings, cancel */

let allBookings = [];

// ── Load & Render ─────────────────────────────────────────────────────────
function loadBookings() {
    fetch(BASE + '/api/booking?action=allBookings')
        .then(r => r.json())
        .then(data => { allBookings = data; renderBookings(); })
        .catch(() => showToast('Failed to load bookings', 'error'));
}

function renderBookings() {
    const tbody = document.getElementById('booking-tbody');
    if (!allBookings.length) {
        tbody.innerHTML = '<tr><td colspan="9"><div class="empty"><i class="fa fa-ticket"></i>No bookings yet.</div></td></tr>';
        return;
    }
    tbody.innerHTML = allBookings.map(b => {
        const statusClass = b.status === 'CONFIRMED' ? 'confirmed' : b.status === 'CANCELLED' ? 'cancelled' : 'pending';
        const canCancel   = b.status === 'CONFIRMED';
        const dateStr     = b.bookingDate ? new Date(b.bookingDate).toLocaleDateString('en-IN') : '—';
        return `
        <tr>
            <td>#${b.bookingId}</td>
            <td>
                <strong>${b.passengerName}</strong><br>
                <small style="color:var(--muted)">${b.email}</small>
            </td>
            <td>${b.source} → ${b.destination}</td>
            <td>${b.busName}<br><small style="color:var(--muted)">${b.busNumber}</small></td>
            <td style="text-align:center"><strong>${b.seat}</strong></td>
            <td><strong style="color:var(--green)">₹${b.price}</strong></td>
            <td><span class="badge badge-${statusClass}">${b.status}</span></td>
            <td>${dateStr}</td>
            <td>
                ${canCancel
                    ? `<button class="btn btn-danger btn-sm" onclick="cancelBooking(${b.bookingId})">
                           <i class="fa fa-times"></i> Cancel
                       </button>`
                    : '<span style="color:var(--muted);font-size:0.78rem">—</span>'}
            </td>
        </tr>`;
    }).join('');
}

// ── Cancel Booking ────────────────────────────────────────────────────────
function cancelBooking(bookingId) {
    if (!confirm(`Cancel booking #${bookingId}?`)) return;
    fetch(BASE + '/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=cancel&bookingId=${bookingId}`
    })
    .then(r => r.json())
    .then(data => {
        showToast(data.message, data.status === 'success' ? 'success' : 'error');
        if (data.status === 'success') { loadBookings(); loadStats(); }
    })
    .catch(() => showToast('Server error', 'error'));
}
