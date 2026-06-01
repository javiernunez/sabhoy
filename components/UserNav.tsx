import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import type { Locale } from "@/lib/i18n";
import { getTranslator } from "@/lib/i18n";

type UserNavProps = {
  locale?: Locale;
};

export async function UserNav({ locale = "es" }: UserNavProps) {
  const session = await getServerSession(authOptions);
  const t = getTranslator(locale);

  if (!session?.user) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link href="/cuenta/iniciar-sesion" className="rounded-lg px-2 py-1 text-slate-700 hover:bg-slate-100">
          {t("auth.login")}
        </Link>
        <Link
          href="/cuenta/registro"
          className="rounded-lg bg-blue-600 px-2.5 py-1 text-white hover:bg-blue-700"
        >
          {t("auth.register")}
        </Link>
      </div>
    );
  }

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="max-w-[10rem] truncate text-slate-600" title={session.user.email || ""}>
        {session.user.name || session.user.email}
      </span>
      {isAdmin ? (
        <Link href="/admin" className="rounded-lg px-2 py-1 text-blue-800 hover:bg-blue-50">
          Admin
        </Link>
      ) : null}
      <form action="/api/auth/signout" method="POST">
        <button type="submit" className="rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100">
          {t("auth.logout")}
        </button>
      </form>
    </div>
  );
}
