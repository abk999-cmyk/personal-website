"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LatentField = dynamic(() => import("./latent-field").then((m) => m.LatentField), {
  ssr: false,
  loading: () => <Poster />,
});

/** Static fallback: reduced motion, no WebGL, or while the field loads. */
function Poster() {
  return (
    <div className="absolute inset-0">
      <div className="grid-bg absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_70%_35%,black,transparent_70%)]" />
      <div className="absolute right-[-10%] top-[10%] h-[60vmin] w-[60vmin] rounded-full bg-accent/10 blur-[120px]" />
    </div>
  );
}

export function HeroField() {
  const [mode, setMode] = useState<"pending" | "3d" | "poster">("pending");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let gl: RenderingContext | null = null;
    try {
      const c = document.createElement("canvas");
      gl = c.getContext("webgl2") || c.getContext("webgl");
    } catch {
      gl = null;
    }
    setMode(!reduce && gl ? "3d" : "poster");
  }, []);

  return (
    <div className="absolute inset-0 -z-0">
      <Poster />
      {mode === "3d" ? <LatentField /> : null}
    </div>
  );
}
