/**
 * Product detail page logic.
 * Handles: data loading, color variants, size selection,
 * quantity, add-to-cart, wishlist, tabs, accordion, related products.
 */

import { ShoeViewer3D } from './three-viewer.js';

// ── Product catalogue (shared with shop; Day 7 pulls from Firebase) ───────────
const PRODUCTS = [
  {
    id: 'nike-af1-white',
    brand: 'Nike', name: 'Air Force 1 \'07 Low',
    sku: 'CW2288-111',
    price: 110, oldPrice: null,
    badge: 'New', rating: 4.8, reviews: 312,
    stock: 'in', stockLabel: 'In Stock',
    sizes: ['7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12'],
    soldOut: ['11','11.5'],
    tags: ['nike','lifestyle','low-top'],
    colorways: [
      { name: 'White/White',   upper: '#ffffff', sole: '#e8e8e8', swoosh: '#FF3D00', glowHex: '#FF3D00', bg: 'linear-gradient(135deg,#f0f0f0,#e0e0e0)' },
      { name: 'White/Black',   upper: '#f8f8f8', sole: '#111111', swoosh: '#111111', glowHex: '#333333', bg: 'linear-gradient(135deg,#f5f5f5,#ddd)' },
      { name: 'Triple Black',  upper: '#111111', sole: '#0a0a0a', swoosh: '#FF3D00', glowHex: '#FF3D00', bg: 'linear-gradient(135deg,#111,#222)' },
      { name: 'White/Gum',     upper: '#ffffff', sole: '#c8a46e', swoosh: '#8B5E3C', glowHex: '#c8a46e', bg: 'linear-gradient(135deg,#f5f0e8,#e8d8c0)' },
      { name: 'Infrared',      upper: '#cc0000', sole: '#e0e0e0', swoosh: '#ffffff', glowHex: '#cc0000', bg: 'linear-gradient(135deg,#1a0000,#2d0606)' },
    ],
    description: `The Nike Air Force 1 '07 Low is a modern take on the 1982 classic. Built with a durable leather upper and the iconic Air cushioning unit in the sole, it keeps you comfortable all day long. The clean, minimal design makes it the most versatile sneaker ever made — it goes with everything.`,
    longDesc: `Originally designed for basketball by Bruce Kilgore, the Air Force 1 became the first basketball shoe to use Nike Air cushioning technology. Decades later, it stands as one of the most iconic silhouettes in sneaker culture, embraced by athletes, artists, and streetwear enthusiasts worldwide. Every The Snicker Lab pair is verified authentic and ships in original Nike packaging.`,
    specs: [
      { key: 'Style', val: 'Low-Top' },
      { key: 'Material', val: 'Premium Leather' },
      { key: 'Sole', val: 'Rubber + Air Unit' },
      { key: 'Weight', val: '13.2 oz (US 10)' },
      { key: 'Closure', val: 'Lace-Up' },
      { key: 'Country', val: 'Vietnam' },
      { key: 'Release', val: 'Feb 2025' },
      { key: 'Colourway', val: 'White/White' },
    ],
    reviewData: {
      avg: 4.8, total: 312,
      bars: [{ stars: 5, count: 218 }, { stars: 4, count: 72 }, { stars: 3, count: 16 }, { stars: 2, count: 4 }, { stars: 1, count: 2 }],
      reviews: [
        { name: 'Marcus J.', avatar: '#FF3D00', date: 'Jun 12 2025', stars: 5, title: 'Perfect everyday shoe', text: 'These are my third pair of AF1s and The Snicker Lab delivered them faster than expected. The leather quality is top-notch — butter soft right out of the box. Sizing is true to size.', size: 'US 10', width: 'Regular', verified: true },
        { name: 'Aisha K.',  avatar: '#7B2FBE', date: 'May 28 2025', stars: 5, title: 'Clean and authentic',  text: 'Got the White/Black colourway. The stitching is perfect and the box came sealed. Authentication card included. The Snicker Lab is my go-to from now on.', size: 'US 8', width: 'Regular', verified: true },
        { name: 'Derek L.',  avatar: '#00B8CC', date: 'Apr 15 2025', stars: 4, title: 'Great but runs slightly large', text: 'Love the shoe but I\'d recommend going half a size down. Otherwise perfect — sole is thick and cushioned, the leather looks premium.', size: 'US 9.5', width: 'Regular', verified: true },
      ],
    },
    related: ['nike-dunk-panda','jordan-1-chicago','adidas-ub23-black','nike-airmax-90'],
  },
  {
    id: 'nike-dunk-panda',
    brand: 'Nike', name: 'Dunk Low Retro "Panda"',
    sku: 'DD1391-100',
    price: 100, oldPrice: null,
    badge: 'Hot', rating: 4.9, reviews: 1204,
    stock: 'low', stockLabel: 'Only 3 Left',
    sizes: ['7','7.5','8','8.5','9','9.5','10','10.5','11'],
    soldOut: ['9','10'],
    tags: ['nike','lifestyle','low-top'],
    colorways: [
      { name: 'Panda',        upper: '#ffffff', sole: '#111111', swoosh: '#111111', glowHex: '#333333', bg: 'linear-gradient(135deg,#f8f8f8,#e8e8e8)' },
      { name: 'White/Orange', upper: '#ffffff', sole: '#FF3D00', swoosh: '#FF3D00', glowHex: '#FF3D00', bg: 'linear-gradient(135deg,#fff8f5,#ffe5d9)' },
      { name: 'Black',        upper: '#111111', sole: '#0a0a0a', swoosh: '#ffffff', glowHex: '#555555', bg: 'linear-gradient(135deg,#111,#1a1a1a)' },
    ],
    description: 'The Dunk Low "Panda" is the most sought-after colourway of 2024–25. Black and white contrast panels over a classic low-top silhouette — simple, bold, and impossible to go wrong with.',
    longDesc: 'Originally a basketball shoe from 1985, the Nike Dunk evolved into a skateboarding icon and streetwear staple. The Panda colourway — clean white base with black overlays — became one of the fastest-selling Dunks in history.',
    specs: [
      { key: 'Style', val: 'Low-Top' },
      { key: 'Material', val: 'Leather' },
      { key: 'Sole', val: 'Rubber' },
      { key: 'Weight', val: '11.8 oz (US 10)' },
      { key: 'Closure', val: 'Lace-Up' },
      { key: 'Country', val: 'China' },
      { key: 'Release', val: 'Mar 2025' },
      { key: 'Colourway', val: 'White/Black' },
    ],
    reviewData: {
      avg: 4.9, total: 1204,
      bars: [{ stars: 5, count: 980 }, { stars: 4, count: 180 }, { stars: 3, count: 32 }, { stars: 2, count: 8 }, { stars: 1, count: 4 }],
      reviews: [
        { name: 'Jamie S.', avatar: '#111111', date: 'Jun 18 2025', stars: 5, title: 'THE sneaker of 2025', text: 'Finally got my pair after months of trying. The Snicker Lab had them at retail price — incredible. Came double-boxed with authentication card.', size: 'US 9.5', width: 'Regular', verified: true },
        { name: 'Priya M.', avatar: '#FF3D00', date: 'Jun 2 2025',  stars: 5, title: 'Perfect in every way', text: 'Bought as a gift and they loved it. Packaging was pristine. Sole is incredibly grippy and the colourway is even cleaner in person.', size: 'US 7', width: 'Regular', verified: true },
        { name: 'Tom R.',   avatar: '#22c55e', date: 'May 10 2025', stars: 4, title: 'Great but check sizing', text: 'Love the shoe. Only knock is sizing — I normally wear a 10 but these fit a bit narrow. Recommend going up a half size.', size: 'US 10.5', width: 'Wide', verified: true },
      ],
    },
    related: ['nike-af1-white','jordan-1-chicago','adidas-nmd-r1','nb-550-white-green'],
  },
  {
    id: 'jordan-1-chicago',
    brand: 'Jordan', name: 'Air Jordan 1 Retro High OG "Chicago"',
    sku: 'DZ5485-612',
    price: 180, oldPrice: 210,
    badge: 'Hot', rating: 4.9, reviews: 2031,
    stock: 'low', stockLabel: 'Only 5 Left',
    sizes: ['7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12'],
    soldOut: ['7','7.5','8'],
    tags: ['jordan','lifestyle','high-top'],
    colorways: [
      { name: 'Chicago',     upper: '#cc0000', sole: '#e0e0e0', swoosh: '#ffffff', glowHex: '#cc0000', bg: 'linear-gradient(135deg,#1a0000,#2d0606 60%,#1a0000)' },
      { name: 'Bred',        upper: '#111111', sole: '#cc0000', swoosh: '#cc0000', glowHex: '#cc0000', bg: 'linear-gradient(135deg,#0a0a0a,#1a0000)' },
      { name: 'Royal Blue',  upper: '#003399', sole: '#e0e0e0', swoosh: '#ffffff', glowHex: '#003399', bg: 'linear-gradient(135deg,#000a1a,#001a3d)' },
      { name: 'Shadow',      upper: '#444444', sole: '#e0e0e0', swoosh: '#ffffff', glowHex: '#555555', bg: 'linear-gradient(135deg,#1a1a1a,#2d2d2d)' },
    ],
    description: 'The Air Jordan 1 Retro High OG "Chicago" is arguably the most iconic sneaker ever created. Originally worn by Michael Jordan in 1985, this re-release stays true to the original colourway with premium leather construction.',
    longDesc: 'When Nike released the original Air Jordan 1 in 1985, the NBA fined Michael Jordan $5,000 every time he wore them on court — and he wore them every game. That rebellious origin story is embedded in every pair. The Chicago colourway is the Holy Grail of sneaker collecting.',
    specs: [
      { key: 'Style', val: 'High-Top' },
      { key: 'Material', val: 'Full-Grain Leather' },
      { key: 'Sole', val: 'Rubber + Air Unit' },
      { key: 'Weight', val: '15.4 oz (US 10)' },
      { key: 'Closure', val: 'Lace-Up' },
      { key: 'Country', val: 'China' },
      { key: 'Release', val: 'Jan 2025' },
      { key: 'Colourway', val: 'Varsity Red/White' },
    ],
    reviewData: {
      avg: 4.9, total: 2031,
      bars: [{ stars: 5, count: 1720 }, { stars: 4, count: 240 }, { stars: 3, count: 55 }, { stars: 2, count: 10 }, { stars: 1, count: 6 }],
      reviews: [
        { name: 'Chris A.',  avatar: '#cc0000', date: 'Jun 20 2025', stars: 5, title: 'Grail unlocked 🔥',    text: 'Spent months hunting these. The Snicker Lab had them at retail. Shipped same day, came in perfect condition. The leather is stiff at first but breaks in beautifully.', size: 'US 10', width: 'Regular', verified: true },
        { name: 'Sofia L.',  avatar: '#FFD600', date: 'May 30 2025', stars: 5, title: 'Worth every penny',   text: 'I know they\'re slightly over retail but for the Chicago? Absolutely worth it. Authentication was thorough and the shoe is perfect.', size: 'US 8.5', width: 'Regular', verified: true },
        { name: 'Nathan B.', avatar: '#7B2FBE', date: 'Apr 22 2025', stars: 5, title: 'Museum piece or daily', text: 'Bought two pairs — one to wear, one to keep. The Snicker Lab made it easy. The box was sealed and included original receipt.', size: 'US 11', width: 'Regular', verified: true },
      ],
    },
    related: ['jordan-4-fire-red','jordan-11-concord','nike-af1-white','nike-dunk-panda'],
  },
];

// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  product:       null,
  selectedColor: 0,
  selectedSize:  null,
  qty:           1,
  wishlisted:    false,
};

let viewer = null;

// ── Boot ─────────────────────────────────────────────────────────────────────
function initProduct() {
  const params  = new URLSearchParams(window.location.search);
  const id      = params.get('id') || 'nike-af1-white';
  state.product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];

  renderBreadcrumb();
  renderProductInfo();
  renderColorSwatches();
  renderSizeGrid();
  renderAccordion();
  renderTabs();
  renderRelated();
  initViewer();
  bindCartActions();
  bindWishlist();
  bindTabs();
  bindAccordion();
  initQuantity();
  updatePageTitle();
}

function updatePageTitle() {
  const p = state.product;
  document.title = `${p.name} | The Snicker Lab`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = `Buy ${p.name} at The Snicker Lab. Authentic, verified, fast shipping.`;
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────
function renderBreadcrumb() {
  const p = state.product;
  const el = document.getElementById('breadcrumb-product');
  if (el) el.textContent = p.name;
  const brandEl = document.getElementById('breadcrumb-brand');
  if (brandEl) {
    brandEl.textContent = p.brand;
    brandEl.href = `shop.html?brand=${p.brand.toLowerCase()}`;
  }
}

// ── Product header info ───────────────────────────────────────────────────────
function renderProductInfo() {
  const p = state.product;
  set('product-brand',   p.brand);
  set('product-name',    p.name);
  set('product-sku',     `SKU: ${p.sku}`);
  set('product-price',   `$${p.price}`);
  set('product-price-old', p.oldPrice ? `$${p.oldPrice}` : '');
  if (p.oldPrice) {
    const save = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
    set('product-save', `Save ${save}%`);
    show('price-save-wrap');
  }
  set('product-rating-val', p.rating.toFixed(1));
  set('product-review-count', `${p.reviews.toLocaleString()} reviews`);
  const starsEl = document.getElementById('product-rating-stars');
  if (starsEl) starsEl.innerHTML = buildStars(p.rating);

  const stockEl = document.getElementById('product-stock');
  if (stockEl) {
    stockEl.className = `stock-badge stock-badge--${p.stock === 'low' ? 'low' : 'in'}`;
    stockEl.innerHTML = `<i class="ri-checkbox-circle-fill"></i> ${p.stockLabel}`;
  }
}

// ── Viewer ────────────────────────────────────────────────────────────────────
function initViewer() {
  viewer = new ShoeViewer3D('viewer-3d', 'viewer-shoe-svg-wrap');
  applyColorToViewer(0);

  // Auto-rotate badge toggle
  const rotBtn = document.getElementById('btn-rotate');
  if (rotBtn) {
    rotBtn.addEventListener('click', () => {
      if (!viewer) return;
      viewer.autoRotate = !viewer.autoRotate;
      rotBtn.classList.toggle('active', viewer.autoRotate);
    });
  }

  // Reset button
  const resetBtn = document.getElementById('btn-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (!viewer) return;
      viewer.targetRotY = 0;
      viewer.targetRotX = 0;
      viewer.autoRotate = true;
    });
  }

  // Thumbnails
  document.querySelectorAll('.viewer-thumb').forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.viewer-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
}

