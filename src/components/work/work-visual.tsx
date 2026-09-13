import type { Project } from "@/content/projects";

/**
 * Tile artwork. Demos and screenshots are wired in later phases;
 * for now every visual is a typed abstract so the grid composition can be judged.
 */
export function WorkVisual({ project }: { project: Project }) {
  return (
    <div className="absolute inset-0">
      <div className="grid-bg absolute inset-0 opacity-30" />
      <div className="absolute left-5 top-5 font-mono text-[11px] uppercase tracking-widest text-dim">
        {project.demo ? "live demo" : project.visual}
      </div>
      <div className="display absolute bottom-4 right-5 text-[clamp(3rem,8vw,6rem)] leading-none text-line-2 transition-colors duration-500 group-hover:text-accent/40">
        {project.slug.slice(0, 2).toUpperCase()}
      </div>
    </div>
  );
}
