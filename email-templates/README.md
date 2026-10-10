# Flintworks — Email Templates

Production-ready HTML email templates for Flintworks. All templates use **inline CSS only**, **table-based layouts**, and a **600px max-width** — compatible with Gmail, Outlook, and Apple Mail.

> **Before going live:** Each `.html` file contains a `<!-- TODO: replace placeholder links and sender address before going live -->` comment at the top. Make sure to replace all `{{placeholder}}` values and verify the sender address in your email provider.

---

## Templates

### 1. `contact-confirmation.html`
Sent automatically to the client after they submit the contact form on flintworks.hu.

**Purpose:** Acknowledge receipt, confirm a 24hr response window, and show the client a summary of what they submitted.

| Placeholder | Replace with |
|---|---|
| `{{name}}` | The submitter's full name (e.g. `"Jane Smith"`) |
| `{{service}}` | The service they selected (e.g. `"Web Development"`) |
| `{{message}}` | The message body they typed into the form |

---

### 2. `contact-notification.html`
Sent internally to the Flintworks team every time a new contact form submission comes in.

**Purpose:** Full dump of every form field in a clean data table so the team can respond immediately.

| Placeholder | Replace with |
|---|---|
| `{{name}}` | Submitter's full name |
| `{{email}}` | Submitter's email address (also used in the mailto CTA) |
| `{{company}}` | Submitter's company name (may be empty — handle gracefully) |
| `{{service}}` | Service they selected |
| `{{message}}` | Their message |

---

### 3. `marketing-waitlist.html`
Sent to anyone who signs up for the waitlist for the Flintworks marketing department launch.

**Purpose:** Confirm their spot on the list, tease the 8 upcoming marketing services, and keep them warm until launch.

| Placeholder | Replace with |
|---|---|
| `{{name}}` | The subscriber's first name or full name |

---

### 4. `quote-followup.html`
Sent after a sales call or quote delivery.

**Purpose:** Thank the prospect, recap the project scope and price estimate discussed, lay out the next steps, and drive them to book a follow-up call.

| Placeholder | Replace with |
|---|---|
| `{{name}}` | Prospect's first name or full name |
| `{{project_scope}}` | 1–3 sentence description of the agreed scope |
| `{{price_estimate}}` | The quoted figure (e.g. `"£4,500"` or `"£4,500 – £6,000"`) |
| `{{next_steps}}` | Numbered or prose description of what happens next |

---

### 5. `invoice-maintenance.html`
Monthly maintenance invoice sent to clients on a retainer/maintenance plan covering domain renewal, email hosting, server hosting, and ongoing developer upkeep. Bilingual (Hungarian / English) to comply with Hungarian invoicing requirements.

> **Legal note:** Hungarian invoices (számlák) are legally required to display both the **seller's tax number** (`adószám`) and the **buyer's tax number** on the document. This template includes both as `{{flintworks_tax_number}}` and `{{client_tax_number}}`. Do not omit these fields when sending to Hungarian entities.

**Purpose:** Deliver a professional, legally-compliant monthly invoice with itemised line items, VAT breakdown, and payment details. Includes a commented-out `<!-- PAID STAMP -->` block that can be uncommented once the invoice is settled.

| Placeholder | Replace with |
|---|---|
| `{{client_name}}` | Client company or person name (e.g. `"Acme Kft."`) |
| `{{invoice_number}}` | Unique invoice reference (e.g. `"INV-2025-001"`) |
| `{{invoice_date}}` | Date of issue (e.g. `"2025. január 1."`) |
| `{{due_date}}` | Payment deadline — rendered in ember orange |
| `{{period}}` | The billing period this covers (e.g. `"2025. január"`) |
| `{{currency}}` | Currency code (e.g. `"HUF"` or `"EUR"`) |
| `{{subtotal}}` | Net total before VAT |
| `{{vat_rate}}` | VAT percentage (e.g. `"27"` for Hungarian standard rate) |
| `{{vat_amount}}` | Calculated VAT amount |
| `{{total}}` | Grand total including VAT — displayed in the orange total row |
| `{{payment_method}}` | Payment method (e.g. `"Banki átutalás / Bank transfer"`) |
| `{{bank_account}}` | IBAN or Hungarian bankszámlaszám |
| `{{flintworks_tax_number}}` | Flintworks seller adószám — **legally required** |
| `{{client_address}}` | Client's full billing address |
| `{{client_tax_number}}` | Client's adószám — **legally required** |
| `{{domain_fee}}` | Amount for domain renewal line item |
| `{{email_fee}}` | Amount for email hosting line item |
| `{{hosting_fee}}` | Amount for server/hosting line item |
| `{{upkeep_fee}}` | Amount for developer upkeep line item |
| `{{other_fee}}` | Optional extra line item — the row is commented out by default; uncomment it in the HTML when needed |

