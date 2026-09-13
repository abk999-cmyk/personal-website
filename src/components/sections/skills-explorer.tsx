"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { skillGroups } from "@/content/skills";
import { cn } from "@/lib/cn";

const SkillsConstellation = dynamic(() => import("@/components/three/skills-constellation").then((m) => m.SkillsConstellation), {
  ssr: false,
});

export function SkillsExplorer() {
  const [active, setActive] = useState<string | null>(null);
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      const id = requestAnimationFrame(() => setWebgl(!!gl));
      return () => cancelAnimationFrame(id);
    } catch {
      return;
    }
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-line bg-surface lg:col-span-7 lg:min-h-[520px]">
        <div className="grid-bg absolute inset-0 opacity-20" />
        {webgl ? <SkillsConstellation active={active} onActive={setActive} /> : null}
        <p className="pointer-events-none absolute bottom-4 left-5 font-mono text-[10px] uppercase tracking-widest text-dim">
          drag to orbit · hover for names · click a node to isolate its group
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
        {skillGroups.map((g) => {
          const on = active === g.id;
          const dim = active !== null && !on;
          return (
            <button
              type="button"
              key={g.id}
              onClick={() => setActive(on ? null : g.id)}
              aria-pressed={on}
              className={cn(
                "rounded-2xl border p-4 text-left transition-[border-color,opacity] duration-300",
                on ? "border-accent/60 bg-surface" : "border-line bg-surface hover:border-line-2",
                dim && "opacity-50",
              )}
            >
              <p className={cn("eyebrow", on && "text-accent")}>{g.name}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {g.skills.map((s) => (
                  <li key={s} className="rounded-full border border-line-2 px-2.5 py-0.5 text-[12px] text-text/85">
                    {s}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </div>
  );
}
