export function StatusCard({ label, value, tone = 'default' }) {
  return (
    <article className={`status-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}
