import { experience } from "@/content/experience";
import { profile } from "@/content/profile";
import { fmtRange, fmtMonth } from "@/lib/dates";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Tag } from "@/components/ui/tag";

export function Experience() {
  return (
    <Section id="experience" className="border-t border-line">
      <SectionHeader
        index="03"
        eyebrow="Experience"
        title={
          <>
            Where the work
            <br />
            happened.
          </>
        }
      />

      <ol className="divide-y divide-line border-y border-line">
        {experience.map((e, i) => (
          <Reveal as="li" key={e.id} delay={Math.min(i, 3) * 0.04} className="grid gap-4 py-8 md:grid-cols-12 md:gap-8 md:py-10">
            <div className="md:col-span-3">
              <p className="num text-[13px] text-muted">{fmtRange(e.start, e.end)}</p>
              <p className="mt-1 font-mono text-[11px] text-dim">{e.location}</p>
            </div>
            <div className="md:col-span-9">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="display text-2xl md:text-3xl">{e.org}</h3>
                {e.badge ? <Tag accent>{e.badge}</Tag> : null}
              </div>
              <p className="mt-1 text-[15px] text-muted">
                {e.role}
                {e.via ? <span className="text-dim"> · via {e.via}</span> : null}
              </p>
              <p className="mt-4 max-w-[70ch] text-[15px] leading-relaxed text-text/85">{e.summary}</p>
              <ul className="mt-4 max-w-[70ch] space-y-2 text-[15px] leading-relaxed text-muted">
                {e.bullets.map((b) => (
                  <li key={b} className="flex gap-3">
                    <span className="mt-[0.6em] h-px w-3 shrink-0 bg-accent" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {e.stack.map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </ol>

      <div className="mt-16 grid gap-8 md:grid-cols-12">
        <p className="eyebrow md:col-span-3">Education</p>
        <div className="grid gap-4 sm:grid-cols-2 md:col-span-9">
          {profile.education.map((ed) => (
            <div key={ed.school} className="rounded-2xl border border-line bg-surface p-6">
              <p className="display text-xl">{ed.school}</p>
              <p className="mt-2 text-[15px] text-text/85">{ed.degree}</p>
              <p className="num mt-1 text-[13px] text-muted">
                {fmtMonth(ed.start)} — {fmtMonth(ed.end)} · {ed.note}
              </p>
            </div>
          ))}
        </div>
        <p className="eyebrow md:col-span-3">Certifications</p>
        <ul className="grid gap-2 md:col-span-9 sm:grid-cols-3">
          {profile.certifications.map((c) => (
            <li key={c.name} className="rounded-xl border border-line p-4">
              <p className="text-[14px] text-text/90">{c.name}</p>
              <p className="mt-1 font-mono text-[11px] text-dim">
                {c.issuer} · {c.year}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
