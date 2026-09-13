export const profile = {
  name: "Abhinav Karthik",
  firstName: "Abhinav",
  handle: "abk999-cmyk",
  title: "AI Engineer",
  // One line under the name in the hero.
  tagline: "I build agents, optimizers and evolutionary systems that actually ship.",
  // TODO(abhinav): confirm title + start month. Assumed Jun 2026 (post-graduation).
  role: {
    title: "AI Engineer",
    company: "State Street",
    via: "Xoriant",
    product: "Evisort",
    start: "2026-06",
    location: "Boston, MA",
    summary:
      "AI legal intelligence on the Evisort platform inside one of the world's largest custodian banks.",
  },
  location: "Boston, MA",
  // TODO(abhinav): Northeastern mail may expire post-grad; swap for a personal address if you have one.
  email: "karthik.abh@northeastern.edu",
  links: {
    github: "https://github.com/abk999-cmyk",
    linkedin: "https://linkedin.com/in/abhinavkarthik/",
    site: "https://abhinav.app",
  },
  bio: [
    "I'm an AI engineer who likes problems with a scoreboard. Fewest shots to sink a fleet. Fewest unhappy physicians on a schedule. Fewest seconds before an agent answers.",
    "Master's in AI from Northeastern (4.0), computer engineering from UMass Amherst. I've shipped a long-term memory system for a commercial agent, an optimizer that schedules a cardiovascular service line, and a Battleship engine that beats a record that stood since 2011.",
    "Right now I work on AI legal intelligence at State Street, and I keep doing research on evolutionary optimization with Prof. Jonathan Mwaura at Northeastern's Roux Institute.",
  ],
  now: [
    {
      label: "Working",
      text: "AI legal intelligence at State Street on the Evisort platform, through Xoriant.",
    },
    {
      label: "Researching",
      text: "Chasing the Battleship shot-count record with exact posterior rollouts. Current dev mean: 46.35 shots.",
    },
    {
      label: "Reviewing",
      text: "Two papers under double-blind review: a GA-tuned ensemble agent and adaptive GGA→SSGA switching.",
    },
    {
      label: "Building",
      text: "7D Connect, a school-bus operations platform with native driver apps, and the MaineHealth scheduler.",
    },
  ],
  education: [
    {
      school: "Northeastern University",
      degree: "M.S. Artificial Intelligence",
      start: "2024-09",
      end: "2026-05",
      note: "GPA 4.0 / 4.0",
    },
    {
      school: "University of Massachusetts Amherst",
      degree: "B.S. Computer Engineering",
      start: "2020-06",
      end: "2024-05",
      note: "Phi Delta Theta, founding member & VP",
    },
  ],
  certifications: [
    { name: "Generative AI with Large Language Models", issuer: "DeepLearning.AI × AWS", year: 2024 },
    { name: "Generative AI: Prompt Engineering Basics", issuer: "IBM", year: 2024 },
    { name: "Python for Data Science, AI & Development", issuer: "IBM", year: 2024 },
  ],
} as const;

export type Profile = typeof profile;
