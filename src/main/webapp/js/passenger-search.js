/* passenger-search.js — Search buses, autocomplete, seat selection, book ticket */

let currentBuses = [];
let selectedSeat = null;
let allCities    = [];

// ── Load Cities for Autocomplete ──────────────────────────────────────────
function loadCities() {
    fetch(`${BASE}/api/route?action=cities`)
        .then(r => r.json())
        .then(data => { allCities = data; })
        .catch(() => {});
}

// ── Autocomplete Filter ───────────────────────────────────────────────────
function filterCities(inputId, listId) {
    const val  = document.getElementById(inputId).value.trim().toLowerCase();
    const list = document.getElementById(listId);

    const matches = val.length === 0
        ? allCities
        : allCities.filter(c => c.toLowerCase().includes(val));

    if (!matches.length) { list.classList.remove('open'); return; }

    list.innerHTML = matches.map(c => `
        <div class="autocomplete-item" onclick="selectCity('${inputId}','${listId}','${c}')">
            <i class="fa fa-map-marker-alt"></i> ${c}
        </div>`).join('');
    list.classList.add('open');
}

function selectCity(inputId, listId, city) {
    document.getElementById(inputId).value = city;
    document.getElementById(listId).classList.remove('open');
}

// ── Keyboard navigation (↑ ↓ Enter) ──────────────────────────────────────
function navigateDropdown(e, listId) {
    const list  = document.getElementById(listId);
    const items = list.querySelectorAll('.autocomplete-item');
    if (!items.length) return;

    let active = list.querySelector('.autocomplete-item.active');
    let idx    = Array.from(items).indexOf(active);

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        idx = (idx + 1) % items.length;
        items.forEach(i => i.classList.remove('active'));
        items[idx].classList.add('active');
        items[idx].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        idx = (idx - 1 + items.length) % items.length;
        items.forEach(i => i.classList.remove('active'));
        items[idx].classList.add('active');
        items[idx].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && active) {
        active.click();
    } else if (e.key === 'Escape') {
        list.classList.remove('open');
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', e => {
    if (!e.target.closest('.autocomplete-wrap')) {
        document.querySelectorAll('.autocomplete-list').forEach(l => l.classList.remove('open'));
    }
});

// ── Swap Cities ───────────────────────────────────────────────────────────
function swapCities() {
    const src  = document.getElementById('src');
    const dest = document.getElementById('dest');
    const tmp  = src.value;
    src.value  = dest.value;
    dest.value = tmp;
}

// ── Search Buses ──────────────────────────────────────────────────────────
function searchBuses() {
    const source = document.getElementById('src').value.trim();
    const dest   = document.getElementById('dest').value.trim();

    if (!source || !dest) {
        showToast('Please enter both From and To cities', 'error');
        return;
    }

    const container = document.getElementById('search-results');
    container.innerHTML = '<div class="result-info"><i class="fa fa-spinner fa-spin"></i><p>Searching buses...</p></div>';

    fetch(`${BASE}/api/bus?action=search&source=${encodeURIComponent(source)}&destination=${encodeURIComponent(dest)}`)
        .then(r => r.json())
        .then(data => {
            currentBuses = data;
            renderBusResults(data, source, dest);
        })
        .catch(() => {
            container.innerHTML = '<div class="result-info"><i class="fa fa-exclamation-circle" style="color:var(--red)"></i><p>Failed to load buses. Try again.</p></div>';
        });
}

