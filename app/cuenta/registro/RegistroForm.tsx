"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import type { Locale } from "@/lib/i18n";

type RegistroFormProps = {
  locale?: Locale;
};

export function RegistroForm({ locale = "es" }: RegistroFormProps) {
  const isVal = locale === "val";
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim() || undefined,
        email: email.trim().toLowerCase(),
        password,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };

    if (!res.ok) {
      setError(data.error || (isVal ? "No s'ha pogut completar el registre." : "No se pudo completar el registro."));
      setLoading(false);
      return;
    }

    const sign = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (sign?.error) {
      setError(isVal ? "Compte creat. Inicia sessió manualment." : "Cuenta creada. Inicia sesion manualmente.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <h1 className="text-3xl font-bold">{isVal ? "Crear compte" : "Crear cuenta"}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {isVal
          ? "Necessites un compte per a enviar denúncies ciutadanes. Si vols només el butlletí, pots subscriure't des del peu de pàgina sense registrar-te."
          : "Necesitas una cuenta para enviar denuncias ciudadanas. Si quieres solo la newsletter, puedes inscribirte desde el pie de la pagina sin registrarte."}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        <Link href="/cuenta/iniciar-sesion" className="font-medium text-sab-terracotta-dark underline">
          {isVal ? "Ja tinc compte" : "Ya tengo cuenta"}
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium">{isVal ? "Nom (opcional)" : "Nombre (opcional)"}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{isVal ? "Contrasenya (mín. 8 caràcters)" : "Contrasena (min. 8 caracteres)"}</label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-sab-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-sab-terracotta-dark disabled:opacity-60"
        >
          {loading ? (isVal ? "Registrant..." : "Registrando...") : isVal ? "Registrar-se" : "Registrarse"}
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </>
  );
}
