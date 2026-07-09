"use client";

import { useMemo } from "react";
import { STARS } from "@/lib/content";
import type { Section, StarContent } from "@/lib/types";
import { useIsMobile } from "./hooks";

const CATEGORIES: { key: Section; label: string }[] = [
  { key: "motivations", label: "Motivations" },
  { key: "iic", label: "Immortalist Industrial Complex" },
  { key: "background", label: "Background" },
];

interface Props {
  activeSection: Section | null;
  activeId: string | null;
  onSelectSection: (section: Section) => void;
  onCloseSection: () => void;
  onSelectStar: (content: StarContent) => void;
}

/** Left-side legend + filter. Clicking a category highlights its stars and
 *  reveals their names — an inline dropdown on desktop, a slide-up bottom
 *  sheet on mobile. Clicking a name opens that story. */
export default function Legend({
  activeSection,
  activeId,
  onSelectSection,
  onCloseSection,
  onSelectStar,
}: Props) {
  const isMobile = useIsMobile();
  const bySection = useMemo(() => {
    const map = new Map<Section, StarContent[]>();
    STARS.forEach((s) => {
      const list = map.get(s.section) ?? [];
      list.push(s);
      map.set(s.section, list);
    });
    return map;
  }, []);

  return (
    <aside className="legend" aria-label="Constellation legend and filter">
      <p className="legend-title">Legend</p>
      <ul>
        {CATEGORIES.map((c) => {
          const expanded = activeSection === c.key;
          const stars = bySection.get(c.key) ?? [];
          return (
            <li key={c.key}>
              <button
                type="button"
                className={"legend-item" + (expanded ? " is-active" : "")}
                aria-expanded={expanded}
                onClick={() => onSelectSection(c.key)}
              >
                {c.label}
              </button>
              {expanded && (
                <div className="legend-sheet">
                  {/* Header only shows on the mobile bottom sheet. */}
                  <div className="legend-sheet-head">
                    <span className="legend-sheet-title">{c.label}</span>
                    <button
                      type="button"
                      className="legend-sheet-close"
                      aria-label="Close"
                      onClick={onCloseSection}
                    >
                      &times;
                    </button>
                  </div>
                  <ul className="legend-sub">
                    {stars.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          className={
                            "legend-star" +
                            (activeId === s.id ? " is-active" : "")
                          }
                          onClick={() => {
                            onSelectStar(s);
                            // Two bottom sheets can't share the screen — on
                            // mobile, opening a story closes the legend sheet.
                            if (isMobile) onCloseSection();
                          }}
                        >
                          {s.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
