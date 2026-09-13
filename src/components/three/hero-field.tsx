"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LatentField = dynamic(() => import("./latent-field").then((m) => m.LatentField), {
  ssr: false,
  loading: () => <Poster />,
});

/**
 * True when WebGL is available and not running on a software rasteriser
 * (SwiftShader, llvmpipe). Software GL would burn the main thread on 20k points.
 */
function hasHardwareWebGL() {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
    return !/swiftshader|llvmpipe|software|mesa offscreen/i.test(renderer);
  } catch {
    return false;
  }
}

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
    const mode = !reduce && hasHardwareWebGL() ? "3d" : "poster";
    // Let the hero text paint first; the poster covers the gap.
    const idle = typeof window.requestIdleCallback === "function"
      ? window.requestIdleCallback(() => setMode(mode), { timeout: 1500 })
      : window.setTimeout(() => setMode(mode), 400);
    return () => {
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle as number);
      else window.clearTimeout(idle as number);
    };
  }, []);

  return (
    <div className="absolute inset-0 -z-0">
      <Poster />
      {mode === "3d" ? <LatentField /> : null}
    </div>
  );
}
