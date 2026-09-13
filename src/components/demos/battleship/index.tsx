"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FLEET, Game, SIZE, SessionStats, canPlace, type Ship } from "./engine";
import { boardRect, cellAt, drawBoard, type BoardRect, type LastShot } from "./draw";

type Mode = "tile" | "full";
type Speed = "1x" | "4x" | "turbo";

const SEED_BASE = 0x1207;
const SAMPLES: Record<Mode, number> = { tile: 300, full: 800 };
const SPEED_MS: Record<Speed, number> = { "1x": 250, "4x": 62.5, turbo: 0 };
const WIN_HOLD_MS = 1200;
const TURBO_BUDGET_MS = 3.5;
const TURBO_MAX_STEPS = 12;
const STATIC_FRAME_MOVES = 28;
const BENCHMARK_MOVES = 42;
const TILE_PAD = 10;
const TILE_READOUT_H = 26;

const BTN_BASE =
  "rounded-full border px-3 py-1.5 font-mono text-[12px] disabled:cursor-not-allowed disabled:border-line disabled:text-dim";
const BTN = `${BTN_BASE} border-line-2 text-text hover:border-text disabled:hover:border-line`;
const BTN_ON = `${BTN_BASE} border-accent bg-accent text-accent-ink`;
const LABEL = "font-mono text-[11px] uppercase tracking-widest text-dim";

interface Placing {
  ships: Ship[];
  horiz: boolean;
  hover: number;
}

/** Everything the animation loop touches. Lives in a ref; never read during render. */
interface Sim {
  game: Game;
  stats: SessionStats;
  seed: number;
  samples: number;
  playing: boolean;
  speed: Speed;
  showHeat: boolean;
  placing: Placing | null;
  userFleet: boolean;
  lastShot: LastShot | null;
  wonAt: number | null;
  acc: number;
  lastT: number;
  visible: boolean;
  raf: number;
  ctx: CanvasRenderingContext2D | null;
  w: number;
  h: number;
  dpr: number;
}

/** Snapshot of the sim that the DOM readouts render from. */
interface Ui {
  sig: string;
  moves: number;
  shipsLeft: number;
  games: number;
  mean: number;
  history: number[];
  playing: boolean;
  placing: { count: number; horiz: boolean } | null;
  userFleet: boolean;
  won: boolean;
}

const INITIAL_UI: Ui = {
  sig: "",
  moves: 0,
  shipsLeft: FLEET.length,
  games: 0,
  mean: NaN,
  history: [],
  playing: true,
  placing: null,
  userFleet: false,
  won: false,
};

function createSim(mode: Mode): Sim {
  const samples = SAMPLES[mode];
  return {
    game: new Game(SEED_BASE, { samples }),
    stats: new SessionStats(),
    seed: SEED_BASE,
    samples,
    playing: true,
    speed: "1x",
    showHeat: true,
    placing: null,
    userFleet: false,
    lastShot: null,
    wonAt: null,
    acc: 0,
    lastT: 0,
    visible: false,
    raf: 0,
    ctx: null,
    w: 0,
    h: 0,
    dpr: 1,
  };
}

function startGame(sim: Sim, ships: readonly Ship[] | null): void {
  sim.seed++;
  sim.game = new Game(sim.seed, { ships: ships ?? undefined, samples: sim.samples });
  sim.userFleet = ships !== null;
  sim.wonAt = null;
  sim.lastShot = null;
  sim.acc = 0;
}

function fire(sim: Sim, t: number): void {
  const ev = sim.game.step();
  if (!ev) return;
  sim.lastShot = { idx: ev.idx, t, result: ev.result };
  if (ev.won) {
    sim.stats.record(sim.game.moves);
    sim.wonAt = t;
    // A visitor-placed fleet ends on the finished board instead of looping.
    if (sim.userFleet) sim.playing = false;
  }
}

