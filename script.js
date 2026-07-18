'use strict';

/* =========================================
   1. NAVBAR — Scroll & Mobile Hamburger
   ========================================= */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const allNavLinks = navLinks.querySelectorAll('a');

  // Scrolled state
  function handleScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close on link click
  allNavLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
})();


/* =========================================
   2. SMOOTH SCROLL — All Anchor Links
   ========================================= */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navHeight = document.getElementById('navbar').offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();


/* =========================================
   3. SCROLL REVEAL — Animate on Viewport
   ========================================= */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  // IntersectionObserver for performance
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(function (el) {
    // Skip hero elements (they use CSS keyframe animation)
    if (!el.closest('.hero-content')) {
      observer.observe(el);
    }
  });
})();


/* =========================================
   4. KPI COUNTER — Animated Numbers
   ========================================= */
(function initCounters() {
  const counters = document.querySelectorAll('.kpi-num[data-target]');
  let countersStarted = false;

  function startCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2200;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target);
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const kpiSection = document.querySelector('.kpi-section');

  const observer = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      counters.forEach(function (el) { startCounter(el); });
    }
  }, { threshold: 0.3 });

  if (kpiSection) observer.observe(kpiSection);
})();


/* =========================================
   5. GALLERY FILTER
   ========================================= */
(function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Active state
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');

      const filter = this.getAttribute('data-filter');

      galleryItems.forEach(function (item) {
        const category = item.getAttribute('data-category');
        const show = filter === 'all' || category === filter;

        if (show) {
          item.style.display = '';
          item.classList.remove('hidden');
          item.style.opacity = '0';
          item.style.transform = 'scale(0.96)';
          setTimeout(function () {
            item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 20);
        } else {
          item.style.transition = 'opacity 0.3s ease';
          item.style.opacity = '0';
          item.style.transform = 'scale(0.96)';
          setTimeout(function () {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });
})();


/* =========================================
   6. TESTIMONIAL CAROUSEL
   ========================================= */
(function initCarousel() {
  const cards = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  let current = 0;
  let autoTimer = null;

  function showSlide(index) {
    cards.forEach(function (c) { c.classList.remove('active'); });
    dots.forEach(function (d) { d.classList.remove('active'); });
    cards[index].classList.add('active');
    dots[index].classList.add('active');
    current = index;
  }

  function next() {
    showSlide((current + 1) % cards.length);
  }

  function prev() {
    showSlide((current - 1 + cards.length) % cards.length);
  }

  function startAuto() {
    autoTimer = setInterval(next, 5000);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  if (nextBtn) nextBtn.addEventListener('click', function () { stopAuto(); next(); startAuto(); });
  if (prevBtn) prevBtn.addEventListener('click', function () { stopAuto(); prev(); startAuto(); });

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      stopAuto();
      showSlide(i);
      startAuto();
    });
  });

  // Touch/swipe support
  let touchStartX = 0;
  const carousel = document.querySelector('.testimonial-carousel');

  if (carousel) {
    carousel.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    carousel.addEventListener('touchend', function (e) {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        stopAuto();
        if (diff > 0) next(); else prev();
        startAuto();
      }
    }, { passive: true });
  }

  startAuto();
})();


/* =========================================
   7. CONTACT FORM — Validation & Toast
   ========================================= */
