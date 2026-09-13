import type { Metadata } from "next";

import { profile } from "@/content/profile";
import { experience } from "@/content/experience";
import { papers } from "@/content/research";
import { featuredProjects } from "@/content/projects";
import { skillGroups } from "@/content/skills";
import { fmtRange, fmtMonth } from "@/lib/dates";
import { Button, Arrow } from "@/components/ui/button";
import { PrintButton } from "@/components/resume/print-button";

export const metadata: Metadata = {
  title: "Resume",
  description: `${profile.name} — AI Engineer. Resume.`,
};

const RESUME_PDF = "/Abhinav_Karthik_Resume.pdf";

export default function ResumePage() {
  const projects = featuredProjects.filter((p) => !p.demo).slice(0, 4);
  return (
    <div className="resume mx-auto max-w-[980px] px-6 pb-24 pt-28 md:px-10 md:pt-36">
      <header className="flex flex-col gap-8 border-b border-line pb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Resume</p>
          <h1 className="display mt-4 text-[clamp(2.4rem,6vw,4.6rem)]">{profile.name}</h1>
          <p className="mt-3 text-lg text-muted">
            {profile.title} · {profile.location}
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[12px] text-muted">
            <li>
              <a className="link-underline hover:text-text" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </li>
            <li>
              <a className="link-underline hover:text-text" href={profile.links.linkedin} target="_blank" rel="noreferrer">
                linkedin.com/in/abhinavkarthik
              </a>
            </li>
            <li>
              <a className="link-underline hover:text-text" href={profile.links.github} target="_blank" rel="noreferrer">
                github.com/{profile.handle}
              </a>
            </li>
            <li>abhinav.app</li>
          </ul>
        </div>
        <div className="flex gap-3 print:hidden">
          <Button href={RESUME_PDF} external>
            Download PDF <Arrow />
          </Button>
          <PrintButton />
        </div>
      </header>

      <Section title="Summary">
        <p className="max-w-[70ch] text-[15px] leading-relaxed text-muted">{profile.bio[1]}</p>
      </Section>

      <Section title="Experience">
        <ol className="space-y-8">
          {experience.map((e) => (
            <li key={e.id} className="entry grid gap-2 md:grid-cols-12 md:gap-6">
              <div className="md:col-span-3">
                <p className="num text-[13px] text-muted">{fmtRange(e.start, e.end)}</p>
                <p className="font-mono text-[11px] text-dim">{e.location}</p>
              </div>
              <div className="md:col-span-9">
                <p className="text-[15px] text-text">
                  <span className="font-semibold">{e.role}</span>
                  <span className="text-muted"> · {e.org}</span>
                  {e.via ? <span className="text-dim"> via {e.via}</span> : null}
                </p>
                <ul className="mt-2 space-y-1.5 text-[14px] leading-relaxed text-muted">
                  {e.bullets.map((b) => (
                    <li key={b} className="flex gap-3">
                      <span className="mt-[0.65em] h-px w-2.5 shrink-0 bg-accent print:bg-black" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Research">
        <ul className="space-y-5">
          {papers.map((p) => (
            <li key={p.id} className="entry grid gap-2 md:grid-cols-12 md:gap-6">
              <div className="md:col-span-3">
                <p className="num text-[13px] text-muted">{p.year}</p>
                <p className="font-mono text-[11px] text-dim">{p.status}</p>
              </div>
              <div className="md:col-span-9">
                <p className="text-[15px] font-semibold text-text">{p.revealTitle ? p.title : p.shortName}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-muted">{p.oneLiner}</p>
                <p className="mt-1 font-mono text-[11px] text-dim">with {p.coauthors.join(", ")}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Selected projects">
        <ul className="space-y-4">
          {projects.map((p) => (
            <li key={p.slug} className="entry grid gap-1 md:grid-cols-12 md:gap-6">
              <p className="num text-[13px] text-muted md:col-span-3">{p.year}</p>
              <p className="text-[14px] leading-relaxed md:col-span-9">
                <span className="font-semibold text-text">{p.name}</span>
                <span className="text-muted"> — {p.oneLiner}</span>
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Education">
        <ul className="space-y-4">
          {profile.education.map((ed) => (
            <li key={ed.school} className="entry grid gap-1 md:grid-cols-12 md:gap-6">
              <p className="num text-[13px] text-muted md:col-span-3">
                {fmtMonth(ed.start)} — {fmtMonth(ed.end)}
              </p>
              <p className="text-[14px] md:col-span-9">
                <span className="font-semibold text-text">{ed.school}</span>
                <span className="text-muted"> — {ed.degree} · {ed.note}</span>
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Skills">
        <ul className="space-y-2">
          {skillGroups.map((g) => (
            <li key={g.id} className="entry grid gap-1 text-[14px] md:grid-cols-12 md:gap-6">
              <p className="font-mono text-[11px] uppercase tracking-widest text-dim md:col-span-3 md:pt-1">{g.name}</p>
              <p className="text-muted md:col-span-9">{g.skills.join(" · ")}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Certifications">
        <ul className="space-y-1 text-[14px] text-muted">
          {profile.certifications.map((c) => (
            <li key={c.name}>
              <span className="text-text">{c.name}</span> — {c.issuer}, {c.year}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-b border-line py-10 md:grid-cols-12 md:gap-8">
      <h2 className="eyebrow md:col-span-2">{title}</h2>
      <div className="md:col-span-10">{children}</div>
    </section>
  );
}
