"use client";

import { useEffect, useRef, useState } from "react";
import type { StarContent } from "@/lib/types";
import { useScrollThumb } from "./hooks";

// Accent for the designation + link — the same blue as the clickable stars.
const ACCENT = "#bcd6ff";

interface Props {
  content: StarContent | null;
  onClose: () => void;
}

/** Side panel (desktop) / centered card (mobile). Real modal: focus is trapped
 *  while open, Escape and backdrop-click close it, focus is handled by Sky. */
export default function Panel({ content, onClose }: Props) {
  // Keep the last content mounted through the slide-out transition.
  const [shown, setShown] = useState<StarContent | null>(content);
  const panelRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const open = content !== null;
  const { thumb, updateThumb } = useScrollThumb(
    scrollRef,
    innerRef,
    open,
    shown?.id
  );

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

  // New story: jump back to the top so the custom thumb starts at the start.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = 0;
  }, [shown?.id]);

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
      <div className="panel-scroll" ref={scrollRef}>
        {shown && (
          <div className="panel-scroll-inner" ref={innerRef}>
            <p className="panel-designation" style={{ color: accent }}>
              {shown.subtitle}
            </p>
            <h2 id="panel-title" className="panel-title">
              {shown.name}
            </h2>
            {shown.meta && <p className="panel-meta">{shown.meta}</p>}
            {shown.image && (
              <figure className="panel-portrait">
                <div
                  className={
                    "panel-portrait-frame" +
                    (shown.image.color ? " is-color" : "") +
                    (shown.image.uncropped ? " is-uncropped" : "")
                  }
                >
                  <img
                    src={shown.image.src}
                    alt={shown.image.alt}
                    style={
                      shown.image.objectPosition
                        ? { objectPosition: shown.image.objectPosition }
                        : undefined
                    }
                    onLoad={updateThumb}
                  />
                </div>
                {shown.image.caption && (
                  <figcaption>{shown.image.caption}</figcaption>
                )}
              </figure>
            )}
            {shown.body.split("\n\n").map((para) => (
              <p key={para.slice(0, 48)} className="panel-body">
                {para}
              </p>
            ))}
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
          </div>
        )}
      </div>
      <div
        className={"panel-scrollbar" + (thumb ? " is-visible" : "")}
        aria-hidden="true"
      >
        <div className="panel-scrollbar-track">
          {thumb && (
            <div
              className="panel-scrollbar-thumb"
              style={{ height: `${thumb.height}%`, top: `${thumb.top}%` }}
            />
          )}
        </div>
      </div>
    </aside>
  );
}
