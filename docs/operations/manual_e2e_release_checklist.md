# BICAP Manual E2E Release Checklist

Use this checklist after backend and frontend are running against the target environment.
Mark every item before a deployment/demo handoff.

## Environment

- [ ] `VITE_API_BASE_URL` points to the target backend.
- [ ] Backend CORS allows the exact frontend origin.
- [ ] HTTPS is enabled in production.
- [ ] `app.auth.refresh-cookie-secure=true` in production HTTPS.
- [ ] `app.auth.refresh-cookie-same-site` matches deployment topology:
  - `Lax` for same-site frontend/backend.
  - `None` for cross-site frontend/backend over HTTPS.
- [ ] Database migrations have run successfully.
- [ ] Admin seed/account policy is known.

## Auth and Session

- [ ] Register a new account successfully.
- [ ] Login returns user profile and opens correct role dashboard.
- [ ] Refresh token is not stored in browser `localStorage`.
- [ ] Refresh cookie is HttpOnly.
- [ ] Reload authenticated page and session restores from cookie/access token.
- [ ] Logout clears local auth state and expires refresh cookie.
- [ ] Protected route redirects/blocks after logout.

## Guest Flow

- [ ] Open marketplace without login.
- [ ] Search by keyword.
- [ ] Filter by province/category/price/certification.
- [ ] Toggle available/verified filters.
- [ ] Open public trace/QR page.
- [ ] Public announcements render safely.

## Admin Flow

- [ ] Open admin dashboard.
- [ ] Review user list and role/status data.
- [ ] Approve/block/update a user if test data allows.
- [ ] Review farms.
- [ ] Review retailers.
- [ ] Review service packages/subscriptions.
- [ ] Review logistics overview.
- [ ] Review blockchain trace page.
- [ ] Update website announcement/content with safe HTML.

## Farm Flow

- [ ] Login as Farm.
- [ ] Open farm workspace.
- [ ] Create or review season data.
- [ ] Create or review batch data.
- [ ] Confirm QR/trace data exists for batch/listing.
- [ ] Create/review/cancel retailer contract where test data allows.
- [ ] Confirm profile/subscription state renders correctly.

## Retailer Flow

- [ ] Login as Retailer.
- [ ] Open retailer workspace.
- [ ] Browse marketplace/listings.
- [ ] Place or inspect order.
- [ ] Pay deposit where test data allows.
- [ ] Cancel order with reason where test data allows.
- [ ] Confirm delivery and proof state.
- [ ] Create support report.
- [ ] Mark notification read.

## Shipping Manager Flow

- [ ] Login as Shipping Manager.
- [ ] Open shipping workspace.
- [ ] Create or update driver.
- [ ] Create or update vehicle.
- [ ] Create shipment from eligible order.
- [ ] Update shipment status.
- [ ] Confirm notifications update.

## Driver Flow

- [ ] Login as Driver.
- [ ] Review assigned shipments.
- [ ] Update pickup/in-transit/delivered state if available.
- [ ] Upload shipping proof file.
- [ ] Confirm proof appears on order/shipment detail.

## Regression Gates

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] `.\mvnw.cmd clean package` passes.
- [ ] No console errors on the main role pages.
- [ ] No unexpected 401 loop during refresh.
- [ ] No refresh token appears in localStorage/sessionStorage.
