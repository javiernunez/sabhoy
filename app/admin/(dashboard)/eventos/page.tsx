import { redirect } from "next/navigation";
import { AdminEventosList } from "@/components/admin/AdminEventosList";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { searchParams?: { ok?: string } };

export default async function AdminEventosPage({ searchParams }: Props) {
  if (!(await isAdminUser())) {
    redirect("/cuenta/iniciar-sesion?callbackUrl=%2Fadmin%2Feventos");
  }

  const events = await prisma.event.findMany({
    orderBy: [{ eventDate: "asc" }, { createdAt: "desc" }],
  });

  const ok = searchParams?.ok;
  const notice = ok === "created" ? "Evento creado correctamente." : ok === "updated" ? "Evento guardado correctamente." : null;

  return <AdminEventosList initialEvents={events} notice={notice} />;
}
