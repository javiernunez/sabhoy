import { notFound, redirect } from "next/navigation";
import { AdminNostrePobleForm } from "@/components/admin/AdminNostrePobleForm";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { params: { id: string } };

export default async function AdminEditarNostrePoblePage({ params }: Props) {
  if (!(await isAdminUser())) {
    redirect(`/cuenta/iniciar-sesion?callbackUrl=${encodeURIComponent(`/admin/nostre-poble/${params.id}`)}`);
  }
  const id = Number(params.id);
  if (!Number.isFinite(id) || id < 1) notFound();
  const page = await prisma.nostrePoblePage.findUnique({ where: { id } });
  if (!page) notFound();

  return <AdminNostrePobleForm page={page} />;
}
