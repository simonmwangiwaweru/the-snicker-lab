/**
 * Firebase Auth — login/register modal, nav user state, order history.
 * Injects auth modal + user nav button into DOM automatically.
 */

import {
  auth,
  db,
  isConfigured,
  saveUserProfile,
  fetchUserOrders,
  ADMIN_EMAIL,
} from './firebase.js';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

// ── Inject auth modal into DOM ─────────────────────────────────────────────────
function injectAuthModal() {
  if (document.getElementById('auth-modal')) return;

  document.body.insertAdjacentHTML('beforeend', `
    <div class="auth-backdrop" id="auth-backdrop"></div>
    <div class="auth-modal" id="auth-modal" role="dialog" aria-modal="true" aria-label="Account">
      <button class="auth-modal__close" id="auth-modal-close" aria-label="Close"><i class="ri-close-line"></i></button>

      <!-- Auth form (login/register) -->
      <div class="auth-form-wrap" id="auth-form-wrap">
        <div class="auth-modal__brand">
          <span class="auth-modal__logo">The Snicker<span>Lab</span></span>
        </div>

        <!-- Tabs -->
        <div class="auth-tabs">
          <button class="auth-tab active" data-tab="login">Sign In</button>
          <button class="auth-tab" data-tab="register">Create Account</button>
        </div>

        <!-- Login -->
        <form class="auth-panel active" id="auth-login-form" data-panel="login" novalidate>
          <div class="auth-field">
            <label class="auth-label" for="auth-email">Email</label>
            <input type="email" id="auth-email" class="auth-input" placeholder="your@email.com" autocomplete="email" required>
          </div>
          <div class="auth-field">
            <label class="auth-label" for="auth-password">Password</label>
            <input type="password" id="auth-password" class="auth-input" placeholder="Password" autocomplete="current-password" required>
          </div>
          <p class="auth-error" id="auth-login-error"></p>
          <button type="submit" class="btn btn--primary auth-submit-btn">
            <span class="auth-submit-label">Sign In</span>
            <span class="auth-spinner" hidden><i class="ri-loader-4-line"></i></span>
          </button>
          <button type="button" class="auth-forgot-btn" id="auth-forgot-btn">Forgot password?</button>
        </form>

        <!-- Register -->
        <form class="auth-panel" id="auth-register-form" data-panel="register" novalidate>
          <div class="auth-field">
            <label class="auth-label" for="auth-name">Full Name</label>
            <input type="text" id="auth-name" class="auth-input" placeholder="John Doe" autocomplete="name" required>
          </div>
          <div class="auth-field">
            <label class="auth-label" for="auth-reg-email">Email</label>
            <input type="email" id="auth-reg-email" class="auth-input" placeholder="your@email.com" autocomplete="email" required>
          </div>
          <div class="auth-field">
            <label class="auth-label" for="auth-reg-password">Password</label>
            <input type="password" id="auth-reg-password" class="auth-input" placeholder="Min 6 characters" autocomplete="new-password" required>
          </div>
          <p class="auth-error" id="auth-register-error"></p>
          <button type="submit" class="btn btn--primary auth-submit-btn">
            <span class="auth-submit-label">Create Account</span>
            <span class="auth-spinner" hidden><i class="ri-loader-4-line"></i></span>
          </button>
        </form>
      </div>

      <!-- User dashboard (shown when logged in) -->
      <div class="auth-dashboard" id="auth-dashboard" hidden>
        <div class="auth-modal__brand">
          <span class="auth-modal__logo">The Snicker<span>Lab</span></span>
        </div>

        <div class="auth-user-header">
          <div class="auth-avatar" id="auth-avatar-display">J</div>
          <div>
            <p class="auth-user-name" id="auth-user-name-display">Loading...</p>
            <p class="auth-user-email" id="auth-user-email-display"></p>
          </div>
        </div>

        <div class="auth-orders-section">
          <h3 class="auth-orders-title"><i class="ri-shopping-bag-line"></i> Recent Orders</h3>
          <div id="auth-orders-list" class="auth-orders-list">
            <p class="auth-orders-empty">Loading your orders...</p>
          </div>
        </div>

        <div class="auth-actions">
          <a href="shop.html" class="btn btn--outline auth-shop-btn">
            <i class="ri-shopping-bag-line"></i> Shop Now
          </a>
          <button class="auth-logout-btn" id="auth-logout-btn">
            <i class="ri-logout-box-line"></i> Sign Out
          </button>
        </div>
      </div>
    </div>
  `);

  bindModalEvents();
}

