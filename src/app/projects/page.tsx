import { NavRail } from "@/components/navigation/nav-rail";

const projects = [
  {
    title: "Genetic Algorithm Optimization for Multi-Strategy Blending in Battleship Game AI",
    duration: "May 2025 - Present",
    association: "Northeastern University",
    description:
      "This research project presents a novel approach to optimizing Battleship game AI through genetic algorithm (GA) based weight learning for multi-strategy blending. We combine classical probability density functions, convolutional neural networks, Monte Carlo occupancy sampling, and information-theoretic methods into a unified framework where blend weights are evolved offline using a real-coded GA. Our agent, AIAgent4, achieves an average of 40 moves to win against diverse opponents, representing a 5% improvement over current SOTA approaches. The GA discovers non-intuitive weight configurations that emphasize Monte Carlo simulations while maintaining structural priors from density and neural components. Experimental results demonstrate the effectiveness of evolutionary optimization for parameter tuning in complex, multi-source decision systems under partial observability. Currently in the process of writing and submitting a conference paper on this.",
    bullets: [
      "Developed hybrid AI system combining probability density functions with convolutional neural networks",
      "Implemented genetic algorithm for automated weight optimization achieving 5% improvement over SOTA",
      "Applied Monte Carlo occupancy sampling and information-theoretic methods for decision making",
      "Reduced average moves to win to 40 against diverse opponent strategies",
    ],
    skills: [
      "Reinforcement Learning",
      "Bayesian Optimization",
      "Monte Carlo Simulation",
      "Convex heatmap blending",
      "Genetic Algorithms",
      "Python",
      "Machine Learning",
    ],
  },
  {
    title: "Home Automation System",
    duration: "Sep 2023 - May 2024",
    association: "University of Massachusetts Amherst",
    description:
      "Designed a holistic home automation system capable of controlling multiple facets of the home environment such as temperature, light, front door security, and motion sensing in a wireless and automated, minimal user-intervention design.",
    bullets: [
      "Designed holistic system controlling temperature, lighting, door security, and motion detection",
      "Executed project on sub-$500 budget using Raspberry Pi and basic hardware components",
      "Built MIT App Inventor mobile interface for remote system control",
      "Developed custom Python API endpoints for seamless device communication",
      "Implemented wireless, minimal user-intervention automation",
    ],
    skills: [
      "Embedded Systems",
      "Mobile Applications",
      "Raspberry Pi",
      "API Development",
      "MIT App Inventor 2",
      "Hardware",
      "Teamwork",
      "Web Services API",
      "Flask",
      "Python (Programming Language)",
    ],
  },
  {
    title: "Machine Learning Password Strength Project",
    duration: "Mar 2024 - May 2024",
    association: "University of Massachusetts Amherst",
    description:
      "Procured Kaggle datasets and created a Machine Learning based password strength detection system using tools like Keras and Pandas to train and actuate the model.",
    bullets: [
      "Procured and preprocessed Kaggle datasets for password analysis",
      "Developed ML model using Keras and Pandas for password strength classification",
      "Trained and validated model achieving high accuracy in strength detection",
      "Implemented comprehensive data preprocessing pipeline",
    ],
    skills: [
      "Machine Learning",
      "Pandas (Software)",
      "Artificial Intelligence (AI)",
      "TensorFlow",
      "Python (Programming Language)",
      "NumPy",
      "PyTorch",
    ],
  },
];

export default function ProjectsPage() {
  return (
    <main className="page-shell page-shell--idle">
      <div className="interior-stage">
        <NavRail active="projects" />
        <section className="interior-content glass-surface">
          <header>
            <h1 className="interior-title">Projects</h1>
            <p className="interior-lead">
              A collection of research projects and technical implementations spanning AI optimization, embedded systems,
              and machine learning applications. Each project demonstrates practical problem-solving and innovation.
            </p>
          </header>
          <div className="experience-timeline">
            {projects.map((project) => (
              <article key={project.title} className="experience-card">
                <div className="experience-card__header">
                  <div className="experience-card__title-group">
                    <h3 className="experience-card__title">{project.title}</h3>
                    <p className="experience-card__company">{project.association}</p>
                    <p className="experience-card__duration">{project.duration}</p>
                  </div>
                </div>
                <p style={{ margin: 0, color: "rgba(228, 232, 242, 0.8)", fontSize: "0.96rem", lineHeight: 1.65 }}>
                  {project.description}
                </p>
                <ul className="experience-card__bullets">
                  {project.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
                <div className="experience-card__skills">
                  <span className="experience-card__skills-label">Skills:</span>
                  <div className="experience-card__skills-list">
                    {project.skills.map((skill) => (
                      <span key={skill} className="skill-badge">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
