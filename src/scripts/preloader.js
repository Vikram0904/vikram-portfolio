/**
 * VIKRAM.DEV — Full-Screen Cinematic Preloader (Parting Gateway Architecture)
 *
 * TIMING & COMPOSITION ARCHITECTURE (Total 6.0s Cinematic Experience):
 * - 0-450ms:     Background atmosphere & soft copper glow fade in, bottom controls visible
 * - 350-1400ms:  Wordmark ("VIKRAM • DEV") decrypts/scrambles into sharp focus at screen center (~1.05s)
 * - 1250-1800ms: Copper dot pulses with high-tech radial flare (~550ms)
 * - 1700-4300ms: Cinematic Parting & WebGL Particle Mosaic Emergence (~2.60s):
 *                - Wordmark halves "VIKRAM" (left) and "DEV" (right) part sideways like an anamorphic gate
 *                - Thousands of glowing dots & dust specks float in the air and connect into Vikram's portrait
 *                - Wordmark elevates smoothly to upper cinema poster position (above hair)
 *                - Tagline decrypts & fades in under the wordmark
 * - 4300-5250ms: 950ms pristine hold on the completed composition (counter = 100%)
 * - 5250-6050ms: Exit begins (lift away over ~800ms); concurrently launches Hero 3D WebGL reveals
 */

// ============================================================================
// SINGLE SOURCE OF TRUTH: MASTER TIMINGS CONFIGURATION (6.0s TOTAL RUNTIME)
// ============================================================================
export const PRELOADER_CONFIG = {
  // Step 1: 0ms - 450ms: Background & glow fade in
  glowDuration: 0.45,           // Duration (s) for atmosphere glow & bottom controls fade in

  // Step 2: 350ms - 1400ms: Center scramble & convergence
  scrambleStart: 0.35,          // Timeline offset (s) when wordmark scrambles into focus
  scrambleDuration: 1.05,       // Duration (s) for scramble completion

  // Step 3: 1250ms - 1800ms: Copper dot pop & pulse
  dotPopStart: 1.25,            // Timeline offset (s) when dot pulses
  dotPopDuration: 0.45,         // Duration (s) for dot settle

  // Step 4: 1700ms - 4300ms: Cinematic parting & portrait particle emergence
  partingStart: 1.70,           // Timeline offset (s) when wordmark parts and dots assemble portrait
  partingDuration: 2.60,        // Duration (s) for full dot flight & particle assembly

  // Step 5: 4300ms - 5250ms: Pristine hold on finished poster
  holdDuration: 0.95,           // Hold duration (s) before exit begins (950ms)

  // Step 6: 5250ms: Exit begins (Space Rift & Shadow Relief parting over ~950ms)
  exitStart: 5.25,              // Timeline timestamp (s) when exit begins
  exitDuration: 0.95,           // Duration (s) for center-outward parting & shadow relief

  // Key Milestones & Thresholds
  compositionCompleteTime: 4.30,// Timeline timestamp (s) when composition reaches 100%
  postReadinessExitDelay: 600,  // Max delay (ms) to exit after late page load completes
  failsafeTimeout: 10000,       // Hard failsafe timeout (10s) for slow connections
  fontTimeout: 800,             // Maximum wait (ms) for document.fonts.ready before starting
  reducedMotionDuration: 600    // Duration (ms) for prefers-reduced-motion fade
};

