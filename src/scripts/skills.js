/**
 * VIKRAM.DEV — Interactive Skills Matrix Component
 */
import { skillsData } from './skills-data.js';

export function initSkillsMatrix() {
  const container = document.getElementById('skills-matrix-container');
  const filterBtns = document.querySelectorAll('.skill-pill-btn');
  const searchInput = document.getElementById('skills-search');

  if (!container) return;

  let activeCategory = 'all';
  let searchQuery = '';

  function renderSkills() {
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
      <div class="skill-card is-revealed" data-category="${skill.category}">
        <div class="skill-card-top">
          <span class="skill-category-tag tag-${skill.category}">${skill.categoryLabel}</span>
          <span style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: var(--copper);">${skill.level}%</span>
        </div>
        <h4 class="skill-name">${skill.name}</h4>
        <p class="skill-desc">${skill.desc}</p>
        <div class="skill-bar-wrap">
          <div class="skill-bar-info">
            <span>PROFICIENCY</span>
            <span>PRODUCTION READY</span>
          </div>
          <div class="skill-bar-track">
            <div class="skill-bar-fill" style="transform: scaleX(${skill.level / 100});"></div>
          </div>
        </div>
      </div>
    `).join('');
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