// ── Inject user icon into nav ─────────────────────────────────────────────────
function injectNavUserBtn() {
  // Look for the existing account button placeholder
  const existing = document.querySelector('.nav__icon-btn[aria-label="Account"]');
  if (existing) {
    existing.id = 'nav-account-btn';
    existing.addEventListener('click', openAuthModal);
    return;
  }

  // Fallback: inject before cart icon
  const cartBtn = document.querySelector('.nav__icon-btn[aria-label="Cart"]');
  if (!cartBtn) return;

  const btn = document.createElement('button');
  btn.id          = 'nav-account-btn';
  btn.className   = 'nav__icon-btn';
  btn.setAttribute('aria-label', 'Account');
  btn.innerHTML   = '<i class="ri-user-line"></i>';
  cartBtn.parentNode.insertBefore(btn, cartBtn);
  btn.addEventListener('click', openAuthModal);
}

// ── Modal open/close ──────────────────────────────────────────────────────────
function openAuthModal() {
  document.getElementById('auth-modal')?.classList.add('open');
  document.getElementById('auth-backdrop')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  document.getElementById('auth-modal')?.classList.remove('open');
  document.getElementById('auth-backdrop')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Tab switching ─────────────────────────────────────────────────────────────
function bindModalEvents() {
  document.getElementById('auth-modal-close')?.addEventListener('click', closeAuthModal);
  document.getElementById('auth-backdrop')?.addEventListener('click', closeAuthModal);

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAuthModal(); });

  // Tabs
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === target));
      document.querySelectorAll('.auth-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === target));
      clearErrors();
    });
  });

  // Login form
  document.getElementById('auth-login-form')?.addEventListener('submit', handleLogin);

  // Register form
  document.getElementById('auth-register-form')?.addEventListener('submit', handleRegister);

  // Forgot password
  document.getElementById('auth-forgot-btn')?.addEventListener('click', handleForgotPassword);

  // Logout
  document.getElementById('auth-logout-btn')?.addEventListener('click', handleLogout);
}

// ── Auth handlers ─────────────────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  if (!isConfigured()) { showError('auth-login-error', 'Firebase not configured yet.'); return; }

  const email    = document.getElementById('auth-email')?.value.trim();
  const password = document.getElementById('auth-password')?.value;
  const btn      = e.target.querySelector('.auth-submit-btn');

  clearErrors();
  setLoading(btn, true);

  try {
    await signInWithEmailAndPassword(auth, email, password);
    closeAuthModal();
  } catch (err) {
    showError('auth-login-error', friendlyError(err.code));
  } finally {
    setLoading(btn, false);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  if (!isConfigured()) { showError('auth-register-error', 'Firebase not configured yet.'); return; }

  const name     = document.getElementById('auth-name')?.value.trim();
  const email    = document.getElementById('auth-reg-email')?.value.trim();
  const password = document.getElementById('auth-reg-password')?.value;
  const btn      = e.target.querySelector('.auth-submit-btn');

  clearErrors();

  if (!name)            { showError('auth-register-error', 'Please enter your name.'); return; }
  if (password.length < 6) { showError('auth-register-error', 'Password must be at least 6 characters.'); return; }

  setLoading(btn, true);

  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    await saveUserProfile(user.uid, { name, email, createdAt: new Date().toISOString() });
    closeAuthModal();
  } catch (err) {
    showError('auth-register-error', friendlyError(err.code));
  } finally {
    setLoading(btn, false);
  }
}

async function handleForgotPassword() {
  if (!isConfigured()) return;
  const email = document.getElementById('auth-email')?.value.trim();
  if (!email) { showError('auth-login-error', 'Enter your email address first.'); return; }

  try {
    await sendPasswordResetEmail(auth, email);
    showError('auth-login-error', '✓ Reset link sent — check your inbox.', true);
  } catch (err) {
    showError('auth-login-error', friendlyError(err.code));
  }
}

