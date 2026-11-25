/**
 * BronchFlow — Precision Site Interactions
 * Clean, lightweight, high-performance, accessible JavaScript
 */

(function () {
  'use strict';

  // ==========================================================================
  // 0. THEME SWITCHER (Light & Dark Mode Manager)
  // ==========================================================================
  const themeToggle = document.getElementById('themeToggle');

  const getSavedTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    // Default to 'light' per user requirement
    return 'light';
  };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (themeToggle) {
      const isDark = theme === 'dark';
      themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      themeToggle.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    }
  };

  // Synchronize initial theme state
  const initialTheme = getSavedTheme();
  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  }

  // ==========================================================================
  // 1. MOBILE NAVIGATION & ACTIVE LINK TRACKING
  // ==========================================================================
  const navToggle = document.getElementById('navToggle');
  const siteNav = document.getElementById('siteNav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const progressBar = document.getElementById('scrollProgress');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    siteNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // Active Link on Scroll & Progress Bar
  const updateScroll = () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Progress Bar
    if (progressBar && docHeight > 0) {
      const progress = (scrollY / docHeight) * 100;
      progressBar.style.width = `${progress}%`;
    }

    // Active Section Link
    const triggerOffset = scrollY + 140;
    let currentId = '';
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (triggerOffset >= top && triggerOffset < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${currentId}`);
      });
    }
  };

  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 64;
        const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ==========================================================================
  // 2. VIDEO SINGLE PLAYBACK (Plays only one time)
  // ==========================================================================
  const deviceVideo = document.querySelector('.hero-device-center-video, .hero-device-video');
  if (deviceVideo) {
    deviceVideo.muted = true;
    deviceVideo.loop = false;
    let hasEnded = false;

    deviceVideo.addEventListener('ended', () => {
      hasEnded = true;
    });

    const playVideo = () => {
      if (hasEnded || deviceVideo.ended) return;
      deviceVideo.play().catch(() => {
        // Autoplay policy fallback
      });
    };

    playVideo();
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !hasEnded && !deviceVideo.ended) {
        playVideo();
      }
    });
  }



  // ==========================================================================
  // 3. HERO HEADLINE 4-SECOND TIMED SMOOTH REVEAL (Cinematic Showcase Style)
  // Reveals smoothly at 4 seconds, synced with 3D device video finish
  // ==========================================================================
  document.body.classList.add('js-loaded');
  const heroTitle = document.getElementById('hero-title');
  const heroEditorial = document.querySelector('.hero-editorial');

  let headlineRevealed = false;
  const triggerHeadlineReveal = () => {
    if (headlineRevealed) return;
    headlineRevealed = true;
    if (heroTitle) heroTitle.classList.add('is-visible');
    if (heroEditorial) heroEditorial.classList.add('is-visible');
  };

  // Sync with device video reaching ~3.8s, or at 4000ms wall-clock timer
  if (deviceVideo) {
    deviceVideo.addEventListener('timeupdate', () => {
      if (deviceVideo.currentTime >= 3.8) {
        triggerHeadlineReveal();
      }
    });
  }
  setTimeout(triggerHeadlineReveal, 4000);
  // ==========================================================================
  const statNumbers = document.querySelectorAll('.stat-num');
  if ('IntersectionObserver' in window && statNumbers.length > 0) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetValue = parseFloat(el.getAttribute('data-count') || '0');
          const isDecimal = targetValue % 1 !== 0;
          const duration = 1400;
          const startTime = performance.now();

          const animateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Standard cubic ease-out
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = targetValue * eased;

            el.textContent = isDecimal ? current.toFixed(1) : Math.round(current);

            if (progress < 1) {
              requestAnimationFrame(animateNumber);
            } else {
              el.textContent = isDecimal ? targetValue.toFixed(1) : targetValue;
            }
          };

          requestAnimationFrame(animateNumber);
          statObserver.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    statNumbers.forEach((stat) => statObserver.observe(stat));
  }

  // ==========================================================================
  // 4. PANORAMIC CAROUSEL INTERACTION (Demographic Gallery)
  // ==========================================================================
  const carousel = document.getElementById('demographicCarousel');
  const carouselDots = document.querySelectorAll('.showcase-carousel-dot');
  const carouselCards = carousel ? carousel.querySelectorAll('.person-card') : [];

  if (carousel && carouselCards.length > 0) {
    let activeIndex = 0;
    let isClickScrolling = false;
    let scrollTimeout = null;

    const setActiveCard = (index) => {
      if (index < 0 || index >= carouselCards.length) return;
      activeIndex = index;

      carouselCards.forEach((card, i) => {
        card.classList.toggle('is-active', i === index);
      });

      carouselDots.forEach((dot, i) => {
        const isActive = i === index;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    };

    const scrollToCard = (index) => {
      const card = carouselCards[index];
      if (!card) return;
      isClickScrolling = true;
      setActiveCard(index);

      const cardLeft = card.offsetLeft;
      const cardWidth = card.offsetWidth;
      const containerWidth = carousel.offsetWidth;
      const targetScroll = cardLeft - (containerWidth - cardWidth) / 2;

      carousel.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isClickScrolling = false;
        resetAutoPlay();
      }, 550);
    };

    carouselDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const slideIndex = parseInt(dot.getAttribute('data-slide'), 10);
        if (!isNaN(slideIndex)) {
          scrollToCard(slideIndex);
        }
      });
    });

    let ticking = false;
    const onScroll = () => {
      if (isClickScrolling) return;
      if (!ticking) {
        requestAnimationFrame(() => {
          const containerCenter = carousel.scrollLeft + carousel.offsetWidth / 2;
          let closestIndex = 0;
          let closestDist = Infinity;

          carouselCards.forEach((card, i) => {
            const cardCenter = card.offsetLeft + card.offsetWidth / 2;
            const dist = Math.abs(containerCenter - cardCenter);
            if (dist < closestDist) {
              closestDist = dist;
              closestIndex = i;
            }
          });

          setActiveCard(closestIndex);
          ticking = false;
        });
        ticking = true;
      }
    };

    carousel.addEventListener('scroll', onScroll, { passive: true });

    // Keyboard navigation
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollToCard((activeIndex + 1) % carouselCards.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollToCard((activeIndex - 1 + carouselCards.length) % carouselCards.length);
      }
    });

    // Drag-to-scroll for desktop
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;

    carousel.addEventListener('mousedown', (e) => {
      if (e.target.closest('a, button')) return;
      isDown = true;
      stopAutoPlay();
      startX = e.pageX - carousel.offsetLeft;
      scrollStart = carousel.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        startAutoPlay();
      }
    });

    carousel.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 1.3;
      carousel.scrollLeft = scrollStart - walk;
    });

    // ==========================================================================
    // AUTO-ADVANCE EVERY 3 SECONDS (Showcase Carousel Auto-Progress)
    // ==========================================================================
    let autoPlayTimer = null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function startAutoPlay() {
      if (prefersReducedMotion) return;
      stopAutoPlay();
      autoPlayTimer = setInterval(() => {
        const nextIndex = (activeIndex + 1) % carouselCards.length;
        scrollToCard(nextIndex);
      }, 3000);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    function resetAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    startAutoPlay();

    // Pause on hover or touch/interaction
    const wrapper = carousel.closest('.showcase-carousel-wrapper') || carousel;
    wrapper.addEventListener('mouseenter', stopAutoPlay);
    wrapper.addEventListener('mouseleave', startAutoPlay);
    wrapper.addEventListener('touchstart', stopAutoPlay, { passive: true });
    wrapper.addEventListener('touchend', startAutoPlay, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoPlay();
      } else {
        startAutoPlay();
      }
    });
  }

  // ==========================================================================
  // 5. FOR HEALTHCARE: Segmented Role Tab Switcher
  // ==========================================================================
  const roleButtons = document.querySelectorAll('.segmented-btn');
  const roleCards = document.querySelectorAll('.role-card');

  if (roleButtons.length > 0 && roleCards.length > 0) {
    roleButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetRole = btn.dataset.role;
        roleButtons.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        roleCards.forEach((card) => {
          if (card.dataset.role === targetRole || targetRole === 'all') {
            card.classList.add('is-featured');
            card.style.opacity = '1';
          } else {
            card.classList.remove('is-featured');
            card.style.opacity = '0.7';
          }
        });
      });
    });
  }

  // ==========================================================================
  // 5. ACCESSIBLE CONTACT FORM (Web3Forms Integration)
  // ==========================================================================
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!contactForm.checkValidity()) {
        formStatus.style.color = 'var(--signal-danger)';
        formStatus.textContent = 'Please complete all required fields correctly.';
        return;
      }

      formStatus.style.color = 'var(--content-secondary)';
      formStatus.textContent = 'Submitting message securely...';

      try {
        const formData = new FormData(contactForm);
        const jsonObject = Object.fromEntries(formData);

        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: JSON.stringify(jsonObject),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          formStatus.style.color = 'var(--signal-success)';
          formStatus.textContent = 'Thank you. Your message has been received by our clinical team.';
          contactForm.reset();
        } else {
          formStatus.style.color = 'var(--signal-danger)';
          formStatus.textContent = 'Submission error. Please email us directly at bronchflow@gmail.com.';
        }
      } catch (err) {
        formStatus.style.color = 'var(--signal-danger)';
        formStatus.textContent = 'Network connection error. Please try again later.';
      }
    });
  }

})();
