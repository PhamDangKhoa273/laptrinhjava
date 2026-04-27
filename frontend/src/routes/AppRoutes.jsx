import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoadingScreen } from '../components/LoadingScreen.jsx'
import { AuthLayout } from '../layouts/AuthLayout.jsx'
import { DashboardLayout } from '../layouts/DashboardLayout.jsx'
import { ROLES } from '../utils/constants'
import { ProtectedRoute } from './ProtectedRoute.jsx'
import { PublicOnlyRoute } from './PublicOnlyRoute.jsx'
import { RoleProtectedRoute } from './RoleProtectedRoute.jsx'

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
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage.jsx').then((module) => ({ default: module.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage.jsx').then((module) => ({ default: module.ResetPasswordPage })))
const BatchDetailPage = lazy(() => import('../pages/BatchDetailPage.jsx').then((module) => ({ default: module.BatchDetailPage })))
const ListingDetailPage = lazy(() => import('../pages/ListingDetailPage.jsx').then((module) => ({ default: module.ListingDetailPage })))
const AdminOperationsPage = lazy(() => import('../pages/AdminOperationsPage.jsx').then((module) => ({ default: module.AdminOperationsPage })))
const AnalyticsDashboardPage = lazy(() => import('../pages/AnalyticsDashboardPage.jsx').then((module) => ({ default: module.AnalyticsDashboardPage })))
const AdminControlCenterPage = lazy(() => import('../pages/AdminControlCenterPage.jsx').then((module) => ({ default: module.AdminControlCenterPage })))
const AdminLogisticsPage = lazy(() => import('../pages/AdminLogisticsPage.jsx').then((module) => ({ default: module.AdminLogisticsPage })))
const AdminContentPage = lazy(() => import('../pages/AdminContentPage.jsx').then((module) => ({ default: module.AdminContentPage })))
const FarmWorkflowPage = lazy(() => import('../pages/FarmWorkflowPage.jsx').then((module) => ({ default: module.FarmWorkflowPage })))
const RetailerOrderWorkflowPage = lazy(() => import('../pages/RetailerOrderWorkflowPage.jsx').then((module) => ({ default: module.RetailerOrderWorkflowPage })))
const ShippingProofPage = lazy(() => import('../pages/ShippingProofPage.jsx').then((module) => ({ default: module.ShippingProofPage })))
const AuthLandingPage = lazy(() => import('../pages/AuthLandingPage.jsx').then((module) => ({ default: module.AuthLandingPage })))

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen message="Đang tải giao diện BICAP..." />}>
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

      <Route path="/auth/landing" element={<AuthLandingPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardHomePage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/dashboard/admin" element={<Navigate to="/dashboard/admin/control-center" replace />} />
            <Route path="/dashboard/appearance" element={<WebsiteAppearancePage />} />
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
            <Route path="/dashboard/admin/analytics" element={<AnalyticsDashboardPage />} />
            <Route path="/dashboard/analytics" element={<Navigate to="/dashboard/admin/analytics" replace />} />

            <Route path="/admin/users" element={<Navigate to="/dashboard/admin/accounts" replace />} />
            <Route path="/admin/farms" element={<Navigate to="/dashboard/admin/farms" replace />} />
            <Route path="/admin/operations-plus" element={<Navigate to="/dashboard/admin/control-center" replace />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.FARM]} />}>
            <Route path="/dashboard/farm" element={<FarmWorkspacePage module="overview" />} />
            <Route path="/farm/workspace" element={<Navigate to="/dashboard/farm" replace />} />
            <Route path="/farm/profile" element={<FarmWorkspacePage module="profile" />} />
            <Route path="/farm/packages" element={<FarmWorkspacePage module="packages" />} />
            <Route path="/farm/seasons" element={<FarmWorkspacePage module="seasons" />} />
            <Route path="/farm/blockchain" element={<FarmWorkspacePage module="blockchain" />} />
            <Route path="/farm/export-qr" element={<FarmWorkspacePage module="export" />} />
            <Route path="/farm/marketplace" element={<FarmWorkspacePage module="marketplace" />} />
            <Route path="/farm/contracts" element={<FarmWorkspacePage module="contracts" />} />
            <Route path="/farm/shipping" element={<FarmWorkspacePage module="shipping" />} />
            <Route path="/farm/iot" element={<FarmWorkspacePage module="iot" />} />
            <Route path="/farm/reports" element={<FarmWorkspacePage module="reports" />} />
            <Route path="/farm/workflow" element={<FarmWorkflowPage />} />
            <Route path="/farm/phase3" element={<FarmPhase3Page />} />
            <Route path="/batches/:id" element={<BatchDetailPage />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.RETAILER]} />}>
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
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.SHIPPING_MANAGER]} />}>
            <Route path="/dashboard/shipping-manager" element={<ShippingWorkspacePage module="overview" />} />
            <Route path="/shipping/workspace" element={<ShippingWorkspacePage module="overview" />} />
            <Route path="/shipping/orders" element={<ShippingWorkspacePage module="orders" />} />
            <Route path="/shipping/create" element={<ShippingWorkspacePage module="create" />} />
            <Route path="/shipping/tracking" element={<ShippingWorkspacePage module="tracking" />} />
            <Route path="/shipping/drivers" element={<ShippingWorkspacePage module="drivers" />} />
            <Route path="/shipping/vehicles" element={<ShippingWorkspacePage module="vehicles" />} />
            <Route path="/shipping/notifications" element={<ShippingWorkspacePage module="notifications" />} />
            <Route path="/shipping/reports" element={<ShippingWorkspacePage module="reports" />} />
            <Route path="/shipping/proof" element={<ShippingProofPage />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.DRIVER]} />}>
            <Route path="/dashboard/driver" element={<DriverWorkspacePage module="shipments" />} />
            <Route path="/driver/workspace" element={<DriverWorkspacePage module="shipments" />} />
            <Route path="/driver/qr" element={<DriverWorkspacePage module="qr" />} />
            <Route path="/driver/pickup" element={<DriverWorkspacePage module="pickup" />} />
            <Route path="/driver/checkpoint" element={<DriverWorkspacePage module="checkpoint" />} />
            <Route path="/driver/handover" element={<DriverWorkspacePage module="handover" />} />
            <Route path="/driver/report" element={<DriverWorkspacePage module="report" />} />
            <Route path="/driver/mobile" element={<DriverMobilePage />} />
            <Route path="/driver/proof" element={<ShippingProofPage />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.GUEST]} />}>
            <Route path="/dashboard/guest" element={<GuestMarketplacePage module="overview" />} />
            <Route path="/guest/search" element={<GuestMarketplacePage module="search" />} />
            <Route path="/guest/announcements" element={<GuestMarketplacePage module="announcements" />} />
            <Route path="/guest/education" element={<GuestMarketplacePage module="education" />} />
          </Route>
        </Route>
      </Route>

      <Route path="/public/trace" element={<PublicTracePage />} />
      <Route path="/trace/:traceCode" element={<PublicTracePage />} />
      <Route path="/trace/batch/:batchId" element={<PublicTracePage />} />
      <Route path="/marketplace" element={<PublicMarketplacePage />} />
      <Route path="/content" element={<PublicMarketplacePage />} />
      <Route path="/announcements" element={<PublicAnnouncementsPage />} />
      <Route path="/listings/:id" element={<ListingDetailPage />} />
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
