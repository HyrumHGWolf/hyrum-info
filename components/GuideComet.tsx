"use client";

import { memo, useEffect, useRef } from "react";
import { SECRET_NODE, SECRET_NODE_Y_MOBILE, STARS, TOUR_ORDER } from "@/lib/content";
import { emitTrail } from "@/lib/trailPool";

const SVG_NS = "http://www.w3.org/2000/svg";

/** Beat before the guide appears — just enough for the sky to paint. */
const START_DELAY_MS = 400;
/** One shot from wherever the comet is to the next star on the route. */
const TRAVEL_MS = 1200;
/** One lap around a story star. Repeats until that story is opened. Kept brisk
 *  so the comet doesn't appear to stall as it decelerates out of a flight and
 *  into the circling. */
const STAR_LAP_MS = 2600;
/** Summon lap around the future Moroni star. Half of the unlock bloom
 *  (MORONI_UNLOCK_MS / 4.2s in Sky + globals.css) so the guide leaves for the
 *  cursor at mid-animation. */
const SUMMON_ORBIT_MS = 2100;
/** Phone: beat after the story card closes before the guide flies on. */
const CLOSE_DELAY_MS = 500;
/** Orbit radius around a star, in screen pixels — close enough to read as
 *  circling it, clear of the sparkle's points. */
const ORBIT_R = 22;
/** The closing run into the cursor, then the burst as the two become one. */
const MERGE_MS = 900;
const FLASH_MS = 460;

const HEAD_R = 5.5;
/** Don't emit a trail segment for sub-pixel moves. */
const TRAIL_MIN_STEP = 1.2;
/** Phone orbits move well under 1.2px a frame, so the same cutoff throws
 *  the tail away. Lower only here — desktop stays at TRAIL_MIN_STEP. */
const TRAIL_MIN_STEP_PHONE = 0.25;
const TRAIL_FADE_MS = 520;

const TAU = Math.PI * 2;

type Phase =
  | "wait"
  | "travel"
  | "orbit"
  | "summon-travel"
  | "summon-orbit"
  | "merge"
  | "flash"
  | "done";

interface Props {
  /** The story currently open, or null. Opening the stop the guide is on
   *  advances it; opening a later tour stop makes the guide catch up and fly
   *  straight there so a fast scroll does not leave it behind. */
  activeId: string | null;
  /** True once every story star has been opened — the cue to fly to the
   *  empty sky, loop once, and summon Captain Moroni. */
  unlocked: boolean;
  reducedMotion: boolean;
  finePointer: boolean;
  /** While a story is open the guide holds its orbit rather than making its
   *  closing run, so the hand-off isn't hidden behind the panel. */
  panelOpen: boolean;
  /** On phones the story panel covers the sky, so the guide keeps circling
   *  the current star until the panel is dismissed, then waits a short beat
   *  before flying to the next stop. */
  holdUntilPanelClose: boolean;
  /** Fired once as the guide begins its summoning lap around the empty sky
   *  where Captain Moroni will appear — the cue to bloom the star in. */
  onSummon: () => void;
  /** Fired once, as the guide merges into the cursor — this is what hands the
   *  comet trail over to the visitor's own pointer. */
  onFinish: () => void;
}

/** A second comet that leads the visitor through the stars: it appears already
 *  orbiting the first story on TOUR_ORDER, then shoots to the next stop on
 *  that path each time the current stop is opened. Opening a later stop
 *  (scroll or click) catches the guide up so it flies straight there instead
 *  of lagging one step at a time. After the last stop it flies to where
 *  Captain Moroni will appear, and as it loops the unlocked mark blooms in;
 *  halfway through that bloom the guide peels off toward the cursor and hands
 *  the trail to CometTrail.
 *
 *  Every flight is a cubic Hermite curve whose end tangents are the actual
 *  velocities of the motion either side of it, played at linear time. That is
 *  what keeps the comet from stalling at each junction: it leaves a loop still
 *  travelling at the loop's speed and direction, and arrives at the next one
 *  already matching it, so the whole tour reads as one continuous flight.
 *
 *  Pure overlay — never intercepts clicks, and sits out under reduced motion. */
