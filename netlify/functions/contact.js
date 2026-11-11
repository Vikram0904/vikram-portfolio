/**
 * Netlify Function: /.netlify/functions/contact
 * Validates inquiry submissions, enforces anti-spam & rate limiting,
 * and delivers formatted HTML + plain-text emails via Brevo transactional API.
 */

const ALLOWED_PROJECT_TYPES = new Set([
  'WordPress Development',
  'Custom Web Application / CMS',
  'CRM & Salesforce Integration',
  'Business Process Automation',
  'Payment & API Integration',
  'Other / General Inquiry'
]);

const ALLOWED_CURRENCIES = new Set([
  'INR',
  'USD',
  'EUR',
  'GBP',
  'AED',
  'AUD',
  'CAD',
  'SGD'
]);

const ALLOWED_TIMELINES = new Set([
  'Not sure',
  'ASAP',
  '1-2 weeks',
  'About 1 month',
  '2-3 months',
  'Flexible'
]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_FORM_FILL_MS = 3000;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 5;

// Best-effort in-memory per-IP rate limit (5 requests/hour); resets on serverless cold starts.
const ipRequestLog = new Map();

function jsonResponse(statusCode, payload, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders
    },
    body: JSON.stringify(payload)
  };
}

function getHeader(headers, key) {
  if (!headers || typeof headers !== 'object') return '';
  const target = key.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === target && typeof v === 'string') {
      return v;
    }
  }
  return '';
}

function getClientIp(event) {
  const headers = event?.headers;
  const nfIp = getHeader(headers, 'x-nf-client-connection-ip').trim();
  if (nfIp) return nfIp;

  const forwarded = getHeader(headers, 'x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }

  const clientIp = getHeader(headers, 'client-ip').trim();
  if (clientIp) return clientIp;

  return 'unknown';
}

function checkAndRecordRateLimit(ip, now = Date.now()) {
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const existing = ipRequestLog.get(ip) || [];
  const recent = existing.filter((ts) => ts > cutoff);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    ipRequestLog.set(ip, recent);
    return false;
  }

  recent.push(now);
  ipRequestLog.set(ip, recent);

  // Prune stale IPs opportunistically to prevent unbounded memory growth
  if (ipRequestLog.size > 500) {
    for (const [key, timestamps] of ipRequestLog.entries()) {
      const valid = timestamps.filter((ts) => ts > cutoff);
      if (valid.length === 0) {
        ipRequestLog.delete(key);
      } else {
        ipRequestLog.set(key, valid);
      }
    }
  }

  return true;
}

function stripCrLf(value) {
  return String(value ?? '')
    .replace(/[\r\n\0]+/g, ' ')
    .trim();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMessageHtml(message) {
  return escapeHtml(message).replace(/\r\n|\r|\n/g, '<br />');
}

function formatReceivedIST(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const period = (map.dayPeriod || '').toUpperCase();
  return `${map.day} ${map.month} ${map.year}, ${map.hour}:${map.minute} ${period} IST`;
}

function formatBudgetFallback(amount, currency) {
  const symbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'AED ',
    AUD: 'AUD ',
    CAD: 'CAD ',
    SGD: 'SGD '
  };
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(amount);
  const prefix = symbols[currency] || `${currency} `;
  return `${prefix}${formatted}`;
}

