import { redirect } from "next/navigation";
import { AdminNoticiasList } from "@/components/admin/AdminNoticiasList";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = { searchParams?: { ok?: string } };

export default async function AdminNoticiasPage({ searchParams }: Props) {
  if (!(await isAdminUser())) {
    redirect("/cuenta/iniciar-sesion?callbackUrl=%2Fadmin%2Fnoticias");
  }

  const [articles, initialPortadaItems] = await Promise.all([
    prisma.article.findMany({
      orderBy: { publishedAt: "desc" },
      take: 100,
      select: { id: true, title: true, status: true },
    }),
    prisma.article.findMany({
      where: { status: "published" },
      orderBy: [{ portadaRank: "desc" }, { publishedAt: "desc" }],
      take: 40,
      select: { id: true, title: true },
    }),
  ]);

  const ok = searchParams?.ok;
  const notice = ok === "created" ? "Noticia creada correctamente." : ok === "updated" ? "Noticia guardada correctamente." : null;

  return <AdminNoticiasList initialArticles={articles} initialPortadaItems={initialPortadaItems} notice={notice} />;
}
