/**
 * VIKRAM.DEV — HeyGen AI Introduction Video Controller (About Section Integration)
 * 
 * Manages stateful activation of the HeyGen introduction video player:
 * - Positioned within the About section 16:9 visual card (matching workspace photo)
 * - Zero initial performance penalty; iframe is only loaded when user activates
 * - Seamless crossfade between workspace photography and HeyGen video
 * - High-tech loading placeholder shown while the video stream connects & buffers
 * - Synchronized with both the on-card "MEET MY DIGITAL TWIN" button and header speaker icon
 * - Plays video until complete (measured from actual playback start) or until user clicks Return to Photo
 * - Cleanly cuts off audio on close to eliminate background sound leakage
 */
import { soundEngine } from './audio-feedback.js';

class AboutVideoState {
  constructor() {
    this.isActive = false;
    this.isPlaying = false;
    this.isLoaded = false;
    this.iframe = null;
    this.embedUrl = 'https://app.heygen.com/embeds/ef14b6707b8444708e95758417222c17';
    this.visualBox = null;
    this.videoContainer = null;
    this.videoFrameWrap = null;
    this.placeholder = null;
    this.playTrigger = null;
    this.closeBtn = null;
    this.toggleButtons = [];
    this.unloadTimeout = null;
    this.autoReturnTimer = null;
    this.videoStartTimeout = null;
    this.failsafeTimeout = null;
    this.videoDuration = 10110; // Exact HeyGen video duration: 10.11s
    this.streamBuffer = 900;    // Time for HeyGen player to decode stream after iframe loads
  }

  init() {
    this.visualBox = document.getElementById('about-visual-box') || document.querySelector('.about-visual-box');
    this.videoContainer = document.getElementById('about-video-container');
    this.videoFrameWrap = document.getElementById('about-video-frame-wrap');
    this.placeholder = document.getElementById('about-video-placeholder');
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
        if (data?.event === 'ended' || data?.type === 'ended' || data?.status === 'completed' || data?.action === 'ended') {
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
    this.isPlaying = false;

    // Clear any pending timeouts
    this.clearAllTimers();

    // Play subtle audio click feedback
    try {
      soundEngine.playSuccess();
    } catch (_) {}

    // 1. Activate Visual Box & Video Container
    this.visualBox.classList.add('video-active');
    this.videoContainer.setAttribute('aria-hidden', 'false');

    // 2. Display the sleek Loading Placeholder immediately
    if (this.placeholder) {
      this.placeholder.classList.add('is-visible');
    }

    // 3. Update Trigger Button on top of card to Connecting state
    if (this.playTrigger) {
      this.playTrigger.classList.add('active');
      const badge = this.playTrigger.querySelector('.play-btn-badge span:last-child');
      if (badge) badge.textContent = 'CONNECTING...';
      const meta = this.playTrigger.querySelector('.play-btn-meta');
      if (meta) meta.textContent = 'Connecting Digital Twin stream...';
    }

    // 4. Update Header Speaker Icon state
    this.toggleButtons.forEach((btn) => {
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('title', 'Return to Photo / Close Video');
      btn.setAttribute('aria-label', 'Return to Photo / Close Video');
    });

    // 5. If user activated via header while away from About section, scroll smoothly to it
    const rect = this.visualBox.getBoundingClientRect();
    const isVisibleInViewport = rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
    if (!isVisibleInViewport) {
      const aboutSec = document.getElementById('about');
      if (aboutSec) {
        aboutSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // 6. Mount or reload HeyGen iframe with autoplay & unmuted sound
    const playerSrc = `${this.embedUrl}?autoplay=1&muted=0`;

    if (!this.iframe) {
      this.iframe = document.createElement('iframe');
      this.iframe.width = '560';
      this.iframe.height = '315';
      this.iframe.title = 'Vikram - Personal Introduction';
      this.iframe.setAttribute('frameborder', '0');
      this.iframe.setAttribute('allow', 'autoplay *; encrypted-media *; fullscreen *; picture-in-picture *');
      this.iframe.setAttribute('allowfullscreen', 'true');
      this.iframe.setAttribute('loading', 'eager');

      this.iframe.addEventListener('load', () => {
        this.handleIframeLoaded();
      });

      this.iframe.src = playerSrc;
      this.videoFrameWrap.appendChild(this.iframe);
      this.isLoaded = true;
    } else {
      const onLoad = () => {
        this.handleIframeLoaded();
        this.iframe.removeEventListener('load', onLoad);
      };
      this.iframe.addEventListener('load', onLoad, { once: true });
      this.iframe.src = playerSrc;
    }

    // 7. Auto-transition fallback (3.8s) in case HeyGen iframe onload event is delayed by 3rd-party analytics
    this.fallbackStartTimeout = setTimeout(() => {
      if (this.isActive && !this.isPlaying) {
        this.startVideoPlayback();
      }
    }, 3800);

    // 8. Safety failsafe timeout (30s) in case network is completely stalled
    this.failsafeTimeout = setTimeout(() => {
      if (this.isActive && !this.isPlaying) {
        console.warn('[AboutVideo] Stream loading timeout reached.');
      }
    }, 30000);
  }

  handleIframeLoaded() {
    if (!this.isActive) return;

    // Once the iframe document loads, allow a brief buffer for video element initialization
    if (this.videoStartTimeout) clearTimeout(this.videoStartTimeout);
    this.videoStartTimeout = setTimeout(() => {
      if (!this.isActive) return;
      this.startVideoPlayback();
    }, this.streamBuffer);
  }

  startVideoPlayback() {
    if (!this.isActive) return;
    this.isPlaying = true;

    // Fade out placeholder to reveal live video
    if (this.placeholder) {
      this.placeholder.classList.remove('is-visible');
    }

    // Update Trigger Button on top of card to Playing state
    if (this.playTrigger) {
      const badge = this.playTrigger.querySelector('.play-btn-badge span:last-child');
      if (badge) badge.textContent = 'PLAYING';
      const meta = this.playTrigger.querySelector('.play-btn-meta');
      if (meta) meta.textContent = 'Playing • Click Photo to return';
    }

    // Automatically return to photo ONLY after the video has actually finished playing
    // Video runtime is 10.11s + 1.2s ending buffer
    if (this.autoReturnTimer) clearTimeout(this.autoReturnTimer);
    this.autoReturnTimer = setTimeout(() => {
      if (this.isActive) {
        this.deactivate();
      }
    }, this.videoDuration + 1200);
  }

  clearAllTimers() {
    if (this.unloadTimeout) {
      clearTimeout(this.unloadTimeout);
      this.unloadTimeout = null;
    }
    if (this.autoReturnTimer) {
      clearTimeout(this.autoReturnTimer);
      this.autoReturnTimer = null;
    }
    if (this.videoStartTimeout) {
      clearTimeout(this.videoStartTimeout);
      this.videoStartTimeout = null;
    }
    if (this.fallbackStartTimeout) {
      clearTimeout(this.fallbackStartTimeout);
      this.fallbackStartTimeout = null;
    }
    if (this.failsafeTimeout) {
      clearTimeout(this.failsafeTimeout);
      this.failsafeTimeout = null;
    }
  }

  deactivate() {
    if (!this.isActive) return;
    this.isActive = false;
    this.isPlaying = false;

    // Clear all pending playback timers
    this.clearAllTimers();

    // Crossfade back to workspace image
    this.visualBox.classList.remove('video-active');
    this.videoContainer.setAttribute('aria-hidden', 'true');

    // Hide loading placeholder
    if (this.placeholder) {
      this.placeholder.classList.remove('is-visible');
    }

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
