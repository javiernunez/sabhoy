import { redirect } from "next/navigation";
import { AdminDirectorioList } from "@/components/admin/AdminDirectorioList";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { searchParams?: { ok?: string } };

export default async function AdminDirectorioPage({ searchParams }: Props) {
  if (!(await isAdminUser())) {
    redirect("/cuenta/iniciar-sesion?callbackUrl=%2Fadmin%2Fdirectorio");
  }

  const entries = await prisma.localDirectoryEntry.findMany({
    select: { id: true, name: true, kind: true },
    orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
  const ok = searchParams?.ok;
  const notice = ok === "created" ? "Entrada creada correctamente." : ok === "updated" ? "Entrada guardada correctamente." : null;

  return <AdminDirectorioList initialEntries={entries} notice={notice} />;
}
