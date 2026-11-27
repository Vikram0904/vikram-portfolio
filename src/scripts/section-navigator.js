/**
 * VIKRAM.DEV — Section Interactions & Experience Circuit Engine
 * 
 * Manages section arrival active classes and the Experience timeline circuit trace beam.
 * Floating HUD removed per user design direction.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const SECTIONS_CONFIG = [
  { id: 'hero', index: '01', code: 'SYSTEM_CORE', label: 'Overview' },
  { id: 'about', index: '02', code: 'PHILOSOPHY_TWIN', label: 'About & Video' },
  { id: 'skills', index: '03', code: 'TECH_STACK', label: 'Architecture Stack' },
  { id: 'experience', index: '04', code: 'TIMELINE_LOG', label: 'Experience' },
  { id: 'projects', index: '05', code: 'FEATURED_WORKS', label: 'Works & Case Studies' },
  { id: 'process', index: '06', code: 'DELIVERY_PROTOCOL', label: 'Methodology' },
  { id: 'education', index: '07', code: 'CREDENTIALS_ACAD', label: 'Education & Certs' },
  { id: 'testimonials', index: '08', code: 'VERIFIED_IMPACT', label: 'Client Endorsements' },
  { id: 'contact', index: '09', code: 'COMM_TERMINAL', label: 'Get In Touch' }
];

export function initSectionNavigator() {
  if (typeof window === 'undefined') return;

  // Remove any legacy floating HUD if present
  const existingHud = document.getElementById('section-telemetry-hud');
  if (existingHud && existingHud.parentNode) {
    existingHud.parentNode.removeChild(existingHud);
  }

  // 1. ScrollTrigger observers for section active states
  SECTIONS_CONFIG.forEach((sec, idx) => {
    const el = document.getElementById(sec.id);
    if (!el) return;

    ScrollTrigger.create({
      trigger: el,
      start: 'top 55%',
      end: 'bottom 45%',
      onEnter: () => updateSectionState(idx),
      onEnterBack: () => updateSectionState(idx)
    });
  });

  function updateSectionState(index) {
    SECTIONS_CONFIG.forEach((s, i) => {
      const el = document.getElementById(s.id);
      if (el) {
        el.classList.toggle('is-active-section', i === index);
      }
    });
  }

  // 2. Enhance Experience Timeline with Dynamic Circuit Trace Beam
  enhanceExperienceTimeline();

  // Initial trigger
  updateSectionState(0);
}

/**
 * Experience Timeline Circuit Beam:
 * Scrubs a glowing energy beam along the vertical timeline track,
 * activating timeline dots as the energy pulse reaches each milestone.
 */
function enhanceExperienceTimeline() {
  const timeline = document.querySelector('.experience-timeline');
  if (!timeline) return;

  let line = timeline.querySelector('.timeline-line');
  if (!line) return;

  let fill = line.querySelector('.timeline-energy-fill');
  if (!fill) {
    fill = document.createElement('div');
    fill.className = 'timeline-energy-fill';
    line.appendChild(fill);
  }

  // Scrub the energy fill along the timeline height
  gsap.fromTo(fill, 
    { height: '0%' },
    {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: timeline,
        start: 'top 65%',
        end: 'bottom 70%',
        scrub: 0.3
      }
    }
  );

  // Illuminate each milestone dot when beam arrives
  const items = timeline.querySelectorAll('.timeline-item');
  items.forEach((item) => {
    const dot = item.querySelector('.timeline-dot');
    if (dot) {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 65%',
        onEnter: () => {
          dot.classList.add('is-energized');
          gsap.fromTo(dot, 
            { scale: 0.8, borderColor: 'rgba(255,107,53,0.3)', boxShadow: '0 0 0px #FF6B35' },
            { scale: 1.25, borderColor: '#FF6B35', boxShadow: '0 0 16px #FF6B35', duration: 0.45, ease: 'back.out(2)' }
          );
        },
        onLeaveBack: () => {
          dot.classList.remove('is-energized');
          gsap.to(dot, { scale: 1, borderColor: 'rgba(255,255,255,0.2)', boxShadow: 'none', duration: 0.3 });
        }
      });
    }
  });
}
