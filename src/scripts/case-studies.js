/**
 * VIKRAM.DEV — Case Studies & Deep-Dive Modal Drawer Component
 */
import { caseStudiesData } from './case-studies-data.js';

export function initCaseStudies() {
  const modalOverlay = document.getElementById('case-modal-overlay');
  const modalContent = document.getElementById('case-modal-content');
  const modalCloseBtn = document.getElementById('case-modal-close');

  if (!modalOverlay || !modalContent) return;

  // Open Modal Handler
  function openModal(projectId) {
    const project = caseStudiesData.find(p => p.id === projectId);
    if (!project) return;

    modalContent.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <span style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 800; color: var(--copper); letter-spacing: 0.1em;">${project.number} • ${project.category}</span>
        <h2 style="font-family: var(--font-display); font-size: clamp(1.8rem, 3.5vw, 2.6rem); font-weight: 800; color: var(--text-primary); margin: 0.5rem 0;">${project.title}</h2>
        <p style="font-size: 1.1rem; color: var(--copper-light); font-weight: 600;">${project.tagline}</p>
      </div>

      <div style="border-radius: var(--radius-md); overflow: hidden; margin-bottom: 2rem; border: 1px solid var(--border-subtle); max-height: 400px;">
        <img src="${project.image}" alt="${project.title}" style="width: 100%; height: auto; object-fit: cover;" />
      </div>

      <!-- Key Metrics Strip -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2.5rem;">
        ${project.metrics.map(m => `
          <div style="padding: 1.25rem; background: var(--bg-card); border: 1px solid var(--border-copper); border-radius: var(--radius-sm); text-align: center;">
            <div style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 800; color: var(--copper);">${m.value}</div>
            <div style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; margin-top: 0.25rem;">${m.label}</div>
          </div>
        `).join('')}
      </div>

      <!-- Problem & Solution Breakdown -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2.5rem;">
        <div style="padding: 1.5rem; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-md);">
          <h4 style="font-family: var(--font-mono); font-size: 0.85rem; font-weight: 800; color: #EF4444; margin-bottom: 0.75rem; text-transform: uppercase;">⚠️ The Problem &amp; Architecture Bottlenecks</h4>
          <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.7;">${project.problem}</p>
        </div>

        <div style="padding: 1.5rem; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: var(--radius-md);">
          <h4 style="font-family: var(--font-mono); font-size: 0.85rem; font-weight: 800; color: #10B981; margin-bottom: 0.75rem; text-transform: uppercase;">⚡ Vikram's Custom Solution &amp; Engineering</h4>
          <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.7;">${project.solution}</p>
        </div>
      </div>

      <!-- Tech Stack -->
      <div style="margin-bottom: 2rem;">
        <h4 style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.75rem;">Technology Stack &amp; Protocols</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${project.techStack.map(t => `<span class="tech-tag" style="padding: 5px 12px; font-size: 0.8rem; background: var(--bg-elevated); border-color: var(--border-copper); color: var(--text-primary); font-weight: 600;">${t}</span>`).join('')}
        </div>
      </div>

      <!-- Production Code Snippet -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h4 style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: var(--ai-cyan); text-transform: uppercase;">💻 Architecture Snippet (Production Implementation)</h4>
          <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted);">Clean PHP 8.x / ES6</span>
        </div>
        <pre style="background: #080A0F; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid #1E2638; overflow-x: auto; font-family: var(--font-mono); font-size: 0.85rem; color: #E2E8F0; line-height: 1.6;"><code>${escapeHtml(project.codeSnippet)}</code></pre>
      </div>
    `;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Event Listeners for Opening Modal across the entire document
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-project]');
    if (trigger) {
      const id = trigger.getAttribute('data-open-project');
      openModal(id);
    }
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });
}
