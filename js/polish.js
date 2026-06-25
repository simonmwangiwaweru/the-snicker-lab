/**
 * Global UI polish: scroll progress bar, back-to-top, toast notifications,
 * mobile cursor hide, scroll-lock helpers, and a preloader fade.
 */

// ── Scroll progress bar (top of page) ────────────────────────────────────────
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  const update = () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = `${Math.min(pct, 100)}%`;
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

// ── Back to top button ────────────────────────────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const toggle = () => {
    btn.classList.toggle('visible', window.scrollY > 600);
  };

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── Toast notification system ─────────────────────────────────────────────────
const toastQueue = [];
let toastActive  = false;

function showToast(message, type = 'success', duration = 3000) {
  toastQueue.push({ message, type, duration });
  if (!toastActive) processToastQueue();
}

function processToastQueue() {
  if (!toastQueue.length) { toastActive = false; return; }
  toastActive = true;

  const { message, type, duration } = toastQueue.shift();

  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: 'ri-check-circle-fill',
    error:   'ri-error-warning-fill',
    info:    'ri-information-fill',
    cart:    'ri-shopping-bag-fill',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <i class="${icons[type] || icons.info} toast__icon"></i>
    <span class="toast__msg">${message}</span>
    <button class="toast__close" aria-label="Dismiss"><i class="ri-close-line"></i></button>
  `;

  container.appendChild(toast);

  // Enter
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('visible'));
  });

  const dismiss = () => {
    toast.classList.remove('visible');
    toast.addEventListener('transitionend', () => {
      toast.remove();
      setTimeout(processToastQueue, 80);
    }, { once: true });
  };

  toast.querySelector('.toast__close').addEventListener('click', dismiss);
  const timer = setTimeout(dismiss, duration);

  toast.addEventListener('mouseenter', () => clearTimeout(timer));
  toast.addEventListener('mouseleave', () => setTimeout(dismiss, 800));
}

// ── Mobile: hide custom cursor ────────────────────────────────────────────────
function initMobileCursorHide() {
  if (window.matchMedia('(pointer: coarse)').matches) {
    document.getElementById('cursor-dot')?.remove();
    document.getElementById('cursor-ring')?.remove();
    document.body.style.cursor = 'auto';
  }
}

// ── Smooth scroll for in-page anchor links ────────────────────────────────────
function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id     = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 80;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ── Lazy-reveal images / SVG thumbnails ───────────────────────────────────────
function initLazyReveal() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('[data-lazy-reveal]').forEach(el => observer.observe(el));
}

// ── Focus-visible polyfill helper (keyboard nav ring) ─────────────────────────
function initFocusVisible() {
  document.addEventListener('keydown', e => {
    if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      document.body.classList.add('kb-nav');
    }
  });
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('kb-nav');
  });
}

// ── Page-load entrance (body fade in) ─────────────────────────────────────────
function initPageEntrance() {
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.style.transition = 'opacity 0.4s ease';
      document.body.style.opacity    = '1';
    });
  });
}

// ── Cart add toast listener ────────────────────────────────────────────────────
function initCartToast() {
  document.addEventListener('sl:cart-add', e => {
    const name = e.detail?.name || 'Item';
    showToast(`<strong>${name}</strong> added to cart`, 'cart');
  });
}

// ── Master init ───────────────────────────────────────────────────────────────
function initPolish() {
  initPageEntrance();
  initScrollProgress();
  initBackToTop();
  initMobileCursorHide();
  initAnchorScroll();
  initLazyReveal();
  initFocusVisible();
  initCartToast();
}

export { initPolish, showToast };
