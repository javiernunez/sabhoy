import { redirect } from "next/navigation";
import { AdminPaginaEditForm } from "@/components/admin/AdminPaginaEditForm";
import { isAdminUser } from "@/lib/auth";

export default async function AdminNuevaPaginaPage() {
  if (!(await isAdminUser())) {
    redirect("/cuenta/iniciar-sesion?callbackUrl=%2Fadmin%2Fpaginas%2Fnuevo");
  }

  return <AdminPaginaEditForm />;
}
