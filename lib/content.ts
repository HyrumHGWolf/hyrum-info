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
    body:
      "The Common Task is humanity's shared duty: to overcome death, restore life to all who have died, and bring nature under intelligent and moral dominion so that life may continue without limit.\n\nIts principles are ancient, but they were revived in modern form by Nikolai Fyodorov, the Russian Orthodox philosopher whose ideas helped give rise to Cosmism. At the heart of the Common Task are several convictions: that life, intelligence, and progress everlasting are the highest good; that death should not be accepted as final; that the living bear a responsibility to the dead and the unborn; and that science, religion, and moral duty are not separate callings, but parts of the same labor.\n\nThese principles form the foundation of everything Hyrum does today. The Common Task is his life's mission, not as metaphor or abstraction, but as real work set before him, and ultimately before all humanity.",
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
    body:
      "Hyrum is working to restore Cosmism: bringing its ideas into the present day and developing them into a practical mission for humanity's survival, flourishing, and long-term future.\n\nCosmism is a philosophical tradition centered on radical scientific progress, the expansion of life and intelligence beyond Earth, and the eventual overcoming of death and biological limitation. Its purpose is not simply to imagine a better future, but to organize human effort toward building one.\n\nIt is not a replacement for religion, but a practical extension of it: a call to build Heaven on Earth through moral responsibility, scientific progress, and coordinated human action.\n\nFor Hyrum, Cosmism is humanity's light in the darkness. Without it, humanity's best fate is Hell. Its worst is that there is no Hell, no Heaven, and no one waiting beyond death at all, only the final disappearance of life, memory, and intelligence into entropy.",
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
    body:
      "Hyrum was raised in a Bible-believing Christian home where scripture, prayer, family worship, and service were part of daily life. His faith in Jesus Christ deepened during his two-year mission and continues to shape his view of responsibility, work, and human dignity. Christianity is the moral foundation beneath his interest in science, technology, and the long-term future of mankind.",
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
    body:
      "Hyrum was born into The Church of Jesus Christ of Latter-day Saints, the Kingdom of Heaven on earth today. His faith informs his belief that building, healing, learning, and preserving life are not separate from discipleship, but part of it.",
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
    body:
      "Noah Cryotechnology advances whole-organism cryopreservation, pausing entire living systems to protect life on Earth and carry it toward the stars. Hyrum left Pennsylvania and moved to Texas as the first hire, helping build the first lab, raise millions from Valyrian, Prelude, and Zee Prime Capital, and launch Noah's first public facing product, Cryopets.",
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
    body:
      "CryoPets is Noah's cryosleep service for companion animals, preserving pets after clinical death so that future medicine may one day restore them.\n\nAs Head of Growth at Noah, Hyrum led the launch of CryoPets and helped grow its waitlist to more than 10,000 pets across the United States, making it the largest rollout of a cryosleep service in history.",
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
    body:
      "Hyrum co-built HydraDAO's fundraising and media efforts. HydraDAO is a nonprofit funding frontier science focused on whole-body replacement, cloned and synthetic embryos, progressive brain tissue replacement, organ replacement, bodyoids, and other engineering-heavy approaches to biological repair. The organization has raised over $4M to support high-risk research that traditional institutions are often too slow or conservative to fund.",
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
    body:
      "Dowell Bio is a solely HydraDAO-funded research effort focused on spinal cord transection and refusion. The project has already successfully severed and rejoined spinal cords in animal models, with ongoing work aimed at measuring functional recovery and advancing the technique toward clinical use.\n\nIn 2025, the team performed more than 200 rat surgeries with rehabilitation and video tracking, developed a roadmap toward human trials, and began analyzing microscopy and clinical data for patents and research papers. Early pig trials are now underway, moving the research into larger translational models and already showing promising initial results.",
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
    body:
      "Hyrum joined CryoDAO in late 2024 to manage growth. CryoDAO is a nonprofit organization funding cryopreservation research across organ preservation, whole-body preservation, and revival-relevant biology. It has backed research including sheep ovary vitrification and transplantation, whole non-hibernating mammal high-subzero preservation and revival, and additional projects across the biostasis field. To date, CryoDAO has raised over $5M for cryopreservation research.",
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
    body:
      "CryoRat is CryoDAO's whole-body rat preservation program. The program focuses on high-subzero cryoprotection as a staged path toward eventual whole-body mammalian revival. Hyrum co-launched and helped prepare the fundraiser, which closed at $900K in less than a day. The project includes perfusion optimization, cryoprotectant mapping across organs and brain tissue, viability testing, in-house micro-CT, and staged revival attempts as milestones are reached.",
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
    body:
      "Hyrum serves as Head of Growth at the Mormon Transhumanist Association, a nonprofit dedicated to advancing abundant human flourishing through the compassionate use of science and technology. Founded in 2006, the Association explores the intersection of religion, science, and technological progress, encouraging today's pioneers to pursue new frontiers with the conviction of their faith. Today, it is the largest transhumanist association in the world.",
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
    body:
      "Hyrum co-founded Worlds Without End, a frontier VC fund investing $250K to $500K in pre-seed and seed startups focused on accelerating development in frontier radical life extension, space travel, and artificial intelligence.",
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
    body:
      "Hyrum submitted his papers and left to serve a two-year mission for The Church of Jesus Christ of Latter-day Saints in the late spring of 2022. He was called to the Utah Salt Lake City Mission, where his assigned areas included Holladay, Murray, and Cottonwood Heights. At times, he served across areas covering up to 20 congregations. His mission developed his love for religion, philosophy, church history, apologetics, public speaking, and direct outreach.",
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
    body:
      "After graduating high school early, Hyrum attended a single semester at BYU as a declared Mechanical Engineering major before leaving to serve a two-year mission for his church. During this time, he became disillusioned with the conventional academic path. College, he concluded, is an overpriced scam mostly filled with the blind leading the blind; new serious builders tend not to be there anymore, but instead building, and learning as they build.",
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
    body:
      "Hyrum's interest in esoteric knowledge, moral formation, fraternity, and self-improvement eventually led him to Freemasonry. He received his third degree at the age of 20, becoming a Master Mason. While not central to his professional work, Freemasonry reflects his broader interest in disciplined self-development, inherited tradition, symbolism, and moral architecture.",
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
  body:
    "Captain Moroni is a military leader from the Book of Mormon. During a time of war and division, he tore his coat and wrote upon it:\n\n“In memory of our God, our religion, and freedom, and our peace, our wives, and our children.”\n\nHe fastened the torn cloth to a pole, creating a banner he called the Title of Liberty, and raised it as a symbol of what was worth defending.\n\nFor Hyrum, the Title of Liberty serves as a compass, representing faith, freedom, peace, family, and the future.\n\nThat image inspired this website. The constellation you have now clicked through depicts Captain Moroni holding the Title of Liberty.",
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
