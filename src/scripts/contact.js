/**
 * VIKRAM.DEV — Interactive Contact Section Controller
 * Handles dynamic Scope HUD, ARIA radiogroup pills, multi-currency budget formatting,
 * timeline selection, client-side validation, and inquiry submission flow.
 */
import confetti from 'canvas-confetti';
import { soundEngine } from './audio-feedback.js';

// Editable list of CMS options displayed in the HUD when "Custom Web Application / CMS" is selected.
const CMS_OPTIONS = [
  'Custom CMS (React + Go)',
  'Headless WordPress',
  'Strapi',
  'Sanity',
  'Contentful'
];

const SCOPE_DATA = {
  'WordPress Development': {
    scope: 'WordPress Development',
    tech: ['PHP 8', 'Custom Themes', 'Custom Plugins', 'Gutenberg Blocks', 'REST API', 'AJAX'],
    approach: 'Clean OOP code, fast and maintainable'
  },
  'Custom Web Application / CMS': {
    scope: 'Custom Web Application / CMS',
    tech: ['JavaScript (ES6+)', 'React', 'Next.js', 'Go', 'REST APIs', 'MySQL'],
    approach: 'Modular, API-first and scalable',
    extra: {
      label: 'CMS OPTIONS',
      items: CMS_OPTIONS
    }
  },
  'CRM & Salesforce Integration': {
    scope: 'CRM & Salesforce Integration',
    tech: ['Salesforce', 'Web-to-Lead', 'REST APIs', 'Webhooks', 'Pabbly Connect'],
    approach: 'Automated lead capture and clean data sync'
  },
  'Business Process Automation': {
    scope: 'Business Process Automation',
    tech: ['Pabbly Connect', 'Zapier', 'Make', 'Webhooks', 'REST APIs'],
    approach: 'Fewer manual steps, reliable workflows with error handling'
  },
  'Payment & API Integration': {
    scope: 'Payment & API Integration',
    tech: ['Stripe', 'Square', 'Webhooks', 'REST APIs', 'PHP and JavaScript'],
    approach: 'Secure server-side verification and safe order handling'
  },
  'Other / General Inquiry': {
    scope: 'Other / General Inquiry',
    tech: ['Chosen after we talk'],
    approach: 'Honest advice on the right tool for the problem'
  }
};

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  AUD: 'AUD ',
  CAD: 'CAD ',
  SGD: 'SGD '
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const SUBMIT_BTN_DEFAULT_HTML = `
  <span class="submit-btn-label">SEND PROJECT BRIEF</span>
  <svg class="submit-btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
`;

const SUBMIT_BTN_LOADING_HTML = `
  <svg class="contact-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  <span class="submit-btn-label">SENDING...</span>
`;

/**
 * Sends the validated inquiry payload to the Netlify contact serverless function.
 */
async function sendInquiry(payload) {
  const response = await fetch('/.netlify/functions/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || !data?.ok) {
    const err = new Error(data?.error || `Request failed with status ${response.status}`);
    err.status = response.status;
    err.isServerMessage = Boolean(
      data?.error && response.status >= 400 && response.status < 500
    );
    throw err;
  }

  return data;
}

function getDefaultCurrency() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return (tz === 'Asia/Calcutta' || tz === 'Asia/Kolkata') ? 'INR' : 'USD';
  } catch {
    return 'USD';
  }
}

function formatBudgetDigits(digits, currency) {
  if (!digits) return '';
  const numericValue = Number(digits);
  if (!Number.isFinite(numericValue)) return '';
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(numericValue);
}

function renderChips(container, items) {
  if (!container) return;
  container.replaceChildren();
  items.forEach((item) => {
    const chip = document.createElement('span');
    chip.className = 'hud-chip';
    chip.textContent = item;
    container.appendChild(chip);
  });
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }
  try {
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.setAttribute('readonly', '');
    temp.style.position = 'fixed';
    temp.style.top = '-9999px';
    temp.style.left = '-9999px';
    document.body.appendChild(temp);
    temp.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(temp);
    return ok;
  } catch {
    return false;
  }
}

