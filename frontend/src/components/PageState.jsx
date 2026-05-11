import { Button } from './Button.jsx'

export function PageLoadingState({ title = 'Đang tải dữ liệu', message = 'BICAP đang đồng bộ dữ liệu mới nhất...' }) {
  return (
    <article className="page-state page-state-loading" aria-live="polite">
      <div className="page-state__orb" />
      <div>
        <p className="eyebrow">Đang xử lý</p>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </article>
  )
}

export function PageErrorState({ title = 'Không thể tải dữ liệu', message, actionLabel, onAction }) {
  return (
    <article className="page-state page-state-error" role="alert">
      <div className="page-state__icon">⚠️</div>
      <div>
        <p className="eyebrow">Cần kiểm tra</p>
        <h3>{title}</h3>
        <p>{message || 'Vui lòng thử lại hoặc kiểm tra kết nối tới backend.'}</p>
        {actionLabel && onAction ? (
          <div className="page-state__actions">
            <Button variant="secondary" onClick={onAction}>{actionLabel}</Button>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export function PageEmptyState({ icon = '🌱', title = 'Chưa có dữ liệu', message, actionLabel, onAction, children }) {
  return (
    <article className="page-state page-state-empty">
      <div className="page-state__icon">{icon}</div>
      <div>
        <p className="eyebrow">Trạng thái trống</p>
        <h3>{title}</h3>
        {message ? <p>{message}</p> : null}
        {children}
        {actionLabel && onAction ? (
          <div className="page-state__actions">
            <Button onClick={onAction}>{actionLabel}</Button>
          </div>
        ) : null}
      </div>
    </article>
  )
}
