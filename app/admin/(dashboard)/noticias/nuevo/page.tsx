import { redirect } from "next/navigation";
import { AdminNoticiaForm } from "@/components/admin/AdminNoticiaForm";
import { isAdminUser } from "@/lib/auth";

export default async function AdminNuevaNoticiaPage() {
  if (!(await isAdminUser())) {
    redirect("/cuenta/iniciar-sesion?callbackUrl=%2Fadmin%2Fnoticias%2Fnuevo");
  }

  return <AdminNoticiaForm />;
}
