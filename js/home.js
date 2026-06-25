/**
 * Home page animations and interactions.
 * Requires GSAP + ScrollTrigger loaded globally.
 */

// ── Hero entrance animation ───────────────────────────────────────────────────
function initHeroAnimation() {
  if (typeof gsap === 'undefined') return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('.hero__eyebrow', { opacity: 1, y: 0, duration: 0.8, delay: 0.3 })
    .to('.hero__title-line', {
      y: 0, opacity: 1,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power4.out'
    }, '-=0.4')
    .to('.hero__subtitle', { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
    .to('.hero__ctas',      { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
    .to('.hero__shoe-container', {
      opacity: 1,
      duration: 1,
      ease: 'power2.out'
    }, '-=1.1')
    .to('.hero__stats', { opacity: 1, duration: 0.8 }, '-=0.5')
    .to('.hero__scroll', { opacity: 1, duration: 0.6 }, '-=0.4');
}

// ── Mouse parallax on hero shoe ───────────────────────────────────────────────
function initShoeParallax() {
  const container = document.querySelector('.hero__shoe-container');
  const shoe      = document.querySelector('.hero__shoe-wrap');
  const glow      = document.querySelector('.hero__shoe-glow');
  const ring      = document.querySelector('.hero__shoe-ring');
  if (!container || !shoe) return;

  let lerpX = 0, lerpY = 0, targetX = 0, targetY = 0;
  let rafId = null;

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    targetX = (e.clientX - cx) / cx;
    targetY = (e.clientY - cy) / cy;
  });

  function tick() {
    lerpX += (targetX - lerpX) * 0.06;
    lerpY += (targetY - lerpY) * 0.06;

    shoe.style.transform = `
      translateY(${Math.sin(Date.now() * 0.001) * 20}px)
      rotate(-4deg)
      translateX(${lerpX * 18}px)
      rotateY(${lerpX * 12}deg)
      rotateX(${-lerpY * 8}deg)
    `;

    if (glow) {
      glow.style.transform = `translate(${lerpX * 25}px, ${lerpY * 15}px)`;
    }
    if (ring) {
      ring.style.transform = `rotate(${Date.now() * 0.02}deg) translate(${lerpX * 10}px, ${lerpY * 10}px)`;
    }

    rafId = requestAnimationFrame(tick);
  }

  // Only run parallax on desktop
  if (window.innerWidth > 768) {
    tick();
  } else {
    // Mobile: keep float animation only, remove RAF
    shoe.style.transform = 'rotate(-4deg)';
  }
}

// ── Animated stat counters ────────────────────────────────────────────────────
function initCounters() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const stats = document.querySelectorAll('.hero__stat-value [data-count]');
  if (!stats.length) return;

  stats.forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const obj    = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          snap: { val: 1 },
          onUpdate: () => { el.textContent = obj.val.toLocaleString(); }
        });
      }
    });
  });
}

// ── Product card 3D tilt ──────────────────────────────────────────────────────
function initCardTilt() {
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const tiltX  = dy * -10;
      const tiltY  = dx *  10;

      card.style.transform = `
        perspective(1000px)
        rotateX(${tiltX}deg)
        rotateY(${tiltY}deg)
        translateZ(8px)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.6s cubic-bezier(0.22,1,0.36,1)';
      card.style.transform  = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';

      setTimeout(() => {
        card.style.transition = '';
      }, 600);
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s linear';
    });
  });
}

// ── Wishlist toggle ───────────────────────────────────────────────────────────
function initWishlist() {
  document.querySelectorAll('.product-card__wish').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.classList.toggle('active');
      const icon = btn.querySelector('i');
      if (btn.classList.contains('active')) {
        icon.classList.replace('ri-heart-line', 'ri-heart-fill');
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(btn, { scale: 1.4 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
        }
      } else {
        icon.classList.replace('ri-heart-fill', 'ri-heart-line');
      }
    });
  });
}

// ── Add to cart from card ─────────────────────────────────────────────────────
function initCardCart() {
  document.querySelectorAll('.product-card__add').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.product-card');
      const name  = card.querySelector('.product-card__name')?.textContent  || 'Shoe';
      const price = card.querySelector('.product-card__price-current')?.textContent || '$0';
      const brand = card.querySelector('.product-card__brand')?.textContent || '';

      addToCart({ name, price, brand, qty: 1, id: `${brand}-${name}`.replace(/\s/g, '-').toLowerCase() });

      // Button feedback
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="ri-check-line"></i> Added!';
      btn.style.background = '#22c55e';

      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
      }, 1600);
    });
  });
}

function addToCart(item) {
  const cart = JSON.parse(localStorage.getItem('sl_cart') || '[]');
  const idx  = cart.findIndex(i => i.id === item.id);

  if (idx > -1) {
    cart[idx].qty += 1;
  } else {
    cart.push(item);
  }

  localStorage.setItem('sl_cart', JSON.stringify(cart));

  // Update badge in nav
  const badge = document.querySelector('.nav__cart-count');
  if (badge) {
    const total = cart.reduce((s, i) => s + i.qty, 0);
    badge.textContent = total;
    badge.classList.add('visible');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(badge, { scale: 1.6 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
    }
  }
}

// ── Section scroll animations ─────────────────────────────────────────────────
function initHomeScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Marquee items
  gsap.fromTo('.marquee-track',
    { opacity: 0 },
    { opacity: 1, duration: 1, scrollTrigger: { trigger: '.marquee-section', start: 'top 90%' } }
  );

  // Latest drops heading
  gsap.fromTo('.drops-section .section-header',
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.drops-section', start: 'top 80%' } }
  );

  // Cards stagger
  gsap.fromTo('.product-card',
    { y: 70, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.15,
      scrollTrigger: { trigger: '.drops-grid', start: 'top 82%' } }
  );

  // Featured section
  gsap.fromTo('.featured-visual',
    { x: -80, opacity: 0 },
    { x: 0, opacity: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.featured-section', start: 'top 75%' } }
  );

  gsap.fromTo('.featured-text',
    { x: 80, opacity: 0 },
    { x: 0, opacity: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.featured-section', start: 'top 75%' } }
  );

  // CTA banner
  gsap.fromTo('.cta-banner__title',
    { y: 60, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.cta-banner', start: 'top 78%' } }
  );
}

// ── Boot ─────────────────────────────────────────────────────────────────────
function initHome() {
  initHeroAnimation();

  window.addEventListener('load', () => {
    initShoeParallax();
    initCounters();
    initCardTilt();
    initWishlist();
    initCardCart();
    initHomeScrollAnimations();
  });
}

export { initHome };
