"use client";

import { memo, useEffect, useRef } from "react";
import { bindTrailLayer } from "@/lib/trailPool";

const SVG_NS = "http://www.w3.org/2000/svg";

/** Full-viewport trail canvas shared by the guide + cursor comets.
 *  Heads live in #guide / #fx; only segments land here. */
function TrailLayer() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("class", "trail-layer");
    svg.appendChild(g);
    bindTrailLayer(g);
    return () => {
      bindTrailLayer(null);
      g.remove();
    };
  }, []);

  return (
    <svg id="trails" ref={svgRef} aria-hidden="true" xmlns={SVG_NS} />
  );
}

export default memo(TrailLayer);
