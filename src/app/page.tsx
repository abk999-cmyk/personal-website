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
          <p className="home-eyebrow">AI Engineer · Master&apos;s Student</p>
          <h2 className="home-title">Abhinav Karthik</h2>
          <p className="home-lead">
            As a master&apos;s student specializing in Artificial Intelligence at Northeastern University, I am passionate 
            about applying AI/ML solutions to solve complex problems and make a meaningful impact. With a strong foundation 
            in data science, cloud operations, and AI technologies, I&apos;ve honed my skills in developing intelligent systems 
            and working with large datasets to extract meaningful insights.
          </p>
        </header>

        <div className="home-grid">
          <article className="home-card">
            <span className="home-card__badge">Education</span>
            <div className="home-card__education">
              <div>
                <h4>Northeastern University</h4>
                <p>Master of Science - Artificial Intelligence</p>
                <p className="text-sm opacity-80">Sep 2024 - May 2026 · GPA: 4.0/4.0</p>
              </div>
              <div>
                <h4>University of Massachusetts Amherst</h4>
                <p>Bachelor of Science - Computer Engineering</p>
                <p className="text-sm opacity-80">Jun 2020 - May 2024</p>
              </div>
            </div>
          </article>

          <article className="home-card">
            <h3 className="home-card__title">Experience</h3>
            <ul className="home-card__list">
              <li>
                <strong>AI Engineer</strong> at EasyBee AI · Architected persistent long-term memory systems for agentic AI, 
                reducing latency by ~2 seconds through empirical research and context engineering.
              </li>
              <li>
                <strong>Founder</strong> at BucketListEr · Conceptualized and launched a mobile application connecting 
                users with like-minded people and organizations to pursue their bucket lists. Managed 3 teams of interns.
              </li>
              <li>
                <strong>IT Intern</strong> at SFJ Business Solutions · Developed software testing tools using Python, 
                Pandas, and MATLAB for performance analysis.
              </li>
            </ul>
          </article>

          <article className="home-card">
            <h3 className="home-card__title">Top Skills</h3>
            <ul className="home-card__list">
              <li>Artificial Intelligence (AI) & Machine Learning</li>
              <li>Large Language Models (LLM) & Deep Learning</li>
              <li>Computer Vision & Regression Models</li>
              <li>Python, Keras, C++, MATLAB</li>
              <li>Cloud Operations & Data Science</li>
            </ul>
          </article>

          <article className="home-card">
            <h3 className="home-card__title">Certifications</h3>
            <ul className="home-card__list">
              <li>
                <strong>Generative AI with Large Language Models</strong><br />
                DeepLearning.AI & Amazon Web Services · Nov 2024
              </li>
            </ul>
          </article>
        </div>

        <footer className="home-footer">
          <span>
            <strong>Location:</strong> South Portland, Maine, United States
          </span>
          <span>
            <strong>Let&apos;s connect:</strong> Open to opportunities leveraging AI & ML to drive innovation and create value.
          </span>
        </footer>
      </div>
    </section>
  );
}
