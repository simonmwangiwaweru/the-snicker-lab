/**
 * Shop page: product data, filtering, sorting, card rendering,
 * 3D tilt, wishlist, add-to-cart, load more.
 */

// ── Product Data ──────────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id: 'nike-af1-white',
    brand: 'Nike', name: 'Air Force 1 \'07 Low',
    price: 110, oldPrice: null,
    badge: 'New', rating: 4.8, reviews: 312,
    sizes: ['7','8','9','10','11','12'],
    soldOut: ['11'],
    bg: 'linear-gradient(135deg,#f0f0f0 0%,#e0e0e0 100%)',
    shoeColor: 'white', swooshColor: '#FF3D00', heelColor: '#FF3D00',
    tags: ['nike','lifestyle','low-top'],
  },
  {
    id: 'nike-dunk-panda',
    brand: 'Nike', name: 'Dunk Low Retro "Panda"',
    price: 100, oldPrice: null,
    badge: 'Hot', rating: 4.9, reviews: 1204,
    sizes: ['7','8','9','10','11'],
    soldOut: ['9','10'],
    bg: 'linear-gradient(135deg,#f8f8f8 0%,#e8e8e8 100%)',
    shoeColor: 'panda', swooshColor: '#111', heelColor: '#111',
    tags: ['nike','lifestyle','low-top'],
  },
  {
    id: 'nike-airmax-90',
    brand: 'Nike', name: 'Air Max 90 "Infrared"',
    price: 130, oldPrice: 150,
    badge: 'Sale', rating: 4.7, reviews: 588,
    sizes: ['8','9','10','11','12'],
    soldOut: [],
    bg: 'linear-gradient(135deg,#1a0000 0%,#2d0d0d 100%)',
    shoeColor: 'dark-red', swooshColor: '#FF3D00', heelColor: '#FF3D00',
    tags: ['nike','running','low-top'],
  },
  {
    id: 'jordan-1-chicago',
    brand: 'Jordan', name: 'Air Jordan 1 Retro High OG "Chicago"',
    price: 180, oldPrice: 210,
    badge: 'Hot', rating: 4.9, reviews: 2031,
    sizes: ['7','8','9','10','11','12'],
    soldOut: ['7','8'],
    bg: 'linear-gradient(135deg,#1a0000 0%,#2d0606 60%,#1a0000 100%)',
    shoeColor: 'chicago', swooshColor: '#fff', heelColor: '#111',
    tags: ['jordan','lifestyle','high-top'],
  },
  {
    id: 'jordan-4-fire-red',
    brand: 'Jordan', name: 'Air Jordan 4 Retro "Fire Red"',
    price: 225, oldPrice: null,
    badge: 'New', rating: 4.8, reviews: 745,
    sizes: ['8','9','10','11'],
    soldOut: ['8'],
    bg: 'linear-gradient(135deg,#111 0%,#1a1a1a 100%)',
    shoeColor: 'fire-red', swooshColor: '#FF3D00', heelColor: '#FF3D00',
    tags: ['jordan','lifestyle','high-top'],
  },
  {
    id: 'jordan-11-concord',
    brand: 'Jordan', name: 'Air Jordan 11 Retro "Concord"',
    price: 250, oldPrice: null,
    badge: 'Exclusive', rating: 5.0, reviews: 430,
    sizes: ['8','9','10','11','12'],
    soldOut: ['12'],
    bg: 'linear-gradient(135deg,#0a0a1a 0%,#12122a 100%)',
    shoeColor: 'concord', swooshColor: '#7B2FBE', heelColor: '#7B2FBE',
    tags: ['jordan','lifestyle','high-top'],
  },
  {
    id: 'adidas-ub23-black',
    brand: 'Adidas', name: 'Ultraboost 23 "Core Black"',
    price: 153, oldPrice: 180,
    badge: 'Sale', rating: 4.7, reviews: 910,
    sizes: ['7','8','9','10','11','12'],
    soldOut: [],
    bg: 'linear-gradient(135deg,#001a2e 0%,#003050 60%,#001520 100%)',
    shoeColor: 'ub-black', swooshColor: '#00E5FF', heelColor: '#00E5FF',
    tags: ['adidas','running','low-top'],
  },
  {
    id: 'adidas-yeezy-350-zebra',
    brand: 'Adidas', name: 'Yeezy Boost 350 V2 "Zebra"',
    price: 285, oldPrice: null,
    badge: 'Exclusive', rating: 4.9, reviews: 1560,
    sizes: ['7','8','9','10'],
    soldOut: ['7'],
    bg: 'linear-gradient(135deg,#1a1a1a 0%,#2a2a2a 100%)',
    shoeColor: 'zebra', swooshColor: '#fff', heelColor: '#fff',
    tags: ['adidas','lifestyle','low-top'],
  },
  {
    id: 'adidas-nmd-r1',
    brand: 'Adidas', name: 'NMD R1 "Core Black"',
    price: 130, oldPrice: 140,
    badge: 'Sale', rating: 4.6, reviews: 678,
    sizes: ['7','8','9','10','11'],
    soldOut: [],
    bg: 'linear-gradient(135deg,#0d0d0d 0%,#1a1a1a 100%)',
    shoeColor: 'nmd-black', swooshColor: '#FF3D00', heelColor: '#FF3D00',
    tags: ['adidas','lifestyle','low-top'],
  },
  {
    id: 'puma-rsx-teal',
    brand: 'Puma', name: 'RS-X "Teal/White"',
    price: 90, oldPrice: null,
    badge: 'New', rating: 4.5, reviews: 234,
    sizes: ['7','8','9','10','11','12'],
    soldOut: [],
    bg: 'linear-gradient(135deg,#003333 0%,#005555 100%)',
    shoeColor: 'teal', swooshColor: '#00E5FF', heelColor: '#00E5FF',
    tags: ['puma','lifestyle','low-top'],
  },
  {
    id: 'nb-550-white-green',
    brand: 'New Balance', name: '550 "White/Green"',
    price: 110, oldPrice: null,
    badge: 'New', rating: 4.7, reviews: 387,
    sizes: ['7','8','9','10','11'],
    soldOut: ['11'],
    bg: 'linear-gradient(135deg,#f0f4f0 0%,#dce8dc 100%)',
    shoeColor: 'nb-green', swooshColor: '#2d7a2d', heelColor: '#2d7a2d',
    tags: ['new-balance','lifestyle','low-top'],
  },
  {
    id: 'converse-ct-black',
    brand: 'Converse', name: 'Chuck Taylor All Star "Black"',
    price: 65, oldPrice: null,
    badge: null, rating: 4.4, reviews: 2890,
    sizes: ['7','8','9','10','11','12'],
    soldOut: [],
    bg: 'linear-gradient(135deg,#111 0%,#222 100%)',
    shoeColor: 'ct-black', swooshColor: '#fff', heelColor: '#fff',
    tags: ['converse','lifestyle','high-top'],
  },
];

