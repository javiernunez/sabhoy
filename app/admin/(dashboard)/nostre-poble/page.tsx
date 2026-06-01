import { redirect } from "next/navigation";
import { AdminNostrePobleList } from "@/components/admin/AdminNostrePobleList";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { searchParams?: { ok?: string } };

export default async function AdminNostrePoblePage({ searchParams }: Props) {
  if (!(await isAdminUser())) {
    redirect("/cuenta/iniciar-sesion?callbackUrl=%2Fadmin%2Fnostre-poble");
  }

  const pages = await prisma.nostrePoblePage.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  const ok = searchParams?.ok;
  const notice = ok === "created" ? "Página creada correctamente." : ok === "updated" ? "Página guardada correctamente." : null;

  return <AdminNostrePobleList initialPages={pages} notice={notice} />;
}