function GuideComet({
  activeId,
  unlocked,
  reducedMotion,
  finePointer,
  panelOpen,
  holdUntilPanelClose,
  onSummon,
  onFinish,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  // The rAF loop reads all of these through refs so opening a story never
  // tears down the effect and restarts the flight mid-air.
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;
  const unlockedRef = useRef(unlocked);
  unlockedRef.current = unlocked;
  const finePointerRef = useRef(finePointer);
  finePointerRef.current = finePointer;
  const panelOpenRef = useRef(panelOpen);
  panelOpenRef.current = panelOpen;
  const holdUntilPanelCloseRef = useRef(holdUntilPanelClose);
  holdUntilPanelCloseRef.current = holdUntilPanelClose;
  const onSummonRef = useRef(onSummon);
  onSummonRef.current = onSummon;
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    if (reducedMotion) return;
    const svg = svgRef.current;
    if (!svg) return;

    // All guide DOM lives in one group we own, so cleanup can remove it
    // without disturbing the React-rendered <defs>.
    const layer = document.createElementNS(SVG_NS, "g");
    svg.appendChild(layer);

    const isPhone = window.matchMedia("(max-width: 640px)").matches;
    const trailMinStep = isPhone ? TRAIL_MIN_STEP_PHONE : TRAIL_MIN_STEP;

    const head = document.createElementNS(SVG_NS, "circle");
    head.setAttribute("class", "guide-head");
    head.setAttribute("cx", "0");
    head.setAttribute("cy", "0");
    head.setAttribute("r", String(HEAD_R));
    head.setAttribute("fill", "url(#guide-dust)");
    head.setAttribute("opacity", "0");
    layer.appendChild(head);

    // Separate from the head so the burst can be driven frame-by-frame without
    // fighting the head's CSS opacity transition.
    const flash = document.createElementNS(SVG_NS, "circle");
    flash.setAttribute("class", "guide-flash");
    flash.setAttribute("cx", "0");
    flash.setAttribute("cy", "0");
    flash.setAttribute("r", String(HEAD_R));
    flash.setAttribute("fill", "url(#guide-dust)");
    flash.setAttribute("opacity", "0");
    layer.appendChild(flash);

    // Where the visitor's cursor is, so the guide knows what to merge into.
    const pointer = { x: 0, y: 0, seen: false };
    const onPointer = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.seen = true;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const nodeFor = new Map(STARS.map((s) => [s.id, s.node]));
    // An id with no story would stall the route, so drop unknowns up front.
    const route = TOUR_ORDER.filter((id) => {
      if (nodeFor.has(id)) return true;
      if (process.env.NODE_ENV !== "production") {
        console.warn(`content: TOUR_ORDER id "${id}" is not a story in STARS`);
      }
      return false;
    });

    /** Screen centers of story stars. Cached until resize — the figure does
     *  not move relative to the viewport (no page scroll), so remeasuring
     *  every frame was pure layout thrash. */
    const coreEls = new Map<string, Element>();
    const centerCache = new Map<string, { x: number; y: number }>();
    let secretCached: { x: number; y: number } | null = null;
    let secretOk = false;

    function invalidateCenters() {
      centerCache.clear();
      secretCached = null;
      secretOk = false;
    }

    const onResize = () => invalidateCenters();
    window.addEventListener("resize", onResize);

    function starCenter(storyId: string) {
      const hit = centerCache.get(storyId);
      if (hit) return hit;
      const node = nodeFor.get(storyId);
      if (!node) return null;
      let el: Element | null | undefined = coreEls.get(node);
      if (!el || !el.isConnected) {
        el = document.querySelector(`#sky .star[data-id="${node}"] .core`);
        if (!el) return null;
        coreEls.set(node, el);
      }
      const r = el.getBoundingClientRect();
      const c = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      centerCache.set(storyId, c);
      return c;
    }

    // Strict story index — never skip a stop just because it was already read.
    let routeIndex = 0;
    const stopAt = (i: number) => route[i] ?? null;
    /** True once the visitor has opened the stop the guide is currently on.
     *  Stays true after they close the panel so the last stop can still merge. */
    let stopOpened = false;

    type Vec = [number, number];

    /** Where the comet sits on a star's orbit `ms` into the loop — a clean
     *  circle, starting from the angle the comet arrived at, swept in the
     *  direction that continues the inbound flight (`orbitSign`). */
    function orbitPoint(
      cx: number,
      cy: number,
      ms: number,
      lapMs: number = STAR_LAP_MS
    ): Vec {
      const a = entryAngle + orbitSign * (ms / lapMs) * TAU;
      return [cx + Math.cos(a) * ORBIT_R, cy + Math.sin(a) * ORBIT_R];
    }

    /** How fast and which way the comet is moving at `ms` on the circle. */
    function orbitVel(
      _cx: number,
      _cy: number,
      ms: number,
      lapMs: number = STAR_LAP_MS
    ): Vec {
      const a = entryAngle + orbitSign * (ms / lapMs) * TAU;
      const w = orbitSign * (TAU / lapMs);
      return [-ORBIT_R * Math.sin(a) * w, ORBIT_R * Math.cos(a) * w];
    }

    let phase: Phase = "wait";
    let legStart = 0;
    let target: string | null = null;
    let entryAngle = 0;
    /** +1 sweeps clockwise on screen, −1 counterclockwise. Set from the
     *  inbound trajectory so the comet never has to reverse into the loop. */
    let orbitSign = 1;
    // Current leg: cubic Hermite from P0 (velocity V0) to P1 (velocity V1).
    let p0x = 0;
    let p0y = 0;
    let v0x = 0;
    let v0y = 0;
    let p1x = 0;
    let p1y = 0;
    let v1x = 0;
    let v1y = 0;
    let legMs = 1;
    let px = 0;
    let py = 0;
    let lx: number | null = null;
    let ly: number | null = null;
    let handedOff = false;
    let summoned = false;
    let raf = 0;
    /** After a phone panel close, keep orbiting until this timestamp. */
    let extraLoopUntil = 0;
    /** Screen point the summon lap circles — fixed for the whole lap so a
     *  transient getScreenCTM() miss cannot abort into the cursor early. */
    let summonAt: { x: number; y: number } | null = null;

    /** Lay out a flight from where the comet is now to (tx, ty), leaving at
     *  velocity `sv` and arriving at velocity `ev` — both in px per ms. Matching
     *  the motion either side is what removes the stall at each junction. */
    function setLeg(tx: number, ty: number, sv: Vec, ev: Vec, durMs: number) {
      p0x = px;
      p0y = py;
      p1x = tx;
      p1y = ty;
      legMs = durMs;
      // Hermite tangents are per unit of curve parameter, not per ms.
      v0x = sv[0] * durMs;
      v0y = sv[1] * durMs;
      v1x = ev[0] * durMs;
      v1y = ev[1] * durMs;
    }

    /** Point on the current leg at linear progress `u`. Linear on purpose: any
     *  easing would flatten the speed to zero at the ends and reintroduce the
     *  pause the Hermite tangents exist to remove. */
    function legAt(u: number): Vec {
      const u2 = u * u;
      const u3 = u2 * u;
      const h00 = 2 * u3 - 3 * u2 + 1;
      const h10 = u3 - 2 * u2 + u;
      const h01 = -2 * u3 + 3 * u2;
      const h11 = u3 - u2;
      return [
        h00 * p0x + h10 * v0x + h01 * p1x + h11 * v1x,
        h00 * p0y + h10 * v0y + h01 * p1y + h11 * v1y,
      ];
    }

    /** Bloom Captain Moroni in as the summoning lap begins. Only once. */
    function summonStar() {
      if (summoned) return;
      summoned = true;
      onSummonRef.current();
    }

    /** Hand the trail to the visitor's cursor. Only ever fires once. */
    function handOff() {
      if (handedOff) return;
      handedOff = true;
      // If the summon lap was skipped (no measurable sky), still reveal.
      summonStar();
      onFinishRef.current();
    }

    /** Appear already circling a star — used for the opening, so there is no
     *  fly-in across the sky. Returns false if the star isn't on screen yet. */
    function beginOrbit(now: number, id: string) {
      const c = starCenter(id);
      if (!c) return false;
      target = id;
      orbitSign = 1;
      entryAngle = 0;
      stopOpened = false;
      extraLoopUntil = 0;
      const [x, y] = orbitPoint(c.x, c.y, 0);
      px = x;
      py = y;
      head.setAttribute("transform", `translate(${x} ${y})`);
      lx = null;
      ly = null;
      head.setAttribute("opacity", "0.92");
      phase = "orbit";
      legStart = now;
      return true;
    }

    /** Aim a flight at a graze on the circle around (cx, cy). Shared by story
     *  hops and the final summon loop over the unlocked star's empty sky. */
    function aimAtCenter(c: { x: number; y: number }, depart: Vec) {
      const dx = px - c.x;
      const dy = py - c.y;
      const dist = Math.hypot(dx, dy);
      const alpha = Math.atan2(dy, dx);

      if (dist > ORBIT_R + 0.5) {
        const gamma = Math.acos(Math.min(1, ORBIT_R / dist));
        let bestScore = -Infinity;
        for (const a of [alpha + gamma, alpha - gamma]) {
          const tx = c.x + Math.cos(a) * ORBIT_R - px;
          const ty = c.y + Math.sin(a) * ORBIT_R - py;
          const toLen = Math.hypot(tx, ty) || 1;
          const ux = tx / toLen;
          const uy = ty / toLen;
          const cwDot = -Math.sin(a) * ux + Math.cos(a) * uy;
          const sign: 1 | -1 = cwDot >= 0 ? 1 : -1;
          const ox = sign === 1 ? -Math.sin(a) : Math.sin(a);
          const oy = sign === 1 ? Math.cos(a) : -Math.cos(a);
          const score =
            ux * depart[0] + uy * depart[1] + ox * depart[0] + oy * depart[1];
          if (score > bestScore) {
            bestScore = score;
            entryAngle = a;
            orbitSign = sign;
          }
        }
      } else {
        entryAngle = alpha;
        const cross = dx * depart[1] - dy * depart[0];
        if (Math.abs(cross) > 1e-9) orbitSign = cross > 0 ? 1 : -1;
      }

      setLeg(
        ...orbitPoint(c.x, c.y, 0),
        depart,
        orbitVel(c.x, c.y, 0),
        TRAVEL_MS
      );
    }

    /** Screen position of the still-hidden Captain Moroni star — figured from
     *  the SVG viewBox so we can orbit it before the star exists in the DOM. */
    function secretCenter(): { x: number; y: number } | null {
      if (secretOk) return secretCached;
      const sky = document.querySelector(
        "#sky-wrap svg#sky"
      ) as SVGSVGElement | null;
      if (!sky) return null;
      const ctm = sky.getScreenCTM();
      if (!ctm) return null;
      try {
        const pt = sky.createSVGPoint();
        pt.x = SECRET_NODE.x;
        pt.y = isPhone ? SECRET_NODE_Y_MOBILE : SECRET_NODE.y;
        const p = pt.matrixTransform(ctm);
        if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return null;
        secretCached = { x: p.x, y: p.y };
        secretOk = true;
        return secretCached;
      } catch {
        return null;
      }
    }

    /** Aim the next shot at a graze on the target's orbit that continues the
     *  inbound heading, arriving already matching that loop's speed and
     *  direction — clockwise or counterclockwise, whichever doesn't reverse. */
    function beginTravel(now: number, id: string, depart: Vec) {
      const c = starCenter(id);
      if (!c) return;
      target = id;
      stopOpened = false;
      extraLoopUntil = 0;
      summonAt = null;
      aimAtCenter(c, depart);
      phase = "travel";
      legStart = now;
    }

    /** After the tour: fly to where Moroni will appear, loop once, then merge.
     *  Returns false if the sky isn't measurable yet — caller should retry. */
    function beginSummon(now: number, depart: Vec = [0, 0]): boolean {
      const c = secretCenter();
      if (!c) return false;
      target = null;
      stopOpened = false;
      extraLoopUntil = 0;
      summonAt = c;
      // Aim using the slower summon lap so arrival speed matches the circle
      // the guide will hold while the star blooms.
      const lap = SUMMON_ORBIT_MS * 2;
      const dx = px - c.x;
      const dy = py - c.y;
      const dist = Math.hypot(dx, dy);
      const alpha = Math.atan2(dy, dx);
      if (dist > ORBIT_R + 0.5) {
        const gamma = Math.acos(Math.min(1, ORBIT_R / dist));
        let bestScore = -Infinity;
        for (const a of [alpha + gamma, alpha - gamma]) {
          const tx = c.x + Math.cos(a) * ORBIT_R - px;
          const ty = c.y + Math.sin(a) * ORBIT_R - py;
          const toLen = Math.hypot(tx, ty) || 1;
          const ux = tx / toLen;
          const uy = ty / toLen;
          const cwDot = -Math.sin(a) * ux + Math.cos(a) * uy;
          const sign: 1 | -1 = cwDot >= 0 ? 1 : -1;
          const ox = sign === 1 ? -Math.sin(a) : Math.sin(a);
          const oy = sign === 1 ? Math.cos(a) : -Math.cos(a);
          const score =
            ux * depart[0] + uy * depart[1] + ox * depart[0] + oy * depart[1];
          if (score > bestScore) {
            bestScore = score;
            entryAngle = a;
            orbitSign = sign;
          }
        }
      } else {
        entryAngle = alpha;
        const cross = dx * depart[1] - dy * depart[0];
        if (Math.abs(cross) > 1e-9) orbitSign = cross > 0 ? 1 : -1;
      }
      setLeg(
        ...orbitPoint(c.x, c.y, 0, lap),
        depart,
        orbitVel(c.x, c.y, 0, lap),
        TRAVEL_MS
      );
      phase = "summon-travel";
      legStart = now;
      return true;
    }

    /** Move the head, laying down a fading trail segment behind it. */
    function moveTo(x: number, y: number) {
      head.setAttribute("transform", `translate(${x} ${y})`);
      if (lx !== null && ly !== null) {
        const dist = Math.hypot(x - lx, y - ly);
        if (dist > trailMinStep) {
          emitTrail({
            x1: lx,
            y1: ly,
            x2: x,
            y2: y,
            width: Math.min(3.4, 1.4 + dist * 0.06),
            fadeMs: TRAIL_FADE_MS,
          });
        }
      }
      lx = x;
      ly = y;
      px = x;
      py = y;
    }

    /** Route finished. Run the comet into the cursor if there is one to merge
     *  with; otherwise (touch, or a mouse that never moved) just bow out. */
    function beginEnding(now: number, depart: Vec = [0, 0]) {
      target = null;
      if (finePointerRef.current && pointer.seen) {
        // Settles into the cursor rather than arriving hot — the burst supplies
        // the punch.
        setLeg(pointer.x, pointer.y, depart, [0, 0], MERGE_MS);
        phase = "merge";
        legStart = now;
        return;
      }
      phase = "done";
      head.setAttribute("opacity", "0");
      handOff();
    }

    /** The two comets become one: head out, burst in its place. */
    function burst(now: number) {
      head.setAttribute("opacity", "0");
      flash.setAttribute("transform", `translate(${px} ${py})`);
      flash.setAttribute("r", String(HEAD_R));
      flash.setAttribute("opacity", "0.95");
      phase = "flash";
      legStart = now;
      // Trail passes to the visitor's own cursor exactly as the guide lands.
      handOff();
    }

    /** If the open panel is further along the tour than the guide, fly
     *  straight there. Returns true when a new flight was started. */
    function tryCatchUp(now: number, depart: Vec): boolean {
      const active = activeIdRef.current;
      if (!active) return false;
      const activeIdx = route.indexOf(active);
      if (activeIdx < 0 || activeIdx <= routeIndex) return false;
      if (target === active) {
        routeIndex = activeIdx;
        return false;
      }
      routeIndex = activeIdx;
      // They are already reading this stop — do not wait to "open" it again.
      stopOpened = true;
      extraLoopUntil = 0;
      beginTravel(now, active, depart);
      return true;
    }

    const frame = (now: number) => {
      // Park the loop while the tab is hidden — resume on visibilitychange.
      if (document.hidden) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
      if (!legStart) legStart = now;
      const t = now - legStart;

      if (phase === "wait") {
        if (t < START_DELAY_MS) return;
        const first = stopAt(0);
        if (!first) {
          beginEnding(now);
          return;
        }
        // Retry next frame if the figure hasn't laid out yet.
        beginOrbit(now, first);
        return;
      }

      if (phase === "travel") {
        if (!target) {
          beginEnding(now);
          return;
        }
        if (unlockedRef.current && !panelOpenRef.current) {
          if (beginSummon(now)) return;
        }
        // Mid-flight redirect when the visitor jumps further ahead.
        if (tryCatchUp(now, [0, 0])) return;
        moveTo(...legAt(Math.min(1, t / legMs)));
        if (t >= legMs) {
          phase = "orbit";
          legStart = now;
        }
        return;
      }

      if (phase === "orbit") {
        if (!target) {
          beginEnding(now);
          return;
        }
        const c = starCenter(target);
        if (!c) return;
        // Advance the orbit on this very frame before deciding whether to leave.
        // Setting up a new leg and returning would spend the frame standing
        // still, which is visible as a hitch at the moment of the click.
        moveTo(...orbitPoint(c.x, c.y, t));
        if (unlockedRef.current && !panelOpenRef.current) {
          if (beginSummon(now, orbitVel(c.x, c.y, t))) return;
        }
        // Fast scroll / click-ahead: skip straight to the open star.
        if (tryCatchUp(now, orbitVel(c.x, c.y, t))) return;
        // Advance when the visitor opens *this* stop. The flag stays set after
        // they close the panel so the last stop can still merge.
        if (activeIdRef.current === target) stopOpened = true;
        if (stopOpened) {
          const next = stopAt(routeIndex + 1);
          if (holdUntilPanelCloseRef.current) {
            // Phone: stay put while the card is open. After they close it,
            // wait a half second, then leave.
            if (panelOpenRef.current) {
              extraLoopUntil = 0;
              return;
            }
            if (!extraLoopUntil) extraLoopUntil = now + CLOSE_DELAY_MS;
            if (now < extraLoopUntil) return;
            extraLoopUntil = 0;
          }
          if (next) {
            routeIndex += 1;
            beginTravel(now, next, orbitVel(c.x, c.y, t));
            return;
          }
        }
        return;
      }

      if (phase === "summon-travel") {
        moveTo(...legAt(Math.min(1, t / legMs)));
        if (t >= legMs) {
          summonStar();
          phase = "summon-orbit";
          legStart = now;
        }
        return;
      }

      if (phase === "summon-orbit") {
        const c = summonAt ?? secretCenter();
        if (!c) return;
        summonAt = c;
        const lap = SUMMON_ORBIT_MS * 2;
        moveTo(...orbitPoint(c.x, c.y, t, lap));
        // Leave for the cursor at mid-bloom (half a slow lap), so the rest
        // of the appear animation plays out while the guide merges in.
        if (t >= SUMMON_ORBIT_MS) {
          beginEnding(now, orbitVel(c.x, c.y, t, lap));
        }
        return;
      }

      if (phase === "merge") {
        // Endpoint is re-read every frame, so the comet homes in on the cursor
        // even while it's moving, and still lands exactly on it at u = 1.
        p1x = pointer.x;
        p1y = pointer.y;
        moveTo(...legAt(Math.min(1, t / legMs)));
        if (t >= legMs) burst(now);
        return;
      }

      if (phase === "flash") {
        const u = Math.min(1, t / FLASH_MS);
        flash.setAttribute("r", (HEAD_R + u * HEAD_R * 3.2).toFixed(2));
        flash.setAttribute("opacity", (0.95 * (1 - u)).toFixed(3));
        if (u >= 1) {
          flash.setAttribute("opacity", "0");
          phase = "done";
        }
        return;
      }

      // done — stop burning frames.
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onVisibility = () => {
      if (!document.hidden && !raf && phase !== "done") {
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      layer.remove();
    };
  }, [reducedMotion]);

  return (
    <svg id="guide" ref={svgRef} aria-hidden="true" xmlns={SVG_NS}>
      <defs>
        <radialGradient id="guide-dust">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="45%" stopColor="#cfe2ff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#7fb0ff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export default memo(GuideComet);
