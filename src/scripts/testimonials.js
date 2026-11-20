/**
 * VIKRAM.DEV — Client Testimonials & Trust Hub Controller
 * Implements Spotlight + Selector Rail layout on desktop/tablet,
 * Swipe Carousel on mobile, accessible tablist/tabpanel semantics,
 * and intelligent auto-advance with hover/focus/reduced-motion guards.
 */

// ============================================================================
// CLIENT TESTIMONIALS DATA
// Edit this array to add, update, or approve testimonials.
// Only approved items with non-empty quotes will be displayed on the site.
// ============================================================================
export const TESTIMONIALS_DATA = [
  {
    id: 'joannie',
    name: 'Joannie Herzer',
    role: 'Sr. Project Manager',
    company: '360 Web Designs',
    initials: 'JH',
    project: 'CUSTOM SQUARE PAYMENT PLUGIN',
    quote: 'Vikram built a custom Square payment plugin that streamlined membership renewals for our client. His code was clean and well documented, and he delivered quickly.',
    result: 'Simpler annual membership renewals',
    photo: '',
    linkedin: '',
    rating: 5,
    approved: true
  },
  {
    id: 'marcus',
    name: 'Marcus Chen',
    role: 'Creative Director',
    company: '360 Web Designs',
    initials: 'MC',
    project: 'PERFORMANCE & AJAX FILTERING',
    quote: 'Our portfolio site went from a sluggish multi-second load to near-instant filtering. Vikram really understands WordPress internals and caching.',
    result: '',
    photo: '',
    linkedin: '',
    rating: 5,
    approved: true
  },
  {
    id: 'ananya',
    name: 'Ananya Sharma',
    role: 'Founder',
    company: 'Aastral Insights',
    initials: 'AS',
    project: 'VEDIC LMS CALCULATOR',
    quote: 'The custom Vedic LMS calculator Vikram built generates thousands of natal PDF reports flawlessly every month. He understands both the complex logic and the user experience.',
    result: 'Thousands of PDF reports generated monthly',
    photo: '',
    linkedin: '',
    rating: 5,
    approved: true
  },
  {
    id: 'tawnya',
    name: 'Tawnya Toller',
    role: 'Creative Director',
    company: 'Digital Lagoon',
    initials: 'TT',
    project: 'MOMWGN RIDE OS',
    quote: 'Vikram engineered our custom MomWgn dispatch portal and Stripe payment workflows with flawless reliability. His solution replaced costly third-party SaaS tools and handles our daily ride bookings with ease.',
    result: '1,200+ monthly rides handled with zero payment failures',
    photo: '',
    linkedin: '',
    rating: 5,
    approved: true
  }
];

const AUTO_ADVANCE_DURATION = 7000; // 7 seconds

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

function renderStars(rating = 5) {
  const fullStars = Math.min(5, Math.max(1, Math.round(rating)));
  return '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
}

function renderAvatar(item, sizeClass = '') {
  const initials = escapeHtml(item.initials || item.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase());
  if (item.photo) {
    return `
      <div class="testimonial-avatar-ring ${sizeClass}">
        <div class="testimonial-avatar-inner">
          <img src="${escapeHtml(item.photo)}" alt="${escapeHtml(item.name)}" class="testimonial-avatar-img" />
        </div>
      </div>
    `;
  }
  return `
    <div class="testimonial-avatar-ring ${sizeClass}" aria-hidden="true">
      <div class="testimonial-avatar-inner">
        <span>${initials}</span>
      </div>
    </div>
  `;
}

