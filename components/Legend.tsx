"use client";

import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { TOUR_ORDER } from "@/lib/content";
import type { Section, StarContent } from "@/lib/types";

const CATEGORIES: { key: Section; label: string; short?: string }[] = [
  { key: "motivations", label: "Motivations" },
  { key: "background", label: "Background" },
  { key: "iic", label: "Immortalist Industrial Complex", short: "Work (I.I.C.)" },
];

interface Props {
  stars: StarContent[];
  activeSection: Section | null;
  activeId: string | null;
  isMobile: boolean;
  onSelectSection: (section: Section) => void;
  onCloseSection: () => void;
  onSelectStar: (content: StarContent) => void;
}

/** Fade names at the edges of the I.I.C. wheel so the list never reads as
 *  a hard block over the figure — top ones dissolve, bottom ones arrive.
 *  At the very bottom the last title stays full-glow so the end of the
 *  list is obvious. */
function fadeWheel(port: HTMLElement) {
  const pr = port.getBoundingClientRect();
  const band = 26;
  const scrolled = port.scrollTop > 1;
  const atBottom =
    port.scrollTop + port.clientHeight >= port.scrollHeight - 2;
  port.querySelectorAll<HTMLElement>(".legend-star").forEach((el) => {
    const r = el.getBoundingClientRect();
    const mid = (r.top + r.bottom) / 2;
    let o = 1;
    if (scrolled && mid < pr.top + band) o = (mid - pr.top) / band;
    else if (!atBottom && mid > pr.bottom - band)
      o = (pr.bottom - mid) / band;
    el.style.opacity = String(Math.max(0, Math.min(1, o)));
  });
}

/** Left-side legend + filter. Clicking a category highlights its stars and
 *  reveals their names as an inline dropdown. I.I.C. uses a short left-hand
 *  wheel so the long list does not cover the constellation. */
function Legend({
  stars,
  activeSection,
  activeId,
  isMobile,
  onSelectSection,
  onSelectStar,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const paintRaf = useRef(0);
  const iicOpen = activeSection === "iic";

  const paintWheel = useCallback(() => {
    const port = scrollRef.current;
    if (!port) return;
    fadeWheel(port);
    const { scrollTop, scrollHeight, clientHeight } = port;
    const overflow = scrollHeight > clientHeight + 1;
    barRef.current?.classList.toggle("is-visible", overflow);
    const thumb = thumbRef.current;
    if (!overflow || !thumb) return;
    const travel = scrollHeight - clientHeight;
    const height = Math.min(34, Math.max(22, (clientHeight / scrollHeight) * 100));
    thumb.style.height = `${height}%`;
    thumb.style.top = `${(scrollTop / travel) * (100 - height)}%`;
  }, []);

  const schedulePaint = useCallback(() => {
    if (paintRaf.current) return;
    paintRaf.current = window.requestAnimationFrame(() => {
      paintRaf.current = 0;
      paintWheel();
    });
  }, [paintWheel]);

  useEffect(() => {
    if (!iicOpen || !isMobile) return;
    const port = scrollRef.current;
    if (!port) return;
    port.scrollTop = 0;
    const id = window.requestAnimationFrame(paintWheel);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 8;
      else if (e.deltaMode === 2) dy *= port.clientHeight;
      port.scrollTop += dy;
    };

    let touchY = 0;
    let touchScroll = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
      touchScroll = port.scrollTop;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      port.scrollTop = touchScroll - (e.touches[0].clientY - touchY);
    };

    port.addEventListener("wheel", onWheel, { passive: false });
    port.addEventListener("touchstart", onTouchStart, { passive: true });
    port.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.cancelAnimationFrame(id);
      window.cancelAnimationFrame(paintRaf.current);
      paintRaf.current = 0;
      port.removeEventListener("wheel", onWheel);
      port.removeEventListener("touchstart", onTouchStart);
      port.removeEventListener("touchmove", onTouchMove);
    };
  }, [iicOpen, isMobile, paintWheel]);

  const bySection = useMemo(() => {
    const tourAt = new Map(TOUR_ORDER.map((id, i) => [id, i]));
    const map = new Map<Section, StarContent[]>();
    stars.forEach((s) => {
      const list = map.get(s.section) ?? [];
      list.push(s);
      map.set(s.section, list);
    });
    for (const list of map.values()) {
      list.sort(
        (a, b) => (tourAt.get(a.id) ?? 999) - (tourAt.get(b.id) ?? 999)
      );
    }
    return map;
  }, [stars]);

  return (
    <aside className="legend" aria-label="Constellation legend and filter">
      <p className="legend-title">Legend</p>
      <ul>
        {CATEGORIES.map((c) => {
          const expanded = activeSection === c.key;
          const stars = bySection.get(c.key) ?? [];
          const wheel = c.key === "iic" && isMobile;
          return (
            <li key={c.key}>
              <button
                type="button"
                className={"legend-item" + (expanded ? " is-active" : "")}
                aria-expanded={expanded}
                aria-label={c.label}
                onClick={() => onSelectSection(c.key)}
              >
                {expanded ? c.label : (c.short ?? c.label)}
              </button>
              {expanded && !wheel && (
                <ul className="legend-sub">
                  {stars.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        className={
                          "legend-star" +
                          (activeId === s.id ? " is-active" : "")
                        }
                        onClick={() => onSelectStar(s)}
                      >
                        {s.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {expanded && wheel && (
                <div className="legend-wheel">
                  <div
                    className="legend-wheel-scroll"
                    ref={scrollRef}
                    onScroll={schedulePaint}
                  >
                    <ul className="legend-sub legend-sub--wheel">
                      {stars.map((s) => (
                        <li key={s.id}>
                          <button
                            type="button"
                            className={
                              "legend-star" +
                              (activeId === s.id ? " is-active" : "")
                            }
                            onClick={() => onSelectStar(s)}
                          >
                            {s.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div
                    className="legend-wheel-bar"
                    ref={barRef}
                    aria-hidden="true"
                  >
                    <div className="legend-wheel-track">
                      <div className="legend-wheel-thumb" ref={thumbRef} />
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export default memo(Legend);
