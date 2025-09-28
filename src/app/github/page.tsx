import Link from "next/link";

import { NavRail } from "@/components/navigation/nav-rail";

const repositories = [
  {
    name: "agent-lab",
    summary: "Collection of agent patterns, evaluation utilities, and composable runtime helpers for rapid prototyping.",
    status: "In development",
  },
  {
    name: "signal-kit",
    summary: "TypeScript toolkit for ingesting product telemetry and piping it into LLM guardrails and analytics sinks.",
    status: "Polishing docs",
  },
  {
    name: "glass-ui",
    summary: "Design experiments for liquid-glass inspired components built with modern CSS and minimal dependencies.",
    status: "Open-sourcing soon",
  },
];

export default function GitHubPage() {
  return (
    <main className="interior-stage">
      <NavRail active="github" />
      <section className="interior-content glass-surface">
        <header>
          <h1 className="interior-title">GitHub</h1>
          <p className="interior-lead">
            I share tooling, reference implementations, and design studies as they mature. Watch the repos below or reach
            out if you want early previews.
          </p>
        </header>
        <div className="interior-grid">
          {repositories.map((repo) => (
            <article key={repo.name} className="interior-card">
              <h3>{repo.name}</h3>
              <p>{repo.summary}</p>
              <p>
                <strong>Status:</strong> {repo.status}
              </p>
              <Link
                href="https://github.com/abhinavkarthik"
                className="home-card__badge"
                rel="noopener noreferrer"
                target="_blank"
              >
                View Profile
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
