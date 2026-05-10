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
import { WebsiteAppearancePage } from '../pages/WebsiteAppearancePage.jsx'
import { GuestMarketplacePage } from '../pages/GuestMarketplacePage.jsx'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage.jsx'
import { ResetPasswordPage } from '../pages/ResetPasswordPage.jsx'
import { BatchDetailPage } from '../pages/BatchDetailPage.jsx'
import { ListingDetailPage } from '../pages/ListingDetailPage.jsx'
import { AdminOperationsPage } from '../pages/AdminOperationsPage.jsx'
import { AdminControlCenterPage } from '../pages/AdminControlCenterPage.jsx'
import { FarmWorkflowPage } from '../pages/FarmWorkflowPage.jsx'
import { RetailerOrderWorkflowPage } from '../pages/RetailerOrderWorkflowPage.jsx'
import { ShippingProofPage } from '../pages/ShippingProofPage.jsx'
import { ROLES } from '../utils/constants'
import { ProtectedRoute } from './ProtectedRoute.jsx'
import { PublicOnlyRoute } from './PublicOnlyRoute.jsx'
import { RoleProtectedRoute } from './RoleProtectedRoute.jsx'

<<<<<<< Updated upstream
const dashboardConfigs = {
  admin: {
    title: 'Admin dashboard',
    description: 'Manage accounts, approve farms, and prepare smart platform governance for later blockchain phases.',
    highlights: [
      { label: 'User management', value: 'Ready', tone: 'success' },
      { label: 'Farm approval', value: 'Prepared', tone: 'primary' },
      { label: 'Products & Smart contract', value: 'Planned', tone: 'warning' },
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
      { label: 'Blockchain sync', value: 'Next phase', tone: 'warning' },
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
      { label: 'QR traceability', value: 'Next phase', tone: 'warning' },
    ],
    checklist: ['Create and update retailer profile', 'Prepare marketplace search flow', 'Prepare buying request history', 'Prepare shipment confirmation view'],
    modules: [
      { title: 'Retailer business profile', description: 'Connected to backend retailer APIs for CRUD on the current retailer profile.', badge: 'Live API' },
      { title: 'Order request flow', description: 'Prepare create/cancel request screens and status tracking for retailer purchases.', badge: 'Orders' },
      { title: 'QR scan result placeholder', description: 'Reserve a result page for displaying blockchain-backed product origin details.', badge: 'Traceability' },
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
    checklist: ['Manage drivers', 'Manage vehicles', 'Prepare shipment creation flow', 'Prepare report and notification views'],
    modules: [
      { title: 'Driver management', description: 'Connected to backend driver APIs for creating and updating drivers.', badge: 'Live API' },
      { title: 'Vehicle management', description: 'Connected to backend vehicle APIs for creating and updating logistics vehicles.', badge: 'Live API' },
      { title: 'Shipment creation placeholder', description: 'Design the future flow to create and cancel shipments for successful orders.', badge: 'Operations' },
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
=======
const AdminFarmsPage = lazy(() => import('../pages/AdminFarmsPage.jsx').then((module) => ({ default: module.AdminFarmsPage })))
const AdminUsersPage = lazy(() => import('../pages/AdminUsersPage.jsx').then((module) => ({ default: module.AdminUsersPage })))
const AdminProductsPage = lazy(() => import('../pages/AdminProductsPage.jsx').then((module) => ({ default: module.AdminProductsPage })))
const AdminRetailersPage = lazy(() => import('../pages/AdminRetailersPage.jsx').then((module) => ({ default: module.AdminRetailersPage })))
const AdminPackagesPage = lazy(() => import('../pages/AdminPackagesPage.jsx').then((module) => ({ default: module.AdminPackagesPage })))
const AdminBlockchainTracePage = lazy(() => import('../pages/AdminBlockchainTracePage.jsx').then((module) => ({ default: module.AdminBlockchainTracePage })))
const DashboardHomePage = lazy(() => import('../pages/DashboardHomePage.jsx').then((module) => ({ default: module.DashboardHomePage })))
const FarmPhase3Page = lazy(() => import('../pages/FarmPhase3Page.jsx').then((module) => ({ default: module.FarmPhase3Page })))
const FarmWorkspacePage = lazy(() => import('../pages/FarmWorkspacePage.jsx').then((module) => ({ default: module.FarmWorkspacePage })))
const LoginPage = lazy(() => import('../pages/LoginPage.jsx').then((module) => ({ default: module.LoginPage })))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx').then((module) => ({ default: module.NotFoundPage })))
const ProfilePage = lazy(() => import('../pages/ProfilePage.jsx').then((module) => ({ default: module.ProfilePage })))
const PublicTracePage = lazy(() => import('../pages/PublicTracePage.jsx').then((module) => ({ default: module.PublicTracePage })))
const RegisterPage = lazy(() => import('../pages/RegisterPage.jsx').then((module) => ({ default: module.RegisterPage })))
const RetailerWorkspacePage = lazy(() => import('../pages/RetailerWorkspacePage.jsx').then((module) => ({ default: module.RetailerWorkspacePage })))
const ShippingWorkspacePage = lazy(() => import('../pages/ShippingWorkspacePage.jsx').then((module) => ({ default: module.ShippingWorkspacePage })))
const DriverWorkspacePage = lazy(() => import('../pages/DriverWorkspacePage.jsx').then((module) => ({ default: module.DriverWorkspacePage })))
const DriverMobilePage = lazy(() => import('../pages/DriverMobilePage.jsx').then((module) => ({ default: module.DriverMobilePage })))
const WebsiteAppearancePage = lazy(() => import('../pages/WebsiteAppearancePage.jsx').then((module) => ({ default: module.WebsiteAppearancePage })))
const GuestMarketplacePage = lazy(() => import('../pages/GuestMarketplacePage.jsx').then((module) => ({ default: module.GuestMarketplacePage })))
const PublicMarketplacePage = lazy(() => import('../pages/PublicMarketplacePage.jsx').then((module) => ({ default: module.PublicMarketplacePage })))
const PublicAnnouncementsPage = lazy(() => import('../pages/PublicAnnouncementsPage.jsx').then((module) => ({ default: module.PublicAnnouncementsPage })))
const PublicEducationPage = lazy(() => import('../pages/PublicEducationPage.jsx').then((module) => ({ default: module.PublicEducationPage })))
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage.jsx').then((module) => ({ default: module.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage.jsx').then((module) => ({ default: module.ResetPasswordPage })))
const BatchDetailPage = lazy(() => import('../pages/BatchDetailPage.jsx').then((module) => ({ default: module.BatchDetailPage })))
const ListingDetailPage = lazy(() => import('../pages/ListingDetailPage.jsx').then((module) => ({ default: module.ListingDetailPage })))
const AdminOperationsPage = lazy(() => import('../pages/AdminOperationsPage.jsx').then((module) => ({ default: module.AdminOperationsPage })))
const AnalyticsDashboardPage = lazy(() => import('../pages/AnalyticsDashboardPage.jsx').then((module) => ({ default: module.AnalyticsDashboardPage })))
const AdminControlCenterPage = lazy(() => import('../pages/AdminControlCenterPage.jsx').then((module) => ({ default: module.AdminControlCenterPage })))
const AdminLogisticsPage = lazy(() => import('../pages/AdminLogisticsPage.jsx').then((module) => ({ default: module.AdminLogisticsPage })))
const AdminContentPage = lazy(() => import('../pages/AdminContentPage.jsx').then((module) => ({ default: module.AdminContentPage })))
const AdminAnnouncementsPage = lazy(() => import('../pages/AdminAnnouncementsPage.jsx'))
const AdminEducationContentPage = lazy(() => import('../pages/AdminEducationContentPage.jsx'))
const FarmWorkflowPage = lazy(() => import('../pages/FarmWorkflowPage.jsx').then((module) => ({ default: module.FarmWorkflowPage })))
const RetailerOrderWorkflowPage = lazy(() => import('../pages/RetailerOrderWorkflowPage.jsx').then((module) => ({ default: module.RetailerOrderWorkflowPage })))
const ShippingProofPage = lazy(() => import('../pages/ShippingProofPage.jsx').then((module) => ({ default: module.ShippingProofPage })))
const AuthLandingPage = lazy(() => import('../pages/AuthLandingPage.jsx').then((module) => ({ default: module.AuthLandingPage })))
>>>>>>> Stashed changes

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
            <Route path="/dashboard/admin/accounts" element={<AdminDashboardPage defaultTab="users" />} />
            <Route path="/dashboard/admin/operations" element={<AdminDashboardPage defaultTab="farms" />} />
            <Route path="/dashboard/admin/products" element={<AdminDashboardPage defaultTab="products" />} />
            <Route path="/dashboard/admin/blockchain" element={<AdminDashboardPage defaultTab="blockchain" />} />
            <Route path="/dashboard/appearance" element={<WebsiteAppearancePage />} />
<<<<<<< Updated upstream
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/farms" element={<AdminFarmsPage />} />
            <Route path="/admin/operations-plus" element={<AdminOperationsPage />} />
=======
            <Route path="/dashboard/admin/control-center" element={<AdminControlCenterPage />} />
            <Route path="/dashboard/admin/accounts" element={<AdminUsersPage />} />
            <Route path="/dashboard/admin/operations" element={<AdminOperationsPage />} />
            <Route path="/dashboard/admin/farms" element={<AdminFarmsPage />} />
            <Route path="/dashboard/admin/retailers" element={<AdminRetailersPage />} />
            <Route path="/dashboard/admin/packages" element={<AdminPackagesPage />} />
            <Route path="/dashboard/admin/logistics" element={<AdminLogisticsPage />} />
            <Route path="/dashboard/admin/products" element={<AdminProductsPage />} />
            <Route path="/dashboard/admin/blockchain" element={<AdminBlockchainTracePage />} />
            <Route path="/dashboard/admin/blockchain/ops" element={<Navigate to="/dashboard/admin/blockchain" replace />} />
            <Route path="/dashboard/admin/content" element={<AdminContentPage />} />
            <Route path="/dashboard/admin/announcements" element={<AdminAnnouncementsPage />} />
            <Route path="/dashboard/admin/education" element={<AdminEducationContentPage />} />
            <Route path="/dashboard/admin/analytics" element={<AnalyticsDashboardPage />} />
            <Route path="/dashboard/analytics" element={<Navigate to="/dashboard/admin/analytics" replace />} />

            <Route path="/admin/users" element={<Navigate to="/dashboard/admin/accounts" replace />} />
            <Route path="/admin/farms" element={<Navigate to="/dashboard/admin/farms" replace />} />
            <Route path="/admin/operations-plus" element={<Navigate to="/dashboard/admin/control-center" replace />} />
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
            <Route path="/dashboard/driver" element={<RoleDashboardPage {...dashboardConfigs.driver} />} />
            <Route path="/driver/proof" element={<ShippingProofPage />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.GUEST]} />}>
            <Route path="/dashboard/guest" element={<GuestMarketplacePage />} />
          </Route>
