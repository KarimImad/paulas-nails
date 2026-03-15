import nodemailer from 'nodemailer';

// ---------------------------------------------------------------------------
// Transporter
// ---------------------------------------------------------------------------

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function isConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER);
}

function getSender() {
  return process.env.SMTP_FROM || `Paula's Nails <${process.env.SMTP_USER}>`;
}

function getAdminEmail() {
  return process.env.ADMIN_EMAIL || process.env.SMTP_USER;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

// Palette (matched to tailwind.config.js)
const C = {
  bg:         '#FDFAF6', // cream-50
  cardBg:     '#FFFFFF',
  headerBg:   '#F9F2E8', // cream-100
  border:     '#F2E4CF', // cream-200
  separator:  '#F2E4CF', // cream-200
  label:      '#D9BA90', // cream-400
  accent:     '#C4A070', // cream-500
  body:       '#8B6640', // cream-700
  heading:    '#4A3420', // cream-900
  // For cancellation
  cancelHeaderBg: '#FEF8F4', // nude-50
  cancelBorder:   '#F8D8C4', // nude-200
  cancelAccent:   '#D97A4A', // nude-500
  cancelLabel:    '#E89A70', // nude-400
};

// Shared layout wrapper — injects the header logo + footer around any content
function layout(title, content) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:48px 16px 40px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:36px;">
              <p style="margin:0;font-size:13px;letter-spacing:8px;text-transform:uppercase;color:${C.accent};font-family:Georgia,serif;font-weight:400;">
                ✦ &nbsp;Paula's Nails
              </p>
              <p style="margin:6px 0 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${C.label};font-family:Arial,sans-serif;font-weight:400;">
                Institut de beauté ongulaire
              </p>
            </td>
          </tr>

          <!-- Content card -->
          <tr>
            <td style="background:${C.cardBg};border-radius:20px;border:1px solid ${C.border};overflow:hidden;box-shadow:0 4px 30px rgba(139,102,64,0.10);">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="margin:0;font-size:11px;color:${C.label};font-family:Arial,sans-serif;line-height:2;letter-spacing:0.3px;">
                Paula's Nails · Institut de beauté ongulaire<br />
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
              </p>
              <p style="margin:12px 0 0;font-size:13px;color:${C.accent};font-family:Georgia,serif;letter-spacing:4px;">✦</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// A single detail row (label + value)
function detailRow(label, value, subValue, borderBottom = true) {
  return `
<tr>
  <td style="padding:20px 0;${borderBottom ? `border-bottom:1px solid ${C.separator};` : ''}">
    <p style="margin:0 0 5px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.label};font-family:Arial,sans-serif;font-weight:500;">
      ${label}
    </p>
    <p style="margin:0;font-size:17px;font-weight:300;color:${C.heading};font-family:Georgia,serif;text-transform:capitalize;line-height:1.4;">
      ${value}
    </p>
    ${subValue ? `<p style="margin:4px 0 0;font-size:13px;color:${C.body};font-family:Arial,sans-serif;font-weight:300;">${subValue}</p>` : ''}
  </td>
</tr>`;
}

// ---------------------------------------------------------------------------
// 1. CONFIRMATION — envoyée au client lors d'une nouvelle réservation
// ---------------------------------------------------------------------------

export async function sendReservationConfirmation({
  to, userName, serviceName, servicePrice, serviceDuration, slotDate, slotTime,
}) {
  if (!isConfigured()) return;

  const content = `
    <!-- Card header -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:${C.headerBg};padding:36px 44px 32px;border-bottom:1px solid ${C.border};">
          <p style="margin:0 0 10px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.accent};font-family:Arial,sans-serif;font-weight:500;">
            ✦ &nbsp;Réservation confirmée
          </p>
          <h1 style="margin:0;font-size:28px;font-weight:300;color:${C.heading};font-family:Georgia,serif;line-height:1.3;">
            Bonjour ${userName},
          </h1>
          <p style="margin:12px 0 0;font-size:15px;color:${C.body};font-family:Arial,sans-serif;font-weight:300;line-height:1.7;">
            Votre rendez-vous est confirmé. Nous avons hâte de prendre soin de vous !
          </p>
        </td>
      </tr>

      <!-- Details -->
      <tr>
        <td style="padding:8px 44px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${detailRow('Prestation', serviceName, `${serviceDuration}&nbsp;min &nbsp;·&nbsp; ${servicePrice}&nbsp;€`)}
            ${detailRow('Date &amp; heure', formatDate(slotDate), `à ${slotTime.slice(0, 5)}`)}
            <tr>
              <td style="padding-top:24px;">
                <p style="margin:0;font-size:13px;color:${C.label};font-family:Arial,sans-serif;line-height:1.7;">
                  Besoin d'annuler ou de modifier votre rendez-vous ? Connectez-vous à votre espace client.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;

  await transporter.sendMail({
    from:    getSender(),
    to,
    subject: `Votre rendez-vous est confirmé — Paula's Nails`,
    html:    layout(`Confirmation de réservation — Paula's Nails`, content),
  });
}

// ---------------------------------------------------------------------------
// 2. ANNULATION — envoyée au client quand son rendez-vous est annulé
// ---------------------------------------------------------------------------

