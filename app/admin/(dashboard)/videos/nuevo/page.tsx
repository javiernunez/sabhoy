import { redirect } from "next/navigation";
import { AdminVideoForm } from "@/components/admin/AdminVideoForm";
import { isAdminUser } from "@/lib/auth";

export default async function AdminNuevoVideoPage() {
  if (!(await isAdminUser())) {
    redirect("/cuenta/iniciar-sesion?callbackUrl=%2Fadmin%2Fvideos%2Fnuevo");
  }

  return <AdminVideoForm />;
}
