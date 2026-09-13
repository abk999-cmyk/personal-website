/**
 * DynDEGA-M2 ("Method 2") — a real-coded genetic algorithm that starts
 * generational (GGA), watches its own elite population, and switches itself
 * one-way to steady-state (SSGA) when the elite centroid stagnates.
 *
 * Pure TypeScript, no DOM. Seeded (mulberry32) so runs are reproducible.
 * 2-D minimisation on a [-DOMAIN, DOMAIN]² box so it can be drawn.
 */

export type LandscapeId = "rastrigin" | "ackley" | "himmelblau" | "eggholder";
export type Phase = "GGA" | "SSGA";

export interface Point {
  x: number;
  y: number;
}

export interface Landscape {
  id: LandscapeId;
  label: string;
  f: (x: number, y: number) => number;
  /** Every global minimiser inside the domain (distance readout uses the nearest). */
  optima: readonly Point[];
  /** Global minimum value. */
  fmin: number;
}

export interface Individual {
  x: number;
  y: number;
  /** Fitness = -f (maximised). */
  fit: number;
}

/** Search space is [-DOMAIN, DOMAIN]² for every landscape. */
export const DOMAIN = 5;

/* ------------------------------------------------------------------ */
/* Landscapes                                                          */
/* ------------------------------------------------------------------ */

const TWO_PI = Math.PI * 2;

function rastrigin(x: number, y: number): number {
  return 20 + x * x - 10 * Math.cos(TWO_PI * x) + y * y - 10 * Math.cos(TWO_PI * y);
}

function ackley(x: number, y: number): number {
  const a = -20 * Math.exp(-0.2 * Math.sqrt(0.5 * (x * x + y * y)));
  const b = -Math.exp(0.5 * (Math.cos(TWO_PI * x) + Math.cos(TWO_PI * y)));
  return a + b + Math.E + 20;
}

function himmelblau(x: number, y: number): number {
  const a = x * x + y - 11;
  const b = x + y * y - 7;
  return a * a + b * b;
}

/**
 * Eggholder-lite: the classic Eggholder evaluated on a 400×400 window centred
 * on its textbook optimum (512, 404.2319), mapped onto [-5, 5]². The window
 * holds a single interior global minimum (found numerically) plus the usual
 * egg-carton of deceptive local basins.
 */
const EGG_S = 40;
const EGG_CU = 512;
const EGG_CV = 404.2319;
function eggholderLite(x: number, y: number): number {
  const u = EGG_CU + EGG_S * x;
  const v = EGG_CV + EGG_S * y;
  return -(v + 47) * Math.sin(Math.sqrt(Math.abs(u / 2 + v + 47))) - u * Math.sin(Math.sqrt(Math.abs(u - (v + 47))));
}

export const LANDSCAPES: readonly Landscape[] = [
  { id: "rastrigin", label: "Rastrigin", f: rastrigin, optima: [{ x: 0, y: 0 }], fmin: 0 },
  { id: "ackley", label: "Ackley", f: ackley, optima: [{ x: 0, y: 0 }], fmin: 0 },
  {
    id: "himmelblau",
    label: "Himmelblau",
    f: himmelblau,
    optima: [
      { x: 3, y: 2 },
      { x: -2.805118, y: 3.131312 },
      { x: -3.77931, y: -3.283186 },
      { x: 3.584428, y: -1.848126 },
    ],
    fmin: 0,
  },
  {
    id: "eggholder",
    label: "Eggholder-lite",
    f: eggholderLite,
    optima: [{ x: 2.576887, y: -0.911406 }],
    fmin: -1023.6314,
  },
];

export function getLandscape(id: LandscapeId): Landscape {
  const l = LANDSCAPES.find((l) => l.id === id);
  if (!l) throw new Error(`unknown landscape ${id}`);
  return l;
}

/* ------------------------------------------------------------------ */
/* RNG                                                                 */
/* ------------------------------------------------------------------ */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* GA parameters                                                       */
/* ------------------------------------------------------------------ */

export const POP_SIZE = 64;
/** Elite = top 20 % of the population. */
export const ELITE_SIZE = Math.ceil(POP_SIZE * 0.2); // 13
export const TOURNAMENT_K = 3;
export const BLX_ALPHA = 0.3;
/**
 * Gaussian mutation σ, as a fraction of the domain width (2·DOMAIN) → 0.8 on
 * the width-10 box. Tuned headless on Rastrigin (100 seeds): together with
 * pm = 0.25 the trigger fires in every run at gen 16–45 (median 23) and every
 * run ends within 0.05 of the optimum; the textbook σ = 0.25 / pm = 0.15 fires
 * at T_min in most runs and strands ~12 % of them in an f≈1 local basin.
 */
export const MUTATION_SIGMA_FRAC = 0.08;
export const MUTATION_P = 0.25;
export const ELITISM = 2;
/** SSGA children produced per outer iteration (keeps the animation lively). */
export const SSGA_PER_STEP = 8;

