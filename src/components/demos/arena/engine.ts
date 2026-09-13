/**
 * Scripted replay of a hide-and-seek episode: hiders get a prep phase to drag
 * boxes into a shelter, then seekers are released with vision cones.
 * Deterministic for a seed. Not a live RL policy; it illustrates the environment.
 */
export type Vec = { x: number; y: number };
export type Box = { x: number; y: number; w: number; h: number; from: Vec; to: Vec };
export type Agent = { pos: Vec; heading: number; role: "hider" | "seeker"; caught?: boolean; wp: Vec; jitter: number };
export type Phase = "prep" | "seek" | "done";

export type World = {
  W: number;
  H: number;
  boxes: Box[];
  ramps: { x: number; y: number; r: number }[];
  agents: Agent[];
  t: number;
  phase: Phase;
  episode: number;
  prepT: number;
  seekT: number;
  reward: number;
  seed: number;
};

export function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createWorld(seed: number, episode = 1): World {
  const rnd = mulberry32(seed + episode * 7919);
  const W = 100;
  const H = 62;
  const cx = 24 + rnd() * 40;
  const cy = 18 + rnd() * 26;
  const boxes: Box[] = [];
  const n = 5;
  for (let i = 0; i < n; i++) {
    const from = { x: 8 + rnd() * 84, y: 8 + rnd() * 46 };
    const ang = (i / n) * Math.PI * 2 + rnd() * 0.3;
    const to = { x: cx + Math.cos(ang) * 11, y: cy + Math.sin(ang) * 8 };
    const w = 7 + rnd() * 4;
    const h = 4 + rnd() * 3;
    boxes.push({ x: from.x, y: from.y, w, h, from, to });
  }
  const ramps = [
    { x: 10 + rnd() * 80, y: 8 + rnd() * 46, r: 3.2 },
    { x: 10 + rnd() * 80, y: 8 + rnd() * 46, r: 3.2 },
  ];
  const agents: Agent[] = [];
  for (let i = 0; i < 2; i++) {
    agents.push({ role: "hider", pos: { x: cx + (rnd() - 0.5) * 6, y: cy + (rnd() - 0.5) * 4 }, heading: rnd() * 6.28, wp: { x: cx, y: cy }, jitter: rnd() * 6.28 });
  }
  for (let i = 0; i < 2; i++) {
    const p = { x: i === 0 ? 6 : W - 6, y: i === 0 ? 6 : H - 6 };
    agents.push({ role: "seeker", pos: p, heading: 0, wp: { x: 10 + rnd() * 80, y: 8 + rnd() * 46 }, jitter: rnd() * 6.28 });
  }
  return { W, H, boxes, ramps, agents, t: 0, phase: "prep", episode, prepT: 4.5, seekT: 9, reward: 0, seed };
}

function segHitsRect(a: Vec, b: Vec, r: Box) {
  // Liang–Barsky clip test
  let t0 = 0;
  let t1 = 1;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const p = [-dx, dx, -dy, dy];
  const q = [a.x - r.x, r.x + r.w - a.x, a.y - r.y, r.y + r.h - a.y];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
      if (t0 > t1) return false;
    }
  }
  return true;
}

export function canSee(s: Agent, h: Agent, boxes: Box[], fov = 0.9, range = 30) {
  const dx = h.pos.x - s.pos.x;
  const dy = h.pos.y - s.pos.y;
  const d = Math.hypot(dx, dy);
  if (d > range) return false;
  const ang = Math.atan2(dy, dx);
  let diff = Math.abs(ang - s.heading);
  diff = Math.min(diff, Math.PI * 2 - diff);
  if (diff > fov) return false;
  return !boxes.some((b) => segHitsRect(s.pos, h.pos, b));
}

const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

export function step(w: World, dt: number, rnd: () => number) {
  w.t += dt;
  if (w.phase === "prep") {
    const k = ease(w.t / w.prepT);
    for (const b of w.boxes) {
      b.x = b.from.x + (b.to.x - b.from.x) * k;
      b.y = b.from.y + (b.to.y - b.from.y) * k;
    }
    for (const a of w.agents) {
      if (a.role === "hider") {
        a.jitter += dt * 2;
        a.pos.x += Math.cos(a.jitter) * dt * 2.2;
        a.pos.y += Math.sin(a.jitter * 1.3) * dt * 1.6;
      }
    }
    if (w.t >= w.prepT) w.phase = "seek";
    return;
  }
  if (w.phase === "seek") {
    const st = w.t - w.prepT;
    for (const a of w.agents) {
      if (a.role === "seeker") {
        const dx = a.wp.x - a.pos.x;
        const dy = a.wp.y - a.pos.y;
        const d = Math.hypot(dx, dy);
        if (d < 2) a.wp = { x: 6 + rnd() * (w.W - 12), y: 6 + rnd() * (w.H - 12) };
        const target = Math.atan2(dy, dx);
        let diff = target - a.heading;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        a.heading += diff * Math.min(1, dt * 3);
        const sp = 11;
        const nx = a.pos.x + Math.cos(a.heading) * sp * dt;
        const ny = a.pos.y + Math.sin(a.heading) * sp * dt;
        const blocked = w.boxes.some((b) => nx > b.x - 1 && nx < b.x + b.w + 1 && ny > b.y - 1 && ny < b.y + b.h + 1);
        if (blocked) a.wp = { x: 6 + rnd() * (w.W - 12), y: 6 + rnd() * (w.H - 12) };
        else {
          a.pos.x = nx;
          a.pos.y = ny;
        }
      } else if (!a.caught) {
        a.jitter += dt * 1.5;
        a.pos.x += Math.cos(a.jitter) * dt * 0.8;
        a.pos.y += Math.sin(a.jitter * 0.7) * dt * 0.6;
      }
    }
    const seekers = w.agents.filter((a) => a.role === "seeker");
    for (const h of w.agents) {
      if (h.role !== "hider" || h.caught) continue;
      if (seekers.some((s) => canSee(s, h, w.boxes))) h.caught = true;
    }
    const hidden = w.agents.filter((a) => a.role === "hider" && !a.caught).length;
    w.reward += dt * (hidden === 2 ? 1 : hidden === 1 ? 0 : -1);
    if (st >= w.seekT) w.phase = "done";
  }
}
