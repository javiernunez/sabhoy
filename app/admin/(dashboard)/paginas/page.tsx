import { redirect } from "next/navigation";
import { AdminPaginasList } from "@/components/admin/AdminPaginasList";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { searchParams?: { ok?: string } };

export default async function AdminPaginasPage({ searchParams }: Props) {
  if (!(await isAdminUser())) {
    redirect("/cuenta/iniciar-sesion?callbackUrl=%2Fadmin%2Fpaginas");
  }

  const pages = await prisma.evergreenPage.findMany({
    orderBy: { title: "asc" },
  });

  const ok = searchParams?.ok;
  const notice = ok === "created" ? "Página creada correctamente." : ok === "updated" ? "Página guardada correctamente." : null;

  return <AdminPaginasList initialPages={pages} notice={notice} />;
}
