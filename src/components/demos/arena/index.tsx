"use client";

import { useEffect, useRef, useState } from "react";
import { canSee, createWorld, mulberry32, step, type World } from "./engine";

const C = {
  ink: "#0a0a0b",
  surface: "#121214",
  surface2: "#18181b",
  line: "#232326",
  line2: "#2e2e33",
  text: "#f2f1ec",
  muted: "#8b8b90",
  dim: "#5c5c62",
  accent: "#d4ff3a",
  accentDeep: "#8fbf00",
};

function draw(ctx: CanvasRenderingContext2D, w: World, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  const pad = 10;
  const sx = (width - pad * 2) / w.W;
  const sy = (height - pad * 2) / w.H;
  const s = Math.min(sx, sy);
  const ox = (width - w.W * s) / 2;
  const oy = (height - w.H * s) / 2;
  const X = (x: number) => ox + x * s;
  const Y = (y: number) => oy + y * s;

  // floor grid
  ctx.fillStyle = C.surface;
  ctx.fillRect(X(0), Y(0), w.W * s, w.H * s);
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= w.W; gx += 10) {
    ctx.beginPath();
    ctx.moveTo(X(gx), Y(0));
    ctx.lineTo(X(gx), Y(w.H));
    ctx.stroke();
  }
  for (let gy = 0; gy <= w.H; gy += 10) {
    ctx.beginPath();
    ctx.moveTo(X(0), Y(gy));
    ctx.lineTo(X(w.W), Y(gy));
    ctx.stroke();
  }
  ctx.strokeStyle = C.line2;
  ctx.strokeRect(X(0), Y(0), w.W * s, w.H * s);

  // vision cones
  for (const a of w.agents) {
    if (a.role !== "seeker" || w.phase === "prep") continue;
    ctx.beginPath();
    ctx.moveTo(X(a.pos.x), Y(a.pos.y));
    ctx.arc(X(a.pos.x), Y(a.pos.y), 30 * s, a.heading - 0.9, a.heading + 0.9);
    ctx.closePath();
    ctx.fillStyle = "rgba(242,241,236,0.05)";
    ctx.fill();
  }

  // ramps
  for (const r of w.ramps) {
    ctx.beginPath();
    ctx.moveTo(X(r.x - r.r), Y(r.y + r.r));
    ctx.lineTo(X(r.x + r.r), Y(r.y + r.r));
    ctx.lineTo(X(r.x + r.r), Y(r.y - r.r));
    ctx.closePath();
    ctx.fillStyle = C.line2;
    ctx.fill();
  }
  // boxes
  for (const b of w.boxes) {
    ctx.fillStyle = w.phase === "prep" ? C.muted : C.line2;
    ctx.fillRect(X(b.x), Y(b.y), b.w * s, b.h * s);
    ctx.strokeStyle = C.dim;
    ctx.strokeRect(X(b.x), Y(b.y), b.w * s, b.h * s);
  }
  // sight lines when caught
  for (const h of w.agents) {
    if (h.role !== "hider" || !h.caught) continue;
    for (const sk of w.agents) {
      if (sk.role === "seeker" && canSee(sk, h, w.boxes)) {
        ctx.strokeStyle = "rgba(242,241,236,0.35)";
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(X(sk.pos.x), Y(sk.pos.y));
        ctx.lineTo(X(h.pos.x), Y(h.pos.y));
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }
  // agents
  for (const a of w.agents) {
    const r = Math.max(2.5, 1.6 * s);
    ctx.beginPath();
    ctx.arc(X(a.pos.x), Y(a.pos.y), r, 0, Math.PI * 2);
    if (a.role === "hider") {
      ctx.fillStyle = a.caught ? C.dim : C.accent;
      ctx.fill();
      if (!a.caught) {
        ctx.strokeStyle = "rgba(212,255,58,0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(X(a.pos.x), Y(a.pos.y), r * 2.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = C.text;
      ctx.fill();
      ctx.strokeStyle = C.text;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(X(a.pos.x), Y(a.pos.y));
      ctx.lineTo(X(a.pos.x) + Math.cos(a.heading) * r * 2.4, Y(a.pos.y) + Math.sin(a.heading) * r * 2.4);
      ctx.stroke();
    }
  }
}

export default function ArenaDemo({ mode = "tile" }: { mode?: "tile" | "full" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<World>(createWorld(7));
  const [hud, setHud] = useState({ phase: "prep", ep: 1, reward: 0, hidden: 2, t: 0 });
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = true;
    let raf = 0;
    let last = performance.now();
    let hudAt = 0;
    const rnd = mulberry32(99);

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const { width, height } = wrap.getBoundingClientRect();
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(ctx, worldRef.current, width, height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      last = performance.now();
    });
    io.observe(wrap);

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000) * speed;
      last = now;
      if (!visible || document.hidden || paused) return;
      const w = worldRef.current;
      if (w.phase === "done") {
        if (w.t - w.prepT - w.seekT > 1.6) worldRef.current = createWorld(7, w.episode + 1);
        else w.t += dt;
      } else step(w, dt, rnd);
      const { width, height } = wrap.getBoundingClientRect();
      draw(ctx, worldRef.current, width, height);
      if (now - hudAt > 120) {
        hudAt = now;
        const cw = worldRef.current;
        setHud({
          phase: cw.phase,
          ep: cw.episode,
          reward: cw.reward,
          hidden: cw.agents.filter((a) => a.role === "hider" && !a.caught).length,
          t: cw.phase === "prep" ? cw.prepT - cw.t : Math.max(0, cw.seekT - (cw.t - cw.prepT)),
        });
      }
    };
    if (reduce) {
      const w = worldRef.current;
      for (let i = 0; i < 260; i++) step(w, 0.05, rnd);
      resize();
    } else raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [paused, speed]);

  useEffect(() => {
    if (mode !== "full") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      }
      if (e.key.toLowerCase() === "r") worldRef.current = createWorld(7, worldRef.current.episode + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  const phaseLabel = hud.phase === "prep" ? "PREP" : hud.phase === "seek" ? "SEEK" : "EPISODE OVER";
  const readout = (
    <div className="pointer-events-none flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-widest text-dim">
      <span className="text-accent">EP {String(hud.ep).padStart(3, "0")}</span>
      <span>{phaseLabel}</span>
      <span className="num">{hud.t.toFixed(1)}s</span>
      <span>
        HIDDEN <span className="num text-text">{hud.hidden}/2</span>
      </span>
      <span>
        HIDER REWARD <span className={`num ${hud.reward >= 0 ? "text-accent" : "text-muted"}`}>{hud.reward >= 0 ? "+" : ""}{hud.reward.toFixed(1)}</span>
      </span>
    </div>
  );

  if (mode === "tile") {
    return (
      <div ref={wrapRef} className="absolute inset-0">
        <canvas ref={canvasRef} className="absolute inset-0" aria-label="Hide-and-seek arena replay" />
        <div className="absolute bottom-3 left-4 right-4">{readout}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[480px] flex-col">
      <div ref={wrapRef} className="relative flex-1">
        <canvas ref={canvasRef} className="absolute inset-0" aria-label="Hide-and-seek arena replay" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-4">
        {readout}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className={`rounded-full border px-3 py-1.5 font-mono text-[12px] ${paused ? "border-line-2 text-text hover:border-text" : "border-accent bg-accent text-accent-ink"}`}
          >
            {paused ? "Play" : "Pause"}
          </button>
          <button
            type="button"
            onClick={() => (worldRef.current = createWorld(7, worldRef.current.episode + 1))}
            className="rounded-full border border-line-2 px-3 py-1.5 font-mono text-[12px] text-text hover:border-text"
          >
            Next episode
          </button>
          <button
            type="button"
            onClick={() => setSpeed((s) => (s === 1 ? 3 : 1))}
            className="rounded-full border border-line-2 px-3 py-1.5 font-mono text-[12px] text-text hover:border-text"
          >
            {speed}×
          </button>
        </div>
      </div>
      <p className="border-t border-line px-5 py-3 font-mono text-[11px] leading-relaxed text-dim">
        Scripted replay of the environment: hiders drag boxes into a shelter during prep, then seekers are released with
        vision cones and line-of-sight checks. The trained PPO policies run in Webots, not in your browser.
      </p>
    </div>
  );
}
