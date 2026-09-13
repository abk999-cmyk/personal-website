import { CELLS, HIT, MISS, SIZE, SUNK, canPlace, fits, type Game, type Ship } from "./engine";

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

/** Quantised accent fills so the heatmap does not build 100 colour strings per frame. */
const HEAT_STEPS = 32;
const HEAT_FILL: string[] = Array.from({ length: HEAT_STEPS + 1 }, (_, i) => {
  const a = ((i / HEAT_STEPS) * 0.88).toFixed(3);
  return `rgba(212,255,58,${a})`;
});

export interface BoardRect {
  x: number;
  y: number;
  size: number;
}

export interface PlacingView {
  ships: readonly Ship[];
  /** Length of the ship currently being placed. */
  len: number;
  horiz: boolean;
  /** Hovered anchor cell, or -1. */
  hover: number;
}

export interface LastShot {
  idx: number;
  t: number;
  result: "miss" | "hit" | "sunk";
}

export interface DrawOpts {
  rect: BoardRect;
  showHeat: boolean;
  /** Animation clock in ms (any monotonic source). */
  now: number;
  lastShot: LastShot | null;
  /** Faintly draw the un-sunk fleet (used when the visitor placed it). */
  reveal: boolean;
  placing: PlacingView | null;
}

/** Largest square that fits a w×h box with `pad` around it and `bottom` px reserved below. */
export function boardRect(w: number, h: number, pad: number, bottom: number): BoardRect {
  const size = Math.max(0, Math.min(w - 2 * pad, h - pad - bottom));
  return { x: (w - size) / 2, y: pad, size };
}

/** Pixel-snapped geometry shared by drawing and hit-testing. */
function geometry(rect: BoardRect): { x0: number; y0: number; cell: number; bs: number } {
  const cell = Math.floor(rect.size / SIZE);
  const bs = cell * SIZE;
  return {
    x0: Math.round(rect.x + (rect.size - bs) / 2),
    y0: Math.round(rect.y + (rect.size - bs) / 2),
    cell,
    bs,
  };
}

/** Cell index under a point (CSS px, canvas-relative), or -1. */
export function cellAt(rect: BoardRect, px: number, py: number): number {
  const { x0, y0, cell, bs } = geometry(rect);
  if (cell <= 0 || px < x0 || py < y0 || px >= x0 + bs || py >= y0 + bs) return -1;
  return Math.floor((py - y0) / cell) * SIZE + Math.floor((px - x0) / cell);
}

