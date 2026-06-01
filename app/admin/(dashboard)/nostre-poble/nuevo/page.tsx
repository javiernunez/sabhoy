import { redirect } from "next/navigation";
import { AdminNostrePobleForm } from "@/components/admin/AdminNostrePobleForm";
import { isAdminUser } from "@/lib/auth";

export default async function AdminNuevoNostrePoblePage() {
  if (!(await isAdminUser())) {
    redirect("/cuenta/iniciar-sesion?callbackUrl=%2Fadmin%2Fnostre-poble%2Fnuevo");
  }

  return <AdminNostrePobleForm />;
}
