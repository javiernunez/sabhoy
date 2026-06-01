import { notFound, redirect } from "next/navigation";
import { AdminEventoForm } from "@/components/admin/AdminEventoForm";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { params: { id: string } };

export default async function AdminEditarEventoPage({ params }: Props) {
  if (!(await isAdminUser())) {
    redirect(`/cuenta/iniciar-sesion?callbackUrl=${encodeURIComponent(`/admin/eventos/${params.id}`)}`);
  }
  const id = Number(params.id);
  if (!Number.isFinite(id) || id < 1) notFound();
  const eventItem = await prisma.event.findUnique({ where: { id } });
  if (!eventItem) notFound();

  return <AdminEventoForm eventItem={eventItem} />;
}
