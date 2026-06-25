/**
 * Cart drawer (all pages) + full cart page logic.
 * Drawer is injected into the DOM automatically.
 * Cart page renders the full item list + order summary.
 */

// ── Mini SVG builder (same palette system as shop.js) ─────────────────────────
function buildCartSVG(item) {
  const swoosh = item.colorway?.includes('Black') ? '#444' :
                 item.colorway?.includes('Red')   ? '#cc0000' :
                 item.colorway?.includes('Blue')  ? '#003399' : '#FF3D00';
  const upper  = item.colorway?.includes('Black') ? '#222' :
                 item.colorway?.includes('Red')   ? '#aa0000' :
                 item.colorway?.includes('Blue')  ? '#1a1a3a' : '#ffffff';
  const uid    = (item.id || 'shoe').replace(/-/g,'') + Math.random().toString(36).slice(2,5);

  return `<svg viewBox="0 0 780 440" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="crt-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#e0e0e0"/><stop offset="100%" stop-color="#c8c8c8"/>
      </linearGradient>
    </defs>
    <ellipse cx="400" cy="415" rx="255" ry="12" fill="rgba(0,0,0,0.2)"/>
    <path d="M105,348 C108,362 148,378 260,384 C360,390 520,386 640,372 C680,366 700,354 698,340 L688,326 C660,342 570,360 420,364 C270,368 148,358 108,338 Z" fill="#0d0d0d"/>
    <path d="M120,298 C140,308 220,318 380,320 C520,322 615,310 635,298 L638,275 C615,290 530,305 380,305 C230,305 145,292 120,278 Z" fill="url(#crt-${uid})"/>
    <path d="M125,278 C135,240 175,200 240,178 C305,156 390,150 480,165 C555,177 620,205 645,240 C658,260 650,280 638,295 C615,308 530,320 380,318 C230,316 140,300 125,278 Z" fill="${upper}"/>
    <path d="M195,262 C238,232 338,222 450,236 C514,245 568,264 560,283 C524,268 414,256 312,272 C260,280 195,295 195,262 Z" fill="${swoosh}"/>
    <rect x="300" y="158" width="255" height="55" rx="8" fill="rgba(128,128,128,0.15)"/>
    <path d="M312,172 Q428,163 548,172" stroke="rgba(255,255,255,0.6)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M312,188 Q428,179 548,188" stroke="rgba(255,255,255,0.6)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M312,204 Q428,195 548,204" stroke="rgba(255,255,255,0.6)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M430,155 C447,145 478,143 494,154 L497,214 C479,208 440,208 426,214 Z" fill="rgba(200,200,200,0.2)"/>
    <rect x="640" y="218" width="28" height="44" rx="4" fill="${swoosh}"/>
  </svg>`;
}