// ── Render Results ────────────────────────────────────────────────────────
function renderBusResults(buses, source, dest) {
    const container = document.getElementById('search-results');

    if (!buses.length) {
        container.innerHTML = `
            <div class="result-info">
                <i class="fa fa-bus" style="color:var(--muted)"></i>
                <p>No buses found for <strong>${source} → ${dest}</strong></p>
                <p style="margin-top:8px;font-size:0.8rem">Try different cities or check the route name exactly.</p>
            </div>`;
        return;
    }

    const cards = buses.map(b => {
        const pct      = Math.round(((b.totalSeats - b.availableSeats) / b.totalSeats) * 100);
        const fillColor = b.availableSeats === 0 ? 'var(--red)' : b.availableSeats < 5 ? 'var(--yellow)' : 'var(--green)';
        const depTime  = new Date(b.departureTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
        const arrTime  = new Date(b.arrivalTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
        const typeClass = b.busType === 'AC' ? 'badge-ac' : b.busType === 'Luxury' ? 'badge-luxury' : 'badge-nonac';

        return `
        <div class="bus-result-card">
            <div class="bus-card-header">
                <div>
                    <div class="bus-card-name">${b.busName}</div>
                    <div class="bus-card-number">${b.busNumber} &nbsp; <span class="badge ${typeClass}">${b.busType}</span></div>
                </div>
                <div class="bus-card-fare">₹${b.fare}</div>
            </div>

            <div class="bus-card-details">
                <div class="detail-item">
                    <label><i class="fa fa-play-circle"></i> Departure</label>
                    <span>${depTime}</span>
                </div>
                <div class="detail-item">
                    <label><i class="fa fa-stop-circle"></i> Arrival</label>
                    <span>${arrTime}</span>
                </div>
                <div class="detail-item">
                    <label><i class="fa fa-map-marker-alt"></i> From</label>
                    <span>${b.source}</span>
                </div>
                <div class="detail-item">
                    <label><i class="fa fa-map-marker"></i> To</label>
                    <span>${b.destination}</span>
                </div>
            </div>

            <div class="seats-bar">
                <div class="seats-bar-label">
                    <span>Seats Available</span>
                    <span style="color:${fillColor}">${b.availableSeats} / ${b.totalSeats}</span>
                </div>
                <div class="seats-progress">
                    <div class="seats-progress-fill" style="width:${pct}%;background:${fillColor}"></div>
                </div>
            </div>

            ${b.availableSeats > 0
                ? `<button class="btn btn-primary btn-book" onclick='openBookModal(${JSON.stringify(b)})'>
                       <i class="fa fa-ticket"></i> Select Seat & Book
                   </button>`
                : `<div class="no-seats"><i class="fa fa-times-circle"></i> Fully Booked</div>`
            }
        </div>`;
    }).join('');

    container.innerHTML = `
        <p style="color:var(--muted);font-size:0.82rem;margin-bottom:14px">
            <i class="fa fa-check-circle" style="color:var(--green)"></i>
            Found <strong style="color:var(--text)">${buses.length}</strong> bus${buses.length > 1 ? 'es' : ''} for
            <strong style="color:var(--text)">${source} → ${dest}</strong>
        </p>
        <div class="bus-results-grid">${cards}</div>`;
}

// ── Booking Modal ─────────────────────────────────────────────────────────
function openBookModal(bus) {
    selectedSeat = null;
    document.getElementById('book-route-id').value   = bus.routeId;
    document.getElementById('book-total-seats').value = bus.totalSeats;
    document.getElementById('book-fare').value        = bus.fare;

    const depTime = new Date(bus.departureTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    document.getElementById('trip-summary').innerHTML = `
        <div class="route">${bus.source} &nbsp;→&nbsp; ${bus.destination}</div>
        <div class="meta">
            <span><i class="fa fa-bus"></i> ${bus.busName} (${bus.busNumber})</span>
            <span><i class="fa fa-clock"></i> ${depTime}</span>
            <span><i class="fa fa-chair"></i> ${bus.availableSeats} seats left</span>
        </div>`;

    // Build seat grid (simple: show all seats, no booked-seat detection for now)
    const grid = document.getElementById('seat-grid');
    grid.innerHTML = '';
    for (let i = 1; i <= bus.totalSeats; i++) {
        const btn = document.createElement('button');
        btn.className   = 'seat-btn';
        btn.textContent = i;
        btn.onclick     = () => selectSeat(i, bus.fare, btn);
        grid.appendChild(btn);
    }

    document.getElementById('selected-seat-info').style.display = 'none';
    document.getElementById('book-modal').classList.add('open');
}

function selectSeat(seatNum, fare, btn) {
    selectedSeat = seatNum;
    document.querySelectorAll('.seat-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('book-seat').value = seatNum;
    const info = document.getElementById('selected-seat-info');
    info.style.display = 'block';
    document.getElementById('chosen-seat').textContent = seatNum;
    document.getElementById('chosen-fare').textContent = '₹' + fare;
}

function closeBookModal() {
    document.getElementById('book-modal').classList.remove('open');
    selectedSeat = null;
}

// ── Confirm Booking ───────────────────────────────────────────────────────
function confirmBooking() {
    if (!selectedSeat) {
        showToast('Please select a seat first!', 'error');
        return;
    }

    const routeId = document.getElementById('book-route-id').value;
    const userId  = localStorage.getItem('userId');
    const seat    = document.getElementById('book-seat').value;

    if (!userId) {
        showToast('Session expired. Please login again.', 'error');
        setTimeout(() => window.location.href = '../index.html', 1500);
        return;
    }

    fetch(`${BASE}/api/booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=book&routeId=${routeId}&userId=${userId}&seatNumber=${seat}`
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            showToast('🎉 Ticket booked successfully!');
            closeBookModal();
            searchBuses();         // refresh seat counts
        } else {
            showToast(data.message, 'error');
        }
    })
    .catch(() => showToast('Server error. Try again.', 'error'));
}