export function drawBoard(ctx: CanvasRenderingContext2D, game: Game | null, o: DrawOpts): void {
  const { x0, y0, cell, bs } = geometry(o.rect);
  if (cell < 4) return;

  ctx.fillStyle = COLORS.surface;
  ctx.fillRect(x0, y0, bs, bs);

  // Visitor-placed fleet: show where the un-sunk ships are so the hunt reads.
  if (game && o.reveal) {
    ctx.fillStyle = "rgba(46,46,51,0.9)";
    for (const s of game.ships) {
      if (s.sunk) continue;
      for (let k = 0; k < s.len; k++) {
        const r = s.horiz ? s.r : s.r + k;
        const c = s.horiz ? s.c + k : s.c;
        ctx.fillRect(x0 + c * cell, y0 + r * cell, cell, cell);
      }
    }
  }

  // Heatmap: lime alpha ∝ normalised heat.
  if (game && o.showHeat && !o.placing) {
    let max = 0;
    for (let i = 0; i < CELLS; i++) if (game.heat[i] > max) max = game.heat[i];
    if (max > 0) {
      for (let i = 0; i < CELLS; i++) {
        const h = game.heat[i];
        if (h <= 0) continue;
        const step = Math.round(Math.pow(h / max, 0.75) * HEAT_STEPS);
        if (step === 0) continue;
        ctx.fillStyle = HEAT_FILL[step];
        ctx.fillRect(x0 + (i % SIZE) * cell, y0 + Math.floor(i / SIZE) * cell, cell, cell);
      }
    }
  }

  // Sunk ships: solid accent-deep cells.
  if (game) {
    ctx.fillStyle = COLORS.accentDeep;
    for (let i = 0; i < CELLS; i++) {
      if (game.shots[i] !== SUNK) continue;
      ctx.fillRect(x0 + (i % SIZE) * cell + 1, y0 + Math.floor(i / SIZE) * cell + 1, cell - 1, cell - 1);
    }
  }

  // Fleet placement overlay.
  if (o.placing) {
    const p = o.placing;
    ctx.fillStyle = "rgba(212,255,58,0.10)";
    for (let i = 0; i < CELLS; i++) {
      if (canPlace(p.ships, Math.floor(i / SIZE), i % SIZE, p.len, p.horiz)) {
        ctx.fillRect(x0 + (i % SIZE) * cell, y0 + Math.floor(i / SIZE) * cell, cell, cell);
      }
    }
    ctx.fillStyle = "rgba(143,191,0,0.6)";
    for (const s of p.ships) {
      for (let k = 0; k < s.len; k++) {
        const r = s.horiz ? s.r : s.r + k;
        const c = s.horiz ? s.c + k : s.c;
        ctx.fillRect(x0 + c * cell + 1, y0 + r * cell + 1, cell - 1, cell - 1);
      }
    }
    if (p.hover >= 0) {
      const hr = Math.floor(p.hover / SIZE);
      const hc = p.hover % SIZE;
      const legal = canPlace(p.ships, hr, hc, p.len, p.horiz);
      ctx.fillStyle = legal ? "rgba(212,255,58,0.55)" : "rgba(92,92,98,0.6)";
      for (let k = 0; k < p.len; k++) {
        const r = p.horiz ? hr : hr + k;
        const c = p.horiz ? hc + k : hc;
        if (!fits(r, c, 1, true)) continue;
        ctx.fillRect(x0 + c * cell + 1, y0 + r * cell + 1, cell - 1, cell - 1);
      }
    }
  }

  // Grid.
  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= SIZE; i++) {
    const gx = x0 + i * cell + 0.5;
    const gy = y0 + i * cell + 0.5;
    ctx.moveTo(gx, y0);
    ctx.lineTo(gx, y0 + bs + 1);
    ctx.moveTo(x0, gy);
    ctx.lineTo(x0 + bs + 1, gy);
  }
  ctx.stroke();

  if (!game) return;

  // Misses and hits.
  const dotR = Math.max(1.5, cell * 0.09);
  const ringR = cell * 0.27;
  const ringW = Math.max(1.5, cell * 0.08);
  ctx.fillStyle = COLORS.dim;
  ctx.beginPath();
  for (let i = 0; i < CELLS; i++) {
    if (game.shots[i] !== MISS) continue;
    const cx = x0 + (i % SIZE) * cell + cell / 2 + 0.5;
    const cy = y0 + Math.floor(i / SIZE) * cell + cell / 2 + 0.5;
    ctx.moveTo(cx + dotR, cy);
    ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
  }
  ctx.fill();

  ctx.strokeStyle = COLORS.accent;
  ctx.lineWidth = ringW;
  ctx.beginPath();
  for (let i = 0; i < CELLS; i++) {
    if (game.shots[i] !== HIT) continue;
    const cx = x0 + (i % SIZE) * cell + cell / 2 + 0.5;
    const cy = y0 + Math.floor(i / SIZE) * cell + cell / 2 + 0.5;
    ctx.moveTo(cx + ringR, cy);
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
  }
  ctx.stroke();

  // Next chosen cell pulses.
  if (!o.placing && game.next >= 0) {
    const phase = 0.5 + 0.5 * Math.sin(o.now / 140);
    const cx = x0 + (game.next % SIZE) * cell;
    const cy = y0 + Math.floor(game.next / SIZE) * cell;
    ctx.strokeStyle = COLORS.accent;
    ctx.globalAlpha = 0.4 + 0.6 * phase;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx + 2.5, cy + 2.5, cell - 4, cell - 4);
    ctx.fillStyle = COLORS.accent;
    ctx.beginPath();
    ctx.arc(cx + cell / 2 + 0.5, cy + cell / 2 + 0.5, Math.max(1.5, cell * 0.07), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Brief flash on the last shot.
  if (o.lastShot) {
    const age = o.now - o.lastShot.t;
    if (age >= 0 && age < 320) {
      const k = age / 320;
      const cx = x0 + (o.lastShot.idx % SIZE) * cell + cell / 2 + 0.5;
      const cy = y0 + Math.floor(o.lastShot.idx / SIZE) * cell + cell / 2 + 0.5;
      ctx.strokeStyle = o.lastShot.result === "miss" ? COLORS.muted : COLORS.accent;
      ctx.globalAlpha = 1 - k;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, cell * (0.25 + 0.5 * k), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}
