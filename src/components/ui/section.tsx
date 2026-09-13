import { cn } from "@/lib/cn";

export function Section({
  id,
  className,
  children,
  bleed = false,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  /** Skip the max-width container (for full-bleed rows). */
  bleed?: boolean;
}) {
  return (
    <section id={id} className={cn("relative scroll-mt-20 py-20 md:py-28 lg:py-36", className)}>
      {bleed ? children : <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16">{children}</div>}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  intro,
  index,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  index?: string;
}) {
  return (
    <header className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:gap-10">
      <div className="md:col-span-3">
        <p className="eyebrow flex items-center gap-3">
          {index ? <span className="text-accent">{index}</span> : null}
          {eyebrow}
        </p>
      </div>
      <div className="md:col-span-9">
        <h2 className="display text-[clamp(2rem,5vw,4.2rem)]">{title}</h2>
        {intro ? <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-muted">{intro}</p> : null}
      </div>
    </header>
  );
}
