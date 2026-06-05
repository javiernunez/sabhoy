import { SITE_NAME, SITE_URL } from "@/lib/constants";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDateMadrid(date = new Date()): string {
  return date.toLocaleString("es-ES", {
    timeZone: "Europe/Madrid",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type EmailContent = { text: string; html: string };

type LayoutOptions = {
  title: string;
  intro: string;
  bodyHtml: string;
  footerNote?: string;
};

function emailLayout({ title, intro, bodyHtml, footerNote }: LayoutOptions): string {
  const safeTitle = escapeHtml(title);
  const safeIntro = escapeHtml(intro);
  const safeFooter = footerNote ? escapeHtml(footerNote) : "";
  const safeSite = escapeHtml(SITE_NAME);
  const safeUrl = escapeHtml(SITE_URL);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#334155;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:linear-gradient(135deg,#047857 0%,#059669 100%);padding:24px 28px;">
              <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:rgba(255,255,255,0.85);">${safeSite}</p>
              <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;font-weight:700;color:#ffffff;">${safeTitle}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#475569;">${safeIntro}</p>
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
                ${safeFooter ? `${safeFooter}<br><br>` : ""}
                <a href="${safeUrl}" style="color:#059669;text-decoration:none;">${safeSite}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:600;color:#64748b;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:15px;color:#0f172a;vertical-align:top;">${escapeHtml(value)}</td>
  </tr>`;
}

function adminDetailsTable(rows: Array<{ label: string; value: string }>): string {
  const rowsHtml = rows.map((row) => detailRow(row.label, row.value)).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;">${rowsHtml}</table>`;
}

export function newsletterConfirmContent(confirmUrl: string, linkedToAccount: boolean): EmailContent {
  const text = [
    `Hola,`,
    ``,
    `Has solicitado suscribirte a la newsletter de ${SITE_NAME}.`,
    `Confirma tu correo abriendo este enlace:`,
    ``,
    confirmUrl,
    ``,
    `Si no has sido tu, ignora este mensaje.`,
    linkedToAccount ? `(La suscripcion se vinculara a tu cuenta de usuario al confirmar.)` : null,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  const safeUrl = escapeHtml(confirmUrl);
  const accountNote = linkedToAccount
    ? `<p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#64748b;">Al confirmar, la suscripcion quedara vinculada a tu cuenta de usuario.</p>`
    : "";

  const html = emailLayout({
    title: "Confirma tu suscripcion",
    intro: "Solo falta un paso para recibir la newsletter. Pulsa el boton para activar tu correo.",
    bodyHtml: `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
      <tr>
        <td style="border-radius:8px;background-color:#059669;">
          <a href="${safeUrl}" style="display:inline-block;padding:14px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Confirmar suscripcion</a>
        </td>
      </tr>
    </table>
    <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#64748b;">Si el boton no funciona, copia y pega este enlace en el navegador:</p>
    <p style="margin:8px 0 0;font-size:13px;line-height:1.6;word-break:break-all;"><a href="${safeUrl}" style="color:#059669;">${safeUrl}</a></p>
    ${accountNote}`,
    footerNote: "Si no has solicitado esta suscripcion, puedes ignorar este correo.",
  });

  return { text, html };
}

export function adminNewUserContent(email: string, name: string | null): EmailContent {
  const when = formatDateMadrid();
  const text = [
    `Nuevo registro de usuario en ${SITE_NAME}`,
    "",
    `Email: ${email}`,
    name ? `Nombre: ${name}` : null,
    `Fecha: ${when}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");

  const rows = [
    { label: "Email", value: email },
    ...(name ? [{ label: "Nombre", value: name }] : []),
    { label: "Fecha", value: when },
  ];

  const html = emailLayout({
    title: "Nuevo usuario registrado",
    intro: "Alguien acaba de crear una cuenta en la web.",
    bodyHtml: adminDetailsTable(rows),
  });

  return { text, html };
}

export function adminNewsletterContent(email: string, linkedToAccount: boolean): EmailContent {
  const when = formatDateMadrid();
  const text = [
    `Nueva suscripcion a la newsletter en ${SITE_NAME}`,
    "",
    `Email: ${email}`,
    `Vinculado a cuenta de usuario: ${linkedToAccount ? "si" : "no"}`,
    `Fecha: ${when}`,
  ].join("\n");

  const html = emailLayout({
    title: "Nueva suscripcion confirmada",
    intro: "Un lector ha confirmado su correo en la newsletter.",
    bodyHtml: adminDetailsTable([
      { label: "Email", value: email },
      { label: "Cuenta vinculada", value: linkedToAccount ? "Si" : "No" },
      { label: "Fecha", value: when },
    ]),
  });

  return { text, html };
}