import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ParticleMosaic } from './particle-mosaic.js';

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
  const particleCanvas = document.getElementById('preloader-particle-canvas');
  const glow = preloader.querySelector('.preloader-glow');
  const bottomControls = preloader.querySelector('.preloader-bottom-controls');
  const stage = preloader.querySelector('.preloader-stage');
  const shutterLeft = document.getElementById('preloader-shutter-left');
  const shutterRight = document.getElementById('preloader-shutter-right');
  const riftFlare = document.getElementById('preloader-rift-flare');

  let particleMosaic = null;
  if (particleCanvas && portraitWrap) {
    particleMosaic = new ParticleMosaic({
      canvas: particleCanvas,
      anchorEl: portraitWrap,
      imgSrc: '/assets/vikram-avatar-1200w.webp'
    });
    particleMosaic.init();
  }

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
   * in the upper poster position (cleanly above the hair).
   * Since default CSS position is centered (top: 50%, -50%),
   * moving to upper poster position is an upward offset.
   */
  function getWordmarkPosterOffset() {
    if (!wordmarkWrap) return 0;
    // Target top: var(--wordmark-top-margin, clamp(24px, 5.5vh, 60px))
    // Current top center: window.innerHeight / 2
    // Difference between target top position and center:
    const targetTop = Math.max(24, window.innerHeight * 0.055);
    const wrapHeight = wordmarkWrap.offsetHeight || 120;
    const currentTop = (window.innerHeight - wrapHeight) / 2;
    return -(currentTop - targetTop);
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
      if (particleMosaic) particleMosaic.destroy();
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

    // Full Cinematic Space Rift & Center-Outward Shadow Relief Exit
    const exitTl = gsap.timeline({
      onComplete: () => {
        if (particleMosaic) particleMosaic.destroy();
        unlockScroll();
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
      }
    });

    // 1. Instantly activate shutters & prepare space rift
    if (shutterLeft && shutterRight) {
      gsap.set([shutterLeft, shutterRight], { display: 'block', xPercent: 0 });
    }

    // 2. Fade out bottom counter, skip button, and ambient background glow
    if (bottomControls) {
      exitTl.to(bottomControls, { opacity: 0, duration: 0.25, ease: 'power2.in' }, 0);
    }
    if (glow) {
      exitTl.to(glow, { opacity: 0, duration: 0.35, ease: 'power2.in' }, 0);
    }

    // 3. Central Energy Rift Flare: vertical light beam ignites in center
    if (riftFlare) {
      exitTl.fromTo(riftFlare,
        { scaleY: 0, opacity: 0, width: 2 },
        { scaleY: 1, opacity: 1, width: 6, duration: 0.22, ease: 'power3.out' },
        0.05
      );
    }

    // 4. Center-Outward Parting / Shadow Relief:
    // Left shutter slides left (-100%), Right shutter slides right (100%)
    if (shutterLeft && shutterRight) {
      exitTl.to(shutterLeft, {
        xPercent: -100,
        duration: PRELOADER_CONFIG.exitDuration,
        ease: 'power4.inOut'
      }, 0.20);

      exitTl.to(shutterRight, {
        xPercent: 100,
        duration: PRELOADER_CONFIG.exitDuration,
        ease: 'power4.inOut'
      }, 0.20);
    }

    // 5. Stage contents (portrait & wordmark) scale subtly into deep space while parting
    if (stage) {
      exitTl.to(stage, {
        scale: 1.08,
        opacity: 0,
        filter: 'blur(12px)',
        duration: PRELOADER_CONFIG.exitDuration * 0.75,
        ease: 'power3.in'
      }, 0.20);
    }

    // 6. Flare blooms outward horizontally then vanishes as the universe opens
    if (riftFlare) {
      exitTl.to(riftFlare, {
        width: '120vw',
        opacity: 0,
        duration: PRELOADER_CONFIG.exitDuration * 0.7,
        ease: 'power2.out'
      }, 0.25);
    }
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

  // 2. 0.20s - 0.80s: Center convergence & decrypt into sharp focus
  // Wordmark begins centered at (top: 50%, left: 50%)
  tl.fromTo(wordmarkVikram,
    { opacity: 0, filter: 'blur(10px)', scale: 0.96 },
    {
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      duration: PRELOADER_CONFIG.scrambleDuration,
      ease: 'power2.out'
    },
    PRELOADER_CONFIG.scrambleStart
  );

  tl.fromTo(wordmarkDev,
    { opacity: 0, filter: 'blur(10px)', scale: 0.96 },
    {
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      duration: PRELOADER_CONFIG.scrambleDuration,
      ease: 'power2.out'
    },
    PRELOADER_CONFIG.scrambleStart
  );

  // Scramble character decrypt effect
  const originalVikram = 'VIKRAM';
  const originalDev = 'DEV';
  const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/*#_•';
  const scrambleObj = { p: 0 };

  tl.to(scrambleObj, {
    p: 1,
    duration: PRELOADER_CONFIG.scrambleDuration,
    ease: 'none',
    onUpdate: function() {
      const progress = scrambleObj.p;
      if (wordmarkVikram) {
        const revealedV = Math.floor(progress * originalVikram.length);
        wordmarkVikram.textContent = originalVikram.split('').map((char, idx) => {
          if (idx < revealedV) return char;
          return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        }).join('');
      }
      if (wordmarkDev) {
        const revealedD = Math.floor(progress * originalDev.length);
        wordmarkDev.textContent = originalDev.split('').map((char, idx) => {
          if (idx < revealedD) return char;
          return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        }).join('');
      }
    },
    onComplete: function() {
      if (wordmarkVikram) wordmarkVikram.textContent = originalVikram;
      if (wordmarkDev) wordmarkDev.textContent = originalDev;
    }
  }, PRELOADER_CONFIG.scrambleStart);

  // 3. Copper dot pops and pulses
  if (wordmarkDot) {
    tl.fromTo(wordmarkDot,
      { scale: 0, opacity: 0 },
      { scale: 1.35, opacity: 1, duration: 0.18, ease: 'back.out(2)' },
      PRELOADER_CONFIG.dotPopStart
    ).to(wordmarkDot,
      { scale: 1, duration: 0.12, ease: 'power2.out' },
      PRELOADER_CONFIG.dotPopStart + 0.18
    );
  }

  // 4. CINEMATIC PARTING & PORTRAIT EMERGENCE
  // Function to get current responsive parting distance dynamically
  function getPartingDistance() {
    return window.innerWidth <= 600
      ? Math.max(28, window.innerWidth * 0.08)
      : Math.min(220, Math.max(90, window.innerWidth * 0.14));
  }

  // (a) Parting: VIKRAM moves left, DEV moves right
  tl.to(wordmarkVikram, {
    x: () => -getPartingDistance(),
    duration: PRELOADER_CONFIG.partingDuration,
    ease: 'preloaderSnappy'
  }, PRELOADER_CONFIG.partingStart);

  tl.to(wordmarkDev, {
    x: () => getPartingDistance(),
    duration: PRELOADER_CONFIG.partingDuration,
    ease: 'preloaderSnappy'
  }, PRELOADER_CONFIG.partingStart);

  // (b) Wordmark wrap glides smoothly to the upper poster position (above the hair)
  tl.to(wordmarkWrap, {
    y: () => getWordmarkPosterOffset(),
    duration: PRELOADER_CONFIG.partingDuration,
    ease: 'preloaderSnappy'
  }, PRELOADER_CONFIG.partingStart);

  // (c) Tagline fades in and glides into position
  if (tagline) {
    tl.fromTo(tagline,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' },
      PRELOADER_CONFIG.partingStart + 0.60
    );
  }

  // (d) Portrait emerges via particle mosaic gathering
  tl.call(() => {
    if (particleMosaic) {
      particleMosaic.play();
    }
  }, null, PRELOADER_CONFIG.partingStart);

  if (portraitWrap) {
    tl.to(glow, {
      opacity: 0.42,
      scale: 1.15,
      duration: PRELOADER_CONFIG.partingDuration,
      ease: 'power2.out'
    }, PRELOADER_CONFIG.partingStart);
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

        // Reset wordmarks and dot to initial state before playing timeline
        gsap.set(wordmarkVikram, { x: 0, opacity: 0, clearProps: 'transform' });
        gsap.set(wordmarkDev, { x: 0, opacity: 0, clearProps: 'transform' });
        if (wordmarkDot) gsap.set(wordmarkDot, { scale: 0, opacity: 0 });
        if (tagline) gsap.set(tagline, { opacity: 0, y: 16 });

        // Initial state: wordmark begins centered vertically (y: 0 relative to top 50%)
        gsap.set(wordmarkWrap, { y: 0 });

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