function advance(sim: Sim, mode: Mode, t: number, dt: number): void {
  const g = sim.game;
  if (g.isWon()) {
    if (sim.wonAt === null) sim.wonAt = t;
    else if (t - sim.wonAt >= WIN_HOLD_MS) startGame(sim, null);
    return;
  }
  if (mode === "full" && sim.speed === "turbo") {
    const start = performance.now();
    for (let n = 0; n < TURBO_MAX_STEPS && !g.isWon(); n++) {
      fire(sim, t);
      if (performance.now() - start > TURBO_BUDGET_MS) break;
    }
    return;
  }
  const interval = mode === "tile" ? SPEED_MS["1x"] : SPEED_MS[sim.speed];
  sim.acc += dt;
  while (sim.acc >= interval && !g.isWon()) {
    fire(sim, t);
    sim.acc -= interval;
  }
  if (g.isWon()) sim.acc = 0;
}

function rectFor(sim: Sim, mode: Mode): BoardRect {
  return mode === "tile"
    ? boardRect(sim.w, sim.h, TILE_PAD, TILE_READOUT_H)
    : boardRect(sim.w, sim.h, 1, 0);
}

function render(sim: Sim, mode: Mode, now: number): void {
  const ctx = sim.ctx;
  if (!ctx || sim.w === 0 || sim.h === 0) return;
  ctx.setTransform(sim.dpr, 0, 0, sim.dpr, 0, 0);
  ctx.clearRect(0, 0, sim.w, sim.h);
  const p = sim.placing;
  drawBoard(ctx, p ? null : sim.game, {
    rect: rectFor(sim, mode),
    showHeat: sim.showHeat,
    now,
    lastShot: sim.lastShot,
    reveal: sim.userFleet,
    placing: p ? { ships: p.ships, len: FLEET[p.ships.length] ?? 0, horiz: p.horiz, hover: p.hover } : null,
  });
}

