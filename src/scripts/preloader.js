/**
 * VIKRAM.DEV — Full-Screen Cinematic Preloader
 *
 * TIMING & COMPOSITION ARCHITECTURE:
 * - 0-300ms:     Background atmosphere & soft copper glow fade in
 * - 200-1000ms:  "VIKRAM" and "DEV" slide in from sides and meet in center
 * - 900-1200ms:  Copper dot pops cleanly between the wordmarks
 * - 1100-2200ms: Wordmark moves up while portrait rises from bottom (both land together)
 * - 2200-2700ms: Short hold on the finished poster composition (tagline visible, counter = 100)
 * - 2700ms:      Exit begins (lift away over ~700ms); hero reveal starts concurrently as exit begins
 * - Counter is strictly driven by the animation progress (100 reached at 2200ms if page is ready,
 *   or held at 99 if page is still downloading, then flips to 100 and exits within 300ms).
 */

// ============================================================================
// SINGLE SOURCE OF TRUTH: MASTER TIMINGS CONFIGURATION
// ============================================================================
export const PRELOADER_CONFIG = {
  // Step 1: 0ms - 300ms: Background & glow fade in
  glowDuration: 0.30,           // Duration (s) for atmosphere glow & bottom controls fade in

  // Step 2: 200ms - 1000ms: "VIKRAM" and "DEV" slide in from sides and meet in center
  wordmarkSlideStart: 0.20,     // Timeline offset (s) when wordmarks begin sliding in
  wordmarkSlideDuration: 0.80,  // Duration (s) for slide entrance (lands at 1.00s)

  // Step 3: 900ms - 1200ms: Copper dot pops
  dotPopStart: 0.90,            // Timeline offset (s) when dot starts scaling up
  dotPopDuration: 0.30,         // Duration (s) for pop & settle (completes at 1.20s)

  // Step 4: 1100ms - 2200ms: Wordmark moves up while portrait rises from bottom together
  compositionMoveStart: 1.10,   // Timeline offset (s) when upward movement starts
  compositionMoveDuration: 1.10,// Duration (s) for both elements to land (completes at 2.20s)

  // Step 5: 2200ms - 2700ms: Short hold on the finished composition (tagline visible)
  holdDuration: 0.50,           // Hold duration (s) on completed poster frame before exit (500ms)

  // Step 6: 2700ms: Exit begins (lift away over about 700ms)
  exitStart: 2.70,              // Timeline timestamp (s) when upward lift exit begins
  exitDuration: 0.70,           // Duration (s) for preloader upward lift-away exit (700ms)

  // Key Milestones & Thresholds
  compositionCompleteTime: 2.20,// Timeline timestamp (s) when composition reaches 100%
  postReadinessExitDelay: 300,  // Max delay (ms) to exit after late page load completes
  failsafeTimeout: 7000,        // Hard failsafe timeout (7s) for slow connections
  fontTimeout: 800,             // Maximum wait (ms) for document.fonts.ready before starting
  reducedMotionDuration: 600    // Duration (ms) for prefers-reduced-motion fade
};

import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

// Register GSAP CustomEase plugin for snappy entrance curves
gsap.registerPlugin(CustomEase);
CustomEase.create('preloaderSnappy', '0.22, 1, 0.36, 1');

