/**
 * VIKRAM.DEV — Branded Preloader Sequence
 */
export function initPreloader(onComplete) {
  const preloader = document.querySelector('.preloader');
  if (!preloader) {
    if (onComplete) onComplete();
    return;
  }

  const counterEl = document.querySelector('.preloader-counter');
  const barFill = document.querySelector('.preloader-bar-fill');
  const shutterTop = document.querySelector('.preloader-shutter-top');
  const shutterBottom = document.querySelector('.preloader-shutter-bottom');
  const content = document.querySelector('.preloader-content');

  let current = 0;
  const target = 100;
  const duration = 1600; // ms
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Smooth ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    current = Math.floor(eased * target);

    if (counterEl) {
      counterEl.textContent = current.toString().padStart(2, '0');
    }
    if (barFill) {
      barFill.style.width = `${current}%`;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      setTimeout(() => {
        // Fade out preloader content
        if (content) {
          content.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          content.style.opacity = '0';
          content.style.transform = 'scale(0.95)';
        }

        // Open shutters
        setTimeout(() => {
          if (shutterTop) shutterTop.style.transform = 'translateY(-100%)';
          if (shutterBottom) shutterBottom.style.transform = 'translateY(100%)';

          setTimeout(() => {
            preloader.style.display = 'none';
            if (onComplete) onComplete();
          }, 800);
        }, 300);
      }, 200);
    }
  }

  requestAnimationFrame(update);
}
