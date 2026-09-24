import { SOCIAL_LINKS } from "./content";

export const SITE_URL = "https://hyrum.info";

/** Canonical public name on the site. */
export const PRIMARY_NAME = "Hyrum HG Wolf";

/**
 * Name variants people actually search — wired into metadata + Person JSON-LD
 * so look-ups for any of these resolve to this site.
 */
export const NAME_ALIASES = [
  "Hyrum",
  "Hyrum Wolf",
  "Hyrum Graver",
  "Hyrum H.G. Wolf",
  "Hyrum Graver Wolf",
] as const;

export const SITE_TITLE =
  "Hyrum Wolf | Hyrum Graver | Hyrum HG Wolf — Cosmist & Christian";

export const SITE_DESCRIPTION =
  "Official site of Hyrum Wolf (also known as Hyrum Graver and Hyrum HG Wolf) — Cosmist & Christian. Personal constellation covering cosmism, cryopreservation, Noah Cryotechnology, Cryopets, and frontier science.";

export const SITE_KEYWORDS = [
  "Hyrum",
  "Hyrum Wolf",
  "Hyrum Graver",
  "Hyrum HG Wolf",
  "Hyrum H.G. Wolf",
  "Hyrum Graver Wolf",
  "Cosmist",
  "Christian",
  "Cryopets",
  "Noah Cryotechnology",
  "Cosmism",
];

function sameAsUrls(): string[] {
  return SOCIAL_LINKS.map((l) =>
    l.platform === "email" ? `mailto:${l.url.replace(/^mailto:/, "")}` : l.url
  ).filter(Boolean);
}

/** Person + WebSite JSON-LD for Google / Bing entity matching. */
export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: PRIMARY_NAME,
        alternateName: [...NAME_ALIASES],
        description: SITE_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#person` },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: PRIMARY_NAME,
        alternateName: [...NAME_ALIASES],
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        jobTitle: "Cosmist & Christian",
        email: "hyrum@cryopets.com",
        sameAs: sameAsUrls(),
        knowsAbout: [
          "Cosmism",
          "Cryopreservation",
          "Life extension",
          "Christianity",
          "Frontier science",
        ],
      },
    ],
  };
}
