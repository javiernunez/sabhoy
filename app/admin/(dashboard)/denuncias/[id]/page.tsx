import { notFound, redirect } from "next/navigation";
import { AdminDenunciaForm } from "@/components/admin/AdminDenunciaForm";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { params: { id: string } };

export default async function AdminEditarDenunciaPage({ params }: Props) {
  if (!(await isAdminUser())) {
    redirect(`/cuenta/iniciar-sesion?callbackUrl=${encodeURIComponent(`/admin/denuncias/${params.id}`)}`);
  }
  const id = Number(params.id);
  if (!Number.isFinite(id) || id < 1) notFound();
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) notFound();

  return <AdminDenunciaForm report={report} />;
}
