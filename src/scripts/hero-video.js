/**
 * VIKRAM.DEV — HeyGen AI Introduction Video Controller (About Section Integration)
 * 
 * Manages stateful activation of the HeyGen introduction video player:
 * - Positioned within the About section 16:9 visual card (matching workspace photo)
 * - Zero initial performance penalty; iframe is only loaded when user activates
 * - Seamless 650ms crossfade between workspace photography and HeyGen video
 * - Synchronized with both the on-card "MEET MY DIGITAL TWIN" button and header speaker icon
 * - Automatically returns to static photo once the 10s video finishes playing
 * - Cleanly cuts off audio on close to eliminate background sound leakage
 */
import { soundEngine } from './audio-feedback.js';

class AboutVideoState {
  constructor() {
    this.isActive = false;
    this.isLoaded = false;
    this.iframe = null;
    this.embedUrl = 'https://app.heygen.com/embeds/ef14b6707b8444708e95758417222c17';
    this.visualBox = null;
    this.videoContainer = null;
    this.videoFrameWrap = null;
    this.playTrigger = null;
    this.closeBtn = null;
    this.toggleButtons = [];
    this.unloadTimeout = null;
    this.autoReturnTimer = null;
  }

  init() {
    this.visualBox = document.getElementById('about-visual-box') || document.querySelector('.about-visual-box');
    this.videoContainer = document.getElementById('about-video-container');
    this.videoFrameWrap = document.getElementById('about-video-frame-wrap');
    this.playTrigger = document.getElementById('about-video-play-btn');
    this.closeBtn = document.getElementById('about-video-close-btn');

    this.toggleButtons = Array.from(document.querySelectorAll('.audio-toggle-btn'));

    if (!this.visualBox || !this.videoContainer || !this.videoFrameWrap) return;

    // 1. Direct Play Trigger on the About workspace card
    if (this.playTrigger) {
      this.playTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
      });
    }

    // 2. Navigation Header Speaker Button(s)
    this.toggleButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
      });

      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggle();
        }
      });
    });

    // 3. Return to Photo button on the active video frame
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.deactivate();
      });
    }

    // 4. Global window message listener for cross-origin completion event (if emitted by player)
    window.addEventListener('message', (e) => {
      if (!this.isActive) return;
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data?.event === 'ended' || data?.type === 'ended' || data?.status === 'completed') {
          this.deactivate();
        }
      } catch (_) {}
    });
  }

  toggle() {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  activate() {
    if (this.isActive) return;
    this.isActive = true;

    // Clear any pending timeouts
    if (this.unloadTimeout) {
      clearTimeout(this.unloadTimeout);
      this.unloadTimeout = null;
    }
    if (this.autoReturnTimer) {
      clearTimeout(this.autoReturnTimer);
      this.autoReturnTimer = null;
    }

    // Play subtle audio click feedback
    try {
      soundEngine.playSuccess();
    } catch (_) {}

    // Mount or restore HeyGen iframe with autoplay & unmuted sound
    const playerSrc = `${this.embedUrl}?autoplay=1&muted=0`;

    if (!this.iframe) {
      this.iframe = document.createElement('iframe');
      this.iframe.width = '560';
      this.iframe.height = '315';
      this.iframe.src = playerSrc;
      this.iframe.title = 'Vikram - Personal Introduction';
      this.iframe.setAttribute('frameborder', '0');
      this.iframe.setAttribute('allow', 'autoplay *; encrypted-media *; fullscreen *; picture-in-picture *');
      this.iframe.setAttribute('allowfullscreen', 'true');
      this.iframe.setAttribute('loading', 'eager');
      this.videoFrameWrap.appendChild(this.iframe);
      this.isLoaded = true;
    } else if (!this.iframe.src || this.iframe.src === 'about:blank' || this.iframe.src.endsWith('about:blank')) {
      this.iframe.src = playerSrc;
    }

    // Update Visual Box state
    this.visualBox.classList.add('video-active');
    this.videoContainer.setAttribute('aria-hidden', 'false');

    // Update Trigger Button on top of card
    if (this.playTrigger) {
      this.playTrigger.classList.add('active');
      const badge = this.playTrigger.querySelector('.play-btn-badge span:last-child');
      if (badge) badge.textContent = 'PLAYING';
      const meta = this.playTrigger.querySelector('.play-btn-meta');
      if (meta) meta.textContent = 'Playing • Click to return';
    }

    // Update Header Speaker Icon state
    this.toggleButtons.forEach((btn) => {
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('title', 'Return to Photo / Close Video');
      btn.setAttribute('aria-label', 'Return to Photo / Close Video');
    });

    // If user activated via header while away from About section, scroll smoothly to it
    const rect = this.visualBox.getBoundingClientRect();
    const isVisibleInViewport = rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
    if (!isVisibleInViewport) {
      const aboutSec = document.getElementById('about');
      if (aboutSec) {
        aboutSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Automatically return to photo once the 10s video completes (10s runtime + 2.5s buffer)
    this.autoReturnTimer = setTimeout(() => {
      if (this.isActive) {
        this.deactivate();
      }
    }, 12500);
  }

  deactivate() {
    if (!this.isActive) return;
    this.isActive = false;

    // Clear auto-return timer
    if (this.autoReturnTimer) {
      clearTimeout(this.autoReturnTimer);
      this.autoReturnTimer = null;
    }

    // Crossfade back to workspace image
    this.visualBox.classList.remove('video-active');
    this.videoContainer.setAttribute('aria-hidden', 'true');

    // Reset Trigger Button on top of card
    if (this.playTrigger) {
      this.playTrigger.classList.remove('active');
      const badge = this.playTrigger.querySelector('.play-btn-badge span:last-child');
      if (badge) badge.textContent = 'WATCH INTRO';
      const meta = this.playTrigger.querySelector('.play-btn-meta');
      if (meta) meta.textContent = 'Interactive Video Briefing';
    }

    // Reset Header Speaker Button
    this.toggleButtons.forEach((btn) => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('title', 'Meet My Digital Twin (Interactive Briefing)');
      btn.setAttribute('aria-label', 'Meet My Digital Twin (Interactive Briefing)');
    });

    // Stop iframe audio after crossfade completes
    this.unloadTimeout = setTimeout(() => {
      if (!this.isActive && this.iframe) {
        this.iframe.src = 'about:blank';
      }
    }, 700);
  }
}

export const aboutVideoState = new AboutVideoState();

export function initHeroVideo() {
  aboutVideoState.init();
}
