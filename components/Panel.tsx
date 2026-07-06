"use client";

import { useEffect, useRef, useState } from "react";
import type { StarContent } from "@/lib/types";

// Accent for the designation + link — the same blue as the clickable stars.
const ACCENT = "#bcd6ff";

interface Props {
  content: StarContent | null;
  onClose: () => void;
}

/** Side panel (desktop) / bottom sheet (mobile). Real modal: focus is trapped
 *  while open, Escape and backdrop-click close it, focus is handled by Sky. */
export default function Panel({ content, onClose }: Props) {
  // Keep the last content mounted through the slide-out transition.
  const [shown, setShown] = useState<StarContent | null>(content);
  const panelRef = useRef<HTMLDivElement>(null);
  const open = content !== null;

  useEffect(() => {
    if (content) setShown(content);
  }, [content]);

  // Focus the close button when opened.
  useEffect(() => {
    if (open) {
      const btn = panelRef.current?.querySelector<HTMLElement>(".panel-close");
      btn?.focus();
    }
  }, [open]);

  function onKeyDown(e: React.KeyboardEvent) {
    // Escape is handled globally in Sky; here we only trap Tab focus.
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusables = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const accent = ACCENT;
  const external = shown?.link?.url.startsWith("http");

  return (
    <aside
      ref={panelRef}
      id="panel"
      className={"panel" + (open ? " is-open" : "")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="panel-title"
      /* inert removes the closed (off-screen) panel from the tab order and
         the accessibility tree while still allowing the slide transition. */
      inert={!open}
      onKeyDown={onKeyDown}
    >
      <button className="panel-close" aria-label="Close panel" onClick={onClose}>
        &times;
      </button>
      {shown && (
        <>
          <p className="panel-designation" style={{ color: accent }}>
            {shown.subtitle}
          </p>
          <h2 id="panel-title" className="panel-title">
            {shown.name}
          </h2>
          {shown.meta && <p className="panel-meta">{shown.meta}</p>}
          <p className="panel-body">{shown.body}</p>
          {shown.link && (
            <a
              className="panel-link"
              href={shown.link.url}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              style={{ color: accent }}
            >
              {shown.link.text}
            </a>
          )}
        </>
      )}
    </aside>
  );
}
