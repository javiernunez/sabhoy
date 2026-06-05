import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import {
  adminNewUserContent,
  adminNewsletterContent,
  newsletterConfirmContent,
} from "@/lib/mail-templates";

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

/** systemd EnvironmentFile no quita comillas; las retiramos aqui. */
function envVar(name: string): string | undefined {
  const raw = process.env[name];
  if (raw == null) return undefined;
  const v = raw.trim();
  if (!v) return undefined;
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
  tlsServername: string;
};

type EmailContent = { text: string; html: string };

function isLoopbackOrIp(host: string): boolean {
  return host === "127.0.0.1" || host === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
}

function smtpTlsServername(host: string): string {
  const explicit = envVar("SMTP_TLS_SERVERNAME");
  if (explicit) return explicit;
  if (isLoopbackOrIp(host)) {
    throw new Error(
      "SMTP_TLS_SERVERNAME es obligatorio cuando SMTP_HOST es 127.0.0.1 (certificado Mailcow: mail.javiernunez.com)"
    );
  }
  return host;
}

function smtpConfig(): SmtpConfig | null {
  const host = envVar("SMTP_HOST");
  const pass = envVar("SMTP_PASS");
  if (!host || !pass) {
    return null;
  }

  const port = Number.parseInt(envVar("SMTP_PORT") || "587", 10);
  const user = envVar("SMTP_USER") || infoEmailAddress();
  const secure = envVar("SMTP_SECURE") === "true" || port === 465;

  return { host, port, user, pass, secure, tlsServername: smtpTlsServername(host) };
}

function createSmtpTransport(cfg: SmtpConfig) {
  const options: SMTPTransport.Options = {
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
    requireTLS: !cfg.secure && cfg.port === 587,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
    tls: {
      minVersion: "TLSv1.2",
      servername: cfg.tlsServername,
    },
  };
  return nodemailer.createTransport(options);
}

async function sendEmail(to: string, subject: string, content: EmailContent): Promise<void> {
  const cfg = smtpConfig();
  if (!cfg) {
    console.warn("[mail] SMTP no configurado (faltan SMTP_HOST o SMTP_PASS); omitiendo envio");
    return;
  }

  const transport = createSmtpTransport(cfg);

  try {
    await transport.sendMail({
      from: `"${SITE_NAME}" <${cfg.user}>`,
      to,
      subject,
      text: content.text,
      html: content.html,
    });
  } catch (error) {
    console.error("[mail] fallo envio", {
      to,
      subject,
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      tlsServername: cfg.tlsServername,
      error,
    });
    throw error;
  }
}

async function sendNotificationEmail(subject: string, content: EmailContent): Promise<void> {
  await sendEmail(infoEmailAddress(), subject, content);
}

function logMailError(context: string, error: unknown): void {
  console.error(`[mail] ${context}`, error);
}

export function notifyNewUserRegistration(email: string, name: string | null): void {
  const content = adminNewUserContent(email, name);
  void sendNotificationEmail(`[${SITE_NAME}] Nuevo usuario: ${email}`, content).catch((e) =>
    logMailError("registro", e)
  );
}

export function sendNewsletterConfirmationEmail(email: string, token: string, linkedToAccount: boolean): void {
  const confirmUrl = `${SITE_URL}/newsletter/confirmar?token=${encodeURIComponent(token)}`;
  const content = newsletterConfirmContent(confirmUrl, linkedToAccount);
  void sendEmail(email, `[${SITE_NAME}] Confirma tu suscripcion a la newsletter`, content).catch((e) =>
    logMailError("newsletter-confirmacion", e)
  );
}

export function notifyNewsletterSubscription(email: string, linkedToAccount: boolean): void {
  const content = adminNewsletterContent(email, linkedToAccount);
  void sendNotificationEmail(`[${SITE_NAME}] Newsletter: ${email}`, content).catch((e) =>
    logMailError("newsletter", e)
  );
}
