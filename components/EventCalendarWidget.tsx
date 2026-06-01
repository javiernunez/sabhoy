"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EventAdminControls } from "@/components/admin/EventAdminControls";
import { ui } from "@/lib/ui-classes";

type EventItem = {
  id: number;
  title: string;
  slug: string;
  /** ISO fallback if calendarDayKeys omitted */
  eventDate: string;
  /** YYYY-MM-DD (Madrid / civil calendar), one entry per día en que el evento cuenta en la agenda */
  calendarDayKeys: string[];
};

type Props = {
  events: EventItem[];
  /** Si hay sesión admin, enlaces rápidos por evento en el desplegable del día */
  showAdminToolbar?: boolean;
  isVal?: boolean;
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(date);
}

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

export function EventCalendarWidget({ events, showAdminToolbar = false, isVal = false }: Props) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const grouped = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const item of events) {
      const keys =
        item.calendarDayKeys.length > 0 ? item.calendarDayKeys : [toDateKey(new Date(item.eventDate))];
      const seenLocal = new Set<string>();
      for (const key of keys) {
        if (seenLocal.has(key)) continue;
        seenLocal.add(key);
        const current = map.get(key) ?? [];
        current.push(item);
        map.set(key, current);
      }
    }
    return map;
  }, [events]);

  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const offset = (firstDay.getDay() + 6) % 7;
    const totalSlots = Math.ceil((offset + lastDay.getDate()) / 7) * 7;
    const slots: Array<{ date: Date | null }> = [];

    for (let i = 0; i < totalSlots; i += 1) {
      const dayNumber = i - offset + 1;
      if (dayNumber < 1 || dayNumber > lastDay.getDate()) {
        slots.push({ date: null });
      } else {
        slots.push({ date: new Date(year, month, dayNumber) });
      }
    }
    return slots;
  }, [currentMonth]);

  return (
    <section className={`${ui.card} p-4`}>
      <div className="flex items-center justify-between">
        <h3 className="sab-section-kicker">Calendario de eventos</h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="rounded-lg border border-sab-sand px-2 py-1 text-xs font-semibold text-sab-forest transition hover:bg-sab-mist"
            aria-label="Mes anterior"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            className="rounded-lg border border-sab-sand px-2 py-1 text-xs font-semibold text-sab-forest transition hover:bg-sab-mist"
            aria-label="Mes siguiente"
          >
            →
          </button>
        </div>
      </div>

      <p className="mt-3 font-serif text-sm font-semibold capitalize text-sab-ink">{monthLabel(currentMonth)}</p>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-sab-ink/50">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {monthDays.map((slot, index) => {
          if (!slot.date) {
            return <div key={`empty-${index}`} className="h-10 rounded" />;
          }
          const key = toDateKey(slot.date);
          const dayEvents = grouped.get(key) ?? [];
          const firstEvent = dayEvents[0];
          return (
            <div key={key} className="group relative">
              {firstEvent ? (
                <Link
                  href={`/eventos/${firstEvent.slug}`}
                  className="flex h-10 w-full items-center justify-center rounded-lg border border-sab-terracotta/30 bg-sab-terracotta/10 text-sm font-bold text-sab-forest transition hover:bg-sab-terracotta/20"
                  title={dayEvents.map((e) => e.title).join(" · ")}
                >
                  <span>{slot.date.getDate()}</span>
                  <span className="ml-1 h-2 w-2 rounded-full bg-sab-terracotta" />
                </Link>
              ) : (
                <div className="flex h-10 w-full items-center justify-center rounded-lg border border-sab-sand/80 bg-sab-mist/50 text-sm text-sab-ink/70">
                  {slot.date.getDate()}
                </div>
              )}
              {firstEvent ? (
                <div className="absolute left-1/2 top-full z-20 hidden w-56 -translate-x-1/2 pt-1 group-hover:block group-focus-within:block">
                  <div className="rounded-xl border border-sab-sand bg-white p-2 text-left text-xs text-sab-ink shadow-sab-lg">
                    {dayEvents.map((eventItem) => (
                      <div key={eventItem.id} className="rounded-lg px-1 py-0.5 hover:bg-sab-mist">
                        <Link
                          href={`/eventos/${eventItem.slug}`}
                          className="block truncate font-medium hover:text-sab-terracotta hover:underline"
                        >
                          {eventItem.title}
                        </Link>
                        {showAdminToolbar ? (
                          <div className="mt-1 flex justify-start">
                            <EventAdminControls eventId={eventItem.id} isVal={isVal} compact />
                          </div>
                        ) : null}
                      </div>
                    ))}
                    <p className="mt-1 px-1 font-semibold text-sab-terracotta">Click para ver detalle</p>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
