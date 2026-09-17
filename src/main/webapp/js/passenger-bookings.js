/* passenger-bookings.js — My bookings list + cancel */

// ── Load My Bookings ──────────────────────────────────────────────────────
function loadMyBookings() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        showToast('Session expired. Please login again.', 'error');
        setTimeout(() => window.location.href = '../index.html', 1500);
        return;
    }

    const container = document.getElementById('my-bookings-list');
    container.innerHTML = '<div class="result-info"><i class="fa fa-spinner fa-spin"></i><p>Loading your bookings...</p></div>';

    fetch(`${BASE}/api/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=myBookings&userId=${userId}`
    })
    .then(r => r.json())
    .then(data => renderMyBookings(data.bookings || []))
    .catch(() => {
        container.innerHTML = '<div class="result-info"><i class="fa fa-exclamation-circle" style="color:var(--red)"></i><p>Failed to load bookings.</p></div>';
    });
}

// ── Render ────────────────────────────────────────────────────────────────
function renderMyBookings(bookings) {
    const container = document.getElementById('my-bookings-list');

    if (!bookings.length) {
        container.innerHTML = `
            <div class="result-info">
                <i class="fa fa-ticket" style="color:var(--muted)"></i>
                <p>You have no bookings yet.</p>
                <p style="margin-top:8px">
                    <button class="btn btn-primary btn-sm" onclick="showTab('search')">
                        <i class="fa fa-search"></i> Search Buses
                    </button>
                </p>
            </div>`;
        return;
    }

    container.innerHTML = bookings.map(b => {
        const statusClass = b.status === 'CONFIRMED' ? 'confirmed' : b.status === 'CANCELLED' ? 'cancelled' : 'pending';
        const canCancel   = b.status === 'CONFIRMED';
        const dep = b.departureTime ? new Date(b.departureTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
        const arr = b.arrivalTime  ? new Date(b.arrivalTime).toLocaleString('en-IN',  { dateStyle: 'medium', timeStyle: 'short' }) : '—';

        return `
        <div class="booking-item ${b.status === 'CANCELLED' ? 'cancelled' : ''}">
            <div style="flex:1">
                <div class="booking-route">
                    <i class="fa fa-map-marker-alt" style="color:var(--blue)"></i>
                    ${b.source} &nbsp;→&nbsp; ${b.destination}
                </div>
                <div class="booking-meta">
                    <span><i class="fa fa-hashtag"></i> Booking #${b.bookingId}</span>
                    <span><i class="fa fa-chair"></i> Seat <strong>${b.seat}</strong></span>
                    <span><i class="fa fa-plane-departure"></i> Dep: <strong>${dep}</strong></span>
                    <span><i class="fa fa-plane-arrival"></i> Arr: <strong>${arr}</strong></span>
                </div>
            </div>
            <div class="booking-right">
                <div class="booking-price">₹${b.price}</div>
                <span class="badge badge-${statusClass}">${b.status}</span>
                ${canCancel ? `
                <br/><br/>
                <button class="btn btn-danger btn-sm" onclick="cancelMyBooking(${b.bookingId})">
                    <i class="fa fa-times"></i> Cancel
                </button>` : ''}
            </div>
        </div>`;
    }).join('');
}

// ── Cancel Booking ────────────────────────────────────────────────────────
function cancelMyBooking(bookingId) {
    if (!confirm(`Cancel booking #${bookingId}? This cannot be undone.`)) return;

    fetch(`${BASE}/api/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=cancel&bookingId=${bookingId}`
    })
    .then(r => r.json())
    .then(data => {
        showToast(data.message, data.status === 'success' ? 'success' : 'error');
        if (data.status === 'success') loadMyBookings();
    })
    .catch(() => showToast('Server error. Try again.', 'error'));
}
