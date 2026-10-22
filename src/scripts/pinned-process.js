/**
 * VIKRAM.DEV — Pinned Process / Methodology Interactive Scroller
 * Implements a full-screen pinned scroll timeline with 3D watermark numerals,
 * laser hairline light-beam dividers, and interactive phase navigation.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initPinnedProcess() {
  const section = document.querySelector('.process-section');
  const stage = document.querySelector('.process-pinned-stage');
  if (!section || !stage) return;

  // Only run pinned full-screen experience on desktop / tablet landscape
  const mm = gsap.matchMedia();

  mm.add('(min-width: 992px)', () => {
    const slides = stage.querySelectorAll('.process-slide');
    const watermark = stage.querySelector('.process-watermark-num');
    const currStepText = stage.querySelector('.curr-step');
    const progressFill = stage.querySelector('.process-progress-fill');
    const tabs = stage.querySelectorAll('.step-tab-btn');
    const laserBeam = stage.querySelector('.laser-hairline-beam');

    if (!slides.length) return;

    // Set initial state
    slides.forEach((slide, idx) => {
      if (idx !== 0) {
        gsap.set(slide, { opacity: 0, y: 50, scale: 0.95, pointerEvents: 'none' });
      } else {
        gsap.set(slide, { opacity: 1, y: 0, scale: 1, pointerEvents: 'auto' });
      }
    });

    // Create scrub timeline
    const totalPhases = slides.length;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: `+=${totalPhases * 60}%`,
        pin: stage,
        scrub: 0.8,
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          // Fill progress bar
          if (progressFill) {
            progressFill.style.width = `${progress * 100}%`;
          }
          // Move laser hairline
          if (laserBeam) {
            laserBeam.style.left = `${progress * 90}%`;
          }

          // Active phase index (0, 1, 2, 3)
          const activeIndex = Math.min(
            totalPhases - 1,
            Math.floor(progress * totalPhases)
          );

          // Update watermark and step numbers
          const stepNumStr = String(activeIndex + 1).padStart(2, '0');
          if (currStepText && currStepText.textContent !== stepNumStr) {
            currStepText.textContent = stepNumStr;
          }

          // Update tabs
          tabs.forEach((tab, tIdx) => {
            if (tIdx === activeIndex) {
              tab.classList.add('active');
            } else {
              tab.classList.remove('active');
            }
          });
        }
      }
    });

    // Build timeline transitions between slides with distinct hold phases
    for (let i = 0; i < totalPhases; i++) {
      // Hold phase: gives the user time to read the current slide while scrolling
      tl.to({}, { duration: 0.8 });

      // If not the last slide, transition to the next slide
      if (i < totalPhases - 1) {
        const current = slides[i];
        const next = slides[i + 1];
        const nextStepNum = String(i + 2).padStart(2, '0');

        tl.to(current, {
          opacity: 0,
          y: -25,
          scale: 0.96,
          pointerEvents: 'none',
          duration: 0.4,
          ease: 'power2.inOut'
        })
        .to(watermark, {
          opacity: 0.04,
          scale: 0.85,
          duration: 0.2,
          onComplete: () => {
            if (watermark) watermark.textContent = nextStepNum;
          }
        }, '<')
        .to(watermark, {
          opacity: 0.2,
          scale: 1,
          duration: 0.2,
          ease: 'power2.out'
        })
        .to(next, {
          opacity: 1,
          y: 0,
          scale: 1,
          pointerEvents: 'auto',
          duration: 0.4,
          ease: 'power2.out'
        }, '-=0.15');
      }
    }

    // Step Tabs Click to Scroll smoothly to exact phase
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const st = tl.scrollTrigger;
        if (!st) return;
        const targetProgress = index / (totalPhases - 1);
        const targetScroll = st.start + targetProgress * (st.end - st.start);
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      });
    });

    return () => {
      tl.kill();
    };
  });
}
