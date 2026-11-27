/**
 * VIKRAM.DEV — Text Animation System
 * Reusable, data-attribute-driven text animations using GSAP SplitText,
 * ScrollTrigger, and ScrambleTextPlugin.
 *
 * Supported: data-anim="lines|chars|words|scrub|scramble|count|underline"
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

// ─── Helpers ────────────────────────────────────────────────────────
const isMobile = () => window.innerWidth < 768;
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Parse "40+" → { num: 40, suffix: "+", prefix: "" }, "<20ms" → { num: 20, prefix: "<", suffix: "ms" } */
function parseStatNumber(text) {
  const t = text.trim();
  const m = t.match(/^([<>≈~]*)(\d+(?:\.\d+)?)([\s\S]*)$/);
  if (!m) return null;
  return { prefix: m[1], num: parseFloat(m[2]), suffix: m[3] };
}

// ─── Tracked instances for cleanup ──────────────────────────────────
const splits = [];
const triggers = [];

// ─── MAIN INIT ──────────────────────────────────────────────────────
export function initTextAnimations() {
  const allEls = document.querySelectorAll('[data-anim]:not(#hero [data-anim])');
  if (!allEls.length) return;

  // Immediately hide all animated elements to prevent FOUC
  allEls.forEach((el) => {
    if (el.getAttribute('data-anim') !== 'count') {
      gsap.set(el, { autoAlpha: 0 });
    }
  });

  // Reduced motion — show everything instantly
  if (prefersReducedMotion()) {
    allEls.forEach((el) => gsap.set(el, { autoAlpha: 1 }));
    return;
  }

  // Wait for fonts so SplitText line breaks are correct
  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  fontsReady.then(() => {
    allEls.forEach((el) => setupAnim(el));
    ScrollTrigger.refresh();
  });
}

// ─── Per-Element Setup ──────────────────────────────────────────────
function setupAnim(el) {
  const type = el.getAttribute('data-anim');

  // Store original text for a11y
  if (!el.hasAttribute('aria-label') && el.textContent.trim()) {
    el.setAttribute('aria-label', el.textContent.trim());
  }

  switch (type) {
    case 'lines':   return animLines(el);
    case 'chars':   return isMobile() ? animLines(el) : animChars(el);
    case 'words':   return animWords(el);
    case 'scrub':   return animScrub(el);
    case 'scramble': return animScramble(el);
    case 'count':   return animCount(el);
    case 'underline': return animUnderline(el);
  }
}

// ─── LINES: headline reveal with mask ───────────────────────────────
function animLines(el) {
  const split = new SplitText(el, {
    type: 'lines',
    linesClass: 'ta-line',
    autoSplit: true,
    onSplit(self) {
      const lines = (self && self.lines) || (this && this.lines);
      if (!lines) return;
      lines.forEach((line) => {
        const mask = document.createElement('div');
        mask.classList.add('ta-line-mask');
        mask.setAttribute('aria-hidden', 'true');
        line.parentNode?.insertBefore(mask, line);
        mask.appendChild(line);
      });
      gsap.set(lines, { yPercent: 110, autoAlpha: 0 });
    },
  });
  splits.push(split);

  gsap.set(el, { autoAlpha: 1 }); // reveal the container

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none none',
      once: true,
    },
  });

  tl.to(split.lines, {
    yPercent: 0,
    autoAlpha: 1,
    duration: 0.8,
    stagger: 0.08,
    ease: 'power4.out',
    onStart() { gsap.set(split.lines, { willChange: 'transform' }); },
    onComplete() { gsap.set(split.lines, { willChange: 'auto' }); },
  });

  triggers.push(tl.scrollTrigger);
}

