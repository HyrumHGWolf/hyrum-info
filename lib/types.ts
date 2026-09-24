export type Section = "motivations" | "iic" | "background";

export interface StarContent {
  /** Unique key; also used as the panel/anchor id. */
  id: string;
  /** Which figure node (from lib/figure.ts) this story lives on. */
  node: string;
  /** Legend category this story is grouped and filtered under. */
  section: Section;
  /** Headline + hover label. */
  name: string;
  /** Small role/category line under the title. */
  subtitle: string;
  /** Optional role/date/reference line. */
  meta?: string;
  /** Panel prose. Usually loaded lazily from lib/storyBodies.ts so the
   *  first JS chunk stays small — may be empty until the panel opens. */
  body?: string;
  /** Optional portrait shown between the header and the body.
   *  `objectPosition` (CSS, e.g. "center top") pins which part of a tall
   *  photo stays in the crop so a head isn't cut off. */
  image?: {
    src: string;
    alt: string;
    caption?: string;
    objectPosition?: string;
    /** Keep the original color; skip the default grayscale + star-blue wash. */
    color?: boolean;
    /** Show the whole image at its own shape instead of the 3:2 crop. */
    uncropped?: boolean;
  };
  /** Optional outbound link. */
  link?: { text: string; url: string } | null;
  /** Other star ids whose connecting line should glow on hover. */
  connectsTo?: string[];
  /** Draw this story star slightly larger than the others. */
  larger?: boolean;
}

export interface SocialLink {
  platform: "x" | "linkedin" | "youtube" | "instagram" | "email";
  url: string;
}
