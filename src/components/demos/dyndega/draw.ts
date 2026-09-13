/**
 * Canvas 2D renderer for the DynDEGA demo.
 *
 * The landscape is rasterised once (per size / landscape) into an offscreen
 * canvas as a rank-equalised grayscale heightmap with subtle contour lines;
 * every frame then blits that image and draws the population on top.
 */

import { DOMAIN, ELITE_SIZE, type DynDEGA, type Landscape } from "./engine";

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

/** Upper bound on heightmap samples so a resize never stalls a frame. */
const HEIGHTMAP_MAX_SAMPLES = 600_000;
/** Resolution of the grid used to estimate the value→rank mapping. */
const QUANTILE_GRID = 96;
const CONTOUR_LEVELS = 11;
/** Gamma on the rank so most of the box stays dark and only the peaks brighten. */
const HEIGHT_GAMMA = 1.5;
/** Rebuild the heightmap only once the size has been stable this long. */
const REBUILD_SETTLE_MS = 120;
const TRAIL_LENGTH = 90;

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const STOP_LOW = hexToRgb(COLORS.ink);
const STOP_MID = hexToRgb(COLORS.line2);
const STOP_HIGH = hexToRgb(COLORS.muted);

function gradient(t: number, out: Rgb): void {
  let a: Rgb;
  let b: Rgb;
  let u: number;
  if (t < 0.5) {
    a = STOP_LOW;
    b = STOP_MID;
    u = t * 2;
  } else {
    a = STOP_MID;
    b = STOP_HIGH;
    u = (t - 0.5) * 2;
  }
  out[0] = a[0] + (b[0] - a[0]) * u;
  out[1] = a[1] + (b[1] - a[1]) * u;
  out[2] = a[2] + (b[2] - a[2]) * u;
}

