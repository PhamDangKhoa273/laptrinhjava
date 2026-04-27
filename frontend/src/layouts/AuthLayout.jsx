import { Outlet } from 'react-router-dom'
import { AnnouncementBanner } from '../components/AnnouncementBanner.jsx'

export function AuthLayout() {
  return (
    <div className="proto-auth-root">
      <Outlet />
      <AnnouncementBanner />
    </div>
  )
}
