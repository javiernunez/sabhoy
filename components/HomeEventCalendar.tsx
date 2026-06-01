import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { EventCalendarWidget } from "@/components/EventCalendarWidget";

const EventCalendarWidgetLazy = dynamic(
  () => import("@/components/EventCalendarWidget").then((m) => m.EventCalendarWidget),
  {
    loading: () => (
      <section
        className="sab-card p-4"
        aria-hidden
      >
        <div className="h-4 w-40 animate-pulse rounded bg-sab-sand" />
        <div className="mt-4 grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-sab-mist" />
          ))}
        </div>
      </section>
    ),
    ssr: false,
  },
);

export function HomeEventCalendar(props: ComponentProps<typeof EventCalendarWidget>) {
  return <EventCalendarWidgetLazy {...props} />;
}
