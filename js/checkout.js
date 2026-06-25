/**
 * Multi-step checkout: Info → Shipping → Payment → Confirmation
 * Reads cart from localStorage (sl_cart), saves order to sl_last_order on confirm.
 */

import { getCart, cartTotal } from './cart.js';
import { saveOrder, auth, isConfigured } from './firebase.js';

// ─── State ────────────────────────────────────────────────────────────────────
let currentStep = 1;
const TOTAL_STEPS = 3;
const SHIPPING_OPTIONS = [
  { id: 'standard', label: 'Standard Shipping', eta: '5–7 business days', price: 8.99 },
  { id: 'express',  label: 'Express Shipping',  eta: '2–3 business days', price: 18.99 },
  { id: 'overnight',label: 'Overnight',          eta: 'Next business day',  price: 34.99 },
];
let selectedShipping = 'standard';
let appliedPromo     = null;
const PROMOS = { 'SNICK10': 0.10, 'LAB20': 0.20, 'WELCOME': 0.15 };

// ─── Init ─────────────────────────────────────────────────────────────────────
function initCheckout() {
  const cart = getCart();

  // Redirect if empty cart
  if (!cart.length) {
    window.location.href = 'cart.html';
    return;
  }

  renderMiniSummary(cart);
  renderStep(1);
  bindStepNav();
  bindPromo();
}

// ─── Mini order summary sidebar ───────────────────────────────────────────────
function renderMiniSummary(cart) {
  const wrap = document.getElementById('checkout-summary-items');
  if (!wrap) return;

  wrap.innerHTML = cart.map(item => `
    <div class="mini-order-item">
      <div class="mini-order-item__img" style="background:${item.colorways?.[0]?.bg || 'rgba(255,255,255,0.05)'};">
        <span class="mini-order-item__qty-badge">${item.qty}</span>
        ${buildMiniSVG(item)}
      </div>
      <div class="mini-order-item__info">
        <p class="mini-order-item__name">${item.name || 'Sneaker'}</p>
        <p class="mini-order-item__meta">
          ${item.size ? `US ${item.size}` : ''} ${item.colorway ? `· ${item.colorway}` : ''}
        </p>
      </div>
      <span class="mini-order-item__price">$${(item.price * item.qty).toFixed(2)}</span>
    </div>
  `).join('');

  updateCheckoutTotals();
}

