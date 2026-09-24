// ============================================================================
// content.ts — all editable content for the constellation.
//
// HOW TO EDIT
//   • Change any text below freely.
//   • `node` ties a story to a star in lib/figure.ts (e.g. "n31"). To move a
//     story onto a different star, change `node`. To make `connectsTo` glow,
//     the two stars must share an edge in figure.ts (checked at load; a dev
//     console warning fires if they don't).
//   • `section` sets which legend category the story is grouped and
//     filtered under. All story stars render in the same blue.
//   • Story panel prose lives in lib/storyBodies.ts (lazy-loaded). Metadata
//     (name, image, links) stays here.
//   • `image` is optional: a portrait between the header and the body.
//   • Array order = keyboard tab order.
//   • Footer is SOCIAL_LINKS + BIRTH_ISO at the bottom.
// ============================================================================

import type { StarContent, SocialLink } from "./types";

export const STARS: StarContent[] = [
  // ---- MOTIVATIONS — the flag & banner ---------------------------------------
  {
    id: "title",
    node: "n0",
    section: "motivations",
    name: "The Common Task",
    subtitle: "Core Guiding Principle",
    meta: "Cosmism",
    // body loaded from lib/storyBodies.ts

    image: {
      src: "/images/nikolai-fyodorov.jpg",
      alt: "Black and white portrait of Nikolai Fyodorov",
      caption: "Nikolai Fyodorov",
    },
    link: null,
    connectsTo: ["cosmism"],
  },
  {
    id: "cosmism",
    node: "n54",
    section: "motivations",
    name: "Cosmism",
    subtitle: "Cosmist",
    meta: "2025–Present",
    // body loaded from lib/storyBodies.ts

    image: {
      src: "/images/cosmism.jpg",
      alt: "Michelangelo's Creation of Adam, Adam reaching toward the hand of God",
      caption: "The Creation of Adam",
    },
    link: null,
    connectsTo: ["title"],
  },
  {
    id: "christianity",
    node: "n46",
    section: "motivations",
    name: "Christianity",
    subtitle: "Believer",
    meta: "2004–Present",
    // body loaded from lib/storyBodies.ts

    image: {
      src: "/images/christianity.jpg",
      alt: "Thorvaldsen's Christus statue",
      caption: "Christus",
    },
    link: null,
    connectsTo: ["church"],
  },
  {
    id: "church",
    node: "n45",
    section: "motivations",
    name: "The Church",
    subtitle: "Member",
    meta: "2004–Present",
    // body loaded from lib/storyBodies.ts

    image: {
      src: "/images/church.jpg",
      alt: "The Salt Lake Temple",
      caption: "Salt Lake Temple",
    },
    link: null,
    connectsTo: ["christianity"],
  },

  // ---- IMMORTALIST INDUSTRIAL COMPLEX — head, hands, body ---------------------
  {
    id: "noah",
    node: "n29",
    section: "iic",
    name: "Noah Cryotechnology",
    subtitle: "Whole-Organism Cryopreservation",
    meta: "Head of Growth · 2025–Present",
    // body loaded from lib/storyBodies.ts

    image: {
      src: "/images/cryopets.jpg",
      alt: "Noah's first lab, with cryogenic storage dewars",
      caption: "Noah's first lab",
    },
    link: { text: "noah.cy", url: "https://noah.cy" },
    connectsTo: ["cryopets"],
  },
  {
    id: "cryopets",
    node: "n24",
    section: "iic",
    name: "Cryopets",
    subtitle: "Cryosleep for Pets",
    meta: "Noah",
    // body loaded from lib/storyBodies.ts

    image: {
      src: "/images/cryopets-hero.jpg",
      alt: "Cryopets illustration of a black cat leaping between sunset and day",
      caption: "Cryopets",
    },
    link: { text: "cryopets.com", url: "https://cryopets.com" },
    connectsTo: ["noah"],
  },
  {
    id: "hydradao",
    node: "n28",
    section: "iic",
    name: "HydraDAO",
    subtitle: "Replacement Research",
    meta: "Growth · 2024–Present",
    // body loaded from lib/storyBodies.ts

    image: {
      src: "/images/hydradao.jpg",
      alt: "A freshwater hydra, the animal known for regeneration",
      caption: "Hydra",
    },
    link: { text: "hydradao.org", url: "https://hydradao.org" },
    connectsTo: ["dowellbio"],
  },
  {
    id: "dowellbio",
    node: "n27",
    section: "iic",
    name: "Dowell Bio",
    subtitle: "HydraDAO-Funded Research",
    meta: "Investor",
    // body loaded from lib/storyBodies.ts

    image: {
      src: "/images/dowellbio.jpg",
      alt: "Anatomical engraving of the spinal cord",
      caption: "Spinal cord",
    },
    link: null,
    connectsTo: ["hydradao"],
  },
  {
    id: "cryodao",
    node: "n37",
    section: "iic",
    name: "CryoDAO",
    subtitle: "Cryopreservation Research",
    meta: "Growth · 2024–Present",
    // body loaded from lib/storyBodies.ts

    image: {
      src: "/images/cryodao.jpg",
      alt: "CryoDAO logo over a network of neurons",
      caption: "CryoDAO",
    },
    link: { text: "cryodao.org", url: "https://cryodao.org" },
    connectsTo: ["cryorat"],
  },
  {
    id: "cryorat",
    node: "n38",
    section: "iic",
    name: "CryoRat",
    subtitle: "CryoDAO Program",
    meta: "Growth · 2024–Present",
    // body loaded from lib/storyBodies.ts

    image: {
      src: "/images/cryorat.jpg",
      alt: "A white rat",
      caption: "CryoRat",
    },
    link: null,
    connectsTo: ["cryodao"],
  },
  {
    id: "mta",
    node: "n40",
    section: "iic",
    name: "Mormon Transhumanist Association",
    subtitle: "Transfigurism",
    meta: "Head of Growth · 2026–Present",
    // body loaded from lib/storyBodies.ts

    image: {
      src: "/images/mta.jpg",
      alt: "Mormon Transhumanist Association illustration of a future city",
      caption: "Mormon Transhumanist Association",
    },
    link: { text: "transfigurism.org", url: "https://www.transfigurism.org" },
    connectsTo: ["wwe"],
  },
  {
    id: "wwe",
    node: "n36",
    section: "iic",
    name: "Worlds Without End",
    subtitle: "Frontier VC",
    meta: "Co-founder",
    // body loaded from lib/storyBodies.ts

    image: {
      src: "/images/wwe.jpg",
      alt: "Colorful planets in deep space",
      caption: "Worlds Without End",
    },
    link: null,
    connectsTo: ["mta"],
  },

  // ---- BACKGROUND — at the feet -----------------------------------------------
  {
    id: "mission",
    node: "n16",
    section: "background",
    name: "Mission, UT",
    subtitle: "Missionary",
    meta: "2022–2024",
    // body loaded from lib/storyBodies.ts

    image: {
      src: "/images/mission.jpg",
      alt: "Historic Salt Lake City",
      caption: "Salt Lake City",
    },
    link: null,
    connectsTo: [],
  },
  {
    id: "byu",
    node: "n19",
    section: "background",
    name: "BYU",
    subtitle: "Mechanical Engineering",
    meta: "Spring 2022",
    // body loaded from lib/storyBodies.ts

    image: {
      src: "/images/byu.jpg",
      alt: "Historic Brigham Young Academy",
      caption: "BYU",
    },
    link: null,
    connectsTo: [],
  },
  {
    id: "freemasonry",
    node: "n15",
    section: "background",
    name: "Freemasonry",
    subtitle: "Fraternity",
    meta: "Master Mason · 2025–Present",
    // body loaded from lib/storyBodies.ts

    image: {
      src: "/images/freemasonry.jpg",
      alt: "The Masonic square and compasses",
      caption: "Square and compasses",
    },
    link: null,
    connectsTo: [],
  },
];

