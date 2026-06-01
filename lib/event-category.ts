import type { EventCategory } from "@prisma/client";

export type { EventCategory };

export const EVENT_CATEGORY_OPTIONS: { value: EventCategory; labelEs: string; labelVa: string }[] = [
  { value: "generico", labelEs: "Genérico", labelVa: "Genèric" },
  { value: "teatro", labelEs: "Teatro", labelVa: "Teatre" },
  { value: "feria", labelEs: "Feria / festival", labelVa: "Fira / festival" },
];

export function categoryLabel(locale: "es" | "val", category: EventCategory): string {
  const row = EVENT_CATEGORY_OPTIONS.find((o) => o.value === category);
  if (!row) return category;
  return locale === "val" ? row.labelVa : row.labelEs;
}

export function coerceEventCategory(raw: unknown): EventCategory {
  const v = String(raw ?? "generico")
    .trim()
    .toLowerCase();
  if (v === "teatro" || v === "feria" || v === "generico") return v;
  return "generico";
}

function optionalStr(raw: unknown): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  return s || null;
}

/** HH:mm (24h), 0–23 horas */
function optionalTime(raw: unknown): string | null {
  const s = optionalStr(raw);
  if (!s) return null;
  if (!/^\d{1,2}:\d{2}$/.test(s)) return null;
  const [h, m] = s.split(":").map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function optionalYmd(raw: unknown): string | null {
  const s = optionalStr(raw);
  if (!s) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, mo, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return s;
}

export type TeatroDetails = {
  startTime?: string;
  theaterCompany?: string;
  theaterCompanyVal?: string;
};

export type FeriaDetails = {
  endDate?: string;
};

export function parseDetailsFromDb(category: EventCategory, raw: unknown): TeatroDetails | FeriaDetails | Record<string, never> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const o = raw as Record<string, unknown>;
  if (category === "teatro") {
    const out: TeatroDetails = {};
    const st = optionalTime(o.startTime);
    if (st) out.startTime = st;
    const tc = optionalStr(o.theaterCompany);
    if (tc) out.theaterCompany = tc;
    const tcv = optionalStr(o.theaterCompanyVal);
    if (tcv) out.theaterCompanyVal = tcv;
    return out;
  }
  if (category === "feria") {
    const out: FeriaDetails = {};
    const ed = optionalYmd(o.endDate);
    if (ed) out.endDate = ed;
    return out;
  }
  return {};
}

/** Normalize payload for DB (drops invalid keys per category). Feria requires a valid endDate on or after the event date. */
export function normalizeDetailsPayload(
  category: EventCategory,
  eventDate: Date,
  raw: unknown
): { ok: true; value: Record<string, string> | null } | { ok: false; error: string } {
  if (category === "generico") return { ok: true, value: null };

  const obj = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};

  if (category === "teatro") {
    const startTime = optionalTime(obj.startTime);
    const theaterCompany = optionalStr(obj.theaterCompany);
    const theaterCompanyVal = optionalStr(obj.theaterCompanyVal);
    const out: Record<string, string> = {};
    if (startTime) out.startTime = startTime;
    if (theaterCompany) out.theaterCompany = theaterCompany;
    if (theaterCompanyVal) out.theaterCompanyVal = theaterCompanyVal;
    return { ok: true, value: Object.keys(out).length ? out : null };
  }

  if (category === "feria") {
    const endDate = optionalYmd(obj.endDate);
    if (!endDate) {
      return { ok: false, error: "La categoría feria requiere endDate (YYYY-MM-DD) como último día." };
    }
    if (!feriaEndOnOrAfterStart(eventDate, endDate)) {
      return { ok: false, error: "endDate debe ser igual o posterior a la fecha de inicio del evento." };
    }
    return { ok: true, value: { endDate } };
  }

  return { ok: true, value: null };
}

export function feriaEndOnOrAfterStart(eventDate: Date, endYmd: string): boolean {
  const startKey = formatDateKeyTz(eventDate, "Europe/Madrid");
  return /^\d{4}-\d{2}-\d{2}$/.test(endYmd) && endYmd >= startKey;
}

export function formatDateKeyTz(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function isLeapYear(y: number) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function daysInMonth(y: number, m: number) {
  const md = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (m === 2 && isLeapYear(y)) return 29;
  return md[m - 1];
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Next civil Y-M-D (Gregorian), for iterating ranges without TZ ambiguity. */
export function addOneCalendarDayYmd(ymd: string): string {
  const [y0, m0, d0] = ymd.split("-").map(Number);
  let y = y0;
  let m = m0;
  let d = d0;
  const dim = daysInMonth(y, m);
  if (d < dim) {
    d += 1;
  } else if (m < 12) {
    m += 1;
    d = 1;
  } else {
    y += 1;
    m = 1;
    d = 1;
  }
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

/** Inclusive civil days from startYmd to endYmd (strings sort lexicographically as dates). */
export function expandYmdRangeInclusive(startYmd: string, endYmd: string): string[] {
  const out: string[] = [];
  let cur = startYmd;
  while (cur <= endYmd && out.length < 400) {
    out.push(cur);
    if (cur === endYmd) break;
    cur = addOneCalendarDayYmd(cur);
  }
  return out;
}

export function inclusiveDayCountFromYmd(startYmd: string, endYmd: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startYmd) || !/^\d{4}-\d{2}-\d{2}$/.test(endYmd) || endYmd < startYmd) return null;
  return expandYmdRangeInclusive(startYmd, endYmd).length;
}

export function expandEventCalendarDays(eventDate: Date, category: EventCategory, details: unknown): string[] {
  const startKey = formatDateKeyTz(eventDate, "Europe/Madrid");
  if (category !== "feria") return [startKey];

  const parsed = parseDetailsFromDb("feria", details) as FeriaDetails;
  const endYmd = parsed.endDate;
  if (!endYmd || endYmd < startKey) return [startKey];

  return expandYmdRangeInclusive(startKey, endYmd);
}

/** Monday = 1 … Sunday = 7 in Europe/Madrid civil calendar for `d`. */
export function isoWeekdayMonday1Sunday7Madrid(d: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    weekday: "short",
  }).formatToParts(d);
  const wd = parts.find((p) => p.type === "weekday")?.value;
  const map: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  return wd && wd in map ? map[wd] : 1;
}

/** Last day (Sunday) of the current Monday–Sunday week in Europe/Madrid, as YYYY-MM-DD. */
export function madridThisWeekSundayYmd(from: Date = new Date()): string {
  const todayKey = formatDateKeyTz(from, "Europe/Madrid");
  const iso = isoWeekdayMonday1Sunday7Madrid(from);
  let cur = todayKey;
  for (let i = 0; i < 7 - iso; i += 1) {
    cur = addOneCalendarDayYmd(cur);
  }
  return cur;
}

export function madridWeekWindowYmd(from: Date = new Date()): { startYmd: string; endYmd: string } {
  return {
    startYmd: formatDateKeyTz(from, "Europe/Madrid"),
    endYmd: madridThisWeekSundayYmd(from),
  };
}

function calendarDaysOverlapYmdRange(keys: string[], rangeStartYmd: string, rangeEndYmd: string): boolean {
  return keys.some((k) => k >= rangeStartYmd && k <= rangeEndYmd);
}

export function eventTouchesMadridYmdRange(
  eventDate: Date,
  category: EventCategory,
  details: unknown,
  rangeStartYmd: string,
  rangeEndYmd: string,
): boolean {
  const keys = expandEventCalendarDays(eventDate, category, details);
  return calendarDaysOverlapYmdRange(keys, rangeStartYmd, rangeEndYmd);
}
