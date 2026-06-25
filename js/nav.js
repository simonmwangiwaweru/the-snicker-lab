/**
 * Navigation: scroll state, mobile menu, active link, cart count.
 */

class SoleNav {
  constructor() {
    this.nav        = document.querySelector('.nav');
    this.hamburger  = document.querySelector('.nav__hamburger');
    this.mobileMenu = document.querySelector('.nav__mobile-menu');
    this.cartCount  = document.querySelector('.nav__cart-count');
    this.isOpen     = false;

    if (!this.nav) return;
    this.init();
  }

  init() {
    // Scroll → frosted glass nav
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    this.onScroll();

    // Hamburger toggle
    if (this.hamburger && this.mobileMenu) {
      this.hamburger.addEventListener('click', () => this.toggleMenu());

      // Close on link click
      this.mobileMenu.querySelectorAll('.nav__mobile-link').forEach(link => {
        link.addEventListener('click', () => this.closeMenu());
      });

      // Close on backdrop click (outside menu content)
      this.mobileMenu.addEventListener('click', (e) => {
        if (e.target === this.mobileMenu) this.closeMenu();
      });
    }

    // ESC key closes menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.closeMenu();
    });

    // Active link based on current page
    this.setActiveLink();

    // Cart count from localStorage
    this.updateCartCount();
  }

  onScroll() {
    const scrolled = window.scrollY > 20;
    this.nav.classList.toggle('nav--scrolled', scrolled);
  }

  toggleMenu() {
    this.isOpen ? this.closeMenu() : this.openMenu();
  }

  openMenu() {
    this.isOpen = true;
    this.hamburger.classList.add('open');
    this.mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closeMenu() {
    this.isOpen = false;
    this.hamburger.classList.remove('open');
    this.mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  setActiveLink() {
    const path = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav__link, .nav__mobile-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      const isActive = href === path || (path === '' && href === 'index.html');
      link.classList.toggle('active', isActive);
    });
  }

  updateCartCount() {
    if (!this.cartCount) return;

    const cart  = JSON.parse(localStorage.getItem('sl_cart') || '[]');
    const total = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

    this.cartCount.textContent = total > 99 ? '99+' : total;
    this.cartCount.classList.toggle('visible', total > 0);
  }
}

export { SoleNav };