// Appears in the empty sky above the flag only after every story in STARS
// has been opened (any order). Left out of TOUR_ORDER so the guide never
// walks here; counted separately so it cannot unlock itself.
export const SECRET_NODE = { id: "n57", x: 808, y: 22, r: 2.2 };
// Phones: lifted to sit level with the legend's "Background" row.
export const SECRET_NODE_Y_MOBILE = -209;

export const SECRET_STAR: StarContent = {
  id: "moroni",
  node: SECRET_NODE.id,
  section: "motivations",
  name: "Captain Moroni",
  subtitle: "Title of Liberty",
  meta: "Alma 46",
  larger: true,
    // body loaded from lib/storyBodies.ts

  image: {
    src: "/images/moroni.jpg",
    alt: "Captain Moroni kneeling on a grassy hill, helmet in hand, the Title of Liberty blowing behind him",
    caption: "The Title of Liberty",
    uncropped: true,
  },
  link: null,
};

// ---- Guided tour ------------------------------------------------------------
// The story the guide comet tells, in order. It starts on the first id below
// and after that stop is opened it moves to the next, even if the visitor
// already opened that next star on their own. Reorder freely to change the
// story; ids left out are simply never guided to. Every id must match an `id`
// above (a dev console warning fires for any that don't).
export const TOUR_ORDER: string[] = [
  "title",
  "cosmism",
  "christianity",
  "church",
  "byu",
  "mission",
  "freemasonry",
  "wwe",
  "mta",
  "noah",
  "cryopets",
  "cryodao",
  "cryorat",
  "hydradao",
  "dowellbio",
];

// ---- Footer -----------------------------------------------------------------
// Set each url; use "" to hide a row. For email use a mailto: url.
export const SOCIAL_LINKS: SocialLink[] = [
  { platform: "x", url: "https://x.com/hyrumwolf" },
  { platform: "linkedin", url: "https://www.linkedin.com/in/hyrum-wolf-313512280/" },
  // { platform: "youtube", url: "" }, // add a YouTube URL to show the icon
  { platform: "instagram", url: "https://www.instagram.com/hyrum_wolf" },
  { platform: "email", url: "hyrum@cryopets.com" },
];

// The moment the "days into eternity" counter starts ticking. Anchored to
// US Mountain Time so the count doesn't shift with the viewer's timezone.
export const BIRTH_ISO = "2004-04-21T00:00:00-06:00";
