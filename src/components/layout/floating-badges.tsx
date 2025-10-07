export function FloatingBadges() {
  const topSkills = [
    "Python",
    "AI/ML",
    "LLMs",
    "PyTorch",
    "Keras",
    "RAG",
    "TypeScript",
    "React",
  ];

  return (
    <aside className="floating-badges">
      <h3 className="floating-badges__title">Top Skills</h3>
      <div className="floating-badges__list">
        {topSkills.map((skill) => (
          <span key={skill} className="skill-badge">
            {skill}
          </span>
        ))}
      </div>
    </aside>
  );
}