function applyColorToViewer(colorIdx) {
  const cw = state.product.colorways[colorIdx];
  if (!cw) return;
  updateSVGColors(cw);
  if (viewer) viewer.updateColor(cw.glowHex);

  // Update viewer background tint
  const v3d = document.getElementById('viewer-3d');
  if (v3d) {
    v3d.style.background = `radial-gradient(ellipse 60% 60% at 60% 50%, ${cw.glowHex}18 0%, transparent 65%), var(--clr-bg-dark-2)`;
  }
}

// Dynamically update the hero SVG shoe colors
function updateSVGColors(cw) {
  const svg = document.getElementById('hero-product-svg');
  if (!svg) return;

  // Upper fill
  svg.querySelectorAll('.svg-upper').forEach(el => el.setAttribute('fill', cw.upper));
  // Sole
  svg.querySelectorAll('.svg-sole').forEach(el => el.setAttribute('fill', cw.sole));
  // Swoosh
  svg.querySelectorAll('.svg-swoosh').forEach(el => el.setAttribute('fill', cw.swoosh));
  // Toe
  svg.querySelectorAll('.svg-toe').forEach(el => el.setAttribute('fill', cw.upper === '#111111' ? '#1a1a1a' : '#f5f5f5'));
}

// ── Color swatches ────────────────────────────────────────────────────────────
function renderColorSwatches() {
  const wrap = document.getElementById('color-swatches');
  if (!wrap) return;
  const p = state.product;

  wrap.innerHTML = p.colorways.map((cw, i) => `
    <button class="color-swatch ${i === 0 ? 'active' : ''}"
            data-index="${i}"
            aria-label="${cw.name}"
            title="${cw.name}">
      <div class="color-swatch__inner" style="background:${cw.bg};"></div>
      <span class="color-swatch__check"><i class="ri-check-line"></i></span>
    </button>
  `).join('');

  wrap.querySelectorAll('.color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      wrap.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const idx = parseInt(btn.dataset.index);
      state.selectedColor = idx;
      set('selected-color-name', p.colorways[idx].name);

      applyColorToViewer(idx);

      // Animate SVG with GSAP if available
      if (typeof gsap !== 'undefined') {
        const svg = document.getElementById('hero-product-svg');
        gsap.fromTo(svg,
          { scale: 0.96, opacity: 0.7 },
          { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.4)' }
        );
      }
    });
  });

  set('selected-color-name', p.colorways[0].name);
}

