"use client";

import { memo, useEffect, useRef } from "react";

const SVG_NS = "http://www.w3.org/2000/svg";
const COOL_TINTS = ["#eef4ff", "#eef4ff", "#dfe9ff", "#cfe0ff", "#ffe9cf"];
const LAYER_DEPTH = [0.25, 0.55, 1];
/** Stars per 10k px² — original rich field. */
const LAYER_DENSITY = [2.2, 1.5, 1.0];
/** Soft ceiling only so ultra-wide monitors don't explode the SVG count. */
const LAYER_CAP = [520, 380, 280];
const PARALLAX = 14;
const AMBIENT = 6;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

interface Props {
  reducedMotion: boolean;
  finePointer: boolean;
}

/** Full-viewport procedural starfield: three depth layers that parallax with
 *  the cursor (or drift on their own), plus periodic shooting stars. Purely
 *  decorative, generated on the client so it never causes hydration drift. */
function BackgroundField({ reducedMotion, finePointer }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const layers: SVGGElement[] = LAYER_DEPTH.map(() =>
      document.createElementNS(SVG_NS, "g")
    );
    layers.forEach((g) => {
      g.setAttribute("class", "bg-layer");
      svg.appendChild(g);
    });
    const meteors = document.createElementNS(SVG_NS, "g");
    svg.appendChild(meteors);

    function populate() {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const M = 140;
      layers.forEach((layer, i) => {
        layer.textContent = "";
        const area = ((W + 2 * M) * (H + 2 * M)) / 10000;
        const count = Math.min(
          LAYER_CAP[i],
          Math.round(area * LAYER_DENSITY[i])
        );
        for (let n = 0; n < count; n++) {
          const c = document.createElementNS(SVG_NS, "circle");
          c.setAttribute("class", "star");
          c.setAttribute("cx", rand(-M, W + M).toFixed(1));
          c.setAttribute("cy", rand(-M, H + M).toFixed(1));
          c.setAttribute("r", rand(0.4, 0.8 + i * 0.55).toFixed(2));
          c.setAttribute(
            "fill",
            COOL_TINTS[Math.floor(Math.random() * COOL_TINTS.length)]
          );
          c.style.setProperty("--tw-dur", rand(2.5, 7).toFixed(2) + "s");
          c.style.setProperty("--tw-delay", (-rand(0, 7)).toFixed(2) + "s");
          c.style.setProperty("--base-op", rand(0.28, 0.92).toFixed(2));
          layer.appendChild(c);
        }
      });
    }
    populate();

    let tgtX = 0;
    let tgtY = 0;
    let curX = 0;
    let curY = 0;
    let raf = 0;
    let running = false;
    const lastTx = ["", "", ""];
    const t0 = performance.now();

    const onMouse = (e: MouseEvent) => {
      tgtX = (e.clientX / window.innerWidth - 0.5) * -2 * PARALLAX;
      tgtY = (e.clientY / window.innerHeight - 0.5) * -2 * PARALLAX;
    };
    if (finePointer && !reducedMotion) {
      window.addEventListener("mousemove", onMouse, { passive: true });
    }

    function frame(now: number) {
      if (!running) return;
      const t = (now - t0) / 1000;
      curX += (tgtX - curX) * 0.05;
      curY += (tgtY - curY) * 0.05;
      const ax = Math.sin(t * 0.05) * AMBIENT;
      const ay = Math.cos(t * 0.037) * AMBIENT * 0.7;
      layers.forEach((layer, i) => {
        const d = LAYER_DEPTH[i];
        const next = `translate(${((curX + ax) * d).toFixed(2)} ${((curY + ay) * d).toFixed(2)})`;
        if (next !== lastTx[i]) {
          lastTx[i] = next;
          layer.setAttribute("transform", next);
        }
      });
      raf = requestAnimationFrame(frame);
    }

    function startLoop() {
      if (reducedMotion || running || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function stopLoop() {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    }

    const onVisibility = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };
    document.addEventListener("visibilitychange", onVisibility);
    startLoop();

    let shootTimer: ReturnType<typeof setTimeout> | undefined;
    function shoot() {
      if (!document.hidden) {
        const W = window.innerWidth;
        const H = window.innerHeight;
        const x1 = rand(0, W);
        const y1 = rand(0, H * 0.6);
        const ang = rand(Math.PI * 0.08, Math.PI * 0.42);
        const len = rand(110, 190);
        const x2 = x1 + Math.cos(ang) * len;
        const y2 = y1 + Math.sin(ang) * len;
        const g = document.createElementNS(SVG_NS, "g");
        g.setAttribute("class", "shooting-star");
        const line = document.createElementNS(SVG_NS, "line");
        line.setAttribute("x1", String(x1));
        line.setAttribute("y1", String(y1));
        line.setAttribute("x2", String(x2));
        line.setAttribute("y2", String(y2));
        line.setAttribute("stroke", "#eaf2ff");
        line.setAttribute("stroke-width", "2.2");
        line.setAttribute("stroke-linecap", "round");
        line.setAttribute("stroke-dasharray", `${len} ${len + 60}`);
        line.setAttribute("stroke-dashoffset", String(len));
        g.appendChild(line);
        meteors.appendChild(g);
        const anim = line.animate(
          [
            { strokeDashoffset: len, opacity: 0 },
            { opacity: 1, offset: 0.25 },
            { strokeDashoffset: -60, opacity: 0 },
          ],
          { duration: 850, easing: "ease-out" }
        );
        anim.onfinish = () => g.remove();
      }
      shootTimer = setTimeout(shoot, rand(14000, 30000));
    }
    if (!reducedMotion) shootTimer = setTimeout(shoot, rand(4000, 9000));

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(populate, 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      stopLoop();
      clearTimeout(shootTimer);
      clearTimeout(resizeTimer);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      svg.replaceChildren();
    };
  }, [reducedMotion, finePointer]);

  return <svg id="bg-sky" ref={svgRef} aria-hidden="true" xmlns={SVG_NS} />;
}

export default memo(BackgroundField);