export function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const typePills = Array.from(form.querySelectorAll('.type-pill'));
  const projectTypeInput = document.getElementById('project_type_input');
  const submitBtn = document.getElementById('contact-submit-btn');
  const feedbackToast = document.getElementById('contact-toast');

  // HUD Elements
  const hudContainer = document.getElementById('scope-telemetry-hud');
  const hudScope = document.getElementById('hud-scope');
  const hudTech = document.getElementById('hud-tech');
  const hudApproach = document.getElementById('hud-approach');
  const hudExtraRow = document.getElementById('hud-extra-row');
  const hudExtraLabel = document.getElementById('hud-extra-label');
  const hudExtraItems = document.getElementById('hud-extra-items');

  // Form Field Elements
  const nameInput = document.getElementById('contact_name');
  const emailInput = document.getElementById('contact_email');
  const budgetCurrencySelect = document.getElementById('contact_budget_currency');
  const budgetAmountInput = document.getElementById('contact_budget_amount');
  const budgetUnsureCheckbox = document.getElementById('contact_budget_unsure');
  const budgetRow = document.getElementById('budget-input-row');
  const timelineSelect = document.getElementById('contact_timeline');
  const messageTextarea = document.getElementById('contact_message');
  const messageCounter = document.getElementById('contact_message_counter');
  const honeypotInput = document.getElementById('contact_company_website');
  const formStartedAtInput = document.getElementById('contact_form_started_at');

  let formStartedAt = Date.now();
  if (formStartedAtInput) {
    formStartedAtInput.value = String(formStartedAt);
  }

  // Error Containers
  const nameError = document.getElementById('contact_name_error');
  const emailError = document.getElementById('contact_email_error');
  const messageError = document.getElementById('contact_message_error');

  // Left-Column Copy Email Button
  const copyEmailBtn = document.getElementById('contact-copy-email');
  let copyTimer = null;

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const ok = await copyTextToClipboard('vikramnsk4@gmail.com');
      if (!ok) return;

      copyEmailBtn.classList.add('is-copied');
      const labelEl = copyEmailBtn.querySelector('.copy-btn-text');
      if (labelEl) labelEl.textContent = 'Copied';

      if (copyTimer) clearTimeout(copyTimer);
      copyTimer = setTimeout(() => {
        copyEmailBtn.classList.remove('is-copied');
        if (labelEl) labelEl.textContent = 'Copy';
      }, 2000);
    });
  }

  // Dynamic Scope HUD Updater
  let hudAnimTimer = null;
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function updateScopeHud(scopeKey, { animate = true } = {}) {
    const entry = SCOPE_DATA[scopeKey];
    if (!entry || !hudContainer) return;

    if (hudScope) hudScope.textContent = entry.scope;
    if (hudTech) renderChips(hudTech, entry.tech);
    if (hudApproach) hudApproach.textContent = entry.approach;

    if (hudExtraRow) {
      if (entry.extra && Array.isArray(entry.extra.items) && entry.extra.items.length > 0) {
        if (hudExtraLabel) hudExtraLabel.textContent = entry.extra.label;
        if (hudExtraItems) renderChips(hudExtraItems, entry.extra.items);
        hudExtraRow.hidden = false;
      } else {
        if (hudExtraItems) hudExtraItems.replaceChildren();
        hudExtraRow.hidden = true;
      }
    }

    if (animate && !reducedMotionQuery.matches) {
      hudContainer.classList.remove('is-swapping');
      void hudContainer.offsetWidth;
      hudContainer.classList.add('is-swapping');
      if (hudAnimTimer) clearTimeout(hudAnimTimer);
      hudAnimTimer = setTimeout(() => {
        hudContainer.classList.remove('is-swapping');
      }, 220);
    }
  }

  function selectScopePill(targetPill, { animate = true, focus = false } = {}) {
    if (!targetPill) return;

    typePills.forEach((pill) => {
      const isSelected = pill === targetPill;
      pill.classList.toggle('active', isSelected);
      pill.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      pill.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    const scopeVal = targetPill.getAttribute('data-value') || '';
    if (projectTypeInput) {
      projectTypeInput.value = scopeVal;
    }

    updateScopeHud(scopeVal, { animate });

    if (focus) {
      targetPill.focus();
    }
  }

  // Click & Arrow-Key Radio Group Navigation
  typePills.forEach((pill, index) => {
    pill.addEventListener('click', () => {
      selectScopePill(pill, { animate: true });
    });

    pill.addEventListener('keydown', (e) => {
      let nextIndex = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIndex = (index + 1) % typePills.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIndex = (index - 1 + typePills.length) % typePills.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = typePills.length - 1;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        selectScopePill(typePills[nextIndex], { animate: true, focus: true });
      }
    });
  });

  // Initial HUD render for the active pill on page load
  const initialActivePill = typePills.find((p) => p.classList.contains('active')) || typePills[0];
  if (initialActivePill) {
    selectScopePill(initialActivePill, { animate: false });
  }

  // Budget Default Currency & Live Formatting
  function applyDefaultCurrency() {
    if (budgetCurrencySelect) {
      budgetCurrencySelect.value = getDefaultCurrency();
    }
  }
  applyDefaultCurrency();

  function formatBudgetInputKeepingCaret() {
    if (!budgetAmountInput || !budgetCurrencySelect) return;

    const rawVal = budgetAmountInput.value;
    const selectionStart = budgetAmountInput.selectionStart ?? rawVal.length;
    const digitsBeforeCaret = rawVal.slice(0, selectionStart).replace(/\D/g, '').length;

    const cleanDigits = rawVal.replace(/\D/g, '').slice(0, 12);
    const formatted = formatBudgetDigits(cleanDigits, budgetCurrencySelect.value);

    budgetAmountInput.value = formatted;

    if (document.activeElement === budgetAmountInput) {
      let nextCaretPos = 0;
      let seenDigits = 0;
      while (nextCaretPos < formatted.length && seenDigits < digitsBeforeCaret) {
        if (/\d/.test(formatted[nextCaretPos])) {
          seenDigits++;
        }
        nextCaretPos++;
      }
      budgetAmountInput.setSelectionRange(nextCaretPos, nextCaretPos);
    }
  }

  if (budgetAmountInput) {
    budgetAmountInput.addEventListener('input', formatBudgetInputKeepingCaret);
  }

  if (budgetCurrencySelect) {
    budgetCurrencySelect.addEventListener('change', () => {
      if (budgetAmountInput && budgetAmountInput.value) {
        const cleanDigits = budgetAmountInput.value.replace(/\D/g, '').slice(0, 12);
        budgetAmountInput.value = formatBudgetDigits(cleanDigits, budgetCurrencySelect.value);
      }
    });
  }

  function syncBudgetUnsureState() {
    const isUnsure = Boolean(budgetUnsureCheckbox?.checked);
    if (budgetAmountInput) {
      budgetAmountInput.disabled = isUnsure;
    }
    if (budgetRow) {
      budgetRow.classList.toggle('is-disabled', isUnsure);
    }
  }

  if (budgetUnsureCheckbox) {
    budgetUnsureCheckbox.addEventListener('change', syncBudgetUnsureState);
    syncBudgetUnsureState();
  }

  // Auto-Grow Textarea & Live Character Counter
  function updateTextareaMetrics() {
    if (!messageTextarea) return;

    messageTextarea.style.height = 'auto';
    messageTextarea.style.height = `${messageTextarea.scrollHeight}px`;

    if (messageCounter) {
      const length = messageTextarea.value.length;
      messageCounter.textContent = `${length} / 2000`;
      messageCounter.classList.toggle('is-over-limit', length > 2000);
    }
  }

  if (messageTextarea) {
    messageTextarea.addEventListener('input', updateTextareaMetrics);
  }

  // Inline Validation Helpers
  function setFieldError(inputEl, errorEl, message) {
    if (!inputEl || !errorEl) return;
    if (message) {
      inputEl.setAttribute('aria-invalid', 'true');
      inputEl.classList.add('is-invalid');
      errorEl.textContent = message;
    } else {
      inputEl.removeAttribute('aria-invalid');
      inputEl.classList.remove('is-invalid');
      errorEl.textContent = '';
    }
  }

  function validateName() {
    const val = (nameInput?.value || '').trim();
    if (val.length < 2 || val.length > 80) {
      setFieldError(nameInput, nameError, 'Please enter your name (2–80 characters).');
      return false;
    }
    setFieldError(nameInput, nameError, '');
    return true;
  }

  function validateEmail() {
    const val = (emailInput?.value || '').trim();
    if (!EMAIL_REGEX.test(val)) {
      setFieldError(emailInput, emailError, 'Please enter a valid email address.');
      return false;
    }
    setFieldError(emailInput, emailError, '');
    return true;
  }

  function validateMessage() {
    const val = (messageTextarea?.value || '').trim();
    if (val.length < 10 || val.length > 2000) {
      setFieldError(messageTextarea, messageError, 'Please enter a project brief between 10 and 2000 characters.');
      return false;
    }
    setFieldError(messageTextarea, messageError, '');
    return true;
  }

  if (nameInput) {
    nameInput.addEventListener('input', () => {
      if (nameInput.classList.contains('is-invalid')) validateName();
    });
  }

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      if (emailInput.classList.contains('is-invalid')) validateEmail();
    });
  }

  if (messageTextarea) {
    messageTextarea.addEventListener('input', () => {
      if (messageTextarea.classList.contains('is-invalid')) validateMessage();
    });
  }

  // Toast Rendering Helpers (XSS-safe text insertion)
  function showToast({ type, title, text, mailtoEmail }) {
    if (!feedbackToast) return;

    feedbackToast.className = `contact-toast contact-toast--${type}`;
    feedbackToast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    feedbackToast.replaceChildren();

    const icon = document.createElement('span');
    icon.className = 'contact-toast-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = type === 'error' ? '!' : '✓';

    const body = document.createElement('div');
    body.className = 'contact-toast-body';

    if (title) {
      const heading = document.createElement('strong');
      heading.className = 'contact-toast-title';
      heading.textContent = title;
      body.appendChild(heading);
    }

    const msg = document.createElement('p');
    msg.className = 'contact-toast-text';
    msg.textContent = text;

    if (mailtoEmail) {
      msg.appendChild(document.createTextNode(' '));
      const link = document.createElement('a');
      link.href = `mailto:${mailtoEmail}`;
      link.className = 'contact-toast-link';
      link.textContent = mailtoEmail;
      msg.appendChild(link);
      msg.appendChild(document.createTextNode('.'));
    }

    body.appendChild(msg);
    feedbackToast.appendChild(icon);
    feedbackToast.appendChild(body);
    feedbackToast.hidden = false;
  }

  // Form Submit Handler
  let isSubmitting = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (feedbackToast) {
      feedbackToast.hidden = true;
    }

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isMessageValid = validateMessage();

    if (!isNameValid || !isEmailValid || !isMessageValid) {
      const firstInvalid = !isNameValid ? nameInput : !isEmailValid ? emailInput : messageTextarea;
      firstInvalid?.focus();
      return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const projectType = projectTypeInput?.value || 'WordPress Development';
    const budgetCurrency = budgetCurrencySelect?.value || getDefaultCurrency();
    const isBudgetUnsure = Boolean(budgetUnsureCheckbox?.checked);
    const rawDigits = (budgetAmountInput?.value || '').replace(/\D/g, '').slice(0, 12);

    let budgetAmount = '';
    let budgetDisplay = 'Not specified';

    if (!isBudgetUnsure && rawDigits.length > 0) {
      budgetAmount = Number(rawDigits);
      const formattedNum = formatBudgetDigits(rawDigits, budgetCurrency);
      const symbol = CURRENCY_SYMBOLS[budgetCurrency] || `${budgetCurrency} `;
      budgetDisplay = `${symbol}${formattedNum}`;
    }

    const timeline = timelineSelect?.value || 'Not sure';
    const message = messageTextarea.value.trim();
    const companyWebsite = honeypotInput ? honeypotInput.value : '';
    const startedAtValue = formStartedAtInput?.value
      ? Number(formStartedAtInput.value) || formStartedAt
      : formStartedAt;

    const payload = {
      name,
      email,
      project_type: projectType,
      budget_amount: budgetAmount,
      budget_currency: budgetCurrency,
      budget_display: budgetDisplay,
      timeline,
      message,
      company_website: companyWebsite,
      form_started_at: startedAtValue
    };

    isSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('is-loading');
      submitBtn.innerHTML = SUBMIT_BTN_LOADING_HTML;
    }

    try {
      await sendInquiry(payload);

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF6B35', '#FF9E00', '#00F0FF', '#FFFFFF']
        });
      } catch {
        // Ignore confetti failures in constrained environments
      }

      try {
        soundEngine.playSuccess();
      } catch {
        // Ignore audio failures if context is locked
      }

      showToast({
        type: 'success',
        text: `Thanks, ${name}! Your brief is sent. I'll reply to ${email} within 24 hours.`
      });

      // Reset form & restore initial state (preserve user inputs on error instead)
      form.reset();
      formStartedAt = Date.now();
      if (formStartedAtInput) {
        formStartedAtInput.value = String(formStartedAt);
      }
      applyDefaultCurrency();
      syncBudgetUnsureState();
      if (messageTextarea) {
        messageTextarea.style.height = '';
      }
      if (messageCounter) {
        messageCounter.textContent = '0 / 2000';
        messageCounter.classList.remove('is-over-limit');
      }
      setFieldError(nameInput, nameError, '');
      setFieldError(emailInput, emailError, '');
      setFieldError(messageTextarea, messageError, '');

      if (typePills.length > 0) {
        selectScopePill(typePills[0], { animate: false });
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: err?.isServerMessage ? 'Submission could not be completed.' : 'Unable to send brief right now.',
        text: err?.isServerMessage
          ? `${err.message} You can also email`
          : 'Please try again or email directly at',
        mailtoEmail: 'vikramnsk4@gmail.com'
      });
    } finally {
      isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-loading');
        submitBtn.innerHTML = SUBMIT_BTN_DEFAULT_HTML;
      }
    }
  });
}
