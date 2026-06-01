"use client";

import { useState } from "react";

type Props = {
  embedUrl: string;
  title: string;
};

/** Facade: el iframe de YouTube solo se carga tras interacción (ahorra ~500KB+ y main thread en home). */
export function LazyYouTubeEmbed({ embedUrl, title }: Props) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <div className="relative mt-3 w-full overflow-hidden rounded-xl pt-[56.25%]">
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className="relative mt-3 flex w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-900 pt-[56.25%] text-white transition hover:border-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      aria-label={title}
    >
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/90 px-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-2xl shadow-lg" aria-hidden>
          ▶
        </span>
        <span className="text-sm font-medium">Reproducir vídeo</span>
      </span>
    </button>
  );
}
