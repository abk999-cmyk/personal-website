"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { PRODUCTION, STAGE_NAMES, buildSchedule, formatInt } from "./engine";
import { LEGEND, type Mode } from "./draw";
import { Player, type Readout } from "./player";

const SEED = 7;
const TILE_ROWS = 18;
const FULL_ROWS = 32;
/** Wall-clock for one full solve at 1x. */
const TILE_MS = 16_000;
const FULL_MS = 24_000;
const HOLD_MS = 2_000;
/** Solver stages 1..7 shown in the progress bar; stage 0 is the pre-fill. */
const SEGMENTS = 7;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void): () => void {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
function getReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
function getReducedMotionServer(): boolean {
  return false;
}

const LABEL = "font-mono text-[11px] uppercase tracking-widest text-dim";
const BUTTON =
  "rounded-full border border-line-2 px-3 py-1.5 font-mono text-[12px] text-text hover:border-text";
const BUTTON_PRIMARY =
  "rounded-full border border-accent bg-accent px-3 py-1.5 font-mono text-[12px] text-accent-ink";

function setText(el: HTMLElement | null, text: string): void {
  if (el && el.textContent !== text) el.textContent = text;
}

export default function Demo({ mode = "tile" }: { mode?: Mode }) {
  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getReducedMotionServer);
  const [playing, setPlaying] = useState(true);
  const [ended, setEnded] = useState(false);
  const [speed, setSpeed] = useState<1 | 3>(1);
  const [showChecks, setShowChecks] = useState(false);

  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const stageNumRef = useRef<HTMLSpanElement>(null);
  const stageNameRef = useRef<HTMLSpanElement>(null);
  const assignRef = useRef<HTMLSpanElement>(null);
  const happyRef = useRef<HTMLSpanElement>(null);
  const checksRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const segRefs = useRef<(HTMLDivElement | null)[]>([]);
  const playerRef = useRef<Player | null>(null);
  const controlsRef = useRef({ playing: true, speed: 1, showChecks: false });

  // Mirror control state into the player without rebuilding it.
  useEffect(() => {
    controlsRef.current = { playing, speed, showChecks };
    const player = playerRef.current;
    if (!player) return;
    player.setPlaying(playing);
    player.setSpeed(speed);
    player.setShowChecks(showChecks);
  }, [playing, speed, showChecks]);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;

    const solve = buildSchedule(SEED, mode === "tile" ? TILE_ROWS : FULL_ROWS);
    const player = new Player({
      mode,
      solve,
      canvas,
      durationMs: mode === "tile" ? TILE_MS : FULL_MS,
      holdMs: HOLD_MS,
      loop: mode === "tile",
      reducedMotion: reduced,
      onFrame: (r: Readout) => {
        setText(stageNumRef.current, `${r.stage}/${SEGMENTS}`);
        setText(stageNameRef.current, STAGE_NAMES[r.stage]);
        setText(assignRef.current, formatInt(r.assignments));
        setText(happyRef.current, r.happiness < 0 ? "—" : `${r.happiness}%`);
        setText(checksRef.current, formatInt(r.checks));
        setText(timeRef.current, `T+${r.elapsed}`);
        for (let i = 0; i < SEGMENTS; i++) {
          const el = segRefs.current[i];
          if (!el) continue;
          const stage = i + 1;
          const pct = r.stage > stage ? 100 : r.stage === stage ? Math.round(r.stageFraction * 100) : 0;
          const width = `${pct}%`;
          if (el.style.width !== width) el.style.width = width;
        }
      },
      onEnded: () => {
        setPlaying(false);
        setEnded(true);
      },
    });
    playerRef.current = player;
    const controls = controlsRef.current;
    player.setPlaying(controls.playing);
    player.setSpeed(controls.speed);
    player.setShowChecks(controls.showChecks);
    player.setFont(getComputedStyle(box).fontFamily || "ui-monospace, SFMono-Regular, Menlo, monospace");

    const measure = () => {
      const rect = box.getBoundingClientRect();
      const readout = readoutRef.current;
      const inset = mode === "tile" && readout ? readout.offsetHeight + 12 : 0;
      player.resize(rect.width, rect.height, Math.min(window.devicePixelRatio || 1, 2), inset);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    if (readoutRef.current) ro.observe(readoutRef.current);
    measure();

    let visible = true;
    const updateActive = () => player.setActive(visible && !document.hidden);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible = e.isIntersecting;
        updateActive();
      },
      { threshold: 0 },
    );
    io.observe(box);
    document.addEventListener("visibilitychange", updateActive);

    const restart = () => {
      player.restart();
      setEnded(false);
      setPlaying(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!visible || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target instanceof HTMLElement ? e.target : null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(target.tagName))) {
        return;
      }
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (player.ended) restart();
        else setPlaying((v) => !v);
      } else if (e.key === "r" || e.key === "R") {
        restart();
      }
    };
    if (mode === "full") window.addEventListener("keydown", onKey);

    return () => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", updateActive);
      if (mode === "full") window.removeEventListener("keydown", onKey);
      player.destroy();
      playerRef.current = null;
    };
  }, [mode, reduced]);

  const onPlayPause = () => {
    const player = playerRef.current;
    if (player && player.ended) {
      player.restart();
      setEnded(false);
      setPlaying(true);
      return;
    }
    setPlaying((v) => !v);
  };
  const onRestart = () => {
    playerRef.current?.restart();
    setEnded(false);
    setPlaying(true);
  };

  const readout = (
    <>
      <span>
        Stage{" "}
        <span ref={stageNumRef} className="num text-text">
          0/{SEGMENTS}
        </span>
      </span>
      <span aria-hidden="true">&middot;</span>
      <span ref={stageNameRef} className="text-muted">
        {STAGE_NAMES[0]}
      </span>
      <span aria-hidden="true">&middot;</span>
      <span>
        Assignments{" "}
        <span ref={assignRef} className="num text-text">
          0
        </span>
      </span>
      <span aria-hidden="true">&middot;</span>
      <span>
        Happiness{" "}
        <span ref={happyRef} className="num text-text">
          &mdash;
        </span>
      </span>
      {mode === "full" && (
        <>
          <span aria-hidden="true">&middot;</span>
          <span>
            Checks{" "}
            <span ref={checksRef} className="num text-text">
              0
            </span>
          </span>
        </>
      )}
      <span aria-hidden="true">&middot;</span>
      <span ref={timeRef} className="num text-text">
        T+0:00
      </span>
    </>
  );

  if (mode === "tile") {
    return (
      <div
        ref={boxRef}
        className="absolute inset-0 overflow-hidden bg-surface font-mono"
        role="img"
        aria-label="Animated annual physician schedule being solved stage by stage"
      >
        <canvas ref={canvasRef} className="block" />
        <div
          ref={readoutRef}
          className={`pointer-events-none absolute bottom-3 left-4 right-4 flex flex-wrap gap-x-2 gap-y-0.5 ${LABEL}`}
        >
          {readout}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full font-mono" role="group" aria-label="MaineHealth physician scheduler solve demo">
      <div
        ref={boxRef}
        className="relative h-[260px] w-full overflow-hidden rounded-lg border border-line bg-surface sm:h-[380px] md:h-[420px]"
      >
        <canvas ref={canvasRef} className="block" aria-hidden="true" />
      </div>
      <div className="mt-3 flex flex-col gap-3">
        <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${LABEL}`}>{readout}</div>
        {!reduced && (
          <div className="flex gap-1" aria-hidden="true">
            {Array.from({ length: SEGMENTS }, (_, i) => (
              <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-line-2">
                <div
                  ref={(el) => {
                    segRefs.current[i] = el;
                  }}
                  className="h-full w-0 bg-accent"
                />
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          {reduced ? (
            <p className={LABEL}>Reduced motion &middot; showing the finished schedule</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button type="button" className={BUTTON_PRIMARY} onClick={onPlayPause}>
                {ended ? "Replay" : playing ? "Pause" : "Play"}
              </button>
              <button type="button" className={BUTTON} onClick={onRestart}>
                Restart
              </button>
              <button
                type="button"
                className={BUTTON}
                onClick={() => setSpeed((s) => (s === 1 ? 3 : 1))}
                aria-label={`Speed ${speed}x, switch to ${speed === 1 ? 3 : 1}x`}
              >
                Speed {speed}&times;
              </button>
              <button
                type="button"
                className={`${BUTTON} ${showChecks ? "border-muted" : ""}`}
                aria-pressed={showChecks}
                onClick={() => setShowChecks((v) => !v)}
              >
                <span
                  aria-hidden="true"
                  className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${showChecks ? "bg-accent" : "bg-line-2"}`}
                />
                Show constraint checks
              </button>
            </div>
          )}
          <ul className={`flex flex-wrap gap-x-3 gap-y-1 ${LABEL}`}>
            {LEGEND.map((entry) => (
              <li key={entry.label} className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 rounded-[2px]"
                  style={{ background: entry.color }}
                />
                {entry.label}
              </li>
            ))}
          </ul>
        </div>
        <p className={LABEL}>
          1 cell = 1 physician-week &middot; {FULL_ROWS} of {PRODUCTION.physicians} physicians shown &middot;
          production run: {PRODUCTION.assignments} weekly assignments across {PRODUCTION.services} services &middot;{" "}
          {PRODUCTION.happiness}% happiness &middot; {PRODUCTION.solveTime} solve
        </p>
      </div>
    </div>
  );
}
