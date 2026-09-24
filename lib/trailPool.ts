/** Shared SVG trail segment pool for the guide + cursor comets.
 *  One layer, recycled <line>s — no per-frame create/remove. */

const SVG_NS = "http://www.w3.org/2000/svg";
const POOL_SIZE = 48;

let layer: SVGGElement | null = null;
const pool: SVGLineElement[] = [];
let cursor = 0;

export type TrailEmit = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width?: number;
  color?: string;
  fadeMs?: number;
};

/** Mount (or remount) the trail group. Creates the pool on first bind. */
export function bindTrailLayer(g: SVGGElement | null) {
  layer = g;
  if (!g) return;
  if (pool.length === 0) {
    for (let i = 0; i < POOL_SIZE; i++) {
      const seg = document.createElementNS(SVG_NS, "line");
      seg.setAttribute("class", "trail");
      seg.setAttribute("stroke-linecap", "round");
      seg.setAttribute("opacity", "0");
      seg.style.pointerEvents = "none";
      g.appendChild(seg);
      pool.push(seg);
    }
  } else if (pool[0].parentNode !== g) {
    pool.forEach((seg) => g.appendChild(seg));
  }
}

/** Draw one fading segment. No-op until bindTrailLayer has run. */
export function emitTrail(opts: TrailEmit) {
  if (!layer || pool.length === 0) return;
  const seg = pool[cursor % POOL_SIZE];
  cursor += 1;
  seg.setAttribute("x1", String(opts.x1));
  seg.setAttribute("y1", String(opts.y1));
  seg.setAttribute("x2", String(opts.x2));
  seg.setAttribute("y2", String(opts.y2));
  seg.setAttribute("stroke", opts.color ?? "#bcd8ff");
  seg.setAttribute("stroke-width", String(opts.width ?? 2));
  // Cancel any in-flight fade on this recycled line, then restart.
  seg.getAnimations().forEach((a) => a.cancel());
  seg.setAttribute("opacity", "0.75");
  const anim = seg.animate([{ opacity: 0.75 }, { opacity: 0 }], {
    duration: opts.fadeMs ?? 480,
    easing: "ease-out",
    fill: "forwards",
  });
  anim.onfinish = () => seg.setAttribute("opacity", "0");
}