export function initPreloader(onComplete) {
  const preloader = document.getElementById('preloader') || document.querySelector('.preloader');
  if (!preloader) {
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  // Check reduced motion preference
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Elements
  const counterEl = preloader.querySelector('.preloader-count');
  const progressFill = document.getElementById('preloader-progress-fill');
  const skipBtn = document.getElementById('preloader-skip-btn');
  const wordmarkWrap = document.getElementById('preloader-wordmark-wrap');
  const wordmarkVikram = preloader.querySelector('.wordmark-vikram');
  const wordmarkDev = preloader.querySelector('.wordmark-dev');
  const wordmarkDot = preloader.querySelector('.wordmark-dot');
  const tagline = document.getElementById('preloader-tagline');
  const portraitWrap = document.getElementById('preloader-portrait-wrap');
  const portraitImg = document.getElementById('preloader-portrait-img');
  const glow = preloader.querySelector('.preloader-glow');
  const bottomControls = preloader.querySelector('.preloader-bottom-controls');

  // Lock body & html scrolling during intro; hide behind-the-scenes content
  document.documentElement.classList.add('preloader-locked');
  document.body.classList.add('preloader-locked');
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';

  let isExiting = false;
  let displayedProgress = 0;
  let animationStartTime = 0;
  let readyReachedTime = null;
  let postReadyTimeout = null;

  // Track full page readiness (load event / complete state)
  let isWindowLoaded = (document.readyState === 'complete');
  if (!isWindowLoaded) {
    window.addEventListener('load', () => {
      isWindowLoaded = true;
    }, { once: true });
  }

  function isPageReady() {
    return isWindowLoaded || document.readyState === 'complete';
  }

  function unlockScroll() {
    document.documentElement.classList.remove('preloader-locked');
    document.body.classList.remove('preloader-locked');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  /**
   * Calculates the vertical offset required to position the wordmark
   * precisely in the vertical center of the screen during its entrance slide.
   */
  function getWordmarkCenterOffset() {
    if (!wordmarkWrap) return 0;
    const wrapRect = wordmarkWrap.getBoundingClientRect();
    const screenCenterY = window.innerHeight / 2;
    const currentCenterY = wrapRect.top + wrapRect.height / 2;
    return screenCenterY - currentCenterY;
  }

  /**
   * Exit sequence: lifts the preloader upward (0 to -100%)
   * and triggers the hero reveal concurrently as the exit starts.
   */
  function executeExit(quick = false) {
    if (isExiting) return;
    isExiting = true;

    if (postReadyTimeout) {
      clearTimeout(postReadyTimeout);
      postReadyTimeout = null;
    }

    // Accessibility state
    preloader.setAttribute('aria-hidden', 'true');

    // Launch hero animations & Lenis concurrently as exit begins
    if (typeof onComplete === 'function') {
      try {
        onComplete();
      } catch (err) {
        console.error('Error starting hero animation:', err);
      }
    }

    if (quick || isReducedMotion) {
      gsap.to(preloader, {
        opacity: 0,
        duration: PRELOADER_CONFIG.reducedMotionDuration / 1000,
        ease: 'power2.out',
        onComplete: () => {
          unlockScroll();
          if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
        }
      });
      return;
    }

    // Full cinematic upward lift-away exit (700ms)
    gsap.to(preloader, {
      yPercent: -100,
      duration: PRELOADER_CONFIG.exitDuration,
      ease: 'power4.inOut',
      onComplete: () => {
        unlockScroll();
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
      }
    });
  }

  // --- PREPARE ASSET READINESS PROMISES ---
  // (a) Font readiness with safety timeout
  const fontPromise = new Promise((resolve) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) { resolved = true; resolve(); }
    }, PRELOADER_CONFIG.fontTimeout);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!resolved) { resolved = true; clearTimeout(timer); resolve(); }
      }).catch(() => {
        if (!resolved) { resolved = true; clearTimeout(timer); resolve(); }
      });
    } else {
      if (!resolved) { resolved = true; clearTimeout(timer); resolve(); }
    }
  });

  // (b) Portrait image decode (with catch so it never blocks)
  const imagePromise = new Promise((resolve) => {
    if (!portraitImg) {
      resolve();
      return;
    }
    if (portraitImg.complete && portraitImg.naturalWidth > 0) {
      if (portraitImg.decode) {
        portraitImg.decode().then(resolve).catch(resolve);
      } else {
        resolve();
      }
    } else if (portraitImg.decode) {
      portraitImg.decode().then(resolve).catch(resolve);
    } else {
      portraitImg.addEventListener('load', () => resolve(), { once: true });
      portraitImg.addEventListener('error', () => resolve(), { once: true });
    }
  });

  // --- REDUCED MOTION PATH ---
  function startReducedMotion() {
    if (bottomControls) gsap.set(bottomControls, { opacity: 1 });
    if (wordmarkWrap) gsap.set(wordmarkWrap, { y: 0 });
    if (portraitWrap) gsap.set(portraitWrap, { x: 0, xPercent: -50, yPercent: 0, y: 0, opacity: 1 });
    if (wordmarkVikram) gsap.set(wordmarkVikram, { x: 0, opacity: 1 });
    if (wordmarkDev) gsap.set(wordmarkDev, { x: 0, opacity: 1 });
    if (wordmarkDot) gsap.set(wordmarkDot, { scale: 1, opacity: 1 });
    if (tagline) gsap.set(tagline, { opacity: 1 });
    if (counterEl) counterEl.textContent = '100';
    if (progressFill) progressFill.style.width = '100%';

    gsap.fromTo(preloader, { opacity: 0 }, {
      opacity: 1,
      duration: PRELOADER_CONFIG.reducedMotionDuration / 1000,
      ease: 'power2.out',
      onComplete: () => {
        setTimeout(() => executeExit(true), 600);
      }
    });
  }

  // --- FULL CINEMATIC ANIMATION TIMELINE (~3.0s to Exit Start) ---
  const isMobile = window.innerWidth <= 600;
  const tl = gsap.timeline({ paused: true });

  // 1. 0.0s - 0.30s: Background glow and bottom controls fade in
  tl.to(glow, {
    opacity: 0.28,
    duration: PRELOADER_CONFIG.glowDuration,
    ease: 'power2.out'
  }, 0);

  if (bottomControls) {
    tl.to(bottomControls, {
      opacity: 1,
      duration: PRELOADER_CONFIG.glowDuration,
      ease: 'power2.out'
    }, 0);
  }

  // 2. 0.20s - 1.00s: "VIKRAM" from left, "DEV" from right slide in and meet in the center
  tl.fromTo(wordmarkVikram, 
    { x: '-120vw', opacity: 0 },
    {
      x: 0,
      opacity: 1,
      duration: PRELOADER_CONFIG.wordmarkSlideDuration,
      ease: 'preloaderSnappy'
    },
    PRELOADER_CONFIG.wordmarkSlideStart
  );

  tl.fromTo(wordmarkDev, 
    { x: '120vw', opacity: 0 },
    {
      x: 0,
      opacity: 1,
      duration: PRELOADER_CONFIG.wordmarkSlideDuration,
      ease: 'preloaderSnappy'
    },
    PRELOADER_CONFIG.wordmarkSlideStart
  );

  // 3. 0.90s - 1.20s: Dot pops when they meet
  if (wordmarkDot && !isMobile) {
    tl.fromTo(wordmarkDot,
      { scale: 0, opacity: 0 },
      { scale: 1.25, opacity: 1, duration: 0.18, ease: 'back.out(2)' },
      PRELOADER_CONFIG.dotPopStart
    ).to(wordmarkDot,
      { scale: 1, duration: 0.12, ease: 'power2.out' },
      PRELOADER_CONFIG.dotPopStart + 0.18
    );
  }

  // 4. 1.10s - 2.20s: Wordmark moves UP and portrait rises from bottom TOGETHER.
  // Both start simultaneously at 1.10s and land together at 2.20s using snappier easing.
  tl.to(wordmarkWrap, {
    y: 0,
    duration: PRELOADER_CONFIG.compositionMoveDuration,
    ease: 'preloaderSnappy'
  }, PRELOADER_CONFIG.compositionMoveStart);

  if (tagline) {
    tl.fromTo(tagline,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
      PRELOADER_CONFIG.compositionMoveStart + 0.15
    );
  }

  if (portraitWrap) {
    tl.fromTo(portraitWrap,
      { x: 0, xPercent: -50, yPercent: 100, y: 0, opacity: 0 },
      {
        x: 0,
        xPercent: -50,
        yPercent: 0,
        y: 0,
        opacity: 1,
        duration: PRELOADER_CONFIG.compositionMoveDuration,
        ease: 'preloaderSnappy'
      },
      PRELOADER_CONFIG.compositionMoveStart
    );

    tl.to(glow, {
      opacity: 0.38,
      duration: PRELOADER_CONFIG.compositionMoveDuration,
      ease: 'power2.out'
    }, PRELOADER_CONFIG.compositionMoveStart);
  }

  // --- SYNCHRONIZED ANIMATION COUNTER LOOP ---
  function updateProgress() {
    if (isExiting) return;

    const now = performance.now();
    const elapsed = animationStartTime > 0 ? (now - animationStartTime) : 0;
    const elapsedSec = elapsed / 1000;
    const ready = isPageReady();

    // Map progress along the 0 - 2.2s composition timeline
    const compTime = PRELOADER_CONFIG.compositionCompleteTime;
    const p = Math.min(1, Math.max(0, elapsedSec / compTime));

    // Eased curve: 0 at start, ~17 at 0.5s, ~39 at 1.0s, ~63 at 1.5s, ~89 at 2.0s, 100 at 2.2s
    let targetProgress = Math.floor(Math.pow(p, 1.2) * 100);

    // If composition completed on screen but page resources are still loading, hold at 99
    if (targetProgress >= 100 && !ready) {
      targetProgress = 99;
    }

    // Monotonically increase displayed progress
    if (targetProgress > displayedProgress) {
      displayedProgress = targetProgress;
    }

    // Update UI elements
    if (counterEl) {
      counterEl.textContent = displayedProgress.toString().padStart(2, '0');
    }
    if (progressFill) {
      progressFill.style.width = `${displayedProgress}%`;
    }

    // Exit coordination:
    if (ready && elapsedSec >= compTime) {
      if (readyReachedTime === null) {
        readyReachedTime = now;
        displayedProgress = 100;
        if (counterEl) counterEl.textContent = '100';
        if (progressFill) progressFill.style.width = '100%';
      }

      // If page was ready on time: hold until exitStart (2.7s), giving exactly 500ms hold on 100.
      // If page became ready late: exit within postReadinessExitDelay (300ms).
      const wasReadyOnTime = (readyReachedTime <= (animationStartTime + compTime * 1000 + 80));
      const scheduledExitTime = wasReadyOnTime
        ? (animationStartTime + PRELOADER_CONFIG.exitStart * 1000)
        : (readyReachedTime + PRELOADER_CONFIG.postReadinessExitDelay);

      if (now >= scheduledExitTime) {
        executeExit();
        return;
      }
    }

    requestAnimationFrame(updateProgress);
  }

  // --- START ANIMATION ONLY WHEN ASSETS ARE DECODED & READY ---
  Promise.all([fontPromise, imagePromise]).then(() => {
    if (isExiting) return;

    // Double requestAnimationFrame ensures initial hidden state is painted first
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (isExiting) return;

        preloader.classList.add('is-playing');

        if (isReducedMotion) {
          startReducedMotion();
          return;
        }

        // Set initial vertical center position for wordmark meeting
        const startCenterOffset = getWordmarkCenterOffset();
        gsap.set(wordmarkWrap, { y: startCenterOffset });

        // Timeline starts counting from this exact moment
        animationStartTime = performance.now();
        tl.play();
        requestAnimationFrame(updateProgress);
      });
    });
  });

  // --- HARD FAILSAFE (7s) ---
  const failsafeTimer = setTimeout(() => {
    if (!isExiting) {
      console.warn('[Preloader] Failsafe reached (7s). Forcing completion.');
      displayedProgress = 100;
      if (counterEl) counterEl.textContent = '100';
      if (progressFill) progressFill.style.width = '100%';
      executeExit();
    }
  }, PRELOADER_CONFIG.failsafeTimeout);

  // --- USER INTERRUPTIONS: SKIP BUTTON & ESCAPE KEY ---
  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.preventDefault();
      clearTimeout(failsafeTimer);
      executeExit();
    });
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      clearTimeout(failsafeTimer);
      executeExit();
      document.removeEventListener('keydown', handleKeyDown);
    }
  }
  document.addEventListener('keydown', handleKeyDown);

  // --- BFCACHE RESTORE HANDLING ---
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      unlockScroll();
      const p = document.getElementById('preloader');
      if (p && p.parentNode) p.parentNode.removeChild(p);
    }
  });
}