// ── Size grid ─────────────────────────────────────────────────────────────────
function renderSizeGrid() {
  const wrap = document.getElementById('size-grid');
  if (!wrap) return;
  const p = state.product;

  wrap.innerHTML = p.sizes.map(s => {
    const so = p.soldOut.includes(s);
    return `
      <button class="size-btn ${so ? '' : ''}"
              data-size="${s}"
              ${so ? 'disabled' : ''}
              aria-label="Size ${s} US ${so ? '— Sold Out' : ''}">
        ${s}
      </button>
    `;
  }).join('');

  wrap.querySelectorAll('.size-btn:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', () => {
      wrap.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedSize = btn.dataset.size;
      set('selected-size-label', `US ${state.selectedSize}`);
      show('selected-size-label-wrap');
      hide('size-prompt');
    });
  });
}

// ── Quantity ──────────────────────────────────────────────────────────────────
function initQuantity() {
  const dec = document.getElementById('qty-dec');
  const inc = document.getElementById('qty-inc');
  const val = document.getElementById('qty-value');

  if (!dec || !inc || !val) return;

  const update = () => {
    val.textContent = state.qty;
    dec.disabled = state.qty <= 1;
    inc.disabled = state.qty >= 10;
  };

  dec.addEventListener('click', () => { if (state.qty > 1)  { state.qty--; update(); } });
  inc.addEventListener('click', () => { if (state.qty < 10) { state.qty++; update(); } });

  update();
}

