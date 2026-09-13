import { profile } from "@/content/profile";
import { Button, Arrow } from "@/components/ui/button";
import { HeroField } from "@/components/three/hero-field";

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
      <HeroField />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(10,10,11,0.85),rgba(10,10,11,0.2)_45%,transparent_70%)]" />

      <div className="relative mx-auto w-full max-w-[1400px] px-6 pb-14 pt-32 md:px-10 md:pb-20 lg:px-16">
        <p className="eyebrow mb-6 flex items-center gap-3">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_2px_rgba(212,255,58,0.6)]" />
          {profile.title} · {profile.location}
        </p>
        <h1 className="display text-[clamp(3.4rem,11vw,10.5rem)]">
          Abhinav
          <br />
          Karthik
        </h1>
        <div className="mt-8 grid gap-8 md:grid-cols-12 md:items-end">
          <p className="max-w-[46ch] text-lg leading-relaxed text-muted md:col-span-7 md:text-xl">
            {profile.tagline} Currently on AI legal intelligence at{" "}
            <span className="text-text">{profile.role.company}</span>, and evolutionary optimisation research at
            Northeastern.
          </p>
          <div className="flex flex-wrap gap-3 md:col-span-5 md:justify-end">
            <Button href="/#work">
              See the work <Arrow />
            </Button>
            <Button href="/resume" variant="ghost">
              Resume
            </Button>
          </div>
        </div>
      </div>

      <div className="relative border-t border-line">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3 font-mono text-[11px] tracking-widest text-dim md:px-10 lg:px-16">
          <span>SCROLL</span>
          <span className="hidden sm:inline">AGENTS · OPTIMISATION · EVOLUTIONARY SYSTEMS</span>
          <span>⌘K</span>
        </div>
      </div>
    </section>
  );
}
