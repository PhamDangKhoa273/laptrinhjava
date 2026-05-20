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
          <h3>Ch?c năng chính</h3>
          <ul className="feature-list">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="glass-card">
          <h3>B?o m?t</h3>
          <p>
            Route được b?o v? theo vai tr?; backend v?n là l?p ki?m soát quy?n cu?i cùng cho API.
          </p>
        </article>
      </div>
    </section>
  )
}
