import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/constants";

export const alt = `${SITE_NAME} — noticias e información de San Antonio de Benagéber`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0f172a 0%, #1e40af 45%, #2563eb 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 64px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.1,
              letterSpacing: -1,
            }}
          >
            {SITE_NAME}
          </span>
          <span
            style={{
              marginTop: 20,
              fontSize: 28,
              fontWeight: 500,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {`Noticias, denuncias e información de San Antonio de Benagéber, Camp de Túria`}
          </span>
        </div>
      </div>
    ),
    size,
  );
}
