/**
 * Canvas 2D rendering for the scheduler demo: layout, incremental grid state
 * (replays engine events), and the per-frame draw routine.
 */
import { OFF, SERVICES, WEEKS, checksFor, type Solve, type SolveEvent } from "./engine";

export type Mode = "tile" | "full";

export const COLORS = {
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
} as const;

/** Six greys between line-2 and muted; service types map onto these. */
export const RAMP: readonly string[] = ["#383840", "#45454c", "#535359", "#62626a", "#737379", "#8b8b90"];

/** Milliseconds a freshly filled cell holds the accent before settling. */
export const FLASH_MS = 400;
/** Milliseconds a constraint-check outline stays visible. */
export const CHECK_MS = 260;

const SEPARATOR_PX = 2;
const RECENT_LIMIT = 12;

export interface LegendEntry {
  readonly color: string;
  readonly label: string;
}

/** Legend rows for the DOM panel: OFF, CALL, then the grey ramp. */
export const LEGEND: readonly LegendEntry[] = [
  { color: COLORS.line2, label: "OFF" },
  { color: COLORS.accentDeep, label: "CALL" },
  ...RAMP.map((color, i) => ({
    color,
    label: SERVICES.filter((s) => s.ramp === i)
      .map((s) => s.label)
      .join(" / "),
  })),
];

export interface Layout {
  readonly width: number;
  readonly height: number;
  readonly dpr: number;
  readonly pitch: number;
  readonly cell: number;
  readonly gridX: number;
  readonly gridY: number;
  readonly gridW: number;
  readonly gridH: number;
  readonly rowY: readonly number[];
  readonly labelW: number;
  readonly headerH: number;
}

export function computeLayout(
  width: number,
  height: number,
  mode: Mode,
  solve: Solve,
  dpr: number,
  bottomInset: number,
): Layout {
  const rows = solve.rows;
  const separators = solve.groups.length - 1;
  const pad = 12;
  const labelW = mode === "full" ? 44 : 0;
  const headerH = mode === "full" ? 16 : 0;
  const availW = width - pad * 2 - labelW;
  const availH = height - pad * 2 - headerH - bottomInset - separators * SEPARATOR_PX;
  const maxPitch = mode === "tile" ? 11 : 13;
  const pitch = Math.max(3, Math.min(maxPitch, Math.floor(Math.min(availW / WEEKS, availH / rows))));
  const cell = pitch - 1;
  const gridW = WEEKS * pitch + 1;
  const gridH = rows * pitch + separators * SEPARATOR_PX + 1;
  const blockW = labelW + gridW;
  const blockH = headerH + gridH;
  const gridX = Math.floor((width - blockW) / 2) + labelW;
  const gridY = Math.floor((height - bottomInset - blockH) / 2) + headerH;
  const rowY: number[] = new Array<number>(rows);
  for (let r = 0; r < rows; r++) {
    rowY[r] = gridY + 1 + r * pitch + solve.physicians[r].group * SEPARATOR_PX;
  }
  return { width, height, dpr, pitch, cell, gridX, gridY, gridW, gridH, rowY, labelW, headerH };
}

/** Incremental replay of the engine timeline into a cell buffer. */
export class GridState {
  readonly cells: Int8Array;
  readonly filledAt: Float64Array;
  cursor = 0;
  assignments = 0;
  checks = 0;
  lastEvent: SolveEvent | null = null;
  readonly recent: SolveEvent[] = [];
  readonly recentAt: number[] = [];

  constructor(private readonly solve: Solve) {
    this.cells = new Int8Array(solve.rows * WEEKS);
    this.filledAt = new Float64Array(solve.rows * WEEKS);
    this.reset();
  }

  reset(): void {
    this.cells.fill(-1);
    this.filledAt.fill(-Infinity);
    this.cursor = 0;
    this.assignments = 0;
    this.checks = 0;
    this.lastEvent = null;
    this.recent.length = 0;
    this.recentAt.length = 0;
  }

