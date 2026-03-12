const GITHUB_PAGES_API_BASE = 'https://fidelity-trading-app.onrender.com';

function getConfiguredApiBase() {
  const host = window.location.hostname;

  if (window.location.protocol === 'file:' || !host)
    return 'http://localhost:5000';

  if (host === 'localhost' || host === '127.0.0.1')
    return `${window.location.protocol}//${host}:5000`;

  if (host.endsWith('github.io'))
    return GITHUB_PAGES_API_BASE;

  return window.location.origin;
}

function getLoginApiCandidates() {
  const base = getConfiguredApiBase();
  return [
    `${base}/api/auth/login`,
    '/api/auth/login',
    'http://localhost:5000/api/auth/login'
  ];
}

const LOGIN_API_CANDIDATES = getLoginApiCandidates();

function safeJsonParse(raw) {
  try { return JSON.parse(raw); }
  catch { return null; }
}

async function postLogin(payload) {
  let lastError;

  for (const url of LOGIN_API_CANDIDATES) {
    try {
      console.log('Sending request →', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const raw = await response.text();
      const data = safeJsonParse(raw);

      if (!data) continue;

      return { response, data };

    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Unable to reach login API');
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const { response, data } =
        await postLogin({ email, password });

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.user?.name || '');
        window.location.href = 'dashboard.html';
      } else {
        alert(data.message || 'Login failed');
      }

    } catch (error) {
      console.error(error);
      alert('Server connection error');
    }
  });
});