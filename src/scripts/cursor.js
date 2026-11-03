/**
 * VIKRAM.DEV — Fluid Custom Cursor & Magnetic Attraction Engine
 */
export function initCursor() {
  const cursor = document.querySelector('.custom-cursor');
  if (!cursor) return;

  const dot = cursor.querySelector('.cursor-dot');
  const ring = cursor.querySelector('.cursor-ring');
  const label = cursor.querySelector('.cursor-label');

  let mouseX = -1000;
  let mouseY = -1000;
  let ringX = mouseX;
  let ringY = mouseY;
  let dotX = mouseX;
  let dotY = mouseY;
  let hasMoved = false;
  const heroSection = document.getElementById('hero');

  function checkHeroBounds(x, y) {
    if (!heroSection) return false;
    const rect = heroSection.getBoundingClientRect();
    return y >= rect.top && y <= rect.bottom && x >= rect.left && x <= rect.right;
  }

  // Track Mouse
  window.addEventListener('mousemove', (e) => {
    if (!hasMoved) {
      hasMoved = true;
      document.body.classList.add('cursor-active');
    }
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (checkHeroBounds(mouseX, mouseY)) {
      document.body.classList.add('cursor-on-hero');
    } else {
      document.body.classList.remove('cursor-on-hero');
    }
  }, { passive: true });

  window.addEventListener('scroll', () => {
    if (hasMoved) {
      if (checkHeroBounds(mouseX, mouseY)) {
        document.body.classList.add('cursor-on-hero');
      } else {
        document.body.classList.remove('cursor-on-hero');
      }
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    document.body.classList.remove('cursor-active');
  });

  document.addEventListener('mouseenter', () => {
    if (hasMoved) {
      document.body.classList.add('cursor-active');
    }
  });

  // Physics animation loop
  function render() {
    // Smooth lerp for outer ring
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;

    // Snappier lerp for inner dot
    dotX += (mouseX - dotX) * 0.45;
    dotY += (mouseY - dotY) * 0.45;
    dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;

    if (label) {
      label.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    }

    requestAnimationFrame(render);
  }
  render();

  // Hover detection
  const interactiveSelectors = 'a, button, input, textarea, select, .interactive-el, [data-cursor]';

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(interactiveSelectors);
    if (!target) return;

    const cursorType = target.getAttribute('data-cursor');
    if (cursorType === 'view') {
      document.body.classList.add('cursor-view');
      if (label) label.textContent = 'EXPLORE';
    } else if (cursorType === 'code') {
      document.body.classList.add('cursor-view');
      if (label) label.textContent = 'VIEW CODE';
    } else {
      document.body.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest(interactiveSelectors);
    if (!target) return;

    document.body.classList.remove('cursor-hover', 'cursor-view');
  });

  // Magnetic button effect on select CTAs
  const magneticElements = document.querySelectorAll('.btn-magnetic');
  magneticElements.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0px, 0px)';
    });
  });
}
