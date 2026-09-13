# Live demo contract

Every demo lives in `src/components/demos/<name>/index.tsx` and default-exports a **client component**:

```ts
export default function Demo({ mode = "tile" }: { mode?: "tile" | "full" }): JSX.Element
```

- `tile`  — compact, autoplaying, no controls, fills its parent (absolute inset-0 or w-full h-full). Used inside the work grid tile. Must look good at 300–700px wide and ~200–420px tall.
- `full`  — interactive with controls and readouts. Used on `/work/<slug>`. Fills width; height ≈ 480–640px on desktop, shorter on mobile.

Rules
- `"use client"`. No external deps beyond React. Canvas 2D + requestAnimationFrame.
- Size the canvas to its container with `ResizeObserver`, honour `devicePixelRatio` (cap at 2).
- Pause the loop when offscreen (`IntersectionObserver`) and when `document.hidden`.
- `prefers-reduced-motion: reduce` → draw one representative static frame and stop.
- Colours (hardcode these hex values in canvas code):
  ink `#0a0a0b`, surface `#121214`, surface-2 `#18181b`, line `#232326`, line-2 `#2e2e33`,
  text `#f2f1ec`, muted `#8b8b90`, dim `#5c5c62`, accent `#d4ff3a`, accent-deep `#8fbf00`.
- Fonts for DOM readouts: Tailwind classes `font-mono text-[11px] uppercase tracking-widest text-dim` for labels, `num` class for numbers.
- Buttons in `full` mode: `rounded-full border border-line-2 px-3 py-1.5 font-mono text-[12px] text-text hover:border-text` and the active/primary one `bg-accent text-accent-ink border-accent`.
- TypeScript strict, no `any`. Must pass `npx tsc --noEmit` and `npx eslint src/components/demos/<name>`.
- Keep per-frame work under ~4ms on a laptop. Deterministic seeded RNG (mulberry32) so tile loops look identical on reload.
- Export nothing else from index.tsx. Put logic in sibling files (`engine.ts`, `draw.ts`).
