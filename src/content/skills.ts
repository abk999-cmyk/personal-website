export type SkillGroup = {
  id: string;
  name: string;
  hue: number; // used by the constellation
  skills: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    id: "agents",
    name: "Agents & LLMs",
    hue: 74,
    skills: [
      "Claude Code",
      "Codex",
      "Cursor",
      "MCP",
      "LangGraph",
      "LangChain",
      "RAG",
      "Vector DBs",
      "Prompt engineering",
      "Fine-tuning",
      "Evals",
      "Voiceflow",
    ],
  },
  {
    id: "ml",
    name: "ML & RL",
    hue: 200,
    skills: [
      "PyTorch",
      "TensorFlow",
      "Keras",
      "scikit-learn",
      "OpenCV",
      "PPO / MARL",
      "CNNs",
      "Transformers",
      "Pandas",
      "NumPy",
    ],
  },
  {
    id: "opt",
    name: "Optimisation",
    hue: 30,
    skills: [
      "Genetic algorithms",
      "OR-Tools",
      "MILP",
      "Monte Carlo",
      "Bayesian optimisation",
      "Constraint programming",
      "Information theory",
    ],
  },
  {
    id: "lang",
    name: "Languages",
    hue: 300,
    skills: ["Python", "TypeScript", "Java", "C++", "C#", "Embedded C", "MATLAB", "Swift", "Kotlin"],
  },
  {
    id: "web",
    name: "Web, mobile & infra",
    hue: 150,
    skills: [
      "Next.js",
      "React",
      "Tauri",
      "SwiftUI",
      "Jetpack Compose",
      "Flask / FastAPI",
      "PostgreSQL",
      "Prisma",
      "Supabase",
      "Pinecone",
      "Docker",
      "AWS",
      "Vercel",
      "Twilio",
    ],
  },
];

/** Cross-group links drawn in the constellation. */
export const skillEdges: [string, string][] = [
  ["Genetic algorithms", "PyTorch"],
  ["Genetic algorithms", "Monte Carlo"],
  ["OR-Tools", "Flask / FastAPI"],
  ["OR-Tools", "MILP"],
  ["RAG", "Vector DBs"],
  ["RAG", "Pinecone"],
  ["MCP", "Twilio"],
  ["MCP", "Claude Code"],
  ["Next.js", "Prisma"],
  ["Prisma", "PostgreSQL"],
  ["SwiftUI", "Swift"],
  ["Jetpack Compose", "Kotlin"],
  ["Tauri", "React"],
  ["PPO / MARL", "PyTorch"],
  ["CNNs", "Genetic algorithms"],
  ["Python", "PyTorch"],
  ["TypeScript", "Next.js"],
  ["OpenCV", "Transformers"],
];
