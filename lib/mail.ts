import nodemailer from "nodemailer";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

function siteDomain(): string {
  try {
    return new URL(SITE_URL).hostname.replace(/^www\./, "");
  } catch {
    return "localhost";
  }
}

export function infoEmailAddress(): string {
  return `info@${siteDomain()}`;
}

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
};

function smtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !pass) {
    return null;
  }

  const port = Number.parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER?.trim() || infoEmailAddress();
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  return { host, port, user, pass, secure };
}

async function sendNotificationEmail(subject: string, text: string): Promise<void> {
  const cfg = smtpConfig();
  if (!cfg) {
    console.warn("[mail] SMTP no configurado; omitiendo envio");
    return;
  }

  const transport = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });

  await transport.sendMail({
    from: `"${SITE_NAME}" <${cfg.user}>`,
    to: infoEmailAddress(),
    subject,
    text,
  });
}

function logMailError(context: string, error: unknown): void {
  console.error(`[mail] ${context}`, error);
}

export function notifyNewUserRegistration(email: string, name: string | null): void {
  const lines = [
    `Nuevo registro de usuario en ${SITE_NAME}`,
    "",
    `Email: ${email}`,
    name ? `Nombre: ${name}` : null,
    `Fecha: ${new Date().toISOString()}`,
  ].filter((line): line is string => Boolean(line));

  void sendNotificationEmail(`[${SITE_NAME}] Nuevo usuario: ${email}`, lines.join("\n")).catch((e) =>
    logMailError("registro", e)
  );
}

export function notifyNewsletterSubscription(email: string, linkedToAccount: boolean): void {
  const lines = [
    `Nueva suscripcion a la newsletter en ${SITE_NAME}`,
    "",
    `Email: ${email}`,
    linkedToAccount ? "Vinculado a cuenta de usuario: si" : "Vinculado a cuenta de usuario: no",
    `Fecha: ${new Date().toISOString()}`,
  ];

  void sendNotificationEmail(`[${SITE_NAME}] Newsletter: ${email}`, lines.join("\n")).catch((e) =>
    logMailError("newsletter", e)
  );
}
