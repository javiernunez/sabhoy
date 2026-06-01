import { uiMediaUrl } from "@/lib/media-url";

type Props = {
  imageUrl: string;
  alt: string;
};

/**
 * Banner hero: imagen como fondo cover, altura entre ~176px y 400px según ancho.
 */
export function EventHeroImage({ imageUrl, alt }: Props) {
  const src = uiMediaUrl(imageUrl, { displayWidth: 400 }) ?? imageUrl;

  return (
    <div
      className="w-full rounded-2xl border border-slate-200 bg-slate-200 bg-cover bg-center bg-no-repeat shadow-sm"
      style={{
        backgroundImage: `url(${JSON.stringify(src)})`,
        height: "clamp(176px, min(46vw, 400px), 400px)",
      }}
      role="img"
      aria-label={alt}
    />
  );
}
