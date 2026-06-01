"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import type { Locale } from "@/lib/i18n";

type LoginFormProps = {
  locale?: Locale;
};

export function LoginForm({ locale = "es" }: LoginFormProps) {
  const isVal = locale === "val";
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(isVal ? "Correu o contrasenya incorrectes." : "Email o contrasena incorrectos.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="container-page max-w-md">
      <h1 className="text-3xl font-bold">{isVal ? "Iniciar sessió" : "Iniciar sesion"}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {isVal ? "Accedix amb el teu correu. Si encara no tens compte, " : "Accede con tu correo. Si aun no tienes cuenta, "}
        <Link href="/cuenta/registro" className="font-medium text-blue-800 underline">
          {isVal ? "registra't" : "registrate"}
        </Link>
        .
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{isVal ? "Contrasenya" : "Contrasena"}</label>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? (isVal ? "Entrant..." : "Entrando...") : isVal ? "Entrar" : "Entrar"}
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </div>
  );
}
