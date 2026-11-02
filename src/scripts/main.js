/**
 * VIKRAM.DEV — Master Application Orchestrator
 * Integrates Lenis Smooth Scroll, GSAP ScrollTrigger, Three.js WebGL & Interactive UI Modules
 */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { initPreloader } from './preloader.js';
import { initCursor } from './cursor.js';
import { initHeroWebGL } from './webgl-hero.js';
import { initAudioControls } from './audio-feedback.js';
import { initSkillsMatrix } from './skills.js';
import { initCaseStudies } from './case-studies.js';
import { initContactForm } from './contact.js';
import { init3DInteractions } from './3d-interactions.js';
import { initPinnedProcess } from './pinned-process.js';
import { initStackedProjects } from './stacked-projects.js';
import { initHeroVideo } from './hero-video.js';

gsap.registerPlugin(ScrollTrigger);

// Initialize Smooth Scrolling (Lenis)
function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.5,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Smooth scroll to anchors
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          lenis.scrollTo(targetEl, { offset: -60 });

          // Close mobile menu if open
          const mobileDrawer = document.querySelector('.mobile-nav-drawer');
          const mobileBtn = document.querySelector('.mobile-menu-btn');
          if (mobileDrawer && mobileDrawer.classList.contains('open')) {
            mobileDrawer.classList.remove('open');
            mobileBtn?.classList.remove('open');
          }
        }
      }
    });
  });

  return lenis;
}

// Live Karur IST Time Clock
function initKarurClock() {
  const clockEl = document.getElementById('karur-clock');
  if (!clockEl) return;

  function updateTime() {
    const now = new Date();
    // Karur is in IST (UTC +5:30)
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    const timeString = now.toLocaleTimeString('en-US', options);
    clockEl.textContent = `${timeString} IST (Karur, TN)`;
  }

  updateTime();
  setInterval(updateTime, 1000);
}

// GSAP Scroll Animations
function initScrollAnimations() {
  // Reveal suspense elements on scroll
  const suspenseElements = document.querySelectorAll('.reveal-suspense');
  suspenseElements.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => el.classList.add('is-revealed'),
      once: true
    });
  });

  // Header scroll appearance
  const header = document.querySelector('.site-header');
  if (header) {
    ScrollTrigger.create({
      start: 'top -50',
      onUpdate: (self) => {
        if (self.scroll() > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });
  }

  // Active section scrollspy
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 40%',
      end: 'bottom 40%',
      onEnter: () => setActiveLink(section.id),
      onEnterBack: () => setActiveLink(section.id)
    });
  });

  function setActiveLink(id) {
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${id}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}

// Mobile Menu Handler
function initMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const drawer = document.querySelector('.mobile-nav-drawer');
  if (!btn || !drawer) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    drawer.classList.toggle('open');
  });
}

// Back To Top Handler
function initBackToTop(lenis) {
  const btn = document.querySelector('.btn-back-to-top');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

// Application Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  // Initialize non-scrolling UI immediately
  initCursor();
  initKarurClock();
  initSkillsMatrix();
  initCaseStudies();
  initContactForm();
  initAudioControls();
  initHeroVideo();
  initMobileMenu();

  // Run Preloader sequence
  initPreloader(() => {
    // Launch WebGL 3D & GSAP post-preloader
    initHeroWebGL();
    const lenis = initSmoothScroll();
    initScrollAnimations();
    init3DInteractions();
    initPinnedProcess();
    initStackedProjects();
    initBackToTop(lenis);
    setTimeout(() => ScrollTrigger.refresh(), 200);

    // Initial Hero reveal animation
    gsap.from('.hero-badge-wrap, .hero-title, .hero-description, .hero-cta-group, .hero-meta-strip', {
      opacity: 0,
      y: 40,
      duration: 1,
      stagger: 0.12,
      ease: 'power3.out'
    });

    gsap.from('.hero-cyber-card', {
      opacity: 0,
      scale: 0.92,
      duration: 1.2,
      ease: 'power3.out',
      delay: 0.3
    });

    // 3D Mouse Tilt interaction for Hero Card
    initHeroTilt();
  });
});

// Interactive 3D Card Tilt Effect
function initHeroTilt() {
  const card = document.getElementById('hero-tilt-card');
  const wrap = document.querySelector('.hero-visual-wrap');
  if (!card || !wrap) return;

  let bounds;

  function onMouseMove(e) {
    if (!bounds) bounds = wrap.getBoundingClientRect();
    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;
    const xPct = (mouseX / bounds.width - 0.5);
    const yPct = (mouseY / bounds.height - 0.5);

    const rotateY = xPct * 18;
    const rotateX = -yPct * 18;

    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      duration: 0.4,
      ease: 'power2.out'
    });
  }

  function onMouseLeave() {
    bounds = null;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  }

  wrap.addEventListener('mousemove', onMouseMove);
  wrap.addEventListener('mouseleave', onMouseLeave);
}
