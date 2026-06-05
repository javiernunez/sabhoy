#!/usr/bin/env node
/**
 * Prueba SMTP en producción (lee .env del directorio del sitio).
 * Uso: node scripts/test-smtp.mjs [email-destino]
 * No imprime SMTP_PASS.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env");

function loadEnvFile(path) {
  try {
    const raw = readFileSync(path, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // sin .env local
  }
}

loadEnvFile(envPath);

const host = process.env.SMTP_HOST?.trim();
const pass = process.env.SMTP_PASS?.trim();
const port = Number.parseInt(process.env.SMTP_PORT || "587", 10);
const user = process.env.SMTP_USER?.trim();
const secure = process.env.SMTP_SECURE === "true" || port === 465;
const tlsServername = process.env.SMTP_TLS_SERVERNAME?.trim() || host;
const to = process.argv[2]?.trim() || user;

if (!host || !pass || !user) {
  console.error("Faltan SMTP_HOST, SMTP_USER o SMTP_PASS en .env");
  process.exit(1);
}

console.log("SMTP config:", { host, port, user, secure, tlsServername, to });

const transport = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
  requireTLS: !secure && port === 587,
  connectionTimeout: 15_000,
  greetingTimeout: 15_000,
  socketTimeout: 20_000,
  tls: {
    minVersion: "TLSv1.2",
    servername: tlsServername,
  },
});

try {
  await transport.verify();
  console.log("verify(): OK");
} catch (e) {
  console.error("verify() falló:", e);
  process.exit(2);
}

const info = await transport.sendMail({
  from: `"SMTP test" <${user}>`,
  to,
  subject: "[test] SMTP lelianahoy",
  text: `Prueba SMTP ${new Date().toISOString()}`,
});

console.log("sendMail OK:", info.messageId, info.response);
