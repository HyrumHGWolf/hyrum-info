"use client";

import { useEffect, useRef } from "react";

const SVG_NS = "http://www.w3.org/2000/svg";

interface Props {
  finePointer: boolean;
  reducedMotion: boolean;
  /** Held back until the guide comet has walked the whole tour and merged into
   *  the cursor — two comets at once is one too many. */
  enabled: boolean;
}

/** A soft cursor head with a tail that trails the motion. Fine pointers only;
 *  disabled under reduced motion. Pure overlay — never intercepts clicks. */
export default function CometTrail({
  finePointer,
  reducedMotion,
  enabled,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!enabled || !finePointer || reducedMotion) return;
    const svg = svgRef.current;
    if (!svg) return;

    // All comet DOM lives in one group we own, so cleanup can remove it
    // without disturbing the React-rendered <defs>.
    const layer = document.createElementNS(SVG_NS, "g");
    svg.appendChild(layer);

    const head = document.createElementNS(SVG_NS, "circle");
    head.setAttribute("class", "comet-head");
    head.setAttribute("r", "5");
    head.setAttribute("fill", "url(#dust)");
    head.setAttribute("opacity", "0");
    layer.appendChild(head);

    let lx: number | null = null;
    let ly: number | null = null;
    let idleHide: ReturnType<typeof setTimeout>;

    const onMove = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      head.setAttribute("cx", String(x));
      head.setAttribute("cy", String(y));
      head.setAttribute("opacity", "0.85");
      clearTimeout(idleHide);
      idleHide = setTimeout(() => head.setAttribute("opacity", "0"), 260);
      if (lx !== null && ly !== null) {
        const dist = Math.hypot(x - lx, y - ly);
        if (dist > 1.2) {
          const seg = document.createElementNS(SVG_NS, "line");
          seg.setAttribute("class", "trail");
          seg.setAttribute("x1", String(lx));
          seg.setAttribute("y1", String(ly));
          seg.setAttribute("x2", String(x));
          seg.setAttribute("y2", String(y));
          seg.setAttribute("stroke", "#bcd8ff");
          seg.setAttribute(
            "stroke-width",
            Math.min(3, 1.2 + dist * 0.05).toFixed(2)
          );
          seg.setAttribute("stroke-linecap", "round");
          layer.appendChild(seg);
          const anim = seg.animate([{ opacity: 0.7 }, { opacity: 0 }], {
            duration: 430,
            easing: "ease-out",
          });
          anim.onfinish = () => seg.remove();
        }
      }
      lx = x;
      ly = y;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      clearTimeout(idleHide);
      window.removeEventListener("pointermove", onMove);
      layer.remove();
    };
  }, [enabled, finePointer, reducedMotion]);

  return (
    <svg id="fx" ref={svgRef} aria-hidden="true" xmlns={SVG_NS}>
      <defs>
        <radialGradient id="dust">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#bcd6ff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7fb0ff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
