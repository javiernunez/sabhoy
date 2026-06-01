import Link from "next/link";
import { getServerSession } from "next-auth";
import { NewsletterSection } from "@/components/NewsletterSection";
import { authOptions } from "@/lib/auth-options";
import { SITE_INSTAGRAM_URL, SITE_NAME } from "@/lib/constants";
import { getNavLabelByHref, getTranslator } from "@/lib/i18n";
import { getLocaleFromCookie } from "@/lib/i18n-server";

export async function Footer() {
  const locale = getLocaleFromCookie();
  const session = await getServerSession(authOptions);
  const t = getTranslator(locale);

  return (
    <footer className="mt-auto border-t-4 border-sab-terracotta bg-sab-forest text-sab-cream">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-lg font-bold text-white">{SITE_NAME}</p>
          <p className="mt-2 text-sm leading-relaxed text-sab-cream/80">{t("footer.description")}</p>
        </div>
        <div>
          <p className="sab-section-kicker !text-sab-gold/90">{t("footer.links")}</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <Link href="/noticias" className="text-sab-cream/90 transition hover:text-white">
                {getNavLabelByHref("/noticias", t)}
              </Link>
            </li>
            <li>
              <Link href="/videos" className="text-sab-cream/90 transition hover:text-white">
                {getNavLabelByHref("/videos", t)}
              </Link>
            </li>
            <li>
              <Link href="/eventos" className="text-sab-cream/90 transition hover:text-white">
                {getNavLabelByHref("/eventos", t)}
              </Link>
            </li>
            <li>
              <Link href="/denuncias" className="text-sab-cream/90 transition hover:text-white">
                {getNavLabelByHref("/denuncias", t)}
              </Link>
            </li>
            <li>
              <Link href="/denuncias/nueva" className="text-sab-cream/90 transition hover:text-white">
                {t("footer.ctaReport")}
              </Link>
            </li>
            <li>
              <Link href="/comercios" className="text-sab-cream/90 transition hover:text-white">
                {t("footer.ctaCommerce")}
              </Link>
            </li>
            <li>
              <Link href="/el-nostre-poble" className="text-sab-cream/90 transition hover:text-white">
                {getNavLabelByHref("/el-nostre-poble", t)}
              </Link>
            </li>
            <li>
              <Link href="/informacion-util" className="text-sab-cream/90 transition hover:text-white">
                {getNavLabelByHref("/informacion-util", t)}
              </Link>
            </li>
            <li>
              <Link href="/quienes-somos" className="text-sab-cream/90 transition hover:text-white">
                {t("footer.about")}
              </Link>
            </li>
            <li>
              <a
                href={SITE_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sab-cream/90 transition hover:text-white"
                aria-label={t("footer.instagramAria")}
              >
                <InstagramGlyph className="h-4 w-4 shrink-0 opacity-90" />
                Instagram
              </a>
            </li>
          </ul>
        </div>
        <NewsletterSection locale={locale} variant="footer" defaultEmail={session?.user?.email} />
        <div>
          <p className="sab-section-kicker !text-sab-gold/90">{t("footer.local")}</p>
          <p className="mt-3 text-sm leading-relaxed text-sab-cream/85">
            San Antonio de Benagéber · Camp de Túria · Comunitat Valenciana
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-4 text-center text-xs text-sab-cream/55">
          © {new Date().getFullYear()} {SITE_NAME}
        </div>
      </div>
    </footer>
  );
}

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.668.072 4.948c.2 4.354 2.618 6.782 6.98 6.981C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.199 6.782-2.617 6.979-6.981.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.164 6.164 0 100 12.324 6.164 6.164 0 000-12.324zm0 10.162a3.997 3.997 0 113.997-3.996A3.999 3.999 0 0112 16zm6.406-11.845a1.44 1.44 0 11-2.881.001 1.44 1.44 0 012.881-.001z" />
    </svg>
  );
}
