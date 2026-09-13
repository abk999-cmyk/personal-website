import type { Metadata } from "next";
import Link from "next/link";

import { papers, ongoingResearch } from "@/content/research";
import { Tag } from "@/components/ui/tag";
import { Arrow } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Research",
  description: "Evolutionary optimisation research with Prof. Jonathan Mwaura at Northeastern's Roux Institute.",
};

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-24 pt-28 md:px-10 md:pt-36 lg:px-16">
      <header className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-3">
          <p className="eyebrow">Research</p>
        </div>
        <div className="md:col-span-9">
          <h1 className="display text-[clamp(2.4rem,6vw,5.2rem)]">
            Evolutionary optimisation,
            <br />
            with receipts.
          </h1>
          <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-muted">
            Two papers with Prof. Jonathan Mwaura at Northeastern&apos;s Roux Institute, both under double-blind review as
            of September 2026. Exact titles and manuscripts are withheld until decisions land, so a reviewer searching
            the title doesn&apos;t end up here.
          </p>
        </div>
      </header>

      <div className="mt-16 space-y-8">
        {papers.map((p, i) => (
          <article key={p.id} id={p.id} className="scroll-mt-24 grid gap-8 rounded-2xl border border-line bg-surface p-6 md:grid-cols-12 md:p-10">
            <div className="md:col-span-3">
              <p className="num text-[13px] text-dim">0{i + 1}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Tag accent>{p.status}</Tag>
                <Tag>{p.year}</Tag>
              </div>
              <p className="mt-4 font-mono text-[11px] leading-relaxed text-dim">{p.venueNote}</p>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-dim">With</p>
              <p className="mt-1 text-[14px] text-muted">{p.coauthors.join(", ")}</p>
            </div>
            <div className="md:col-span-9">
              <h2 className="display text-[clamp(1.6rem,3.4vw,2.6rem)]">{p.revealTitle ? p.title : p.shortName}</h2>
              <p className="mt-4 text-lg leading-relaxed text-text/90">{p.oneLiner}</p>
              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-line py-6 sm:grid-cols-4">
                {p.highlights.map((h) => (
                  <div key={h.label}>
                    <dd className="num text-xl text-text">{h.value}</dd>
                    <dt className="mt-1 font-mono text-[10px] uppercase leading-snug tracking-widest text-dim">{h.label}</dt>
                  </div>
                ))}
              </dl>
              <h3 className="mt-8 font-mono text-[11px] uppercase tracking-widest text-dim">Abstract</h3>
              <p className="mt-3 max-w-[72ch] text-[15px] leading-relaxed text-muted">{p.abstract}</p>
              <div className="mt-8 flex flex-wrap gap-5 font-mono text-[12px]">
                {p.demoSlug ? (
                  <Link href={`/work/${p.demoSlug}`} className="group inline-flex items-center gap-2 text-accent">
                    Live demo <Arrow />
                  </Link>
                ) : null}
                {p.repo ? (
                  <a href={p.repo} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 text-text">
                    Repository <Arrow />
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        ))}

        <section className="grid gap-8 rounded-2xl border border-dashed border-line-2 p-6 md:grid-cols-12 md:p-10">
          <div className="md:col-span-3">
            <p className="eyebrow">In progress</p>
            <p className="mt-2 font-mono text-[11px] text-dim">Updated {ongoingResearch.updated}</p>
          </div>
          <div className="md:col-span-9">
            <h2 className="display text-2xl">{ongoingResearch.name}</h2>
            <p className="mt-3 max-w-[72ch] text-[15px] leading-relaxed text-muted">{ongoingResearch.oneLiner}</p>
            <p className="mt-3 max-w-[72ch] text-[15px] leading-relaxed text-muted">{ongoingResearch.latest}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
