import { skillGroups } from "@/content/skills";
import { Section, SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export function Skills() {
  return (
    <Section id="skills" className="border-t border-line">
      <SectionHeader
        index="04"
        eyebrow="Skills"
        title={
          <>
            The stack,
            <br />
            grouped by what it's for.
          </>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((g, i) => (
          <Reveal key={g.id} delay={i * 0.05} className="rounded-2xl border border-line bg-surface p-6">
            <p className="eyebrow" style={{ color: `oklch(0.8 0.17 ${g.hue})` }}>
              {g.name}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {g.skills.map((s) => (
                <li key={s} className="rounded-full border border-line-2 px-3 py-1 text-[13px] text-text/85">
                  {s}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