async function handleLogout() {
  if (!isConfigured()) return;
  try {
    await signOut(auth);
  } catch (e) { /* ignore */ }
}

// ── Auth state listener (updates nav + modal) ─────────────────────────────────
function bindAuthState() {
  if (!isConfigured()) return;

  onAuthStateChanged(auth, async user => {
    const navBtn = document.getElementById('nav-account-btn');

    if (user) {
      // Logged in — update nav icon to user avatar
      if (navBtn) {
        const initial = (user.displayName || user.email || 'U')[0].toUpperCase();
        navBtn.innerHTML = `<span class="nav__user-avatar">${initial}</span>`;
        navBtn.title     = user.displayName || user.email;
      }

      // Update dashboard
      const nameEl  = document.getElementById('auth-user-name-display');
      const emailEl = document.getElementById('auth-user-email-display');
      const avEl    = document.getElementById('auth-avatar-display');

      if (nameEl)  nameEl.textContent  = user.displayName || 'Sole Vault Member';
      if (emailEl) emailEl.textContent = user.email;
      if (avEl)    avEl.textContent    = (user.displayName || user.email || 'U')[0].toUpperCase();

      // Show dashboard, hide form
      document.getElementById('auth-form-wrap')?.setAttribute('hidden', '');
      document.getElementById('auth-dashboard')?.removeAttribute('hidden');

      // Load orders
      loadUserOrders(user.uid);

    } else {
      // Logged out — revert nav icon
      if (navBtn) navBtn.innerHTML = '<i class="ri-user-line"></i>';

      // Show form, hide dashboard
      document.getElementById('auth-form-wrap')?.removeAttribute('hidden');
      document.getElementById('auth-dashboard')?.setAttribute('hidden', '');
    }
  });
}

async function loadUserOrders(uid) {
  const listEl = document.getElementById('auth-orders-list');
  if (!listEl) return;

  // Also check localStorage as fallback
  const localOrder = JSON.parse(localStorage.getItem('sl_last_order') || 'null');
  const firestoreOrders = await fetchUserOrders(uid);
  const orders = firestoreOrders.length > 0 ? firestoreOrders : (localOrder ? [localOrder] : []);

  if (!orders.length) {
    listEl.innerHTML = '<p class="auth-orders-empty">No orders yet — time to shop!</p>';
    return;
  }

  listEl.innerHTML = orders.slice(0, 5).map(o => `
    <div class="auth-order-row">
      <div class="auth-order-info">
        <span class="auth-order-id">#${o.id || o.firestoreId || '—'}</span>
        <span class="auth-order-date">${o.date ? new Date(o.date).toLocaleDateString() : '—'}</span>
      </div>
      <div class="auth-order-right">
        <span class="auth-order-items">${(o.items || []).length} item(s)</span>
        <span class="auth-order-total">$${parseFloat(o.total || 0).toFixed(2)}</span>
        <span class="auth-order-status auth-order-status--${o.status || 'confirmed'}">${o.status || 'Confirmed'}</span>
      </div>
    </div>
  `).join('');
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function showError(id, msg, isSuccess = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.color = isSuccess ? '#22c55e' : '#ef4444';
  el.style.display = 'block';
}

function clearErrors() {
  document.querySelectorAll('.auth-error').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
}

function setLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  btn.querySelector('.auth-submit-label').style.display = loading ? 'none' : '';
  const spinner = btn.querySelector('.auth-spinner');
  if (spinner) spinner.hidden = !loading;
}

function friendlyError(code) {
  const map = {
    'auth/user-not-found':      'No account found with this email.',
    'auth/wrong-password':      'Incorrect password.',
    'auth/invalid-email':       'Invalid email address.',
    'auth/email-already-in-use':'An account with this email already exists.',
    'auth/weak-password':       'Password must be at least 6 characters.',
    'auth/too-many-requests':   'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/invalid-credential':  'Incorrect email or password.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

// ── Master init ───────────────────────────────────────────────────────────────
function initAuth() {
  injectAuthModal();
  injectNavUserBtn();
  bindAuthState();
}

export { initAuth, openAuthModal };
