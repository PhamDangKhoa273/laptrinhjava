export function RoleCoveragePanel({ eyebrow = 'Coverage', title, description, items = [] }) {
  return (
    <article className="role-command-center" aria-label={title}>
      <div className="role-command-center__header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        <span className="coverage-badge">{items.length} chức năng</span>
      </div>
      <div className="role-feature-grid">
        {items.map((item) => (
          <a key={item.href || item.title} className="role-feature-card" href={item.href || '#'}>
            <span className={`coverage-dot coverage-dot--${item.tone || 'ready'}`} />
            <strong>{item.title}</strong>
            <p>{item.description}</p>
            <span className="role-feature-card__action">Mở chức năng</span>
          </a>
        ))}
      </div>
    </article>
  )
}