// ── SVG shoe builder (generates unique shoe per product) ──────────────────────
function buildShoeSVG(product) {
  const { shoeColor, swooshColor, heelColor } = product;

  const palettes = {
    'white':     { upper: ['#ffffff','#eeeeee'], toe: '#f7f7f7', sole: ['#e0e0e0','#c8c8c8'], outsole: '#111' },
    'panda':     { upper: ['#ffffff','#f0f0f0'], toe: '#111111', sole: ['#e0e0e0','#c0c0c0'], outsole: '#0a0a0a' },
    'dark-red':  { upper: ['#cc1100','#8b0000'], toe: '#6b0000', sole: ['#ddd','#ccc'], outsole: '#111' },
    'chicago':   { upper: ['#cc0000','#aa0000'], toe: '#111111', sole: ['#e0e0e0','#ccc'], outsole: '#0a0a0a' },
    'fire-red':  { upper: ['#222222','#111111'], toe: '#333',    sole: ['#ddd','#ccc'],       outsole: '#0a0a0a' },
    'concord':   { upper: ['#12122a','#0a0a1a'], toe: '#1a1a2e', sole: ['#ddd','#ccc'],       outsole: '#0a0a0a' },
    'ub-black':  { upper: ['#1a1a2e','#0d0d1a'], toe: '#111',   sole: ['#00b8cc','#009aaa'],  outsole: '#0a0a0a' },
    'zebra':     { upper: ['#f0f0f0','#e0e0e0'], toe: '#fff',   sole: ['#ddd','#ccc'],        outsole: '#111' },
    'nmd-black': { upper: ['#0d0d0d','#1a1a1a'], toe: '#222',   sole: ['#e0e0e0','#ccc'],     outsole: '#0a0a0a' },
    'teal':      { upper: ['#005555','#003333'], toe: '#004444', sole: ['#ddd','#bbb'],        outsole: '#111' },
    'nb-green':  { upper: ['#f8fdf8','#ecf5ec'], toe: '#e8f2e8', sole: ['#ddd','#ccc'],       outsole: '#222' },
    'ct-black':  { upper: ['#111111','#1a1a1a'], toe: '#222',   sole: ['#ddd','#bbb'],        outsole: '#0a0a0a' },
  };

  const p = palettes[shoeColor] || palettes['white'];
  const uid = product.id.replace(/-/g,'');

  return `<svg viewBox="0 0 780 440" xmlns="http://www.w3.org/2000/svg" class="product-card__shoe" aria-hidden="true">
  <defs>
    <linearGradient id="u-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.upper[0]}"/>
      <stop offset="100%" stop-color="${p.upper[1]}"/>
    </linearGradient>
    <linearGradient id="s-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${p.sole[0]}"/>
      <stop offset="100%" stop-color="${p.sole[1]}"/>
    </linearGradient>
  </defs>
  <ellipse cx="400" cy="415" rx="260" ry="13" fill="rgba(0,0,0,0.2)"/>
  <path d="M105,348 C108,362 148,378 260,384 C360,390 520,386 640,372 C680,366 700,354 698,340 L688,326 C660,342 570,360 420,364 C270,368 148,358 108,338 Z" fill="${p.outsole}"/>
  <path d="M120,298 C140,308 220,318 380,320 C520,322 615,310 635,298 L638,275 C615,290 530,305 380,305 C230,305 145,292 120,278 Z" fill="url(#s-${uid})"/>
  <path d="M140,306 C210,316 340,322 490,316 C574,312 635,300 658,288 L658,292 C634,306 570,318 490,322 C338,328 208,322 138,312 Z" fill="${swooshColor}" opacity="0.5"/>
  <path d="M125,278 C135,240 175,200 240,178 C305,156 390,150 480,165 C555,177 620,205 645,240 C658,260 650,280 638,295 C615,308 530,320 380,318 C230,316 140,300 125,278 Z" fill="url(#u-${uid})"/>
  <path d="M125,278 C128,250 142,220 170,200 C192,184 218,178 240,178 C215,205 182,240 172,296 Z" fill="${p.toe}"/>
  <path d="M168,294 C176,248 208,216 245,196" stroke="rgba(128,128,128,0.25)" stroke-width="1.5" fill="none" stroke-dasharray="6,4"/>
  <path d="M195,260 C240,230 340,220 448,234 C512,243 566,261 558,280 C522,266 412,256 312,270 C260,278 196,292 195,260 Z" fill="${swooshColor}"/>
  <path d="M204,250 C248,228 348,222 455,237" stroke="rgba(255,255,255,0.2)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <rect x="300" y="158" width="255" height="55" rx="8" fill="rgba(128,128,128,0.15)"/>
  <path d="M312,172 Q428,163 548,172" stroke="rgba(255,255,255,0.7)" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M312,188 Q428,179 548,188" stroke="rgba(255,255,255,0.7)" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M312,204 Q428,195 548,204" stroke="rgba(255,255,255,0.7)" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M430,155 C447,145 478,143 494,154 L497,214 C479,208 440,208 426,214 Z" fill="rgba(200,200,200,0.3)"/>
  <path d="M600,168 C638,178 668,212 676,252 C680,272 675,296 668,308 C655,288 640,258 620,232 C608,215 600,196 600,168 Z" fill="rgba(128,128,128,0.18)"/>
  <rect x="640" y="218" width="28" height="44" rx="4" fill="${heelColor}"/>
  <text x="654" y="245" text-anchor="middle" fill="white" font-size="10" font-family="Arial" font-weight="900">SV</text>
</svg>`;
}

// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  filters: { brand: 'all', price: 'all', sort: 'featured' },
  page: 1,
  perPage: 6,
  visible: [],
};

// ── Filter + render ───────────────────────────────────────────────────────────
function getFiltered() {
  let list = [...PRODUCTS];

  // Brand filter
  if (state.filters.brand !== 'all') {
    list = list.filter(p =>
      p.brand.toLowerCase().replace(/\s+/g,'-') === state.filters.brand
    );
  }

  // Price filter
  const priceRanges = {
    'under-100': [0, 99],
    '100-150':   [100, 150],
    '150-200':   [150, 200],
    'over-200':  [200, Infinity],
  };
  if (state.filters.price !== 'all') {
    const [min, max] = priceRanges[state.filters.price] || [0, Infinity];
    list = list.filter(p => p.price >= min && p.price <= max);
  }

  // Sort
  if (state.filters.sort === 'price-asc')  list.sort((a,b) => a.price - b.price);
  if (state.filters.sort === 'price-desc') list.sort((a,b) => b.price - a.price);
  if (state.filters.sort === 'rating')     list.sort((a,b) => b.rating - a.rating);
  if (state.filters.sort === 'newest')     list.reverse();

  return list;
}

function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  let stars = '';
  for (let i = 0; i < full; i++) stars += '<i class="ri-star-fill"></i>';
  if (half) stars += '<i class="ri-star-half-fill"></i>';
  return stars;
}

