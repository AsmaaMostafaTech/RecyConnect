// Simple client-side auth (demo only)
// Stores users in localStorage as {email, name, passHash}
// Current user stored as 'recy_current'

const Auth = (function() {
  const USERS_KEY = 'recy_users_v1';
  const CURRENT_KEY = 'recy_current_v1';

  async function sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function loadUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function setCurrent(user) {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
    document.dispatchEvent(new CustomEvent('recy:auth-changed', { detail: user }));
  }

  function getCurrent() {
    try { return JSON.parse(localStorage.getItem(CURRENT_KEY)); } catch(e) { return null; }
  }

  async function signup(name, email, password) {
    const users = loadUsers();
    if (users.find(u => u.email === email)) throw new Error('Email already registered');
    const passHash = await sha256(password);
    // default role to donor if not provided
    const role = (document.getElementById('signupRole') && document.getElementById('signupRole').value) || 'donor';
    const user = { name, email, passHash, role };
    users.push(user);
    saveUsers(users);
    setCurrent({ name, email, role });
    return { name, email, role };
  }

  async function login(email, password) {
    const users = loadUsers();
    const user = users.find(u => u.email === email);
    if (!user) throw new Error('User not found');
    const passHash = await sha256(password);
    if (passHash !== user.passHash) throw new Error('Incorrect password');
    setCurrent({ name: user.name, email: user.email, role: user.role || 'donor' });
    return { name: user.name, email: user.email, role: user.role || 'donor' };
  }

  function logout() {
    localStorage.removeItem(CURRENT_KEY);
    document.dispatchEvent(new CustomEvent('recy:auth-changed', { detail: null }));
  }

  function requireAuth(actionCallback) {
    const user = getCurrent();
    if (user) return actionCallback(user);
    // show login modal
    const loginModal = document.getElementById('recyLoginModal');
    if (loginModal) {
      const bm = new bootstrap.Modal(loginModal);
      bm.show();
    } else {
      alert('Please log in first');
    }
  }

  function renderNavbar() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    // avoid duplicate
    if (nav.querySelector('#recy-auth-area')) return;
    const authArea = document.createElement('div');
    authArea.id = 'recy-auth-area';
    authArea.className = 'ms-3 d-flex align-items-center';
    nav.querySelector('.container').appendChild(authArea);
    updateNavbarButtons();
  }

  function updateNavbarButtons() {
    const authArea = document.getElementById('recy-auth-area');
    if (!authArea) return;
    authArea.innerHTML = '';
    const user = getCurrent();
    if (user) {
      // Render a compact dropdown with avatar/name, Dashboard, Chat and Logout
      const dropdownHtml = `
        <div class="btn-group">
          <button id="userDropdownBtn" type="button" class="btn btn-sm btn-outline-primary dropdown-toggle d-flex align-items-center" data-bs-toggle="dropdown" aria-expanded="false">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ffffff&color=2c7fb8&rounded=true" alt="${user.name}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;" class="me-2"> 
            <span class="d-none d-sm-inline">${user.name}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="${dashboardForRole(user.role)}">Dashboard</a></li>
            <li><a class="dropdown-item" href="chat.html">Chat</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><button id="recyLogoutBtn" class="dropdown-item">Logout</button></li>
          </ul>
        </div>
      `;
      authArea.innerHTML = dropdownHtml;

      // Attach logout handler
      const logoutBtn = document.getElementById('recyLogoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          logout();
          updateNavbarButtons();
        });
      }
    } else {
      const loginBtn = document.createElement('button');
      loginBtn.className = 'btn btn-link text-decoration-none me-2';
      loginBtn.textContent = 'Login';
      loginBtn.addEventListener('click', () => {
        const m = new bootstrap.Modal(document.getElementById('recyLoginModal'));
        m.show();
      });

      const signupBtn = document.createElement('button');
      signupBtn.className = 'btn btn-primary btn-sm';
      signupBtn.textContent = 'Sign Up';
      signupBtn.addEventListener('click', () => {
        const m = new bootstrap.Modal(document.getElementById('recySignupModal'));
        m.show();
      });

      authArea.appendChild(loginBtn);
      authArea.appendChild(signupBtn);
    }
  }

  function dashboardForRole(role) {
    switch ((role || '').toLowerCase()) {
      case 'donor': return 'donor-dashboard.html';
      case 'farmer': return 'farmer-dashboard.html';
      case 'upcycler': return 'upcycler-dashboard.html';
      case 'admin': return 'dashboard.html';
      default: return 'dashboard.html';
    }
  }

  function initUiBindings() {
    // handle signup form
    const signupForm = document.getElementById('recySignupForm');
    if (signupForm) signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = signupForm.querySelector('#signupName').value.trim();
      const email = signupForm.querySelector('#signupEmail').value.trim();
      const pass = signupForm.querySelector('#signupPass').value;
      try {
        const created = await signup(name, email, pass);
        const m = bootstrap.Modal.getInstance(document.getElementById('recySignupModal'));
        if (m) m.hide();
        updateNavbarButtons();
        showToast('Signed up and logged in as ' + name);
        // After signup, redirect to any pending target (e.g. a contact action), otherwise Chat
        const pending = sessionStorage.getItem('recy_pending_redirect');
        if (pending) {
          sessionStorage.removeItem('recy_pending_redirect');
          window.location.href = pending;
        } else {
          window.location.href = 'chat.html';
        }
      } catch (err) {
        showToast(err.message, true);
      }
    });

    const loginForm = document.getElementById('recyLoginForm');
    if (loginForm) loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('#loginEmail').value.trim();
      const pass = loginForm.querySelector('#loginPass').value;
      try {
        const user = await login(email, pass);
        const m = bootstrap.Modal.getInstance(document.getElementById('recyLoginModal'));
        if (m) m.hide();
        updateNavbarButtons();
        showToast('Welcome back, ' + user.name);
        // After login, redirect to any pending target (e.g. a contact action), otherwise Chat
        const pending = sessionStorage.getItem('recy_pending_redirect');
        if (pending) {
          sessionStorage.removeItem('recy_pending_redirect');
          window.location.href = pending;
        } else {
          window.location.href = 'chat.html';
        }
      } catch (err) {
        showToast(err.message, true);
      }
    });

    // intercept contact buttons (buttons/links with class .contact-btn or .contact-seller)
    document.addEventListener('click', (e) => {
      const target = e.target.closest && e.target.closest('.contact-btn, .contact-seller');
      if (target) {
        e.preventDefault();
        // If it's a mailto link, allow navigation
        const href = target.getAttribute && target.getAttribute('href');
        if (href && href.startsWith('mailto:')) {
          window.location.href = href;
          return;
        }

        // Build chat URL with seller and post info if available
        const seller = target.dataset.seller || target.dataset.name || '';
        const postId = target.dataset.id || target.dataset.post || '';
        const params = new URLSearchParams();
        if (seller) params.set('with', seller);
        if (postId) params.set('post', postId);
        const chatUrl = 'chat.html' + (params.toString() ? ('?' + params.toString()) : '');

        const user = getCurrent();
        if (user) {
          // already logged in -> go to chat with seller
          window.location.href = chatUrl;
          return;
        }

        // Not logged in: save pending redirect and show login modal
        try { sessionStorage.setItem('recy_pending_redirect', chatUrl); } catch (e) { /* ignore */ }
        const loginModalEl = document.getElementById('recyLoginModal');
        if (loginModalEl) {
          const m = new bootstrap.Modal(loginModalEl);
          m.show();
        } else {
          alert('Please log in to contact the seller');
        }
      }
    });

    // intercept requires-auth CTA buttons
    document.addEventListener('click', (e) => {
      const req = e.target.closest && e.target.closest('.requires-auth');
      if (req) {
        e.preventDefault();
        const user = getCurrent();
        if (user) {
          // send logged-in users to their dashboard
          window.location.href = dashboardForRole(user.role);
          return;
        }
        const sm = document.getElementById('recySignupModal');
        if (sm) {
          const m = new bootstrap.Modal(sm);
          m.show();
        } else {
          alert('Please sign up or log in');
        }
      }
    });

    // mark nav active by filename
    const links = document.querySelectorAll('.navbar-nav .nav-link');
    const path = window.location.pathname.split('/').pop() || 'index.html';
    links.forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href.endsWith(path)) a.classList.add('active');
    });

    // listen for auth changes
    document.addEventListener('recy:auth-changed', () => updateNavbarButtons());
  }

  function showToast(msg, isError = false) {
    let toastEl = document.getElementById('recyToast');
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'recyToast';
      toastEl.className = 'position-fixed bottom-0 end-0 p-3';
      toastEl.style.zIndex = 2000;
      document.body.appendChild(toastEl);
    }
    const t = document.createElement('div');
    t.className = 'toast align-items-center text-white bg-' + (isError ? 'danger' : 'success') + ' border-0 show';
    t.role = 'alert';
    t.innerHTML = `<div class="d-flex"><div class="toast-body">${msg}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close"></button></div>`;
    toastEl.appendChild(t);
    t.querySelector('.btn-close').addEventListener('click', () => t.remove());
    setTimeout(() => t.remove(), 4000);
  }

  function init() {
    renderNavbar();
    initUiBindings();
    updateNavbarButtons();
    // If includes are injected after Auth.init, re-render navbar when include loads
    document.addEventListener('recy:include-loaded', () => {
      renderNavbar();
      initUiBindings();
      updateNavbarButtons();
    });
  }

  return { init, signup, login, logout, requireAuth, getCurrent };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  if (typeof bootstrap !== 'undefined') {
    Auth.init();
  } else {
    // wait for bootstrap
    const s = setInterval(() => {
      if (typeof bootstrap !== 'undefined') {
        clearInterval(s);
        Auth.init();
      }
    }, 200);
  }
});

window.RecyAuth = Auth;
