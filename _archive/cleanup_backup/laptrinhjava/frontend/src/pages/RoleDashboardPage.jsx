import { FeatureCard } from '../components/FeatureCard.jsx'
import { StatusCard } from '../components/StatusCard.jsx'

export function RoleDashboardPage({ title, description, highlights, checklist, modules }) {
  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Role dashboard</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="status-grid">
        {highlights.map((item) => (
          <StatusCard key={item.label} label={item.label} value={item.value} tone={item.tone} />
        ))}
      </div>

      <div className="feature-grid">
        {modules.map((item) => (
          <FeatureCard key={item.title} {...item} />
        ))}
      </div>

      <div className="content-grid">
        <article className="glass-card">
          <h3>Phase 2 deliverables</h3>
          <ul className="feature-list">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="glass-card">
          <h3>Security note</h3>
          <p>
            This frontend protects routes and hides unauthorized pages, while the backend must still enforce JWT validation and role-based access control for every protected API.
          </p>
        </article>
      </div>
    </section>
  )
}