(function initContactForm() {
  const submitBtn = document.getElementById('submitBtn');
  const toast = document.getElementById('toast');

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 4000);
  }

  function shake(el) {
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'shake 0.4s ease';
  }

  // Add shake keyframe
  const style = document.createElement('style');
  style.textContent = '@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }';
  document.head.appendChild(style);

  if (submitBtn) {
    submitBtn.addEventListener('click', function () {
      const name = document.getElementById('name');
      const phone = document.getElementById('phone');
      const email = document.getElementById('email');

      let valid = true;

      [name, phone, email].forEach(function (field) {
        if (!field.value.trim()) {
          field.style.borderColor = 'var(--terracotta, #C1622E)';
          shake(field);
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      if (email && email.value.trim() && !email.value.includes('@')) {
        email.style.borderColor = 'var(--terracotta, #C1622E)';
        shake(email);
        valid = false;
      }

      if (!valid) {
        showToast('Please fill in all required fields.');
        return;
      }

      // Simulate submission
      submitBtn.textContent = 'Sending...';
      submitBtn.style.opacity = '0.7';
      submitBtn.disabled = true;

      setTimeout(function () {
        submitBtn.textContent = 'Submit Enquiry';
        submitBtn.style.opacity = '';
        submitBtn.disabled = false;
        // Clear form
        ['name', 'phone', 'email', 'message', 'date', 'time', 'project'].forEach(function (id) {
          const el = document.getElementById(id);
          if (el) el.value = '';
        });
        showToast('✓ Enquiry submitted! We\'ll contact you within 24 hours.');
      }, 1800);
    });
  }
})();


/* =========================================
   8. STICKY NAVBAR ACTIVE SECTION HIGHLIGHT
   ========================================= */
(function initActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  function updateActive() {
    const scrollY = window.scrollY + 120;
    let currentSection = '';

    sections.forEach(function (sec) {
      if (scrollY >= sec.offsetTop) {
        currentSection = sec.getAttribute('id');
      }
    });

    navAnchors.forEach(function (a) {
      a.style.color = '';
      if (a.getAttribute('href') === '#' + currentSection) {
        a.style.color = 'var(--maroon)';
      }
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
})();


/* =========================================
   9. SERVICE CARD — Micro-interaction
   ========================================= */
(function initServiceCards() {
  document.querySelectorAll('.service-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      this.style.zIndex = '2';
    });
    card.addEventListener('mouseleave', function () {
      this.style.zIndex = '';
    });
  });
})();


/* =========================================
   10. GALLERY ITEMS — Lightbox Hint
        (adds a soft scale pulse on load)
   ========================================= */
(function initGalleryLoad() {
  const items = document.querySelectorAll('.gallery-item');
  items.forEach(function (item, i) {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    setTimeout(function () {
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    }, 100 + i * 60);
  });
})();


/* =========================================
   11. SCROLL PROGRESS BAR (subtle, top edge)
   ========================================= */
(function initProgressBar() {
  const bar = document.createElement('div');
  bar.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'height:2px',
    'background:linear-gradient(to right,#D4A017,#5B1F1F)',
    'z-index:9999', 'width:0%', 'transition:width 0.1s linear',
    'pointer-events:none'
  ].join(';');
  document.body.appendChild(bar);

  window.addEventListener('scroll', function () {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / max * 100).toFixed(1) + '%';
  }, { passive: true });
})();


/* =========================================
   12. PILLAR CARDS — staggered reveal
   ========================================= */
(function initPillars() {
  const pillars = document.querySelectorAll('.pillar');
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  pillars.forEach(function (p, i) {
    p.style.opacity = '0';
    p.style.transform = 'translateX(-20px)';
    p.style.transition = 'opacity 0.5s ease ' + (i * 0.15) + 's, transform 0.5s ease ' + (i * 0.15) + 's';
    observer.observe(p);
  });
})();


/* =========================================
   13. PROCESS STEPS — sequential reveal
   ========================================= */
(function initProcessSteps() {
  const steps = document.querySelectorAll('.process-step');
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

  steps.forEach(function (step, i) {
    step.style.opacity = '0';
    step.style.transform = 'translateX(-24px)';
    step.style.transition = 'opacity 0.6s ease ' + (i * 0.12) + 's, transform 0.6s ease ' + (i * 0.12) + 's';
    observer.observe(step);
  });
})();


/* =========================================
   14. KPI CARDS — hover number pop
   ========================================= */