/* Method 2 trigger */
export const T_MIN = 15;
export const WINDOW = 10;
export const DELTA_THRESH = 0.02;
export const VAR_THRESH = 0.1;
export const EPS = 1e-9;

/* Run control */
export const POST_SWITCH_ITERS = 120;
/** The optimum early-exit only applies once the SSGA phase has been visible this long. */
export const MIN_SSGA_ITERS = 40;
export const BUDGET = 200;
export const FIXED_SWITCH_AT = BUDGET / 2;
export const OPT_TOLERANCE = 1e-3;
export const HARD_CAP = 400;

export interface EngineOptions {
  landscape: LandscapeId;
  seed: number;
  /** `null` → Method 2 trigger; a number → fixed-schedule switch at that generation. */
  fixedSwitchAt?: number | null;
  /** Tuning overrides (defaults: MUTATION_SIGMA_FRAC, MUTATION_P). */
  sigmaFrac?: number;
  mutationP?: number;
}

/** Immutable per-step readout for the UI. */
export interface Snapshot {
  seed: number;
  gen: number;
  phase: Phase;
  bestF: number;
  bestX: number;
  bestY: number;
  distToOpt: number;
  /** mean(Ω)/δ_ref, null until δ_ref exists. */
  deltaRatio: number | null;
  /** v_t / v_ref */
  varRatio: number;
  switchedAt: number | null;
  done: boolean;
  deltaRatioHistory: readonly (number | null)[];
  varRatioHistory: readonly number[];
}

export class DynDEGA {
  readonly landscape: Landscape;
  readonly seed: number;
  readonly fixedSwitchAt: number | null;

  /** Always sorted by fitness, best first. */
  pop: Individual[] = [];
  gen = 0;
  phase: Phase = "GGA";
  switchedAt: number | null = null;
  done = false;

  /** Elite centroid per outer iteration, index = generation. */
  centroidHistory: Point[] = [];
  deltaRef: number | null = null;
  varRef = 0;
  deltaRatio: number | null = null;
  varRatio = 1;
  deltaRatioHistory: (number | null)[] = [];
  varRatioHistory: number[] = [];

  private readonly rng: () => number;
  private readonly sigma: number;
  private readonly pm: number;
  private readonly deltaWindow: number[] = [];
  private gaussSpare: number | null = null;

  constructor(opts: EngineOptions) {
    this.landscape = getLandscape(opts.landscape);
    this.seed = opts.seed;
    this.fixedSwitchAt = opts.fixedSwitchAt ?? null;
    this.rng = mulberry32(opts.seed);
    this.sigma = (opts.sigmaFrac ?? MUTATION_SIGMA_FRAC) * 2 * DOMAIN;
    this.pm = opts.mutationP ?? MUTATION_P;

    for (let i = 0; i < POP_SIZE; i++) {
      const x = -DOMAIN + this.rng() * 2 * DOMAIN;
      const y = -DOMAIN + this.rng() * 2 * DOMAIN;
      this.pop.push({ x, y, fit: -this.landscape.f(x, y) });
    }
    this.sortPop();

    // t = 0 observation: seeds c_0 and v_ref.
    const c0 = this.eliteCentroid();
    this.centroidHistory.push(c0);
    this.varRef = Math.max(this.eliteVariance(), 1e-12);
    this.deltaRatioHistory.push(null);
    this.varRatioHistory.push(1);
  }

  get best(): Individual {
    return this.pop[0];
  }

  get bestF(): number {
    return -this.pop[0].fit;
  }

  get centroid(): Point {
    return this.centroidHistory[this.centroidHistory.length - 1];
  }

  get distToOpt(): number {
    const b = this.pop[0];
    let d = Infinity;
    for (const o of this.landscape.optima) {
      d = Math.min(d, Math.hypot(b.x - o.x, b.y - o.y));
    }
    return d;
  }

  /** One outer iteration: a full GGA generation or SSGA_PER_STEP steady-state insertions. */
  step(): void {
    if (this.done) return;

    if (this.phase === "GGA") {
      this.generational();
    } else {
      for (let i = 0; i < SSGA_PER_STEP; i++) this.steadyState();
    }
    this.gen++;
    this.observe();

    if (this.switchedAt !== null) {
      const since = this.gen - this.switchedAt;
      if (since >= POST_SWITCH_ITERS) this.done = true;
      if (since >= MIN_SSGA_ITERS && this.distToOpt < OPT_TOLERANCE) this.done = true;
    }
    if (this.gen >= HARD_CAP) this.done = true;
  }

