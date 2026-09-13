/**
 * Animation controller for the scheduler demo. Owns the requestAnimationFrame
 * loop, playback progress, the tile's hold-and-loop behaviour, and the static
 * frame used when the viewer prefers reduced motion. No React in here.
 */
import { elapsedAt, happinessAt, stageAt, stageFraction, type Solve } from "./engine";
import { CHECK_MS, FLASH_MS, GridState, computeLayout, drawFrame, type Layout, type Mode } from "./draw";

export interface Readout {
  readonly stage: number;
  readonly stageFraction: number;
  readonly assignments: number;
  readonly checks: number;
  /** -1 while the pre-fill stage runs (rendered as an em dash). */
  readonly happiness: number;
  readonly elapsed: string;
  readonly progress: number;
}

export interface PlayerOptions {
  readonly mode: Mode;
  readonly solve: Solve;
  readonly canvas: HTMLCanvasElement;
  /** Wall-clock milliseconds for one complete solve at 1x. */
  readonly durationMs: number;
  /** Milliseconds to hold the finished schedule before looping (loop mode). */
  readonly holdMs: number;
  readonly loop: boolean;
  readonly reducedMotion: boolean;
  readonly onFrame: (readout: Readout) => void;
  readonly onEnded: () => void;
}

const MAX_FRAME_DT = 100;

export class Player {
  readonly state: GridState;
  private readonly ctx: CanvasRenderingContext2D | null;
  private layout: Layout | null = null;
  private font = "ui-monospace, SFMono-Regular, Menlo, monospace";
  private width = 0;
  private height = 0;
  private dpr = 1;
  private bottomInset = 0;

  private playing = true;
  private speed = 1;
  private showChecks = false;
  private progress = 0;
  private lastTs = 0;
  private holdUntil = 0;
  private lastApply = -Infinity;
  private raf = 0;
  private active = true;
  private destroyed = false;

  constructor(private readonly o: PlayerOptions) {
    this.state = new GridState(o.solve);
    this.ctx = o.canvas.getContext("2d");
  }

  get ended(): boolean {
    return !this.o.loop && this.progress >= 1;
  }

  setFont(font: string): void {
    this.font = font;
    this.kick();
  }

  resize(width: number, height: number, dpr: number, bottomInset: number): void {
    if (width <= 0 || height <= 0) return;
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.bottomInset = bottomInset;
    const canvas = this.o.canvas;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    this.layout = computeLayout(width, height, this.o.mode, this.o.solve, dpr, bottomInset);
    if (this.o.reducedMotion) this.showStatic();
    else this.kick();
  }

  /** Called with (visible && !document.hidden); pauses the loop when false. */
  setActive(active: boolean): void {
    if (this.active === active) return;
    this.active = active;
    if (active) {
      this.lastTs = 0;
      this.kick();
    } else if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }

  setPlaying(playing: boolean): void {
    if (this.playing === playing) return;
    this.playing = playing;
    this.lastTs = 0;
    this.kick();
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  setShowChecks(show: boolean): void {
    this.showChecks = show;
    this.kick();
  }

  restart(): void {
    this.state.reset();
    this.progress = 0;
    this.holdUntil = 0;
    this.lastTs = 0;
    this.lastApply = -Infinity;
    if (this.o.reducedMotion) this.showStatic();
    else this.kick();
  }

  destroy(): void {
    this.destroyed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  /** Reduced motion: the finished schedule, no flashes, no band, no loop. */
  private showStatic(): void {
    this.state.reset();
    this.state.applyUpTo(1, -Infinity);
    this.progress = 1;
    this.render(performance.now());
    this.emit();
  }

  /** Ensure a frame is scheduled; the frame decides whether to keep going. */
  private kick(): void {
    if (this.destroyed || this.o.reducedMotion || !this.active || this.raf) return;
    this.raf = requestAnimationFrame(this.frame);
  }

  private readonly frame = (ts: number): void => {
    this.raf = 0;
    if (this.destroyed || !this.active) return;
    const dt = this.lastTs > 0 ? Math.min(ts - this.lastTs, MAX_FRAME_DT) : 0;
    this.lastTs = ts;

    let advancing = false;
    if (this.holdUntil > 0) {
      advancing = true;
      if (ts >= this.holdUntil) {
        this.holdUntil = 0;
        this.state.reset();
        this.progress = 0;
        this.lastApply = -Infinity;
      }
    } else if (this.playing && this.progress < 1) {
      advancing = true;
      this.progress = Math.min(1, this.progress + (dt * this.speed) / this.o.durationMs);
      if (this.progress >= 1) {
        if (this.o.loop) this.holdUntil = ts + this.o.holdMs;
        else {
          this.playing = false;
          this.o.onEnded();
        }
      }
    }

    const before = this.state.cursor;
    this.state.applyUpTo(this.progress, ts);
    if (this.state.cursor !== before) this.lastApply = ts;

    this.render(ts);
    this.emit();

    const settling = ts - this.lastApply < FLASH_MS + CHECK_MS + 50;
    if (advancing || settling) this.raf = requestAnimationFrame(this.frame);
  };

  private render(now: number): void {
    const ctx = this.ctx;
    const layout = this.layout;
    if (!ctx || !layout) return;
    const solve = this.o.solve;
    const last = this.state.lastEvent;
    const finished = this.progress >= 1;
    let scanWeek = -1;
    let scanRows: readonly [number, number] | null = null;
    if (!finished && last) {
      scanWeek = last.week;
      const stage = solve.stages[last.stage];
      if (stage.group >= 0) {
        const g = solve.groups[stage.group];
        scanRows = [g.start, g.start + g.size];
      }
    }
    drawFrame(ctx, solve, layout, this.state, {
      now,
      mode: this.o.mode,
      showChecks: this.showChecks,
      font: this.font,
      scanWeek,
      scanRows,
    });
  }

  private emit(): void {
    const solve = this.o.solve;
    const p = this.progress;
    this.o.onFrame({
      stage: stageAt(solve, p),
      stageFraction: stageFraction(solve, p),
      assignments: this.state.assignments,
      checks: this.state.checks,
      happiness: happinessAt(solve, p),
      elapsed: elapsedAt(p),
      progress: p,
    });
  }
}
