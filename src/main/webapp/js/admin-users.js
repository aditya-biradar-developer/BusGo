/* admin-users.js — View all users */

let allUsers = [];

// ── Load & Render ─────────────────────────────────────────────────────────
function loadUsers() {
    fetch(BASE + '/api/user?action=all')
        .then(r => r.json())
        .then(data => { allUsers = data; renderUsers(); })
        .catch(() => showToast('Failed to load users', 'error'));
}

function renderUsers() {
    const tbody = document.getElementById('user-tbody');
    if (!allUsers.length) {
        tbody.innerHTML = '<tr><td colspan="5"><div class="empty"><i class="fa fa-users"></i>No users found.</div></td></tr>';
        return;
    }
    tbody.innerHTML = allUsers.map(u => {
        const roleClass = u.role === 'ADMIN' ? 'admin' : 'passenger';
        const dateStr   = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—';
        return `
        <tr>
            <td>${u.userId}</td>
            <td><strong>${u.name}</strong></td>
            <td>${u.email}</td>
            <td><span class="badge badge-${roleClass}">${u.role}</span></td>
            <td>${dateStr}</td>
        </tr>`;
    }).join('');
}
