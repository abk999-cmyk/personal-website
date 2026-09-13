/**
 * Deterministic, scripted simulation of the MaineHealth cascading MILP scheduler.
 *
 * The real solver (OR-Tools CBC, ~60 cardiologists, 46 services, 14 constraint
 * types) cannot run in the browser. This module builds a small, real greedy
 * assignment over a 52-week x P-physician grid that respects its own simple
 * rules, and emits a replayable timeline of cell-fill events tagged by stage so
 * the canvas can animate the cascade identically on every reload.
 */

export const WEEKS = 52;
export const QUARTER_WEEKS = 13;
export const QUARTERS = 4;
export const STAGE_COUNT = 8;
/** Solver wall-clock the readout counts up to: 3:41. */
export const SOLVER_SECONDS = 221;

/** Headline numbers from the production system (shown as copy, not computed). */
export const PRODUCTION = {
  physicians: 60,
  groups: 5,
  services: 46,
  assignments: "8,500+",
  happiness: 91,
  solveTime: "3:41",
} as const;

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

export interface ServiceDef {
  readonly label: string;
  /** 0..5 = grey ramp index; -1 = CALL (accent-deep); -2 = OFF (line-2). */
  readonly ramp: number;
}

export const SERVICES: readonly ServiceDef[] = [
  { label: "LAB", ramp: 5 },
  { label: "BOU", ramp: 2 },
  { label: "WAT", ramp: 2 },
  { label: "OPT", ramp: 1 },
  { label: "CALL", ramp: -1 },
  { label: "CLINIC", ramp: 3 },
  { label: "ECHO", ramp: 4 },
  { label: "CATH", ramp: 4 },
  { label: "RESEARCH", ramp: 0 },
  { label: "ADMIN", ramp: 0 },
  { label: "OFF", ramp: -2 },
];
export const CALL = 4;
export const OFF = 10;
const WORK_SERVICES = [0, 1, 2, 3, 5, 6, 7, 8, 9];
const WORK_PER_GROUP = 7;

const GROUP_DEFS: readonly { name: string; short: string }[] = [
  { name: "EP", short: "EP" },
  { name: "Interventional", short: "INT" },
  { name: "Heart Failure", short: "HF" },
  { name: "Imaging", short: "IMG" },
  { name: "General", short: "GEN" },
];

export const STAGE_NAMES: readonly string[] = [
  "Holidays & vacations",
  "Skeleton: call coverage",
  "Group EP",
  "Group Interventional",
  "Group Heart Failure",
  "Group Imaging",
  "Group General",
  "Soft-constraint repair",
];

/** Share of solver time per stage; group stages split 0.76 by cell count. */
const SHARE_PREFILL = 0.03;
const SHARE_SKELETON = 0.07;
const SHARE_GROUPS = 0.76;
const SHARE_REPAIR = 0.14;

/** Scripted "happiness so far" at the end of each stage (-1 = not yet scored). */
const HAPPINESS_END = [-1, 61, 66, 70, 74, 77, 78, 91];
const HAPPINESS_START = 52;

/** Cap slack over the round-robin minimum for per-quarter service limits. */
const CAP_SLACK = 1.75;
/** Score bonus for continuing last week's service (block variable compression). */
const BLOCK_BONUS = 4;

export interface Requirement {
  readonly service: number;
  readonly count: number;
}

export interface Group {
  readonly id: number;
  readonly name: string;
  readonly short: string;
  readonly start: number;
  readonly size: number;
  /** All service ids this group uses (CALL, work services, OFF). */
  readonly services: readonly number[];
  /** Weekly headcount that must be met per service. */
  readonly required: readonly Requirement[];
  /** Filler services used when a physician is otherwise free. */
  readonly flex: readonly number[];
  /** Max assignments of a service per physician per quarter, by service id. */
  readonly cap: Uint8Array;
}

export interface Physician {
  readonly row: number;
  readonly group: number;
  readonly label: string;
  readonly preferred: number;
  readonly disliked: number;
}

export interface FillEvent {
  readonly kind: "fill";
  readonly stage: number;
  /** Normalised timeline position in [0, 1]. */
  t: number;
  readonly week: number;
  readonly row: number;
  readonly service: number;
}

export interface SwapEvent {
  readonly kind: "swap";
  readonly stage: number;
  t: number;
  readonly week: number;
  readonly rowA: number;
  readonly rowB: number;
  /** Service rowA holds after the swap. */
  readonly serviceA: number;
  /** Service rowB holds after the swap. */
  readonly serviceB: number;
}

export type SolveEvent = FillEvent | SwapEvent;