function snapshot(sim: Sim, prev: Ui): Ui | null {
  const g = sim.game;
  const won = g.isWon();
  const placing = sim.placing;
  const sig = `${g.moves}|${g.shipsLeft}|${sim.stats.games}|${sim.playing}|${placing ? placing.ships.length : -1}|${placing?.horiz}|${sim.userFleet}|${won}`;
  if (sig === prev.sig) return null;
  return {
    sig,
    moves: g.moves,
    shipsLeft: g.shipsLeft,
    games: sim.stats.games,
    mean: sim.stats.mean,
    history: prev.games === sim.stats.games ? prev.history : sim.stats.history.slice(),
    playing: sim.playing,
    placing: placing ? { count: placing.ships.length, horiz: placing.horiz } : null,
    userFleet: sim.userFleet,
    won,
  };
}

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void): () => void {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getReduced = (): boolean => window.matchMedia(REDUCED_QUERY).matches;
const getReducedServer = (): boolean => false;

export default function Demo({ mode = "tile" }: { mode?: "tile" | "full" }) {
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, getReducedServer);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Sim | null>(null);
  /** Restarts the animation loop; set by the lifecycle effect, called from handlers. */
  const kickRef = useRef<() => void>(() => {});
  const [ui, setUi] = useState<Ui>(INITIAL_UI);
  const [speed, setSpeed] = useState<Speed>("1x");
  const [showHeat, setShowHeat] = useState(true);
  const [narrow, setNarrow] = useState(false);

  const getSim = useCallback((): Sim => {
    let sim = simRef.current;
    if (!sim) {
      sim = createSim(mode);
      simRef.current = sim;
    }
    return sim;
  }, [mode]);

  const syncUi = useCallback((sim: Sim) => {
    setUi((prev) => snapshot(sim, prev) ?? prev);
  }, []);

  // Canvas, observers, loop lifecycle.
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const sim = getSim();
    sim.ctx = canvas.getContext("2d");

    if (reduced && sim.game.moves === 0) {
      // Representative static frame: a game a good way in, heatmap visible.
      while (sim.game.moves < STATIC_FRAME_MOVES && !sim.game.isWon()) sim.game.step();
      sim.playing = false;
    }

    // One animation frame. Re-schedules itself unless reduced motion is on,
    // in which case it just paints the current state once.
    const frame = (t: number): void => {
      sim.raf = 0;
      if (!sim.visible || document.hidden) return;
      const dt = Math.min(100, Math.max(0, t - sim.lastT));
      sim.lastT = t;
      if (!reduced && sim.playing && !sim.placing) advance(sim, mode, t, dt);
      render(sim, mode, t);
      syncUi(sim);
      if (!reduced) sim.raf = requestAnimationFrame(frame);
    };
    const kick = (): void => {
      if (sim.raf !== 0) return;
      sim.lastT = performance.now();
      sim.raf = requestAnimationFrame(frame);
    };
    kickRef.current = kick;

    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (!box) return;
      sim.w = box.width;
      sim.h = box.height;
      sim.dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(sim.w * sim.dpr);
      canvas.height = Math.round(sim.h * sim.dpr);
      setNarrow(sim.w < 380);
      render(sim, mode, performance.now());
    });
    ro.observe(wrap);

    const io = new IntersectionObserver((entries) => {
      sim.visible = entries.some((e) => e.isIntersecting);
      if (sim.visible) kick();
    });
    io.observe(wrap);

    const onVisibility = () => {
      if (!document.hidden) kick();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (sim.raf !== 0) cancelAnimationFrame(sim.raf);
      sim.raf = 0;
      sim.ctx = null;
      kickRef.current = () => {};
    };
  }, [getSim, mode, reduced, syncUi]);

  // ----- controls (full mode) -----

  const togglePlay = useCallback(() => {
    const sim = getSim();
    if (reduced || sim.placing) return;
    if (sim.game.isWon()) startGame(sim, null);
    sim.playing = !sim.playing;
    sim.acc = 0;
    syncUi(sim);
    kickRef.current();
  }, [getSim, reduced, syncUi]);

  const stepOnce = useCallback(() => {
    const sim = getSim();
    if (sim.placing) return;
    if (sim.game.isWon()) startGame(sim, null);
    sim.playing = false;
    fire(sim, performance.now());
    render(sim, mode, performance.now());
    syncUi(sim);
    kickRef.current();
  }, [getSim, mode, syncUi]);

  const newFleet = useCallback(() => {
    const sim = getSim();
    sim.placing = null;
    startGame(sim, null);
    if (reduced) {
      while (sim.game.moves < STATIC_FRAME_MOVES && !sim.game.isWon()) sim.game.step();
      sim.playing = false;
    }
    render(sim, mode, performance.now());
    syncUi(sim);
    kickRef.current();
  }, [getSim, mode, reduced, syncUi]);

  const beginPlacing = useCallback(() => {
    const sim = getSim();
    sim.placing = { ships: [], horiz: true, hover: -1 };
    sim.playing = false;
    render(sim, mode, performance.now());
    syncUi(sim);
    kickRef.current();
  }, [getSim, mode, syncUi]);

  const cancelPlacing = useCallback(() => {
    const sim = getSim();
    sim.placing = null;
    render(sim, mode, performance.now());
    syncUi(sim);
    kickRef.current();
  }, [getSim, mode, syncUi]);

  const undoPlacing = useCallback(() => {
    const sim = getSim();
    sim.placing?.ships.pop();
    render(sim, mode, performance.now());
    syncUi(sim);
  }, [getSim, mode, syncUi]);

  const setOrientation = useCallback(
    (horiz: boolean) => {
      const sim = getSim();
      if (!sim.placing) return;
      sim.placing.horiz = horiz;
      render(sim, mode, performance.now());
      syncUi(sim);
    },
    [getSim, mode, syncUi],
  );

  const changeSpeed = useCallback(
    (s: Speed) => {
      getSim().speed = s;
      setSpeed(s);
    },
    [getSim],
  );

  const toggleHeat = useCallback(() => {
    const sim = getSim();
    sim.showHeat = !sim.showHeat;
    setShowHeat(sim.showHeat);
    render(sim, mode, performance.now());
  }, [getSim, mode]);

  const pointerCell = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>): number => {
      const sim = getSim();
      const box = e.currentTarget.getBoundingClientRect();
      return cellAt(rectFor(sim, mode), e.clientX - box.left, e.clientY - box.top);
    },
    [getSim, mode],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const sim = getSim();
      if (!sim.placing) return;
      const idx = pointerCell(e);
      if (idx === sim.placing.hover) return;
      sim.placing.hover = idx;
      if (reduced) render(sim, mode, performance.now());
    },
    [getSim, mode, pointerCell, reduced],
  );

  const onPointerLeave = useCallback(() => {
    const sim = getSim();
    if (!sim.placing) return;
    sim.placing.hover = -1;
    if (reduced) render(sim, mode, performance.now());
  }, [getSim, mode, reduced]);

  const onBoardClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const sim = getSim();
      const p = sim.placing;
      if (!p) return;
      const idx = pointerCell(e);
      if (idx < 0) return;
      const len = FLEET[p.ships.length];
      const r = Math.floor(idx / SIZE);
      const c = idx % SIZE;
      if (len === undefined || !canPlace(p.ships, r, c, len, p.horiz)) return;
      p.ships.push({ r, c, len, horiz: p.horiz, hits: 0, sunk: false });
      if (p.ships.length === FLEET.length) {
        startGame(sim, p.ships);
        sim.placing = null;
        sim.playing = false;
      }
      render(sim, mode, performance.now());
      syncUi(sim);
      kickRef.current();
    },
    [getSim, mode, pointerCell, syncUi],
  );

  // Keyboard: space = play/pause, n = new fleet.
  useEffect(() => {
    if (mode !== "full") return;
    const isTyping = (t: EventTarget | null): boolean =>
      t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "n" || e.key === "N") {
        newFleet();
      }
    };
    // Buttons activate on space keyup; swallow it so a focused button does not also fire.
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isTyping(e.target)) e.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [mode, newFleet, togglePlay]);

  const meanText = Number.isNaN(ui.mean) ? "—" : ui.mean.toFixed(1);

  if (mode === "tile") {
    return (
      <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <div
          className={`pointer-events-none absolute bottom-2 left-3 right-3 flex items-baseline justify-between gap-3 whitespace-nowrap ${LABEL}`}
        >
          <span>
            Move <span className="num text-text">{ui.moves}</span>
            {" · "}
            {narrow ? "Ships" : "Ships left"} <span className="num text-text">{ui.shipsLeft}</span>
            {" · "}
            {narrow ? "Avg" : "Session avg"} <span className="num text-text">{meanText}</span>
          </span>
          {!narrow && <span>PDF + MC · live</span>}
        </div>
      </div>
    );
  }

  const placing = ui.placing;
  const placingLen = placing ? FLEET[placing.count] : undefined;
  const scale = Math.max(56, ...ui.history);
  const bars = ui.history.slice(-48);

  return (
    <div className="flex w-full flex-col gap-6 p-5 md:flex-row md:items-start md:gap-8 md:p-6 lg:p-8">
      <div
        ref={wrapRef}
        className={`relative aspect-square w-full max-w-[520px] shrink-0 select-none ${placing ? "touch-none" : ""}`}
      >
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full ${placing ? "cursor-crosshair" : ""}`}
          role="img"
          aria-label={
            placing
              ? `Place your fleet: ship ${placing.count + 1} of ${FLEET.length}, length ${placingLen ?? 0}`
              : `Battleship board, move ${ui.moves}, ${ui.shipsLeft} ships left`
          }
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onClick={onBoardClick}
        />
      </div>

      <aside className="flex min-w-0 flex-1 flex-col gap-4">
        <p className={LABEL}>PDF + Monte Carlo components of the ensemble, running live</p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={ui.playing ? BTN_ON : BTN}
            onClick={togglePlay}
            disabled={reduced || placing !== null}
            title={reduced ? "Autoplay is off because your system prefers reduced motion" : "Space"}
          >
            {ui.playing ? "Pause" : "Play"}
          </button>
          <button type="button" className={BTN} onClick={stepOnce} disabled={placing !== null}>
            Step
          </button>
          <button type="button" className={BTN} onClick={newFleet} title="N">
            New fleet
          </button>
          {placing ? (
            <button type="button" className={BTN} onClick={cancelPlacing}>
              Cancel placement
            </button>
          ) : (
            <button type="button" className={BTN} onClick={beginPlacing}>
              Place my own fleet
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <span className={LABEL}>Speed</span>
            {(["1x", "4x", "turbo"] as const).map((s) => (
              <button
                key={s}
                type="button"
                className={speed === s ? BTN_ON : BTN}
                onClick={() => changeSpeed(s)}
                aria-pressed={speed === s}
              >
                {s === "turbo" ? "turbo" : s.replace("x", "×")}
              </button>
            ))}
          </div>
          <button type="button" className={showHeat ? BTN_ON : BTN} onClick={toggleHeat} aria-pressed={showHeat}>
            Show heatmap
          </button>
        </div>

        {placing && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4">
            <span className={LABEL}>
              Placing ship <span className="num text-text">{placing.count + 1}</span>/{FLEET.length} · length{" "}
              <span className="num text-text">{placingLen ?? 0}</span> · click a cell
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={placing.horiz ? BTN_ON : BTN}
                onClick={() => setOrientation(true)}
                aria-pressed={placing.horiz}
              >
                H
              </button>
              <button
                type="button"
                className={placing.horiz ? BTN : BTN_ON}
                onClick={() => setOrientation(false)}
                aria-pressed={!placing.horiz}
              >
                V
              </button>
              <button type="button" className={BTN} onClick={undoPlacing} disabled={placing.count === 0}>
                Undo
              </button>
            </div>
          </div>
        )}

        {ui.won && ui.userFleet && !placing && (
          <p className={LABEL}>
            Your fleet sunk in <span className="num text-text">{ui.moves}</span> moves
          </p>
        )}

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 sm:grid-cols-4">
          <div>
            <dt className={LABEL}>Moves this game</dt>
            <dd className="num text-xl text-text">{ui.moves}</dd>
          </div>
          <div>
            <dt className={LABEL}>Ships left</dt>
            <dd className="num text-xl text-text">{ui.shipsLeft}</dd>
          </div>
          <div>
            <dt className={LABEL}>Games played</dt>
            <dd className="num text-xl text-text">{ui.games}</dd>
          </div>
          <div>
            <dt className={LABEL}>Session mean moves</dt>
            <dd className="num text-xl text-text">{meanText}</dd>
          </div>
        </dl>

        <div>
          <div className="flex items-baseline justify-between">
            <span className={LABEL}>Moves per game</span>
            <span className={LABEL}>
              dashed · <span className="num">{BENCHMARK_MOVES}</span> benchmark
            </span>
          </div>
          <div className="relative mt-2 flex h-12 items-end gap-px border-b border-line">
            {bars.map((m, i) => (
              <div
                key={`${ui.games}-${i}`}
                className={`w-2 shrink-0 ${i === bars.length - 1 ? "bg-accent" : "bg-accent-deep"}`}
                style={{ height: `${(m / scale) * 100}%` }}
                title={`${m} moves`}
              />
            ))}
            <div
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-line-2"
              style={{ bottom: `${(BENCHMARK_MOVES / scale) * 100}%` }}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
