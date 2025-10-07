import Link from "next/link";

import { NavRail } from "@/components/navigation/nav-rail";

const repositories = [
  {
    name: "deepnative",
    summary: "Native IQ - Turn Slack conversations into actionable business intelligence with AI-powered insights and automation",
    language: "TypeScript",
    url: "https://github.com/abk999-cmyk/deepnative",
    status: "Active",
  },
  {
    name: "voiceagent",
    summary: "GenAI-driven voice agent for customer service call centers with real-time ASR/TTS, RAG over Airtable KB, and agent assistance features",
    language: "Python",
    url: "https://github.com/abk999-cmyk/voiceagent",
    status: "Active",
  },
  {
    name: "Battleship",
    summary: "Genetic Algorithm Optimization for Multi-Strategy Blending in Battleship Game AI - Research implementation combining probability density, CNNs, and Monte Carlo methods",
    language: "Python",
    url: "https://github.com/abk999-cmyk/Battleship",
    status: "Research",
  },
  {
    name: "Cognitive-emotions-tracker",
    summary: "Cognitive emotions tracking application for monitoring and analyzing emotional states using AI",
    language: "Python",
    url: "https://github.com/abk999-cmyk/Cognitive-emotions-tracker",
    status: "Active",
  },
  {
    name: "personal-website",
    summary: "Personal portfolio website built with Next.js, TypeScript, and a liquid-glass design aesthetic",
    language: "TypeScript",
    url: "https://github.com/abk999-cmyk/personal-website",
    status: "Active",
  },
];

export default function GitHubPage() {
  return (
    <main className="page-shell page-shell--idle">
      <div className="interior-stage">
        <NavRail active="github" />
        <section className="interior-content glass-surface">
          <header>
            <h1 className="interior-title">GitHub</h1>
            <p className="interior-lead">
              Open-source projects and research implementations spanning AI agents, business intelligence, game AI,
              and full-stack applications. Explore my repositories on GitHub at{" "}
              <Link
                href="https://github.com/abk999-cmyk"
                style={{ color: "rgba(200, 220, 255, 0.9)", textDecoration: "underline" }}
                rel="noopener noreferrer"
                target="_blank"
              >
                @abk999-cmyk
              </Link>
              .
            </p>
          </header>
          <div className="interior-grid">
            {repositories.map((repo) => (
              <article key={repo.name} className="interior-card">
                <h3>{repo.name}</h3>
                <p>{repo.summary}</p>
                <p>
                  <strong>Language:</strong> {repo.language}
                </p>
                <p>
                  <strong>Status:</strong> {repo.status}
                </p>
                <Link
                  href={repo.url}
                  className="home-card__badge"
                  rel="noopener noreferrer"
                  target="_blank"
                  style={{ marginTop: "0.5rem", display: "inline-flex" }}
                >
                  View Repository
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
