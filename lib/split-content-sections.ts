const SECTION_SPLIT = /\n\s*---\s*\n/;

/**
 * Secciones de texto largo: por defecto separadas con línea en blanco (comportamiento histórico).
 * Para secciones claras con el editor: insertar un separador (regla horizontal `---` en su propia línea)
 * para no mezclar con párrafos normales.
 */
export function splitContentSections(raw: string): string[] {
  const t = raw.trim();
  if (!t) return [];
  const byHr = t.split(SECTION_SPLIT).map((s) => s.trim()).filter(Boolean);
  if (byHr.length > 1) return byHr;
  return t
    .split(/\n\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}
