import { redirect } from "next/navigation";
import { AdminEventoForm } from "@/components/admin/AdminEventoForm";
import { isAdminUser } from "@/lib/auth";

export default async function AdminNuevoEventoPage() {
  if (!(await isAdminUser())) {
    redirect("/cuenta/iniciar-sesion?callbackUrl=%2Fadmin%2Feventos%2Fnuevo");
  }

  return <AdminEventoForm />;
}