=======
            <Route path="/dashboard/retailer" element={<RetailerWorkspacePage module="overview" />} />
            <Route path="/retailer/workspace" element={<RetailerWorkspacePage module="overview" />} />
            <Route path="/retailer/profile" element={<RetailerWorkspacePage module="profile" />} />
            <Route path="/retailer/marketplace" element={<RetailerWorkspacePage module="marketplace" />} />
            <Route path="/retailer/trace" element={<RetailerWorkspacePage module="trace" />} />
            <Route path="/retailer/orders" element={<RetailerWorkspacePage module="orders" />} />
            <Route path="/retailer/deposit" element={<RetailerWorkspacePage module="deposit" />} />
            <Route path="/retailer/history" element={<RetailerWorkspacePage module="history" />} />
            <Route path="/retailer/shipping" element={<RetailerWorkspacePage module="shipping" />} />
            <Route path="/retailer/messages" element={<RetailerWorkspacePage module="messages" />} />
            <Route path="/retailer/reports" element={<RetailerWorkspacePage module="reports" />} />
            <Route path="/retailer/contracts" element={<RetailerWorkspacePage module="contracts" />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.SHIPPING_MANAGER]} />}>
            <Route path="/dashboard/shipping-manager" element={<ShippingWorkspacePage module="overview" />} />
            <Route path="/shipping/workspace" element={<ShippingWorkspacePage module="overview" />} />
            <Route path="/shipping/orders" element={<ShippingWorkspacePage module="orders" />} />
            <Route path="/shipping/create" element={<Navigate to="/shipping/orders" replace />} />
            <Route path="/shipping/tracking" element={<Navigate to="/shipping/orders" replace />} />
            <Route path="/shipping/drivers" element={<ShippingWorkspacePage module="drivers" />} />
            <Route path="/shipping/vehicles" element={<ShippingWorkspacePage module="vehicles" />} />
            <Route path="/shipping/notifications" element={<ShippingWorkspacePage module="notifications" />} />
            <Route path="/shipping/reports" element={<ShippingWorkspacePage module="reports" />} />
            <Route path="/shipping/sendreport" element={<ShippingWorkspacePage module="sendreport" />} />
            <Route path="/shipping/sendnotification" element={<ShippingWorkspacePage module="sendnotification" />} />
            <Route path="/shipping/completed" element={<ShippingWorkspacePage module="completed" />} />
            <Route path="/shipping/profile" element={<ShippingWorkspacePage module="profile" />} />
            <Route path="/shipping/proof" element={<ShippingProofPage />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.DRIVER]} />}>
            <Route path="/dashboard/driver" element={<DriverMobilePage module="shipments" />} />
            <Route path="/driver/workspace" element={<DriverMobilePage module="shipments" />} />
            <Route path="/driver/qr" element={<DriverMobilePage module="qr" />} />
            <Route path="/driver/pickup" element={<DriverMobilePage module="pickup" />} />
            <Route path="/driver/checkpoint" element={<DriverMobilePage module="checkpoint" />} />
            <Route path="/driver/handover" element={<DriverMobilePage module="handover" />} />
            <Route path="/driver/report" element={<DriverMobilePage module="report" />} />
            <Route path="/driver/mobile" element={<DriverMobilePage />} />
            <Route path="/driver/proof" element={<ShippingProofPage />} />
          </Route>

>>>>>>> Stashed changes
        </Route>
      </Route>

      <Route path="/guest" element={<Navigate to="/guest/overview" replace />} />
      <Route path="/dashboard/guest" element={<Navigate to="/guest/overview" replace />} />
      <Route path="/guest/overview" element={<GuestMarketplacePage module="overview" />} />
      <Route path="/guest/search" element={<GuestMarketplacePage module="search" />} />
      <Route path="/guest/announcements" element={<GuestMarketplacePage module="announcements" />} />
      <Route path="/guest/education" element={<GuestMarketplacePage module="education" />} />

      <Route path="/public/trace" element={<PublicTracePage />} />
<<<<<<< Updated upstream
=======
      <Route path="/trace/:traceCode" element={<PublicTracePage />} />
      <Route path="/trace/batch/:batchId" element={<PublicTracePage />} />
      <Route path="/marketplace" element={<PublicMarketplacePage />} />
      <Route path="/content" element={<PublicMarketplacePage />} />
      <Route path="/announcements" element={<PublicAnnouncementsPage />} />
      <Route path="/education" element={<PublicEducationPage />} />
>>>>>>> Stashed changes
      <Route path="/listings/:id" element={<ListingDetailPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
