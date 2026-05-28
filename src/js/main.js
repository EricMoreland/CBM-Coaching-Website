// Original script.js migrated to src/js/main.js

// Signal to CSS that JS is ready to drive reveal animations. Until this class
// is on <html>, the .reveal opacity:0 rule is inert — so content stays visible
// even if the script fails or is slow.
document.documentElement.classList.add('js-ready');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Lightweight DOM helpers and cached selectors
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const topBar = $('.top-bar');
const bgText = $('.bg-text');
const menuToggle = $('.mobile-menu-toggle');
const sidebar = $('.sidebar');
const sidebarClose = $('.sidebar-close');
const menuBackdrop = $('.menu-backdrop');
const navLinks = $$('.sidebar nav a, nav a');
const faqButtons = $$('.faq-question');
const revealTargets = $$('.page-main > section, .content-wrapper > section, .footer');

const CTA_WHATSAPP_NUMBER = '27795451880';
const CTA_WHATSAPP_MESSAGE =
  "Hey Eric! I just went through your website and I'm really interested in CBM coaching. Can you tell me more about how it works and what's included?";
const CTA_INSTAGRAM_USERNAME = 'ericmorelandofficial';
const CTA_WHATSAPP_URL = `https://wa.me/${CTA_WHATSAPP_NUMBER}?text=${encodeURIComponent(
  CTA_WHATSAPP_MESSAGE
)}`;
const CTA_INSTAGRAM_WEB_URL = `https://www.instagram.com/${CTA_INSTAGRAM_USERNAME}/`;
const CTA_INSTAGRAM_DM_URL = `https://www.instagram.com/direct/inbox/?username=${CTA_INSTAGRAM_USERNAME}`;
const CTA_SELECTOR = 'a, button, input[type="button"], input[type="image"], [role="button"]';
const CTA_KEYWORD_PATTERN =
  /\b(book|consult|contact|appointment|schedule|inquiry|request|message)\b/i;

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function elementMatchesCta(element) {
  if (!element || !element.closest) return false;
  if (element.closest('#emailModal')) return false;
  const type = normalizeText(element.getAttribute('type'));
  if (type === 'submit') return false;

  const parts = [
    element.id,
    element.className,
    element.getAttribute('href'),
    element.getAttribute('aria-label'),
    element.getAttribute('title'),
    element.textContent,
  ]
    .filter(Boolean)
    .join(' ');

  return CTA_KEYWORD_PATTERN.test(parts);
}

function getPrimaryContactUrl() {
  return CTA_WHATSAPP_URL;
}

function getFallbackContactUrl() {
  return CTA_INSTAGRAM_DM_URL || CTA_INSTAGRAM_WEB_URL;
}

function openWithFallback(primaryUrl, fallbackUrl) {
  const newWindow = window.open(primaryUrl, '_blank', 'noopener,noreferrer');
  if (newWindow) return;
  if (fallbackUrl) {
    window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
  }
}

function handleCtaClick(event) {
  const element = event.currentTarget;
  if (!element || element.dataset.ctaHandlerAttached !== 'true') return;

  const primaryUrl = getPrimaryContactUrl();
  const fallbackUrl = getFallbackContactUrl();
  if (!primaryUrl) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  openWithFallback(primaryUrl, fallbackUrl);
}

function attachCtaListener(element) {
  if (!element || element.dataset.ctaHandlerAttached === 'true') return;
  if (!elementMatchesCta(element)) return;

  element.addEventListener('click', handleCtaClick, { capture: true, passive: false });
  element.dataset.ctaHandlerAttached = 'true';
}

function scanForCtaElements(root = document) {
  if (elementMatchesCta(root)) attachCtaListener(root);
  const candidates = root.querySelectorAll ? root.querySelectorAll(CTA_SELECTOR) : [];
  candidates.forEach(attachCtaListener);
}

scanForCtaElements();

const ctaObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (!(node instanceof Element)) return;
      scanForCtaElements(node);
    });
  });
});

if (document.body) {
  ctaObserver.observe(document.body, { childList: true, subtree: true });
}

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
);

function setupRevealAnimations() {
  revealTargets.forEach((target) => {
    target.classList.add('reveal');
    // Belt-and-braces: anything already in the initial viewport is shown
    // immediately on the next frame, so the page is never stuck invisible
    // if the IntersectionObserver callback is delayed.
    const rect = target.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      requestAnimationFrame(() => target.classList.add('visible'));
    }
    revealObserver.observe(target);
  });
}

setupRevealAnimations();

// Safety net: if IntersectionObserver doesn't fire (e.g. headless browsers,
// strict privacy modes, throttled tabs), reveal everything after 1.5s so the
// page never gets stuck invisible.
setTimeout(() => {
  document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
    el.classList.add('visible');
  });
}, 1500);

// Stagger reveal for cards inside sections
const staggerSelectors = '.feeling-card, .solution-card, .about-box, .stat-card, .benefit-item, .guide-stat, .testimonial-card';
const staggerObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const idx = Number(el.dataset.staggerIndex || 0);
      el.style.transitionDelay = `${idx * 70}ms`;
      el.classList.add('visible');
      observer.unobserve(el);
    });
  },
  { threshold: 0.15 }
);
$$(staggerSelectors).forEach((el, i) => {
  el.classList.add('reveal');
  el.dataset.staggerIndex = String(i % 4);
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    requestAnimationFrame(() => el.classList.add('visible'));
  }
  staggerObserver.observe(el);
});

