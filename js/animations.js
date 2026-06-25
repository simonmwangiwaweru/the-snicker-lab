/**
 * Scroll-triggered entrance animations (GSAP + ScrollTrigger).
 * Supports data-anim attributes on any element across all pages.
 * Also handles page transition overlay.
 */

function initBaseAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // ── Fade up ────────────────────────────────────────────────────────────────
  gsap.utils.toArray('[data-anim="fade-up"]').forEach(el => {
    gsap.fromTo(el,
      { y: 60, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.85,
        ease: 'power3.out',
        delay: parseFloat(el.dataset.animDelay || 0),
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
      }
    );
  });

  // ── Fade in ────────────────────────────────────────────────────────────────
  gsap.utils.toArray('[data-anim="fade-in"]').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1,
        ease: 'power2.out',
        delay: parseFloat(el.dataset.animDelay || 0),
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
      }
    );
  });

  // ── Slide left ─────────────────────────────────────────────────────────────
  gsap.utils.toArray('[data-anim="slide-left"]').forEach(el => {
    gsap.fromTo(el,
      { x: -80, opacity: 0 },
      {
        x: 0, opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        delay: parseFloat(el.dataset.animDelay || 0),
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
      }
    );
  });

  // ── Slide right ────────────────────────────────────────────────────────────
  gsap.utils.toArray('[data-anim="slide-right"]').forEach(el => {
    gsap.fromTo(el,
      { x: 80, opacity: 0 },
      {
        x: 0, opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        delay: parseFloat(el.dataset.animDelay || 0),
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
      }
    );
  });

  // ── Scale in ───────────────────────────────────────────────────────────────
  gsap.utils.toArray('[data-anim="scale-in"]').forEach(el => {
    gsap.fromTo(el,
      { scale: 0.82, opacity: 0 },
      {
        scale: 1, opacity: 1,
        duration: 0.8,
        ease: 'back.out(1.4)',
        delay: parseFloat(el.dataset.animDelay || 0),
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
      }
    );
  });

  // ── Stagger children ───────────────────────────────────────────────────────
  gsap.utils.toArray('[data-anim="stagger"]').forEach(parent => {
    gsap.fromTo(Array.from(parent.children),
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: parseFloat(parent.dataset.stagger || 0.12),
        scrollTrigger: { trigger: parent, start: 'top 88%', toggleActions: 'play none none none' }
      }
    );
  });

  // ── Clip up (text mask reveal) ─────────────────────────────────────────────
  gsap.utils.toArray('[data-anim="clip-up"]').forEach(el => {
    gsap.fromTo(el,
      { clipPath: 'inset(100% 0% 0% 0%)', y: 30, opacity: 0 },
      {
        clipPath: 'inset(0% 0% 0% 0%)', y: 0, opacity: 1,
        duration: 0.9,
        ease: 'power4.out',
        delay: parseFloat(el.dataset.animDelay || 0),
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }
      }
    );
  });

  // ── Count up numbers ──────────────────────────────────────────────────────
  gsap.utils.toArray('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const obj    = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = Math.round(obj.val).toLocaleString() + suffix;
          }
        });
      }
    });
  });

  // ── Scrub parallax backgrounds ────────────────────────────────────────────
  gsap.utils.toArray('[data-parallax]').forEach(el => {
    const speed = parseFloat(el.dataset.parallax || 0.3);
    gsap.to(el, {
      yPercent: speed * 30,
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('section') || el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  });

  // ── Horizontal line draw ──────────────────────────────────────────────────
  gsap.utils.toArray('[data-anim="line-draw"]').forEach(el => {
    gsap.fromTo(el,
      { scaleX: 0, transformOrigin: 'left' },
      {
        scaleX: 1,
        duration: 1.2,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
      }
    );
  });

  // ── Section reveal with gradient wipe ─────────────────────────────────────
  gsap.utils.toArray('[data-anim="wipe"]').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none none' }
      }
    );
  });

  // ── Card stagger grid (auto-detect .product-card in grid) ─────────────────
  gsap.utils.toArray('[data-anim="card-grid"]').forEach(grid => {
    const cards = grid.querySelectorAll('.product-card, .drop-card, .related-card');
    if (!cards.length) return;
    gsap.fromTo(cards,
      { y: 60, opacity: 0, scale: 0.96 },
      {
        y: 0, opacity: 1, scale: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: { amount: 0.5, from: 'start' },
        scrollTrigger: { trigger: grid, start: 'top 85%', toggleActions: 'play none none none' }
      }
    );
  });

  // ── Section header accent (the colored bar / eyebrow) ─────────────────────
  gsap.utils.toArray('.section__eyebrow, .section-header__eyebrow').forEach((el, i) => {
    gsap.fromTo(el,
      { x: -30, opacity: 0 },
      {
        x: 0, opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }
      }
    );
  });

  // ── Refresh after dynamic content loads ───────────────────────────────────
  setTimeout(() => ScrollTrigger.refresh(), 500);
}

// ── Page transition overlay ───────────────────────────────────────────────────
function initPageTransitions() {
  const overlay = document.getElementById('page-transition');
  if (!overlay || typeof gsap === 'undefined') return;

  // Exit animation on load
  gsap.fromTo(overlay,
    { scaleY: 1, transformOrigin: 'top' },
    { scaleY: 0, duration: 0.9, ease: 'expo.inOut', delay: 0.05 }
  );

  // Entry animation on internal link click
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || href.startsWith('tel')) return;

    link.addEventListener('click', e => {
      // Skip if modifier key held (open in new tab etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;

      e.preventDefault();
      gsap.fromTo(overlay,
        { scaleY: 0, transformOrigin: 'bottom' },
        {
          scaleY: 1,
          duration: 0.65,
          ease: 'expo.inOut',
          onComplete: () => { window.location.href = href; }
        }
      );
    });
  });
}

export { initBaseAnimations, initPageTransitions };