// ─── CHARS: character cascade ───────────────────────────────────────
function animChars(el) {
  const split = new SplitText(el, {
    type: 'chars',
    charsClass: 'ta-char',
    autoSplit: true,
    onSplit(self) {
      const chars = (self && self.chars) || (this && this.chars);
      if (!chars) return;
      gsap.set(chars, {
        yPercent: 80,
        rotateX: 40,
        filter: 'blur(4px)',
        autoAlpha: 0,
      });
    },
  });
  splits.push(split);

  gsap.set(el, { autoAlpha: 1 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none none',
      once: true,
    },
  });

  tl.to(split.chars, {
    yPercent: 0,
    rotateX: 0,
    filter: 'blur(0px)',
    autoAlpha: 1,
    duration: 0.7,
    stagger: 0.02,
    ease: 'power4.out',
    onStart() { gsap.set(split.chars, { willChange: 'transform, filter' }); },
    onComplete() { gsap.set(split.chars, { willChange: 'auto', clearProps: 'filter' }); },
  });

  // Optional: letter-spacing tighten at the end
  if (el.hasAttribute('data-tighten')) {
    tl.to(el, { letterSpacing: '-0.02em', duration: 0.4, ease: 'power3.inOut' }, '-=0.2');
  }

  triggers.push(tl.scrollTrigger);
}

// ─── WORDS: fade & lift ─────────────────────────────────────────────
function animWords(el) {
  const split = new SplitText(el, {
    type: 'words',
    wordsClass: 'ta-word',
    autoSplit: true,
    onSplit(self) {
      const words = (self && self.words) || (this && this.words);
      if (words) gsap.set(words, { y: 16, autoAlpha: 0 });
    },
  });
  splits.push(split);

  gsap.set(el, { autoAlpha: 1 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none none',
      once: true,
    },
  });

  tl.to(split.words, {
    y: 0,
    autoAlpha: 1,
    duration: 0.6,
    stagger: 0.03,
    ease: 'power4.out',
    onStart() { gsap.set(split.words, { willChange: 'transform' }); },
    onComplete() { gsap.set(split.words, { willChange: 'auto' }); },
  });

  triggers.push(tl.scrollTrigger);
}

// ─── SCRUB: scroll-driven word-by-word fill ─────────────────────────
function animScrub(el) {
  const split = new SplitText(el, {
    type: 'words',
    wordsClass: 'ta-scrub-word',
    autoSplit: true,
    onSplit(self) {
      const words = (self && self.words) || (this && this.words);
      if (words) gsap.set(words, { autoAlpha: 0.15 });
    },
  });
  splits.push(split);

  gsap.set(el, { autoAlpha: 1 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: 'top 80%',
      end: 'bottom 40%',
      scrub: 0.5,
    },
  });

  split.words.forEach((word) => {
    const props = { autoAlpha: 1, duration: 0.1, ease: 'none' };

    // Check if this word has highlight data
    if (word.hasAttribute('data-highlight') ||
        word.closest('[data-highlight]') ||
        word.parentElement?.hasAttribute('data-highlight')) {
      props.color = 'var(--copper)';
    }

    tl.to(word, props);
  });

  triggers.push(tl.scrollTrigger);

  // Also trigger underline draw on [data-highlight] spans within scrub paragraphs
  el.querySelectorAll('[data-highlight]').forEach((hl) => {
    if (!hl.querySelector('.ta-underline')) {
      const line = document.createElement('span');
      line.classList.add('ta-underline');
      hl.style.position = 'relative';
      hl.appendChild(line);
    }
    const uLine = hl.querySelector('.ta-underline');
    gsap.set(uLine, { scaleX: 0 });

    const uTrigger = ScrollTrigger.create({
      trigger: hl,
      start: 'top 80%',
      once: true,
      onEnter() {
        gsap.to(uLine, { scaleX: 1, duration: 0.6, ease: 'power4.out' });
      },
    });
    triggers.push(uTrigger);
  });
}