  /** Apply every event with t <= progress. Pass now = -Infinity to skip flashes. */
  applyUpTo(progress: number, now: number): void {
    const events = this.solve.events;
    while (this.cursor < events.length && events[this.cursor].t <= progress) {
      this.apply(events[this.cursor], now);
      this.cursor++;
    }
  }

  private apply(ev: SolveEvent, now: number): void {
    if (ev.kind === "fill") {
      const i = ev.row * WEEKS + ev.week;
      this.cells[i] = ev.service;
      this.filledAt[i] = now;
      if (ev.service !== OFF) this.assignments++;
    } else {
      const a = ev.rowA * WEEKS + ev.week;
      const b = ev.rowB * WEEKS + ev.week;
      this.cells[a] = ev.serviceA;
      this.cells[b] = ev.serviceB;
      this.filledAt[a] = now;
      this.filledAt[b] = now;
    }
    this.checks += checksFor(ev);
    this.lastEvent = ev;
    if (Number.isFinite(now)) {
      this.recent.push(ev);
      this.recentAt.push(now);
      if (this.recent.length > RECENT_LIMIT) {
        this.recent.shift();
        this.recentAt.shift();
      }
    }
  }
}

type RGB = readonly [number, number, number];

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: RGB, b: RGB, k: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * k);
  const g = Math.round(a[1] + (b[1] - a[1]) * k);
  const bl = Math.round(a[2] + (b[2] - a[2]) * k);
  return `rgb(${r},${g},${bl})`;
}

/** Settled colour for a service id (or -1 = unassigned). */
function serviceColor(service: number): string {
  if (service < 0) return COLORS.surface2;
  const ramp = SERVICES[service].ramp;
  if (ramp === -1) return COLORS.accentDeep;
  if (ramp === -2) return COLORS.line2;
  return RAMP[ramp];
}

const BUCKET_COLORS: readonly string[] = [COLORS.surface2, ...SERVICES.map((_, i) => serviceColor(i))];
const BUCKET_RGB: readonly RGB[] = BUCKET_COLORS.map(hexToRgb);
const ACCENT_RGB = hexToRgb(COLORS.accent);
const DIM_RGB = hexToRgb(COLORS.dim);

