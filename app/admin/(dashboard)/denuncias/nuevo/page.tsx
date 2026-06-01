import { redirect } from "next/navigation";
import { AdminDenunciaForm } from "@/components/admin/AdminDenunciaForm";
import { isAdminUser } from "@/lib/auth";

export default async function AdminNuevaDenunciaPage() {
  if (!(await isAdminUser())) {
    redirect("/cuenta/iniciar-sesion?callbackUrl=%2Fadmin%2Fdenuncias%2Fnuevo");
  }

  return <AdminDenunciaForm />;
}
