"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  DELTA_THRESH,
  DynDEGA,
  FIXED_SWITCH_AT,
  LANDSCAPES,
  VAR_THRESH,
  type LandscapeId,
  type Snapshot,
} from "./engine";
import { Renderer } from "./draw";

/** 1× = 10 outer iterations per second. */
const STEP_MS = 100;
const MAX_STEPS_PER_FRAME = 6;
const RESTART_DELAY_MS = 1500;
const FLASH_MS = 1000;
const FIRST_SEED = 7;
/** Reduced motion: show the run a little after the switch so both phases read. */
const STATIC_FRAME_AFTER_SWITCH = 30;

type Speed = 1 | 3;

const BTN = "rounded-full border border-line-2 px-3 py-1.5 font-mono text-[12px] text-text transition-colors hover:border-text";
const BTN_ON = "bg-accent text-accent-ink border-accent hover:border-accent";

const REDUCED_MQ = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void): () => void {
  const mq = window.matchMedia(REDUCED_MQ);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const readReducedMotion = () => window.matchMedia(REDUCED_MQ).matches;
const readReducedMotionServer = () => false;

function pad3(n: number): string {
  return String(n).padStart(3, "0");
}

function fmtF(v: number): string {
  const a = Math.abs(v);
  if (a !== 0 && (a < 1e-3 || a >= 1e5)) return v.toExponential(2);
  return v.toFixed(a >= 100 ? 1 : 4);
}

function fmtDist(v: number): string {
  return v < 1e-3 ? v.toExponential(1) : v.toFixed(3);
}

export default function Demo({ mode = "tile" }: { mode?: "tile" | "full" }) {
  const full = mode === "full";
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const seedRef = useRef(FIRST_SEED);
  const playingRef = useRef(true);
  const speedRef = useRef<Speed>(1);

  const reduced = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, readReducedMotionServer);

  const [landscape, setLandscape] = useState<LandscapeId>("rastrigin");
  const [fixed, setFixed] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [playing, setPlaying] = useState(true);
  const [runId, setRunId] = useState(0);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const restart = useCallback(() => {
    seedRef.current += 1;
    setRunId((r) => r + 1);
  }, []);

  // Simulation + render loop. Re-created on landscape / schedule / restart.
  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const renderer = Renderer.create(canvas);
    if (!renderer) return;

    const makeEngine = () =>
      new DynDEGA({ landscape, seed: seedRef.current, fixedSwitchAt: fixed ? FIXED_SWITCH_AT : null });
    let engine = makeEngine();

    const dpr = () => Math.min(2, window.devicePixelRatio || 1);

    if (reduced) {
      // One representative static frame: shortly after the switch.
      while (!engine.done && (engine.switchedAt === null || engine.gen < engine.switchedAt + STATIC_FRAME_AFTER_SWITCH)) {
        engine.step();
      }
      const paint = () => {
        const r = host.getBoundingClientRect();
        renderer.resize(r.width, r.height, dpr());
        renderer.draw(engine);
      };
      const ro = new ResizeObserver(paint);
      ro.observe(host);
      const raf = requestAnimationFrame(() => {
        paint();
        setSnap(engine.snapshot());
        setFlashing(false);
      });
      return () => {
        ro.disconnect();
        cancelAnimationFrame(raf);
      };
    }

    let raf = 0;
    let last = 0;
    let acc = 0;
    let dirty = true;
    let doneAt = 0;
    let flashUntil = 0;
    let flashShown = false;
    let visible = true;

    const publish = () => setSnap(engine.snapshot());

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = last === 0 ? 0 : Math.min(now - last, 250);
      last = now;

      let stepped = false;
      if (playingRef.current && !engine.done) {
        acc += dt;
        const stepMs = STEP_MS / speedRef.current;
        let n = 0;
        while (acc >= stepMs && n < MAX_STEPS_PER_FRAME) {
          const wasGGA = engine.switchedAt === null;
          engine.step();
          if (wasGGA && engine.switchedAt !== null) flashUntil = now + FLASH_MS;
          acc -= stepMs;
          n++;
          stepped = true;
        }
        if (n === MAX_STEPS_PER_FRAME) acc = 0;
      } else {
        acc = 0;
      }

      if (engine.done) {
        if (doneAt === 0) doneAt = now;
        else if (playingRef.current && now - doneAt >= RESTART_DELAY_MS) {
          seedRef.current += 1;
          engine = makeEngine();
          doneAt = 0;
          stepped = true;
        }
      }

      const flashNow = now < flashUntil;
      if (flashNow !== flashShown) {
        flashShown = flashNow;
        setFlashing(flashNow);
      }

      if (stepped || dirty) {
        renderer.draw(engine, now);
        dirty = false;
      }
      if (stepped) publish();
    };

    const start = () => {
      if (raf === 0) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const sync = () => {
      if (visible && !document.hidden) start();
      else stop();
    };

    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (!r) return;
      renderer.resize(r.width, r.height, dpr());
      dirty = true;
      if (raf === 0) renderer.draw(engine);
    });
    ro.observe(host);

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
        sync();
      },
      { threshold: 0 },
    );
    io.observe(host);
    document.addEventListener("visibilitychange", sync);

    // First paint straight away so the tile is never blank.
    const r0 = host.getBoundingClientRect();
    renderer.resize(r0.width, r0.height, dpr());
    renderer.draw(engine);
    const first = requestAnimationFrame(publish);
    sync();

    return () => {
      stop();
      cancelAnimationFrame(first);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [landscape, fixed, runId, reduced]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!full) return;
    const onButton = (e.target as HTMLElement).tagName === "BUTTON";
    if (e.key === " " && !onButton) {
      e.preventDefault();
      setPlaying((p) => !p);
    } else if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      restart();
    }
  };

  const gen = snap?.gen ?? 0;
  const phase = snap?.phase ?? "GGA";
  const switchedAt = snap?.switchedAt ?? null;

  const stage = (
    <div ref={hostRef} className="absolute inset-0 overflow-hidden bg-ink" data-seed={snap?.seed ?? FIRST_SEED}>
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden />
      <div
        className={`pointer-events-none absolute left-3 top-3 rounded-md bg-ink/70 px-2 py-1 font-mono text-[11px] uppercase tracking-widest backdrop-blur-[2px] ${
          switchedAt === null ? "text-muted" : "text-accent"
        }`}
        aria-live="off"
      >
        <span className="num">GEN {pad3(gen)}</span> · {phase}
        {switchedAt !== null ? (
          <>
            {" "}
            · SWITCHED @ <span className="num">{switchedAt}</span>
          </>
        ) : null}
      </div>
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 bg-accent px-3 py-1.5 text-center font-mono text-[11px] uppercase tracking-widest text-accent-ink transition-opacity duration-200 ${
          flashing ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!flashing}
      >
        {fixed ? "FIXED SWITCH @ 50% → STEADY-STATE" : "METHOD 2 FIRED → STEADY-STATE"}
      </div>
    </div>
  );

  if (!full) return stage;

  return (
    <div
      className="flex flex-col gap-3 outline-none"
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label="DynDEGA live demo. Space toggles play, R restarts."
    >
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_224px]">
        <div className="relative h-[340px] overflow-hidden rounded-xl border border-line md:h-[480px]">{stage}</div>
        <aside className="grid grid-cols-2 gap-3 md:grid-cols-1 md:content-start">
          <Sparkline
            label="δ̄ / δ_ref"
            threshold={DELTA_THRESH}
            values={snap?.deltaRatioHistory ?? []}
            switchedAt={switchedAt}
            current={snap?.deltaRatio ?? null}
          />
          <Sparkline
            label="v / v_ref"
            threshold={VAR_THRESH}
            values={snap?.varRatioHistory ?? []}
            switchedAt={switchedAt}
            current={snap?.varRatio ?? null}
          />
          <dl className="col-span-2 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-line pt-3 md:col-span-1">
            <Readout label="best f" value={snap ? fmtF(snap.bestF) : "—"} />
            <Readout label="dist → opt" value={snap ? fmtDist(snap.distToOpt) : "—"} />
            <Readout label="generation" value={pad3(gen)} />
            <Readout label="switched @" value={switchedAt === null ? "—" : String(switchedAt)} />
          </dl>
        </aside>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Landscape">
          {LANDSCAPES.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`${BTN} ${landscape === l.id ? BTN_ON : ""}`}
              aria-pressed={landscape === l.id}
              onClick={() => setLandscape(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
        <span className="hidden h-5 w-px bg-line-2 sm:block" aria-hidden />
        <button type="button" className={BTN} onClick={restart}>
          Restart
        </button>
        <button type="button" className={BTN} onClick={() => setPlaying((p) => !p)} disabled={reduced}>
          {playing ? "Pause" : "Play"}
        </button>
        <div className="flex gap-1.5" role="group" aria-label="Speed">
          {([1, 3] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`${BTN} ${speed === s ? BTN_ON : ""}`}
              aria-pressed={speed === s}
              onClick={() => setSpeed(s)}
            >
              {s}×
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`${BTN} ${fixed ? BTN_ON : ""}`}
          aria-pressed={fixed}
          onClick={() => setFixed((f) => !f)}
        >
          Fixed switch @ 50%
        </button>
        <span className="ml-auto font-mono text-[11px] uppercase tracking-widest text-dim">space · play — r · restart</span>
      </div>
    </div>
  );
}

