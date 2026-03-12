const GITHUB_PAGES_API_BASE = 'https://fidelity-trading-app.onrender.com';

function getConfiguredApiBase() {
  const host = window.location.hostname;

  if (window.location.protocol === 'file:' || !host)
    return 'http://localhost:3001';

  if (host === 'localhost' || host === '127.0.0.1')
    return `${window.location.protocol}//${host}:3001`;

  if (host.endsWith('github.io'))
    return GITHUB_PAGES_API_BASE;

  return window.location.origin;
}

const API_BASE = getConfiguredApiBase();

async function postSignup(payload) {
  const url = `${API_BASE}/api/auth/signup`;

  console.log("Sending request →", url);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  return { response, data };
}

document.addEventListener('DOMContentLoaded', () => {

  const signupForm = document.getElementById('signupForm');

  signupForm.addEventListener('submit', async (e) => {

    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const dob = document.getElementById('dob').value;
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword =
      document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {

      const { response, data } = await postSignup({
        name,
        dob,
        phone,
        email,
        password
      });

      if (response.ok && data.success) {

        // Save user info
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('username', data.user.name);

        alert("Signup successful!");

        window.location.href = "dashboard.html";

      } else {

        alert(data.message || "Signup failed");

      }

    } catch (error) {

      console.error(error);
      alert("Server connection error");

    }

  });

});