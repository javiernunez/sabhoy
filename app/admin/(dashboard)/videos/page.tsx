import { redirect } from "next/navigation";
import { AdminVideosList } from "@/components/admin/AdminVideosList";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { searchParams?: { ok?: string } };

export default async function AdminVideosPage({ searchParams }: Props) {
  if (!(await isAdminUser())) {
    redirect("/cuenta/iniciar-sesion?callbackUrl=%2Fadmin%2Fvideos");
  }

  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
  });

  const ok = searchParams?.ok;
  const notice = ok === "created" ? "Video creado correctamente." : ok === "updated" ? "Video guardado correctamente." : null;

  return <AdminVideosList initialVideos={videos} notice={notice} />;
}