// ─── SCRAMBLE: hacker decode ────────────────────────────────────────
function animScramble(el) {
  const originalText = el.textContent;
  gsap.set(el, { autoAlpha: 1 }); // show immediately (text will scramble)

  const st = ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter() {
      gsap.to(el, {
        duration: 0.8,
        scrambleText: {
          text: originalText,
          chars: '01!<>-_\\/[]{}—=+*^?#',
          speed: 0.6,
          revealDelay: 0.3,
        },
        ease: 'power4.out',
      });
    },
  });
  triggers.push(st);
}

// ─── COUNT: number count up ─────────────────────────────────────────
function animCount(el) {
  const raw = el.textContent.trim();
  const parsed = parseStatNumber(raw);
  if (!parsed) return;

  const { prefix, num, suffix } = parsed;
  const isInt = Number.isInteger(num);

  gsap.set(el, { autoAlpha: 1 });

  const counter = { val: 0 };
  const st = ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter() {
      gsap.to(counter, {
        val: num,
        duration: 1.0,
        ease: 'power4.out',
        onUpdate() {
          const display = isInt ? Math.round(counter.val) : counter.val.toFixed(1);
          el.textContent = `${prefix}${display}${suffix}`;
        },
      });
    },
  });
  triggers.push(st);
}

// ─── UNDERLINE: draw-on accent line ─────────────────────────────────
function animUnderline(el) {
  // Create the underline element
  el.style.position = 'relative';
  el.style.display = el.style.display || 'inline-block';

  if (!el.querySelector('.ta-underline')) {
    const line = document.createElement('span');
    line.classList.add('ta-underline');
    el.appendChild(line);
  }

  const uLine = el.querySelector('.ta-underline');
  gsap.set(el, { autoAlpha: 1 });
  gsap.set(uLine, { scaleX: 0, transformOrigin: 'left center' });

  const st = ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter() {
      gsap.to(uLine, {
        scaleX: 1,
        duration: 0.6,
        ease: 'power4.out',
      });
    },
  });
  triggers.push(st);
}


// ═══════════════════════════════════════════════════════════════════
//  HELPER EXPORTS — Interactive effects used across sections
// ═══════════════════════════════════════════════════════════════════

/**
 * Text Roll — hover effect for nav links and buttons.
 * Wraps the element's text in a rolling container so on hover
 * the label slides up and an identical duplicate slides in from below.
 */
export function textRoll(selector) {
  if (prefersReducedMotion()) return;

  document.querySelectorAll(selector).forEach((el) => {
    // Skip if already processed
    if (el.querySelector('.tr-wrap')) return;

    const inner = el.querySelector('span') || el;
    const text = inner.textContent;

    const wrap = document.createElement('span');
    wrap.classList.add('tr-wrap');
    wrap.setAttribute('aria-hidden', 'true');

    const top = document.createElement('span');
    top.classList.add('tr-top');
    top.textContent = text;

    const bot = document.createElement('span');
    bot.classList.add('tr-bot');
    bot.textContent = text;

    wrap.appendChild(top);
    wrap.appendChild(bot);

    inner.textContent = '';
    inner.appendChild(wrap);
    // Keep accessible label
    el.setAttribute('aria-label', text);

    el.addEventListener('mouseenter', () => {
      gsap.to(wrap, {
        yPercent: -50,
        duration: 0.4,
        ease: 'power3.inOut',
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(wrap, {
        yPercent: 0,
        duration: 0.4,
        ease: 'power3.inOut',
      });
    });
  });
}

/**
 * Magnetic Button — primary buttons pull toward the cursor on hover (desktop only).
 */
export function magneticButton(selector) {
  if (prefersReducedMotion() || isMobile()) return;

  const mm = gsap.matchMedia();
  mm.add('(min-width: 768px)', () => {
    document.querySelectorAll(selector).forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.3,
          ease: 'power2.out',
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.4)',
        });
      });
    });
  });
}

/**
 * Hero Mouse React — subtle skew on the hero heading following cursor position (desktop only).
 */
