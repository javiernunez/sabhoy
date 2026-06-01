import { redirect } from "next/navigation";
import { AdminDirectorioList } from "@/components/admin/AdminDirectorioList";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { searchParams?: { ok?: string } };

export default async function AdminComerciosPage({ searchParams }: Props) {
  if (!(await isAdminUser())) {
    redirect("/cuenta/iniciar-sesion?callbackUrl=%2Fadmin%2Fcomercios");
  }

  const entries = await prisma.localDirectoryEntry.findMany({
    where: { kind: "COMMERCE" },
    select: { id: true, name: true, kind: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const ok = searchParams?.ok;
  const notice = ok === "created" ? "Comercio creado correctamente." : ok === "updated" ? "Comercio guardado correctamente." : null;

  return <AdminDirectorioList initialEntries={entries} kindFilter="COMMERCE" title="Comercios" notice={notice} />;
}