**Optional row:** The "Egyéb / Other" line (`{{other_fee}}`) is wrapped in an HTML comment. Uncomment that `<table>` block when you need it.

**Paid stamp:** A `<!-- PAID STAMP -->` block is commented out near the bottom. Uncomment it to show a `✓ FIZETVE / PAID` banner when the invoice has been settled.

---

## Sending Templates

### Simple placeholder replacement (Node.js)

```js
const fs = require('fs');

function renderTemplate(templatePath, variables) {
  let html = fs.readFileSync(templatePath, 'utf8');
  for (const [key, value] of Object.entries(variables)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }
  return html;
}
```

---

### Nodemailer

```js
const nodemailer = require('nodemailer');
const { renderTemplate } = require('./renderTemplate');

const transporter = nodemailer.createTransport({
  host: 'smtp.your-provider.com', // TODO: replace with real SMTP host
  port: 587,
  secure: false,
  auth: {
    user: 'hello@flintworks.hu', // TODO: replace sender address
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendContactConfirmation({ name, email, service, message }) {
  const html = renderTemplate('./email-templates/contact-confirmation.html', {
    name,
    service,
    message,
  });

  await transporter.sendMail({
    from: '"Flintworks" <hello@flintworks.hu>', // TODO: replace sender address
    to: email,
    subject: `We got your message, ${name}`,
    html,
  });
}
```

---

### Resend

```js
import { Resend } from 'resend';
import { readFileSync } from 'fs';

const resend = new Resend(process.env.RESEND_API_KEY);

function renderTemplate(templatePath, variables) {
  let html = readFileSync(templatePath, 'utf8');
  for (const [key, value] of Object.entries(variables)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }
  return html;
}

// Send contact confirmation to client
await resend.emails.send({
  from: 'Flintworks <hello@flintworks.hu>', // TODO: replace sender address
  to: [clientEmail],
  subject: `We got your message, ${name}`,
  html: renderTemplate('./email-templates/contact-confirmation.html', {
    name,
    service,
    message,
  }),
});

// Send internal notification
await resend.emails.send({
  from: 'Flintworks <noreply@flintworks.hu>', // TODO: replace sender address
  to: ['team@flintworks.hu'],                 // TODO: replace internal address
  subject: `New contact: ${name}`,
  html: renderTemplate('./email-templates/contact-notification.html', {
    name,
    email,
    company,
    service,
    message,
  }),
});
```

---

## Notes

- **Font stack:** Headings use `'Syne'`, body copy uses `'Inter'`, and labels/meta tags use `'JetBrains Mono'`, with clean web-safe fallbacks (`Arial, sans-serif` and `Consolas, monospace`) across all email clients.
- **Brand logo:** Templates embed the official Flintworks Knapped mark and wordmark via high-resolution asset `https://flintworks.hu/brand/flintworks-logo-on-dark.png`, with styled alt-text fallback if images are initially blocked.
- **Dark backgrounds:** All templates use the dark Flintworks palette (`#0A0A0B` ink base, `#111114` surfaces, `#FF4D00` ember accents). Outlook on Windows and mobile dark mode clients render backgrounds correctly because colors are applied via `bgcolor` attributes and inline styles.
- **Variable safety:** Always sanitise user-supplied values before injecting them into templates to prevent HTML injection.
