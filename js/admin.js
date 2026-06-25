/**
 * Admin panel — product CRUD, order management, dashboard stats.
 * Protected: only the ADMIN_EMAIL user can access this page.
 */

import {
  auth,
  isConfigured,
  ADMIN_EMAIL,
  fetchProducts,
  saveProduct,
  deleteProduct,
  fetchAllOrders,
} from './firebase.js';

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

// ── Static product fallback (same data as shop.js) ───────────────────────────
// These are used to seed Firestore on first run via "Seed Products" button
const SEED_PRODUCTS = [
  { brand:'Nike',   name:'Air Force 1 \'07 Low', price:110, oldPrice:null, badge:'new',  stock:24, sizes:['7','7.5','8','8.5','9','9.5','10','10.5','11','12'], description:'The legend returns. Classic AF1 silhouette with updated cushioning.' },
  { brand:'Jordan', name:'Jordan 1 Retro High OG Chicago', price:180, oldPrice:200, badge:'sale', stock:8, sizes:['8','8.5','9','9.5','10','10.5','11'], description:'The shoe that started it all. Iconic red/black/white colorway.' },
  { brand:'Nike',   name:'Nike Dunk Low Panda', price:130, oldPrice:null, badge:'',     stock:15, sizes:['7','8','9','10','11','12'], description:'Clean black-and-white Dunk Low that goes with everything.' },
  { brand:'Adidas', name:'Adidas Ultra Boost 23', price:190, oldPrice:220, badge:'sale', stock:18, sizes:['7','8','9','10','11'], description:'Responsive Boost midsole for all-day comfort.' },
  { brand:'Nike',   name:'Nike Air Max 270', price:150, oldPrice:null, badge:'',        stock:20, sizes:['7','8','9','10','11','12'], description:'Tallest Air unit ever in a lifestyle shoe.' },
  { brand:'Jordan', name:'Jordan 4 Retro Black Cat', price:210, oldPrice:null, badge:'new', stock:6, sizes:['8','9','10','11'], description:'All-black stealth Jordan 4 with premium nubuck.' },
];

// ── State ────────────────────────────────────────────────────────────────────
let currentAdmin  = null;
let allProducts   = [];
let allOrders     = [];
let editingProduct = null;

// ── Auth gate ─────────────────────────────────────────────────────────────────
function initAdmin() {
  if (!isConfigured()) {
    showGate('firebase-not-configured');
    return;
  }

  onAuthStateChanged(auth, user => {
    if (user && user.email === ADMIN_EMAIL) {
      currentAdmin = user;
      showPanel();
      loadDashboard();
    } else if (user) {
      showGate('not-admin');
    } else {
      showGate('login');
    }
  });
}

