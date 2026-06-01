import Image from "next/image";
import { uiMediaUrl, type UiMediaOptions } from "@/lib/media-url";

type UiImageProps = {
  src: string | null | undefined;
  alt: string;
  /** Primera imagen above-the-fold (LCP). */
  priority?: boolean;
  className?: string;
  /** Relación ancho/alto para reservar espacio (evita CLS). */
  width: number;
  height: number;
  sizes?: string;
  /** Ancho CSS del hueco; carga la variante WebP precortada (p. ej. 160 → -w320). */
  displayWidth?: number;
  media?: UiMediaOptions;
};

/**
 * Imagen de UI vía next/image (WebP/AVIF, responsive).
 * Normaliza rutas /media/... al proxy /api/media/...
 */
export function UiImage({ src, alt, priority, className, width, height, sizes, displayWidth, media }: UiImageProps) {
  const resolved = uiMediaUrl(src, { displayWidth, ...media });
  if (!resolved) return null;

  return (
    <Image
      src={resolved}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes ?? "(max-width: 768px) 100vw, 66vw"}
      priority={priority}
      fetchPriority={priority ? "high" : undefined}
      className={className}
    />
  );
}
