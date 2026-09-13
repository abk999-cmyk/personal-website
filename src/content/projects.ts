export type Project = {
  slug: string;
  name: string;
  /** Shown in the tile. Keep it under ~80 chars. */
  oneLiner: string;
  /** 1–2 paragraphs for the case-study intro. */
  blurb: string;
  year: string;
  context: "research" | "client" | "work" | "personal";
  contextLabel: string;
  stack: string[];
  metrics?: { value: string; label: string }[];
  /** Which live demo component to embed, if any. */
  demo?: "battleship" | "dyndega" | "scheduler" | "arena";
  /** Visual treatment for the tile when there is no demo. */
  visual: "demo" | "device" | "shot" | "abstract";
  repo?: string;
  live?: string;
  /** Tile size in the work grid. */
  size: "xl" | "lg" | "md" | "half";
  featured: boolean;
  /** Screenshots under /public/work/<slug>/. First one is the tile art for "shot" visuals. */
  images?: ProjectImage[];
};

export type ProjectImage = {
  src: string;
  alt: string;
  kind: "desktop" | "mobile";
  caption?: string;
};

export const projects: Project[] = [
  {
    slug: "battleship",
    name: "Battleship ensemble agent",
    oneLiner: "Four strategies, one heatmap, weights learned by a GA. Beats the 2011 record.",
    blurb:
      "Every published Battleship agent picks one trick: probability density, Monte Carlo, a neural net, a heuristic. I built an ensemble where each of four strategies emits a heatmap over the board and a sequential, scale-preserving rule blends them. A real-coded genetic algorithm evolves the blend weights offline against win rate and moves-to-win. The GA found non-obvious weights, leaned on Monte Carlo, and pruned one strategy to zero. The result averages 40.5 moves against diverse opponents, under the 42-move benchmark that had held since 2011.",
    year: "2025 – 2026",
    context: "research",
    contextLabel: "Research · Northeastern",
    stack: ["Python", "NumPy", "PyTorch", "Genetic algorithms", "Monte Carlo"],
    metrics: [
      { value: "40.5", label: "avg moves to win" },
      { value: "−1.5", label: "vs 2011 benchmark" },
      { value: "−4", label: "vs uniform ensemble" },
    ],
    demo: "battleship",
    visual: "demo",
    repo: "https://github.com/abk999-cmyk/Battleship",
    size: "xl",
    featured: true,
  },
  {
    slug: "dyndega",
    name: "DynDEGA",
    oneLiner: "A genetic algorithm that notices when it has stalled and switches its own replacement regime.",
    blurb:
      "Generational GAs explore; steady-state GAs exploit. Fixed hybrids make you guess the switch point. DEGA unifies both regimes, and Method 2 is a trigger built from quantities the GA already tracks: when the rolling mean of elite-centroid displacement falls under 2% of its first value and elite fitness variance under 10% of its initial value, the algorithm flips from generational to steady-state, once, and keeps its population. Across XOR, Iris and Wine it fired in all 60 runs, succeeded 20/20 on every benchmark, and matched the best hand-tuned schedule within a standard deviation.",
    year: "2026",
    context: "research",
    contextLabel: "Research · Northeastern",
    stack: ["Python", "NumPy", "Genetic algorithms", "Neuroevolution"],
    metrics: [
      { value: "60/60", label: "trigger fired" },
      { value: "20/20", label: "successes per benchmark" },
      { value: "0.9986", label: "Wine accuracy" },
    ],
    demo: "dyndega",
    visual: "demo",
    size: "lg",
    featured: true,
  },
  {
    slug: "mainehealth-scheduler",
    name: "MaineHealth physician scheduler",
    oneLiner: "MILP that schedules a cardiovascular service line. 8,500 assignments, 91% happy, under 4 minutes.",
    blurb:
      "Scheduling ~60 cardiologists across 5 subspecialty groups and 46 services for a year is NP-hard and politically loaded. With Dr. Edward Sze and Prof. Jonathan Mwaura I built a cascading multi-stage solver on Google OR-Tools CBC. A registry-based constraint engine supports 14 hard and soft constraint types; block variable compression, per-group skeleton decomposition and upstream-aware constraint propagation make it solve in minutes instead of hours. It ships as a Flask app the schedulers actually use: drag-and-drop prefilled uploads, live solve progress, Excel out.",
    year: "2026",
    context: "client",
    contextLabel: "MaineHealth · Roux Institute",
    stack: ["Python", "OR-Tools", "MILP", "Flask", "openpyxl"],
    metrics: [
      { value: "8,500+", label: "weekly assignments" },
      { value: "91%", label: "happiness score" },
      { value: "< 4 min", label: "solve time" },
    ],
    demo: "scheduler",
    visual: "demo",
    size: "lg",
    featured: true,
    images: [
      { src: "/work/mainehealth-scheduler/ep-monthly-ep-result-desktop.webp", alt: "Schedule generated with happiness score", kind: "desktop", caption: "Monthly optimiser: a solve on the sample EP input, ready to download" },
      { src: "/work/mainehealth-scheduler/scheduler-skeleton-ep-tab-desktop.webp", alt: "Yearly skeleton app EP tab", kind: "desktop", caption: "Yearly call-schedule skeleton: uploads and prior-year carry-forward" },
      { src: "/work/mainehealth-scheduler/scheduler-skeleton-ep-result-desktop.webp", alt: "Skeleton solve result", kind: "desktop", caption: "52 weekly assignments, 7 holidays, 12 monthly files, solved in 0.28s" },
      { src: "/work/mainehealth-scheduler/ep-monthly-ep-upload-desktop.webp", alt: "Monthly optimiser upload", kind: "desktop", caption: "Drag-and-drop workbook upload" },
    ],
  },
  {
    slug: "7d-connect",
    name: "7D Connect",
    oneLiner: "School-bus operations platform: web admin, REST backend, native iOS and Android driver apps.",
    blurb:
      "7D Connect runs student transportation for school districts: routes, vendors, drivers, GPS-stamped attendance, inspections and incident reports. One Next.js 16 app is both the browser UI and the mobile API over a single Prisma/PostgreSQL schema; the SwiftUI and Kotlin driver apps are thin JWT clients. Roles span super admin, vendor admin, district and driver, with vendor impersonation for support and nightly backups.",
    year: "2026",
    context: "client",
    contextLabel: "Northeastern · professor project",
    stack: ["Next.js 16", "React 19", "Prisma", "PostgreSQL", "SwiftUI", "Kotlin", "Docker"],
    visual: "device",
    size: "lg",
    featured: true,
    images: [
      { src: "/work/7d-connect/7d-connect-admin-dashboard-desktop.webp", alt: "7D Connect admin dashboard", kind: "desktop", caption: "Super-admin dashboard: routes, students, drivers, vendors, live attendance and trip sessions" },
      { src: "/work/7d-connect/7d-connect-ios-active-trip-attendance-mobile.webp", alt: "iOS driver app during an active trip", kind: "mobile", caption: "iOS driver app: per-student pickup and absence capture with GPS stamps" },
      { src: "/work/7d-connect/7d-connect-admin-vendors-incidents-desktop.webp", alt: "Incident dashboard with map and photos", kind: "desktop", caption: "Incident management with map, photos and vendor review" },
      { src: "/work/7d-connect/7d-connect-admin-routes-desktop.webp", alt: "Routes list", kind: "desktop", caption: "Route management" },
      { src: "/work/7d-connect/7d-connect-ios-start-trip-inspection-mobile.webp", alt: "Start trip sheet with mileage and inspection", kind: "mobile", caption: "Start Trip: starting mileage and pre-trip inspection" },
      { src: "/work/7d-connect/7d-connect-android-report-incident-mobile.webp", alt: "Android incident report form", kind: "mobile", caption: "Android driver app: incident report with photos and GPS pin" },
    ],
  },
  {
    slug: "state-street-legal-ai",
    name: "Legal intelligence at State Street",
    oneLiner: "What I do now: LLM workflows for contract intelligence on Evisort.",
    blurb:
      "Through Xoriant, I work inside State Street's legal organisation on AI legal intelligence built on the Evisort platform. Retrieval, extraction and evaluation, so that what the model says about a contract can be trusted. Details are the bank's, not mine, so this one stays high-level.",
    year: "2026 – now",
    context: "work",
    contextLabel: "State Street via Xoriant",
    stack: ["Evisort", "LLMs", "RAG", "Evals"],
    visual: "abstract",
    size: "md",
    featured: true,
  },
  {
    slug: "luna-os",
    name: "Luna OS",
    oneLiner: "An LLM-native operating system shell built with Tauri and React.",
    blurb:
      "Luna asks what a desktop looks like when the primary interface is a language model rather than a file manager. Built on Tauri (Rust) with a React front end, with the spec-driven development process and both Claude Code and Codex review logs committed alongside the code.",
    year: "2026",
    context: "personal",
    contextLabel: "Personal",
    stack: ["Tauri", "Rust", "React", "TypeScript"],
    visual: "shot",
    repo: "https://github.com/abk999-cmyk/luna-os",
    size: "md",
    featured: true,
    images: [
      { src: "/work/luna-os/luna-os-multi-window-desktop.webp", alt: "Luna OS with four glass windows open", kind: "desktop", caption: "Spreadsheet, Kanban, Calendar and Notes as translucent windows over the LLM chat sidebar" },
      { src: "/work/luna-os/luna-os-home-desktop.webp", alt: "Luna OS home surface", kind: "desktop", caption: "Home: greeting, weather and schedule tiles, suggestion chips" },
      { src: "/work/luna-os/luna-os-command-palette-desktop.webp", alt: "Luna OS command palette", kind: "desktop", caption: "⌘K palette with AI search across notes, contacts, calendar and files" },
      { src: "/work/luna-os/luna-os-app-launcher-desktop.webp", alt: "Luna OS app launcher", kind: "desktop", caption: "The 20-app launcher" },
    ],
  },
  {
    slug: "marl-hide-and-seek",
    name: "Multi-agent hide-and-seek",
    oneLiner: "Drones learning to hide and seek with PPO self-play in Webots and MuJoCo.",
    blurb:
      "A reimplementation of OpenAI's emergent tool-use setup. Hiders get a prep phase to move boxes and ramps, then seekers are released. Agents train with PPO under centralised training and decentralised execution, curriculum from simple arenas to complex ones, and self-play against a pool of past policies. Three arena layouts, 2v2 to 5v5, real-time visualisation with 0.1× to 10× time control. A second environment runs the same idea on MuJoCo worldgen.",
    year: "2025",
    context: "research",
    contextLabel: "Research · Northeastern",
    stack: ["Python", "PPO", "Webots", "MuJoCo", "PyTorch"],
    demo: "arena",
    visual: "demo",
    repo: "https://github.com/abk999-cmyk/marl-hide-and-seek",
    size: "half",
    featured: true,
  },
  {
    slug: "genome-explorer",
    name: "Genome Explorer",
    oneLiner: "A 3D DNA helix you can orbit, where the pathogenic variant glows at 60 bpm.",
    blurb:
      "An interactive reading of a synthetic genome screening report. Every finding is a node on a WebGL double helix built with react-three-fiber; a coordinate-accurate chromosome ideogram is linked to it through a shared selection store. Plain-English interpretations, an animated ECG for the LQT2 variant, a pharmacogenomic avoid-list, and a reduced-motion fallback that swaps the helix for a keyboard-navigable SVG.",
    year: "2026",
    context: "personal",
    contextLabel: "Personal",
    stack: ["React", "react-three-fiber", "TypeScript", "ideogram.js"],
    visual: "shot",
    repo: "https://github.com/abk999-cmyk/genome-explorer",
    size: "half",
    featured: true,
    images: [
      { src: "/work/genome-explorer/genome-explorer-explorer-desktop.webp", alt: "3D DNA helix with labelled finding nodes", kind: "desktop", caption: "Every finding pinned on a WebGL double helix; the pathogenic node pulses red" },
      { src: "/work/genome-explorer/genome-explorer-landing-desktop.webp", alt: "Genome Explorer landing", kind: "desktop", caption: "Landing: report summary and stat tiles" },
      { src: "/work/genome-explorer/genome-explorer-detail-drawer-desktop.webp", alt: "Detail drawer for KCNH2", kind: "desktop", caption: "Focus-trapped detail drawer with ACMG evidence breakdown" },
      { src: "/work/genome-explorer/genome-explorer-headline-desktop.webp", alt: "Headline finding with animated ECG", kind: "desktop", caption: "The LQT2 headline finding with an animated prolonged-QT ECG" },
    ],
  },
  // ---- honourable mentions (rendered as a compact list) ----
  {
    slug: "misalignment-sandbox",
    name: "Misalignment sandbox",
    oneLiner: "A simulated pharma company for studying LLM misalignment with chain-of-thought monitoring and time control.",
    blurb: "",
    year: "2025",
    context: "research",
    contextLabel: "Research",
    stack: ["React", "Vite", "Fastify", "Pyodide", "Zustand"],
    visual: "abstract",
    repo: "https://github.com/abk999-cmyk/misalignment-sandbox-experiment",
    size: "md",
    featured: false,
    images: [
      { src: "/work/misalignment-sandbox/misalignment-sandbox-landing-desktop.webp", alt: "Monitoring dashboard", kind: "desktop", caption: "Monitoring dashboard: scenario metrics, time controls, raw chain-of-thought stream" },
      { src: "/work/misalignment-sandbox/misalignment-sandbox-admin-controls-desktop.webp", alt: "Admin controls", kind: "desktop", caption: "Prompt profiles, tool toggles and guardrails" },
    ],
  },
  {
    slug: "emotion-tracker",
    name: "Cognitive & emotional state tracker",
    oneLiner: "Real-time multimodal tracking of 28 emotional and cognitive states from video and audio, with an emotion-aware chat.",
    blurb: "",
    year: "2025",
    context: "personal",
    contextLabel: "Personal",
    stack: ["Python", "OpenCV", "MPS", "SQLite"],
    visual: "abstract",
    repo: "https://github.com/abk999-cmyk/Cognitive-emotions-tracker",
    size: "md",
    featured: false,
    images: [
      { src: "/work/emotion-tracker/cognitive-emotions-tracker-dashboard-fullpage-desktop.webp", alt: "Emotion tracking dashboard", kind: "desktop", caption: "Live emotion timeline, video feed, scores and the emotion-aware assistant" },
    ],
  },
  {
    slug: "lawn-segmentation",
    name: "Satellite lawn measurement",
    oneLiner: "Draw a polygon on a map, get AI-segmented lawn area by zone with a confidence grade.",
    blurb: "",
    year: "2025",
    context: "personal",
    contextLabel: "Personal",
    stack: ["FastAPI", "ResNet34-UNet", "Google Maps"],
    visual: "abstract",
    repo: "https://github.com/abk999-cmyk/AI_land_measuring_tool",
    size: "md",
    featured: false,
    images: [
      { src: "/work/lawn-segmentation/ai-land-measuring-tool-segmentation-overlay-desktop.webp", alt: "Segmented lawn overlay on satellite imagery", kind: "desktop", caption: "ResNet34-UNet segmentation painted over the satellite crop" },
    ],
  },
  {
    slug: "sequence-lab",
    name: "Sequence research lab",
    oneLiner: "Local-first research dashboard for two-player Sequence with an RL training loop.",
    blurb: "",
    year: "2026",
    context: "personal",
    contextLabel: "Personal",
    stack: ["JavaScript", "Node", "RL"],
    visual: "abstract",
    repo: "https://github.com/abk999-cmyk/Sequence",
    size: "md",
    featured: false,
    images: [
      { src: "/work/sequence-lab/sequence-lab-live-ai-vs-ai-desktop.webp", alt: "Live AI vs AI Sequence game with diagnostics", kind: "desktop", caption: "Belief Monte Carlo vs greedy, with belief entropy and move probabilities" },
    ],
  },
  {
    slug: "easybee-memory",
    name: "Agent long-term memory",
    oneLiner: "Persistent memory for a commercial agent, plus MCP omni-channel SMS and WhatsApp.",
    blurb: "",
    year: "2025",
    context: "work",
    contextLabel: "EasyBee AI",
    stack: ["LLMs", "Pinecone", "MCP", "Twilio"],
    visual: "abstract",
    size: "md",
    featured: false,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const moreProjects = projects.filter((p) => !p.featured);
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
