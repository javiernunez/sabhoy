import { CSS_DIRECTORY_HERO_WIDTH } from "@/lib/image-variants";
import { uiMediaUrl } from "@/lib/media-url";

const PLACEHOLDER = "/images/comercios/catalogo-local-placeholder.svg";

type Props = Readonly<{
  imageUrl: string | null | undefined;
  alt: string;
  heightClass: string;
  /** Ancho CSS del hueco; por defecto hero de ficha (~640px → `-w1200`). */
  displayWidth?: number;
  children?: React.ReactNode;
}>;

/** Fondo decorativo en capa inferior; `{children}` queda por encima (p. ej. controles admin). */
export function AssociationHeaderBackdrop({
  imageUrl,
  alt,
  heightClass,
  displayWidth = CSS_DIRECTORY_HERO_WIDTH,
  children,
}: Props) {
  const resolved = uiMediaUrl(imageUrl ?? null, { displayWidth }) ?? PLACEHOLDER;

  return (
    <div className={`relative w-full bg-slate-100 ${heightClass}`} aria-label={alt}>
      <div
        aria-hidden
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${JSON.stringify(resolved)})` }}
      />
      {children ? <div className="relative z-10 h-full w-full">{children}</div> : null}
    </div>
  );
}
