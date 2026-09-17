// ── Signup ──────────────────────────────────────────────────────────────────
function handleSignup() {
    const name     = document.getElementById('name').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role     = document.getElementById('role').value;
    const msgDiv   = document.getElementById('message');

    fetch('../api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=signup&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&role=${encodeURIComponent(role)}`
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            msgDiv.className = 'message success';
            msgDiv.innerText = data.message;
            setTimeout(() => window.location.href = '../index.html', 1500);
        } else {
            msgDiv.className = 'message error';
            msgDiv.innerText = data.message;
        }
    })
    .catch(err => console.error('Signup error:', err));
}

// ── Login ───────────────────────────────────────────────────────────────────
function handleLogin() {
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const msgDiv   = document.getElementById('message');

    fetch('../api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            msgDiv.className = 'message success';
            msgDiv.innerText = 'Login successful! Redirecting...';

            // Store user info for dashboard use
            localStorage.setItem('userName', data.name);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userId',   data.userId);

            setTimeout(() => {
                window.location.href = data.role === 'ADMIN'
                    ? 'admin-dashboard.html'
                    : 'passenger-dashboard.html';
            }, 1000);
        } else {
            msgDiv.className = 'message error';
            msgDiv.innerText = data.message || 'Login failed!';
        }
    })
    .catch(err => console.error('Login error:', err));
}