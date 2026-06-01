import { redirect } from "next/navigation";
import { AdminDirectorioForm } from "@/components/admin/AdminDirectorioForm";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type DirectoryKindParam = "COMMERCE" | "ASSOCIATION" | "POLITICS" | "SPORT";

type Props = { searchParams?: { kind?: string } };

function resolveKind(value: string | undefined): DirectoryKindParam | undefined {
  if (value === "COMMERCE" || value === "ASSOCIATION" || value === "POLITICS" || value === "SPORT") return value;
  return undefined;
}

export default async function AdminNuevaEntradaDirectorioPage({ searchParams }: Props) {
  if (!(await isAdminUser())) {
    redirect("/cuenta/iniciar-sesion?callbackUrl=%2Fadmin%2Fdirectorio%2Fnuevo");
  }

  const categories = await prisma.localDirectoryCategory.findMany({
    orderBy: [{ kind: "asc" }, { parentId: "asc" }, { name: "asc" }],
  });
  const initialKind = resolveKind(searchParams?.kind);

  return <AdminDirectorioForm categories={categories} initialKind={initialKind} />;
}
