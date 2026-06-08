import Script from "next/script";

const GA_ID = "G-1MDPM1F6WC";

/** Google Analytics: carga diferida para no competir con LCP ni el main thread. */
export function AnalyticsScripts() {
  return (
    <>
      <Script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
