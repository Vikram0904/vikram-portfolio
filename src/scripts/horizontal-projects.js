/**
 * VIKRAM.DEV — 3D Cinematic Showcase Engine (Apple / AigentX Style)
 *
 * Displays exactly ONE project in the center focal plane at a time.
 * Transitions between projects using a high-end 3D dimensional portal effect:
 * - Depth translation (z-axis), subtle 3D y-rotation, optical blur, and opacity
 * - Hold phases ensure the user can read each project cleanly while scrolling
 * - Precise 1-project per click navigation (Prev / Next & 4-Phase Segmented Stepper)
 * - Atmospheric floating copper embers canvas background
 * - Full case study deep-dive modal support
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { caseStudiesData } from './case-studies-data.js';

gsap.registerPlugin(ScrollTrigger);

// Domain mapping for browser chrome mockups
const projectDomains = {
  'machine-knitters-guild': 'https://machineknittersguild.org',
  '360-web-designs': 'https://360webdesigns.com/portfolio-explorer',
  'momwgn': 'https://momwgn.com/dispatch-os',
  'aastral-insights': 'https://aastralinsights.io/ephemeris-lms'
};

export function initHorizontalProjects() {
  const section = document.getElementById('projects');
  if (!section) return;

  const stage = section.querySelector('.projects-pinned-stage');
  const track = document.getElementById('projects-track');
  const embersCanvas = document.getElementById('projects-embers-canvas');
  const currNumEl = section.querySelector('.curr-proj-num');
  const totalNumEl = section.querySelector('.total-proj-num');
  const prevBtn = document.getElementById('proj-btn-prev');
  const nextBtn = document.getElementById('proj-btn-next');
  const segmentBtns = Array.from(section.querySelectorAll('.proj-segment-pill'));

  if (!track) return;

  const totalProjects = caseStudiesData.length;
  if (totalNumEl) {
    totalNumEl.textContent = `/ ${String(totalProjects).padStart(2, '0')}`;
  }

  // 1. RENDER 3D PROJECT SLIDES (Single-Project Focused Layout)
  track.innerHTML = caseStudiesData.map((project, idx) => {
    const domain = projectDomains[project.id] || `https://${project.id}.dev`;
    return `
      <article class="project-slide ${idx === 0 ? 'is-active' : ''}" data-index="${idx}" data-project-id="${project.id}">
        <!-- Inner Card Glassmorphic Frame with 3D Depth & Specular Sheen -->
        <div class="project-card-inner">
          <!-- LEFT COLUMN: Interactive Device Chrome & High-Impact Visual -->
          <div class="project-slide-visual">
            <!-- Browser Chrome Header Bar -->
            <div class="browser-chrome-bar" aria-hidden="true">
              <div class="traffic-lights">
                <span class="light red"></span>
                <span class="light yellow"></span>
                <span class="light green"></span>
              </div>
              <div class="browser-url-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span class="url-text">${domain}</span>
              </div>
              <div class="browser-status-badge">
                <span class="status-dot"></span>
                <span>PRODUCTION DEPLOYED</span>
              </div>
            </div>

            <!-- Preview Image Viewport with 3D Parallax & Glare -->
            <div class="project-preview-viewport" data-cursor="view">
              <img src="${project.image}" alt="${project.title} - ${project.tagline}" class="project-slide-img" loading="lazy" />
              <div class="project-preview-gradient"></div>
              <span class="project-category-badge">${project.category}</span>
            </div>

            <!-- Performance Metrics Ribbon Across Base -->
            <div class="project-metrics-ribbon">
              ${project.metrics.map(m => `
                <div class="metric-pill-item">
                  <span class="metric-val">${m.value}</span>
                  <span class="metric-lbl">${m.label}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- RIGHT COLUMN: Deep Architecture Specs & Engineered Solutions -->
          <div class="project-slide-content">
            <div class="slide-header-meta">
              <span class="project-num-tag">// ${project.number}</span>
              <span class="project-category-inline">${project.category}</span>
            </div>

            <h3 class="project-slide-title">${project.title}</h3>
            <p class="project-slide-tagline">${project.tagline}</p>
            <p class="project-slide-synopsis">${project.synopsis}</p>

            <!-- Telemetry Architecture Breakdown: Challenge & Engineered Solution -->
            <div class="project-arch-telemetry">
              <div class="telemetry-card challenge">
                <div class="telemetry-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>CHALLENGE</span>
                </div>
                <p class="telemetry-text">${project.problem.length > 130 ? project.problem.substring(0, 125) + '...' : project.problem}</p>
              </div>

              <div class="telemetry-card solution">
                <div class="telemetry-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>SOLUTION</span>
                </div>
                <p class="telemetry-text">${project.solution.length > 130 ? project.solution.substring(0, 125) + '...' : project.solution}</p>
              </div>
            </div>

            <!-- Tech Stack Badges -->
            <div class="project-tech-ribbon">
              ${project.techStack.map(t => `<span class="tech-chip">${t}</span>`).join('')}
            </div>

            <!-- Action Button -->
            <div class="project-slide-actions">
              <button class="btn-open-case interactive-el btn-magnetic" data-open-project="${project.id}">
                <span>EXPLORE DEEP DIVE &amp; CODE</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // 2. INITIALIZE ATMOSPHERIC COPPER EMBERS CANVAS
  initEmbersCanvas(embersCanvas, section);

  const slides = Array.from(track.querySelectorAll('.project-slide'));
  let activeIndex = 0;
  let isNavigating = false;

  // 3. HUD STATE SYNCHRONIZATION
  function updateHUD(idx) {
    if (idx < 0 || idx >= totalProjects) return;
    activeIndex = idx;

    // Update Counter
    if (currNumEl) {
      currNumEl.textContent = String(idx + 1).padStart(2, '0');
    }

    // Update 4-Phase Segment Stepper
    segmentBtns.forEach((btn, bIdx) => {
      if (bIdx === idx) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    // Update Prev / Next button visual states
    if (prevBtn) {
      prevBtn.style.opacity = idx === 0 ? '0.35' : '1';
      prevBtn.style.pointerEvents = idx === 0 ? 'none' : 'auto';
    }
    if (nextBtn) {
      nextBtn.style.opacity = idx === totalProjects - 1 ? '0.35' : '1';
      nextBtn.style.pointerEvents = idx === totalProjects - 1 ? 'none' : 'auto';
    }

    // Update Active CSS Class on Slides
    slides.forEach((slide, sIdx) => {
      if (sIdx === idx) {
        slide.classList.add('is-active');
        slide.style.pointerEvents = 'auto';
      } else {
        slide.classList.remove('is-active');
        slide.style.pointerEvents = 'none';
      }
    });
  }

  // 4. GSAP MATCHMEDIA FOR DESKTOP (CINEMATIC 3D DIMENSIONAL PORTAL TRANSITION)
  const mm = gsap.matchMedia();

  mm.add('(min-width: 992px)', () => {
    // Set initial 3D positions: Slide 0 is in focus, slides 1..3 wait in background 3D depth
    slides.forEach((slide, i) => {
      if (i === 0) {
        gsap.set(slide, {
          opacity: 1,
          x: 0,
          y: 0,
          z: 0,
          scale: 1,
          rotateY: 0,
          filter: 'blur(0px)',
          pointerEvents: 'auto'
        });
      } else {
        gsap.set(slide, {
          opacity: 0,
          x: 140,
          y: 0,
          z: -250,
          scale: 0.88,
          rotateY: 16,
          filter: 'blur(10px)',
          pointerEvents: 'none'
        });
      }
    });

    // Build the master timeline with explicit reading HOLDS and seamless 3D TRANSITIONS
    const totalTransitions = totalProjects - 1;
    const holdDuration = 0.8;
    const transitionDuration = 1.2;
    const totalStepDuration = holdDuration + transitionDuration;

    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${totalTransitions * window.innerHeight * 1.25}`,
        pin: stage,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        scrub: 0.8,
        snap: {
          snapTo: 1 / totalTransitions,
          duration: { min: 0.25, max: 0.55 },
          ease: 'power2.inOut'
        },
        onUpdate: (self) => {
          const progress = self.progress;
          const idx = Math.min(
            totalProjects - 1,
            Math.round(progress * totalTransitions)
          );
          updateHUD(idx);
        }
      }
    });

    for (let i = 0; i < totalTransitions; i++) {
      const currentSlide = slides[i];
      const nextSlide = slides[i + 1];

      // 1. Reading hold phase on current project
      masterTl.to({}, { duration: holdDuration });

      // 2. Cinematic 3D Portal Transition between Slide i and Slide i+1
      // Current slide glides into distance with 3D tilt and optical blur
      masterTl.to(currentSlide, {
        opacity: 0,
        x: -140,
        z: -250,
        scale: 0.88,
        rotateY: -16,
        filter: 'blur(10px)',
        pointerEvents: 'none',
        duration: transitionDuration,
        ease: 'power2.inOut'
      });

      // Next slide sweeps forward from 3D depth into crisp center focal plane
      masterTl.fromTo(nextSlide,
        {
          opacity: 0,
          x: 140,
          z: -250,
          scale: 0.88,
          rotateY: 16,
          filter: 'blur(10px)',
          pointerEvents: 'none'
        },
        {
          opacity: 1,
          x: 0,
          z: 0,
          scale: 1,
          rotateY: 0,
          filter: 'blur(0px)',
          pointerEvents: 'auto',
          duration: transitionDuration,
          ease: 'power2.inOut'
        },
        `<` // Runs simultaneously for a cinematic camera pass
      );
    }

    // Final hold phase on the last project
    masterTl.to({}, { duration: holdDuration });

    // Precise 1-Project Navigation Function
    function goToSlide(targetIdx) {
      const st = masterTl.scrollTrigger;
      if (!st) return;
      const targetProgress = targetIdx / totalTransitions;
      const targetScroll = st.start + targetProgress * (st.end - st.start);
      isNavigating = true;

      if (window.lenis) {
        window.lenis.scrollTo(targetScroll);
      } else {
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }

      setTimeout(() => {
        isNavigating = false;
        updateHUD(targetIdx);
      }, 550);
    }

    // Prev / Next Buttons: EXACTLY 1 Project Step per Click
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const prevIdx = Math.max(0, activeIndex - 1);
        goToSlide(prevIdx);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const nextIdx = Math.min(totalProjects - 1, activeIndex + 1);
        goToSlide(nextIdx);
      });
    }

    // Segment Stepper Pills: Click to Jump to Any Project
    segmentBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetIdx = parseInt(btn.getAttribute('data-index'), 10);
        if (!isNaN(targetIdx)) {
          goToSlide(targetIdx);
        }
      });
    });

    // Interactive 3D Card Parallax Tilt on Cursor Hover
    slides.forEach((slide) => {
      const card = slide.querySelector('.project-card-inner');
      const img = slide.querySelector('.project-slide-img');
      if (!card || !img) return;

      card.addEventListener('mousemove', (e) => {
        if (!slide.classList.contains('is-active')) return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(card, {
          rotateY: x * 6,
          rotateX: -y * 6,
          transformPerspective: 1400,
          duration: 0.35,
          ease: 'power2.out'
        });

        gsap.to(img, {
          x: x * 12,
          y: y * 12,
          scale: 1.04,
          duration: 0.35,
          ease: 'power2.out'
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.6,
          ease: 'power2.out'
        });

        gsap.to(img, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out'
        });
      });
    });

    // Initialize HUD on load
    updateHUD(0);

    return () => {
      masterTl.kill();
    };
  });

  // 5. MOBILE & TABLET HORIZONTAL SWIPE CAROUSEL (< 992px)
  mm.add('(max-width: 991px)', () => {
    function scrollToSlide(idx) {
      const slide = slides[idx];
      if (!slide) return;
      track.scrollTo({
        left: slide.offsetLeft - 16,
        behavior: 'smooth'
      });
      updateHUD(idx);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        scrollToSlide(Math.max(0, activeIndex - 1));
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        scrollToSlide(Math.min(totalProjects - 1, activeIndex + 1));
      });
    }

    segmentBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetIdx = parseInt(btn.getAttribute('data-index'), 10);
        if (!isNaN(targetIdx)) {
          scrollToSlide(targetIdx);
        }
      });
    });

    // Listen to horizontal scroll on track to update HUD
    let scrollTimeout = null;
    track.addEventListener('scroll', () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollLeft = track.scrollLeft;
        const slideWidth = slides[0]?.offsetWidth || window.innerWidth;
        const current = Math.min(totalProjects - 1, Math.round(scrollLeft / slideWidth));
        updateHUD(current);
      }, 50);
    }, { passive: true });

    updateHUD(0);
  });

  // 6. KEYBOARD ARROWS NAVIGATION
  window.addEventListener('keydown', (e) => {
    const rect = section.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.3;
    if (!inView) return;

    if (e.key === 'ArrowRight') {
      if (nextBtn && nextBtn.style.pointerEvents !== 'none') nextBtn.click();
    } else if (e.key === 'ArrowLeft') {
      if (prevBtn && prevBtn.style.pointerEvents !== 'none') prevBtn.click();
    }
  });
}

/**
 * Atmospheric Floating Copper Embers Particle System (Image 2 Signature Effect)
 * Renders glowing sparks and floating embers that rise gently with atmospheric wind.
 */
