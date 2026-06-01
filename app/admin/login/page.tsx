import { redirect } from "next/navigation";

/** Enlace antiguo: el acceso es con cuenta (rol admin), no contrasena suelta. */
export default function AdminLoginLegacyPage() {
  redirect("/cuenta/iniciar-sesion?callbackUrl=%2Fadmin%2Fnoticias");
}