export interface FrameOptions {
  readonly now: number;
  readonly mode: Mode;
  readonly showChecks: boolean;
  readonly font: string;
  /** Week column to highlight, or -1 for none. */
  readonly scanWeek: number;
  /** Row range [start, end) for the band, or null for the whole grid. */
  readonly scanRows: readonly [number, number] | null;
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  solve: Solve,
  layout: Layout,
  state: GridState,
  o: FrameOptions,
): void {
  const { width, height, dpr, pitch, cell, gridX, gridY, gridW, gridH, rowY } = layout;
  const rows = solve.rows;
  const cells = state.cells;
  const filledAt = state.filledAt;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = COLORS.surface;
  ctx.fillRect(0, 0, width, height);

  // Gridlines are the background showing through the 1px gaps between cells.
  ctx.fillStyle = COLORS.line;
  ctx.fillRect(gridX, gridY, gridW, gridH);

  // Cells, batched by settled colour; flashing cells are drawn afterwards.
  const buckets: number[][] = BUCKET_COLORS.map(() => []);
  const flashing: number[] = [];
  for (let i = 0; i < cells.length; i++) {
    if (o.now - filledAt[i] < FLASH_MS) flashing.push(i);
    else buckets[cells[i] + 1].push(i);
  }
  for (let b = 0; b < buckets.length; b++) {
    const list = buckets[b];
    if (list.length === 0) continue;
    ctx.fillStyle = BUCKET_COLORS[b];
    for (const i of list) {
      const r = (i / WEEKS) | 0;
      const w = i - r * WEEKS;
      ctx.fillRect(gridX + 1 + w * pitch, rowY[r], cell, cell);
    }
  }
  for (const i of flashing) {
    const r = (i / WEEKS) | 0;
    const w = i - r * WEEKS;
    const s = cells[i];
    const k = 1 - (o.now - filledAt[i]) / FLASH_MS;
    const flash = s === OFF ? DIM_RGB : ACCENT_RGB;
    ctx.fillStyle = mix(BUCKET_RGB[s + 1], flash, k * k);
    ctx.fillRect(gridX + 1 + w * pitch, rowY[r], cell, cell);
  }

  // Prescheduled cells get a dim diagonal once cells are big enough to read it.
  if (cell >= 9) {
    ctx.strokeStyle = COLORS.dim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < cells.length; i++) {
      if (cells[i] !== OFF) continue;
      const r = (i / WEEKS) | 0;
      const w = i - r * WEEKS;
      const x = gridX + 1 + w * pitch;
      const y = rowY[r];
      ctx.moveTo(x + 1.5, y + cell - 1.5);
      ctx.lineTo(x + cell - 1.5, y + 1.5);
    }
    ctx.stroke();
  }

  // Group separators: slightly stronger rules in the extra gap between groups.
  ctx.fillStyle = COLORS.line2;
  for (let g = 1; g < solve.groups.length; g++) {
    ctx.fillRect(gridX, rowY[solve.groups[g].start] - 2, gridW, 1);
  }

  // Scanning band over the column being processed.
  if (o.scanWeek >= 0) {
    const y0 = o.scanRows ? rowY[o.scanRows[0]] : gridY;
    const y1 = o.scanRows ? rowY[o.scanRows[1] - 1] + cell : gridY + gridH;
    ctx.globalAlpha = 0.09;
    ctx.fillStyle = COLORS.accent;
    ctx.fillRect(gridX + o.scanWeek * pitch, y0, pitch + 1, y1 - y0);
    ctx.globalAlpha = 1;
  }

  // Constraint-check outlines: the row's quarter (caps) and the group's column (headcount).
  if (o.showChecks) {
    ctx.strokeStyle = COLORS.muted;
    ctx.lineWidth = 1;
    for (let k = 0; k < state.recent.length; k++) {
      const age = o.now - state.recentAt[k];
      if (age >= CHECK_MS) continue;
      const ev = state.recent[k];
      ctx.globalAlpha = 0.85 * (1 - age / CHECK_MS);
      const rowsHit = ev.kind === "fill" ? [ev.row] : [ev.rowA, ev.rowB];
      const q = Math.floor(ev.week / 13);
      for (const r of rowsHit) {
        if (ev.kind === "fill" && ev.service === OFF) {
          ctx.strokeRect(gridX + 1 + ev.week * pitch - 0.5, rowY[r] - 0.5, cell + 1, cell + 1);
          continue;
        }
        ctx.strokeRect(gridX + 1 + q * 13 * pitch - 0.5, rowY[r] - 0.5, 13 * pitch, cell + 1);
      }
      if (ev.kind === "swap" || ev.service !== OFF) {
        const first = ev.kind === "fill" ? ev.row : ev.rowA;
        const grp = solve.groups[solve.physicians[first].group];
        const y0 = rowY[grp.start];
        const y1 = rowY[grp.start + grp.size - 1] + cell;
        ctx.strokeRect(gridX + 1 + ev.week * pitch - 0.5, y0 - 0.5, cell + 1, y1 - y0 + 1);
      }
    }
    ctx.globalAlpha = 1;
  }

  // Header (week numbers) and physician labels, full mode only.
  if (o.mode === "full") {
    ctx.fillStyle = COLORS.dim;
    ctx.font = `9px ${o.font}`;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    for (let w = 0; w < WEEKS; w += 4) {
      ctx.fillText(String(w + 1), gridX + 1 + w * pitch, gridY - 5);
    }
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    if (cell >= 8) {
      ctx.font = `${Math.min(9, cell)}px ${o.font}`;
      for (let r = 0; r < rows; r++) {
        ctx.fillText(solve.physicians[r].label, gridX - 6, rowY[r] + cell / 2 + 0.5);
      }
    } else {
      ctx.font = `9px ${o.font}`;
      for (const g of solve.groups) {
        const y0 = rowY[g.start];
        const y1 = rowY[g.start + g.size - 1] + cell;
        ctx.fillText(g.short, gridX - 6, (y0 + y1) / 2);
      }
    }
  }
}