function showGate(type) {
  document.getElementById('admin-panel')?.setAttribute('hidden', '');
  const gate = document.getElementById('admin-gate');
  if (!gate) return;
  gate.removeAttribute('hidden');

  if (type === 'login') {
    gate.innerHTML = `
      <div class="admin-auth-gate">
        <div class="admin-auth-gate__logo">The Snicker<span>Lab</span></div>
        <h1 class="admin-auth-gate__title">Admin Login</h1>
        <p class="admin-auth-gate__sub">Sign in with your admin account to manage products and orders.</p>
        <form class="admin-login-form" id="admin-login-form">
          <div class="admin-field">
            <label class="admin-label">Email</label>
            <input type="email" id="gate-email" class="admin-input" placeholder="admin@thesnickerlab.com" required>
          </div>
          <div class="admin-field">
            <label class="admin-label">Password</label>
            <input type="password" id="gate-password" class="admin-input" placeholder="Password" required>
          </div>
          <p class="admin-alert admin-alert--error" id="gate-error" style="display:none;"></p>
          <button type="submit" class="btn-admin btn-admin--primary" style="width:100%;justify-content:center;">
            <i class="ri-login-box-line"></i> Sign In
          </button>
        </form>
        <a href="index.html" style="color:#6B6B6B;font-size:13px;">← Back to store</a>
      </div>`;

    document.getElementById('admin-login-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const email    = document.getElementById('gate-email').value.trim();
      const password = document.getElementById('gate-password').value;
      const errEl    = document.getElementById('gate-error');
      errEl.style.display = 'none';

      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        errEl.textContent   = 'Invalid credentials. Try again.';
        errEl.style.display = 'flex';
      }
    });

  } else if (type === 'not-admin') {
    gate.innerHTML = `
      <div class="admin-auth-gate">
        <div class="admin-auth-gate__logo">The Snicker<span>Lab</span></div>
        <h1 class="admin-auth-gate__title">Access Denied</h1>
        <p class="admin-auth-gate__sub">Your account does not have admin privileges.</p>
        <button onclick="signOut(auth)" class="btn-admin btn-admin--ghost">Sign Out</button>
        <a href="index.html" style="color:#6B6B6B;font-size:13px;">← Back to store</a>
      </div>`;

  } else if (type === 'firebase-not-configured') {
    gate.innerHTML = `
      <div class="admin-auth-gate">
        <div class="admin-auth-gate__logo">The Snicker<span>Lab</span></div>
        <h1 class="admin-auth-gate__title">Firebase Not Configured</h1>
        <p class="admin-auth-gate__sub">
          Open <strong>js/firebase.js</strong> and replace the placeholder values
          with your Firebase project config from the Firebase Console.
        </p>
        <a href="index.html" class="btn-admin btn-admin--ghost">← Back to store</a>
      </div>`;
  }
}

function showPanel() {
  document.getElementById('admin-gate')?.setAttribute('hidden', '');
  document.getElementById('admin-panel')?.removeAttribute('hidden');

  // Update sidebar user info
  const nameEl = document.getElementById('sb-user-name');
  if (nameEl) nameEl.textContent = currentAdmin?.displayName || currentAdmin?.email || 'Admin';

  bindSidebarNav();
  bindLogout();
  bindProductModal();
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
async function loadDashboard() {
  [allProducts, allOrders] = await Promise.all([
    fetchProducts().then(r => r || SEED_PRODUCTS),
    fetchAllOrders(),
  ]);

  // Stats
  const revenue  = allOrders.reduce((s, o) => s + (o.total || 0), 0);
  const avgOrder = allOrders.length ? revenue / allOrders.length : 0;

  setInner('stat-revenue',   `$${revenue.toFixed(0)}`);
  setInner('stat-orders',     allOrders.length);
  setInner('stat-products',   allProducts.length);
  setInner('stat-avg-order', `$${avgOrder.toFixed(0)}`);

  renderProductsTable(allProducts);
  renderOrdersTable(allOrders);
  renderRecentOrders(allOrders.slice(0, 5));
}

// ── Products table ────────────────────────────────────────────────────────────
function renderProductsTable(products) {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;

  if (!products.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--clr-gray-2);">
      No products yet. <button class="btn-admin btn-admin--primary btn-admin--sm" onclick="openAddProduct()">Add First Product</button>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr>
      <td class="td-primary">${p.name || '—'}</td>
      <td>${p.brand || '—'}</td>
      <td>$${p.price || 0}</td>
      <td>${p.stock ?? '—'}</td>
      <td>
        <span class="status-badge ${p.badge === 'new' ? 'status-badge--new' : p.badge === 'sale' ? 'status-badge--sale' : 'status-badge--active'}">
          ${p.badge || 'Active'}
        </span>
      </td>
      <td class="td-actions">
        <button class="btn-admin btn-admin--ghost btn-admin--sm" onclick="editProduct('${p.id || ''}')">
          <i class="ri-edit-line"></i> Edit
        </button>
        <button class="btn-admin btn-admin--danger btn-admin--sm" onclick="confirmDeleteProduct('${p.id || ''}', '${(p.name || '').replace(/'/g,'\\\'') }')">
          <i class="ri-delete-bin-line"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// ── Orders table ──────────────────────────────────────────────────────────────
function renderOrdersTable(orders) {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--clr-gray-2);">No orders yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td class="td-mono">${o.id || o.firestoreId || '—'}</td>
      <td class="td-primary">${o.name || o.email || '—'}</td>
      <td>${o.date ? new Date(o.date).toLocaleDateString() : '—'}</td>
      <td>${(o.items || []).length} item(s)</td>
      <td>$${parseFloat(o.total || 0).toFixed(2)}</td>
      <td>
        <span class="status-badge status-badge--${o.status || 'confirmed'}">${o.status || 'Confirmed'}</span>
      </td>
    </tr>
  `).join('');
}

function renderRecentOrders(orders) {
  const el = document.getElementById('recent-orders-list');
  if (!el) return;
  if (!orders.length) { el.innerHTML = '<p style="color:var(--clr-gray-2);font-size:13px;">No orders yet.</p>'; return; }

  el.innerHTML = orders.map(o => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--admin-border);gap:12px;flex-wrap:wrap;">
      <div>
        <p style="font-size:13px;font-weight:600;color:var(--clr-white);font-family:monospace;">#${o.id || o.firestoreId || '—'}</p>
        <p style="font-size:12px;color:var(--clr-gray-2);">${o.name || o.email || 'Customer'}</p>
      </div>
      <span style="font-size:15px;font-weight:700;color:var(--clr-white);">$${parseFloat(o.total || 0).toFixed(2)}</span>
    </div>`).join('');
}

