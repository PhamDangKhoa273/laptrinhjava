import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout.jsx'
import { DashboardLayout } from '../layouts/DashboardLayout.jsx'
import { DashboardHomePage } from '../pages/DashboardHomePage.jsx'
import { LoginPage } from '../pages/LoginPage.jsx'
import { NotFoundPage } from '../pages/NotFoundPage.jsx'
import { ProfilePage } from '../pages/ProfilePage.jsx'
import { RegisterPage } from '../pages/RegisterPage.jsx'
import { RoleDashboardPage } from '../pages/RoleDashboardPage.jsx'
import { ROLES } from '../utils/constants'
import { ProtectedRoute } from './ProtectedRoute.jsx'
import { PublicOnlyRoute } from './PublicOnlyRoute.jsx'
import { RoleProtectedRoute } from './RoleProtectedRoute.jsx'

const dashboardConfigs = {
  admin: {
    title: 'Admin dashboard',
    description: 'Manage accounts, approve farms, and prepare smart platform governance for later blockchain phases.',
    highlights: [
      { label: 'User management', value: 'Ready', tone: 'success' },
      { label: 'Farm approval', value: 'Prepared', tone: 'primary' },
      { label: 'Smart contract area', value: 'Planned', tone: 'warning' },
    ],
    checklist: ['View users list', 'Assign and review roles', 'Review pending farm registrations', 'Approve or reject farm profiles'],
    modules: [
      { title: 'Admin account management', description: 'Create, edit, and maintain admin accounts with proper permission boundaries.', badge: 'RBAC' },
      { title: 'Farm review panel', description: 'Check farm legitimacy, certification, contact details, and location before approval.', badge: 'Approval' },
      { title: 'Blockchain operations placeholder', description: 'Reserve a future area for smart contract deployment and traceability contract maintenance.', badge: 'Next phase' },
    ],
  },
  farm: {
    title: 'Farm dashboard',
    description: 'Farm-facing workspace for profile completion, service packages, production seasons, and later blockchain-backed traceability.',
    highlights: [
      { label: 'Farm profile', value: 'Ready', tone: 'success' },
      { label: 'Season management', value: 'Prepared', tone: 'primary' },
      { label: 'Blockchain sync', value: 'Next phase', tone: 'warning' },
    ],
    checklist: ['Update owner and farm information', 'Prepare service package purchase screen', 'Prepare season creation flow', 'Prepare export and QR generation flow'],
    modules: [
      { title: 'Farm identity', description: 'Display business license, certifications, and approval status in one place.', badge: 'Core' },
      { title: 'Season placeholders', description: 'Reserve pages for creating and updating farming seasons saved to blockchain later.', badge: 'Blockchain-ready' },
      { title: 'Marketplace registration', description: 'Prepare the entry point for pushing agricultural products to the trading floor.', badge: 'Marketplace' },
    ],
  },
  retailer: {
    title: 'Retailer dashboard',
    description: 'Retailer-facing shell for product discovery, order requests, QR verification, and shipment follow-up.',
    highlights: [
      { label: 'Retailer profile', value: 'Ready', tone: 'success' },
      { label: 'Order requests', value: 'Prepared', tone: 'primary' },
      { label: 'QR traceability', value: 'Next phase', tone: 'warning' },
    ],
    checklist: ['Update retailer business profile', 'Prepare marketplace search flow', 'Prepare buying request history', 'Prepare shipment confirmation view'],
    modules: [
      { title: 'Marketplace access', description: 'Lay out future search, filter, and product detail screens for agricultural products.', badge: 'Discovery' },
      { title: 'Order request flow', description: 'Prepare create/cancel request screens and status tracking for retailer purchases.', badge: 'Orders' },
      { title: 'QR scan result placeholder', description: 'Reserve a result page for displaying blockchain-backed product origin details.', badge: 'Traceability' },
    ],
  },
  'shipping-manager': {
    title: 'Shipping manager dashboard',
    description: 'Logistics management shell for shipment creation, driver coordination, and vehicle administration.',
    highlights: [
      { label: 'Shipment control', value: 'Prepared', tone: 'success' },
      { label: 'Driver management', value: 'Prepared', tone: 'primary' },
      { label: 'Transport tracking', value: 'Next phase', tone: 'warning' },
    ],
    checklist: ['Prepare successful order listing', 'Prepare shipment creation flow', 'Prepare vehicle and driver management', 'Prepare report and notification views'],
    modules: [
      { title: 'Shipment creation placeholder', description: 'Design the future flow to create and cancel shipments for successful orders.', badge: 'Operations' },
      { title: 'Vehicle management', description: 'Reserve CRUD screens for transportation vehicles used in agricultural logistics.', badge: 'CRUD' },
      { title: 'Driver coordination', description: 'Prepare management screens for drivers and incoming shipment reports.', badge: 'Logistics' },
    ],
  },
  driver: {
    title: 'Driver dashboard',
    description: 'Mobile-friendly driver workspace for shipment tracking and handover confirmation.',
    highlights: [
      { label: 'Driver profile', value: 'Ready', tone: 'success' },
      { label: 'Shipment list', value: 'Prepared', tone: 'primary' },
      { label: 'QR handover flow', value: 'Next phase', tone: 'warning' },
    ],
    checklist: ['Prepare shipment list UI', 'Prepare shipment detail flow', 'Prepare receive confirmation', 'Prepare retailer delivery confirmation'],
    modules: [
      { title: 'Assigned shipments', description: 'Reserve a screen for drivers to view current and completed shipments.', badge: 'Mobile-first' },
      { title: 'Delivery confirmation', description: 'Prepare action buttons for confirming product pickup and delivery completion.', badge: 'Workflow' },
      { title: 'QR verification placeholder', description: 'Reserve a screen for scanning QR codes during product handover.', badge: 'Traceability' },
    ],
  },
  guest: {
    title: 'Guest dashboard',
    description: 'Public-facing discovery space for educational content and agricultural product search.',
    highlights: [
      { label: 'Guest discovery', value: 'Ready', tone: 'success' },
      { label: 'Search area', value: 'Prepared', tone: 'primary' },
      { label: 'Content hub', value: 'Prepared', tone: 'warning' },
    ],
    checklist: ['Prepare product search', 'Prepare origin and certification filters', 'Prepare educational article listing', 'Prepare platform announcement area'],
    modules: [
      { title: 'Search and filters', description: 'Lay out a public search experience by origin, certification, and product type.', badge: 'Public access' },
      { title: 'Educational resources', description: 'Reserve cards for articles, videos, and sustainable agriculture content.', badge: 'Content' },
      { title: 'General notifications', description: 'Prepare a feed for platform updates, events, and new product announcements.', badge: 'Awareness' },
    ],
  },
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardHomePage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/dashboard/admin" element={<RoleDashboardPage {...dashboardConfigs.admin} />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.FARM]} />}>
            <Route path="/dashboard/farm" element={<RoleDashboardPage {...dashboardConfigs.farm} />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.RETAILER]} />}>
            <Route path="/dashboard/retailer" element={<RoleDashboardPage {...dashboardConfigs.retailer} />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.SHIPPING_MANAGER]} />}>
            <Route path="/dashboard/shipping-manager" element={<RoleDashboardPage {...dashboardConfigs['shipping-manager']} />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.DRIVER]} />}>
            <Route path="/dashboard/driver" element={<RoleDashboardPage {...dashboardConfigs.driver} />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.GUEST]} />}>
            <Route path="/dashboard/guest" element={<RoleDashboardPage {...dashboardConfigs.guest} />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
