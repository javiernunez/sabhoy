import { redirect } from "next/navigation";
import { AdminDirectorioList } from "@/components/admin/AdminDirectorioList";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { searchParams?: { ok?: string } };

export default async function AdminAsociacionesPage({ searchParams }: Props) {
  if (!(await isAdminUser())) {
    redirect("/cuenta/iniciar-sesion?callbackUrl=%2Fadmin%2Fasociaciones");
  }

  const entries = await prisma.localDirectoryEntry.findMany({
    where: { kind: "ASSOCIATION" },
    select: { id: true, name: true, kind: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  const ok = searchParams?.ok;
  const notice = ok === "created" ? "Asociación creada correctamente." : ok === "updated" ? "Asociación guardada correctamente." : null;

  return <AdminDirectorioList initialEntries={entries} kindFilter="ASSOCIATION" title="Asociaciones" notice={notice} />;
}
