// Original script.js migrated to src/js/main.js

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
const CTA_WHATSAPP_MESSAGE = 'Hi Eric, I would like to find out more about your services.';
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
  { threshold: 0.18 }
);

function setupRevealAnimations() {
  revealTargets.forEach((target) => {
    target.classList.add('reveal');
    revealObserver.observe(target);
  });
}

setupRevealAnimations();

// Scroll handling (rAF throttle)
let lastY = window.scrollY || 0;
let ticking = false;
function onScroll() {
  const y = window.scrollY || 0;
  if (bgText) bgText.style.transform = `translateY(calc(-50% + ${y * 0.05}px))`;
  if (topBar) {
    // Only show top-bar when at the very top of the page
    if (y === 0) topBar.classList.remove('hidden');
    else topBar.classList.add('hidden');
  }
  lastY = y;
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(onScroll);
    ticking = true;
  }
});
// Run once to set initial top-bar visibility on load
onScroll();

// Menu toggle
function toggleMenu() {
  if (!sidebar) return;
  const isOpen = !sidebar.classList.contains('open');
  sidebar.classList.toggle('open', isOpen);
  if (menuBackdrop) menuBackdrop.classList.toggle('active', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
  if (menuToggle) menuToggle.setAttribute('aria-expanded', String(isOpen));
  if (isOpen && sidebarClose) sidebarClose.focus();
}
if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
if (sidebarClose) sidebarClose.addEventListener('click', toggleMenu);
if (menuBackdrop) menuBackdrop.addEventListener('click', toggleMenu);

// Ensure responsive state matches viewport size: when mobile, hide sidebar and reset menu state
function handleResize() {
  const isMobile = window.innerWidth <= 1100;
  if (!sidebar) return;
  if (isMobile) {
    sidebar.classList.remove('open');
    // remove any desktop inline overrides
    sidebar.style.transform = '';
    sidebar.style.position = '';
    sidebar.style.left = '';
    sidebar.style.zIndex = '';
    if (menuBackdrop) menuBackdrop.classList.remove('active');
    document.body.classList.remove('menu-open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
  } else {
    // on desktop ensure sidebar is visible and backdrop/menu state cleared
    sidebar.classList.add('open');
    // enforce visible sidebar via inline style to prevent overrides
    sidebar.style.transform = 'translateX(0)';
    sidebar.style.position = 'sticky';
    sidebar.style.left = '0';
    sidebar.style.zIndex = '1000';
    if (menuBackdrop) menuBackdrop.classList.remove('active');
    document.body.classList.remove('menu-open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
  }
}
window.addEventListener('resize', handleResize);
// call once to set initial state
handleResize();

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
    toggleMenu();
  }
});

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
    if (sidebar && sidebar.classList.contains('open')) toggleMenu();
  });
});

// FAQ accordion (final FAQ block)
faqButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    if (!item) return;
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.toggle('active');
    btn.setAttribute('aria-expanded', String(isOpen));
    if (answer) answer.style.maxHeight = isOpen ? `${answer.scrollHeight}px` : null;
  });
});

