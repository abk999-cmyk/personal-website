import Link from "next/link";

import { featuredProjects, moreProjects, type Project } from "@/content/projects";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";
import { Arrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { WorkVisual } from "@/components/work/work-visual";

const span: Record<Project["size"], string> = {
  xl: "lg:col-span-8 lg:row-span-2",
  lg: "lg:col-span-4",
  md: "lg:col-span-4",
  half: "lg:col-span-6",
};

export function Work() {
  return (
    <Section id="work">
      <SectionHeader
        index="01"
        eyebrow="Selected work"
        title={
          <>
            Things you can
            <br />
            actually poke at.
          </>
        }
        intro="Research that turned into products, products that turned into research. The first three run live in your browser."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[minmax(300px,auto)]">
        {featuredProjects.map((p, i) => (
          <Reveal key={p.slug} as="article" delay={Math.min(i, 4) * 0.05} className={cn("group", span[p.size], p.size === "xl" && "md:col-span-2")}>
            <Link
              href={`/work/${p.slug}`}
              className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,transform] duration-500 ease-[var(--ease-out-expo)] hover:border-line-2"
            >
              <div className={cn("relative overflow-hidden border-b border-line", p.size === "xl" ? "min-h-[320px] flex-1" : p.size === "half" ? "h-52 md:h-64" : "h-44 md:h-52")}>
                <WorkVisual project={p} />
              </div>
              <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-dim">{p.contextLabel}</p>
                    <h3 className="display mt-2 text-2xl md:text-[1.7rem]">{p.name}</h3>
                  </div>
                  <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line-2 text-muted transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-ink">
                    <Arrow />
                  </span>
                </div>
                <p className="text-[15px] leading-relaxed text-muted">{p.oneLiner}</p>
                {p.metrics ? (
                  <dl className="mt-auto grid grid-cols-3 gap-3 border-t border-line pt-4">
                    {p.metrics.map((m) => (
                      <div key={m.label}>
                        <dt className="font-mono text-[10px] uppercase tracking-widest text-dim">{m.label}</dt>
                        <dd className="num mt-1 text-lg text-text">{m.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <div className="mt-auto flex flex-wrap gap-1.5 border-t border-line pt-4">
                    {p.stack.slice(0, 4).map((s) => (
                      <Tag key={s}>{s}</Tag>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-12">
        <p className="eyebrow md:col-span-3">Also built</p>
        <ul className="divide-y divide-line border-y border-line md:col-span-9">
          {moreProjects.map((p) => (
            <li key={p.slug} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6">
              <div>
                <span className="text-text">{p.name}</span>
                <span className="text-muted"> — {p.oneLiner}</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px] text-dim">
                <span>{p.year}</span>
                {p.repo ? (
                  <a href={p.repo} className="link-underline text-muted hover:text-text" target="_blank" rel="noreferrer">
                    repo
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
