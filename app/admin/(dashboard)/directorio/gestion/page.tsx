import { redirect } from "next/navigation";
import { AdminDirectorioPanel } from "@/components/admin/AdminDirectorioPanel";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDirectorioGestionPage() {
  if (!(await isAdminUser())) {
    redirect("/cuenta/iniciar-sesion?callbackUrl=%2Fadmin%2Fdirectorio%2Fgestion");
  }

  const entries = await prisma.localDirectoryEntry.findMany({
    include: {
      categoryLinks: {
        include: { category: { include: { parent: true } } },
        orderBy: [{ category: { parentId: "asc" } }, { category: { name: "asc" } }],
      },
    },
    orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
  const categories = await prisma.localDirectoryCategory.findMany({
    include: { parent: true },
    orderBy: [{ kind: "asc" }, { parentId: "asc" }, { name: "asc" }],
  });

  return <AdminDirectorioPanel initialEntries={entries} initialCategories={categories} />;
}
