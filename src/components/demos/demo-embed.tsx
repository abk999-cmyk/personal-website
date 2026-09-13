"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export type DemoMode = "tile" | "full";
type DemoProps = { mode?: DemoMode };
type Loader = () => Promise<{ default: ComponentType<DemoProps> }>;

/**
 * Registry of live demos. Each entry is a lazy import so the work grid only
 * pulls the code for demos that are actually on screen.
 */
const registry: Record<string, Loader> = {
  arena: () => import("./arena"),
  battleship: () => import("./battleship"),
  scheduler: () => import("./scheduler"),
  dyndega: () => import("./dyndega"),
};

function Skeleton({ label }: { label?: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="grid-bg absolute inset-0 opacity-30" />
      <p className="relative font-mono text-[11px] uppercase tracking-widest text-dim">{label ?? "demo loading"}</p>
    </div>
  );
}

const components = Object.fromEntries(
  Object.entries(registry).map(([k, loader]) => [
    k,
    dynamic(loader, { ssr: false, loading: () => <Skeleton /> }),
  ]),
) as Record<string, ComponentType<DemoProps>>;

export function DemoEmbed({ name, mode }: { name: string; mode: DemoMode }) {
  const Demo = components[name];
  if (!Demo) return <Skeleton label={`${name} · demo coming`} />;
  return <Demo mode={mode} />;
}