(function initKpiHover() {
  document.querySelectorAll('.kpi-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      card.querySelector('.kpi-num').style.transform = 'scale(1.08)';
      card.querySelector('.kpi-num').style.transition = 'transform 0.25s ease';
    });
    card.addEventListener('mouseleave', function () {
      card.querySelector('.kpi-num').style.transform = '';
    });
  });
})();


/* =========================================
   15. FOOTER LINKS — reveal
   ========================================= */
(function initFooter() {
  const cols = document.querySelectorAll('.footer-col, .footer-brand');
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cols.forEach(function (col, i) {
    col.style.opacity = '0';
    col.style.transform = 'translateY(24px)';
    col.style.transition = 'opacity 0.6s ease ' + (i * 0.1) + 's, transform 0.6s ease ' + (i * 0.1) + 's';
    observer.observe(col);
  });
})();


/* =========================================
   16. WINDOW RESIZE — navbar recalc
   ========================================= */
window.addEventListener('resize', function () {
  if (window.innerWidth > 1024) {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  }
});


/* =========================================
   17. BOOKING POPUP — gentle recurring nudge
   ========================================= */
(function initBookingPopup() {
  const popup = document.getElementById('bookingPopup');
  if (!popup) return;

  const closeBtn = document.getElementById('bookingPopupClose');
  const whatsappBtn = document.getElementById('bookingPopupWhatsapp');
  const bookBtn = document.getElementById('bookingPopupBook');

  const FIRST_SHOW_DELAY = 10000;   // show 10s after page load
  const REPEAT_INTERVAL = 30000;    // if dismissed, try again after 30s
  const MAX_SHOWS = 4;              // never show more than 4 times per visit
  const STORAGE_KEY = 'kalingaBookingPopupDismissedForSession';

  let showCount = 0;
  let cycleTimer = null;

  // Some browsers (e.g. strict privacy modes, or pages opened via file://) can throw
  // when sessionStorage is touched. Wrap it so a storage error never blocks the popup.
  function getSessionFlag() {
    try { return sessionStorage.getItem(STORAGE_KEY); }
    catch (err) { return null; }
  }
  function setSessionFlag() {
    try { sessionStorage.setItem(STORAGE_KEY, 'true'); }
    catch (err) { /* ignore */ }
  }

  // If the visitor already engaged (clicked WhatsApp/Book) earlier in this tab session, stay quiet.
  if (getSessionFlag() === 'true') return;

  function showPopup() {
    if (showCount >= MAX_SHOWS) return;
    popup.classList.add('show');
    popup.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    showCount += 1;
  }

  function hidePopup() {
    popup.classList.remove('show');
    popup.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function scheduleNextShow() {
    if (showCount >= MAX_SHOWS) return;
    clearTimeout(cycleTimer);
    cycleTimer = setTimeout(showPopup, REPEAT_INTERVAL);
  }

  function stopForSession() {
    setSessionFlag();
    clearTimeout(cycleTimer);
    hidePopup();
  }

  // First appearance
  setTimeout(showPopup, FIRST_SHOW_DELAY);

  closeBtn.addEventListener('click', function () {
    hidePopup();
    scheduleNextShow();
  });

  // Click on the dimmed backdrop (outside the card) also closes it
  popup.addEventListener('click', function (e) {
    if (e.target === popup) {
      hidePopup();
      scheduleNextShow();
    }
  });

  // Also allow closing on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && popup.classList.contains('show')) {
      hidePopup();
      scheduleNextShow();
    }
  });

  // Once the visitor actually takes action, don't pester them again this session
  [whatsappBtn, bookBtn].forEach(function (btn) {
    if (btn) btn.addEventListener('click', stopForSession);
  });
})();

const year = document.getElementById("current-year");

if (year) {
    year.textContent = new Date().getFullYear();
}
/* =========================================
   INIT COMPLETE — console confirmation
   ========================================= */
console.log('%c✦ Adwatika Interio And Decors Loaded ✦', 'font-family:serif;font-size:14px;color:#5B1F1F;font-style:italic;');