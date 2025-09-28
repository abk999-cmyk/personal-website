"use client";

import { useEffect, useState } from "react";

import { NavRail } from "@/components/navigation/nav-rail";

const GREETING = "Hi, I'm Abhinav. Welcome!";
const TRANSITION_DURATION_MS = 1600;
const INTRO_SEEN_STORAGE_KEY = "introSeen";

type Phase = "intro" | "transition" | "home";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("intro");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const introSeen = window.sessionStorage.getItem(INTRO_SEEN_STORAGE_KEY);
    if (introSeen === "true") {
      setPhase("home");
    }
  }, []);

  useEffect(() => {
    if (phase !== "transition") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setPhase("home");
    }, TRANSITION_DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, [phase]);

  const handleBegin = () => {
    if (phase !== "intro") {
      return;
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(INTRO_SEEN_STORAGE_KEY, "true");
    }

    setPhase("transition");
  };

  return (
    <main className={`stage stage--${phase}`}>
      {phase !== "home" ? (
        <section className={`intro-hero ${phase !== "intro" ? "intro-hero--exit" : ""}`}>
          <h1 className="liquid-glass-text" data-text={GREETING}>
            {GREETING}
          </h1>
          <button
            type="button"
            className={`glass-button ${phase === "intro" ? "glass-button--visible" : ""}`}
            onClick={handleBegin}
            disabled={phase !== "intro"}
          >
            Begin
          </button>
        </section>
      ) : null}

      {phase !== "intro" ? <HomeScreen visible={phase === "home"} /> : null}
      {phase === "transition" ? <div className="warp-overlay" aria-hidden /> : null}
    </main>
  );
}

function HomeScreen({ visible }: { visible: boolean }) {
  return (
    <section className={`home-stage ${visible ? "home-stage--visible" : ""}`} aria-hidden={!visible}>
      <NavRail active="home" />
      <div className="home-content glass-surface">
        <header className="home-header">
          <p className="home-eyebrow">AI Engineer · Product Experimenter</p>
          <h2 className="home-title">Abhinav Karthik</h2>
          <p className="home-lead">
            I prototype intelligent experiences that balance technical ambition with thoughtful craft. From agentic
            systems to adaptive copilots, I focus on stitching machine learning, product architecture, and human insight
            into cohesive workflows.
          </p>
        </header>

        <div className="home-grid">
          <article className="home-card">
            <span className="home-card__badge">At a Glance</span>
            <p>
              Builder obsessed with responsible autonomy, evaluators, and realtime decision-making loops. Previously led
              AI efforts across early-stage startups and internal incubations, shaping platform strategy and launch
              execution.
            </p>
          </article>

          <article className="home-card">
            <h3 className="home-card__title">Current Focus</h3>
            <ul className="home-card__list">
              <li>Designing agent orchestration patterns for applied AI products.</li>
              <li>Operationalizing evaluation pipelines that close feedback loops quickly.</li>
              <li>Translating research into lovable, production-ready experiences.</li>
            </ul>
          </article>

          <article className="home-card">
            <h3 className="home-card__title">Selected Strengths</h3>
            <ul className="home-card__list">
              <li>Systems thinking across data, UX, and infrastructure layers.</li>
              <li>Hands-on delivery: full-stack development, LLM integration, observability.</li>
              <li>Storytelling that helps teams and stakeholders ship with clarity.</li>
            </ul>
          </article>

          <article className="home-card">
            <h3 className="home-card__title">Currently Exploring</h3>
            <ul className="home-card__list">
              <li>Human-in-the-loop guardrails for creative AI tooling.</li>
              <li>Composability patterns for personal knowledge workspaces.</li>
              <li>Generative interfaces that feel personable, not prescriptive.</li>
            </ul>
          </article>
        </div>

        <footer className="home-footer">
          <span>
            <strong>Let&apos;s collaborate:</strong> Open to advisory work, product spikes, and co-founding conversations.
          </span>
          <span>
            <strong>Next update:</strong> Portfolio drop documenting recent agents and decisioning flows.
          </span>
        </footer>
      </div>
    </section>
  );
}
