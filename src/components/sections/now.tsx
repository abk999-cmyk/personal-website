import { profile } from "@/content/profile";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export function Now() {
  return (
    <Section id="now" className="border-t border-line py-14 md:py-16 lg:py-20">
      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-3">
          <p className="eyebrow flex items-center gap-3">
            <span className="text-accent">00</span> Now
          </p>
          <p className="mt-3 font-mono text-[11px] text-dim">Updated Sep 2026</p>
        </div>
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 md:col-span-9 lg:grid-cols-4">
          {profile.now.map((n, i) => (
            <Reveal as="li" key={n.label} delay={i * 0.06} className="bg-surface p-5">
              <p className="font-mono text-[11px] uppercase tracking-widest text-accent">{n.label}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-text/90">{n.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  );
}