export async function sendReservationCancellation({
  to, userName, serviceName, servicePrice, serviceDuration, slotDate, slotTime, cancelledByAdmin = false,
}) {
  if (!isConfigured()) return;

  const reason = cancelledByAdmin
    ? "Votre rendez-vous a été annulé par le salon. N'hésitez pas à nous contacter si vous avez des questions."
    : "La demande d'annulation a bien été prise en compte. Nous espérons vous revoir bientôt.";

  const content = `
    <!-- Card header — nude tone for cancellation -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:${C.cancelHeaderBg};padding:36px 44px 32px;border-bottom:1px solid ${C.cancelBorder};">
          <p style="margin:0 0 10px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.cancelAccent};font-family:Arial,sans-serif;font-weight:500;">
            Rendez-vous annulé
          </p>
          <h1 style="margin:0;font-size:28px;font-weight:300;color:${C.heading};font-family:Georgia,serif;line-height:1.3;">
            Bonjour ${userName},
          </h1>
          <p style="margin:12px 0 0;font-size:15px;color:${C.body};font-family:Arial,sans-serif;font-weight:300;line-height:1.7;">
            ${reason}
          </p>
        </td>
      </tr>

      <!-- Details of the cancelled appointment -->
      <tr>
        <td style="padding:8px 44px 8px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${detailRow('Prestation annulée', serviceName, `${serviceDuration}&nbsp;min &nbsp;·&nbsp; ${servicePrice}&nbsp;€`)}
            ${detailRow('Date &amp; heure', formatDate(slotDate), `à ${slotTime.slice(0, 5)}`, false)}
          </table>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td style="padding:0 44px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:${C.headerBg};border-radius:12px;padding:20px 24px;border:1px solid ${C.border};">
                <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.label};font-family:Arial,sans-serif;">
                  Réserver un nouveau créneau
                </p>
                <p style="margin:0;font-size:14px;color:${C.body};font-family:Arial,sans-serif;font-weight:300;line-height:1.6;">
                  Retrouvez tous nos créneaux disponibles en vous connectant à votre espace client.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;

  await transporter.sendMail({
    from:    getSender(),
    to,
    subject: `Annulation de votre rendez-vous — Paula's Nails`,
    html:    layout(`Annulation de réservation — Paula's Nails`, content),
  });
}

// ---------------------------------------------------------------------------
// 3. NOTIFICATION ADMIN — envoyée à l'admin lors d'une nouvelle réservation
// ---------------------------------------------------------------------------

export async function sendAdminNewReservation({
  clientName, clientEmail, clientPhone,
  serviceName, servicePrice, serviceDuration,
  slotDate, slotTime, notes,
}) {
  if (!isConfigured()) return;

  const adminEmail = getAdminEmail();
  if (!adminEmail) return;

  const content = `
    <!-- Card header -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:${C.headerBg};padding:36px 44px 32px;border-bottom:1px solid ${C.border};">
          <p style="margin:0 0 10px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.accent};font-family:Arial,sans-serif;font-weight:500;">
            ✦ &nbsp;Nouvelle réservation
          </p>
          <h1 style="margin:0;font-size:26px;font-weight:300;color:${C.heading};font-family:Georgia,serif;line-height:1.3;">
            ${clientName} vient de réserver
          </h1>
          <p style="margin:12px 0 0;font-size:15px;color:${C.body};font-family:Arial,sans-serif;font-weight:300;line-height:1.6;">
            Une nouvelle réservation a été enregistrée et confirmée automatiquement.
          </p>
        </td>
      </tr>

      <!-- Appointment details -->
      <tr>
        <td style="padding:8px 44px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${detailRow('Prestation', serviceName, `${serviceDuration}&nbsp;min &nbsp;·&nbsp; ${servicePrice}&nbsp;€`)}
            ${detailRow('Date &amp; heure', formatDate(slotDate), `à ${slotTime.slice(0, 5)}`)}
          </table>
        </td>
      </tr>

      <!-- Client info block -->
      <tr>
        <td style="padding:0 44px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:${C.headerBg};border-radius:12px;padding:20px 24px;border:1px solid ${C.border};">
                <p style="margin:0 0 12px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.label};font-family:Arial,sans-serif;font-weight:500;">
                  Cliente
                </p>
                <p style="margin:0 0 4px;font-size:16px;font-weight:300;color:${C.heading};font-family:Georgia,serif;">${clientName}</p>
                <p style="margin:0 0 2px;font-size:13px;color:${C.body};font-family:Arial,sans-serif;">${clientEmail}</p>
                ${clientPhone ? `<p style="margin:0;font-size:13px;color:${C.body};font-family:Arial,sans-serif;">${clientPhone}</p>` : ''}
                ${notes ? `
                <p style="margin:14px 0 4px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${C.label};font-family:Arial,sans-serif;">Note</p>
                <p style="margin:0;font-size:13px;color:${C.body};font-family:Arial,sans-serif;font-style:italic;line-height:1.6;">"${notes}"</p>
                ` : ''}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;

  await transporter.sendMail({
    from:    getSender(),
    to:      adminEmail,
    subject: `Nouvelle réservation — ${clientName} · ${slotTime.slice(0, 5)} le ${formatDate(slotDate)}`,
    html:    layout(`Nouvelle réservation — Paula's Nails`, content),
  });
}
