import { notFound, redirect } from "next/navigation";
import { AdminNoticiaForm } from "@/components/admin/AdminNoticiaForm";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { params: { id: string } };

export default async function AdminEditarNoticiaPage({ params }: Props) {
  if (!(await isAdminUser())) {
    redirect(`/cuenta/iniciar-sesion?callbackUrl=${encodeURIComponent(`/admin/noticias/${params.id}`)}`);
  }
  const id = Number(params.id);
  if (!Number.isFinite(id) || id < 1) notFound();
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();

  return <AdminNoticiaForm article={article} />;
}