// ── Product modal ─────────────────────────────────────────────────────────────
window.openAddProduct = function() {
  editingProduct = null;
  document.getElementById('product-modal-title').textContent = 'Add Product';
  resetProductForm();
  openModal('product-modal');
};

window.editProduct = function(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;
  editingProduct = product;
  document.getElementById('product-modal-title').textContent = 'Edit Product';
  fillProductForm(product);
  openModal('product-modal');
};

window.confirmDeleteProduct = function(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  deleteProduct(id)
    .then(() => {
      allProducts = allProducts.filter(p => p.id !== id);
      renderProductsTable(allProducts);
      setInner('stat-products', allProducts.length);
      showAdminToast('Product deleted.', 'success');
    })
    .catch(() => showAdminToast('Failed to delete product.', 'error'));
};

function bindProductModal() {
  document.getElementById('product-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const data = readProductForm();
    const btn  = e.target.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Saving…';

    try {
      const id = await saveProduct(data, editingProduct?.id || null);
      const updated = { ...data, id: editingProduct?.id || id };

      if (editingProduct) {
        const idx = allProducts.findIndex(p => p.id === editingProduct.id);
        if (idx > -1) allProducts[idx] = updated;
      } else {
        allProducts.unshift(updated);
      }

      renderProductsTable(allProducts);
      setInner('stat-products', allProducts.length);
      closeModal('product-modal');
      showAdminToast(editingProduct ? 'Product updated!' : 'Product added!', 'success');
    } catch (err) {
      showAdminToast('Error saving product: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save Product';
    }
  });
}

function readProductForm() {
  return {
    brand:       getVal('pf-brand'),
    name:        getVal('pf-name'),
    price:       parseFloat(getVal('pf-price')) || 0,
    oldPrice:    parseFloat(getVal('pf-old-price')) || null,
    badge:       getVal('pf-badge'),
    stock:       parseInt(getVal('pf-stock')) || 0,
    description: getVal('pf-description'),
    sizes:       getVal('pf-sizes').split(',').map(s => s.trim()).filter(Boolean),
    sku:         getVal('pf-sku') || `SV-${Date.now().toString(36).toUpperCase()}`,
  };
}

