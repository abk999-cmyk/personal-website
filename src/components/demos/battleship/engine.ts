/**
 * Battleship ensemble agent — browser-sized slice of the paper's agent.
 *
 * Implements two of the four strategy heatmaps that the full ensemble blends
 * (probability-density enumeration and a light Monte-Carlo occupancy sampler)
 * and combines them with the paper's sequential, scale-preserving blend.
 * Pure TypeScript, no DOM, deterministic given a seed.
 */

export const SIZE = 10;
export const CELLS = SIZE * SIZE;
export const FLEET: readonly number[] = [5, 4, 3, 3, 2];

/** Sequential blend weight given to the Monte-Carlo map (paper value). */
export const BLEND_W = 0.45;
/** Per-hit multiplicative weight for placements that explain unresolved hits. */
export const HIT_BONUS = 40;

export const UNKNOWN = 0;
export const MISS = 1;
export const HIT = 2;
export const SUNK = 3;

export type Rng = () => number;

/** mulberry32 — tiny seeded PRNG, returns floats in [0, 1). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Ship {
  r: number;
  c: number;
  len: number;
  horiz: boolean;
  hits: number;
  sunk: boolean;
}

export interface ShotEvent {
  idx: number;
  result: "miss" | "hit" | "sunk";
  /** Length of the ship sunk by this shot (0 otherwise). */
  sunkLen: number;
  won: boolean;
}

/** What the agent is allowed to see. */
export interface BoardView {
  shots: Uint8Array;
  remaining: readonly number[];
}

export const cellIndex = (r: number, c: number): number => r * SIZE + c;

export function fits(r: number, c: number, len: number, horiz: boolean): boolean {
  if (r < 0 || c < 0 || r >= SIZE || c >= SIZE) return false;
  return horiz ? c + len <= SIZE : r + len <= SIZE;
}

export function shipCovers(s: Ship, r: number, c: number): boolean {
  return s.horiz
    ? r === s.r && c >= s.c && c < s.c + s.len
    : c === s.c && r >= s.r && r < s.r + s.len;
}

/** Legal placement against an existing fleet: on-board and no overlap (touching is fine). */
export function canPlace(
  ships: readonly Ship[],
  r: number,
  c: number,
  len: number,
  horiz: boolean,
): boolean {
  if (!fits(r, c, len, horiz)) return false;
  for (let k = 0; k < len; k++) {
    const rr = horiz ? r : r + k;
    const cc = horiz ? c + k : c;
    for (const s of ships) if (shipCovers(s, rr, cc)) return false;
  }
  return true;
}

export function placeFleet(rng: Rng): Ship[] {
  const ships: Ship[] = [];
  for (const len of FLEET) {
    for (;;) {
      const horiz = rng() < 0.5;
      const r = Math.floor(rng() * (horiz ? SIZE : SIZE - len + 1));
      const c = Math.floor(rng() * (horiz ? SIZE - len + 1 : SIZE));
      if (canPlace(ships, r, c, len, horiz)) {
        ships.push({ r, c, len, horiz, hits: 0, sunk: false });
        break;
      }
    }
  }
  return ships;
}

/**
 * Number of unresolved hits a placement covers, or -1 when it touches a
 * miss / sunk cell (i.e. is inconsistent with the evidence).
 */
function placementHits(shots: Uint8Array, r: number, c: number, len: number, horiz: boolean): number {
  let hits = 0;
  for (let k = 0; k < len; k++) {
    const s = shots[horiz ? r * SIZE + c + k : (r + k) * SIZE + c];
    if (s === MISS || s === SUNK) return -1;
    if (s === HIT) hits++;
  }
  return hits;
}

/**
 * Probability-density heatmap. For every remaining ship length, enumerate every
 * placement consistent with the board and add its weight to each covered cell.
 * Placements that explain unresolved hits get HIT_BONUS per hit covered, which
 * is what switches the agent from hunting into targeting.
 */
export function pdfHeatmap(view: BoardView): Float64Array {
  const { shots, remaining } = view;
  const heat = new Float64Array(CELLS);
  for (const len of remaining) {
    for (let o = 0; o < 2; o++) {
      const horiz = o === 1;
      const rows = horiz ? SIZE : SIZE - len + 1;
      const cols = horiz ? SIZE - len + 1 : SIZE;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const hits = placementHits(shots, r, c, len, horiz);
          if (hits < 0) continue;
          const w = hits > 0 ? Math.pow(HIT_BONUS, hits) : 1;
          for (let k = 0; k < len; k++) {
            heat[horiz ? r * SIZE + c + k : (r + k) * SIZE + c] += w;
          }
        }
      }
    }
  }
  for (let i = 0; i < CELLS; i++) if (shots[i] !== UNKNOWN) heat[i] = 0;
  return heat;
}

