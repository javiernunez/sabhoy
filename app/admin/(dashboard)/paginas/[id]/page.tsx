import { notFound, redirect } from "next/navigation";
import { AdminPaginaEditForm } from "@/components/admin/AdminPaginaEditForm";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { params: { id: string } };

export default async function AdminEditPaginaPage({ params }: Props) {
  if (!(await isAdminUser())) {
    redirect(
      `/cuenta/iniciar-sesion?callbackUrl=${encodeURIComponent(`/admin/paginas/${params.id}`)}`,
    );
  }

  const id = Number(params.id);
  if (!Number.isFinite(id) || id < 1) {
    notFound();
  }

  const page = await prisma.evergreenPage.findUnique({ where: { id } });
  if (!page) {
    notFound();
  }

  return <AdminPaginaEditForm page={page} />;
}
