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
    name: "Title of Liberty",
    subtitle: "The Book of Mormon",
    meta: "Alma 46:12",
    body:
      "In the Book of Mormon, another testament of Jesus Christ, Captain Moroni raises the Title of Liberty as a banner in defense of God, religion, freedom, peace, family, and future generations. For Hyrum, this declaration is not only a religious symbol, but a guiding framework for life and work. It represents the conviction that civilization, family, faith, and human flourishing must be actively defended and built. The image of Captain Moroni and his banner inspired the constellation imagery throughout this website.",
    link: null,
    connectsTo: [],
  },
  {
    id: "cosmism",
    node: "n53",
    section: "motivations",
    name: "Cosmism",
    subtitle: "Cosmist",
    meta: "2025–Present",
    body:
      "Hyrum began publicly identifying with Cosmism in early 2025. Cosmism is a philosophical tradition concerned with humanity's long-term flourishing, the expansion of life and intelligence beyond Earth, radical scientific progress, and the eventual overcoming of death and biological limitation. For Hyrum, Cosmism is not a replacement for faith, but a practical extension of it: a call to build the Kingdom of Heaven on earth through organized work, scientific progress, and faith in Jesus Christ.",
    link: null,
    connectsTo: [],
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
      "Hyrum was born into The Church of Jesus Christ of Latter-day Saints and identifies first and foremost as a believer in Jesus Christ. He believes his church to be God's church and the Kingdom of Heaven on earth. He attends church weekly with his family and regularly attends the temple for sacred worship. His faith informs his belief that building, healing, learning, and preserving life are not separate from discipleship, but part of it.",
    link: null,
    connectsTo: ["christianity"],
  },

  // ---- IMMORTALIST INDUSTRIAL COMPLEX — head, hands, body ---------------------
  {
    id: "cryopets",
    node: "n31",
    section: "iic",
    name: "Cryopets",
    subtitle: "Cryopreservation Service Provider",
    meta: "Head of Growth Operations · 2025–Present",
    body:
      "Cryopets is building cryopreservation services for pets, with the goal of ending pet death. After his longtime friend Kai Micah Mills founded the company, Hyrum left Pennsylvania and moved to Texas to help build Cryopets' first official lab and early operating base. He joined, and since joining has helped the company through its first raise, securing its first facility, and fully relocating its founding team. As Head of Growth, Hyrum has worked across growth, media, partnerships, customer acquisition, public messaging, and early operational systems. Cryopets has raised millions of dollars from venture capital firms including Valyrian, Prelude, and Zee Prime Capital. The company represents Hyrum's central operating role in the fight against biological decay, beginning with pets and scaling toward broader whole-body cryopreservation, with the goal of ending human death.",
    link: { text: "cryopets.com", url: "https://cryopets.com" },
    connectsTo: ["persufflation"],
  },
  {
    id: "persufflation",
    node: "n30",
    section: "iic",
    name: "Persufflation",
    subtitle: "Cryopets Research Project",
    meta: "Lab Assistant · 2026–Present",
    body:
      "Persufflation is a research project focused on organ cryopreservation and revival through advanced perfusion-based techniques. Working alongside Cryopets' scientific leadership, Hyrum supports early development of the project as part of his transition from growth and operations into more direct technical contribution. The project reflects his broader aim to help turn biostasis from a speculative field into an engineering discipline with practical milestones.",
    link: null,
    connectsTo: ["cryopets"],
  },
  {
    id: "hydradao",
    node: "n29",
    section: "iic",
    name: "HydraDAO",
    subtitle: "Replacement Research",
    meta: "Growth · 2024–Present",
    body:
      "Hyrum helped build HydraDAO's early fundraising and media efforts. HydraDAO is a nonprofit funding frontier science focused on whole-body replacement, cloned and synthetic embryos, progressive brain tissue replacement, organ replacement, bodyoids, and other engineering-heavy approaches to biological repair. The organization has raised over $4M to support high-risk research that traditional institutions are often too slow or conservative to fund.",
    link: { text: "hydradao.org", url: "https://hydradao.org" },
    connectsTo: ["dowellbio"],
  },
  {
    id: "dowellbio",
    node: "n24",
    section: "iic",
    name: "Dowell Bio",
    subtitle: "HydraDAO-Funded Research",
    meta: "Investor",
    body:
      "Dowell Bio is a HydraDAO-funded research effort focused on spinal cord transection and refusion. HydraDAO is acting as the sole funder for this ongoing scientific research. In 2025, the team conducted over 200 rat surgeries with rehabilitation and video tracking, developed a roadmap toward human trials, and began analyzing microscopy and clinical data for patents and research papers. Early pig trials have also begun, expanding the project from small-animal work toward larger translational models.",
    link: null,
    connectsTo: ["hydradao"],
  },
  {
    id: "cryodao",
    node: "n34",
    section: "iic",
    name: "CryoDAO",
    subtitle: "Cryopreservation Research",
    meta: "Growth · 2024–Present",
    body:
      "Hyrum joined CryoDAO in late 2024. CryoDAO is a nonprofit organization funding cryopreservation research across organ preservation, whole-body preservation, and revival-relevant biology. It has backed research including sheep ovary vitrification and transplantation, whole non-hibernating mammal high-subzero preservation and revival, and additional projects across the biostasis field. To date, CryoDAO has raised over $5M for cryopreservation research.",
    link: { text: "cryodao.org", url: "https://cryodao.org" },
    connectsTo: ["cryorat"],
  },
  {
    id: "cryorat",
    node: "n35",
    section: "iic",
    name: "CryoRat",
    subtitle: "CryoDAO Program",
    meta: "Growth · 2024–Present",
    body:
      "CryoRat is CryoDAO's whole-body rat preservation program with Advanced Neural Biosciences and Aschwin de Wolf. The program focuses on high-subzero cryoprotection as a staged path toward eventual whole-body mammalian revival. Hyrum co-launched and helped prepare the fundraiser, which closed at $900K in less than a day, with the first $500K raised in under an hour. The project includes perfusion optimization, cryoprotectant mapping across organs and brain tissue, viability testing, in-house micro-CT, and staged revival attempts as milestones are reached.",
    link: null,
    connectsTo: ["cryodao"],
  },
  {
    id: "abf",
    node: "n37",
    section: "iic",
    name: "ABF",
    subtitle: "Biostasis Facility",
    meta: "Growth · 2025–Present",
    body:
      "ABF is a nonprofit building a flagship biostasis research lab and long-term patient care facility. The facility brings together Cryopets, Tomorrow Bio, the Space Biostasis Coalition, CryoDAO, and HydraDAO to support research, storage, and long-term care for patients from multiple providers. Hyrum helped begin fundraising efforts for the project in 2025. ABF represents the infrastructure layer of the biostasis ecosystem: the physical foundation needed to support serious long-term work in cryopreservation.",
    link: { text: "americanbiostasis.org", url: "https://americanbiostasis.org" },
    connectsTo: [],
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
      "Hyrum submitted his papers and left to serve a two-year mission for The Church of Jesus Christ of Latter-day Saints in the late spring of 2022. He was called to the Utah Salt Lake City Mission, where his assigned areas included Holladay, Murray, and Cottonwood Heights. At times, he served across areas covering up to 20 congregations. His mission developed his love for church history, apologetics, public speaking, discipline, and direct outreach. During this period, he also met Kai Micah Mills, who later became his friend, colleague, and founder of Cryopets.",
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
      "After graduating high school early, Hyrum attended a single semester at one of the BYU campuses as a declared Mechanical Engineering major before leaving to serve a two-year mission for his church. During this time, he became disillusioned with the conventional academic path, but gained a lasting love for the arts and humanities from a professor he admired. Though he did not continue formal university study, this period helped shape his interest in first principles, civilization, history, and the human condition.",
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
      "Hyrum's interest in esoteric knowledge, moral formation, fraternity, and self-improvement eventually led him to Freemasonry. He received his Third Degree in early 2025, becoming a Master Mason. While not central to his professional work, Freemasonry reflects his broader interest in disciplined self-development, inherited tradition, symbolism, and moral architecture.",
    link: null,
    connectsTo: [],
  },
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
