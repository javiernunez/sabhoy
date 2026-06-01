import { UserRole } from "@prisma/client";

/**
 * Listado de correos con rol administrador. Sin contrasenas: solo se decide quien es admin.
 * Ejemplo: ADMIN_EMAILS=editor@tudominio.es,otro@correo.com
 */
export function parseAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(/[,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  const e = email.trim().toLowerCase();
  return parseAdminEmails().includes(e);
}

export function initialRoleForEmail(email: string): UserRole {
  return isAdminEmail(email) ? "ADMIN" : "USER";
}
