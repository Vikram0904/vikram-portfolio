/**
 * VIKRAM.DEV — THE STACK (System Pipeline & Request Flow)
 * Redesigned Skills Architecture Component
 * Pinned layout: Unpinned Intro Block -> Pinned Stage Viewport -> Unpinned Toolbelt
 * Zero clipping on all viewports (1366x768 to 1920x1080).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initSkillsMatrix() {
  const section = document.getElementById('skills');
  const pinnedStage = document.getElementById('stack-pinned-stage');
  const viewport = document.getElementById('stage-content-viewport');
  const slides = Array.from(document.querySelectorAll('.stage-slide'));
  const pills = Array.from(document.querySelectorAll('.stage-pill'));
  const progressFill = document.getElementById('stage-bar-progress-fill');
  const progressDot = document.getElementById('stage-bar-progress-dot');
  const counterCurr = document.getElementById('stage-counter-curr');
  const barWrap = document.querySelector('.stage-nav-bar-wrap');

  if (!section || !pinnedStage || !slides.length) return;

  const mm = gsap.matchMedia();
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lighthouseAnimated = false;

  // 1. DESKTOP & LAPTOP PINNED TIMELINE (>= 768px)
  mm.add('(min-width: 768px)', () => {
    if (prefersReduced) {
      slides.forEach((s) => {
        s.style.opacity = '1';
        s.style.visibility = 'visible';
        s.style.position = 'relative';
      });
      return;
    }

    // Set initial slide positions
    gsap.set(slides[0], { autoAlpha: 1, x: 0 });
    slides.slice(1).forEach((slide) => {
      gsap.set(slide, { autoAlpha: 0, x: 28 });
    });

    // Helper: update all UI elements based on normalized progress (0 to 1)
    const updateStageUI = (progress) => {
      // Progress conduit fill & glowing particle head dot (Signature traveling line)
      if (progressFill) progressFill.style.width = `${progress * 100}%`;
      if (progressDot) progressDot.style.left = `${progress * 100}%`;

      // Discrete active stage (0 to 5)
      const totalTransitions = slides.length - 1; // 5
      const activeIndex = Math.min(
        slides.length - 1,
        Math.max(0, Math.round(progress * totalTransitions))
      );

      // Update pills
      pills.forEach((pill, idx) => {
        const isActive = idx === activeIndex;
        const isCompleted = idx < activeIndex;

        pill.classList.toggle('active', isActive);
        pill.classList.toggle('completed', isCompleted);
        pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      // Auto-center active pill if bar is horizontally scrolling (tablets / small laptops)
      const activePill = pills[activeIndex];
      if (activePill && barWrap && barWrap.scrollWidth > barWrap.clientWidth) {
        activePill.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
      }

      // Update footer counter
      if (counterCurr) {
        counterCurr.textContent = String(activeIndex + 1).padStart(2, '0');
      }

      // Trigger Lighthouse score gauge when reaching stage 6
      if (activeIndex === 5 && !lighthouseAnimated) {
        animateLighthouseScore();
        lighthouseAnimated = true;
      }
    };

    // Master Pinned ScrollTrigger Timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pinnedStage,
        pin: true,
        start: 'top top',
        end: '+=600%',
        scrub: 0.6,
        anticipatePin: 1,
        snap: {
          snapTo: (value) => Math.round(value * 5) / 5,
          duration: { min: 0.25, max: 0.45 },
          ease: 'power1.inOut'
        },
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          updateStageUI(self.progress);
        }
      }
    });

    // Build crossfade + slight horizontal slide timeline
    // 5 stage transitions with comfortable reading pause between them
    for (let i = 0; i < slides.length - 1; i++) {
      const currentSlide = slides[i];
      const nextSlide = slides[i + 1];

      tl.to(currentSlide, {
        autoAlpha: 0,
        x: -24,
        duration: 0.5,
        ease: 'power2.inOut'
      })
      .fromTo(
        nextSlide,
        { autoAlpha: 0, x: 24 },
        { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power2.inOut' },
        '<0.1'
      );

      // Settling hold before next transition starts
      if (i < slides.length - 2) {
        tl.to({}, { duration: 0.4 });
      }
    }

    // Interactive Stage Scrubber Pill Click Handlers
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const targetIdx = parseInt(pill.getAttribute('data-stage'), 10);
        if (isNaN(targetIdx)) return;

        const totalTransitions = slides.length - 1;
        const targetProgress = targetIdx / totalTransitions;
        const st = tl.scrollTrigger;
        if (st) {
          const targetScroll = st.start + targetProgress * (st.end - st.start);
          window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          });
        }
      });
    });

    // Cursor Spotlight inside Stage Viewport
    if (viewport) {
      viewport.addEventListener('mousemove', (e) => {
        const rect = viewport.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        viewport.style.setProperty('--mouse-x', `${x}px`);
        viewport.style.setProperty('--mouse-y', `${y}px`);
      });
    }

    return () => {
      if (tl) tl.kill();
    };
  });

  // 2. MOBILE VERTICAL LIST & STICKY CHIP ROW (< 768px)
  mm.add('(max-width: 767px)', () => {
    // Reveal all slides statically
    slides.forEach((slide) => {
      gsap.set(slide, { autoAlpha: 1, x: 0, clearProps: 'transform' });
    });

    // Update active pill on scroll as each slide enters viewport
    slides.forEach((slide, idx) => {
      ScrollTrigger.create({
        trigger: slide,
        start: 'top 65%',
        end: 'bottom 35%',
        onEnter: () => setMobileActiveStage(idx),
        onEnterBack: () => setMobileActiveStage(idx)
      });
    });

    function setMobileActiveStage(activeIndex) {
      pills.forEach((pill, idx) => {
        const isActive = idx === activeIndex;
        const isCompleted = idx < activeIndex;

        pill.classList.toggle('active', isActive);
        pill.classList.toggle('completed', isCompleted);
        pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      // Update progress line on mobile
      if (progressFill) {
        progressFill.style.width = `${(activeIndex / (slides.length - 1)) * 100}%`;
      }
      if (progressDot) {
        progressDot.style.left = `${(activeIndex / (slides.length - 1)) * 100}%`;
      }

      // Auto-center pill in horizontal bar
      const activePill = pills[activeIndex];
      if (activePill && barWrap) {
        activePill.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
      }
    }

    // Clicking pill on mobile smoothly scrolls to that stage
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const targetIdx = parseInt(pill.getAttribute('data-stage'), 10);
        if (isNaN(targetIdx) || !slides[targetIdx]) return;
        const targetSlide = slides[targetIdx];
        const offset = 140; // Navbar + sticky chip bar offset
        const topPos = targetSlide.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: topPos, behavior: 'smooth' });
      });
    });

    // Animate lighthouse gauge on mobile when reached
    const perfStage = document.querySelector('.visual-perf');
    if (perfStage) {
      ScrollTrigger.create({
        trigger: perfStage,
        start: 'top 75%',
        onEnter: () => {
          if (!lighthouseAnimated) {
            animateLighthouseScore();
            lighthouseAnimated = true;
          }
        },
        once: true
      });
    }
  });

  // 3. LIGHTHOUSE GAUGE SCORE ANIMATION
  function animateLighthouseScore() {
    const scoreVal = document.getElementById('lighthouse-score-val');
    const gaugeFill = document.getElementById('lighthouse-gauge-fill');
    if (!scoreVal || !gaugeFill) return;

    // Circumference for r=42 is 2 * PI * 42 = 263.89
    const circumference = 264;
    // 99% score => strokeDashoffset = 264 * (1 - 0.99) = ~2.64
    gsap.fromTo(
      gaugeFill,
      { strokeDashoffset: circumference },
      { strokeDashoffset: 2.6, duration: 1.6, ease: 'power2.out' }
    );

    const counter = { val: 70 };
    gsap.to(counter, {
      val: 99,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => {
        scoreVal.textContent = Math.round(counter.val);
      }
    });
  }

  // 4. TOOLBELT MARQUEE HOVER PAUSE
  const marqueeTracks = document.querySelectorAll('.toolbelt-track');
  marqueeTracks.forEach((trackEl) => {
    trackEl.addEventListener('mouseenter', () => {
      trackEl.style.animationPlayState = 'paused';
    });
    trackEl.addEventListener('mouseleave', () => {
      trackEl.style.animationPlayState = 'running';
    });
  });

  // 5. REFRESH SCROLLTRIGGER AFTER FONTS & IMAGES LOAD
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
    });
  }

  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });

  // Debounced resize refresh
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);
  });
}