function initEmbersCanvas(canvas, container) {
  if (!canvas || !container) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let rafId = null;
  let isVisible = true;

  const PARTICLE_COUNT = 45;
  const particles = [];
  const colors = [
    '255, 107, 53',  // Signature brand copper (#FF6B35)
    '255, 138, 72',  // Radiant amber
    '255, 180, 90',  // Warm gold
    '255, 80, 20'    // Deep crimson spark
  ];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.parentElement.offsetWidth || window.innerWidth;
    height = canvas.parentElement.offsetHeight || window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createParticle() {
    return {
      x: Math.random() * width,
      y: height + Math.random() * 40,
      size: 1.2 + Math.random() * 2.6,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -(0.5 + Math.random() * 1.2),
      alpha: 0.1 + Math.random() * 0.8,
      maxAlpha: 0.4 + Math.random() * 0.6,
      fadeRate: 0.003 + Math.random() * 0.008,
      color: colors[Math.floor(Math.random() * colors.length)],
      phase: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03
    };
  }

  resize();
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = createParticle();
    p.y = Math.random() * height;
    particles.push(p);
  }

  window.addEventListener('resize', resize, { passive: true });

  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
    if (isVisible && !rafId) {
      rafId = requestAnimationFrame(render);
    }
  }, { threshold: 0.05 });
  observer.observe(container);

  function render() {
    if (!isVisible) {
      rafId = null;
      return;
    }

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.phase += p.wobbleSpeed;
      p.x += p.vx + Math.sin(p.phase) * 0.4;
      p.y += p.vy;

      const pulse = 0.85 + 0.15 * Math.sin(p.phase * 2);
      const currentAlpha = p.alpha * pulse;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${currentAlpha})`;
      ctx.shadowColor = `rgba(${p.color}, 0.8)`;
      ctx.shadowBlur = p.size * 5;
      ctx.fill();

      if (p.y < -20 || p.x < -30 || p.x > width + 30) {
        particles[i] = createParticle();
      }
    }

    ctx.shadowBlur = 0;
    rafId = requestAnimationFrame(render);
  }

  rafId = requestAnimationFrame(render);
}
