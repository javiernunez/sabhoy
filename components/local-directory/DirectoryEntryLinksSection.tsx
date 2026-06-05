import type { ReactNode } from "react";

type DirectoryEntryLinksSectionProps = {
  isVal: boolean;
  websiteUrl?: string | null;
  href?: string | null;
  phone?: string | null;
  address?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
};

type LinkRow = {
  key: string;
  href: string;
  label: string;
  detail: string;
  icon: ReactNode;
  iconClass: string;
  external?: boolean;
};

function FacebookIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6h1.5V3.8c-.3 0-1.1-.1-2.2-.1-2.2 0-3.8 1.3-3.8 3.8V10H8v3h2.7v8h2.8z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3zm0 1.8a2.7 2.7 0 0 0-2.7 2.7v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7h-9zm9.45 1.35a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 1.8A2.2 2.2 0 1 0 12 14.2 2.2 2.2 0 0 0 12 9.8z" />
    </svg>
  );
}

function WebIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7.9 9h-3.1a15.3 15.3 0 0 0-1.4-5 8.1 8.1 0 0 1 4.5 5zM12 4.2c.9 1.2 2.1 3.4 2.7 6.8H9.3c.6-3.4 1.8-5.6 2.7-6.8zM8.6 6a15.3 15.3 0 0 0-1.4 5H4.1a8.1 8.1 0 0 1 4.5-5zM4.1 13h3.1a15.3 15.3 0 0 0 1.4 5 8.1 8.1 0 0 1-4.5-5zm7.9 6.8c-.9-1.2-2.1-3.4-2.7-6.8h5.4c-.6 3.4-1.8 5.6-2.7 6.8zm3.4-1.8a15.3 15.3 0 0 0 1.4-5h3.1a8.1 8.1 0 0 1-4.5 5z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.3 7 13 7 13s7-7.7 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M6.6 10.8a15.8 15.8 0 0 0 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1.2.4 2.4.6 3.7.6.7 0 1.2.5 1.2 1.2V21c0 .7-.5 1.2-1.2 1.2C10.8 22.2 1.8 13.2 1.8 2.7 1.8 2 2.3 1.5 3 1.5h4.5c.7 0 1.2.5 1.2 1.2 0 1.3.2 2.5.6 3.7.1.4 0 .9-.3 1.2l-2.4 2.2z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function isGoogleMapsUrl(url: string) {
  return /google\.[\w.]+\/maps|maps\.google|goo\.gl\/maps/i.test(url);
}

function formatUrlForDisplay(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const path = parsed.pathname.replace(/\/$/, "");
    if (path && path !== "/") return `${host}${path}`;
    return host;
  } catch {
    return url;
  }
}

function buildLinkRows(props: DirectoryEntryLinksSectionProps): LinkRow[] {
  const { isVal, websiteUrl, href, phone, address, facebookUrl, instagramUrl, tiktokUrl } = props;
  const rows: LinkRow[] = [];

  const websiteTrim = websiteUrl?.trim() ?? "";
  const hrefTrim = href?.trim() ?? "";
  const addressTrim = address?.trim() ?? "";
  const mapsFromAddress = addressTrim
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressTrim)}`
    : null;
  const hrefIsMaps = hrefTrim ? isGoogleMapsUrl(hrefTrim) : false;
  const secondaryHref = hrefTrim && hrefTrim !== websiteTrim ? hrefTrim : null;

  if (websiteTrim) {
    rows.push({
      key: "website",
      href: websiteTrim,
      label: "Web oficial",
      detail: formatUrlForDisplay(websiteTrim),
      icon: <WebIcon />,
      iconClass: "text-emerald-600",
      external: true,
    });
  }

  if (phone?.trim()) {
    const phoneTrim = phone.trim();
    rows.push({
      key: "phone",
      href: `tel:${phoneTrim.replaceAll(/\s+/g, "")}`,
      label: isVal ? "Telèfon" : "Teléfono",
      detail: phoneTrim,
      icon: <PhoneIcon />,
      iconClass: "text-emerald-600",
    });
  }

  if (addressTrim && mapsFromAddress) {
    rows.push({
      key: "address",
      href: mapsFromAddress,
      label: isVal ? "Adreça" : "Dirección",
      detail: addressTrim,
      icon: <LocationIcon />,
      iconClass: "text-[#EA4335]",
      external: true,
    });
  } else if (secondaryHref && hrefIsMaps) {
    rows.push({
      key: "maps",
      href: secondaryHref,
      label: "Google Maps",
      detail: formatUrlForDisplay(secondaryHref),
      icon: <LocationIcon />,
      iconClass: "text-[#EA4335]",
      external: true,
    });
  }

  if (secondaryHref && !hrefIsMaps) {
    rows.push({
      key: "secondary-web",
      href: secondaryHref,
      label: websiteTrim ? (isVal ? "Altre web" : "Otro sitio web") : isVal ? "Web" : "Web",
      detail: formatUrlForDisplay(secondaryHref),
      icon: <WebIcon />,
      iconClass: "text-sky-600",
      external: true,
    });
  } else if (!websiteTrim && hrefTrim && !hrefIsMaps && !addressTrim) {
    rows.push({
      key: "href",
      href: hrefTrim,
      label: isVal ? "Enllaç extern" : "Enlace externo",
      detail: formatUrlForDisplay(hrefTrim),
      icon: <WebIcon />,
      iconClass: "text-sky-600",
      external: true,
    });
  }

  if (instagramUrl?.trim()) {
    const url = instagramUrl.trim();
    rows.push({
      key: "instagram",
      href: url,
      label: "Instagram",
      detail: formatUrlForDisplay(url),
      icon: <InstagramIcon />,
      iconClass: "text-[#E4405F]",
      external: true,
    });
  }

  if (facebookUrl?.trim()) {
    const url = facebookUrl.trim();
    rows.push({
      key: "facebook",
      href: url,
      label: "Facebook",
      detail: formatUrlForDisplay(url),
      icon: <FacebookIcon />,
      iconClass: "text-[#1877f2]",
      external: true,
    });
  }

  if (tiktokUrl?.trim()) {
    const url = tiktokUrl.trim();
    rows.push({
      key: "tiktok",
      href: url,
      label: "TikTok",
      detail: formatUrlForDisplay(url),
      icon: <TikTokIcon />,
      iconClass: "text-[#010101]",
      external: true,
    });
  }

  return rows;
}

export function DirectoryEntryLinksSection(props: DirectoryEntryLinksSectionProps) {
  const rows = buildLinkRows(props);
  if (rows.length === 0) return null;

  return (
    <section className="mt-8 border-t border-slate-200 pt-6" aria-labelledby="entry-enlaces-heading">
      <h2 id="entry-enlaces-heading" className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {props.isVal ? "Enllaços" : "Enlaces"}
      </h2>
      <ul className="mt-4 divide-y divide-slate-100">
        {rows.map((row) => (
          <li key={row.key}>
            <a
              href={row.href}
              {...(row.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="group flex items-start gap-3 py-3 text-slate-900 first:pt-0"
            >
              <span className={`mt-0.5 shrink-0 ${row.iconClass}`} aria-hidden>
                {row.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-emerald-800 underline-offset-2 group-hover:underline">
                  {row.label}
                </span>
                <span className="mt-0.5 block break-words text-xs text-slate-500">{row.detail}</span>
              </span>
              {row.external ? (
                <span className="mt-0.5 shrink-0 text-slate-400" aria-hidden>
                  →
                </span>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
