import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: "Noticias e informacion local de San Antonio de Benagéber.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0b4f84",
    icons: [
      { src: "/icons/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/favicon-512x512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/favicon-180x180.png", sizes: "180x180", type: "image/png" },
      { src: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
    ],
  };
}