function validateInquiryPayload(raw, now = Date.now()) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { error: 'Invalid request payload.' };
  }

  // Honeypot field: silently accept spam without sending
  const honeypot = typeof raw.company_website === 'string' ? raw.company_website.trim() : '';
  if (honeypot.length > 0) {
    return { isSpamHoneypot: true };
  }

  // Form timing check (reject submissions faster than 3 seconds)
  const formStartedAt = Number(raw.form_started_at);
  if (!Number.isFinite(formStartedAt) || formStartedAt <= 0) {
    return { error: 'Missing form timing metadata. Please reload the page and try again.' };
  }
  if (now - formStartedAt < MIN_FORM_FILL_MS) {
    return { error: 'Please wait a few seconds before submitting your inquiry.' };
  }

  // Required text fields
  if (typeof raw.name !== 'string') {
    return { error: 'Please enter your name (2–80 characters).' };
  }
  const name = stripCrLf(raw.name);
  if (name.length < 2 || name.length > 80) {
    return { error: 'Please enter your name (2–80 characters).' };
  }

  if (typeof raw.email !== 'string') {
    return { error: 'Please enter a valid email address.' };
  }
  const email = raw.email.trim();
  if (
    email.length === 0 ||
    email.length >= 254 ||
    /[\r\n\s]/.test(email) ||
    !EMAIL_REGEX.test(email)
  ) {
    return { error: 'Please enter a valid email address under 254 characters.' };
  }

  if (typeof raw.message !== 'string') {
    return { error: 'Please enter a project brief between 10 and 5000 characters.' };
  }
  const message = raw.message.trim();
  if (message.length < 10 || message.length > 5000) {
    return { error: 'Please enter a project brief between 10 and 5000 characters.' };
  }

  // Project scope allowlist
  const projectType = typeof raw.project_type === 'string' ? raw.project_type.trim() : '';
  if (!ALLOWED_PROJECT_TYPES.has(projectType)) {
    return { error: 'Please select a valid project scope.' };
  }

  // Currency allowlist
  const budgetCurrency =
    typeof raw.budget_currency === 'string' ? raw.budget_currency.trim().toUpperCase() : '';
  if (!ALLOWED_CURRENCIES.has(budgetCurrency)) {
    return { error: 'Please select a valid budget currency.' };
  }

  // Optional numeric budget (< 1e12)
  let budgetAmount = null;
  const hasBudgetAmount =
    raw.budget_amount !== undefined &&
    raw.budget_amount !== null &&
    String(raw.budget_amount).trim() !== '';

  if (hasBudgetAmount) {
    let parsedAmount;
    if (typeof raw.budget_amount === 'number') {
      parsedAmount = raw.budget_amount;
    } else if (typeof raw.budget_amount === 'string') {
      const rawBudgetStr = raw.budget_amount.trim();
      if (!/^\d+(\.\d+)?$/.test(rawBudgetStr)) {
        return { error: 'Budget amount must be a positive number.' };
      }
      parsedAmount = Number(rawBudgetStr);
    } else {
      return { error: 'Budget amount must be a valid number below 1,000,000,000,000.' };
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount < 0 || parsedAmount >= 1e12) {
      return { error: 'Budget amount must be a valid number below 1,000,000,000,000.' };
    }
    budgetAmount = parsedAmount;
  }

  let budgetDisplay = 'Not specified';
  if (typeof raw.budget_display === 'string' && raw.budget_display.trim() !== '') {
    const cleanDisplay = stripCrLf(raw.budget_display);
    if (cleanDisplay.length > 64) {
      return { error: 'Invalid budget display format.' };
    }
    budgetDisplay = cleanDisplay;
  } else if (budgetAmount !== null) {
    budgetDisplay = formatBudgetFallback(budgetAmount, budgetCurrency);
  }

  // Optional timeline allowlist
  let timeline = '';
  const hasTimeline =
    raw.timeline !== undefined &&
    raw.timeline !== null &&
    String(raw.timeline).trim() !== '';

  if (hasTimeline) {
    const cleanTimeline = typeof raw.timeline === 'string' ? raw.timeline.trim() : '';
    if (!ALLOWED_TIMELINES.has(cleanTimeline)) {
      return { error: 'Please select a valid timeline option.' };
    }
    if (cleanTimeline !== 'Not sure') {
      timeline = cleanTimeline;
    }
  }

  return {
    data: {
      name,
      email,
      projectType,
      budgetCurrency,
      budgetAmount,
      budgetDisplay,
      timeline,
      message
    }
  };
}

