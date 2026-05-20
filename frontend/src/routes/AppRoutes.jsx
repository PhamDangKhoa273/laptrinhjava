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
const FarmWorkspacePage = lazy(() => import('../pages/FarmWorkspacePage.jsx').then((module) => ({ default: module.FarmWorkspacePage })))
const FarmProfilePage = lazy(() => import('../pages/FarmProfilePage.jsx').then((module) => ({ default: module.FarmProfilePage })))
const FarmMarketplacePage = lazy(() => import('../pages/FarmMarketplacePage.jsx').then((module) => ({ default: module.FarmMarketplacePage })))
const FarmSubscriptionPage = lazy(() => import('../pages/FarmSubscriptionPage.jsx').then((module) => ({ default: module.FarmSubscriptionPage })))
const FarmReportsPage = lazy(() => import('../pages/FarmReportsPage.jsx').then((module) => ({ default: module.FarmReportsPage })))
const FarmNotificationsPage = lazy(() => import('../pages/FarmNotificationsPage.jsx').then((module) => ({ default: module.FarmNotificationsPage })))
const FarmSeasonsPage = lazy(() => import('../pages/FarmSeasonsPage.jsx').then((module) => ({ default: module.FarmSeasonsPage })))
const FarmBatchesPage = lazy(() => import('../pages/FarmBatchesPage.jsx').then((module) => ({ default: module.FarmBatchesPage })))
const FarmExportQrPage = lazy(() => import('../pages/FarmExportQrPage.jsx').then((module) => ({ default: module.FarmExportQrPage })))
const FarmOrdersPage = lazy(() => import('../pages/FarmOrdersPage.jsx').then((module) => ({ default: module.FarmOrdersPage })))
const FarmShippingPage = lazy(() => import('../pages/FarmShippingPage.jsx').then((module) => ({ default: module.FarmShippingPage })))
const FarmShipmentReportsPage = lazy(() => import('../pages/FarmShipmentReportsPage.jsx').then((module) => ({ default: module.FarmShipmentReportsPage })))
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
const RetailerOrderWorkflowPage = lazy(() => import('../pages/RetailerOrderWorkflowPage.jsx').then((module) => ({ default: module.RetailerOrderWorkflowPage })))
const ShippingProofPage = lazy(() => import('../pages/ShippingProofPage.jsx').then((module) => ({ default: module.ShippingProofPage })))
const AuthLandingPage = lazy(() => import('../pages/AuthLandingPage.jsx').then((module) => ({ default: module.AuthLandingPage })))

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen message="Đang t?i giao di?n BICAP..." />}>
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
            <Route path="/dashboard/admin/announcements" element={<AdminAnnouncementsPage />} />
            <Route path="/dashboard/admin/education" element={<AdminEducationContentPage />} />
            <Route path="/dashboard/admin/analytics" element={<AnalyticsDashboardPage />} />
            <Route path="/dashboard/analytics" element={<Navigate to="/dashboard/admin/analytics" replace />} />

            <Route path="/admin/users" element={<Navigate to="/dashboard/admin/accounts" replace />} />
            <Route path="/admin/farms" element={<Navigate to="/dashboard/admin/farms" replace />} />
            <Route path="/admin/operations-plus" element={<Navigate to="/dashboard/admin/control-center" replace />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.FARM]} />}>
            <Route path="/dashboard/farm" element={<FarmWorkspacePage module="overview" />} />
            <Route path="/farm/workspace" element={<Navigate to="/dashboard/farm" replace />} />
            <Route path="/farm/profile" element={<FarmProfilePage />} />
            <Route path="/farm/subscription" element={<FarmSubscriptionPage />} />
            <Route path="/farm/seasons" element={<FarmSeasonsPage />} />
            <Route path="/farm/packages" element={<FarmBatchesPage />} />
            <Route path="/farm/export-qr" element={<FarmExportQrPage />} />
            <Route path="/farm/blockchain" element={<Navigate to="/farm/export-qr" replace />} />
            <Route path="/farm/marketplace" element={<FarmMarketplacePage />} />
            <Route path="/farm/contracts" element={<FarmWorkspacePage module="contracts" />} />
            <Route path="/farm/orders" element={<FarmOrdersPage />} />
            <Route path="/farm/shipping" element={<FarmShippingPage />} />
            <Route path="/farm/shipment-reports" element={<FarmShipmentReportsPage />} />
            <Route path="/farm/iot" element={<Navigate to="/farm/shipment-reports" replace />} />
            <Route path="/farm/reports" element={<FarmReportsPage />} />
            <Route path="/farm/notifications" element={<FarmNotificationsPage />} />
            <Route path="/farm/workflow" element={<Navigate to="/farm/orders" replace />} />
            <Route path="/farm/phase3" element={<Navigate to="/farm/seasons" replace />} />
            <Route path="/batches/:id" element={<BatchDetailPage />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.RETAILER]} />}>
            <Route path="/dashboard/retailer" element={<RetailerWorkspacePage module="overview" />} />
            <Route path="/retailer/workspace" element={<RetailerWorkspacePage module="overview" />} />
            <Route path="/retailer/profile" element={<RetailerWorkspacePage module="profile" />} />
            <Route path="/retailer/marketplace" element={<RetailerWorkspacePage module="marketplace" />} />
            <Route path="/retailer/trace" element={<RetailerWorkspacePage module="trace" />} />
            <Route path="/retailer/orders" element={<RetailerWorkspacePage module="orders" />} />
            <Route path="/retailer/deposit" element={<Navigate to="/retailer/orders" replace />} />
            <Route path="/retailer/history" element={<Navigate to="/retailer/orders" replace />} />
            <Route path="/retailer/shipping" element={<RetailerWorkspacePage module="shipping" />} />
            <Route path="/retailer/notifications" element={<RetailerWorkspacePage module="notifications" />} />
            <Route path="/retailer/messages" element={<RetailerWorkspacePage module="messages" />} />
            <Route path="/retailer/reports" element={<RetailerWorkspacePage module="reports" />} />
            <Route path="/retailer/contracts" element={<Navigate to="/retailer/orders" replace />} />
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

        </Route>
      </Route>

      <Route path="/guest" element={<Navigate to="/guest/overview" replace />} />
      <Route path="/dashboard/guest" element={<Navigate to="/guest/overview" replace />} />
      <Route path="/guest/overview" element={<GuestMarketplacePage module="overview" />} />
      <Route path="/guest/search" element={<GuestMarketplacePage module="search" />} />
      <Route path="/guest/announcements" element={<GuestMarketplacePage module="announcements" />} />
      <Route path="/guest/education" element={<GuestMarketplacePage module="education" />} />

      <Route path="/public/trace" element={<PublicTracePage />} />
      <Route path="/trace/:traceCode" element={<PublicTracePage />} />
      <Route path="/trace/batch/:batchId" element={<PublicTracePage />} />
      <Route path="/marketplace" element={<PublicMarketplacePage />} />
      <Route path="/content" element={<PublicMarketplacePage />} />
      <Route path="/announcements" element={<PublicAnnouncementsPage />} />
      <Route path="/education" element={<PublicEducationPage />} />
      <Route path="/listings/:id" element={<ListingDetailPage />} />
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
