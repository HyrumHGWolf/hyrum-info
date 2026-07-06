"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  EDGE_PATH,
  EDGE_OFFSET,
  EDGES,
  NODES,
  NODE_BY_ID,
  VIEWBOX,
} from "@/lib/figure";
import type { FigureNode } from "@/lib/figure";
import { STARS } from "@/lib/content";
import type { StarContent, Section } from "@/lib/types";
import { useIsMobile } from "./hooks";

// Every clickable star looks the same: one size, the "OG" Cryopets blue.
// Mobile renders the figure smaller overall, so story stars get an extra bump
// there to stay easy to spot.
const INTERACTIVE = { core: "#dcebff", glow: "url(#glow-blue)", label: "#bcd6ff" };
const INTERACTIVE_R = 6.5;
const INTERACTIVE_R_MOBILE = 9;

// The selected star morphs into this sparkle (Ellipse 317.svg, 612×636).
const SPARKLE_W = 54;
const SPARKLE_H = (SPARKLE_W * 636) / 612;

// On touch devices the scaled-down hit circles are tiny, so a tap anywhere
// within this many screen pixels of a story star opens it (nearest wins).
const NEAR_TAP_PX = 32;

/** Stable 0..1 pseudo-random from a string, so twinkle/pulse phases survive
 *  re-renders and match between server and client (no hydration drift). */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

// Padding (in viewBox units) around the figure so it sits clear of the name at
// the top and the footer at the bottom — and reads smaller, not edge-to-edge.
// On phones the sky is width-constrained, so horizontal padding is what
// shrinks the figure: a slim gutter there renders Moroni much larger.
const PAD = { x: 150, top: 300, bottom: 150 };
const PAD_MOBILE = { x: 12, top: 300, bottom: 150 };
const viewFor = (pad: typeof PAD) =>
  `${-pad.x} ${-pad.top} ${VIEWBOX.w + pad.x * 2} ${
    VIEWBOX.h + pad.top + pad.bottom
  }`;

interface Props {
  finePointer: boolean;
  activeId: string | null;
  activeSection: Section | null;
  onOpen: (content: StarContent) => void;
  onBackgroundClick: () => void;
}

