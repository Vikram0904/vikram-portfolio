/**
 * VIKRAM.DEV — Enterprise Integrations & Autonomous Workflow Bus Engine
 * 
 * Inspired by AigentX and top-tier linear node network diagrams:
 * - 6 Top Sources (WordPress, Stripe, Webhooks, Figma, MySQL, GitHub)
 * - Central Processor Node (VIKRAM AUTOMATION CORE with + crosshairs)
 * - 6 Bottom Actions (Salesforce, HubSpot/Zoho, Pabbly/Zapier, Make/n8n, OpenAI, MCP)
 * - Guaranteed 100% visibility from Frame 0.
 * - Interactive hover lighting, traveling laser pulses, and test packet simulation.
 */

import { gsap } from 'gsap';

export function initIntegrations() {
  const section = document.getElementById('integrations');
  if (!section) return;

  const coreNode = section.querySelector('#integration-core-node');
  const testBtn = section.querySelector('#integration-test-btn');
  const statusTicker = section.querySelector('#integration-status-text');
  const sourceCards = section.querySelectorAll('.integration-source-card');
  const actionCards = section.querySelectorAll('.integration-action-card');
  const upperStems = section.querySelectorAll('.upper-bus .bus-stem');
  const lowerStems = section.querySelectorAll('.lower-bus .bus-stem');
  const upperRail = section.querySelector('.upper-bus .bus-horizontal-rail');
  const lowerRail = section.querySelector('.lower-bus .bus-horizontal-rail');

  // 1. Interactive Hover on Source Cards
  sourceCards.forEach((card, idx) => {
    card.addEventListener('mouseenter', () => {
      const name = card.getAttribute('data-name') || 'Source';
      const protocol = card.getAttribute('data-protocol') || 'REST Webhook';
      
      // Highlight matching stem and trunk
      if (upperStems[idx]) upperStems[idx].classList.add('is-active');
      if (coreNode) coreNode.classList.add('is-processing');

      if (statusTicker) {
        statusTicker.innerHTML = `<span class="status-highlight">SOURCE INGESTION:</span> ${name} &rarr; Ingestion via ${protocol} (<span class="status-speed">&lt;24ms</span>)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      if (upperStems[idx]) upperStems[idx].classList.remove('is-active');
      if (coreNode) coreNode.classList.remove('is-processing');
      resetStatus();
    });
  });

  // 2. Interactive Hover on Action Cards
  actionCards.forEach((card, idx) => {
    card.addEventListener('mouseenter', () => {
      const name = card.getAttribute('data-name') || 'Destination';
      const action = card.getAttribute('data-action') || 'Automated Sync';

      // Highlight matching stem and trunk
      if (lowerStems[idx]) lowerStems[idx].classList.add('is-active');
      if (coreNode) coreNode.classList.add('is-processing');

      if (statusTicker) {
        statusTicker.innerHTML = `<span class="status-highlight">DISPATCH ACTIVE:</span> Core &rarr; ${name} (${action})`;
      }
    });

    card.addEventListener('mouseleave', () => {
      if (lowerStems[idx]) lowerStems[idx].classList.remove('is-active');
      if (coreNode) coreNode.classList.remove('is-processing');
      resetStatus();
    });
  });

  function resetStatus() {
    if (statusTicker) {
      statusTicker.innerHTML = `<span class="pulse-dot-green"></span> <span><strong>SYSTEM NOMINAL:</strong> 12 Endpoints Connected • 99.99% Reliability • Zero Data Loss</span>`;
    }
  }

  // 3. Test Packet Simulation Trigger
  if (testBtn) {
    testBtn.addEventListener('click', (e) => {
      e.preventDefault();
      fireTestPacket();
    });
  }

  if (coreNode) {
    coreNode.addEventListener('click', () => {
      fireTestPacket();
    });
  }

  let isFiring = false;
  function fireTestPacket() {
    if (isFiring) return;
    isFiring = true;

    // Optional audio click
    if (window.soundEngine && typeof window.soundEngine.playClick === 'function') {
      window.soundEngine.playClick();
    }

    if (coreNode) {
      coreNode.classList.add('is-firing');
    }

    if (statusTicker) {
      statusTicker.innerHTML = `<span class="status-firing">BROADCASTING TEST PACKET:</span> Pinging all 12 connected endpoints simultaneously...`;
    }

    // Energize all stems and rails
    upperStems.forEach(stem => stem.classList.add('is-active'));
    lowerStems.forEach(stem => stem.classList.add('is-active'));

    const tl = gsap.timeline({
      onComplete: () => {
        if (coreNode) coreNode.classList.remove('is-firing');
        upperStems.forEach(stem => stem.classList.remove('is-active'));
        lowerStems.forEach(stem => stem.classList.remove('is-active'));

        if (statusTicker) {
          statusTicker.innerHTML = `<span class="status-success">✓ ALL 12 ENDPOINTS CONFIRMED:</span> Payload executed with 0 dropped events (32ms roundtrip)`;
        }

        setTimeout(() => {
          resetStatus();
          isFiring = false;
        }, 3200);
      }
    });

    tl.to('.integration-card', {
      borderColor: '#00F0FF',
      boxShadow: '0 0 24px rgba(0, 240, 255, 0.4)',
      duration: 0.35,
      stagger: 0.04,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out'
    });
  }
}
