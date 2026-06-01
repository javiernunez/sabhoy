import { redirect } from "next/navigation";
import { AdminDenunciasList } from "@/components/admin/AdminDenunciasList";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { searchParams?: { ok?: string } };

export default async function AdminDenunciasPage({ searchParams }: Props) {
  if (!(await isAdminUser())) {
    redirect("/cuenta/iniciar-sesion?callbackUrl=%2Fadmin%2Fdenuncias");
  }

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  const ok = searchParams?.ok;
  const notice = ok === "created" ? "Denuncia creada correctamente." : ok === "updated" ? "Denuncia guardada correctamente." : null;

  return <AdminDenunciasList initialReports={reports} notice={notice} />;
}