function updateCheckoutTotals() {
  const cart     = getCart();
  const subtotal = cartTotal(cart);
  const discount = appliedPromo ? subtotal * PROMOS[appliedPromo] : 0;
  const shipping = getShippingPrice(subtotal - discount);
  const tax      = (subtotal - discount + shipping) * 0.08;
  const total    = subtotal - discount + shipping + tax;

  setVal('co-subtotal',  `$${subtotal.toFixed(2)}`);
  setVal('co-shipping',  shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`);
  setVal('co-tax',       `$${tax.toFixed(2)}`);
  setVal('co-total',     `$${total.toFixed(2)}`);

  const discRow = document.getElementById('co-discount-row');
  if (discRow) discRow.style.display = appliedPromo ? 'flex' : 'none';
  setVal('co-discount', `-$${discount.toFixed(2)}`);
}

function getShippingPrice(subtotalAfterDiscount) {
  if (subtotalAfterDiscount >= 100) return 0;
  const opt = SHIPPING_OPTIONS.find(o => o.id === selectedShipping);
  return opt ? opt.price : 8.99;
}

// ─── Step rendering ───────────────────────────────────────────────────────────
function renderStep(step) {
  currentStep = step;

  // Update progress indicator
  document.querySelectorAll('.checkout-step').forEach((el, i) => {
    const n = i + 1;
    el.classList.toggle('active',    n === step);
    el.classList.toggle('completed', n < step);
  });

  // Show the right panel
  document.querySelectorAll('[data-checkout-step]').forEach(panel => {
    panel.style.display = panel.dataset.checkoutStep == step ? 'block' : 'none';
  });

  // Scroll top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Step-specific init
  if (step === 2) renderShippingOptions();
  if (step === 3) bindPaymentFormatting();
}

function renderShippingOptions() {
  const wrap = document.getElementById('shipping-options');
  if (!wrap) return;

  wrap.innerHTML = SHIPPING_OPTIONS.map(opt => `
    <label class="shipping-option ${opt.id === selectedShipping ? 'selected' : ''}">
      <input type="radio" name="shipping" value="${opt.id}" ${opt.id === selectedShipping ? 'checked' : ''}>
      <div class="shipping-option__info">
        <span class="shipping-option__label">${opt.label}</span>
        <span class="shipping-option__eta">${opt.eta}</span>
      </div>
      <span class="shipping-option__price">
        ${opt.price === 0 ? 'Free' : `$${opt.price.toFixed(2)}`}
      </span>
    </label>
  `).join('');

  wrap.querySelectorAll('input[name="shipping"]').forEach(input => {
    input.addEventListener('change', () => {
      selectedShipping = input.value;
      wrap.querySelectorAll('.shipping-option').forEach(el => el.classList.remove('selected'));
      input.closest('.shipping-option')?.classList.add('selected');
      updateCheckoutTotals();
    });
  });
}

// ─── Step navigation ──────────────────────────────────────────────────────────
function bindStepNav() {
  document.querySelectorAll('[data-step-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!validateStep(currentStep)) return;
      if (currentStep < TOTAL_STEPS) {
        renderStep(currentStep + 1);
      } else {
        placeOrder();
      }
    });
  });

  document.querySelectorAll('[data-step-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 1) renderStep(currentStep - 1);
    });
  });
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validateStep(step) {
  let valid = true;

  if (step === 1) {
    const fields = ['co-first-name','co-last-name','co-email','co-phone',
                    'co-address','co-city','co-state','co-zip','co-country'];
    fields.forEach(id => {
      const el    = document.getElementById(id);
      const group = el?.closest('.form-group');
      const errEl = group?.querySelector('.form-error');
      if (!el) return;

      const val = el.value.trim();
      let err   = '';

      if (!val) {
        err = 'This field is required';
      } else if (id === 'co-email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        err = 'Enter a valid email address';
      } else if (id === 'co-phone' && !/^\+?[\d\s\-().]{7,}$/.test(val)) {
        err = 'Enter a valid phone number';
      } else if (id === 'co-zip' && val.length < 3) {
        err = 'Enter a valid postal code';
      }

      el.classList.toggle('error',  !!err);
      el.classList.toggle('valid', !err && !!val);
      if (errEl) { errEl.textContent = err; errEl.style.display = err ? 'block' : 'none'; }
      if (err) valid = false;
    });
  }

  if (step === 3) {
    const fields = ['co-card-name','co-card-number','co-card-expiry','co-card-cvv'];
    fields.forEach(id => {
      const el    = document.getElementById(id);
      const group = el?.closest('.form-group');
      const errEl = group?.querySelector('.form-error');
      if (!el) return;

      const val = el.value.trim();
      let err   = '';
      if (!val) {
        err = 'This field is required';
      } else if (id === 'co-card-number' && val.replace(/\s/g,'').length < 16) {
        err = 'Enter a valid 16-digit card number';
      } else if (id === 'co-card-expiry' && !/^\d{2}\/\d{2}$/.test(val)) {
        err = 'Enter date as MM/YY';
      } else if (id === 'co-card-cvv' && val.length < 3) {
        err = 'Enter a valid CVV';
      }

      el.classList.toggle('error',  !!err);
      el.classList.toggle('valid', !err && !!val);
      if (errEl) { errEl.textContent = err; errEl.style.display = err ? 'block' : 'none'; }
      if (err) valid = false;
    });
  }

  return valid;
}

// ─── Payment field auto-formatting ───────────────────────────────────────────
function bindPaymentFormatting() {
  const cardNum = document.getElementById('co-card-number');
  if (cardNum) {
    cardNum.addEventListener('input', () => {
      let v = cardNum.value.replace(/\D/g, '').slice(0, 16);
      cardNum.value = v.match(/.{1,4}/g)?.join(' ') || v;
    });
  }

  const expiry = document.getElementById('co-card-expiry');
  if (expiry) {
    expiry.addEventListener('input', () => {
      let v = expiry.value.replace(/\D/g, '').slice(0, 4);
      if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2);
      expiry.value = v;
    });
  }

  const cvv = document.getElementById('co-card-cvv');
  if (cvv) {
    cvv.addEventListener('input', () => {
      cvv.value = cvv.value.replace(/\D/g, '').slice(0, 4);
    });
  }

  // Real-time feedback as user types
  ['co-card-name','co-card-number','co-card-expiry','co-card-cvv'].forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener('blur', () => {
      if (el.value.trim()) el.classList.add('valid');
    });
  });
}

// ─── Promo code ───────────────────────────────────────────────────────────────
function bindPromo() {
  const btn = document.getElementById('co-promo-apply');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const input = document.getElementById('co-promo-input');
    const msgEl = document.getElementById('co-promo-msg');
    const code  = input?.value?.trim().toUpperCase();

    if (PROMOS[code]) {
      appliedPromo = code;
      if (msgEl) {
        msgEl.style.cssText = 'display:block;color:#22c55e;';
        msgEl.innerHTML = `<i class="ri-check-line"></i> "${code}" — ${Math.round(PROMOS[code]*100)}% discount applied!`;
      }
      if (input) { input.disabled = true; input.style.borderColor = '#22c55e'; }
      btn.textContent = 'Applied ✓';
      btn.disabled    = true;
      updateCheckoutTotals();
    } else {
      if (msgEl) {
        msgEl.style.cssText = 'display:block;color:#ef4444;';
        msgEl.innerHTML = '<i class="ri-error-warning-line"></i> Invalid promo code';
        setTimeout(() => { msgEl.style.display = 'none'; }, 3000);
      }
    }
  });

  document.getElementById('co-promo-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') btn.click();
  });
}

// ─── Place order ──────────────────────────────────────────────────────────────
function placeOrder() {
  const cart     = getCart();
  const subtotal = cartTotal(cart);
  const discount = appliedPromo ? subtotal * PROMOS[appliedPromo] : 0;
  const shipping = getShippingPrice(subtotal - discount);
  const tax      = (subtotal - discount + shipping) * 0.08;
  const total    = subtotal - discount + shipping + tax;

  // Build order object
  const order = {
    id:        'SV-' + Date.now().toString(36).toUpperCase(),
    date:      new Date().toISOString(),
    items:     cart,
    subtotal, discount, shipping, tax, total,
    promo:     appliedPromo,
    shippingMethod: selectedShipping,
    email:     document.getElementById('co-email')?.value || '',
    name:      `${document.getElementById('co-first-name')?.value || ''} ${document.getElementById('co-last-name')?.value || ''}`.trim(),
  };

  // Save to localStorage (always)
  localStorage.setItem('sl_last_order', JSON.stringify(order));
  localStorage.removeItem('sl_cart');

  // Save to Firestore (if configured)
  if (isConfigured()) {
    const uid = auth?.currentUser?.uid || null;
    saveOrder({ ...order, uid }).then(firestoreId => {
      if (firestoreId) order.firestoreId = firestoreId;
    }).catch(() => { /* non-blocking */ });
  }

  // Show confirmation
  showConfirmation(order);
}

function showConfirmation(order) {
  // Hide form
  document.querySelectorAll('[data-checkout-step]').forEach(p => p.style.display = 'none');

  // Update progress to all complete
  document.querySelectorAll('.checkout-step').forEach(el => el.classList.add('completed'));

  const confirmScreen = document.getElementById('checkout-confirmation');
  if (!confirmScreen) return;

  confirmScreen.style.display = 'block';

  setVal('conf-order-id',    order.id);
  setVal('conf-email',       order.email);
  setVal('conf-total',       `$${order.total.toFixed(2)}`);
  setVal('conf-item-count',  `${order.items.reduce((s,i) => s+i.qty, 0)} item(s)`);

  const eta = SHIPPING_OPTIONS.find(o => o.id === order.shippingMethod)?.eta || '5–7 business days';
  setVal('conf-shipping-eta', eta);

  // Pop-in animation
  if (window.gsap) {
    gsap.from(confirmScreen, { opacity: 0, y: 40, duration: 0.6, ease: 'power3.out' });
    gsap.from('.conf-checkmark', { scale: 0, duration: 0.5, ease: 'back.out(1.7)', delay: 0.3 });
    gsap.from('.conf-body > *', { opacity: 0, y: 20, stagger: 0.1, duration: 0.5, delay: 0.5 });
  }

  // Update all cart badges to 0
  document.querySelectorAll('.nav__cart-count').forEach(el => {
    el.textContent = '0';
    el.classList.remove('visible');
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function buildMiniSVG(item) {
  const swoosh = item.colorway?.includes('Black') ? '#444' :
                 item.colorway?.includes('Red')   ? '#cc0000' :
                 item.colorway?.includes('Blue')  ? '#003399' : '#FF3D00';
  const upper  = item.colorway?.includes('Black') ? '#222' :
                 item.colorway?.includes('Red')   ? '#aa0000' :
                 item.colorway?.includes('Blue')  ? '#1a1a3a' : '#ffffff';

  return `<svg viewBox="0 0 780 440" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M120,298 C140,308 220,318 380,320 C520,322 615,310 635,298 L638,275 C615,290 530,305 380,305 C230,305 145,292 120,278 Z" fill="#c8c8c8"/>
    <path d="M125,278 C135,240 175,200 240,178 C305,156 390,150 480,165 C555,177 620,205 645,240 C658,260 650,280 638,295 C615,308 530,320 380,318 C230,316 140,300 125,278 Z" fill="${upper}"/>
    <path d="M195,262 C238,232 338,222 450,236 C514,245 568,264 560,283 C524,268 414,256 312,272 C260,280 195,295 195,262 Z" fill="${swoosh}"/>
    <path d="M105,348 C108,362 148,378 260,384 C360,390 520,386 640,372 C680,366 700,354 698,340 L688,326 C660,342 570,360 420,364 C270,368 148,358 108,338 Z" fill="#0d0d0d"/>
  </svg>`;
}

export { initCheckout };
