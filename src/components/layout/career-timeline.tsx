export function CareerTimeline() {
  const timeline = [
    { year: "2025", title: "AI Engineer at EasyBee AI" },
    { year: "2024", title: "Started MS in AI at Northeastern" },
    { year: "2024", title: "IT Intern at SFJ Business Solutions" },
    { year: "2024", title: "Graduated from UMass Amherst" },
    { year: "2021", title: "Founded BucketListEr" },
    { year: "2020", title: "Started Computer Engineering at UMass" },
  ];

  return (
    <aside className="career-timeline">
      <h3 className="career-timeline__title">Timeline</h3>
      <div className="career-timeline__items">
        {timeline.map((item, idx) => (
          <div key={idx} className="career-timeline__item">
            <div className="career-timeline__item-year">{item.year}</div>
            <div className="career-timeline__item-title">{item.title}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

