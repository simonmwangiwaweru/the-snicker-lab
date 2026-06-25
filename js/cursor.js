/**
 * Custom dual-ring cursor with hover and click states.
 * Also handles magnetic button attraction effect.
 */

class SoleCursor {
  constructor() {
    this.dot  = document.getElementById('cursor-dot');
    this.ring = document.getElementById('cursor-ring');

    if (!this.dot || !this.ring) return;

    this.mouseX = 0;
    this.mouseY = 0;
    this.ringX  = 0;
    this.ringY  = 0;
    this.speed  = 0.12;

    this.init();
  }

  init() {
    document.addEventListener('mousemove', (e) => this.onMove(e));
    document.addEventListener('mousedown', () => this.onClick(true));
    document.addEventListener('mouseup',   () => this.onClick(false));
    document.addEventListener('mouseleave', () => this.hide());
    document.addEventListener('mouseenter', () => this.show());

    this.bindHoverables();
    this.loop();
  }

  onMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;

    // Dot snaps instantly
    this.dot.style.left = `${this.mouseX}px`;
    this.dot.style.top  = `${this.mouseY}px`;
  }

  onClick(isDown) {
    this.dot.classList.toggle('cursor--click', isDown);
    this.ring.classList.toggle('cursor--click', isDown);
  }

  hide() {
    this.dot.style.opacity  = '0';
    this.ring.style.opacity = '0';
  }

  show() {
    this.dot.style.opacity  = '1';
    this.ring.style.opacity = '0.7';
  }

  // Ring follows with lerp lag
  loop() {
    this.ringX += (this.mouseX - this.ringX) * this.speed;
    this.ringY += (this.mouseY - this.ringY) * this.speed;

    this.ring.style.left = `${this.ringX}px`;
    this.ring.style.top  = `${this.ringY}px`;

    requestAnimationFrame(() => this.loop());
  }

  // Add hover state to interactive elements
  bindHoverables() {
    const targets = document.querySelectorAll(
      'a, button, .nav__icon-btn, .product-card, [data-cursor-hover]'
    );

    targets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.dot.classList.add('cursor--hover');
        this.ring.classList.add('cursor--hover');
      });
      el.addEventListener('mouseleave', () => {
        this.dot.classList.remove('cursor--hover');
        this.ring.classList.remove('cursor--hover');
      });
    });
  }

  // Call this after new DOM elements are added
  refresh() {
    this.bindHoverables();
  }
}

// ── Magnetic Buttons ──────────────────────────────────────────────────────────
class MagneticEffect {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll('.magnetic').forEach(wrapper => {
      const inner = wrapper.querySelector('*');
      if (!inner) return;

      wrapper.addEventListener('mousemove', (e) => {
        const rect   = wrapper.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = e.clientX - cx;
        const dy     = e.clientY - cy;
        const strength = 0.35;

        inner.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      });

      wrapper.addEventListener('mouseleave', () => {
        inner.style.transform = 'translate(0, 0)';
        inner.style.transition = `transform 0.6s cubic-bezier(0.22,1,0.36,1)`;
      });

      wrapper.addEventListener('mouseenter', () => {
        inner.style.transition = 'transform 0.1s linear';
      });
    });
  }
}

export { SoleCursor, MagneticEffect };
