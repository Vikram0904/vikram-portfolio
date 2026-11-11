/**
 * VIKRAM.DEV — Footer Controller
 * Handles dynamic year, clipboard copy interaction (2s feedback), and scroll reveal
 */
export function initFooter() {
  // 1. Dynamic Copyright Year
  const yearEl = document.getElementById('site-footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Email Copy Interaction with 2s Feedback
  const copyBtn = document.getElementById('site-footer-copy-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = 'vikramnsk4@gmail.com';
      let copied = false;

      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(email);
          copied = true;
        } catch {
          copied = fallbackCopy(email);
        }
      } else {
        copied = fallbackCopy(email);
      }

      if (copied) {
        copyBtn.classList.add('copied', 'is-copied');
        const label = copyBtn.querySelector('.copy-label');
        const origText = label ? label.textContent : 'Copy email';
        if (label) label.textContent = 'Copied';

        setTimeout(() => {
          copyBtn.classList.remove('copied', 'is-copied');
          if (label) label.textContent = origText;
        }, 2000);
      }
    });
  }

  function fallbackCopy(text) {
    try {
      const temp = document.createElement('textarea');
      temp.value = text;
      temp.style.position = 'fixed';
      temp.style.top = '-9999px';
      temp.style.left = '-9999px';
      document.body.appendChild(temp);
      temp.focus();
      temp.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(temp);
      return successful;
    } catch {
      return false;
    }
  }

  // 3. Subtle Scroll Reveal (respecting prefers-reduced-motion)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll('.site-footer-reveal');

  if (prefersReduced) {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window && revealElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -20px 0px', threshold: 0.1 }
    );

    revealElements.forEach((el, index) => {
      el.style.transitionDelay = `${index * 0.1}s`;
      observer.observe(el);
    });
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }
}
