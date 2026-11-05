/**
 * VIKRAM.DEV — 3D Interactions, Cursor Spotlights & Telemetry Engine
 * Implements mouse-tracking 3D perspective tilt, dynamic spotlight borders,
 * live stat counters, and animated timeline energy rails.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function init3DInteractions() {
  initCardTiltAndSpotlights();
  initStatCounters();
  initTimelineEnergyRail();
}

/**
 * 1. 3D Mouse Parallax Tilt & Dynamic Spotlight Lighting
 */
export function initCardTiltAndSpotlights() {
  const cards = document.querySelectorAll(
    '.tilt-card-3d, .stat-card, .skill-card, .edu-card, .testimonial-card, .about-visual-box, .contact-channel-card, .slide-cyber-box'
  );
  if (!cards.length) return;

  cards.forEach((card) => {
    // Add spotlight helper class
    card.classList.add('spotlight-card');

    let bounds = null;

    function onMouseEnter() {
      bounds = card.getBoundingClientRect();
    }

    function onMouseMove(e) {
      if (!bounds) bounds = card.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      // Update spotlight CSS variables for border gradient
      card.style.setProperty('--mouse-x', `${mouseX}px`);
      card.style.setProperty('--mouse-y', `${mouseY}px`);

      // 3D Perspective Rotation
      const xPct = (mouseX / bounds.width) - 0.5;
      const yPct = (mouseY / bounds.height) - 0.5;

      const rotX = -yPct * 10;
      const rotY = xPct * 10;

      gsap.to(card, {
        rotateX: rotX,
        rotateY: rotY,
        transformPerspective: 900,
        ease: 'power2.out',
        duration: 0.35
      });
    }

    function onMouseLeave() {
      bounds = null;
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        ease: 'power2.out',
        duration: 0.6
      });
    }

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);
  });
}

/**
 * 2. Live Metric Telemetry Count-Up
 */
function initStatCounters() {
  const statsWrap = document.querySelector('.about-stats-grid');
  if (!statsWrap) return;

  const statItems = [
    { selector: '.stat-card:nth-child(1) .stat-num', target: 40, suffix: '+', prefix: '' },
    { selector: '.stat-card:nth-child(2) .stat-num', target: 100, suffix: '%', prefix: '' },
    { selector: '.stat-card:nth-child(3) .stat-num', target: 20, suffix: 'ms', prefix: '<' }
  ];

  ScrollTrigger.create({
    trigger: statsWrap,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      statItems.forEach((item) => {
        const el = document.querySelector(item.selector);
        if (!el) return;

        const obj = { val: 0 };
        gsap.to(obj, {
          val: item.target,
          duration: 1.8,
          ease: 'power3.out',
          onUpdate: () => {
            el.innerHTML = `${item.prefix}${Math.round(obj.val)}<span>${item.suffix}</span>`;
          }
        });
      });
    }
  });
}

/**
 * 3. Experience Timeline Luminous Laser Energy Rail
 */
function initTimelineEnergyRail() {
  const timeline = document.querySelector('.experience-timeline');
  if (!timeline) return;

  const line = timeline.querySelector('.timeline-line');
  if (!line) return;

  // Create glowing inner fill if not already present
  let fill = line.querySelector('.timeline-energy-fill');
  if (!fill) {
    fill = document.createElement('div');
    fill.className = 'timeline-energy-fill';
    line.appendChild(fill);
  }

  // ScrollTrigger scrubs the energy rail from top to bottom
  ScrollTrigger.create({
    trigger: timeline,
    start: 'top 75%',
    end: 'bottom 60%',
    scrub: 0.5,
    onUpdate: (self) => {
      const progress = self.progress;
      fill.style.height = `${progress * 100}%`;

      // Activate dots as the laser passes
      const dots = timeline.querySelectorAll('.timeline-dot');
      dots.forEach((dot) => {
        if (progress > 0.15) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }
  });

  // 3D perspective entrance on timeline cards
  const items = timeline.querySelectorAll('.timeline-item');
  items.forEach((item) => {
    const card = item.querySelector('.timeline-card');
    if (!card) return;

    gsap.from(card, {
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
        once: true
      },
      opacity: 0,
      rotateY: -8,
      x: 35,
      transformPerspective: 1000,
      duration: 1,
      ease: 'power3.out'
    });
  });
}
