"use client";

import Image from "next/image";
import { memo, useEffect, useRef, useState } from "react";
import type { StarContent } from "@/lib/types";
import { useScrollThumb } from "./hooks";

// Accent for the designation + link — the same blue as the clickable stars.
const ACCENT = "#bcd6ff";

/** Keep loaded story prose so revisiting a star doesn't blank the body and
 *  reflow the phone card. */
const bodyCache = new Map<string, string>();

interface Props {
  content: StarContent | null;
  onClose: () => void;
}

/** Side panel (desktop) / centered card (mobile). Real modal: focus is trapped
 *  while open, Escape and backdrop-click close it, focus is handled by Sky. */
function Panel({ content, onClose }: Props) {
  // Keep the last story around only so the slide-out still has content to show.
  // While open, always prefer `content` so fast star-switching never paints the
  // previous image/title for a frame.
  const [cached, setCached] = useState<StarContent | null>(content);
  const [body, setBody] = useState("");
  const panelRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const open = content !== null;
  const display = content ?? cached;
  const { thumb, updateThumb } = useScrollThumb(
    scrollRef,
    innerRef,
    open,
    display?.id
  );

  useEffect(() => {
    if (content) setCached(content);
  }, [content]);

  // Lazy-load panel prose so storyBodies stays out of the first JS chunk.
  useEffect(() => {
    if (!display) return;
    const id = display.id;
    const cachedBody = bodyCache.get(id);
    if (cachedBody !== undefined) {
      setBody(cachedBody);
      requestAnimationFrame(updateThumb);
      return;
    }
    let cancelled = false;
    setBody("");
    import("@/lib/storyBodies").then((m) => {
      if (cancelled) return;
      const next = m.BODIES[id] ?? display.body ?? "";
      bodyCache.set(id, next);
      setBody(next);
      requestAnimationFrame(updateThumb);
    });
    return () => {
      cancelled = true;
    };
  }, [display, updateThumb]);

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
  }, [display?.id]);

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
  const external = display?.link?.url.startsWith("http");

  return (
    <div className={"panel-slot" + (open ? " is-open" : "")}>
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
        {/* Non-scrolling chrome so the X never sits under portrait images. */}
        <div className="panel-chrome">
          <button
            className="panel-close"
            aria-label="Close panel"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="panel-scroll" ref={scrollRef}>
          {display && (
            <div className="panel-scroll-inner" ref={innerRef} key={display.id}>
              <p className="panel-designation" style={{ color: accent }}>
                {display.subtitle}
              </p>
              <h2 id="panel-title" className="panel-title">
                {display.name}
              </h2>
              {display.meta && <p className="panel-meta">{display.meta}</p>}
              {display.image && (
                <figure className="panel-portrait">
                  <div
                    className={
                      "panel-portrait-frame" +
                      (display.image.color ? " is-color" : "") +
                      (display.image.uncropped ? " is-uncropped" : "")
                    }
                  >
                    <Image
                      key={display.image.src}
                      src={display.image.src}
                      alt={display.image.alt}
                      width={760}
                      height={display.image.uncropped ? 1140 : 507}
                      sizes="(max-width: 640px) 90vw, 380px"
                      quality={72}
                      style={{
                        ...(display.image.uncropped
                          ? { width: "100%", height: "auto" }
                          : null),
                        ...(display.image.objectPosition
                          ? { objectPosition: display.image.objectPosition }
                          : null),
                      }}
                      onLoad={updateThumb}
                    />
                  </div>
                  {display.image.caption && (
                    <figcaption>{display.image.caption}</figcaption>
                  )}
                </figure>
              )}
              {body.split("\n\n").map((para) => (
                <p key={para.slice(0, 48)} className="panel-body">
                  {para}
                </p>
              ))}
              {display.link && (
                <a
                  className="panel-link"
                  href={display.link.url}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  style={{ color: accent }}
                >
                  {display.link.text}
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
    </div>
  );
}

export default memo(Panel);
