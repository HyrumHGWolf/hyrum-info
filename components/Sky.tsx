"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Constellation from "./Constellation";
import Panel from "./Panel";
import Legend from "./Legend";
import { usePrefersReducedMotion, useFinePointer, useIsMobile } from "./hooks";
import { SECRET_STAR, STARS, TOUR_ORDER } from "@/lib/content";
import type { StarContent, Section } from "@/lib/types";

/** Keep in sync with `.star-unlock-*` durations in app/globals.css. */
const MORONI_UNLOCK_MS = 4200;

const BackgroundField = dynamic(() => import("./BackgroundField"), {
  ssr: false,
});
const TrailLayer = dynamic(() => import("./TrailLayer"), { ssr: false });
const CometTrail = dynamic(() => import("./CometTrail"), { ssr: false });
const GuideComet = dynamic(() => import("./GuideComet"), { ssr: false });

export default function Sky() {
  const reducedMotion = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  const isMobile = useIsMobile();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [hintGone, setHintGone] = useState(false);
  // Stars whose stories have been opened this visit — they keep the sparkle
  // but lose their glow, so the sky shows where you've already been.
  const [visited, setVisited] = useState<ReadonlySet<string>>(new Set());
  // The guide comet owns the trail until it has walked the whole tour and
  // merged into the cursor; only then does the cursor comet switch on.
  const [guideDone, setGuideDone] = useState(false);
  // Captain Moroni stays hidden until the guide summons it (one loop at its
  // spot, then merge into the cursor). Reduced-motion skips the summon.
  const [moroniRevealed, setMoroniRevealed] = useState(false);
  const lastFocused = useRef<HTMLElement | null>(null);
  const moroniRevealedAt = useRef(0);
  const moroniOpenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Set when the visitor scrolls past the last tour star — after the guide
   *  summons Moroni, open its panel automatically. */
  const pendingAutoMoroni = useRef(false);
  /** True from that scroll until Moroni is revealed — blocks the wheel from
   *  restarting the tour while the panel is closed mid-summon. */
  const summoningMoroni = useRef(false);

  const cancelPendingMoroni = useCallback(() => {
    if (moroniOpenTimer.current !== null) {
      clearTimeout(moroniOpenTimer.current);
      moroniOpenTimer.current = null;
    }
  }, []);

  const revealMoroni = useCallback(() => {
    setMoroniRevealed((was) => {
      if (!was) moroniRevealedAt.current = performance.now();
      return true;
    });
  }, []);

  const openStar = useCallback(
    (content: StarContent) => {
      cancelPendingMoroni();
      // While the unlock bloom is still playing, hold the sidebar until it
      // finishes — scroll/click still "selects" Moroni, just not the panel yet.
      if (
        content.id === SECRET_STAR.id &&
        !reducedMotion &&
        moroniRevealedAt.current > 0
      ) {
        const wait = MORONI_UNLOCK_MS - (performance.now() - moroniRevealedAt.current);
        if (wait > 0) {
          setHintGone(true);
          moroniOpenTimer.current = setTimeout(() => {
            moroniOpenTimer.current = null;
            lastFocused.current = document.activeElement as HTMLElement;
            setActiveId(content.id);
            setVisited((v) =>
              v.has(content.id) ? v : new Set(v).add(content.id)
            );
          }, wait);
          return;
        }
      }
      lastFocused.current = document.activeElement as HTMLElement;
      setActiveId(content.id);
      setVisited((v) => (v.has(content.id) ? v : new Set(v).add(content.id)));
      setHintGone(true);
    },
    [cancelPendingMoroni, reducedMotion]
  );

  // Close just the story panel (X button / Escape) and restore focus.
  const closePanel = useCallback(() => {
    cancelPendingMoroni();
    setActiveId(null);
    lastFocused.current?.focus?.();
  }, [cancelPendingMoroni]);

  // Toggle a legend category (highlight + dropdown); switching closes any panel.
  const selectSection = useCallback(
    (section: Section) => {
      cancelPendingMoroni();
      setActiveSection((cur) => (cur === section ? null : section));
      setActiveId(null);
    },
    [cancelPendingMoroni]
  );

  // Collapse the legend category without touching the story panel. Used by the
  // mobile legend sheet's close button and when tapping a star from it.
  const closeSection = useCallback(() => setActiveSection(null), []);

  // Clicking the empty sky clears the highlight, collapses the menu, and
  // closes the panel.
  const closeAll = useCallback(() => {
    cancelPendingMoroni();
    setActiveId(null);
    setActiveSection(null);
  }, [cancelPendingMoroni]);

  useEffect(() => () => cancelPendingMoroni(), [cancelPendingMoroni]);

  // Mark <html> so CSS can respond to reduced motion.
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
  }, [reducedMotion]);

  // Pause decorative CSS animations while the tab is hidden.
  useEffect(() => {
    const sync = () =>
      document.documentElement.classList.toggle("is-hidden", document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  // Escape closes the topmost thing: the story panel first, then the legend menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (activeId || moroniOpenTimer.current) closePanel();
      else if (activeSection) setActiveSection(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeId, activeSection, closePanel]);

  const unlocked = STARS.every((s) => visited.has(s.id));
  const visibleStars = useMemo(
    () => (unlocked && moroniRevealed ? [...STARS, SECRET_STAR] : STARS),
    [unlocked, moroniRevealed]
  );

  useEffect(() => {
    if (reducedMotion && unlocked) revealMoroni();
  }, [reducedMotion, unlocked, revealMoroni]);

  // After a scroll-past-the-end on the last tour star, open Moroni once the
  // guide has summoned it (openStar waits out the bloom if needed).
  useEffect(() => {
    if (!moroniRevealed || !pendingAutoMoroni.current) return;
    pendingAutoMoroni.current = false;
    summoningMoroni.current = false;
    openStar(SECRET_STAR);
  }, [moroniRevealed, openStar]);

  const activeContent =
    activeId !== null
      ? visibleStars.find((s) => s.id === activeId) ?? null
      : null;

  // Desktop: the mouse wheel over the sky steps through the stories in tour
  // order (Moroni last once unlocked). Wheeling inside the story panel still
  // scrolls its text.
  const tourStars = useMemo(
    () =>
      TOUR_ORDER.map((id) => STARS.find((s) => s.id === id)).filter(
        (s): s is StarContent => !!s
      ),
    []
  );
  const wheelOrder = useRef<StarContent[]>([]);
  wheelOrder.current = [
    ...tourStars,
    ...(unlocked && moroniRevealed ? [SECRET_STAR] : []),
  ];
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;
  const unlockedRef = useRef(unlocked);
  unlockedRef.current = unlocked;
  const moroniRevealedRef = useRef(moroniRevealed);
  moroniRevealedRef.current = moroniRevealed;

  useEffect(() => {
    if (isMobile || !finePointer) return;
    const STEP_DELTA = 40;
    const MIN_GAP_MS = 500;
    const QUIET_MS = 200;
    let acc = 0;
    let firedAt = -Infinity;
    let lastEvent = -Infinity;
    let locked = false;

    const onWheel = (e: WheelEvent) => {
      const overPanel = !!(e.target as Element | null)?.closest?.(".panel");
      if (overPanel) {
        // Still allow scroll-down on the last tour panel to dismiss into the
        // Moroni summon — otherwise only the panel text would scroll.
        const order = wheelOrder.current;
        const at = order.findIndex((s) => s.id === activeIdRef.current);
        const canSummon =
          e.deltaY > 0 &&
          unlockedRef.current &&
          !moroniRevealedRef.current &&
          at === order.length - 1;
        if (!canSummon) return;
      }
      const now = performance.now();
      // One flick = one star: stay locked until the wheel (or trackpad
      // inertia) has gone quiet and a minimum gap has passed.
      if (locked) {
        const quiet = now - lastEvent > QUIET_MS;
        lastEvent = now;
        if (!quiet || now - firedAt < MIN_GAP_MS) return;
        locked = false;
        acc = 0;
      }
      lastEvent = now;
      acc += e.deltaY;
      if (Math.abs(acc) < STEP_DELTA) return;

      // Mid-summon: the panel is closed on purpose — don't let the next flick
      // reopen the first tour star.
      if (summoningMoroni.current && !moroniRevealedRef.current) {
        acc = 0;
        locked = true;
        firedAt = now;
        return;
      }

      const order = wheelOrder.current;
      if (!order.length) return;
      const at = order.findIndex((s) => s.id === activeIdRef.current);
      const dir = acc > 0 ? 1 : -1;
      acc = 0;
      locked = true;
      firedAt = now;

      // Past the last tour stop: close the panel so the guide can summon
      // Captain Moroni, then open its sidebar when that sequence finishes.
      if (
        dir > 0 &&
        unlockedRef.current &&
        !moroniRevealedRef.current &&
        at === order.length - 1
      ) {
        pendingAutoMoroni.current = true;
        summoningMoroni.current = true;
        cancelPendingMoroni();
        setActiveId(null);
        setActiveSection(null);
        return;
      }

      const next =
        at === -1
          ? dir > 0
            ? 0
            : order.length - 1
          : Math.min(order.length - 1, Math.max(0, at + dir));
      if (next !== at) openStar(order[next]);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [isMobile, finePointer, openStar, cancelPendingMoroni]);

  return (
    <>
      <BackgroundField reducedMotion={reducedMotion} finePointer={finePointer} />

      <Legend
        stars={visibleStars}
        activeSection={activeSection}
        activeId={activeId}
        isMobile={isMobile}
        onSelectSection={selectSection}
        onCloseSection={closeSection}
        onSelectStar={openStar}
      />

      <Constellation
        stars={visibleStars}
        finePointer={finePointer}
        isMobile={isMobile}
        activeId={activeId}
        activeSection={activeSection}
        visited={visited}
        onOpen={openStar}
        onBackgroundClick={closeAll}
      />

      <TrailLayer />

      <GuideComet
        activeId={activeId}
        unlocked={unlocked}
        reducedMotion={reducedMotion}
        finePointer={finePointer}
        panelOpen={activeId !== null}
        holdUntilPanelClose={isMobile}
        onSummon={revealMoroni}
        onFinish={() => setGuideDone(true)}
      />

      <CometTrail
        finePointer={finePointer}
        reducedMotion={reducedMotion}
        enabled={guideDone}
      />

      <div className={"hint" + (hintGone ? " is-gone" : "")} aria-hidden="true">
        Brighter stars hold stories — {finePointer ? "click" : "tap"} one
      </div>

      <Panel content={activeContent} onClose={closePanel} />
    </>
  );
}
