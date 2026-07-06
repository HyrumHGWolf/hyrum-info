# Hyrum HG Wolf — Cosmist & Christian

A single-page personal site: an interactive constellation of **Captain Moroni
planting the Title of Liberty**. Each bright star opens a piece of Hyrum's life.

Built with **Next.js (App Router) + React + TypeScript**. The figure is not
hand-drawn — it is generated directly from the designer's reference art so the
shape of Moroni is exact.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Where things live

| Path | What |
|------|------|
| `app/` | Next.js shell — `layout.tsx` (fonts, metadata, favicon), `page.tsx`, `globals.css` |
| `components/Sky.tsx` | Orchestrator: owns the open panel, focus restore, reduced-motion class |
| `components/Constellation.tsx` | The figure — renders nodes + edges from `lib/figure.ts`, hover labels, connection glow |
| `components/BackgroundField.tsx` | Procedural parallax starfield + shooting stars |
| `components/Panel.tsx` | Detail dialog (side panel / bottom sheet) with a real focus trap |
| `components/Footer.tsx` | Social icons + "days into eternity" counter |
| `components/CometTrail.tsx` | Cursor comet (fine pointers only) |
| `lib/content.ts` | **All editable content** — the stories, social links, birth date |
| `lib/figure.ts` | **Generated** geometry (line-art path + star nodes). Do not hand-edit |
| `lib/types.ts` | Shared content types |
| `reference/` | Source art + the generator + the old reference images |
| `legacy/` | The original static HTML/CSS/JS site this replaced |

## Editing content

Open [`lib/content.ts`](lib/content.ts). Each story is one entry:

```ts
{
  id: "cryopets",
  node: "n31",              // which star it sits on (see lib/figure.ts)
  section: "iic",           // legend category: motivations | iic | background
  name: "Cryopets",
  subtitle: "Cryopreservation Service Provider",
  meta: "Head of Growth · 2025–Present",
  body: "…",
  link: { text: "cryopets.com", url: "https://cryopets.com" }, // or null
  connectsTo: ["persufflation"], // glows the line between the two stars — they
                                // must share an edge in figure.ts (a dev
                                // console warning fires if they don't)
}
```

- Move a story to a different star → change `node`.
- Array order = keyboard tab order.
- `SOCIAL_LINKS` and `BIRTH_ISO` are at the bottom of the file.

## Regenerating the figure

The star positions and connecting lines come from two exported SVGs in
`reference/`. To rebuild `lib/figure.ts` from them:

```bash
npm run gen:figure
```

`ellipse-270.svg` provides the star positions; `vector-87.svg` provides the
lines. See `reference/build-figure.mjs` and `reference/README.md` for details.
