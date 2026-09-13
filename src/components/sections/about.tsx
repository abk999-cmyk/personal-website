import Image from "next/image";

import { profile } from "@/content/profile";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export function About() {
  return (
    <Section id="about" className="border-t border-line">
      <div className="grid gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-3">
          <p className="eyebrow flex items-center gap-3">
            <span className="text-accent">05</span> About
          </p>
          <Reveal className="mt-8 aspect-square w-40 overflow-hidden rounded-2xl border border-line grayscale md:w-full">
            <Image src="/abhinav-profile.jpg" alt={profile.name} width={480} height={480} className="h-full w-full object-cover" />
          </Reveal>
        </div>
        <div className="md:col-span-9">
          {profile.bio.map((para, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <p className={i === 0 ? "display max-w-[28ch] text-[clamp(1.6rem,3.6vw,2.8rem)]" : "mt-6 max-w-[62ch] text-lg leading-relaxed text-muted"}>
                {para}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
