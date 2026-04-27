import { Link } from 'react-router-dom'

const contentModules = [
  { title: 'Thông báo hệ thống', description: 'Tạo/gửi thông báo cho user, cảnh báo nghiệp vụ và thông tin vận hành.', badge: 'Notifications', metric: 'Live', tone: 'success' },
  { title: 'Nội dung public/guest', description: 'Quản lý thông tin công khai cho khách, bài viết, sự kiện và nội dung giới thiệu.', badge: 'Guest content', metric: 'Ready', tone: 'primary' },
  { title: 'Giao diện website', description: 'Quản lý tài nguyên hiển thị, hero, preview và cấu hình giao diện public.', badge: 'Appearance', metric: 'Assets', tone: 'warning', to: '/dashboard/appearance' },
  { title: 'Listing & báo cáo', description: 'Duyệt listing lên sàn và theo dõi báo cáo từ các vai trò vận hành.', badge: 'Operations', metric: 'Ops', tone: 'primary', to: '/dashboard/admin/operations' },
]

export function AdminContentPage() {
  return (
    <section className="page-section admin-page admin-content-page">
      <div className="section-heading">
        <div>
          <h2>Thông báo & nội dung</h2>
          <p>Điều phối nội dung hệ thống, public website và luồng truyền thông vận hành.</p>
        </div>
      </div>

      <div className="status-grid admin-overview-grid">
        <article className="status-card"><span>Content modules</span><strong>{contentModules.length}</strong><small>Admin commands</small></article>
        <article className="status-card"><span>Public surface</span><strong>Guest</strong><small>Landing + announcement</small></article>
        <article className="status-card"><span>Workflow links</span><strong>2</strong><small>Appearance + Operations</small></article>
        <article className="status-card"><span>CRUD readiness</span><strong>100%</strong><small>Ready to extend</small></article>
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
              {module.to ? <Link className="button button-secondary" to={module.to}>Mở chức năng</Link> : <span className="muted-inline">Module đã sẵn sàng để mở rộng CRUD.</span>}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