function fillProductForm(p) {
  setVal('pf-brand',       p.brand || '');
  setVal('pf-name',        p.name  || '');
  setVal('pf-price',       p.price || '');
  setVal('pf-old-price',   p.oldPrice || '');
  setVal('pf-badge',       p.badge || '');
  setVal('pf-stock',       p.stock || '');
  setVal('pf-description', p.description || '');
  setVal('pf-sizes',       (p.sizes || []).join(', '));
  setVal('pf-sku',         p.sku  || '');
}

function resetProductForm() {
  ['pf-brand','pf-name','pf-price','pf-old-price','pf-badge','pf-stock','pf-description','pf-sizes','pf-sku']
    .forEach(id => setVal(id, ''));
}

// ── Seed products to Firestore ────────────────────────────────────────────────
window.seedProducts = async function() {
  if (!confirm(`Seed ${SEED_PRODUCTS.length} default products into Firestore?`)) return;
  const btn = document.getElementById('seed-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Seeding…'; }

  try {
    for (const p of SEED_PRODUCTS) {
      await saveProduct(p, null);
    }
    showAdminToast(`${SEED_PRODUCTS.length} products seeded to Firestore!`, 'success');
    allProducts = await fetchProducts() || SEED_PRODUCTS;
    renderProductsTable(allProducts);
    setInner('stat-products', allProducts.length);
  } catch (e) {
    showAdminToast('Seed failed: ' + e.message, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Seed Default Products'; }
  }
};

// ── Sidebar navigation ────────────────────────────────────────────────────────
function bindSidebarNav() {
  document.querySelectorAll('.admin-nav__link[data-view]').forEach(link => {
    link.addEventListener('click', () => {
      const view = link.dataset.view;
      switchView(view);

      document.querySelectorAll('.admin-nav__link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      document.getElementById('admin-page-title').textContent =
        link.querySelector('span')?.textContent || 'Dashboard';
    });
  });

  // Mobile hamburger
  document.getElementById('admin-menu-toggle')?.addEventListener('click', () => {
    document.querySelector('.admin-sidebar')?.classList.toggle('open');
  });
}

function switchView(view) {
  document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${view}`)?.classList.add('active');
}

// ── Logout ────────────────────────────────────────────────────────────────────
function bindLogout() {
  document.getElementById('admin-logout-btn')?.addEventListener('click', async () => {
    await signOut(auth);
  });
}

// ── Modal helpers ─────────────────────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
  document.getElementById('admin-modal-backdrop')?.classList.add('open');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
  document.getElementById('admin-modal-backdrop')?.classList.remove('open');
}

document.querySelectorAll('.admin-modal__close').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-modal').forEach(m => m.classList.remove('open'));
    document.getElementById('admin-modal-backdrop')?.classList.remove('open');
  });
});

// ── Toast ─────────────────────────────────────────────────────────────────────
function showAdminToast(msg, type = 'success') {
  let wrap = document.getElementById('admin-toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'admin-toast-wrap';
    wrap.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(wrap);
  }

  const el = document.createElement('div');
  el.className = `admin-alert admin-alert--${type}`;
  el.style.cssText = 'padding:12px 20px;border-radius:10px;font-size:13px;min-width:260px;opacity:0;transform:translateY(10px);transition:all 0.25s;';
  el.innerHTML = `<i class="ri-${type === 'success' ? 'check-circle-fill' : 'error-warning-fill'}"></i> ${msg}`;
  wrap.appendChild(el);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
  });

  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function setInner(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function getVal(id)        { return document.getElementById(id)?.value || ''; }
function setVal(id, val)   { const el = document.getElementById(id); if (el) el.value = val; }

// ── Table search ──────────────────────────────────────────────────────────────
document.getElementById('products-search')?.addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  renderProductsTable(allProducts.filter(p =>
    (p.name || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q)
  ));
});

document.getElementById('orders-search')?.addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  renderOrdersTable(allOrders.filter(o =>
    (o.id || '').toLowerCase().includes(q) || (o.name || '').toLowerCase().includes(q) || (o.email || '').toLowerCase().includes(q)
  ));
});

// ── Boot ──────────────────────────────────────────────────────────────────────
initAdmin();
