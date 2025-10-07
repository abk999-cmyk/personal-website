import { NavRail } from "@/components/navigation/nav-rail";

const experiences = [
  {
    title: "AI Engineer",
    company: "EasyBee AI",
    location: "Boston, Massachusetts, United States",
    type: "Full-time · Hybrid",
    duration: "Jun 2025 - Sep 2025",
    durationLabel: "4 mos",
    bullets: [
      "Architected and implemented a persistent long-term memory system in the primary agent used and sold to businesses thereby enabling better user experience and user retention while also enhancing the demonstration of agentic ability.",
      "Ideated and experimented with the existing agent and system to optimize for latency. Used empirical research and context engineering to reduce latency of the agent by ~ 2 seconds.",
      "Played the role of lead engineer in the team responsible for creation of an admin dashboard with agentic deep research capabilities. Also used Retrieval Augmented Generation (RAG) to design and implement an automatic knowledge base creation system within the dashboard while still ensuring sound industry specific metadata during chunking and ingesting.",
    ],
    skills: ["Cursor", "Pinecone", "Large Language Models (LLM)", "RAG", "Context Engineering", "Agent Development", "Memory Systems", "Latency Optimization", "Dashboard Development", "Knowledge Base Management", "Industry Metadata"],
  },
  {
    title: "Information Technology Intern",
    company: "SFJ Business Solutions Pvt. Ltd.",
    location: "India",
    type: "Internship · On-site",
    duration: "Jun 2024 - Jul 2024",
    durationLabel: "2 mos",
    bullets: [
      "Contributed to the development of a software testing tool using Python, Pandas and MATLAB by coding sections responsible for generating metrics on software performance by measuring algorithmic speeds, analyzing large amounts of efficiency data and user feedback, enabling the team to detect sub-optimality.",
      "Collaborated with the software testing team and the core software team to enhance software functionality resulting in an increase in speed, software expandability and improved user adoption.",
    ],
    skills: ["Teamwork", "MATLAB", "Python (Programming Language)"],
  },
  {
    title: "Founder",
    company: "BucketListEr",
    location: "India",
    type: "Self-employed",
    duration: "Jan 2021 - May 2024",
    durationLabel: "3 yrs 5 mos",
    bullets: [
      "As Founder, I conceptualized and brought to reality the BucketListEr mobile application which is capable of helping users create, maintain and pursue their bucket lists by connecting with like-minded people and organizations that can contribute to them.",
      "Created, hired and managed 3 teams of interns including the investor search team, marketing team and hiring team at nearly no cost.",
    ],
    skills: ["Teamwork", "Leadership", "Entrepreneurship", "Mobile Application Development", "Team Management", "Marketing", "Fundraising"],
  },
  {
    title: "Student Union Front Desk Representative",
    company: "University of Massachusetts Amherst",
    location: "Amherst, Massachusetts, United States",
    type: "Part-time · On-site",
    duration: "Jun 2021 - Sep 2022",
    durationLabel: "1 yr 4 mos",
    bullets: [
      "Maintained and scheduled appointments for 50 on and off-campus organizations, ensuring effective utilization of resources for the business.",
      "Oversaw the successful coordination of 3 individual large-scale cultural events ensuring a positive experience for all attendees.",
    ],
    skills: ["Teamwork", "Intercultural Communication", "Event Coordination", "Scheduling"],
  },
];

export default function ExperiencePage() {
  return (
    <main className="page-shell page-shell--idle">
      <div className="interior-stage">
        <NavRail active="experience" />
        <section className="interior-content glass-surface">
          <header>
            <h1 className="interior-title">Experience</h1>
            <p className="interior-lead">
              A comprehensive overview of my professional journey, from engineering AI agents to founding startups and
              collaborating across diverse teams.
            </p>
          </header>
          <div className="experience-timeline">
            {experiences.map((exp) => (
              <article key={`${exp.company}-${exp.title}`} className="experience-card">
                <div className="experience-card__header">
                  <div className="experience-card__title-group">
                    <h3 className="experience-card__title">{exp.title}</h3>
                    <p className="experience-card__company">{exp.company}</p>
                    <p className="experience-card__meta">
                      {exp.type} · {exp.location}
                    </p>
                    <p className="experience-card__duration">
                      {exp.duration} · {exp.durationLabel}
                    </p>
                  </div>
                </div>
                <ul className="experience-card__bullets">
                  {exp.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
                <div className="experience-card__skills">
                  <span className="experience-card__skills-label">Skills:</span>
                  <div className="experience-card__skills-list">
                    {exp.skills.map((skill) => (
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