// ── Add to cart ───────────────────────────────────────────────────────────────
function bindCartActions() {
  const btn = document.getElementById('add-to-cart-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!state.selectedSize) {
      show('size-prompt');
      document.getElementById('size-grid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof gsap !== 'undefined') {
        gsap.fromTo('#size-grid', { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(3,0.3)', repeat: 3, yoyo: true });
      }
      return;
    }

    const p   = state.product;
    const cw  = p.colorways[state.selectedColor];
    const cart = JSON.parse(localStorage.getItem('sl_cart') || '[]');
    const key  = `${p.id}-${state.selectedSize}-${cw.name}`;
    const idx  = cart.findIndex(i => i.cartKey === key);

    if (idx > -1) { cart[idx].qty += state.qty; }
    else { cart.push({ ...p, cartKey: key, colorway: cw.name, size: state.selectedSize, qty: state.qty }); }

    localStorage.setItem('sl_cart', JSON.stringify(cart));
    document.dispatchEvent(new CustomEvent('sl:cart-add', { detail: { name: p.name } }));

    // Update nav badge
    const badge = document.querySelector('.nav__cart-count');
    if (badge) {
      const total = cart.reduce((s, i) => s + i.qty, 0);
      badge.textContent = total;
      badge.classList.add('visible');
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(badge, { scale: 1.8 }, { scale: 1, duration: 0.5, ease: 'back.out(2)' });
      }
    }

    // Button success state
    const orig = btn.innerHTML;
    btn.classList.add('success');
    btn.innerHTML = '<i class="ri-check-line"></i> Added to Cart!';
    setTimeout(() => {
      btn.classList.remove('success');
      btn.innerHTML = orig;
    }, 2000);
  });
}