/** Placement is legal for sampling: no miss/sunk cell and no overlap with ships already sampled. */
function sampleFree(
  shots: Uint8Array,
  occ: Uint8Array,
  r: number,
  c: number,
  len: number,
  horiz: boolean,
): boolean {
  for (let k = 0; k < len; k++) {
    const i = horiz ? r * SIZE + c + k : (r + k) * SIZE + c;
    if (occ[i] !== 0 || shots[i] === MISS || shots[i] === SUNK) return false;
  }
  return true;
}

function occupy(occ: Uint8Array, r: number, c: number, len: number, horiz: boolean): void {
  for (let k = 0; k < len; k++) occ[horiz ? r * SIZE + c + k : (r + k) * SIZE + c] = 1;
}

/** Sample a legal placement of `len` that passes through `anchor`. */
function placeThrough(
  shots: Uint8Array,
  occ: Uint8Array,
  anchor: number,
  len: number,
  rng: Rng,
  scratch: number[],
): boolean {
  const ar = Math.floor(anchor / SIZE);
  const ac = anchor % SIZE;
  scratch.length = 0;
  for (let c = Math.max(0, ac - len + 1); c <= Math.min(ac, SIZE - len); c++) {
    if (sampleFree(shots, occ, ar, c, len, true)) scratch.push(ar * SIZE + c);
  }
  for (let r = Math.max(0, ar - len + 1); r <= Math.min(ar, SIZE - len); r++) {
    if (sampleFree(shots, occ, r, ac, len, false)) scratch.push(CELLS + r * SIZE + ac);
  }
  if (scratch.length === 0) return false;
  const pick = scratch[Math.floor(rng() * scratch.length)];
  const horiz = pick < CELLS;
  const start = horiz ? pick : pick - CELLS;
  occupy(occ, Math.floor(start / SIZE), start % SIZE, len, horiz);
  return true;
}

/** Sample a uniformly random legal placement of `len` (random tries, then exhaustive fallback). */
function placeRandom(
  shots: Uint8Array,
  occ: Uint8Array,
  len: number,
  rng: Rng,
  scratch: number[],
): boolean {
  for (let t = 0; t < 24; t++) {
    const horiz = rng() < 0.5;
    const r = Math.floor(rng() * (horiz ? SIZE : SIZE - len + 1));
    const c = Math.floor(rng() * (horiz ? SIZE - len + 1 : SIZE));
    if (sampleFree(shots, occ, r, c, len, horiz)) {
      occupy(occ, r, c, len, horiz);
      return true;
    }
  }
  scratch.length = 0;
  for (let o = 0; o < 2; o++) {
    const horiz = o === 1;
    const rows = horiz ? SIZE : SIZE - len + 1;
    const cols = horiz ? SIZE - len + 1 : SIZE;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (sampleFree(shots, occ, r, c, len, horiz)) scratch.push((horiz ? 0 : CELLS) + r * SIZE + c);
      }
    }
  }
  if (scratch.length === 0) return false;
  const pick = scratch[Math.floor(rng() * scratch.length)];
  const horiz = pick < CELLS;
  const start = horiz ? pick : pick - CELLS;
  occupy(occ, Math.floor(start / SIZE), start % SIZE, len, horiz);
  return true;
}

/**
 * Monte-Carlo occupancy heatmap. Draws up to `samples` complete fleets that
 * are consistent with the board (rejection sampling; proposals are anchored
 * on unresolved hits so the acceptance rate stays usable late in a game) and
 * returns each cell's occupancy frequency. Total proposals are capped so a
 * pathological board cannot stall a frame.
 */
export function monteCarloHeatmap(view: BoardView, samples: number, rng: Rng): Float64Array {
  const { shots, remaining } = view;
  const out = new Float64Array(CELLS);
  const n = remaining.length;
  if (n === 0) return out;

  const hitCells: number[] = [];
  for (let i = 0; i < CELLS; i++) if (shots[i] === HIT) hitCells.push(i);

  const occ = new Uint8Array(CELLS);
  const order = remaining.slice();
  const uncovered: number[] = [];
  const scratch: number[] = [];
  let accepted = 0;
  const maxProposals = samples * 6;

  for (let p = 0; p < maxProposals && accepted < samples; p++) {
    occ.fill(0);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = order[i];
      order[i] = order[j];
      order[j] = t;
    }
    uncovered.length = 0;
    for (const h of hitCells) uncovered.push(h);

    let ok = true;
    for (const len of order) {
      let placed = false;
      if (uncovered.length > 0) {
        const anchor = uncovered[Math.floor(rng() * uncovered.length)];
        placed = placeThrough(shots, occ, anchor, len, rng, scratch);
      }
      if (!placed) placed = placeRandom(shots, occ, len, rng, scratch);
      if (!placed) {
        ok = false;
        break;
      }
      for (let i = uncovered.length - 1; i >= 0; i--) {
        if (occ[uncovered[i]] !== 0) {
          uncovered[i] = uncovered[uncovered.length - 1];
          uncovered.pop();
        }
      }
    }
    if (!ok || uncovered.length > 0) continue;
    accepted++;
    for (let i = 0; i < CELLS; i++) out[i] += occ[i];
  }

  if (accepted > 0) {
    for (let i = 0; i < CELLS; i++) out[i] = shots[i] === UNKNOWN ? out[i] / accepted : 0;
  }
  return out;
}

