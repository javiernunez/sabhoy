import type { EventCategory } from "@prisma/client";
import type { Locale } from "@/lib/i18n";
import {
  categoryLabel,
  formatDateKeyTz,
  inclusiveDayCountFromYmd,
  parseDetailsFromDb,
  type FeriaDetails,
  type TeatroDetails,
} from "@/lib/event-category";
import { localizedText } from "@/lib/localized";

type Props = {
  locale: Locale;
  category: EventCategory;
  /** Prisma.JsonValue — parsed per category below */
  details: unknown | null;
  eventDate: Date;
};

export function EventDetailMeta({ locale, category, details, eventDate }: Props) {
  const isVal = locale === "val";
  const label = categoryLabel(isVal ? "val" : "es", category);

  if (category === "generico") {
    return (
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {new Intl.DateTimeFormat(isVal ? "ca-ES" : "es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(eventDate)}
      </p>
    );
  }

  const startKey = formatDateKeyTz(eventDate, "Europe/Madrid");

  if (category === "teatro") {
    const td = parseDetailsFromDb("teatro", details) as TeatroDetails;
    const company = localizedText(locale, td.theaterCompany ?? "", td.theaterCompanyVal ?? "");

    return (
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-sab-terracotta-dark">{label}</p>
        <p className="text-sm text-slate-600">
          {new Intl.DateTimeFormat(isVal ? "ca-ES" : "es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(eventDate)}
          {td.startTime ? (
            <>
              {" · "}
              <span className="font-semibold text-slate-800">
                Hora: {td.startTime}
              </span>
            </>
          ) : null}
        </p>
        {company ? (
          <p className="text-sm text-slate-700">
            <span className="font-semibold">{isVal ? "Companyia: " : "Compañía: "}</span>
            {company}
          </p>
        ) : null}
      </div>
    );
  }

  if (category === "feria") {
    const fd = parseDetailsFromDb("feria", details) as FeriaDetails;
    const endYmd = fd.endDate ?? startKey;
    const span = inclusiveDayCountFromYmd(startKey, endYmd);

    const longFmt = new Intl.DateTimeFormat(isVal ? "ca-ES" : "es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const startPhrase = longFmt.format(eventDate);
    const endDateObj = fd.endDate ? new Date(`${fd.endDate}T12:00:00Z`) : eventDate;
    const endPhrase = fd.endDate ? longFmt.format(endDateObj) : longFmt.format(eventDate);

    const rangeSentence =
      startKey === endYmd
        ? `El ${startPhrase}`
        : isVal
          ? `Del ${startPhrase} fins al ${endPhrase}`
          : `Del ${startPhrase} al ${endPhrase}`;

    return (
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-sab-terracotta-dark">{label}</p>
        <p className="text-sm font-medium text-slate-700">{rangeSentence}</p>
        {span != null && span > 1 ? (
          <p className="text-sm text-slate-600">
            {isVal ? (
              <>
                Durada: <span className="font-semibold text-slate-800">{span}</span> dies
              </>
            ) : (
              <>
                Duración: <span className="font-semibold text-slate-800">{span}</span> días
              </>
            )}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <p className="text-xs uppercase tracking-wide text-slate-500">
      {new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "long", year: "numeric" }).format(eventDate)}
    </p>
  );
}
