import { Outlet } from 'react-router-dom'
import { AnnouncementBanner } from '../components/AnnouncementBanner.jsx'
import { SupportButton } from '../components/SupportButton.jsx'

export function AuthLayout() {
  return (
    <div className="proto-auth-root">
      <Outlet />
      <AnnouncementBanner />
      <div className="auth-support-floater">
        <SupportButton variant="text" label="Hỗ trợ" />
      </div>
    </div>
  )
}
