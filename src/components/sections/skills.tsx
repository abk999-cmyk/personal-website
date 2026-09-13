import { Section, SectionHeader } from "@/components/ui/section";
import { SkillsExplorer } from "@/components/sections/skills-explorer";

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
            grouped by what it&apos;s for.
          </>
        }
      />
      <SkillsExplorer />
    </Section>
  );
}
