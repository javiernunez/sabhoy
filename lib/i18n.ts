export const LOCALES = ["es", "val"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_COOKIE = "sh_locale";
export const DEFAULT_LOCALE: Locale = "es";

type Dictionary = Record<string, string>;

const es: Dictionary = {
  "language.spanish": "Castellano",
  "language.valencian": "Valenciano",
  "nav.main": "Navegación principal",
  "nav.home": "Inicio",
  "nav.news": "Noticias",
  "nav.politics": "Política",
  "nav.videos": "Videos",
  "nav.commerces": "Comercios",
  "nav.associations": "Asociaciones",
  "nav.sports": "Deportes",
  "nav.reports": "Denuncias",
  "nav.events": "Eventos",
  "nav.nostrePoble": "El Nostre Poble",
  "nav.usefulInfo": "Info",
  "breadcrumb.nuevaDenuncia": "Nueva denuncia",
  "breadcrumb.cuenta": "Cuenta",
  "auth.login": "Iniciar sesión",
  "auth.register": "Registrarse",
  "auth.logout": "Salir",
  "menu.open": "Abrir menú",
  "menu.close": "Cerrar menú",
  "footer.description": "Portal independiente de San Antonio de Benagéber, plural y objetivo: sin afiliación política ni partidista. Un altavoz para los vecinos.",
  "footer.links": "Enlaces",
  "footer.about": "Quiénes somos",
  "footer.newsletter": "Newsletter",
  "footer.newsletterDescription": "Recibe avisos puntuales (sin spam). Puedes darte de baja cuando quieras.",
  "footer.local": "Local",
  "footer.instagramAria": "SAB Hoy en Instagram (se abre en una pestaña nueva)",
  "footer.ctaReport": "Enviar una denuncia ciudadana",
  "footer.ctaCommerce": "Valora negocios locales",
  "newsletter.emailLabel": "Email para la newsletter",
  "newsletter.subscribe": "Suscribirse",
  "newsletter.error": "No se pudo inscribir.",
  "newsletter.pending": "Te hemos enviado un correo. Confirma la suscripción desde el enlace que te enviamos.",
  "newsletter.alreadyConfirmed": "Ya estabas inscrito.",
  "newsletter.confirm.titleOk": "Suscripción confirmada",
  "newsletter.confirm.bodyOk": "Gracias. Ya recibirás la newsletter cuando la enviemos.",
  "newsletter.confirm.titleAlready": "Ya estabas inscrito",
  "newsletter.confirm.bodyAlready": "Este correo ya estaba confirmado en la newsletter.",
  "newsletter.confirm.titleInvalid": "Enlace no válido",
  "newsletter.confirm.bodyInvalid": "El enlace ha caducado o no es correcto. Vuelve a suscribirte desde el pie de la web.",
  "newsletter.confirm.backHome": "Volver al inicio",
};

const val: Dictionary = {
  "language.spanish": "Castellà",
  "language.valencian": "Valencià",
  "nav.main": "Navegació principal",
  "nav.home": "Inici",
  "nav.news": "Notícies",
  "nav.politics": "Política",
  "nav.videos": "Vídeos",
  "nav.commerces": "Comerços",
  "nav.associations": "Associacions",
  "nav.sports": "Esports",
  "nav.reports": "Denúncies",
  "nav.events": "Esdeveniments",
  "nav.nostrePoble": "El Nostre Poble",
  "nav.usefulInfo": "Info",
  "breadcrumb.nuevaDenuncia": "Nova denúncia",
  "breadcrumb.cuenta": "Compte",
  "auth.login": "Iniciar sessió",
  "auth.register": "Registrar-se",
  "auth.logout": "Eixir",
  "menu.open": "Obrir menú",
  "menu.close": "Tancar menú",
  "footer.description": "Portal independent de Sant Antoni de Benaixeve, plural i objectiu: sense afiliació política ni partidista. Un altaveu per al veïnat.",
  "footer.links": "Enllaços",
  "footer.about": "Qui som",
  "footer.newsletter": "Butlletí",
  "footer.newsletterDescription": "Rep avisos puntuals (sense spam). Pots donar-te de baixa quan vulgues.",
  "footer.local": "Local",
  "footer.instagramAria": "SAB Hoy a Instagram (s'obre en una pestanya nova)",
  "footer.ctaReport": "Enviar una denúncia ciutadana",
  "footer.ctaCommerce": "Valora negocis locals",
  "newsletter.emailLabel": "Correu per al butlletí",
  "newsletter.subscribe": "Subscriure'm",
  "newsletter.error": "No s'ha pogut subscriure.",
  "newsletter.pending": "T'hem enviat un correu. Confirma la subscripció des de l'enllaç que t'hem enviat.",
  "newsletter.alreadyConfirmed": "Ja estaves subscrit.",
  "newsletter.confirm.titleOk": "Subscripció confirmada",
  "newsletter.confirm.bodyOk": "Gràcies. Ja rebràs el butlletí quan l'enviem.",
  "newsletter.confirm.titleAlready": "Ja estaves subscrit",
  "newsletter.confirm.bodyAlready": "Aquest correu ja estava confirmat al butlletí.",
  "newsletter.confirm.titleInvalid": "Enllaç no vàlid",
  "newsletter.confirm.bodyInvalid": "L'enllaç ha caducat o no és correcte. Torna a subscriure't des del peu de la web.",
  "newsletter.confirm.backHome": "Tornar a l'inici",
};

const dictionaries: Record<Locale, Dictionary> = { es, val };

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && LOCALES.includes(value as Locale);
}

export function getTranslator(locale: Locale) {
  return (key: string) => dictionaries[locale][key] ?? dictionaries[DEFAULT_LOCALE][key] ?? key;
}

export function getNavLabelByHref(href: string, t: (key: string) => string): string {
  switch (href) {
    case "/":
      return t("nav.home");
    case "/noticias":
      return t("nav.news");
    case "/politica":
      return t("nav.politics");
    case "/videos":
      return t("nav.videos");
    case "/comercios":
      return t("nav.commerces");
    case "/asociaciones":
      return t("nav.associations");
    case "/deportes":
      return t("nav.sports");
    case "/denuncias":
      return t("nav.reports");
    case "/eventos":
      return t("nav.events");
    case "/el-nostre-poble":
      return t("nav.nostrePoble");
    case "/informacion-util":
      return t("nav.usefulInfo");
    default:
      return href;
  }
}
