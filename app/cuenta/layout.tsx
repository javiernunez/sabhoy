import type { ReactNode } from "react";
import { Providers } from "@/components/Providers";

/** SessionProvider solo en rutas de cuenta (signIn client). */
export default function CuentaLayout({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
}
