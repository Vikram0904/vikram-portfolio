/**
 * VIKRAM.DEV — 4-Point 3D Cylindrical Drum Showcase Engine (Inspired by rbp-genai-template)
 *
 * Implements an executive 3D rotating cylindrical drum scroller:
 * - Left Pane: 4-Point Milestone Stepper with accordion expansion, status indicators, and one-click jump.
 * - Right Pane: 3D Cylindrical Drum rotating cards along the X-axis:
 *   transform = translate3d(0, 0, -420px) rotateX(var(--turn)) translate3d(0, 0, 420px)
 * - Dynamic depth shadow overlay: z(offset) = min(0.55 * |offset|, 0.85)
 * - Pinned ScrollTrigger scrub with inertial spring physics & snap
 * - Mobile responsive swipe carousel for < 992px
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
// VERIFIED CLIENT TESTIMONIALS DATA (4 High-Impact Case Studies)
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
    result: 'Simpler annual membership renewals & zero transaction drop-offs',
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
    quote: 'Our portfolio site went from a sluggish multi-second load to near-instant filtering. Vikram really understands WordPress internals, Transients caching, and client-side performance.',
    result: 'Reduced initial payload by 78% & achieved 98/100 Mobile PageSpeed',
    rating: 5,
    approved: true
  },
  {
    id: 'ananya',
    name: 'Ananya Sharma',
    role: 'Founder & Product Lead',
    company: 'Aastral Insights',
    initials: 'AS',
    project: 'VEDIC LMS CALCULATOR',
    quote: 'The custom Vedic LMS calculator Vikram built generates thousands of natal PDF reports flawlessly every month. He understands both the complex math logic and the user experience.',
    result: '5,000+ monthly algorithmic reports generated with < 45ms latency',
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
    rating: 5,
    approved: true
  }
];

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function initTestimonials() {
  const section = document.getElementById('testimonials');
  if (!section) return;

  const stage = section.querySelector('.testimonials-pinned-stage');
  const navList = document.getElementById('testimonials-drum-nav');
  const drumTrack = document.getElementById('testimonials-drum-track');

  if (!navList || !drumTrack) return;

  const approvedItems = TESTIMONIALS_DATA.filter(
    (item) => item.approved === true && typeof item.quote === 'string' && item.quote.trim().length > 0
  );

  const total = approvedItems.length;
  if (total === 0) return;

  // 1. POPULATE LEFT ACCORDION STEPPER
  navList.innerHTML = approvedItems.map((item, idx) => `
    <li class="drum-nav-item ${idx === 0 ? 'is-active' : ''}" data-index="${idx}">
      <button
        type="button"
        class="drum-nav-btn"
        role="tab"
        id="drum-tab-${item.id}"
        aria-selected="${idx === 0 ? 'true' : 'false'}"
        aria-controls="drum-card-${item.id}"
      >
        <div class="drum-nav-header">
          <span class="drum-nav-num">0${idx + 1}</span>
          <span class="drum-nav-name">${escapeHtml(item.name)}</span>
          <span class="drum-nav-company">// ${escapeHtml(item.company)}</span>
        </div>
        <div class="drum-nav-drawer">
          <div class="drawer-inner">
            <div class="drawer-meta-line">
              <span class="drawer-role">${escapeHtml(item.role)}</span>
              <span class="drawer-project-chip">${escapeHtml(item.project)}</span>
            </div>
            ${item.result ? `<div class="drawer-result">✓ ${escapeHtml(item.result)}</div>` : ''}
          </div>
        </div>
      </button>
    </li>
  `).join('');

  // 2. POPULATE RIGHT 3D CYLINDRICAL DRUM CARDS
  drumTrack.innerHTML = approvedItems.map((item, idx) => `
    <div
      class="drum-card ${idx === 0 ? 'is-active' : ''}"
      id="drum-card-${item.id}"
      data-drum-index="${idx}"
      style="--turn: ${-(62 * idx)}deg;"
    >
      <!-- Glassmorphic Card Frame -->
      <div class="drum-card-inner">
        <!-- Watermark Quote Glyph -->
        <div class="drum-watermark-glyph" aria-hidden="true">“</div>

        <!-- Top Status Bar: 5 Stars + Verified Badge -->
        <div class="drum-card-top">
          <div class="drum-stars" aria-label="5 out of 5 stars">
            <span class="star-glyph">★★★★★</span>
          </div>
          <div class="drum-verified-badge">
            <span class="pulsar-dot-green" aria-hidden="true"></span>
            <span>VERIFIED CLIENT REVIEW</span>
          </div>
        </div>

        <!-- Quote Body -->
        <blockquote class="drum-quote-body">
          "${escapeHtml(item.quote)}"
        </blockquote>

        <!-- Performance / Result Chip -->
        <div class="drum-card-chips">
          <span class="drum-chip-project">${escapeHtml(item.project)}</span>
          ${item.result ? `<span class="drum-chip-result">✓ ${escapeHtml(item.result)}</span>` : ''}
        </div>

        <!-- Client Author Profile -->
        <div class="drum-card-author">
          <div class="drum-avatar-ring">
            <div class="drum-avatar-inner">
              <span>${escapeHtml(item.initials)}</span>
            </div>
          </div>
          <div class="drum-author-details">
            <div class="drum-author-name">
              <span>${escapeHtml(item.name)}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#27C93F" class="verified-icon" aria-label="Verified"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
            <div class="drum-author-meta">${escapeHtml(item.role)} · ${escapeHtml(item.company)}</div>
          </div>
        </div>
      </div>

      <!-- Atmospheric Depth Shadow Falloff Layer -->
      <div class="drum-depth-shadow" aria-hidden="true" style="opacity: ${Math.min(0.55 * idx, 0.85)};"></div>
    </div>
  `).join('');

  const navItems = Array.from(navList.querySelectorAll('.drum-nav-item'));
  const drumCards = Array.from(drumTrack.querySelectorAll('.drum-card'));

  // 3. 3D DRUM UPDATE ENGINE
  let currentActive = 0;

  function updateDrum(drumProgress) {
    // drumProgress is a continuous float from 0 to total - 1
    const activeIdx = Math.min(total - 1, Math.max(0, Math.round(drumProgress)));

    drumCards.forEach((card, idx) => {
      const offset = idx - drumProgress;
      const absOffset = Math.abs(offset);

      // Visibility culling for cards rotated far behind the drum
      if (absOffset > 1.45) {
        card.style.visibility = 'hidden';
      } else {
        card.style.visibility = 'visible';
      }

      // Rotate card along X axis on the drum circumference
      const turnDeg = -(62 * offset).toFixed(2);
      card.style.setProperty('--turn', `${turnDeg}deg`);

      // Depth shadow: smooth falloff darkening as card rotates up/down
      const shadowEl = card.querySelector('.drum-depth-shadow');
      if (shadowEl) {
        const shadowOpacity = Math.min(0.55 * absOffset, 0.85);
        shadowEl.style.opacity = shadowOpacity.toFixed(3);
      }

      // Active state
      if (idx === activeIdx) {
        card.classList.add('is-active');
      } else {
        card.classList.remove('is-active');
      }
    });

    // Update left navigation accordion
    if (activeIdx !== currentActive) {
      currentActive = activeIdx;
      navItems.forEach((btnWrap, bIdx) => {
        const btn = btnWrap.querySelector('.drum-nav-btn');
        if (bIdx === activeIdx) {
          btnWrap.classList.add('is-active');
          btn?.setAttribute('aria-selected', 'true');
        } else {
          btnWrap.classList.remove('is-active');
          btn?.setAttribute('aria-selected', 'false');
        }
      });
    }
  }

  // 4. DESKTOP GSAP SCROLLTRIGGER PINNED ENGINE (min-width: 992px)
  const mm = gsap.matchMedia();

  mm.add('(min-width: 992px)', () => {
    // Master drum scroll timeline
    const totalTransitions = total - 1;

    const drumTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${totalTransitions * window.innerHeight * 0.95}`,
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
          const drumProgress = progress * totalTransitions;
          updateDrum(drumProgress);
        }
      }
    });

    // Dummy scrub to establish timeline progression length
    drumTl.to({}, { duration: totalTransitions });

    // Click handler for left-side accordion milestones: Jump directly to project
    navItems.forEach((wrap) => {
      wrap.addEventListener('click', (e) => {
        e.preventDefault();
        const targetIdx = parseInt(wrap.getAttribute('data-index'), 10);
        if (isNaN(targetIdx)) return;

        const st = drumTl.scrollTrigger;
        if (!st) return;

        const targetProgress = targetIdx / totalTransitions;
        const targetScroll = st.start + targetProgress * (st.end - st.start);

        if (window.lenis) {
          window.lenis.scrollTo(targetScroll);
        } else {
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
      });
    });

    // Initial drum state
    updateDrum(0);

    return () => {
      drumTl.kill();
    };
  });

  // 5. MOBILE & TABLET SWIPE CAROUSEL (< 992px)
  mm.add('(max-width: 991px)', () => {
    navItems.forEach((wrap) => {
      wrap.addEventListener('click', () => {
        const targetIdx = parseInt(wrap.getAttribute('data-index'), 10);
        if (isNaN(targetIdx)) return;

        currentActive = targetIdx;
        navItems.forEach((w, i) => {
          if (i === targetIdx) {
            w.classList.add('is-active');
          } else {
            w.classList.remove('is-active');
          }
        });

        const targetCard = drumCards[targetIdx];
        if (targetCard) {
          drumTrack.scrollTo({
            left: targetCard.offsetLeft - 16,
            behavior: 'smooth'
          });
        }
      });
    });
  });
}
