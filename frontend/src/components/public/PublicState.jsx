export function PublicSkeletonGrid({ count = 6 }) {
  return <div className="public-grid">{Array.from({ length: count }).map((_, index) => <div className="public-skeleton-card" key={index} />)}</div>
}

export function PublicState({ title, description, message, action, loading = false }) {
  if (loading) return <PublicSkeletonGrid />
  return (
    <div className="public-state">
      <div>
        <span className="material-symbols-outlined" style={{ fontSize: 44, color: 'var(--proto-primary-2)' }}>eco</span>
        <h3>{title || 'No data available'}</h3>
        <p>{description || message || 'Content will appear here once BICAP receives verified data.'}</p>
        {action ? <div style={{ marginTop: 18 }}>{action}</div> : null}
      </div>
    </div>
  )
}