export function initTestimonials() {
  const root = document.getElementById('testimonials-root');
  if (!root) return;

  // Filter approved items with non-empty quotes
  const approvedItems = TESTIMONIALS_DATA.filter(
    (item) => item.approved === true && typeof item.quote === 'string' && item.quote.trim().length > 0
  );

  const total = approvedItems.length;

  // Update rating summary pill in the header
  const ratingPill = document.getElementById('testimonials-rating-pill');
  const ratingText = document.getElementById('testimonials-rating-text');
  if (ratingPill && ratingText) {
    const avg = total > 0
      ? (approvedItems.reduce((acc, item) => acc + (Number(item.rating) || 5), 0) / total).toFixed(1)
      : '5.0';
    const reviewWord = total === 1 ? 'client review' : 'client reviews';
    ratingText.textContent = `${avg} · ${total} ${reviewWord}`;
    ratingPill.setAttribute('aria-label', `${avg} out of 5 stars based on ${total} ${reviewWord}`);
  }

  // If no approved items, keep fallback visible or clear
  if (total === 0) return;

  let activeIndex = 0;
  let isPaused = false;
  let isManualPaused = false;
  let progressElapsed = 0;
  let progressStartTime = 0;
  let animFrameId = null;
  let swapTimeout = null;

  // Build the complete interactive markup
  const html = `
    <div class="testimonials-interactive" id="testimonials-interactive">
      <!-- Desktop / Tablet Layout: Selector Rail + Spotlight Card -->
      <div class="testimonials-desktop-layout">
        <!-- Left: Vertical / Horizontal Selector Rail -->
        <div class="testimonials-rail-wrapper">
          <div class="testimonials-rail" role="tablist" aria-label="Client endorsements" aria-orientation="vertical">
            ${approvedItems.map((item, index) => `
              <button
                type="button"
                role="tab"
                id="testimonial-tab-${item.id}"
                class="testimonial-rail-item ${index === 0 ? 'is-active' : ''}"
                aria-selected="${index === 0 ? 'true' : 'false'}"
                aria-controls="testimonial-panel"
                tabindex="${index === 0 ? '0' : '-1'}"
                data-index="${index}"
              >
                ${renderAvatar(item, 'avatar-rail')}
                <div class="rail-item-info">
                  <span class="rail-item-project">${escapeHtml(item.project)}</span>
                  <span class="rail-item-name">${escapeHtml(item.name)}</span>
                  <span class="rail-item-meta">${escapeHtml(item.role)} · ${escapeHtml(item.company)}</span>
                </div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Right: Spotlight Card -->
        <div class="testimonials-spotlight-wrapper">
          <div
            class="testimonial-spotlight-card"
            id="testimonial-panel"
            role="tabpanel"
            aria-labelledby="testimonial-tab-${approvedItems[0].id}"
            tabindex="0"
          >
            <!-- Decorative Large Quote Glyph -->
            <div class="decorative-quote-glyph" aria-hidden="true">“</div>

            <!-- Card Content Wrapper (animated on swap) -->
            <div class="spotlight-content" id="spotlight-content">
              <!-- Top Row: Stars + Client Review Badge -->
              <div class="spotlight-top-row">
                <div class="testimonial-stars" id="spotlight-stars" aria-label="${approvedItems[0].rating || 5} out of 5 stars">
                  ${renderStars(approvedItems[0].rating || 5)}
                </div>
                <div class="client-review-badge">
                  <span class="pulsar-dot-green" aria-hidden="true"></span>
                  <span>CLIENT REVIEW</span>
                </div>
              </div>

              <!-- Quote Box -->
              <div class="spotlight-quote-box">
                <blockquote class="spotlight-quote" id="spotlight-quote">
                  "${escapeHtml(approvedItems[0].quote)}"
                </blockquote>
              </div>

              <!-- Chips: Project & Result -->
              <div class="spotlight-chips" id="spotlight-chips">
                <span class="chip-project" id="spotlight-chip-project">${escapeHtml(approvedItems[0].project)}</span>
                ${approvedItems[0].result ? `<span class="chip-result" id="spotlight-chip-result">✓ ${escapeHtml(approvedItems[0].result)}</span>` : ''}
              </div>

              <!-- Author Row -->
              <div class="spotlight-author-row" id="spotlight-author-row">
                <div class="spotlight-author-avatar" id="spotlight-author-avatar">
                  ${renderAvatar(approvedItems[0], 'avatar-spotlight')}
                </div>
                <div class="spotlight-author-info">
                  <div class="spotlight-author-name" id="spotlight-author-name">${escapeHtml(approvedItems[0].name)}</div>
                  <div class="spotlight-author-meta" id="spotlight-author-meta">${escapeHtml(approvedItems[0].role)} · ${escapeHtml(approvedItems[0].company)}</div>
                </div>
                ${approvedItems[0].linkedin ? `
                  <a
                    href="${escapeHtml(approvedItems[0].linkedin)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="spotlight-linkedin-link"
                    id="spotlight-linkedin-link"
                    aria-label="${escapeHtml(approvedItems[0].name)} on LinkedIn"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect x="2" y="9" width="4" height="12"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                  </a>
                ` : '<div id="spotlight-linkedin-link" style="display:none;"></div>'}
              </div>
            </div>

            <!-- Auto-Advance Thin Progress Bar -->
            <div class="spotlight-progress-track" aria-hidden="true">
              <div class="spotlight-progress-bar" id="testimonial-progress-bar"></div>
            </div>
          </div>

          <!-- Spotlight Controls: Counter, Pause/Play, Prev/Next -->
          <div class="spotlight-controls">
            <div class="controls-counter" aria-live="off">
              <span id="spotlight-current-idx">01</span> / <span id="spotlight-total-count">${String(total).padStart(2, '0')}</span>
            </div>
            <div class="controls-actions">
              <button
                type="button"
                class="testimonial-ctrl-btn testimonial-pause-btn"
                id="testimonial-pause-btn"
                aria-label="Pause testimonials auto-advance"
                title="Pause auto-advance"
              >
                <svg class="icon-pause" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
                <svg class="icon-play" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="display:none;">
                  <polygon points="6 4 19 12 6 20 6 4"/>
                </svg>
              </button>
              <button
                type="button"
                class="testimonial-ctrl-btn testimonial-prev-btn"
                id="testimonial-prev-btn"
                aria-label="Previous testimonial"
                title="Previous"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <button
                type="button"
                class="testimonial-ctrl-btn testimonial-next-btn"
                id="testimonial-next-btn"
                aria-label="Next testimonial"
                title="Next"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Layout: Horizontal Swipe Carousel (<= 600px) -->
      <div class="testimonials-mobile-layout">
        <div class="testimonials-mobile-carousel" id="testimonials-mobile-carousel" tabindex="0" aria-label="Client testimonials carousel">
          ${approvedItems.map((item, index) => `
            <div class="mobile-testimonial-card ${index === 0 ? 'is-active' : ''}" data-index="${index}" id="mobile-card-${item.id}">
              <div class="spotlight-top-row">
                <div class="testimonial-stars" aria-label="${item.rating || 5} out of 5 stars">
                  ${renderStars(item.rating || 5)}
                </div>
                <div class="client-review-badge">
                  <span class="pulsar-dot-green" aria-hidden="true"></span>
                  <span>CLIENT REVIEW</span>
                </div>
              </div>
              <div class="spotlight-quote-box">
                <blockquote class="spotlight-quote">
                  "${escapeHtml(item.quote)}"
                </blockquote>
              </div>
              <div class="spotlight-chips">
                <span class="chip-project">${escapeHtml(item.project)}</span>
                ${item.result ? `<span class="chip-result">✓ ${escapeHtml(item.result)}</span>` : ''}
              </div>
              <div class="spotlight-author-row">
                <div class="spotlight-author-avatar">
                  ${renderAvatar(item, 'avatar-spotlight-mobile')}
                </div>
                <div class="spotlight-author-info">
                  <div class="spotlight-author-name">${escapeHtml(item.name)}</div>
                  <div class="spotlight-author-meta">${escapeHtml(item.role)} · ${escapeHtml(item.company)}</div>
                </div>
                ${item.linkedin ? `
                  <a
                    href="${escapeHtml(item.linkedin)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="spotlight-linkedin-link"
                    aria-label="${escapeHtml(item.name)} on LinkedIn"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect x="2" y="9" width="4" height="12"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                  </a>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Mobile Dots Indicator -->
        <div class="mobile-carousel-nav">
          <div class="mobile-dots" role="tablist" aria-label="Testimonial navigation dots">
            ${approvedItems.map((item, index) => `
              <button
                type="button"
                class="mobile-dot-btn ${index === 0 ? 'is-active' : ''}"
                role="tab"
                aria-label="Testimonial ${index + 1} of ${total}: ${escapeHtml(item.name)}"
                aria-selected="${index === 0 ? 'true' : 'false'}"
                data-index="${index}"
              >
                <span class="mobile-dot-inner"></span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  // Mount interactive markup
  root.innerHTML = html;

  // Cache interactive elements
  const container = document.getElementById('testimonials-interactive');
  const spotlightCard = document.getElementById('testimonial-panel');
  const spotlightContent = document.getElementById('spotlight-content');
  const railTabs = Array.from(root.querySelectorAll('.testimonial-rail-item'));
  const mobileCarousel = document.getElementById('testimonials-mobile-carousel');
  const mobileCards = Array.from(root.querySelectorAll('.mobile-testimonial-card'));
  const mobileDots = Array.from(root.querySelectorAll('.mobile-dot-btn'));
  const progressBar = document.getElementById('testimonial-progress-bar');
  const currentIdxEl = document.getElementById('spotlight-current-idx');
  const prevBtn = document.getElementById('testimonial-prev-btn');
  const nextBtn = document.getElementById('testimonial-next-btn');
  const pauseBtn = document.getElementById('testimonial-pause-btn');

  // Interactive 3D / soft radial mouse spotlight tracking
  if (spotlightCard) {
    spotlightCard.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' || prefersReducedMotion()) return;
      const rect = spotlightCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spotlightCard.style.setProperty('--mx', `${x}px`);
      spotlightCard.style.setProperty('--my', `${y}px`);
    });

    spotlightCard.addEventListener('pointerleave', () => {
      spotlightCard.style.setProperty('--mx', '50%');
      spotlightCard.style.setProperty('--my', '50%');
    });
  }

  // Update spotlight card DOM for a given index
  function updateSpotlightView(index) {
    const item = approvedItems[index];
    if (!item) return;

    if (spotlightCard) {
      spotlightCard.setAttribute('aria-labelledby', `testimonial-tab-${item.id}`);
    }

    if (spotlightContent) {
      // Crossfade / slight slide animation
      if (!prefersReducedMotion()) {
        spotlightContent.classList.remove('is-swapping');
        void spotlightContent.offsetWidth; // force reflow
        spotlightContent.classList.add('is-swapping');
        if (swapTimeout) clearTimeout(swapTimeout);
        swapTimeout = setTimeout(() => {
          spotlightContent.classList.remove('is-swapping');
        }, 250);
      }

      // Stars
      const starsEl = document.getElementById('spotlight-stars');
      if (starsEl) {
        starsEl.textContent = renderStars(item.rating || 5);
        starsEl.setAttribute('aria-label', `${item.rating || 5} out of 5 stars`);
      }

      // Quote
      const quoteEl = document.getElementById('spotlight-quote');
      if (quoteEl) {
        quoteEl.textContent = `"${item.quote}"`;
      }

      // Chips
      const chipsEl = document.getElementById('spotlight-chips');
      if (chipsEl) {
        chipsEl.innerHTML = `
          <span class="chip-project" id="spotlight-chip-project">${escapeHtml(item.project)}</span>
          ${item.result ? `<span class="chip-result" id="spotlight-chip-result">✓ ${escapeHtml(item.result)}</span>` : ''}
        `;
      }

      // Author avatar
      const avatarEl = document.getElementById('spotlight-author-avatar');
      if (avatarEl) {
        avatarEl.innerHTML = renderAvatar(item, 'avatar-spotlight');
      }

      // Author name & meta
      const nameEl = document.getElementById('spotlight-author-name');
      if (nameEl) nameEl.textContent = item.name;

      const metaEl = document.getElementById('spotlight-author-meta');
      if (metaEl) metaEl.textContent = `${item.role} · ${item.company}`;

      // LinkedIn
      const linkedinWrap = document.getElementById('spotlight-author-row');
      let linkedinEl = document.getElementById('spotlight-linkedin-link');
      if (item.linkedin) {
        const linkHtml = `
          <a
            href="${escapeHtml(item.linkedin)}"
            target="_blank"
            rel="noopener noreferrer"
            class="spotlight-linkedin-link"
            id="spotlight-linkedin-link"
            aria-label="${escapeHtml(item.name)} on LinkedIn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect x="2" y="9" width="4" height="12"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </a>
        `;
        if (linkedinEl) {
          linkedinEl.outerHTML = linkHtml;
        } else if (linkedinWrap) {
          linkedinWrap.insertAdjacentHTML('beforeend', linkHtml);
        }
      } else if (linkedinEl) {
        linkedinEl.remove();
      }
    }
  }

  // Set active testimonial index
  function setActiveTestimonial(newIndex, { userInitiated = false, syncMobileScroll = true } = {}) {
    if (newIndex < 0) newIndex = total - 1;
    if (newIndex >= total) newIndex = 0;

    activeIndex = newIndex;
    const currentItem = approvedItems[activeIndex];

    // 1. Update rail items
    railTabs.forEach((tab, idx) => {
      const isSelected = idx === activeIndex;
      tab.classList.toggle('is-active', isSelected);
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');

      if (isSelected && (window.innerWidth <= 1024)) {
        // Smoothly scroll active chip into view on tablet
        tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });

    // 2. Update spotlight card
    updateSpotlightView(activeIndex);

    // 3. Update counter
    if (currentIdxEl) {
      currentIdxEl.textContent = String(activeIndex + 1).padStart(2, '0');
    }

    // 4. Update mobile carousel & dots
    mobileCards.forEach((card, idx) => {
      card.classList.toggle('is-active', idx === activeIndex);
    });

    mobileDots.forEach((dot, idx) => {
      const isSelected = idx === activeIndex;
      dot.classList.toggle('is-active', isSelected);
      dot.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });

    if (syncMobileScroll && mobileCarousel && mobileCards[activeIndex]) {
      // Only scroll carousel if not initiated by touch scroll
      const card = mobileCards[activeIndex];
      const targetLeft = card.offsetLeft - (mobileCarousel.offsetWidth - card.offsetWidth) / 2;
      mobileCarousel.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
    }

    // 5. Reset progress timer
    progressElapsed = 0;
    progressStartTime = performance.now();
    if (progressBar) {
      progressBar.style.width = '0%';
    }
  }

  // --- Auto-Advance & Progress Animation Loop ---
  function tick(now) {
    if (!isPaused && !isManualPaused && !prefersReducedMotion() && total > 1) {
      if (!progressStartTime) {
        progressStartTime = now;
      }
      const elapsed = (now - progressStartTime) + progressElapsed;
      const pct = Math.min(100, (elapsed / AUTO_ADVANCE_DURATION) * 100);

      if (progressBar) {
        progressBar.style.width = `${pct}%`;
      }

      if (elapsed >= AUTO_ADVANCE_DURATION) {
        progressStartTime = now;
        progressElapsed = 0;
        setActiveTestimonial((activeIndex + 1) % total, { userInitiated: false, syncMobileScroll: true });
      }
    }
    animFrameId = requestAnimationFrame(tick);
  }

  function pauseAutoAdvance() {
    if (!isPaused && progressStartTime) {
      progressElapsed += performance.now() - progressStartTime;
      progressStartTime = 0;
    }
    isPaused = true;
  }

  function resumeAutoAdvance() {
    if (isPaused) {
      isPaused = false;
      progressStartTime = performance.now();
    }
  }

  function toggleManualPause() {
    isManualPaused = !isManualPaused;
    if (pauseBtn) {
      const iconPause = pauseBtn.querySelector('.icon-pause');
      const iconPlay = pauseBtn.querySelector('.icon-play');
      if (isManualPaused) {
        pauseBtn.setAttribute('aria-label', 'Resume testimonials auto-advance');
        pauseBtn.setAttribute('title', 'Play auto-advance');
        if (iconPause) iconPause.style.display = 'none';
        if (iconPlay) iconPlay.style.display = 'block';
        pauseAutoAdvance();
      } else {
        pauseBtn.setAttribute('aria-label', 'Pause testimonials auto-advance');
        pauseBtn.setAttribute('title', 'Pause auto-advance');
        if (iconPause) iconPause.style.display = 'block';
        if (iconPlay) iconPlay.style.display = 'none';
        resumeAutoAdvance();
      }
    }
  }

  // Start progress animation
  if (!prefersReducedMotion() && total > 1) {
    progressStartTime = performance.now();
    animFrameId = requestAnimationFrame(tick);
  } else if (progressBar) {
    progressBar.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'none';
  }

  // Pause on hover over entire container
  if (container) {
    container.addEventListener('mouseenter', () => pauseAutoAdvance());
    container.addEventListener('mouseleave', () => {
      if (!isManualPaused) resumeAutoAdvance();
    });

    // Pause on focus within
    container.addEventListener('focusin', () => pauseAutoAdvance());
    container.addEventListener('focusout', (e) => {
      if (!container.contains(e.relatedTarget) && !isManualPaused) {
        resumeAutoAdvance();
      }
    });
  }

  // Pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pauseAutoAdvance();
    } else if (!isManualPaused) {
      resumeAutoAdvance();
    }
  });

  // Controls: Prev / Next / Pause
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      setActiveTestimonial((activeIndex - 1 + total) % total, { userInitiated: true, syncMobileScroll: true });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      setActiveTestimonial((activeIndex + 1) % total, { userInitiated: true, syncMobileScroll: true });
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', toggleManualPause);
  }

  // Rail Click & Keyboard Navigation
  railTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const idx = Number(tab.getAttribute('data-index'));
      setActiveTestimonial(idx, { userInitiated: true, syncMobileScroll: true });
    });
  });

  const rail = root.querySelector('.testimonials-rail');
  if (rail) {
    rail.addEventListener('keydown', (e) => {
      const tabs = railTabs;
      const currentTab = document.activeElement;
      const currentIdx = tabs.indexOf(currentTab);
      if (currentIdx === -1) return;

      let targetIdx = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        targetIdx = (currentIdx + 1) % tabs.length;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        targetIdx = (currentIdx - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        targetIdx = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        targetIdx = tabs.length - 1;
      }

      if (targetIdx !== null) {
        tabs[targetIdx].focus();
        setActiveTestimonial(targetIdx, { userInitiated: true, syncMobileScroll: true });
      }
    });
  }

  // Mobile Dots Click
  mobileDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = Number(dot.getAttribute('data-index'));
      setActiveTestimonial(idx, { userInitiated: true, syncMobileScroll: true });
    });
  });

  // Mobile Carousel Swipe / Scroll Detection
  if (mobileCarousel) {
    let scrollTimeout = null;
    let isTouchScrolling = false;

    mobileCarousel.addEventListener('touchstart', () => {
      isTouchScrolling = true;
      pauseAutoAdvance();
    }, { passive: true });

    mobileCarousel.addEventListener('touchend', () => {
      isTouchScrolling = false;
      if (!isManualPaused) resumeAutoAdvance();
    }, { passive: true });

    mobileCarousel.addEventListener('scroll', () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!mobileCards.length) return;
        const carouselCenter = mobileCarousel.scrollLeft + mobileCarousel.offsetWidth / 2;
        let closestIdx = 0;
        let minDiff = Infinity;

        mobileCards.forEach((card, idx) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const diff = Math.abs(carouselCenter - cardCenter);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = idx;
          }
        });

        if (closestIdx !== activeIndex) {
          // Sync without re-scrolling the carousel during touch
          setActiveTestimonial(closestIdx, { userInitiated: true, syncMobileScroll: false });
        }
      }, 50);
    }, { passive: true });
  }
}