export default function Constellation({
  finePointer,
  activeId,
  activeSection,
  onOpen,
  onBackgroundClick,
}: Props) {
  const isMobile = useIsMobile();
  const interactiveR = isMobile ? INTERACTIVE_R_MOBILE : INTERACTIVE_R;
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [label, setLabel] = useState<{
    text: string;
    color: string;
    x: number;
    y: number;
    flip: boolean;
  } | null>(null);
  const coreRefs = useRef<Record<string, SVGCircleElement | null>>({});

  // Story-by-node, plus the node pairs to glow when a story is hovered.
  // connectsTo pairs are validated against the figure's edge skeleton so a
  // glow line is only drawn where the line art actually connects the stars.
  const { contentByNode, glowPairs } = useMemo(() => {
    const contentByNode = new Map<string, StarContent>();
    STARS.forEach((s) => contentByNode.set(s.node, s));
    const edgeSet = new Set(
      EDGES.map(([a, b]) => (a < b ? `${a}|${b}` : `${b}|${a}`))
    );
    const glowPairs = new Map<string, [FigureNode, FigureNode][]>();
    STARS.forEach((s) => {
      const pairs: [FigureNode, FigureNode][] = [];
      (s.connectsTo ?? []).forEach((otherId) => {
        const other = STARS.find((o) => o.id === otherId);
        if (!other) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(`content: "${s.id}" connectsTo unknown id "${otherId}"`);
          }
          return;
        }
        const key =
          s.node < other.node
            ? `${s.node}|${other.node}`
            : `${other.node}|${s.node}`;
        if (!edgeSet.has(key)) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              `content: "${s.id}" and "${otherId}" do not share an edge in figure.ts`
            );
          }
          return;
        }
        pairs.push([NODE_BY_ID[s.node], NODE_BY_ID[other.node]]);
      });
      glowPairs.set(s.id, pairs);
    });
    return { contentByNode, glowPairs };
  }, []);

  const glowLines = hoveredId ? glowPairs.get(hoveredId) ?? [] : [];

  // When a panel opens, the hover name is redundant — clear it so it never
  // lingers behind/after the side panel.
  useEffect(() => {
    if (activeId) {
      setHoveredId(null);
      setLabel(null);
    }
  }, [activeId]);

  // The label is positioned from a one-time measurement, so drop it if the
  // window resizes mid-hover rather than leaving it floating in place.
  useEffect(() => {
    const onResize = () => {
      setHoveredId(null);
      setLabel(null);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function showLabel(content: StarContent) {
    const core = coreRefs.current[content.node];
    if (!core) return;
    const r = core.getBoundingClientRect();
    // Flip the label to the left of the star when it would run off the right.
    const flip = r.right + 160 > window.innerWidth;
    setLabel({
      text: content.name.toUpperCase(),
      color: INTERACTIVE.label,
      x: flip ? r.left - 14 : r.right + 14,
      y: r.top + r.height / 2,
      flip,
    });
  }

  function onStarEnter(content: StarContent) {
    if (!finePointer) return;
    setHoveredId(content.id);
    if (activeId !== content.id) showLabel(content);
  }
  function onStarLeave() {
    setHoveredId(null);
    setLabel(null);
  }

  return (
    <main
      id="sky-wrap"
      aria-label="Interactive constellation of Captain Moroni planting the Title of Liberty"
    >
      <p className="sr-only">
        Each brighter star is a button holding a story. Use Tab to move
        between stars and press Enter to open one.
      </p>
      <svg
        id="sky"
        className={
          activeSection ? "is-filtered" : activeId ? "is-dimmed" : undefined
        }
        viewBox={viewFor(isMobile ? PAD_MOBILE : PAD)}
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        onClick={(e) => {
          if ((e.target as Element).closest(".star")) return;
          // Touch: a near-miss tap opens the closest story star instead of
          // requiring a direct hit on the (scaled-down, tiny) hit circle.
          if (!finePointer) {
            let best: { content: StarContent; d: number } | null = null;
            for (const s of STARS) {
              const core = coreRefs.current[s.node];
              if (!core) continue;
              const r = core.getBoundingClientRect();
              const d = Math.hypot(
                e.clientX - (r.left + r.width / 2),
                e.clientY - (r.top + r.height / 2)
              );
              if (d <= NEAR_TAP_PX && (!best || d < best.d)) {
                best = { content: s, d };
              }
            }
            if (best) {
              onOpen(best.content);
              return;
            }
          }
          onBackgroundClick();
        }}
      >
        <defs>
          <radialGradient id="glow-fig">
            <stop offset="0%" stopColor="#dcebff" stopOpacity="1" />
            <stop offset="32%" stopColor="#5e93e6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3a6bc4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glow-blue">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="32%" stopColor="#8fc0ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#5e93e6" stopOpacity="0" />
          </radialGradient>
          {/* Four-point sparkle the selected star morphs into. */}
          <symbol id="sel-sparkle" viewBox="0 0 612 636">
            <g fill="currentColor">
              <path d="M290 273.628C294.842 271.303 300.268 270 305.999 270V0C301.83 107.341 302.5 199 290 273.628Z" />
              <path d="M305.999 344C300.268 344 294.842 342.697 290 340.372C301.5 420 303.174 519.51 305.999 635.5V344Z" />
              <path d="M269.334 302C269.113 303.635 268.999 305.304 268.999 307C268.999 308.696 269.113 310.365 269.334 312C269.911 316.275 271.219 320.318 273.127 324C274.227 326.122 275.514 328.11 277 329.982C279.027 332.536 281.38 334.812 284 336.753C285.872 338.139 287.88 339.353 290 340.372C294.842 342.697 300.268 344 305.999 344V273.628V270C300.268 270 294.842 271.303 290 273.628C287.88 274.647 285.872 275.861 284 277.247C281.38 279.188 279.025 281.466 277 284.018C275.526 285.876 274.227 287.878 273.127 290C271.219 293.682 269.911 297.725 269.334 302Z" />
              <path d="M268.999 307C268.999 305.304 269.113 303.635 269.334 302C269.911 297.725 271.219 293.682 273.127 290C244 307 109.165 303.046 0 307C106.661 310.385 243 307 273.127 324C271.219 320.318 269.911 316.275 269.334 312C269.113 310.365 268.999 308.696 268.999 307Z" />
              <path d="M187 183C187 183 252.5 252 277 284.018C279.025 281.466 281.38 279.188 284 277.247C253 251 187 183 187 183Z" />
              <path d="M277 329.982C256.5 353.5 222.147 381.494 187 414.5C187 414.5 258 354 284 336.753C281.38 334.812 279.027 332.536 277 329.982Z" />
              <path d="M322 273.628C317.158 271.303 311.732 270 306.001 270V0C310.17 107.341 309.5 199 322 273.628Z" />
              <path d="M306.001 344C311.732 344 317.158 342.697 322 340.372C310.5 420 308.826 519.51 306.001 635.5V344Z" />
              <path d="M342.666 302C342.887 303.635 343.001 305.304 343.001 307C343.001 308.696 342.887 310.365 342.666 312C342.089 316.275 340.781 320.318 338.873 324C337.773 326.122 336.486 328.11 335 329.982C332.973 332.536 330.62 334.812 328 336.753C326.128 338.139 324.12 339.353 322 340.372C317.158 342.697 311.732 344 306.001 344V273.628V270C311.732 270 317.158 271.303 322 273.628C324.12 274.647 326.128 275.861 328 277.247C330.62 279.188 332.975 281.466 335 284.018C336.474 285.876 337.773 287.878 338.873 290C340.781 293.682 342.089 297.725 342.666 302Z" />
              <path d="M343.001 307C343.001 305.304 342.887 303.635 342.666 302C342.089 297.725 340.781 293.682 338.873 290C368 307 502.835 303.046 612 307C505.339 310.385 369 307 338.873 324C340.781 320.318 342.089 316.275 342.666 312C342.887 310.365 343.001 308.696 343.001 307Z" />
              <path d="M425 183C425 183 359.5 252 335 284.018C332.975 281.466 330.62 279.188 328 277.247C359 251 425 183 425 183Z" />
              <path d="M335 329.982C355.5 353.5 389.853 381.494 425 414.5C425 414.5 354 354 328 336.753C330.62 334.812 332.973 332.536 335 329.982Z" />
            </g>
          </symbol>
        </defs>

        {/* Constellation lines — the exact vector-87 art (curves and all),
            shifted into the stars' coordinate space. */}
        <g
          id="edges"
          transform={`translate(${EDGE_OFFSET.x} ${EDGE_OFFSET.y})`}
        >
          <path className="edges-path" d={EDGE_PATH} />
        </g>

        {/* Brighten the line(s) between a hovered story and its relatives. */}
        <g id="glow-lines">
          {glowLines.map(([a, b], i) => (
            <line
              key={i}
              className="edge edge--glow"
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
            />
          ))}
        </g>

        {/* Stars */}
        <g id="figure-stars">
          {NODES.map((n) => {
            const content = contentByNode.get(n.id) ?? null;
            const isHot = !!content;
            const coreR = isHot ? interactiveR : n.r;
            const style = {
              ["--tw-dur" as string]: `${(3 + hash(n.id + "d") * 4.5).toFixed(2)}s`,
              ["--tw-delay" as string]: `${(-hash(n.id + "y") * 7).toFixed(2)}s`,
              ["--base-op" as string]: isHot
                ? "1"
                : (0.72 + hash(n.id + "o") * 0.28).toFixed(2),
              ["--pulse-dur" as string]: `${(5.5 + hash(n.id + "p") * 1.5).toFixed(2)}s`,
              ["--pulse-delay" as string]: `${(-hash(n.id + "q") * 6).toFixed(2)}s`,
            } as React.CSSProperties;

            const isMatch =
              !!content && !!activeSection && content.section === activeSection;
            const className =
              "star" +
              (isHot ? " star--interactive" : "") +
              (activeId === content?.id ? " is-active" : "") +
              (isMatch ? " star--match" : "");

            const interactiveProps = content
              ? {
                  role: "button",
                  tabIndex: 0,
                  "aria-label": `${content.name} — ${content.subtitle}`,
                  onClick: () => onOpen(content),
                  onKeyDown: (e: React.KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onOpen(content);
                    }
                  },
                  onPointerEnter: () => onStarEnter(content),
                  onPointerLeave: onStarLeave,
                  onFocus: (e: React.FocusEvent) => {
                    // Only show the name for keyboard focus — not the
                    // programmatic focus restore after closing the panel.
                    if (e.currentTarget.matches(":focus-visible")) {
                      setHoveredId(content.id);
                      showLabel(content);
                    }
                  },
                  onBlur: onStarLeave,
                }
              : {};

            return (
              <g
                key={n.id}
                className={className}
                data-id={n.id}
                style={style}
                {...interactiveProps}
              >
                <circle
                  className="halo"
                  cx={n.x}
                  cy={n.y}
                  r={(coreR * (isHot ? 3 : 2.4)).toFixed(1)}
                  fill={isHot ? INTERACTIVE.glow : "url(#glow-fig)"}
                />
                <circle
                  className="core"
                  cx={n.x}
                  cy={n.y}
                  r={coreR}
                  fill={isHot ? INTERACTIVE.core : "#dcebff"}
                  ref={(el) => {
                    coreRefs.current[n.id] = el;
                  }}
                />
                {isHot && (
                  <use
                    className="sparkle"
                    href="#sel-sparkle"
                    x={(n.x - SPARKLE_W / 2).toFixed(2)}
                    y={(n.y - SPARKLE_H / 2).toFixed(2)}
                    width={SPARKLE_W}
                    height={SPARKLE_H.toFixed(2)}
                  />
                )}
                {isHot && (
                  <circle
                    className="hit"
                    cx={n.x}
                    cy={n.y}
                    r={Math.max(20, coreR + 14)}
                    fill="transparent"
                  />
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Hover annotation (star-chart style) */}
      {label && finePointer && (
        <div
          className={"star-label is-visible" + (label.flip ? " flip" : "")}
          aria-hidden="true"
          style={{ left: label.x, top: label.y, color: label.color }}
        >
          {label.text}
        </div>
      )}
    </main>
  );
}
