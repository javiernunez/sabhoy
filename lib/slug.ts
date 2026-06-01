/**
 * Convierte un título en slug para URL: minúsculas, sin tildes, guiones, apto para SEO.
 * (Evita espacios y caracteres raros que penalizan URLs compartibles.)
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
