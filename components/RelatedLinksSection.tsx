import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { uiMediaUrl } from "@/lib/media-url";

type RelatedItem = {
  href: string;
  title: string;
  description?: string;
  imageUrl?: string | null;
};

type Props = {
  title: string;
  subtitle?: string;
  items: RelatedItem[];
};

export function RelatedLinksSection({ title, subtitle, items }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <Link
            key={`${item.href}-${item.title}`}
            href={item.href}
            className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition hover:border-sab-terracotta/40 hover:shadow"
          >
            <div className="h-32 w-full bg-slate-100">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={uiMediaUrl(item.imageUrl, { displayWidth: 120 }) || item.imageUrl}
                  alt={item.title}
                  width={240}
                  height={160}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-medium uppercase tracking-wide text-slate-500">
                  Sin imagen
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              {item.description ? (
                <p className="mt-1 line-clamp-3 break-words text-sm text-slate-600">{item.description}</p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
