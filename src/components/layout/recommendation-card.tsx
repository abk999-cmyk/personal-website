export function RecommendationCard() {
  return (
    <article className="home-card">
      <h3 className="home-card__title">Recommendations</h3>
      <div className="recommendation-card__content">
        <div className="recommendation-card__recommender">
          <p className="recommendation-card__name">
            <strong>Jorge Domenzain</strong>
          </p>
          <p className="recommendation-card__role">AI | Software & Consulting</p>
          <p className="recommendation-card__date">October 2, 2025 · Jorge managed Abhinav directly</p>
        </div>
        <p className="recommendation-card__text">
          I had the pleasure of working with Abhinav during his internship at EasyBee, where he quickly proved himself
          to be an exceptional teammate and a reliable contributor. Always present, engaged, and proactive, Abhinav
          took on significant responsibility in driving forward a large part of our agent initiatives and delivered with
          both quality and consistency. His strong sense of accountability, collaborative spirit, and ability to be
          counted on in critical moments made him an invaluable member of the team. I highly recommend Abhinav for
          any future role, he will be a tremendous asset wherever he goes.
        </p>
      </div>
    </article>
  );
}

