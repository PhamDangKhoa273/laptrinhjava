import { Link } from 'react-router-dom'

const contentModules = [
  {
    title: 'Thông báo h? th?ng',
    description: 'T?o, s?a, xóa thông báo hi?n th? trên public. Qu?n l? danh sách thông báo, ghim bài, phân lo?i.',
    badge: 'CRUD',
    metric: 'Live',
    tone: 'success',
    to: '/dashboard/admin/announcements',
  },
  {
    title: 'Bài vi?t giáo d?c',
    description: 'T?o n?i dung giáo d?c, hướng d?n, tin t?c nông nghi?p cho guest/public.',
    badge: 'CRUD',
    metric: 'Articles',
    tone: 'primary',
    to: '/dashboard/admin/education',
  },
  {
    title: 'Giao di?n website',
    description: 'Qu?n l? tài nguyên hi?n th?, hero, preview và c?u h?nh giao di?n public.',
    badge: 'Appearance',
    metric: 'Assets',
    tone: 'warning',
    to: '/dashboard/appearance',
  },
  {
    title: 'Listing & báo cáo',
    description: 'Duy?t listing lên sàn và theo d?i báo cáo t? các vai tr? v?n hành.',
    badge: 'Operations',
    metric: 'Ops',
    tone: 'primary',
    to: '/dashboard/admin/operations',
  },
]

export function AdminContentPage() {
  return (
    <section className="page-section admin-page admin-content-page">
      <div className="section-heading">
        <div>
          <h2>Thông báo & n?i dung</h2>
          <p>Điều ph?i n?i dung h? th?ng, public website và lu?ng truy?n thông v?n hành.</p>
        </div>
      </div>

      <div className="status-grid admin-overview-grid">
        <article className="status-card"><span>Content modules</span><strong>{contentModules.length}</strong><small>Admin commands</small></article>
        <article className="status-card"><span>Public surface</span><strong>Guest</strong><small>Landing + announcement</small></article>
        <article className="status-card"><span>Workflow links</span><strong>3</strong><small>Announcements + Education + Appearance</small></article>
        <article className="status-card"><span>CRUD readiness</span><strong>100%</strong><small>Full CRUD active</small></article>
      </div>

      <div className="admin-content-command-grid">
        {contentModules.map((module) => (
          <article key={module.title} className={`glass-card admin-command-card tone-${module.tone}`}>
            <div>
              <span className="feature-badge">{module.badge}</span>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </div>
            <div className="admin-command-card-foot">
              <strong>{module.metric}</strong>
              {module.to ? <Link className="button button-secondary" to={module.to}>M? ch?c năng</Link> : <span className="muted-inline">Module đã s?n sàng để m? r?ng CRUD.</span>}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