// ── Cart storage helpers ──────────────────────────────────────────────────────
function getCart()       { return JSON.parse(localStorage.getItem('sl_cart') || '[]'); }
function saveCart(cart)  { localStorage.setItem('sl_cart', JSON.stringify(cart)); }
function cartTotal(cart) { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
function cartCount(cart) { return cart.reduce((s, i) => s + i.qty, 0); }

// ── Update all cart badges across the page ────────────────────────────────────
function refreshBadges() {
  const cart  = getCart();
  const count = cartCount(cart);
  document.querySelectorAll('.nav__cart-count').forEach(el => {
    el.textContent = count > 99 ? '99+' : count;
    el.classList.toggle('visible', count > 0);
  });
  const drawerBadge = document.querySelector('.cart-drawer__badge');
  if (drawerBadge) drawerBadge.textContent = count;
}

// ═══════════════════════════════════════════════════════
// CART DRAWER
// ═══════════════════════════════════════════════════════
function initCartDrawer() {
  // Inject drawer markup if not already in DOM
  if (!document.getElementById('cart-drawer')) {
    const html = `
      <div class="cart-backdrop" id="cart-backdrop"></div>
      <aside class="cart-drawer" id="cart-drawer" aria-label="Shopping cart" role="dialog" aria-modal="true">
        <div class="cart-drawer__header">
          <h2 class="cart-drawer__title">
            <i class="ri-shopping-bag-line"></i>
            Cart <span class="cart-drawer__badge">0</span>
          </h2>
          <button class="cart-drawer__close" id="cart-drawer-close" aria-label="Close cart">
            <i class="ri-close-line"></i>
          </button>
        </div>
        <div class="cart-drawer__items" id="cart-drawer-items"></div>
        <div class="cart-drawer__footer" id="cart-drawer-footer" style="display:none;">
          <div class="cart-drawer__subtotal">
            <span class="cart-drawer__subtotal-label">Subtotal</span>
            <span class="cart-drawer__subtotal-value" id="drawer-subtotal">$0</span>
          </div>
          <p class="cart-drawer__shipping-note">
            <strong>Free shipping</strong> on orders over $100
          </p>
          <div class="cart-drawer__ctas">
            <a href="checkout.html" class="btn btn--primary cart-drawer__checkout-btn">
              <i class="ri-secure-payment-line"></i> Checkout Securely
            </a>
            <a href="cart.html" class="cart-drawer__view-btn">View Full Cart →</a>
          </div>
        </div>
      </aside>`;
    document.body.insertAdjacentHTML('beforeend', html);
  }

  const drawer   = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  const closeBtn = document.getElementById('cart-drawer-close');

  // Open on cart icon click
  document.querySelectorAll('a[href="cart.html"], .nav__icon-btn[aria-label="Cart"]').forEach(btn => {
    // Only intercept the icon button, not the direct cart.html link on cart page
    if (btn.classList.contains('nav__icon-btn')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openDrawer();
      });
    }
  });

  closeBtn?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  renderDrawer();
}

function openDrawer() {
  renderDrawer();
  document.getElementById('cart-drawer')?.classList.add('open');
  document.getElementById('cart-backdrop')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('cart-backdrop')?.classList.remove('open');
  document.body.style.overflow = '';
}

