import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout.jsx'
import { DashboardLayout } from '../layouts/DashboardLayout.jsx'
import { AdminFarmsPage } from '../pages/AdminFarmsPage.jsx'
import { AdminUsersPage } from '../pages/AdminUsersPage.jsx'
import { AdminDashboardPage } from '../pages/AdminDashboardPage.jsx'
import { DashboardHomePage } from '../pages/DashboardHomePage.jsx'
import { FarmPhase3Page } from '../pages/FarmPhase3Page.jsx'
import { FarmWorkspacePage } from '../pages/FarmWorkspacePage.jsx'
import { LoginPage } from '../pages/LoginPage.jsx'
import { NotFoundPage } from '../pages/NotFoundPage.jsx'
import { ProfilePage } from '../pages/ProfilePage.jsx'
import { PublicTracePage } from '../pages/PublicTracePage.jsx'
import { RegisterPage } from '../pages/RegisterPage.jsx'
import { RetailerWorkspacePage } from '../pages/RetailerWorkspacePage.jsx'
import { RoleDashboardPage } from '../pages/RoleDashboardPage.jsx'
import { ShippingWorkspacePage } from '../pages/ShippingWorkspacePage.jsx'
import { DriverWorkspacePage } from '../pages/DriverWorkspacePage.jsx'
import { DriverMobilePage } from '../pages/DriverMobilePage.jsx'
import { WebsiteAppearancePage } from '../pages/WebsiteAppearancePage.jsx'
import { GuestMarketplacePage } from '../pages/GuestMarketplacePage.jsx'
import { PublicAnnouncementsPage } from '../pages/PublicAnnouncementsPage.jsx'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage.jsx'
import { ResetPasswordPage } from '../pages/ResetPasswordPage.jsx'
import { BatchDetailPage } from '../pages/BatchDetailPage.jsx'
import { ListingDetailPage } from '../pages/ListingDetailPage.jsx'
import { AdminOperationsPage } from '../pages/AdminOperationsPage.jsx'
import { AnalyticsDashboardPage } from '../pages/AnalyticsDashboardPage.jsx'
import { AdminControlCenterPage } from '../pages/AdminControlCenterPage.jsx'
import { FarmWorkflowPage } from '../pages/FarmWorkflowPage.jsx'
import { RetailerOrderWorkflowPage } from '../pages/RetailerOrderWorkflowPage.jsx'
import { ShippingProofPage } from '../pages/ShippingProofPage.jsx'
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
      { label: 'Products & Smart contract', value: 'Live contract ops', tone: 'success' },
    ],
    checklist: ['View users list', 'Assign and review roles', 'Review pending farm registrations', 'Approve or reject farm profiles', 'Manage products', 'Deploy smart contracts'],
    modules: [
      { title: 'Admin account management', description: 'Create, edit, and maintain admin accounts with proper permission boundaries.', badge: 'RBAC' },
      { title: 'Farm & Product review panel', description: 'Check farm legitimacy, review product accuracy, certification, contact details.', badge: 'Approval' },
      { title: 'Blockchain operations', description: 'Deploy smart contract and maintain traceability on VeChainThor.', badge: 'Smart Contract' },
    ],
  },
  farm: {
    title: 'Farm dashboard',
    description: 'Farm-facing workspace for profile completion, service packages, production seasons, and later blockchain-backed traceability.',
    highlights: [
      { label: 'Farm profile API', value: 'Connected', tone: 'success' },
      { label: 'Package subscription', value: 'Connected', tone: 'primary' },
      { label: 'Blockchain sync', value: 'Connected', tone: 'success' },
    ],
    checklist: ['Create and update farm profile', 'View available service packages', 'Create farm subscriptions', 'Prepare season management flow'],
    modules: [
      { title: 'Farm profile manager', description: 'Connected to backend farm APIs for creating and updating the farm business profile.', badge: 'Live API' },
      { title: 'Service package subscriptions', description: 'Connected to backend package and farm subscription APIs.', badge: 'Connected' },
      { title: 'Marketplace registration', description: 'Prepare the entry point for pushing agricultural products to the trading floor.', badge: 'Marketplace' },
    ],
  },
  retailer: {
    title: 'Retailer dashboard',
    description: 'Retailer-facing shell for business profile management and later order flow expansion.',
    highlights: [
      { label: 'Retailer profile API', value: 'Connected', tone: 'success' },
      { label: 'Order requests', value: 'Prepared', tone: 'primary' },
      { label: 'QR traceability', value: 'Ready', tone: 'success' },
    ],
    checklist: ['Create and update retailer profile', 'Prepare marketplace search flow', 'Prepare buying request history', 'Prepare shipment confirmation view'],
    modules: [
      { title: 'Retailer business profile', description: 'Connected to backend retailer APIs for CRUD on the current retailer profile.', badge: 'Live API' },
      { title: 'Order request flow', description: 'Prepare create/cancel request screens and status tracking for retailer purchases.', badge: 'Orders' },
      { title: 'QR scan result view', description: 'Display blockchain-backed product origin, batch, and ownership details from a real scan.', badge: 'Traceability' },
    ],
  },
  'shipping-manager': {
    title: 'Shipping manager dashboard',
    description: 'Logistics management shell for shipment creation, driver coordination, and vehicle administration.',
    highlights: [
      { label: 'Shipment control', value: 'Prepared', tone: 'success' },
      { label: 'Driver management', value: 'Connected', tone: 'primary' },
      { label: 'Vehicle management', value: 'Connected', tone: 'warning' },
    ],
    checklist: ['View eligible orders', 'Manage drivers', 'Manage vehicles', 'Create and cancel shipments', 'Track shipment timeline and reports'],
    modules: [
      { title: 'Driver management', description: 'Connected to backend driver APIs for creating and updating drivers.', badge: 'Live API' },
      { title: 'Vehicle management', description: 'Connected to backend vehicle APIs for creating and updating logistics vehicles.', badge: 'Live API' },
      { title: 'Shipment orchestration view', description: 'Create, cancel, and manage shipments with real status tracking and handoff controls.', badge: 'Operations' },
    ],
  },
  driver: {
    title: 'Driver dashboard',
    description: 'Driver workspace for pickup, checkpoint updates, and handover confirmation.',
    highlights: [
      { label: 'Driver profile', value: 'Ready', tone: 'success' },
      { label: 'Shipment execution', value: 'Live', tone: 'success' },
      { label: 'QR Scan Status', value: 'Operational', tone: 'primary' },
    ],
    checklist: ['Confirm pickup from farm via QR', 'Update en-route checkpoints', 'Confirm handover to retailer', 'Report logistics issues'],
    modules: [
      { title: 'Assigned shipments', description: 'View only shipments assigned to the current driver.', badge: 'Live Execution' },
      { title: 'Checkpoint Tracking', description: 'Update location, notes, and proof images during transit.', badge: 'Traceability' },
      { title: 'Incident Reporting', description: 'Report delays or damages to the shipping manager.', badge: 'Operations' },
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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardHomePage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/dashboard/admin" element={<AdminControlCenterPage />} />
            <Route path="/dashboard/analytics" element={<AnalyticsDashboardPage />} />
            <Route path="/dashboard/appearance" element={<WebsiteAppearancePage />} />
            <Route path="/admin/users" element={<Navigate to="/dashboard/admin" replace />} />
            <Route path="/admin/farms" element={<Navigate to="/dashboard/admin" replace />} />
            <Route path="/admin/operations-plus" element={<Navigate to="/dashboard/admin" replace />} />
            <Route path="/dashboard/admin/accounts" element={<Navigate to="/dashboard/admin" replace />} />
            <Route path="/dashboard/admin/operations" element={<Navigate to="/dashboard/admin" replace />} />
            <Route path="/dashboard/admin/products" element={<Navigate to="/dashboard/admin" replace />} />
            <Route path="/dashboard/admin/blockchain" element={<Navigate to="/dashboard/admin" replace />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.FARM]} />}>
            <Route path="/dashboard/farm" element={<RoleDashboardPage {...dashboardConfigs.farm} />} />
            <Route path="/farm/workspace" element={<FarmWorkspacePage />} />
            <Route path="/farm/workflow" element={<FarmWorkflowPage />} />
            <Route path="/farm/packages" element={<Navigate to="/farm/workspace" replace />} />
            <Route path="/farm/phase3" element={<FarmPhase3Page />} />
            <Route path="/batches/:id" element={<BatchDetailPage />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.RETAILER]} />}>
            <Route path="/dashboard/retailer" element={<RetailerWorkspacePage />} />
            <Route path="/retailer/workspace" element={<RetailerWorkspacePage />} />
            <Route path="/retailer/orders" element={<Navigate to="/retailer/workspace" replace />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.SHIPPING_MANAGER]} />}>
            <Route path="/dashboard/shipping-manager" element={<ShippingWorkspacePage />} />
            <Route path="/shipping/workspace" element={<ShippingWorkspacePage />} />
            <Route path="/shipping/proof" element={<Navigate to="/shipping/workspace" replace />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.DRIVER]} />}>
            <Route path="/dashboard/driver" element={<DriverWorkspacePage />} />
            <Route path="/driver/workspace" element={<DriverWorkspacePage />} />
            <Route path="/driver/mobile" element={<DriverMobilePage />} />
            <Route path="/driver/proof" element={<ShippingProofPage />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.GUEST]} />}>
            <Route path="/dashboard/guest" element={<GuestMarketplacePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/public/trace" element={<PublicTracePage />} />
      <Route path="/marketplace" element={<GuestMarketplacePage />} />
      <Route path="/content" element={<GuestMarketplacePage />} />
      <Route path="/announcements" element={<PublicAnnouncementsPage />} />
      <Route path="/listings/:id" element={<ListingDetailPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
