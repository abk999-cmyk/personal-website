import Image from "next/image";

import type { Project } from "@/content/projects";
import { DemoEmbed } from "@/components/demos/demo-embed";
import { DeviceMockup } from "@/components/work/device-mockup";
import { ContractVisual } from "@/components/work/abstract-visual";

/** Tile artwork: live demo, device mockup, screenshot, or a typed abstract. */
export function WorkVisual({ project }: { project: Project }) {
  if (project.demo) {
    return (
      <div className="absolute inset-0">
        <DemoEmbed name={project.demo} mode="tile" />
        <LiveBadge />
      </div>
    );
  }
  const desktop = project.images?.find((i) => i.kind === "desktop");
  const mobile = project.images?.find((i) => i.kind === "mobile");
  if (project.visual === "device" && desktop) {
    return <DeviceMockup desktop={desktop} mobile={mobile} compact />;
  }
  if (project.visual === "shot" && project.images?.[0]) {
    const img = project.images[0];
    return (
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={img.src}
          alt={img.alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-top opacity-90 transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03] group-hover:opacity-100"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface/70 via-transparent to-transparent" />
      </div>
    );
  }
  if (project.slug === "state-street-legal-ai") return <ContractVisual />;
  return (
    <div className="absolute inset-0">
      <div className="grid-bg absolute inset-0 opacity-30" />
      <div className="absolute left-5 top-5 font-mono text-[11px] uppercase tracking-widest text-dim">{project.contextLabel}</div>
      <div className="display absolute bottom-4 right-5 text-[clamp(3rem,8vw,6rem)] leading-none text-line-2 transition-colors duration-500 group-hover:text-accent/40">
        {project.slug.slice(0, 2).toUpperCase()}
      </div>
    </div>
  );
}

function LiveBadge() {
  return (
    <span className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-ink/70 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-accent backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" /> live
    </span>
  );
}