export function heroMouseReact(selector) {
  if (prefersReducedMotion() || isMobile()) return;

  const mm = gsap.matchMedia();
  mm.add('(min-width: 768px)', () => {
    const el = document.querySelector(selector);
    if (!el) return;

    document.addEventListener('mousemove', (e) => {
      const xPct = (e.clientX / window.innerWidth - 0.5) * 2;
      const yPct = (e.clientY / window.innerHeight - 0.5) * 2;

      gsap.to(el, {
        skewX: xPct * 2,
        skewY: yPct * 0.5,
        duration: 0.6,
        ease: 'power2.out',
      });
    });
  });
}

/**
 * Title Word Cycle — vertical text-roll cycling through an array of words.
 */
export function titleWordCycle(el, words, interval = 2500) {
  if (!el || !words.length) return;
  if (prefersReducedMotion()) {
    el.textContent = words[0];
    return;
  }

  // Build the structure
  el.innerHTML = '';
  el.classList.add('tw-cycle-wrap');
  const inner = document.createElement('span');
  inner.classList.add('tw-cycle-inner');

  words.forEach((w, i) => {
    const span = document.createElement('span');
    span.classList.add('tw-cycle-word');
    span.textContent = w;
    if (i === 0) span.classList.add('active');
    inner.appendChild(span);
  });

  el.appendChild(inner);

  let current = 0;

  setInterval(() => {
    const next = (current + 1) % words.length;

    gsap.to(inner, {
      yPercent: -next * 100,
      duration: 0.5,
      ease: 'power3.inOut',
    });

    current = next;
  }, interval);
}

/**
 * Footer Marquee — oversized wordmark letters rising + horizontal availability marquee.
 */
export function footerWordmark(selector) {
  if (prefersReducedMotion()) return;

  const el = document.querySelector(selector);
  if (!el) return;

  const split = new SplitText(el, { type: 'chars', charsClass: 'fw-char' });
  gsap.set(split.chars, { yPercent: 100, autoAlpha: 0 });

  ScrollTrigger.create({
    trigger: el,
    start: 'top 90%',
    once: true,
    onEnter() {
      gsap.to(split.chars, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.8,
        stagger: 0.04,
        ease: 'power4.out',
      });
    },
  });
}

/**
 * Footer Marquee with scroll-velocity speed changes.
 */
export function footerMarquee(selector) {
  if (prefersReducedMotion()) return;

  const wrap = document.querySelector(selector);
  if (!wrap) return;

  const track = wrap.querySelector('.marquee-track');
  if (!track) return;

  // Duplicate content for seamless loop
  track.innerHTML += track.innerHTML;

  let baseSpeed = 60; // px/s
  let velocity = 0;
  let position = 0;
  const items = track.children;
  const singleWidth = track.scrollWidth / 2;

  gsap.ticker.add(() => {
    position -= (baseSpeed + Math.abs(velocity) * 2) * (gsap.ticker.deltaRatio() / 60);
    if (Math.abs(position) >= singleWidth) {
      position += singleWidth;
    }
    gsap.set(track, { x: position });
  });

  // Listen for scroll velocity from Lenis (set on window by main.js if available)
  window.addEventListener('lenis-scroll', (e) => {
    velocity = e.detail?.velocity ?? 0;
    gsap.to({ v: velocity }, { v: 0, duration: 0.8, onUpdate() { velocity = this.targets()[0].v; } });
  });
}


// ═══════════════════════════════════════════════════════════════════
//  PRELOADER INTEGRATION — counter animation for the preloader
// ═══════════════════════════════════════════════════════════════════
export function preloaderCounter(counterEl, opts = {}) {
  if (!counterEl) return Promise.resolve();

  return new Promise((resolve) => {
    const target = opts.target ?? 100;
    const duration = opts.duration ?? 1.6;
    const counter = { val: 0 };

    gsap.to(counter, {
      val: target,
      duration,
      ease: 'power2.out',
      onUpdate() {
        counterEl.textContent = String(Math.floor(counter.val)).padStart(3, '0');
      },
      onComplete: resolve,
    });
  });
}
