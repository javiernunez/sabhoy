export const NAV_ITEMS = [
  { href: "/noticias", label: "Noticias", icon: "newspaper" },
  { href: "/politica", label: "Política", icon: "balance" },
  { href: "/videos", label: "Videos", icon: "play" },
  { href: "/el-nostre-poble", label: "El Nostre Poble", icon: "landmark" },
  { href: "/comercios", label: "Comercios", icon: "store" },
  { href: "/asociaciones", label: "Asociaciones", icon: "users" },
  { href: "/denuncias", label: "Denuncias", icon: "megaphone" },
  { href: "/eventos", label: "Eventos", icon: "calendar" },
  { href: "/informacion-util", label: "Info", icon: "book" },
] as const;

export type NavIconId = (typeof NAV_ITEMS)[number]["icon"];

export const QUICK_ACCESS = [
  { href: "/telefonos-importantes", label: "Telefonos" },
  { href: "/farmacias-de-guardia", label: "Farmacias" },
  { href: "/transporte-publico-sab", label: "Transporte" },
  { href: "/como-empadronarse", label: "Empadronarse" },
];

export const REPORT_CATEGORIES = ["ruido", "trafico", "limpieza", "seguridad"] as const;

export const SITE_NAME = "SAB Hoy";
export const SITE_DESCRIPTION =
  "Noticias de San Antonio de Benagéber (SAB), qué pasa en el municipio, denuncias vecinales e información útil: servicios, teléfonos y trámites en el Camp de Túria, Valencia.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sabhoy.es";
export const SITE_INSTAGRAM_URL = "https://www.instagram.com/sabhoy";

/** Meta tag de verificación de Google Search Console (solo el código, sin `content=`). */
export const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