function renderBadge(badge) {
  if (!badge) return '';
  const cls = {
    'New': 'badge--new', 'Hot': 'badge--hot',
    'Sale': 'badge--sale', 'Exclusive': 'badge--exclusive'
  }[badge] || 'badge--new';
  return `<span class="product-card__badge ${cls}">${badge}</span>`;
}

function renderSizes(sizes, soldOut) {
  return sizes.map(s => {
    const isSO = soldOut.includes(s);
    return `<span class="size-chip ${isSO ? 'sold-out' : 'available'}" title="${isSO ? 'Sold Out' : 'US '+s}">
      ${s}
    </span>`;
  }).join('');
}

function buildCard(product) {
  const savings = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  return `
  <article class="product-card" data-id="${product.id}" data-brand="${product.brand}">
    <a href="product.html?id=${product.id}" class="product-card__link" aria-label="${product.name}" style="display:contents;">
      <div class="product-card__img-wrap">
        <div class="product-card__bg" style="background: ${product.bg};"></div>
        ${buildShoeSVG(product)}
        ${renderBadge(product.badge)}
        <div class="product-card__quick-view">
          <i class="ri-eye-line"></i> Quick View
        </div>
      </div>
    </a>
    <button class="product-card__wish ${isWishlisted(product.id) ? 'active' : ''}"
            aria-label="Add to wishlist" data-id="${product.id}">
      <i class="${isWishlisted(product.id) ? 'ri-heart-fill' : 'ri-heart-line'}"></i>
    </button>
    <div class="product-card__body">
      <p class="product-card__brand">${product.brand}</p>
      <h3 class="product-card__name">${product.name}</h3>
      <div class="product-card__sizes" aria-label="Sizes">
        ${renderSizes(product.sizes, product.soldOut)}
      </div>
      <div class="product-card__meta">
        <div class="product-card__price">
          <span class="product-card__price-current">$${product.price}</span>
          ${product.oldPrice ? `<span class="product-card__price-old">$${product.oldPrice}</span>` : ''}
        </div>
        <div class="product-card__rating" aria-label="${product.rating} out of 5">
          ${renderStars(product.rating)}
          <span>(${product.reviews})</span>
        </div>
      </div>
      <button class="product-card__add" data-id="${product.id}">
        <i class="ri-shopping-bag-line"></i> Add to Cart
      </button>
    </div>
  </article>`;
}

