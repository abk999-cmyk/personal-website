"use client";

import { useEffect, useState } from "react";

import { NavRail } from "@/components/navigation/nav-rail";
import { SidebarStats } from "@/components/layout/sidebar-stats";
import { FloatingBadges } from "@/components/layout/floating-badges";
import { CareerTimeline } from "@/components/layout/career-timeline";
import { RecommendationCard } from "@/components/layout/recommendation-card";

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
          <p className="home-eyebrow">AI Engineer · Master&apos;s Student at Northeastern</p>
          <h2 className="home-title">Abhinav Karthik</h2>
          <p className="home-lead">
            Master&apos;s student specializing in Artificial Intelligence at Northeastern University with a 4.0 GPA. 
            Passionate about developing agentic AI systems, optimizing large language models, and building intelligent 
            solutions that solve complex real-world problems. Experience in RAG systems, memory architectures, and 
            full-stack AI engineering.
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
                <p className="text-sm opacity-80">
                  Skills: Keras, Computer Vision, Machine Learning, Deep Learning, Artificial Intelligence (AI), Regression Models
                </p>
              </div>
              <div>
                <h4>University of Massachusetts Amherst</h4>
                <p>Bachelor of Science - Computer Engineering</p>
                <p className="text-sm opacity-80">Jun 2020 - May 2024</p>
                <p className="text-sm opacity-80">
                  Activities: Phi Delta Theta
                </p>
                <p className="text-sm opacity-80">
                  Skills: C++, Machine Learning, C#, Entrepreneurship, Artificial Intelligence (AI), Leadership
                </p>
              </div>
            </div>
          </article>

          <article className="home-card">
            <h3 className="home-card__title">Current Focus</h3>
            <ul className="home-card__list">
              <li>
                <strong>AI Engineer</strong> at EasyBee AI (Jun 2025 - Sep 2025) · Architected persistent long-term 
                memory systems for agentic AI, reducing latency by ~2 seconds. Led development of admin dashboard 
                with RAG-powered knowledge base creation.
              </li>
              <li>
                <strong>Research</strong> · Genetic Algorithm Optimization for Multi-Strategy Blending in Battleship 
                Game AI. Combining probability density functions, convolutional neural networks, and Monte Carlo methods.
              </li>
            </ul>
          </article>

          <article className="home-card">
            <h3 className="home-card__title">Technical Skills</h3>
            <ul className="home-card__list">
              <li><strong>Languages:</strong> Python, Java, C++, Embedded C, HTML, MATLAB, MIT App Inventor</li>
              <li><strong>Databases:</strong> MySQL, MongoDB</li>
              <li><strong>AI/ML:</strong> Machine Learning, Large Language Models, Transformer Architecture, Generative AI, Data Structures</li>
              <li><strong>Libraries:</strong> Pandas, NumPy, Sci-kit Learn, Keras, PyTorch, Tensorflow</li>
              <li><strong>Tools:</strong> Object-Oriented Programming, Data pre-processing, Model Fine-tuning</li>
            </ul>
          </article>

          <article className="home-card">
            <h3 className="home-card__title">Certifications</h3>
            <ul className="home-card__list">
              <li>
                <strong>Generative AI with Large Language Models</strong><br />
                DeepLearning.AI & Amazon Web Services · Nov 2024
              </li>
              <li>
                <strong>Generative AI: Prompt Engineering Basics</strong><br />
                IBM · Nov 2024
              </li>
              <li>
                <strong>Python for Data Science, AI & Development</strong><br />
                IBM · Nov 2024
              </li>
              <li>
                <strong>The Bits and Bytes of Computer Networking</strong><br />
                Google · Sep 2019
              </li>
              <li>
                <strong>Introduction to User Experience Design</strong><br />
                Coursera & Georgia Institute of Technology · Mar 2019
              </li>
            </ul>
          </article>

          <article className="home-card">
            <h3 className="home-card__title">Volunteering & Leadership</h3>
            <ul className="home-card__list">
              <li>
                <strong>Phi Delta Theta</strong> · Vice President/Founding Member (Mar 2023 - Mar 2024)<br />
                Initiated and conducted charity drives, raising funds and organizing service events to support families 
                affected by ALS in collaboration with the &apos;Live Like Lou Foundation&apos;
              </li>
            </ul>
          </article>

          <RecommendationCard />
        </div>

        <footer className="home-footer">
          <span>
            <strong>Email:</strong> karthik.abh@northeastern.edu
          </span>
          <span>
            <strong>Phone:</strong> 413-379-6633
          </span>
          <span>
            <strong>LinkedIn:</strong> linkedin.com/in/abhinavkarthik/
          </span>
          <span>
            <strong>Location:</strong> Boston, Massachusetts, United States
          </span>
        </footer>
      </div>
      <div className="home-sidebar">
        <SidebarStats />
        <FloatingBadges />
        <CareerTimeline />
      </div>
    </section>
  );
}
