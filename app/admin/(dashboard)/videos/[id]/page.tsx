import { notFound, redirect } from "next/navigation";
import { AdminVideoForm } from "@/components/admin/AdminVideoForm";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { params: { id: string } };

export default async function AdminEditarVideoPage({ params }: Props) {
  if (!(await isAdminUser())) {
    redirect(`/cuenta/iniciar-sesion?callbackUrl=${encodeURIComponent(`/admin/videos/${params.id}`)}`);
  }
  const id = Number(params.id);
  if (!Number.isFinite(id) || id < 1) notFound();
  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) notFound();

  return <AdminVideoForm video={video} />;
}