/* ---------------- readouts ---------------- */

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-widest text-dim">{label}</dt>
      <dd className="num mt-0.5 text-[13px] text-text">{value}</dd>
    </div>
  );
}

const SPARK_W = 200;
const SPARK_H = 44;
const SPARK_MIN_X = 170;
const LOG_LO = -3;
const LOG_HI = 0.5;

function sparkY(v: number): number {
  const l = Math.max(LOG_LO, Math.min(LOG_HI, Math.log10(Math.max(v, 1e-12))));
  return SPARK_H - 2 - ((l - LOG_LO) / (LOG_HI - LOG_LO)) * (SPARK_H - 4);
}

function polyline(values: readonly (number | null)[], from: number, to: number, xScale: number): string {
  const pts: string[] = [];
  for (let i = from; i <= to; i++) {
    const v = values[i];
    if (v === null || v === undefined || !Number.isFinite(v)) continue;
    pts.push(`${(i * xScale).toFixed(1)},${sparkY(v).toFixed(1)}`);
  }
  return pts.join(" ");
}

function Sparkline({
  label,
  threshold,
  values,
  switchedAt,
  current,
}: {
  label: string;
  threshold: number;
  values: readonly (number | null)[];
  switchedAt: number | null;
  current: number | null;
}) {
  const n = values.length;
  const xScale = SPARK_W / Math.max(SPARK_MIN_X, n - 1);
  const split = switchedAt === null ? n - 1 : switchedAt;
  const pre = polyline(values, 0, Math.min(split, n - 1), xScale);
  const post = switchedAt === null ? "" : polyline(values, switchedAt, n - 1, xScale);
  const ty = sparkY(threshold);
  const under = current !== null && current < threshold;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-dim">{label}</span>
        <span className={`num text-[11px] ${under ? "text-accent" : "text-muted"}`}>
          {current === null ? "—" : current.toExponential(1)}
          <span className="text-dim"> / {threshold}</span>
        </span>
      </div>
      <svg
        viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
        preserveAspectRatio="none"
        className="mt-1 block h-11 w-full rounded-md border border-line bg-surface"
        aria-hidden
      >
        <line x1={0} x2={SPARK_W} y1={ty} y2={ty} stroke="#5c5c62" strokeWidth={1} strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
        {switchedAt !== null ? (
          <line
            x1={switchedAt * xScale}
            x2={switchedAt * xScale}
            y1={0}
            y2={SPARK_H}
            stroke="#d4ff3a"
            strokeOpacity={0.35}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        {pre ? <polyline points={pre} fill="none" stroke="#8b8b90" strokeWidth={1.25} vectorEffect="non-scaling-stroke" /> : null}
        {post ? <polyline points={post} fill="none" stroke="#d4ff3a" strokeWidth={1.25} vectorEffect="non-scaling-stroke" /> : null}
      </svg>
    </div>
  );
}
