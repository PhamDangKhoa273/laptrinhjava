export function FeatureCard({ title, description, badge }) {
  return (
    <article className="feature-card">
      {badge ? <span className="feature-badge">{badge}</span> : null}
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}