function buildEmailHtml({ name, email, projectType, budgetDisplay, timeline, receivedAt, message }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeProjectType = escapeHtml(projectType);
  const safeBudgetDisplay = escapeHtml(budgetDisplay);
  const safeTimeline = escapeHtml(timeline);
  const safeReceivedAt = escapeHtml(receivedAt);
  const safeMessageHtml = formatMessageHtml(message);
  const preheaderText = `${safeName} sent a ${safeProjectType} inquiry`;
  const replyHref = `mailto:${safeEmail}?subject=${encodeURIComponent('Re: Your project inquiry')}`;

  const timelineRow = timeline
    ? `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;background-color:#f9fafb;color:#4b5563;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;width:140px;vertical-align:top;">Timeline</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;background-color:#ffffff;color:#111827;font-family:Arial,Helvetica,sans-serif;font-size:14px;vertical-align:top;">${safeTimeline}</td>
      </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>New Project Inquiry</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;color:#111827;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <!-- Preheader text -->
  <div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">
    ${preheaderText}&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f5f7;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <!-- Copper Top Accent Line -->
          <tr>
            <td style="height:4px;line-height:4px;font-size:4px;background-color:#FF6B35;">&nbsp;</td>
          </tr>

          <!-- Header Band -->
          <tr>
            <td style="background-color:#08090C;padding:28px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom:10px;">
                    <span style="display:inline-block;padding:5px 12px;background-color:#24140d;border:1px solid #FF6B35;border-radius:999px;color:#FF8C61;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">
                      ${safeProjectType}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:700;line-height:1.25;">
                    New Project Inquiry
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Details Table -->
          <tr>
            <td style="padding:28px 32px 12px 32px;background-color:#ffffff;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e5e7eb;border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;background-color:#f9fafb;color:#4b5563;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;width:140px;vertical-align:top;">Name</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;background-color:#ffffff;color:#111827;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;vertical-align:top;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;background-color:#f9fafb;color:#4b5563;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;width:140px;vertical-align:top;">Email</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;vertical-align:top;">
                    <a href="mailto:${safeEmail}" style="color:#FF6B35;text-decoration:underline;font-weight:600;">${safeEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;background-color:#f9fafb;color:#4b5563;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;width:140px;vertical-align:top;">Project scope</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;background-color:#ffffff;color:#111827;font-family:Arial,Helvetica,sans-serif;font-size:14px;vertical-align:top;">${safeProjectType}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;background-color:#f9fafb;color:#4b5563;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;width:140px;vertical-align:top;">Budget</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;background-color:#ffffff;color:#111827;font-family:Arial,Helvetica,sans-serif;font-size:14px;vertical-align:top;">${safeBudgetDisplay}</td>
                </tr>${timelineRow}
                <tr>
                  <td style="padding:12px 16px;background-color:#f9fafb;color:#4b5563;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;width:140px;vertical-align:top;">Received</td>
                  <td style="padding:12px 16px;background-color:#ffffff;color:#374151;font-family:Arial,Helvetica,sans-serif;font-size:14px;vertical-align:top;">${safeReceivedAt}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Block -->
          <tr>
            <td style="padding:16px 32px 24px 32px;background-color:#ffffff;">
              <p style="margin:0 0 8px 0;color:#4b5563;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">
                Project Brief &amp; Message
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding:16px;background-color:#f9fafb;border:1px solid #e5e7eb;border-left:4px solid #FF6B35;color:#111827;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.65;">
                    ${safeMessageHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Reply CTA Button -->
          <tr>
            <td style="padding:4px 32px 32px 32px;background-color:#ffffff;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color:#FF6B35;border-radius:8px;">
                    <a href="${replyHref}" style="display:inline-block;padding:13px 24px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;text-decoration:none;border-radius:8px;">
                      Reply to ${safeName}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;color:#6b7280;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;text-align:center;">
              Sent from the contact form at vikram-web-dev.netlify.app
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildEmailText({ name, email, projectType, budgetDisplay, timeline, receivedAt, message }) {
  const lines = [
    'NEW PROJECT INQUIRY',
    '===================',
    '',
    `Name:          ${name}`,
    `Email:         ${email}`,
    `Project scope: ${projectType}`,
    `Budget:        ${budgetDisplay}`
  ];

  if (timeline) {
    lines.push(`Timeline:      ${timeline}`);
  }

  lines.push(
    `Received:      ${receivedAt}`,
    '',
    'Message:',
    '--------',
    message,
    '',
    '--',
    'Sent from the contact form at vikram-web-dev.netlify.app'
  );

  return lines.join('\n');
}

/**
 * Isolated transactional email sender (Brevo v3 SMTP API).
 * Replace this function body to swap providers (e.g., Resend) without changing validation/formatting.
 */
async function sendEmail({
  apiKey,
  toEmail,
  fromEmail,
  fromName,
  replyToName,
  replyToEmail,
  subject,
  htmlContent,
  textContent
}) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify({
      sender: {
        name: stripCrLf(fromName),
        email: stripCrLf(fromEmail)
      },
      to: [
        {
          email: stripCrLf(toEmail)
        }
      ],
      replyTo: {
        name: stripCrLf(replyToName),
        email: stripCrLf(replyToEmail)
      },
      subject: stripCrLf(subject),
      htmlContent,
      textContent
    }),
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    let errDetail = '';
    try {
      const errJson = await response.json();
      errDetail = errJson?.code || errJson?.message || '';
    } catch {
      errDetail = '';
    }
    const err = new Error(`Email provider rejected request (${response.status})${errDetail ? `: ${errDetail}` : ''}`);
    err.providerStatus = response.status;
    throw err;
  }

  return response.json().catch(() => ({ ok: true }));
}

export async function handler(event) {
  if (event?.httpMethod !== 'POST') {
    return jsonResponse(
      405,
      { ok: false, error: 'Method not allowed.' },
      { Allow: 'POST' }
    );
  }

  let parsedBody;
  try {
    const rawText = event.isBase64Encoded
      ? Buffer.from(event.body || '', 'base64').toString('utf8')
      : event.body || '';
    parsedBody = JSON.parse(rawText);
  } catch {
    return jsonResponse(400, { ok: false, error: 'Invalid JSON request body.' });
  }

  const clientIp = getClientIp(event);
  const now = Date.now();

  if (!checkAndRecordRateLimit(clientIp, now)) {
    return jsonResponse(429, {
      ok: false,
      error: 'Too many submissions from this IP. Please try again later.'
    });
  }

  const validation = validateInquiryPayload(parsedBody, now);
  if (validation.isSpamHoneypot) {
    return jsonResponse(200, { ok: true });
  }

  if (validation.error) {
    return jsonResponse(400, { ok: false, error: validation.error });
  }

  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  const toEmail = stripCrLf(process.env.CONTACT_TO_EMAIL || 'vikramnsk4@gmail.com');
  const fromEmail = stripCrLf(process.env.CONTACT_FROM_EMAIL || '');
  const fromName = stripCrLf(process.env.CONTACT_FROM_NAME || 'Portfolio Contact Form');

  if (!apiKey || !fromEmail) {
    console.error('Contact function misconfigured: missing BREVO_API_KEY or CONTACT_FROM_EMAIL.');
    return jsonResponse(500, {
      ok: false,
      error: 'Unable to send inquiry right now. Please try again later.'
    });
  }

  const inquiry = validation.data;
  const receivedAt = formatReceivedIST(new Date(now));
  const subject = stripCrLf(`New project inquiry: ${inquiry.projectType} | ${inquiry.name}`);
  const htmlContent = buildEmailHtml({ ...inquiry, receivedAt });
  const textContent = buildEmailText({ ...inquiry, receivedAt });

  try {
    await sendEmail({
      apiKey,
      toEmail,
      fromEmail,
      fromName,
      replyToName: inquiry.name,
      replyToEmail: inquiry.email,
      subject,
      htmlContent,
      textContent
    });

    return jsonResponse(200, { ok: true });
  } catch (err) {
    console.error('Contact inquiry delivery failed:', err?.message || 'Unknown error');
    return jsonResponse(500, {
      ok: false,
      error: 'Unable to send inquiry right now. Please try again later.'
    });
  }
}

// Exported for local automated unit tests
export {
  validateInquiryPayload,
  buildEmailHtml,
  buildEmailText,
  formatReceivedIST,
  stripCrLf,
  escapeHtml
};
