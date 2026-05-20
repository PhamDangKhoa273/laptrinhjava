import { Button } from './Button.jsx'

export function PageLoadingState({ title = 'Đang tải dữ liệu', message = 'BICAP đang đồng bộ dữ liệu mới nhất...' }) {
  return (
    <article className="page-state page-state-loading" aria-live="polite">
      <div className="page-state__orb" />
      <div>
        <p className="eyebrow">Đang x? l?</p>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </article>
  )
}

export function PageErrorState({ title = 'Không th? t?i d? li?u', message, actionLabel, onAction }) {
  return (
    <article className="page-state page-state-error" role="alert">
      <div className="page-state__icon">??</div>
      <div>
        <p className="eyebrow">C?n ki?m tra</p>
        <h3>{title}</h3>
        <p>{message || 'Vui l?ng th? l?i ho?c ki?m tra k?t n?i t?i backend.'}</p>
        {actionLabel && onAction ? (
          <div className="page-state__actions">
            <Button variant="secondary" onClick={onAction}>{actionLabel}</Button>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export function PageEmptyState({ icon = '??', title = 'Chưa có d? li?u', message, actionLabel, onAction, children }) {
  return (
    <article className="page-state page-state-empty">
      <div className="page-state__icon">{icon}</div>
      <div>
        <p className="eyebrow">Tr?ng thái tr?ng</p>
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
