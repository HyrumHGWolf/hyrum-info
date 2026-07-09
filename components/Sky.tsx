"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BackgroundField from "./BackgroundField";
import Constellation from "./Constellation";
import Panel from "./Panel";
import Footer from "./Footer";
import Legend from "./Legend";
import CometTrail from "./CometTrail";
import { usePrefersReducedMotion, useFinePointer } from "./hooks";
import { STARS } from "@/lib/content";
import type { StarContent, Section } from "@/lib/types";

export default function Sky() {
  const reducedMotion = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [hintGone, setHintGone] = useState(false);
  // Stars whose stories have been opened this visit — they keep the sparkle
  // but lose their glow, so the sky shows where you've already been.
  const [visited, setVisited] = useState<ReadonlySet<string>>(new Set());
  const lastFocused = useRef<HTMLElement | null>(null);

  const openStar = useCallback((content: StarContent) => {
    lastFocused.current = document.activeElement as HTMLElement;
    setActiveId(content.id);
    setVisited((v) => (v.has(content.id) ? v : new Set(v).add(content.id)));
    setHintGone(true);
  }, []);

  // Close just the story panel (X button / Escape) and restore focus.
  const closePanel = useCallback(() => {
    setActiveId(null);
    lastFocused.current?.focus?.();
  }, []);

  // Toggle a legend category (highlight + dropdown); switching closes any panel.
  const selectSection = useCallback((section: Section) => {
    setActiveSection((cur) => (cur === section ? null : section));
    setActiveId(null);
  }, []);

  // Clicking the empty sky clears the highlight, collapses the menu, and
  // closes the panel.
  const closeAll = useCallback(() => {
    setActiveId(null);
    setActiveSection(null);
  }, []);

  // Mark <html> so CSS can respond to reduced motion.
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
  }, [reducedMotion]);

  // Escape closes the topmost thing: the story panel first, then the legend menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (activeId) closePanel();
      else if (activeSection) setActiveSection(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeId, activeSection, closePanel]);

  const activeContent =
    activeId !== null ? STARS.find((s) => s.id === activeId) ?? null : null;

  return (
    <>
      {/* Nebula haze */}
      <div className="nebula-field" aria-hidden="true">
        <span className="nebula nebula--violet" />
        <span className="nebula nebula--teal" />
        <span className="nebula nebula--amber" />
      </div>

      <BackgroundField reducedMotion={reducedMotion} finePointer={finePointer} />

      <Legend
        activeSection={activeSection}
        activeId={activeId}
        onSelectSection={selectSection}
        onSelectStar={openStar}
      />

      <header className="site-header">
        <span className="header-glow" aria-hidden="true" />
        <h1 className="name">Hyrum HG Wolf</h1>
        <p className="tagline">Cosmist &amp; Christian</p>
      </header>

      <Constellation
        finePointer={finePointer}
        activeId={activeId}
        activeSection={activeSection}
        visited={visited}
        onOpen={openStar}
        onBackgroundClick={closeAll}
      />

      <CometTrail finePointer={finePointer} reducedMotion={reducedMotion} />

      <div className={"hint" + (hintGone ? " is-gone" : "")} aria-hidden="true">
        Brighter stars hold stories — {finePointer ? "click" : "tap"} one
      </div>

      <Panel content={activeContent} onClose={closePanel} />

      <Footer />
    </>
  );
}
