/**
 * VIKRAM.DEV — Education & Certifications Controller
 * Renders verified credentials and ongoing learning roadmap from a single data source,
 * implements dynamic cursor-following spotlight lighting, GSAP scroll-triggered
 * timeline progression, accessible lightbox for certificate verification,
 * and semantic markup with full reduced-motion & keyboard compliance.
 */

// ============================================================================
// EDUCATION & CREDENTIALS DATA
// Edit this array to add, update, or remove credentials.
// ============================================================================
export const EDUCATION_DATA = [
  {
    id: 'bsc',
    type: "BACHELOR'S DEGREE",
    title: 'B.Sc Computer Science',
    institution: 'Government Arts & Science College',
    affiliation: 'Bharathidasan University',
    start: 2017,
    end: 2020,
    ghostYear: '2020',
    icon: 'degree',
    description: 'Core foundations in algorithms, data structures, relational databases (RDBMS) and software engineering.',
    relevance: 'Why it matters to you: solid database and logic fundamentals behind the custom plugins and queries I write.',
    skills: ['Data Structures', 'Algorithms', 'RDBMS', 'Software Engineering'],
    credentialUrl: '',
    certificateImage: ''
  },
  {
    id: 'java',
    type: 'TRAINING CERTIFICATE',
    title: 'Java Full Stack Training',
    institution: 'Besant Technologies',
    affiliation: 'Professional training program',
    start: 2023,
    end: 2024,
    ghostYear: '2024',
    icon: 'certificate',
    description: 'Hands-on full-stack training covering object-oriented Java, Spring fundamentals, REST services and modern frontend frameworks.',
    relevance: 'Why it matters to you: backend and API skills that carry into the integrations and custom web apps I build.',
    skills: ['Java', 'Spring', 'REST APIs', 'Frontend Frameworks'],
    credentialUrl: '',
    certificateImage: ''
  }
];

export const ONGOING_LEARNING_DATA = {
  id: 'learning',
  type: 'ONGOING',
  title: 'Currently Learning & Exploring',
  tagline: 'I keep building skills alongside client work.',
  skills: [
    'MCP Servers',
    'LLM Tool Workflows',
    'Custom Gutenberg Blocks',
    'Headless WordPress',
    'Next.js & Go (custom CMS)'
  ]
};

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getDuration(start, end) {
  const diff = Math.max(1, end - start);
  return `${diff} ${diff === 1 ? 'year' : 'years'}`;
}

function renderIcon(iconType) {
  if (iconType === 'degree') {
    return `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    `;
  }
  // Default: certificate / award
  return `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="7"/>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>
  `;
}

/**
 * Builds the complete semantic markup for the Education section
 */
