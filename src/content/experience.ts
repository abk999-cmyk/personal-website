export type Experience = {
  id: string;
  org: string;
  role: string;
  via?: string;
  location: string;
  start: string; // YYYY-MM
  end: string | "present";
  kind: "work" | "research" | "founder";
  summary: string;
  bullets: string[];
  stack: string[];
  /** Short flag rendered next to the title, e.g. "Now". */
  badge?: string;
  /** Marks entries whose dates/details still need Abhinav's confirmation. Not rendered. */
  unverified?: boolean;
};

export const experience: Experience[] = [
  {
    id: "state-street",
    org: "State Street",
    via: "Xoriant",
    role: "AI Engineer",
    location: "Boston, MA",
    start: "2026-06",
    end: "present",
    kind: "work",
    badge: "Now",
    unverified: true,
    summary:
      "AI legal intelligence on the Evisort contract-intelligence platform for State Street's legal organization.",
    // TODO(abhinav): replace with 2–3 concrete bullets you're allowed to share.
    bullets: [
      "Building LLM-driven contract analysis and extraction workflows on Evisort for a global custodian bank.",
      "Retrieval, extraction and evaluation work so legal teams can trust what the model says about a document.",
    ],
    stack: ["Evisort", "LLMs", "RAG", "Python", "TypeScript"],
  },
  {
    id: "mainehealth",
    org: "MaineHealth · Roux Institute",
    role: "AI Research Engineer",
    location: "Portland, ME",
    start: "2026-01",
    end: "present",
    kind: "research",
    unverified: true,
    summary:
      "Physician scheduling for MaineHealth's cardiovascular service line, with Dr. Edward Sze and Prof. Jonathan Mwaura.",
    bullets: [
      "Built a mixed-integer linear programming system that generates annual schedules for ~60 physicians across 5 subspecialty groups and 46 services.",
      "Designed a cascading multi-stage solver on Google OR-Tools CBC with a registry-based constraint engine supporting 14 configurable hard and soft constraint types.",
      "Block variable compression, per-group skeleton decomposition and upstream-aware constraint propagation: 91% happiness score across 8,500+ weekly assignments in under 4 minutes.",
      "Shipped it as a Flask web app with drag-and-drop pre-filled uploads, live solve progress and Excel export for clinical deployment.",
    ],
    stack: ["Python", "OR-Tools", "MILP", "Flask", "Pandas", "openpyxl"],
  },
  {
    id: "7d-connect",
    org: "7D Connect · Northeastern",
    role: "Lead Engineer",
    location: "Boston, MA",
    start: "2026-03",
    end: "present",
    kind: "research",
    unverified: true,
    summary:
      "Student transportation platform for school districts: web admin, REST backend and native iOS and Android driver apps.",
    bullets: [
      "Architected a Next.js 16 monorepo where one web app serves the admin UI and the mobile REST API over a single Prisma/PostgreSQL schema.",
      "Native SwiftUI and Kotlin/Compose driver apps: route start/finish, GPS-stamped attendance, inspection checklists, incident reports and mileage.",
      "Role model spanning super admin, vendor admin, district and driver, with vendor impersonation for support and nightly backups.",
    ],
    stack: ["Next.js", "React", "Prisma", "PostgreSQL", "SwiftUI", "Kotlin", "Docker"],
  },
  {
    id: "easybee",
    org: "EasyBee AI",
    role: "AI Engineer",
    location: "Boston, MA · Hybrid",
    start: "2025-06",
    end: "2025-09",
    kind: "work",
    summary: "Agent platform sold to mid-market businesses. Memory, latency, RAG and omni-channel.",
    bullets: [
      "Architected a persistent long-term memory system for the primary commercial agent, lifting retention by 15%.",
      "Cut agent latency by ~2 seconds through empirical evaluation and context engineering.",
      "Led an agentic coding team that delivered an admin dashboard with deep-research capabilities in under two weeks, plus an automated RAG knowledge-base pipeline with industry-specific chunking metadata.",
      "Built an MCP-based extension for omni-channel SMS and WhatsApp messaging via Twilio while preserving context and memory.",
      "Drove an AI-first initiative automating repeatable work across business and technical teams, averaging a 3.5× productivity gain.",
    ],
    stack: ["LLMs", "RAG", "Pinecone", "MCP", "Twilio", "Cursor", "Python", "TypeScript"],
  },
  {
    id: "bucketlister",
    org: "BucketListEr",
    role: "Founder",
    location: "Bangalore, India",
    start: "2021-01",
    end: "2024-05",
    kind: "founder",
    summary: "A social mobile app for creating and pursuing bucket lists with people and partner organisations.",
    bullets: [
      "Conceptualised, built and released the app; connected users with like-minded people and partners offering discounts.",
      "Hired and ran two intern teams (investor search, marketing) at near-zero cost.",
    ],
    stack: ["Mobile", "Product", "Fundraising"],
  },
  {
    id: "sfj",
    org: "SFJ Business Solutions",
    role: "IT Intern",
    location: "India",
    start: "2024-06",
    end: "2024-07",
    kind: "work",
    summary: "Performance-metrics tooling for a software testing team.",
    bullets: [
      "Wrote the sections of a Python, Pandas and MATLAB testing tool that measured algorithmic speed and surfaced sub-optimal paths.",
    ],
    stack: ["Python", "Pandas", "MATLAB"],
  },
];
