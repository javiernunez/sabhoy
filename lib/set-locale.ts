"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";

export async function setLocaleAction(formData: FormData) {
  const next = formData.get("locale");
  if (next !== "es" && next !== "val") return;
  cookies().set(LOCALE_COOKIE, next as Locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  const returnTo = formData.get("returnTo");
  if (typeof returnTo === "string" && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
    redirect(returnTo);
  }
  redirect("/");
}