function renderDrawer() {
  const cart      = getCart();
  const itemsWrap = document.getElementById('cart-drawer-items');
  const footer    = document.getElementById('cart-drawer-footer');
  const subtotalEl = document.getElementById('drawer-subtotal');
  const badge     = document.querySelector('.cart-drawer__badge');

  if (!itemsWrap) return;

  if (badge) badge.textContent = cartCount(cart);

  if (!cart.length) {
    itemsWrap.innerHTML = `
      <div class="cart-drawer__empty">
        <div class="cart-drawer__empty-icon"><i class="ri-shopping-bag-line"></i></div>
        <h3>Your cart is empty</h3>
        <p>Add some sneakers and they'll show up here.</p>
        <a href="shop.html" class="btn btn--primary" style="padding:var(--space-3) var(--space-6);" onclick="closeDrawer()">
          Shop Now
        </a>
      </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'flex';
  if (subtotalEl) subtotalEl.textContent = `$${cartTotal(cart).toFixed(2)}`;

  itemsWrap.innerHTML = cart.map((item, idx) => `
    <div class="drawer-item" data-idx="${idx}">
      <div class="drawer-item__img" style="background:${item.colorways?.[0]?.bg || 'rgba(255,255,255,0.05)'};">
        ${buildCartSVG(item)}
      </div>
      <div class="drawer-item__info">
        <p class="drawer-item__brand">${item.brand || ''}</p>
        <p class="drawer-item__name">${item.name || 'Sneaker'}</p>
        <div class="drawer-item__meta">
          ${item.size     ? `<span class="drawer-item__chip">US ${item.size}</span>` : ''}
          ${item.colorway ? `<span class="drawer-item__chip">${item.colorway}</span>` : ''}
        </div>
        <div class="drawer-item__bottom">
          <span class="drawer-item__price">$${(item.price * item.qty).toFixed(2)}</span>
          <div class="drawer-item__qty">
            <button class="drawer-qty-btn" data-action="dec" data-idx="${idx}" ${item.qty <= 1 ? 'disabled' : ''}>−</button>
            <span class="drawer-item__qty-val">${item.qty}</span>
            <button class="drawer-qty-btn" data-action="inc" data-idx="${idx}" ${item.qty >= 10 ? 'disabled' : ''}>+</button>
          </div>
        </div>
      </div>
      <button class="drawer-item__remove" data-idx="${idx}" aria-label="Remove item">
        <i class="ri-close-line"></i>
      </button>
    </div>
  `).join('');

  // Bind drawer interactions
  itemsWrap.querySelectorAll('.drawer-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cart2 = getCart();
      const idx   = parseInt(btn.dataset.idx);
      if (btn.dataset.action === 'inc') cart2[idx].qty = Math.min(10, cart2[idx].qty + 1);
      if (btn.dataset.action === 'dec') cart2[idx].qty = Math.max(1,  cart2[idx].qty - 1);
      saveCart(cart2);
      refreshBadges();
      renderDrawer();
    });
  });

  itemsWrap.querySelectorAll('.drawer-item__remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const cart2 = getCart();
      const idx   = parseInt(btn.dataset.idx);
      const item  = btn.closest('.drawer-item');
      if (item) {
        item.style.transition = 'opacity 0.25s, transform 0.25s';
        item.style.opacity    = '0';
        item.style.transform  = 'translateX(20px)';
        setTimeout(() => {
          cart2.splice(idx, 1);
          saveCart(cart2);
          refreshBadges();
          renderDrawer();
        }, 260);
      }
    });
  });
}

// ═══════════════════════════════════════════════════════
// CART PAGE
// ═══════════════════════════════════════════════════════
const PROMOS = { 'SNICK10': 0.10, 'LAB20': 0.20, 'WELCOME': 0.15 };
let appliedPromo = null;
let shippingCost = 0;

function initCartPage() {
  renderCartPage();
  bindCartPage();
}

function renderCartPage() {
  const cart   = getCart();
  const listEl = document.getElementById('cart-items-list');
  const emptyEl = document.getElementById('cart-empty');
  const pageEl  = document.getElementById('cart-page-layout');

  if (!cart.length) {
    if (listEl)  listEl.innerHTML = '';
    if (emptyEl) emptyEl.classList.add('visible');
    if (pageEl)  pageEl.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.classList.remove('visible');
  if (pageEl)  pageEl.style.display = 'grid';

  // Count label
  const countEl = document.getElementById('cart-item-count');
  if (countEl) countEl.textContent = `${cartCount(cart)} item${cartCount(cart) !== 1 ? 's' : ''}`;

  if (listEl) {
    listEl.innerHTML = cart.map((item, idx) => `
      <div class="cart-item" data-idx="${idx}">
        <div class="cart-item__img" style="background:${item.colorways?.[0]?.bg || 'rgba(255,255,255,0.06)'};">
          ${buildCartSVG(item)}
        </div>
        <div class="cart-item__info">
          <p class="cart-item__brand">${item.brand || ''}</p>
          <p class="cart-item__name">${item.name || 'Sneaker'}</p>
          <div class="cart-item__chips">
            ${item.size     ? `<span class="item-chip">US ${item.size}</span>` : ''}
            ${item.colorway ? `<span class="item-chip">${item.colorway}</span>` : ''}
          </div>
        </div>
        <div class="cart-item__qty">
          <button class="cart-qty-btn" data-action="dec" data-idx="${idx}" ${item.qty <= 1 ? 'disabled' : ''}>−</button>
          <span class="cart-item__qty-val">${item.qty}</span>
          <button class="cart-qty-btn" data-action="inc" data-idx="${idx}" ${item.qty >= 10 ? 'disabled' : ''}>+</button>
        </div>
        <div class="cart-item__price">$${(item.price * item.qty).toFixed(2)}</div>
        <button class="cart-item__remove" data-idx="${idx}" aria-label="Remove ${item.name}">
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>
    `).join('');

    // Qty buttons
    listEl.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cart2 = getCart();
        const idx   = parseInt(btn.dataset.idx);
        if (btn.dataset.action === 'inc') cart2[idx].qty = Math.min(10, cart2[idx].qty + 1);
        if (btn.dataset.action === 'dec') cart2[idx].qty = Math.max(1,  cart2[idx].qty - 1);
        saveCart(cart2);
        refreshBadges();
        renderCartPage();
        updateSummary();
      });
    });

    // Remove buttons
    listEl.querySelectorAll('.cart-item__remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const cart2 = getCart();
        const idx   = parseInt(btn.dataset.idx);
        const row   = btn.closest('.cart-item');
        if (row) {
          row.classList.add('removing');
          setTimeout(() => {
            cart2.splice(idx, 1);
            saveCart(cart2);
            refreshBadges();
            renderCartPage();
            updateSummary();
          }, 300);
        }
      });
    });
  }

  updateSummary();
}

function updateSummary() {
  const cart     = getCart();
  const subtotal = cartTotal(cart);
  const discount = appliedPromo ? subtotal * PROMOS[appliedPromo] : 0;
  shippingCost   = subtotal - discount >= 100 ? 0 : 8.99;
  const tax      = (subtotal - discount + shippingCost) * 0.08;
  const total    = subtotal - discount + shippingCost + tax;

  setValue('summary-subtotal',  `$${subtotal.toFixed(2)}`);
  setValue('summary-shipping',  shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`);
  setValue('summary-tax',       `$${tax.toFixed(2)}`);
  setValue('summary-total',     `$${total.toFixed(2)}`);

  const discountRow = document.getElementById('summary-discount-row');
  if (discountRow) discountRow.style.display = appliedPromo ? 'flex' : 'none';
  setValue('summary-discount', `-$${discount.toFixed(2)}`);

  const freeShipNote = document.getElementById('free-ship-note');
  if (freeShipNote) {
    const remaining = 100 - (subtotal - discount);
    freeShipNote.style.display = shippingCost > 0 ? 'block' : 'none';
    freeShipNote.innerHTML = remaining > 0
      ? `Add <strong>$${remaining.toFixed(2)}</strong> more for <strong style="color:#22c55e;">free shipping</strong>`
      : '';
  }
}

function setValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function bindCartPage() {
  // Promo code
  const promoBtn = document.getElementById('promo-apply-btn');
  if (promoBtn) {
    promoBtn.addEventListener('click', () => {
      const input = document.getElementById('promo-input');
      const code  = input?.value?.trim().toUpperCase();
      const msgEl = document.getElementById('promo-msg');

      if (PROMOS[code]) {
        appliedPromo = code;
        if (msgEl) {
          msgEl.className = 'promo-success visible';
          msgEl.innerHTML = `<i class="ri-check-line"></i> "${code}" applied — ${Math.round(PROMOS[code]*100)}% off!`;
        }
        if (input) { input.disabled = true; input.style.borderColor = '#22c55e'; }
        promoBtn.textContent = 'Applied ✓';
        promoBtn.disabled    = true;
        updateSummary();
      } else {
        if (msgEl) {
          msgEl.className = 'promo-success visible';
          msgEl.style.color = '#ef4444';
          msgEl.innerHTML = '<i class="ri-error-warning-line"></i> Invalid promo code';
          setTimeout(() => { msgEl.className = 'promo-success'; }, 3000);
        }
      }
    });

    // Enter key submits
    document.getElementById('promo-input')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') promoBtn.click();
    });
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────
export { initCartDrawer, initCartPage, getCart, cartTotal, refreshBadges };
