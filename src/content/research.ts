/**
 * Both papers are under double-blind review as of Sep 2026.
 * Exact titles and PDFs are withheld on purpose so a reviewer searching the
 * title doesn't land here. Flip `revealTitle` once a decision is in.
 */
export type Paper = {
  id: string;
  shortName: string;
  title: string;
  revealTitle: boolean;
  status: "under review" | "accepted" | "published" | "preprint";
  venueNote: string;
  year: number;
  coauthors: string[];
  oneLiner: string;
  abstract: string;
  highlights: { value: string; label: string }[];
  demoSlug?: string;
  repo?: string;
};

export const papers: Paper[] = [
  {
    id: "battleship-ga",
    shortName: "GA-tuned ensemble agent for Battleship",
    title: "Towards a Genetic Algorithm-Optimized Ensemble Strategy for the Game of Battleship",
    revealTitle: false,
    status: "under review",
    venueNote: "Double-blind review · title withheld until decision",
    year: 2026,
    coauthors: ["Jonathan Mwaura"],
    oneLiner:
      "Four Battleship strategies, one heatmap each, blended by weights a genetic algorithm learned. Averages 40.5 moves to win and beats the 2011 benchmark.",
    abstract:
      "Existing Battleship agents commit to one technique: probability density functions, Monte Carlo sampling, neural networks or heuristics. None dominates. This paper proposes an ensemble in which four strategies (a per-ship probability density function, a convolutional neural network, Monte Carlo occupancy sampling and an information-gain heuristic) each produce a heatmap over the board, fused by a sequential, scale-preserving blending rule. A real-coded genetic algorithm learns the blend weights against a fitness of win rate and moves-to-win. The resulting agent averages 40.5 moves, outperforms every single-strategy component, improves on a uniform-weight ensemble with the identical architecture by about 4 moves, and compares favourably with the strongest published benchmarks of 42 to 45 moves. The learned weights are interpretable and the GA pruned one redundant strategy to zero.",
    highlights: [
      { value: "40.5", label: "avg moves to win" },
      { value: "42", label: "previous benchmark (Berry, 2011)" },
      { value: "−4", label: "moves vs uniform-weight ensemble" },
      { value: "4", label: "strategies blended" },
    ],
    demoSlug: "battleship",
    repo: "https://github.com/abk999-cmyk/Battleship",
  },
  {
    id: "dyndega",
    shortName: "Adaptive generational ↔ steady-state switching for GAs",
    title:
      "DynDEGA-M2: Centroid-Stagnation-Driven Adaptive Switching Between Generational and Steady-State Genetic Algorithms",
    revealTitle: false,
    status: "under review",
    venueNote: "Double-blind review · title withheld until decision",
    year: 2026,
    coauthors: ["Jonathan Mwaura"],
    oneLiner:
      "A genetic algorithm that starts generational, watches its own elite centroid, and switches itself to steady-state the moment exploration stalls. No hand-picked switch point.",
    abstract:
      "Generational GAs replace the whole population each iteration and explore broadly; steady-state GAs replace one or two individuals and exploit aggressively. Neither wins everywhere, and fixed-schedule hybrids make you choose the switch point by hand. DEGA is a hybrid framework that combines both regimes, and Method 2 is a centroid-stagnation trigger for a one-way generational-to-steady-state transition. It fires when the 10-iteration mean of elite-centroid displacement drops below 2% of its first non-zero value and elite fitness variance drops below 10% of its initial value, after a minimum generational duration. Over 20 matched runs on three neural-network weight-optimisation problems (XOR, Iris, Wine) against pure GGA, pure SSGA and six fixed-schedule variants, DynDEGA-M2 succeeds 20/20 on every benchmark, with mean validation accuracy of 0.9967 on Iris and 0.9986 on Wine, and lands within one standard deviation of the best fixed schedule every time. The trigger fired in all 60 runs, in the first 7.4% to 26.6% of the budget.",
    highlights: [
      { value: "60 / 60", label: "runs where the trigger fired" },
      { value: "20 / 20", label: "successes on every benchmark" },
      { value: "0.9986", label: "mean accuracy on Wine" },
      { value: "2% · 10%", label: "centroid & variance thresholds" },
    ],
    demoSlug: "dyndega",
  },
];

export const ongoingResearch = {
  name: "Battleship autoresearch",
  oneLiner:
    "An isolated record-attempt lab: minimise unconditional shots to sink a hidden fleet, with frozen holdouts and predeclared promotion gates.",
  latest:
    "Cross-fitted full-horizon rollouts averaged 46.35 shots vs 47.18 for the exact posterior marginal across 40 development boards. Not yet promoted: the interval crosses zero.",
  updated: "2026-07",
};
