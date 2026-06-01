import { notFound, redirect } from "next/navigation";
import { AdminDirectorioForm } from "@/components/admin/AdminDirectorioForm";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { params: { id: string } };

export default async function AdminEditarEntradaDirectorioPage({ params }: Props) {
  if (!(await isAdminUser())) {
    redirect(`/cuenta/iniciar-sesion?callbackUrl=${encodeURIComponent(`/admin/directorio/${params.id}`)}`);
  }
  const id = Number(params.id);
  if (!Number.isFinite(id) || id < 1) notFound();

  const [entry, categories] = await Promise.all([
    prisma.localDirectoryEntry.findUnique({
      where: { id },
      include: {
        categoryLinks: {
          include: { category: true },
        },
      },
    }),
    prisma.localDirectoryCategory.findMany({
      orderBy: [{ kind: "asc" }, { parentId: "asc" }, { name: "asc" }],
    }),
  ]);
  if (!entry) notFound();

  return <AdminDirectorioForm categories={categories} entry={entry} />;
}