export function buildEducationHTML() {
  return `
    <div class="education-timeline-container" id="education-timeline-container">
      <!-- Continuous Timeline Rail -->
      <div class="education-rail-track" aria-hidden="true">
        <div class="education-rail-line" id="education-rail-line"></div>
      </div>

      <!-- Credentials Ordered Timeline List -->
      <ol class="education-cards-grid" role="list">
        ${EDUCATION_DATA.map((item, index) => {
          const relevanceClean = item.relevance.replace(/^Why it matters to you:\s*/i, '');
          const durationText = getDuration(item.start, item.end);

          return `
            <li class="education-item" id="edu-item-${item.id}">
              <!-- Timeline Year Node Pin -->
              <div class="edu-timeline-node" aria-hidden="true">
                <span class="edu-node-glow"></span>
                <span class="edu-node-pulse"></span>
                <span class="edu-node-dot"></span>
                <span class="edu-node-year" data-anim="scramble">${item.start} – ${item.end}</span>
              </div>

              <article class="edu-card spotlight-card reveal-suspense" data-edu-id="${item.id}">
                <!-- Ghost Year Numeral -->
                <span class="edu-ghost-year" aria-hidden="true">${escapeHtml(item.ghostYear || String(item.end))}</span>

                <!-- Card Header: Halo Icon + Badges -->
                <div class="edu-card-top">
                  <div class="edu-icon-wrap" aria-hidden="true">
                    <div class="edu-halo-ring"></div>
                    ${renderIcon(item.icon)}
                  </div>
                  <div class="edu-meta-badges">
                    <span class="edu-type-chip">${escapeHtml(item.type)}</span>
                    <span class="edu-duration-chip">${escapeHtml(durationText)}</span>
                  </div>
                </div>

                <!-- Title & Institutions with Semantic Time Elements -->
                <div class="edu-card-heading">
                  <h3 class="edu-card-title" data-anim="lines">${escapeHtml(item.title)}</h3>
                  <div class="edu-institution-row">
                    <span class="edu-institution">${escapeHtml(item.institution)}</span>
                    <span class="edu-sep" aria-hidden="true">•</span>
                    <span class="edu-affiliation">${escapeHtml(item.affiliation)}</span>
                  </div>
                  <div class="edu-time-range">
                    <time datetime="${item.start}" class="edu-time">${item.start}</time>
                    <span class="edu-time-sep" aria-hidden="true">–</span>
                    <time datetime="${item.end}" class="edu-time">${item.end}</time>
                  </div>
                </div>

                <!-- Description -->
                <p class="edu-description" data-anim="words">
                  ${escapeHtml(item.description)}
                </p>

                <!-- Relevance Callout: Why it matters to you -->
                <div class="edu-relevance-box" data-anim-stagger>
                  <span class="edu-relevance-label">WHY IT MATTERS TO YOU</span>
                  <p class="edu-relevance-text">${escapeHtml(relevanceClean)}</p>
                </div>

                <!-- Core Skills -->
                <div class="edu-skills-wrap" data-anim-stagger aria-label="Core competencies">
                  ${item.skills.map(skill => `<span class="edu-skill-chip">${escapeHtml(skill)}</span>`).join('')}
                </div>

                <!-- Optional Verification Link & Certificate Lightbox Thumbnail -->
                ${(item.credentialUrl || item.certificateImage) ? `
                  <div class="edu-card-footer">
                    ${item.credentialUrl ? `
                      <a
                        href="${escapeHtml(item.credentialUrl)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="edu-verify-link"
                        aria-label="Verify credential for ${escapeHtml(item.title)} (opens in a new tab)"
                      >
                        <span>Verify credential</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15 3 21 3 21 9"/>
                          <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </a>
                    ` : ''}

                    ${item.certificateImage ? `
                      <button
                        type="button"
                        class="edu-thumbnail-btn"
                        data-certificate-src="${escapeHtml(item.certificateImage)}"
                        data-certificate-title="${escapeHtml(item.title)}"
                        aria-label="View full certificate for ${escapeHtml(item.title)}"
                      >
                        <img src="${escapeHtml(item.certificateImage)}" alt="Certificate preview for ${escapeHtml(item.title)}" class="edu-thumb-img" loading="lazy" />
                        <span class="edu-thumb-overlay" aria-hidden="true">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            <line x1="11" y1="8" x2="11" y2="14"/>
                            <line x1="8" y1="11" x2="14" y2="11"/>
                          </svg>
                        </span>
                      </button>
                    ` : ''}
                  </div>
                ` : ''}
              </article>
            </li>
          `;
        }).join('')}
      </ol>

      <!-- Full-Width "Currently Learning" Card -->
      <div class="education-ongoing-wrap">
        <article class="edu-card edu-card--ongoing spotlight-card reveal-suspense" data-edu-id="ongoing-learning">
          <div class="edu-ongoing-inner">
            <div class="edu-ongoing-header">
              <div class="edu-ongoing-badge">
                <span class="pulsar-dot-copper" aria-hidden="true"></span>
                <span class="edu-type-chip">${escapeHtml(ONGOING_LEARNING_DATA.type)}</span>
              </div>
              <h3 class="edu-ongoing-title">${escapeHtml(ONGOING_LEARNING_DATA.title)}</h3>
              <p class="edu-ongoing-tagline">${escapeHtml(ONGOING_LEARNING_DATA.tagline)}</p>
            </div>
            <div class="edu-ongoing-chips" data-anim-stagger aria-label="Currently exploring technologies">
              ${ONGOING_LEARNING_DATA.skills.map(skill => `<span class="edu-chip-ongoing">${escapeHtml(skill)}</span>`).join('')}
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- Certificate Lightbox Modal (Accessible Dialog) -->
    <div id="edu-lightbox-modal" class="edu-lightbox-modal" role="dialog" aria-modal="true" aria-hidden="true" hidden>
      <div class="edu-lightbox-backdrop" id="edu-lightbox-backdrop"></div>
      <div class="edu-lightbox-dialog">
        <button type="button" class="edu-lightbox-close-btn" id="edu-lightbox-close" aria-label="Close certificate preview">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div class="edu-lightbox-body">
          <img src="" alt="" id="edu-lightbox-img" class="edu-lightbox-img" />
          <div id="edu-lightbox-caption" class="edu-lightbox-caption"></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Initializes the Education section interactions
 */
export function initEducation() {
  const root = document.getElementById('education-root');
  if (!root) return;

  // Mount dynamic markup
  root.innerHTML = buildEducationHTML();

  const container = document.getElementById('education-timeline-container');
  const railLine = document.getElementById('education-rail-line');
  const cards = Array.from(root.querySelectorAll('.edu-card'));
  const nodes = Array.from(root.querySelectorAll('.edu-timeline-node'));

  // 1. Pointer-following soft copper spotlight (--mx, --my)
  if (!prefersReducedMotion() && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    cards.forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', `${x.toFixed(1)}%`);
        card.style.setProperty('--my', `${y.toFixed(1)}%`);
      });

      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', '50%');
      });
    });
  }

  // 2. Timeline Rail Scroll Animation (scaleY from 0 to 1) & Node Sequence
  if (!prefersReducedMotion() && container) {
    if (railLine) {
      gsap.fromTo(railLine,
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          ease: 'power2.out',
          duration: 1.2,
          scrollTrigger: {
            trigger: container,
            start: 'top 80%',
            end: 'bottom 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    if (nodes.length) {
      gsap.fromTo(nodes,
        { scale: 0.6, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          stagger: 0.2,
          ease: 'back.out(2)',
          scrollTrigger: {
            trigger: container,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }
  }

  // 3. Certificate Lightbox Modal Handling
  const modal = document.getElementById('edu-lightbox-modal');
  const backdrop = document.getElementById('edu-lightbox-backdrop');
  const closeBtn = document.getElementById('edu-lightbox-close');
  const modalImg = document.getElementById('edu-lightbox-img');
  const modalCaption = document.getElementById('edu-lightbox-caption');
  let lastActiveElement = null;

  function openLightbox(src, title) {
    if (!modal || !modalImg) return;
    lastActiveElement = document.activeElement;
    modalImg.src = src;
    modalImg.alt = `Certificate for ${title}`;
    if (modalCaption) modalCaption.textContent = title;

    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Focus close button
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    if (!modal || modal.hidden) return;
    modal.classList.remove('is-open');
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    if (modalImg) modalImg.src = '';
    document.body.style.overflow = '';

    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  }

  // Bind thumbnails
  const thumbBtns = root.querySelectorAll('.edu-thumbnail-btn');
  thumbBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const src = btn.getAttribute('data-certificate-src');
      const title = btn.getAttribute('data-certificate-title') || 'Certificate';
      if (src) openLightbox(src, title);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (backdrop) backdrop.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) {
      closeLightbox();
    }
  });
}