export interface StageSummary {
  readonly index: number;
  readonly name: string;
  /** Event index range [first, last). */
  readonly first: number;
  readonly last: number;
  readonly tStart: number;
  readonly tEnd: number;
  /** Group id for group stages, otherwise -1. */
  readonly group: number;
  /** Cumulative counts at the end of the stage. */
  readonly assignments: number;
  readonly checks: number;
  readonly happiness: number;
}

export interface Solve {
  readonly seed: number;
  readonly rows: number;
  readonly groups: readonly Group[];
  readonly physicians: readonly Physician[];
  readonly events: readonly SolveEvent[];
  readonly stages: readonly StageSummary[];
  /** Final grid, row * WEEKS + week -> service id (-1 = unassigned). */
  readonly grid: Int8Array;
  readonly assignments: number;
  readonly checks: number;
  readonly offCells: number;
  /** Times the greedy had to relax a quarter cap. Should be 0. */
  readonly capViolations: number;
}

/** Number of constraint evaluations attributed to an event (for the readout). */
export function checksFor(ev: SolveEvent): number {
  if (ev.kind === "swap") return 14;
  if (ev.service === OFF) return 2;
  if (ev.service === CALL) return 9;
  return 14;
}

function groupSizes(rows: number): number[] {
  if (rows === 18) return [3, 4, 3, 4, 4];
  if (rows === 32) return [5, 8, 5, 6, 8];
  const sizes = [3, 3, 3, 3, 3];
  const order = [1, 4, 3, 0, 2];
  const target = Math.max(15, Math.min(40, rows));
  let total = 15;
  let i = 0;
  while (total < target) {
    const g = order[i % order.length];
    if (sizes[g] < 8) {
      sizes[g]++;
      total++;
    }
    i++;
  }
  return sizes;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function quarterOf(week: number): number {
  return Math.floor(week / QUARTER_WEEKS);
}

export function buildSchedule(seed: number, rowsWanted: number): Solve {
  const rng = mulberry32(seed);
  const sizes = groupSizes(rowsWanted);
  const rows = sizes.reduce((a, b) => a + b, 0);
  const S = SERVICES.length;

  // ---- groups & physicians -------------------------------------------------
  const groups: Group[] = [];
  const physicians: Physician[] = [];
  let start = 0;
  for (let g = 0; g < GROUP_DEFS.length; g++) {
    const size = sizes[g];
    const work = shuffle(WORK_SERVICES.slice(), rng).slice(0, WORK_PER_GROUP);
    const reqTotal = size - 2;
    const nReq = Math.min(reqTotal, 5);
    const required: { service: number; count: number }[] = [];
    for (let i = 0; i < nReq; i++) required.push({ service: work[i], count: 1 });
    for (let i = 0; i < reqTotal - nReq; i++) required[i % nReq].count++;
    const flex = work.slice(nReq);
    const cap = new Uint8Array(S);
    for (const r of required) {
      cap[r.service] = Math.max(2, Math.ceil(((QUARTER_WEEKS * r.count) / size) * CAP_SLACK));
    }
    for (const f of flex) cap[f] = QUARTER_WEEKS;
    cap[CALL] = Math.max(2, Math.ceil((QUARTER_WEEKS / size) * CAP_SLACK));
    cap[OFF] = QUARTER_WEEKS;
    const def = GROUP_DEFS[g];
    groups.push({
      id: g,
      name: def.name,
      short: def.short,
      start,
      size,
      services: [CALL, ...work, OFF],
      required,
      flex,
      cap,
    });
    for (let i = 0; i < size; i++) {
      const preferred = work[Math.floor(rng() * work.length)];
      let disliked = work[Math.floor(rng() * work.length)];
      if (disliked === preferred) disliked = work[(work.indexOf(preferred) + 1) % work.length];
      physicians.push({
        row: start + i,
        group: g,
        label: `${def.short}-${String(i + 1).padStart(2, "0")}`,
        preferred,
        disliked,
      });
    }
    start += size;
  }

  // ---- mutable solve state -------------------------------------------------
  const grid = new Int8Array(rows * WEEKS).fill(-1);
  const qc = new Uint8Array(rows * QUARTERS * S);
  const total = new Uint16Array(rows);
  const qIdx = (row: number, week: number, s: number) => (row * QUARTERS + quarterOf(week)) * S + s;
  const cellAt = (row: number, week: number) => grid[row * WEEKS + week];
  const set = (row: number, week: number, s: number) => {
    grid[row * WEEKS + week] = s;
    qc[qIdx(row, week, s)]++;
    if (s !== OFF) total[row]++;
  };
  const unset = (row: number, week: number) => {
    const s = grid[row * WEEKS + week];
    if (s < 0) return;
    qc[qIdx(row, week, s)]--;
    if (s !== OFF) total[row]--;
    grid[row * WEEKS + week] = -1;
  };

  const events: SolveEvent[] = [];
  const stageFirst: number[] = [];
  let capViolations = 0;
  let offCells = 0;

  // ---- stage 0: holidays & vacations (prescheduled OFF cells) --------------
  stageFirst.push(events.length);
  const offCount = new Uint8Array(groups.length * WEEKS);
  const prefill: { row: number; week: number }[] = [];
  const placeOff = (row: number, g: number, week: number) => {
    set(row, week, OFF);
    offCount[g * WEEKS + week]++;
    prefill.push({ row, week });
    offCells++;
  };
  for (const p of physicians) {
    const g = p.group;
    const nWeeks = 3 + Math.floor(rng() * 3);
    const blocks =
      nWeeks >= 4 && rng() < 0.6 ? [Math.ceil(nWeeks / 2), Math.floor(nWeeks / 2)] : [nWeeks];
    for (const len of blocks) {
      let placed = false;
      for (let attempt = 0; attempt < 60 && !placed; attempt++) {
        const s0 = Math.floor(rng() * (WEEKS - len + 1));
        let ok = true;
        for (let w = s0; w < s0 + len; w++) {
          if (offCount[g * WEEKS + w] > 0 || cellAt(p.row, w) !== -1) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;
        for (let w = s0; w < s0 + len; w++) placeOff(p.row, g, w);
        placed = true;
      }
      if (!placed) {
        let need = len;
        for (let w = 0; w < WEEKS && need > 0; w++) {
          if (offCount[g * WEEKS + w] === 0 && cellAt(p.row, w) === -1) {
            placeOff(p.row, g, w);
            need--;
          }
        }
      }
    }
  }
  prefill.sort((a, b) => a.week - b.week || a.row - b.row);
  for (const c of prefill) {
    events.push({ kind: "fill", stage: 0, t: 0, week: c.week, row: c.row, service: OFF });
  }

  // ---- greedy picker shared by skeleton and group stages -------------------
  const pick = (grp: Group, week: number, service: number, stage: number): number => {
    let best = -1;
    let bestScore = Infinity;
    let fallback = -1;
    let fallbackScore = Infinity;
    for (let r = grp.start; r < grp.start + grp.size; r++) {
      if (cellAt(r, week) !== -1) continue;
      const count = qc[qIdx(r, week, service)];
      const prev = week > 0 ? cellAt(r, week - 1) : -1;
      let score: number;
      if (service === CALL) {
        score = count * 3 + (prev === CALL ? 6 : 0) + rng();
      } else {
        // Workload balance first, then spread the service across the quarter,
        // with a block-continuity bonus so assignments form multi-week runs.
        score = total[r] + count * 3 - (prev === service ? BLOCK_BONUS : 0) + rng();
      }
      if (count < grp.cap[service]) {
        if (score < bestScore) {
          bestScore = score;
          best = r;
        }
      } else if (score < fallbackScore) {
        fallbackScore = score;
        fallback = r;
      }
    }
    if (best === -1 && fallback !== -1) {
      capViolations++;
      best = fallback;
    }
    if (best !== -1) {
      set(best, week, service);
      events.push({ kind: "fill", stage, t: 0, week, row: best, service });
    }
    return best;
  };

  // ---- stage 1: skeleton call coverage -------------------------------------
  stageFirst.push(events.length);
  for (let w = 0; w < WEEKS; w++) {
    for (const grp of groups) pick(grp, w, CALL, 1);
  }

  // ---- stages 2..6: one group at a time ------------------------------------
  const eligibleCount = (grp: Group, week: number, service: number): number => {
    let n = 0;
    for (let r = grp.start; r < grp.start + grp.size; r++) {
      if (cellAt(r, week) === -1 && qc[qIdx(r, week, service)] < grp.cap[service]) n++;
    }
    return n;
  };
  for (const grp of groups) {
    const stage = 2 + grp.id;
    stageFirst.push(events.length);
    const reqs = grp.required;
    const slots = reqs.reduce((a, r) => a + r.count, 0);
    for (let w = 0; w < WEEKS; w++) {
      // Most-constrained-first: fill the service with the least slack
      // (eligible physicians minus remaining demand) before the others.
      const remaining = reqs.map((r) => r.count);
      for (let slot = 0; slot < slots; slot++) {
        let bestIdx = -1;
        let bestSlack = Infinity;
        for (let i = 0; i < reqs.length; i++) {
          if (remaining[i] === 0) continue;
          const slack = eligibleCount(grp, w, reqs[i].service) - remaining[i];
          if (slack < bestSlack) {
            bestSlack = slack;
            bestIdx = i;
          }
        }
        pick(grp, w, reqs[bestIdx].service, stage);
        remaining[bestIdx]--;
      }
      for (let r = grp.start; r < grp.start + grp.size; r++) {
        if (cellAt(r, w) !== -1) continue;
        let flexService = grp.flex[0];
        let flexScore = Infinity;
        for (const f of grp.flex) {
          const sc = qc[qIdx(r, w, f)] + rng() * 0.5;
          if (sc < flexScore) {
            flexScore = sc;
            flexService = f;
          }
        }
        set(r, w, flexService);
        events.push({ kind: "fill", stage, t: 0, week: w, row: r, service: flexService });
      }
    }
  }

  // ---- stage 7: soft-constraint repair (preference swaps) ------------------
  stageFirst.push(events.length);
  const penalty = (row: number, s: number) => {
    const p = physicians[row];
    return s === p.disliked ? 2 : s === p.preferred ? 0 : 1;
  };
  const swapTarget = rows >= 24 ? 20 : 12;
  const weekOrder = shuffle(Array.from({ length: WEEKS }, (_, i) => i), rng);
  let swaps = 0;
  outer: for (const w of weekOrder) {
    for (const grp of groups) {
      let done = false;
      for (let i = grp.start; i < grp.start + grp.size && !done; i++) {
        for (let j = i + 1; j < grp.start + grp.size; j++) {
          const sa = cellAt(i, w);
          const sb = cellAt(j, w);
          if (sa < 0 || sb < 0 || sa === sb) continue;
          if (sa === CALL || sb === CALL || sa === OFF || sb === OFF) continue;
          const before = penalty(i, sa) + penalty(j, sb);
          const after = penalty(i, sb) + penalty(j, sa);
          if (after >= before) continue;
          if (qc[qIdx(i, w, sb)] + 1 > grp.cap[sb]) continue;
          if (qc[qIdx(j, w, sa)] + 1 > grp.cap[sa]) continue;
          unset(i, w);
          unset(j, w);
          set(i, w, sb);
          set(j, w, sa);
          events.push({ kind: "swap", stage: 7, t: 0, week: w, rowA: i, rowB: j, serviceA: sb, serviceB: sa });
          swaps++;
          done = true;
          if (swaps >= swapTarget) break outer;
          break;
        }
      }
    }
  }
  stageFirst.push(events.length);

  // ---- timeline: distribute solver time across stages ----------------------
  const shares: number[] = [SHARE_PREFILL, SHARE_SKELETON];
  for (const grp of groups) shares.push((SHARE_GROUPS * grp.size) / rows);
  shares.push(SHARE_REPAIR);

  const stages: StageSummary[] = [];
  let t0 = 0;
  let assignments = 0;
  let checks = 0;
  for (let i = 0; i < STAGE_COUNT; i++) {
    const first = stageFirst[i];
    const last = stageFirst[i + 1];
    const m = last - first;
    const dur = shares[i];
    const tEnd = i === STAGE_COUNT - 1 ? 1 : t0 + dur;
    for (let k = 0; k < m; k++) {
      const ev = events[first + k];
      ev.t = k === m - 1 ? tEnd : t0 + (dur * (k + 1)) / m;
      checks += checksFor(ev);
      if (ev.kind === "fill" && ev.service !== OFF) assignments++;
    }
    stages.push({
      index: i,
      name: STAGE_NAMES[i],
      first,
      last,
      tStart: t0,
      tEnd,
      group: i >= 2 && i <= 6 ? i - 2 : -1,
      assignments,
      checks,
      happiness: HAPPINESS_END[i],
    });
    t0 = tEnd;
  }

  return {
    seed,
    rows,
    groups,
    physicians,
    events,
    stages,
    grid,
    assignments,
    checks,
    offCells,
    capViolations,
  };
}

// ---- timeline helpers -------------------------------------------------------

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

export function stageAt(solve: Solve, progress: number): number {
  const st = solve.stages;
  for (let i = 0; i < st.length; i++) if (progress < st[i].tEnd) return i;
  return st.length - 1;
}

export function stageFraction(solve: Solve, progress: number): number {
  const s = solve.stages[stageAt(solve, progress)];
  const span = s.tEnd - s.tStart;
  return span <= 0 ? 1 : clamp01((progress - s.tStart) / span);
}

/** Scripted happiness readout; -1 while the pre-fill stage is running. */
export function happinessAt(solve: Solve, progress: number): number {
  const i = stageAt(solve, progress);
  if (i === 0) return -1;
  const end = solve.stages[i].happiness;
  const startValue = i === 1 ? HAPPINESS_START : solve.stages[i - 1].happiness;
  return Math.round(startValue + (end - startValue) * stageFraction(solve, progress));
}

/** Solver clock as m:ss, ending at 3:41. */
export function elapsedAt(progress: number): string {
  const s = Math.floor(clamp01(progress) * SOLVER_SECONDS);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function formatInt(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
