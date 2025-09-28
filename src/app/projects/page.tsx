import { NavRail } from "@/components/navigation/nav-rail";

const projects = [
  {
    title: "Signal Orchestrator",
    description:
      "An experimentation platform for evaluating multi-agent collaboration loops, layering telemetry, sandboxing, and human override controls.",
    bullets: [
      "Architected streaming evaluation harness with scenario replay.",
      "Integrated lightweight policy engine for adaptive agent role routing.",
      "Defined scorecards that translate research metrics into product decisions.",
    ],
  },
  {
    title: "Decision Studio",
    description:
      "Framework for turning messy operational data into explainable recommendations with inline visual narratives and confidence cues.",
    bullets: [
      "Co-designed interaction model blending dashboards with conversational slots.",
      "Implemented vector-enabled retrieval to ground AI guidance in live operations.",
      "Led rollout playbook for support and success teams to adopt new workflows.",
    ],
  },
  {
    title: "Playground Lab",
    description:
      "A catalogue of small prototypes exploring personality-rich agent interactions, from ambient assistants to creative copilots.",
    bullets: [
      "Built reusable scaffolds for voice, text, and canvas-based agent personas.",
      "Published public posts and code snippets documenting system behavior.",
      "Open-sourcing red-team prompts and evaluation heuristics this quarter.",
    ],
  },
];

export default function ProjectsPage() {
  return (
    <main className="interior-stage">
      <NavRail active="projects" />
      <section className="interior-content glass-surface">
        <header>
          <h1 className="interior-title">Projects</h1>
          <p className="interior-lead">
            A rotating set of systems and prototypes that explore trustworthy autonomy, fluid collaboration, and playful
            AI-first experiences. Highlights below capture the type of work I ship.
          </p>
        </header>
        <div className="interior-grid">
          {projects.map((project) => (
            <article key={project.title} className="interior-card">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <ul>
                {project.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