function isWishlisted(id) {
  const w = JSON.parse(localStorage.getItem('sl_wishlist') || '[]');
  return w.includes(id);
}

function renderGrid() {
  const grid   = document.getElementById('products-grid');
  const empty  = document.getElementById('empty-state');
  const countEl = document.getElementById('result-count');
  const loadMoreWrap = document.getElementById('load-more-wrap');

  const filtered = getFiltered();
  const toShow   = filtered.slice(0, state.page * state.perPage);

  if (countEl) countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (empty)  empty.classList.add('visible');
    if (loadMoreWrap) loadMoreWrap.style.display = 'none';
    return;
  }

  if (empty) empty.classList.remove('visible');

  grid.innerHTML = toShow.map(buildCard).join('');

  // Animate cards in with stagger
  requestAnimationFrame(() => {
    document.querySelectorAll('.product-card').forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), i * 80);
    });
  });

  // Progress bar
  const fill = document.getElementById('progress-fill');
  const shown = document.getElementById('shown-count');
  const total = document.getElementById('total-count');
  if (fill)  fill.style.width = `${Math.min((toShow.length / filtered.length) * 100, 100)}%`;
  if (shown) shown.textContent = toShow.length;
  if (total) total.textContent = filtered.length;

  // Show/hide load more
  const hasMore = toShow.length < filtered.length;
  if (loadMoreWrap) loadMoreWrap.style.display = hasMore ? 'flex' : 'none';

  // Re-bind interactions
  bindCardInteractions();

  // Tell ScrollTrigger about new DOM elements
  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
}