/**
 * Sequential scale-preserving blend (paper): rescale the MC map to the PDF
 * map's maximum, then mix linearly with weight `w` on the MC side.
 */
export function blend(pdf: Float64Array, mc: Float64Array, w: number = BLEND_W): Float64Array {
  let pMax = 0;
  let mMax = 0;
  for (let i = 0; i < CELLS; i++) {
    if (pdf[i] > pMax) pMax = pdf[i];
    if (mc[i] > mMax) mMax = mc[i];
  }
  const out = new Float64Array(CELLS);
  if (mMax <= 0) {
    out.set(pdf);
    return out;
  }
  if (pMax <= 0) {
    out.set(mc);
    return out;
  }
  const s = pMax / mMax;
  for (let i = 0; i < CELLS; i++) out[i] = (1 - w) * pdf[i] + w * mc[i] * s;
  return out;
}

/** Argmax over unshot cells with a seeded tie-break; random unshot cell if the map is flat zero. */
export function chooseShot(heat: Float64Array, shots: Uint8Array, rng: Rng): number {
  let best = -1;
  const ties: number[] = [];
  for (let i = 0; i < CELLS; i++) {
    if (shots[i] !== UNKNOWN) continue;
    const h = heat[i];
    if (h > best + 1e-9) {
      best = h;
      ties.length = 0;
      ties.push(i);
    } else if (Math.abs(h - best) <= 1e-9) {
      ties.push(i);
    }
  }
  if (ties.length === 0) return -1;
  return ties[Math.floor(rng() * ties.length)];
}

export interface GameOptions {
  /** Pre-placed fleet (e.g. the visitor's own). Cloned; hit counters reset. */
  ships?: readonly Ship[];
  /** Monte-Carlo samples per decision. */
  samples: number;
}

/** One game: hidden fleet, the agent's knowledge, and the live blended heatmap. */
export class Game {
  readonly ships: Ship[];
  readonly shots = new Uint8Array(CELLS);
  readonly remaining: number[];
  readonly samples: number;
  moves = 0;
  /** Blended heatmap the next shot is chosen from (zero on shot cells). */
  heat: Float64Array = new Float64Array(CELLS);
  /** Cell the agent will fire at next, -1 once the game is over. */
  next = -1;
  private readonly rng: Rng;

  constructor(seed: number, opts: GameOptions) {
    this.rng = mulberry32(seed);
    this.samples = opts.samples;
    this.ships = opts.ships
      ? opts.ships.map((s) => ({ ...s, hits: 0, sunk: false }))
      : placeFleet(this.rng);
    this.remaining = this.ships.map((s) => s.len);
    this.think();
  }

  get shipsLeft(): number {
    return this.remaining.length;
  }

  isWon(): boolean {
    return this.remaining.length === 0;
  }

  /** Recompute the blended heatmap and pick the next cell. */
  think(): void {
    if (this.isWon()) {
      this.heat.fill(0);
      this.next = -1;
      return;
    }
    const view: BoardView = { shots: this.shots, remaining: this.remaining };
    const pdf = pdfHeatmap(view);
    const mc = monteCarloHeatmap(view, this.samples, this.rng);
    this.heat = blend(pdf, mc);
    this.next = chooseShot(this.heat, this.shots, this.rng);
  }

  /** Fire at the chosen cell, apply feedback, then think about the next one. */
  step(): ShotEvent | null {
    const idx = this.next;
    if (idx < 0 || this.shots[idx] !== UNKNOWN) return null;
    const r = Math.floor(idx / SIZE);
    const c = idx % SIZE;
    this.moves++;

    let result: ShotEvent["result"] = "miss";
    let sunkLen = 0;
    for (const s of this.ships) {
      if (s.sunk || !shipCovers(s, r, c)) continue;
      s.hits++;
      result = "hit";
      this.shots[idx] = HIT;
      if (s.hits === s.len) {
        s.sunk = true;
        result = "sunk";
        sunkLen = s.len;
        for (let k = 0; k < s.len; k++) {
          this.shots[s.horiz ? s.r * SIZE + s.c + k : (s.r + k) * SIZE + s.c] = SUNK;
        }
        const at = this.remaining.indexOf(s.len);
        if (at >= 0) this.remaining.splice(at, 1);
      }
      break;
    }
    if (result === "miss") this.shots[idx] = MISS;

    this.think();
    return { idx, result, sunkLen, won: this.isWon() };
  }
}

/** Moves-per-game bookkeeping for one browser session. */
export class SessionStats {
  readonly history: number[] = [];
  private total = 0;

  record(moves: number): void {
    this.history.push(moves);
    this.total += moves;
  }

  get games(): number {
    return this.history.length;
  }

  /** Mean moves per completed game, or NaN before the first win. */
  get mean(): number {
    return this.history.length === 0 ? NaN : this.total / this.history.length;
  }
}
