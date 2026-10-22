/**
 * VIKRAM.DEV — 3D Stacking Project Card Deck Engine
 * Creates an Awwwards-caliber pinned card stacking sequence for Featured Case Studies,
 * scaling and dimming earlier cards in 3D perspective as successive projects scroll in.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initStackedProjects() {
  const container = document.getElementById('projects-grid-container');
  if (!container) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 992px)', () => {
    const cards = container.querySelectorAll('.project-card');
    if (!cards || cards.length < 2) return;

    // Add stacked card styling class
    container.classList.add('is-stacked-mode');

    cards.forEach((card, index) => {
      // Don't animate the last card's exit
      if (index === cards.length - 1) return;

      const nextCard = cards[index + 1];

      gsap.to(card, {
        scrollTrigger: {
          trigger: nextCard,
          start: 'top 80%',
          end: 'top 20%',
          scrub: true
        },
        scale: 0.94,
        y: -30,
        opacity: 0.55,
        filter: 'brightness(0.6)',
        transformPerspective: 1000,
        ease: 'none'
      });
    });

    // 3D Parallax Tilt on project preview images
    cards.forEach((card) => {
      const img = card.querySelector('.project-preview-img');
      if (!img) return;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        card.style.setProperty('--glare-x', `${mouseX}px`);
        card.style.setProperty('--glare-y', `${mouseY}px`);

        const x = mouseX / rect.width - 0.5;
        const y = mouseY / rect.height - 0.5;

        gsap.to(img, {
          x: x * 20,
          y: y * 20,
          scale: 1.08,
          duration: 0.4,
          ease: 'power2.out'
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(img, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out'
        });
      });
    });
  });
}