// Scroll progress bar
const progressBar = document.querySelector('.scroll-progress span');
function updateProgress() {
  if (!progressBar) return;
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docH > 0 ? Math.min(100, Math.max(0, (window.scrollY / docH) * 100)) : 0;
  progressBar.style.width = `${pct}%`;
}

// Animated number counters
function animateCounter(el) {
  const target = Number(el.dataset.to);
  if (!Number.isFinite(target)) return;
  if (el.dataset.counted === 'true') return;
  el.dataset.counted = 'true';
  const suffix = el.dataset.suffix || '';
  const duration = 1200;
  if (prefersReducedMotion) {
    el.textContent = `${target}${suffix}`;
    return;
  }
  // Set to 0 immediately so the displayed value never jumps backwards from
  // the static HTML value (e.g. "7+") down to "0+" on the first animation
  // frame. This eliminates a single-frame flicker.
  el.textContent = `0${suffix}`;
  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    // easeOutCubic
    const eased = 1 - Math.pow(1 - t, 3);
    const value = Math.round(target * eased);
    el.textContent = `${value}${suffix}`;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.6 }
);
$$('.counter').forEach((el) => counterObserver.observe(el));

// Magnetic buttons (desktop only, motion-safe)
function setupMagnetic() {
  if (prefersReducedMotion) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  $$('.magnetic').forEach((btn) => {
    const strength = 14;
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = ((e.clientX - r.left) / r.width - 0.5) * strength;
      // Compose the magnetic offset with the existing hover lift (translateY(-2px))
      // so hovering on a primary CTA keeps its lift instead of being flattened by
      // the inline transform.
      const dy = ((e.clientY - r.top) / r.height - 0.5) * strength - 2;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.transform = '';
    });
  });
}
setupMagnetic();

// Scroll handling (rAF throttle)
let lastY = window.scrollY || 0;
let ticking = false;
function onScroll() {
  const y = window.scrollY || 0;
  updateProgress();
  if (bgText) bgText.style.transform = `translateY(${y * 0.05}px)`;
  if (topBar) {
    // Same behavior on mobile and desktop: hide on scroll-down past a small
    // threshold, show again on scroll-up. Previously the mobile branch hid
    // the bar at any scroll > 0, which made the burger menu (which lives
    // inside the top-bar) unreachable mid-page until the user scrolled all
    // the way back to the top.
    if (y > lastY && y > 60) {
      topBar.classList.add('hidden');
    } else {
      topBar.classList.remove('hidden');
    }
  }
  lastY = y;
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true });
// Run once to set initial top-bar visibility on load
onScroll();

// Menu toggle
function toggleMenu() {
  if (!sidebar) return;
  const isOpen = !sidebar.classList.contains('open');
  sidebar.classList.toggle('open', isOpen);
  if (menuBackdrop) menuBackdrop.classList.toggle('active', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
  if (menuToggle) {
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }
  if (isOpen && sidebarClose) sidebarClose.focus();
  if (!isOpen && menuToggle) menuToggle.focus();
}
if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
if (sidebarClose) sidebarClose.addEventListener('click', toggleMenu);
if (menuBackdrop) menuBackdrop.addEventListener('click', toggleMenu);

// Ensure responsive state matches viewport size. Only reset the mobile drawer
// when crossing into desktop layout — otherwise a transient resize (e.g. mobile
// browser chrome hide/show, scrollbar appearing when body becomes scroll-locked)
// would wrongly close the menu the user just opened.
const DESKTOP_BREAKPOINT = 901;
function handleResize() {
  if (!sidebar) return;
  if (window.innerWidth < DESKTOP_BREAKPOINT) return;
  sidebar.classList.remove('open');
  if (menuBackdrop) menuBackdrop.classList.remove('active');
  document.body.classList.remove('menu-open');
  if (menuToggle) {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
  }
}
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(handleResize, 150);
});
handleResize();

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
    toggleMenu();
  }
});

// Active nav link based on visible section
const navLinkMap = new Map();
navLinks.forEach((a) => {
  const href = a.getAttribute('href');
  if (href && href.startsWith('#')) {
    const id = href.slice(1);
    if (!navLinkMap.has(id)) navLinkMap.set(id, []);
    navLinkMap.get(id).push(a);
  }
});

const sectionTargets = Array.from(navLinkMap.keys())
  .map((id) => document.getElementById(id))
  .filter(Boolean);

if (sectionTargets.length) {
  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        const links = navLinkMap.get(id) || [];
        if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
          navLinks.forEach((l) => l.classList.remove('is-active'));
          links.forEach((l) => l.classList.add('is-active'));
        }
      });
    },
    { threshold: [0.25, 0.5, 0.75], rootMargin: '-20% 0px -40% 0px' }
  );
  sectionTargets.forEach((s) => activeObserver.observe(s));
}

// Smooth scroll for links
navLinks.forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Only close the drawer when it's the mobile overlay (toggle button visible)
    const isMobileDrawerOpen =
      sidebar &&
      sidebar.classList.contains('open') &&
      menuToggle &&
      menuToggle.offsetParent !== null;
    if (isMobileDrawerOpen) toggleMenu();
  });
});

// FAQ accordion — pure class toggle. CSS handles open/close height transitions.
// We trigger a sync reflow on the answer element after toggle so the browser
// re-resolves the cascaded max-height value when the parent .reveal section
// is still mid-transition (avoids a stale 0px value in some browsers).
faqButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    if (!item) return;
    const isOpen = item.classList.toggle('active');
    btn.setAttribute('aria-expanded', String(isOpen));
    const answer = item.querySelector('.faq-answer');
    if (answer) {
      // force layout recalc
      void answer.offsetHeight;
    }
  });
});