// ── Wishlist ──────────────────────────────────────────────────────────────────
function bindWishlist() {
  const btn = document.getElementById('wishlist-btn');
  if (!btn) return;

  const w   = JSON.parse(localStorage.getItem('sl_wishlist') || '[]');
  state.wishlisted = w.includes(state.product.id);
  updateWishlistBtn();

  btn.addEventListener('click', () => {
    state.wishlisted = !state.wishlisted;
    const w2 = JSON.parse(localStorage.getItem('sl_wishlist') || '[]');
    if (state.wishlisted) { w2.push(state.product.id); }
    else { const i = w2.indexOf(state.product.id); if (i > -1) w2.splice(i, 1); }
    localStorage.setItem('sl_wishlist', JSON.stringify(w2));
    updateWishlistBtn();
    if (state.wishlisted && typeof gsap !== 'undefined') {
      gsap.fromTo(btn, { scale: 1.4 }, { scale: 1, duration: 0.5, ease: 'back.out(2)' });
    }
  });
}

function updateWishlistBtn() {
  const btn = document.getElementById('wishlist-btn');
  if (!btn) return;
  btn.classList.toggle('active', state.wishlisted);
  btn.querySelector('i').className = state.wishlisted ? 'ri-heart-fill' : 'ri-heart-line';
  btn.setAttribute('aria-pressed', state.wishlisted);
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
function renderTabs() {
  const p = state.product;
  // Description
  set('tab-desc-lead', p.description);
  set('tab-desc-body', p.longDesc);

  // Specs
  const specsWrap = document.getElementById('specs-grid');
  if (specsWrap) {
    specsWrap.innerHTML = p.specs.map(s => `
      <div class="spec-row">
        <span class="spec-key">${s.key}</span>
        <span class="spec-val">${s.val}</span>
      </div>
    `).join('');
  }

  // Reviews
  renderReviews();
}

function renderReviews() {
  const p  = state.product;
  const rd = p.reviewData;

  set('review-avg', rd.avg.toFixed(1));
  set('review-total', `${rd.total.toLocaleString()} verified ratings`);

  const starsEl = document.getElementById('review-avg-stars');
  if (starsEl) starsEl.innerHTML = buildStars(rd.avg);

  const barsWrap = document.getElementById('review-bars');
  if (barsWrap) {
    barsWrap.innerHTML = rd.bars.map(b => {
      const pct = Math.round((b.count / rd.total) * 100);
      return `
        <div class="review-bar">
          <span class="review-bar__label">${b.stars}<i class="ri-star-fill" style="font-size:9px;"></i></span>
          <div class="review-bar__track">
            <div class="review-bar__fill" style="width:${pct}%;"></div>
          </div>
          <span class="review-bar__count">${b.count}</span>
        </div>
      `;
    }).join('');
  }

  const listWrap = document.getElementById('review-list');
  if (listWrap) {
    listWrap.innerHTML = rd.reviews.map(r => `
      <div class="review-card">
        <div class="review-card__header">
          <div style="display:flex;align-items:center;gap:var(--space-3);">
            <div class="review-card__avatar" style="background:${r.avatar};">
              ${r.name.charAt(0)}
            </div>
            <div class="review-card__meta">
              <p class="review-card__name">${r.name}</p>
              <p class="review-card__date">${r.date}</p>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:var(--space-1);">
            <div class="review-card__stars">${buildStars(r.stars)}</div>
            ${r.verified ? '<span class="review-card__verified"><i class="ri-shield-check-fill"></i> Verified</span>' : ''}
          </div>
        </div>
        <p class="review-card__title">${r.title}</p>
        <p class="review-card__text">${r.text}</p>
        <div class="review-card__size-info">
          <span>Size purchased: <strong style="color:var(--clr-white);">${r.size}</strong></span>
          <span>Width: <strong style="color:var(--clr-white);">${r.width}</strong></span>
        </div>
      </div>
    `).join('');
  }
}

function bindTabs() {
  const btns   = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b   => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(`tab-${btn.dataset.tab}`);
      if (target) {
        target.classList.add('active');
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(target, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
        }
      }
    });
  });
}

