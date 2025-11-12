(function () {
  'use strict';

  const isTouchDevice =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0;

  function debounce(func, wait = 15) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  function qs(selector, parent = document) {
    return parent.querySelector(selector);
  }

  function qsAll(selector, parent = document) {
    return parent.querySelectorAll(selector);
  }

  function initSmoothScroll() {
    const navLinks = qsAll('.nav-links a[href^="#"]');
    const navbar = qs('.navbar');

    if (!navLinks.length) return;

    navLinks.forEach((link) => {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;

        const target = qs(href);
        if (!target) return;

        e.preventDefault();

        const headerHeight = navbar ? navbar.offsetHeight : 0;
        const isMobile = window.innerWidth <= 768;
        const extraOffset = isMobile ? 12 : 4;
        const offset = headerHeight + extraOffset;

        const targetPosition =
          target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });

        navLinks.forEach((l) => l.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }

  function initScrollAnimations() {
    const animatedSections = qsAll('.section-animate');
    if (!animatedSections.length) return;

    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedSections.forEach((section) => observer.observe(section));
  }

  function initParallax() {
    const heroAvatar = qs('.hero-avatar');
    if (!heroAvatar || isTouchDevice) return;

    const handleParallax = debounce(() => {
      const scrollY = window.scrollY || window.pageYOffset;
      const offset = scrollY * 0.04;
      heroAvatar.style.transform = `translateY(${offset}px)`;
    }, 10);

    window.addEventListener('scroll', handleParallax, { passive: true });
  }

  function init3DTilt() {
    const avatarFrame = qs('.avatar-frame');
    if (!avatarFrame || isTouchDevice) return;

    let isHovering = false;

    avatarFrame.addEventListener('mouseenter', () => {
      isHovering = true;
    });

    avatarFrame.addEventListener('mousemove', (e) => {
      if (!isHovering) return;

      const rect = avatarFrame.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotateX = ((y - 0.5) * 12).toFixed(2);
      const rotateY = ((x - 0.5) * -12).toFixed(2);

      avatarFrame.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(1.02, 1.02, 1.02)
      `;
    });

    avatarFrame.addEventListener('mouseleave', () => {
      isHovering = false;
      avatarFrame.style.transition = 'transform 0.5s ease';
      avatarFrame.style.transform =
        'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      setTimeout(() => {
        avatarFrame.style.transition = '';
      }, 500);
    });
  }

  function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress-bar';

    Object.assign(progressBar.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      height: '3px',
      width: '0%',
      background: 'linear-gradient(90deg, #60a5fa, #93c5fd)',
      zIndex: '60',
      pointerEvents: 'none',
      transition: 'width 0.1s ease-out',
    });

    document.body.appendChild(progressBar);

    const updateProgress = throttle(() => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = `${Math.min(progress, 100)}%`;
    }, 50);

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener(
      'resize',
      debounce(updateProgress, 100),
      { passive: true }
    );

    updateProgress();
  }

  function initLanguageToggle() {
    const langToggle = qs('#langToggle');
    const langButtons = qsAll('.lang-btn');
    const bodyEl = document.body;

    if (!langToggle || !langButtons.length) return;

    const savedLang = localStorage.getItem('preferredLanguage') || 'id';
    bodyEl.setAttribute('data-lang', savedLang);

    langButtons.forEach((btn) => {
      if (btn.getAttribute('data-lang') === savedLang) {
        btn.classList.add('active');
      }
    });

    langToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('.lang-btn');
      if (!btn) return;

      const lang = btn.getAttribute('data-lang') || 'id';
      bodyEl.setAttribute('data-lang', lang);
      langButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      try {
        localStorage.setItem('preferredLanguage', lang);
      } catch (_) {}
    });
  }

  function initActiveSectionHighlight() {
    const sections = qsAll('section[id]');
    const navLinks = qsAll('.nav-links a[href^="#"]');

    if (!sections.length || !navLinks.length) return;

    const observerOptions = {
      threshold: 0.3,
      rootMargin: '-20% 0px -70% 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));
  }

  function initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        document.body.classList.remove('nav-open');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const firstNavLink = qs('.nav-links a');
        if (firstNavLink) firstNavLink.focus();
      }
    });
  }

  function initReducedMotion() {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    if (prefersReducedMotion.matches) {
      document.documentElement.style.scrollBehavior = 'auto';

      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  function init() {
    initSmoothScroll();
    initScrollAnimations();
    initScrollProgress();
    initLanguageToggle();
    initParallax();
    init3DTilt();
    initActiveSectionHighlight();
    initKeyboardNav();
    initReducedMotion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
