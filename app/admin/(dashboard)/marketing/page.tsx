import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function pctChange(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

type KpiCardProps = {
  title: string;
  value: number;
  previous: number;
  target: string;
};

function KpiCard({ title, value, previous, target }: Readonly<KpiCardProps>) {
  const delta = pctChange(value, previous);
  const deltaTone = delta >= 0 ? "text-blue-700" : "text-rose-700";
  const deltaPrefix = delta >= 0 ? "+" : "";
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <p className={`mt-1 text-sm font-medium ${deltaTone}`}>{`${deltaPrefix}${delta}% vs 30 dias previos (${previous})`}</p>
      <p className="mt-2 text-xs text-slate-500">Objetivo 90 dias: {target}</p>
    </article>
  );
}

export default async function AdminMarketingPage() {
  if (!(await isAdminUser())) {
    redirect("/cuenta/iniciar-sesion?callbackUrl=%2Fadmin%2Fmarketing");
  }

  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const since60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    newsletterCurrent,
    newsletterPrevious,
    reportsCreatedCurrent,
    reportsCreatedPrevious,
    reportLikesCurrentAgg,
    reportLikesPreviousAgg,
    eventsCurrent,
    eventsPrevious,
  ] = await Promise.all([
    prisma.newsletterSubscription.count({
      where: { confirmedAt: { not: null }, createdAt: { gte: since30 } },
    }),
    prisma.newsletterSubscription.count({
      where: { confirmedAt: { not: null }, createdAt: { gte: since60, lt: since30 } },
    }),
    prisma.report.count({ where: { createdAt: { gte: since30 } } }),
    prisma.report.count({ where: { createdAt: { gte: since60, lt: since30 } } }),
    prisma.report.aggregate({ _sum: { likeCount: true }, where: { createdAt: { gte: since30 } } }),
    prisma.report.aggregate({ _sum: { likeCount: true }, where: { createdAt: { gte: since60, lt: since30 } } }),
    prisma.event.count({ where: { createdAt: { gte: since30 } } }),
    prisma.event.count({ where: { createdAt: { gte: since60, lt: since30 } } }),
  ]);

  const reportLikesCurrent = reportLikesCurrentAgg._sum.likeCount ?? 0;
  const reportLikesPrevious = reportLikesPreviousAgg._sum.likeCount ?? 0;
  const communityInteractionsCurrent = reportsCreatedCurrent + reportLikesCurrent;
  const communityInteractionsPrevious = reportsCreatedPrevious + reportLikesPrevious;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Marketing local (90 dias)</h1>
        <p className="mt-1 text-sm text-slate-600">
          Baseline operativo para seguimiento quincenal. Ventana comparativa: ultimos 30 dias vs 30 dias anteriores.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Suscriptores newsletter" value={newsletterCurrent} previous={newsletterPrevious} target="+20%" />
        <KpiCard
          title="Interacciones comunitarias"
          value={communityInteractionsCurrent}
          previous={communityInteractionsPrevious}
          target="+40%"
        />
        <KpiCard title="Incidencias enviadas" value={reportsCreatedCurrent} previous={reportsCreatedPrevious} target="+40%" />
        <KpiCard title="Eventos publicados" value={eventsCurrent} previous={eventsPrevious} target="+25% CTR hacia agenda" />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">Fuentes y lectura recomendada</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>CTR de portada a secciones se mide en GA4 mediante evento <code>cta_click</code>.</li>
          <li>Usuarios locales se revisan en GA4 filtrando por ubicacion (L&apos;Eliana / Camp de Turia).</li>
          <li>Este panel prioriza las metricas internas accionables de participacion y captacion.</li>
        </ul>
      </section>
    </div>
  );
}
