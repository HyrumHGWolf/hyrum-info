"use client";

import dynamic from "next/dynamic";

/** Client-only sky (constellation, guide, panel). Static chrome lives in page.tsx. */
const Sky = dynamic(() => import("./Sky"), { ssr: false });

export default function SkyLoader() {
  return <Sky />;
}