/** Index of the first element >= v in a sorted array. */
function lowerBound(sorted: Float64Array, v: number): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sorted[mid] < v) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function buildHeightmap(landscape: Landscape, cssW: number, cssH: number, dpr: number): HTMLCanvasElement {
  const scale = Math.min(dpr, Math.sqrt(HEIGHTMAP_MAX_SAMPLES / Math.max(1, cssW * cssH)));
  const sw = Math.max(1, Math.round(cssW * scale));
  const sh = Math.max(1, Math.round(cssH * scale));

  // Value → rank mapping estimated from a coarse grid (histogram equalisation).
  const q = new Float64Array(QUANTILE_GRID * QUANTILE_GRID);
  for (let j = 0; j < QUANTILE_GRID; j++) {
    const y = DOMAIN - ((j + 0.5) / QUANTILE_GRID) * 2 * DOMAIN;
    for (let i = 0; i < QUANTILE_GRID; i++) {
      const x = -DOMAIN + ((i + 0.5) / QUANTILE_GRID) * 2 * DOMAIN;
      q[j * QUANTILE_GRID + i] = landscape.f(x, y);
    }
  }
  q.sort();

  const levels = new Uint8Array(sw * sh);
  const ranks = new Float32Array(sw * sh);
  for (let j = 0; j < sh; j++) {
    const y = DOMAIN - ((j + 0.5) / sh) * 2 * DOMAIN;
    for (let i = 0; i < sw; i++) {
      const x = -DOMAIN + ((i + 0.5) / sw) * 2 * DOMAIN;
      const t = lowerBound(q, landscape.f(x, y)) / q.length;
      const k = j * sw + i;
      ranks[k] = t;
      levels[k] = Math.min(CONTOUR_LEVELS - 1, Math.floor(t * CONTOUR_LEVELS));
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const img = ctx.createImageData(sw, sh);
  const data = img.data;
  const rgb: Rgb = [0, 0, 0];
  for (let j = 0; j < sh; j++) {
    for (let i = 0; i < sw; i++) {
      const k = j * sw + i;
      gradient(Math.pow(ranks[k], HEIGHT_GAMMA), rgb);
      const lvl = levels[k];
      const edge = (i > 0 && levels[k - 1] !== lvl) || (j > 0 && levels[k - sw] !== lvl);
      const lift = edge ? 12 : 0;
      const p = k * 4;
      data[p] = Math.min(255, rgb[0] + lift);
      data[p + 1] = Math.min(255, rgb[1] + lift);
      data[p + 2] = Math.min(255, rgb[2] + lift);
      data[p + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

export class Renderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private heightmap: HTMLCanvasElement | null = null;
  private heightmapFor: Landscape | null = null;
  private heightmapStale = true;
  private staleSince = 0;

  static create(canvas: HTMLCanvasElement): Renderer | null {
    const ctx = canvas.getContext("2d");
    return ctx ? new Renderer(canvas, ctx) : null;
  }

  private constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  /** CSS-pixel size of the drawing surface. */
  resize(cssW: number, cssH: number, dpr: number): void {
    const w = Math.max(0, Math.floor(cssW));
    const h = Math.max(0, Math.floor(cssH));
    if (w === this.w && h === this.h && dpr === this.dpr) return;
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    this.canvas.width = Math.max(1, Math.round(w * dpr));
    this.canvas.height = Math.max(1, Math.round(h * dpr));
    this.heightmapStale = true;
    this.staleSince = performance.now();
  }

  draw(engine: DynDEGA, now: number = performance.now()): void {
    const { ctx, w, h, dpr } = this;
    if (w === 0 || h === 0) return;

    const landscape = engine.landscape;
    const needsBuild =
      this.heightmap === null ||
      this.heightmapFor !== landscape ||
      (this.heightmapStale && now - this.staleSince >= REBUILD_SETTLE_MS);
    if (needsBuild) {
      this.heightmap = buildHeightmap(landscape, w, h, dpr);
      this.heightmapFor = landscape;
      this.heightmapStale = false;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    if (this.heightmap) ctx.drawImage(this.heightmap, 0, 0, w, h);

    const sx = (x: number) => ((x + DOMAIN) / (2 * DOMAIN)) * w;
    const sy = (y: number) => ((DOMAIN - y) / (2 * DOMAIN)) * h;

    // Global optimum crosshair(s).
    ctx.strokeStyle = COLORS.dim;
    ctx.lineWidth = 1;
    for (const o of landscape.optima) {
      const cx = Math.round(sx(o.x)) + 0.5;
      const cy = Math.round(sy(o.y)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(cx - 9, cy);
      ctx.lineTo(cx - 3, cy);
      ctx.moveTo(cx + 3, cy);
      ctx.lineTo(cx + 9, cy);
      ctx.moveTo(cx, cy - 9);
      ctx.lineTo(cx, cy - 3);
      ctx.moveTo(cx, cy + 3);
      ctx.lineTo(cx, cy + 9);
      ctx.stroke();
    }

    // Centroid trail: fading polyline, newest segment brightest.
    const hist = engine.centroidHistory;
    const start = Math.max(0, hist.length - TRAIL_LENGTH);
    const span = hist.length - 1 - start;
    if (span > 0) {
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.strokeStyle = COLORS.accent;
      for (let i = start; i < hist.length - 1; i++) {
        const a = hist[i];
        const b = hist[i + 1];
        ctx.globalAlpha = 0.06 + 0.6 * ((i - start) / span);
        ctx.beginPath();
        ctx.moveTo(sx(a.x), sy(a.y));
        ctx.lineTo(sx(b.x), sy(b.y));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Individuals: worst first so the elite sits on top. Ink halo for contrast.
    const pop = engine.pop;
    const dot = engine.phase === "GGA" ? COLORS.muted : COLORS.accent;
    for (let i = pop.length - 1; i >= 0; i--) {
      const p = pop[i];
      const r = i < ELITE_SIZE ? 2.1 : 1.3;
      const px = sx(p.x);
      const py = sy(p.y);
      ctx.fillStyle = COLORS.ink;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(px, py, r + 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = dot;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Elite centroid ring.
    const c = engine.centroid;
    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sx(c.x), sy(c.y), 6, 0, Math.PI * 2);
    ctx.stroke();
  }
}