// ── Interactions ──────────────────────────────────────────────────────────────
function bindCardInteractions() {
  // 3D tilt
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);

      card.style.transform = `perspective(900px) rotateX(${dy * -8}deg) rotateY(${dx * 8}deg) translateZ(6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.6s cubic-bezier(0.22,1,0.36,1), box-shadow 0.6s';
      card.style.transform  = 'perspective(900px) rotateX(0) rotateY(0) translateZ(0)';
      setTimeout(() => { card.style.transition = ''; }, 600);
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s linear, box-shadow 0.3s';
    });
  });

  // Wishlist
  document.querySelectorAll('.product-card__wish').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); e.preventDefault();
      const id = btn.dataset.id;
      const w  = JSON.parse(localStorage.getItem('sl_wishlist') || '[]');
      const idx = w.indexOf(id);
      if (idx > -1) { w.splice(idx, 1); } else { w.push(id); }
      localStorage.setItem('sl_wishlist', JSON.stringify(w));

      const active = w.includes(id);
      btn.classList.toggle('active', active);
      btn.querySelector('i').className = active ? 'ri-heart-fill' : 'ri-heart-line';

      if (active && typeof gsap !== 'undefined') {
        gsap.fromTo(btn, { scale: 1.5 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
      }
    });
  });

  // Add to cart
  document.querySelectorAll('.product-card__add').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); e.preventDefault();
      const id      = btn.dataset.id;
      const product = PRODUCTS.find(p => p.id === id);
      if (!product) return;

      const cart = JSON.parse(localStorage.getItem('sl_cart') || '[]');
      const idx  = cart.findIndex(i => i.id === id);
      if (idx > -1) { cart[idx].qty += 1; } else { cart.push({ ...product, qty: 1 }); }
      localStorage.setItem('sl_cart', JSON.stringify(cart));
      document.dispatchEvent(new CustomEvent('sl:cart-add', { detail: { name: product.name } }));

      // Badge update
      const badge = document.querySelector('.nav__cart-count');
      if (badge) {
        const total = cart.reduce((s, i) => s + i.qty, 0);
        badge.textContent = total;
        badge.classList.add('visible');
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(badge, { scale: 1.6 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
        }
      }

      // Button feedback
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="ri-check-line"></i> Added!';
      btn.style.cssText = 'background:#22c55e;color:white;border-color:#22c55e;opacity:1;transform:translateY(0);';
      setTimeout(() => {
        btn.innerHTML  = orig;
        btn.style.cssText = '';
      }, 1600);
    });
  });
}

// ── Filter bar logic ──────────────────────────────────────────────────────────
function initFilters() {
  const pills = document.querySelectorAll('.filter-pill');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const group = pill.dataset.group;
      const value = pill.dataset.value;

      // Deactivate siblings in same group
      document.querySelectorAll(`.filter-pill[data-group="${group}"]`)
        .forEach(p => p.classList.remove('active'));

      pill.classList.add('active');
      state.filters[group] = value;
      state.page = 1;

      renderGrid();
      updateActiveFilterTags();
    });
  });

  // Sort
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      state.filters.sort = sortSelect.value;
      state.page = 1;
      renderGrid();
    });
  }

  // URL params (e.g. shop.html?brand=nike)
  const params = new URLSearchParams(window.location.search);
  const brandParam  = params.get('brand');
  const filterParam = params.get('filter');

  if (brandParam) {
    const pill = document.querySelector(`.filter-pill[data-group="brand"][data-value="${brandParam}"]`);
    if (pill) pill.click();
  }
  if (filterParam === 'new') {
    const pill = document.querySelector(`.filter-pill[data-group="badge"][data-value="new"]`);
    if (pill) pill.click();
  }
  if (filterParam === 'sale') {
    const pill = document.querySelector(`.filter-pill[data-group="badge"][data-value="sale"]`);
    if (pill) pill.click();
  }
}

function updateActiveFilterTags() {
  const wrap = document.getElementById('active-filters');
  if (!wrap) return;

  const tags = [];
  if (state.filters.brand !== 'all')  tags.push({ label: state.filters.brand,  group: 'brand' });
  if (state.filters.price !== 'all')  tags.push({ label: state.filters.price,  group: 'price' });

  if (tags.length === 0) { wrap.style.display = 'none'; return; }

  wrap.style.display = 'flex';
  wrap.innerHTML = tags.map(t => `
    <span class="active-filter-tag" data-group="${t.group}">
      ${t.label} <i class="ri-close-line"></i>
    </span>
  `).join('') + `<span class="clear-all-btn">Clear all</span>`;

  wrap.querySelectorAll('.active-filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const group = tag.dataset.group;
      state.filters[group] = 'all';
      state.page = 1;
      document.querySelectorAll(`.filter-pill[data-group="${group}"]`)
        .forEach(p => p.classList.remove('active'));
      document.querySelector(`.filter-pill[data-group="${group}"][data-value="all"]`)
        ?.classList.add('active');
      renderGrid();
      updateActiveFilterTags();
    });
  });

  wrap.querySelector('.clear-all-btn')?.addEventListener('click', () => {
    state.filters = { brand: 'all', price: 'all', sort: 'featured' };
    state.page = 1;
    document.querySelectorAll('.filter-pill[data-value="all"]').forEach(p => p.classList.add('active'));
    document.querySelectorAll('.filter-pill:not([data-value="all"])').forEach(p => p.classList.remove('active'));
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'featured';
    renderGrid();
    updateActiveFilterTags();
  });
}

// ── Load More ─────────────────────────────────────────────────────────────────
function initLoadMore() {
  const btn = document.getElementById('load-more-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    btn.classList.add('loading');
    setTimeout(() => {
      state.page += 1;
      btn.classList.remove('loading');
      renderGrid();
    }, 600);
  });
}

// ── Sticky filter bar ─────────────────────────────────────────────────────────
function initStickyFilter() {
  const bar = document.querySelector('.filter-bar');
  if (!bar) return;
  const offset = bar.offsetTop;
  window.addEventListener('scroll', () => {
    bar.classList.toggle('stuck', window.scrollY > offset - 80);
  }, { passive: true });
}

// ── Boot ─────────────────────────────────────────────────────────────────────
function initShop() {
  renderGrid();
  initFilters();
  initLoadMore();
  initStickyFilter();
}

export { initShop };
