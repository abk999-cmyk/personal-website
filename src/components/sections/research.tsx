import Link from "next/link";

import { papers, ongoingResearch } from "@/content/research";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";
import { Arrow } from "@/components/ui/button";

export function Research() {
  return (
    <Section id="research" className="border-t border-line">
      <SectionHeader
        index="02"
        eyebrow="Research"
        title={
          <>
            Evolutionary optimisation,
            <br />
            with receipts.
          </>
        }
        intro="Two papers with Prof. Jonathan Mwaura at Northeastern's Roux Institute, both under double-blind review. Titles are withheld until decisions land."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {papers.map((p, i) => (
          <Reveal key={p.id} as="article" delay={i * 0.08} className="flex flex-col rounded-2xl border border-line bg-surface p-6 md:p-8">
            <div className="flex items-center gap-2">
              <Tag accent>{p.status}</Tag>
              <Tag>{p.year}</Tag>
            </div>
            <h3 className="display mt-6 text-2xl md:text-3xl">{p.revealTitle ? p.title : p.shortName}</h3>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">{p.oneLiner}</p>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-4">
              {p.highlights.map((h) => (
                <div key={h.label}>
                  <dd className="num text-xl text-text">{h.value}</dd>
                  <dt className="mt-1 font-mono text-[10px] uppercase leading-snug tracking-widest text-dim">{h.label}</dt>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap items-center gap-4 font-mono text-[12px]">
              <Link href={`/research#${p.id}`} className="group inline-flex items-center gap-2 text-text">
                Read the abstract <Arrow />
              </Link>
              {p.demoSlug ? (
                <Link href={`/work/${p.demoSlug}`} className="group inline-flex items-center gap-2 text-accent">
                  Live demo <Arrow />
                </Link>
              ) : null}
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-4 grid gap-4 rounded-2xl border border-dashed border-line-2 p-6 md:grid-cols-12 md:p-8">
        <div className="md:col-span-3">
          <p className="eyebrow">In progress</p>
          <p className="mt-2 font-mono text-[11px] text-dim">Updated {ongoingResearch.updated}</p>
        </div>
        <div className="md:col-span-9">
          <h3 className="text-lg text-text">{ongoingResearch.name}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{ongoingResearch.oneLiner}</p>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{ongoingResearch.latest}</p>
        </div>
      </Reveal>
    </Section>
  );
}
