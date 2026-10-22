/**
 * VIKRAM.DEV — Interactive Skills Matrix Component
 */
import { skillsData } from './skills-data.js';
import { gsap } from 'gsap';
import { initCardTiltAndSpotlights } from './3d-interactions.js';

export function initSkillsMatrix() {
  const container = document.getElementById('skills-matrix-container');
  const filterBtns = document.querySelectorAll('.skill-pill-btn');
  const searchInput = document.getElementById('skills-search');

  if (!container) return;

  let activeCategory = 'all';
  let searchQuery = '';

  function renderSkills(animate = true) {
    const filtered = skillsData.filter((skill) => {
      const matchCat = activeCategory === 'all' || skill.category === activeCategory;
      const matchSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          skill.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          skill.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
          <p style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.9rem;">No matching technologies found for "${searchQuery}".</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map((skill) => `
      <div class="skill-card is-revealed spotlight-card" data-category="${skill.category}">
        <div class="skill-card-top">
          <span class="skill-category-tag tag-${skill.category}">${skill.categoryLabel}</span>
          <span class="skill-level-badge">${skill.level}%</span>
        </div>
        <h4 class="skill-name">${skill.name}</h4>
        <p class="skill-desc">${skill.desc}</p>
        <div class="skill-bar-wrap">
          <div class="skill-bar-info">
            <span>PROFICIENCY</span>
            <span class="skill-readiness-tag">● PRODUCTION READY</span>
          </div>
          <div class="skill-bar-track">
            <div class="skill-bar-fill" style="transform: scaleX(${skill.level / 100});">
              <span class="energy-glow-head"></span>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Re-bind 3D tilt & dynamic spotlight to newly created cards
    initCardTiltAndSpotlights();

    // 3D Staggered Cascade Entrance Animation
    if (animate) {
      const cards = container.querySelectorAll('.skill-card');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 22, rotateX: 20, scale: 0.96 },
        { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 0.45, stagger: 0.035, ease: 'power2.out' }
      );
    }
  }

  // Filter Buttons
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-filter') || 'all';
      renderSkills();
    });
  });

  // Search Input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderSkills();
    });
  }

  // Initial render
  renderSkills();
}
