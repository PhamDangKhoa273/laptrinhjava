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
          <h3>Chức năng chính</h3>
          <ul className="feature-list">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="glass-card">
          <h3>Bảo mật</h3>
          <p>
            Route được bảo vệ theo vai trò; backend vẫn là lớp kiểm soát quyền cuối cùng cho API.
          </p>
        </article>
      </div>
    </section>
  )
}
