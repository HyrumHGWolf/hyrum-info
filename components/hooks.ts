"use client";

import { useCallback, useEffect, useState } from "react";
import type { RefObject } from "react";

/** True when the OS asks for reduced motion (override with ?motion in the URL). */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const forced =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("motion");
    if (forced) {
      setReduced(false);
      return;
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** True for hover-capable, fine pointers (mouse) — false for touch. */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fine;
}

/** True below the mobile breakpoint (matches the CSS @media max-width: 640px). */
export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

/** Thumb position for the custom in-card scrollbar. `enabled` is the open
 *  state; `watch` retriggers when the scrolled content itself changes. */
export function useScrollThumb(
  scrollRef: RefObject<HTMLElement | null>,
  innerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  watch?: string | number | null
) {
  const [thumb, setThumb] = useState<{ top: number; height: number } | null>(
    null
  );

  const updateThumb = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight + 1) {
      setThumb(null);
      return;
    }
    const travel = scrollHeight - clientHeight;
    const height = Math.min(34, Math.max(22, (clientHeight / scrollHeight) * 100));
    setThumb({
      height,
      top: (scrollTop / travel) * (100 - height),
    });
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    const inner = innerRef.current;
    if (!el || !enabled) {
      setThumb(null);
      return;
    }
    updateThumb();
    el.addEventListener("scroll", updateThumb, { passive: true });
    const ro = new ResizeObserver(updateThumb);
    ro.observe(el);
    if (inner) ro.observe(inner);
    return () => {
      el.removeEventListener("scroll", updateThumb);
      ro.disconnect();
    };
  }, [enabled, watch, updateThumb, scrollRef, innerRef]);

  return { thumb, updateThumb };
}