  snapshot(): Snapshot {
    const b = this.pop[0];
    return {
      seed: this.seed,
      gen: this.gen,
      phase: this.phase,
      bestF: -b.fit,
      bestX: b.x,
      bestY: b.y,
      distToOpt: this.distToOpt,
      deltaRatio: this.deltaRatio,
      varRatio: this.varRatio,
      switchedAt: this.switchedAt,
      done: this.done,
      deltaRatioHistory: this.deltaRatioHistory.slice(),
      varRatioHistory: this.varRatioHistory.slice(),
    };
  }

  /* ---------------- Method 2 monitor ---------------- */

  private observe(): void {
    const prev = this.centroid;
    const c = this.eliteCentroid();
    this.centroidHistory.push(c);

    const delta = Math.hypot(c.x - prev.x, c.y - prev.y);
    if (this.deltaRef === null && delta > EPS) this.deltaRef = delta;
    this.deltaWindow.push(delta);
    if (this.deltaWindow.length > WINDOW) this.deltaWindow.shift();

    if (this.deltaRef !== null) {
      let sum = 0;
      for (const d of this.deltaWindow) sum += d;
      this.deltaRatio = sum / this.deltaWindow.length / this.deltaRef;
    }
    this.varRatio = this.eliteVariance() / this.varRef;
    this.deltaRatioHistory.push(this.deltaRatio);
    this.varRatioHistory.push(this.varRatio);

    if (this.phase !== "GGA") return;
    if (this.fixedSwitchAt !== null) {
      if (this.gen >= this.fixedSwitchAt) this.switchToSteadyState();
      return;
    }
    if (
      this.gen >= T_MIN &&
      this.deltaRatio !== null &&
      this.deltaRatio < DELTA_THRESH &&
      this.varRatio < VAR_THRESH
    ) {
      this.switchToSteadyState();
    }
  }

  private switchToSteadyState(): void {
    this.phase = "SSGA";
    this.switchedAt = this.gen;
  }

  private eliteCentroid(): Point {
    let sx = 0;
    let sy = 0;
    for (let i = 0; i < ELITE_SIZE; i++) {
      sx += this.pop[i].x;
      sy += this.pop[i].y;
    }
    return { x: sx / ELITE_SIZE, y: sy / ELITE_SIZE };
  }

  private eliteVariance(): number {
    let mean = 0;
    for (let i = 0; i < ELITE_SIZE; i++) mean += this.pop[i].fit;
    mean /= ELITE_SIZE;
    let v = 0;
    for (let i = 0; i < ELITE_SIZE; i++) {
      const d = this.pop[i].fit - mean;
      v += d * d;
    }
    return v / ELITE_SIZE;
  }

  /* ---------------- Operators ---------------- */

  private generational(): void {
    const next: Individual[] = [];
    for (let i = 0; i < ELITISM; i++) next.push({ ...this.pop[i] });
    while (next.length < POP_SIZE) next.push(this.makeChild());
    this.pop = next;
    this.sortPop();
  }

  private steadyState(): void {
    const child = this.makeChild();
    const worst = this.pop[POP_SIZE - 1];
    if (child.fit <= worst.fit) return;
    // Worst-incumbent replacement, keeping the array sorted.
    let i = POP_SIZE - 1;
    while (i > 0 && this.pop[i - 1].fit < child.fit) {
      this.pop[i] = this.pop[i - 1];
      i--;
    }
    this.pop[i] = child;
  }

  private makeChild(): Individual {
    const p1 = this.tournament();
    const p2 = this.tournament();
    let x = this.blx(p1.x, p2.x);
    let y = this.blx(p1.y, p2.y);
    if (this.rng() < this.pm) x += this.gauss() * this.sigma;
    if (this.rng() < this.pm) y += this.gauss() * this.sigma;
    x = clamp(x, -DOMAIN, DOMAIN);
    y = clamp(y, -DOMAIN, DOMAIN);
    return { x, y, fit: -this.landscape.f(x, y) };
  }

  /** Population is sorted, so the lowest index of K random draws is the winner. */
  private tournament(): Individual {
    let bestIdx = POP_SIZE;
    for (let i = 0; i < TOURNAMENT_K; i++) {
      const idx = Math.floor(this.rng() * POP_SIZE);
      if (idx < bestIdx) bestIdx = idx;
    }
    return this.pop[bestIdx];
  }

  private blx(a: number, b: number): number {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const d = (hi - lo) * BLX_ALPHA;
    return lo - d + this.rng() * (hi - lo + 2 * d);
  }

  private gauss(): number {
    if (this.gaussSpare !== null) {
      const s = this.gaussSpare;
      this.gaussSpare = null;
      return s;
    }
    let u = 0;
    let v = 0;
    while (u === 0) u = this.rng();
    while (v === 0) v = this.rng();
    const r = Math.sqrt(-2 * Math.log(u));
    const t = TWO_PI * v;
    this.gaussSpare = r * Math.sin(t);
    return r * Math.cos(t);
  }

  private sortPop(): void {
    this.pop.sort((a, b) => b.fit - a.fit);
  }
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
