"use client";

import { memo, useEffect, useRef } from "react";
import { emitTrail } from "@/lib/trailPool";

const SVG_NS = "http://www.w3.org/2000/svg";

interface Props {
  finePointer: boolean;
  reducedMotion: boolean;
  /** Held back until the guide comet has walked the whole tour and merged into
   *  the cursor — two comets at once is one too many. */
  enabled: boolean;
}

/** Cursor comet head. Trail segments go through the shared TrailLayer pool. */
function CometTrail({ finePointer, reducedMotion, enabled }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!enabled || !finePointer || reducedMotion) return;
    const svg = svgRef.current;
    if (!svg) return;

    const layer = document.createElementNS(SVG_NS, "g");
    svg.appendChild(layer);

    const head = document.createElementNS(SVG_NS, "circle");
    head.setAttribute("class", "comet-head");
    head.setAttribute("cx", "0");
    head.setAttribute("cy", "0");
    head.setAttribute("r", "5");
    head.setAttribute("fill", "url(#dust)");
    head.setAttribute("opacity", "0");
    layer.appendChild(head);

    let lx: number | null = null;
    let ly: number | null = null;
    let idleHide: ReturnType<typeof setTimeout>;
    let pending: { x: number; y: number } | null = null;
    let raf = 0;

    function paint() {
      raf = 0;
      if (document.hidden || !pending) return;
      const { x, y } = pending;
      pending = null;
      head.setAttribute("transform", `translate(${x} ${y})`);
      head.setAttribute("opacity", "0.85");
      clearTimeout(idleHide);
      idleHide = setTimeout(() => head.setAttribute("opacity", "0"), 260);
      if (lx !== null && ly !== null) {
        const dist = Math.hypot(x - lx, y - ly);
        if (dist > 1.2) {
          emitTrail({
            x1: lx,
            y1: ly,
            x2: x,
            y2: y,
            width: Math.min(3, 1.2 + dist * 0.05),
            fadeMs: 430,
          });
        }
      }
      lx = x;
      ly = y;
    }

    const onMove = (e: PointerEvent) => {
      if (document.hidden) return;
      pending = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(paint);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      clearTimeout(idleHide);
      cancelAnimationFrame(raf);
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

export default memo(CometTrail);