// ── Accordion ─────────────────────────────────────────────────────────────────
function renderAccordion() {
  /* Content is in HTML — just set up open/close */
}

function bindAccordion() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // Open first by default
  document.querySelector('.accordion-item')?.classList.add('open');
}

// ── Related products ──────────────────────────────────────────────────────────
function renderRelated() {
  const wrap = document.getElementById('related-grid');
  if (!wrap) return;

  const relatedIds = state.product.related || [];
  const related    = relatedIds
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean)
    .slice(0, 4);

  if (!related.length) { document.querySelector('.related-section')?.remove(); return; }

  wrap.innerHTML = related.map(p => {
    const cw = p.colorways[0];
    return `
      <article class="product-card" onclick="window.location='product.html?id=${p.id}'" style="cursor:pointer;">
        <div class="product-card__img-wrap">
          <div class="product-card__bg" style="background:${cw.bg};"></div>
          ${buildMiniSVG(cw)}
          ${p.badge ? `<span class="product-card__badge badge--${p.badge.toLowerCase()}">${p.badge}</span>` : ''}
        </div>
        <div class="product-card__body">
          <p class="product-card__brand">${p.brand}</p>
          <h3 class="product-card__name">${p.name}</h3>
          <div class="product-card__meta">
            <div class="product-card__price">
              <span class="product-card__price-current">$${p.price}</span>
              ${p.oldPrice ? `<span class="product-card__price-old">$${p.oldPrice}</span>` : ''}
            </div>
            <div style="color:#FFD600;font-size:var(--fs-xs);">${buildStars(p.rating)}</div>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Animate related cards
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.fromTo('.related-grid .product-card',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '#related-grid', start: 'top 85%' }
      }
    );
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function show(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('visible');
}

function hide(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('visible');
}

function buildStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  let s = '';
  for (let i = 0; i < full; i++) s += '<i class="ri-star-fill"></i>';
  if (half) s += '<i class="ri-star-half-fill"></i>';
  const empty = 5 - Math.ceil(rating);
  for (let i = 0; i < empty; i++) s += '<i class="ri-star-line" style="opacity:0.3;"></i>';
  return s;
}

function buildMiniSVG(cw) {
  return `
  <svg class="product-card__shoe" viewBox="0 0 780 440" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="400" cy="415" rx="260" ry="13" fill="rgba(0,0,0,0.2)"/>
    <path d="M105,348 C108,362 148,378 260,384 C360,390 520,386 640,372 C680,366 700,354 698,340 L688,326 C660,342 570,360 420,364 C270,368 148,358 108,338 Z" fill="${cw.sole === '#e0e0e0' || cw.sole === '#e8e8e8' ? '#111' : '#0a0a0a'}"/>
    <path d="M120,298 C140,308 220,318 380,320 C520,322 615,310 635,298 L638,275 C615,290 530,305 380,305 C230,305 145,292 120,278 Z" fill="${cw.sole}"/>
    <path d="M125,278 C135,240 175,200 240,178 C305,156 390,150 480,165 C555,177 620,205 645,240 C658,260 650,280 638,295 C615,308 530,320 380,318 C230,316 140,300 125,278 Z" fill="${cw.upper}"/>
    <path d="M195,260 C240,230 340,220 448,234 C512,243 566,261 558,280 C522,266 412,256 312,270 C260,278 196,292 195,260 Z" fill="${cw.swoosh}"/>
    <rect x="300" y="158" width="255" height="55" rx="8" fill="rgba(128,128,128,0.15)"/>
    <path d="M312,172 Q428,163 548,172" stroke="rgba(255,255,255,0.7)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M312,188 Q428,179 548,188" stroke="rgba(255,255,255,0.7)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M312,204 Q428,195 548,204" stroke="rgba(255,255,255,0.7)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M430,155 C447,145 478,143 494,154 L497,214 C479,208 440,208 426,214 Z" fill="rgba(200,200,200,0.2)"/>
    <rect x="640" y="218" width="28" height="44" rx="4" fill="${cw.swoosh}"/>
  </svg>`;
}

export { initProduct };
