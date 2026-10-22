/**
 * VIKRAM.DEV — Interactive Contact Form & Confetti Celebration
 */
import confetti from 'canvas-confetti';
import { soundEngine } from './audio-feedback.js';

export function initContactForm() {
  const form = document.getElementById('contact-form');
  const typePills = document.querySelectorAll('.type-pill');
  const projectTypeInput = document.getElementById('project_type_input');
  const submitBtn = document.getElementById('contact-submit-btn');
  const feedbackToast = document.getElementById('contact-toast');

  if (!form) return;

  const scopeMetadata = {
    'Custom WordPress Theme/Plugin': {
      timeline: '2 – 3 Weeks',
      stack: 'PHP 8.2 OOP + Custom React Blocks',
      guarantee: '95+ PageSpeed • Zero Bloat'
    },
    'Payment Gateway (Stripe/Square)': {
      timeline: '1 – 2 Weeks',
      stack: 'Stripe 3DS2 / Square SDK + Webhook Vault',
      guarantee: 'PCI-DSS Compliant • Idempotent Orders'
    },
    'AI / MCP Server Automation': {
      timeline: '2 – 3 Weeks',
      stack: 'Python MCP Server + Claude/OpenAI Tools',
      guarantee: '< 50ms LLM Context Routing'
    },
    'Speed & Core Web Vitals': {
      timeline: '3 – 5 Days',
      stack: 'Redis Cache + Query Indexing + Brotli',
      guarantee: 'PageSpeed 95+ Mobile & Desktop'
    },
    'Full-Stack Web App': {
      timeline: '3 – 4 Weeks',
      stack: 'React + Node/PHP REST + MySQL InnoDB',
      guarantee: 'Scalable Architecture • End-to-End Tests'
    }
  };

  const hudTimeline = document.getElementById('hud-timeline');
  const hudStack = document.getElementById('hud-stack');
  const hudGuarantee = document.getElementById('hud-guarantee');
  const hudContainer = document.getElementById('scope-telemetry-hud');

  // Project Type Pill Selection
  typePills.forEach((pill) => {
    pill.addEventListener('click', () => {
      typePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const val = pill.getAttribute('data-value') || pill.textContent;
      if (projectTypeInput) {
        projectTypeInput.value = val;
      }

      // Update telemetry HUD with micro-flash animation
      if (scopeMetadata[val] && hudContainer) {
        hudContainer.classList.add('pulse-telemetry');
        setTimeout(() => hudContainer.classList.remove('pulse-telemetry'), 400);

        if (hudTimeline) hudTimeline.textContent = scopeMetadata[val].timeline;
        if (hudStack) hudStack.textContent = scopeMetadata[val].stack;
        if (hudGuarantee) hudGuarantee.textContent = scopeMetadata[val].guarantee;
      }
    });
  });

  // Form Submit Handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact_name')?.value.trim();
    const email = document.getElementById('contact_email')?.value.trim();
    const message = document.getElementById('contact_message')?.value.trim();

    if (!name || !email || !message) {
      alert('Please fill out all required fields (Name, Email, and Message).');
      return;
    }

    // Set Loading State
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span style="display: inline-flex; align-items: center; gap: 0.5rem;">
          <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          TRANSMITTING DISPATCH...
        </span>
      `;
    }

    // Simulate Instant Transmission
    setTimeout(() => {
      // Confetti burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B35', '#FF9E00', '#00F0FF', '#FFFFFF']
      });

      soundEngine.playSuccess();

      // Show Toast / Success Banner
      if (feedbackToast) {
        feedbackToast.style.display = 'block';
        feedbackToast.innerHTML = `
          <div style="display: flex; align-items: flex-start; gap: 1rem; padding: 1.25rem; background: rgba(16, 185, 129, 0.15); border: 1px solid #10B981; border-radius: var(--radius-md); margin-top: 1.5rem;">
            <div style="color: #10B981; font-size: 1.5rem;">✓</div>
            <div>
              <h4 style="font-family: var(--font-display); font-weight: 700; color: #FFFFFF; margin-bottom: 0.25rem;">Dispatch Received, ${name}!</h4>
              <p style="font-size: 0.88rem; color: #A7F3D0; line-height: 1.5;">Thank you for reaching out. Vikram has received your message and will review your project requirements within 24 hours at <strong>${email}</strong>.</p>
            </div>
          </div>
        `;
      }

      // Reset Button and Form
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>MESSAGE TRANSMITTED ✓</span>`;
      }
      form.reset();
      typePills.forEach((p, idx) => p.classList.toggle('active', idx === 0));
    }, 900);
  });
}
