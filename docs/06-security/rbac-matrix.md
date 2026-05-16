---
title: RBAC Matrix
ids: []
status: active
last-reviewed: 2026-05-16
language: en
---

# RBAC Matrix

Authoritative authorization decisions for every resource × role pair. Backend `@PreAuthorize` annotations and route guards reference this matrix. Cell grammar per design D3:

```
cell-value := "allow" | "deny" | conditional
conditional := "conditional:" br-id ( "&" br-id )*
```

**Frontend** enforces role-shape only (per design D5); `conditional:BR-*` cells are evaluated server-side; UI renders optimistically and handles 403. AND-only grammar; OR or NOT requires row split or `GAP-*`. Default value for any new resource: `deny`.

`BR-*` references resolve to [`../02-domain/business-rules.md`](../02-domain/business-rules.md). When farm ownership conditions need to combine, write multiple BR-* joined by `&`.

## Matrix

| resource | admin | farm_manager | retailer | shipping_manager | driver | guest |
|---|---|---|---|---|---|---|
| `User.profile.read-self` | allow | allow | allow | allow | allow | allow |
| `User.profile.update-self` | allow | conditional:BR-USR-010 | conditional:BR-USR-010 | conditional:BR-USR-010 | conditional:BR-USR-010 | deny |
| `User.admin-crud` | allow | deny | deny | deny | deny | deny |
| `User.role.assign` | allow | deny | deny | deny | deny | deny |
| `Farm.profile.read-own` | allow | conditional:BR-FRM-010 | deny | deny | deny | deny |
| `Farm.profile.read-public` | allow | allow | allow | allow | allow | allow |
| `Farm.profile.update` | allow | conditional:BR-FRM-010&BR-FRM-030 | deny | deny | deny | deny |
| `Farm.application.submit` | deny | conditional:BR-FRMAPP-010 | deny | deny | deny | deny |
| `Farm.application.approve` | conditional:BR-FRMAPP-020 | deny | deny | deny | deny | deny |
| `Farm.application.reject` | conditional:BR-FRMAPP-030 | deny | deny | deny | deny | deny |
| `Farm.application.suspend` | conditional:BR-FRMAPP-040 | deny | deny | deny | deny | deny |
| `Farm.application.reinstate` | conditional:BR-FRMAPP-050 | deny | deny | deny | deny | deny |
| `Farm.application.revoke` | conditional:BR-FRMAPP-060 | deny | deny | deny | deny | deny |
| `Season.create` | allow | conditional:BR-FRM-010&BR-FRM-020&BR-FRM-030 | deny | deny | deny | deny |
| `Season.update-process` | allow | conditional:BR-FRM-010&BR-FRM-020&BR-FRM-030 | deny | deny | deny | deny |
| `Season.export` | allow | conditional:BR-FRM-010&BR-FRM-020&BR-FRM-030 | deny | deny | deny | deny |
| `Season.qr.generate` | allow | conditional:BR-FRM-010&BR-FRM-020&BR-FRM-030 | deny | deny | deny | deny |
| `Season.read-own` | allow | conditional:BR-FRM-010 | deny | deny | deny | deny |
| `Season.read-trace-public` | allow | allow | allow | allow | allow | allow |
| `Batch.create` | allow | conditional:BR-FRM-010&BR-FRM-020&BR-FRM-030 | deny | deny | deny | deny |
| `Batch.read-own` | allow | conditional:BR-FRM-010 | deny | deny | deny | deny |
| `Batch.read-public` | allow | allow | allow | allow | allow | allow |
| `Listing.create` | allow | conditional:BR-FRM-010&BR-FRM-020&BR-FRM-030 | deny | deny | deny | deny |
| `Listing.update-own` | allow | conditional:BR-FRM-010&BR-FRM-020 | deny | deny | deny | deny |
| `Listing.archive-own` | allow | conditional:BR-FRM-010 | deny | deny | deny | deny |
| `Listing.browse-public` | allow | allow | allow | allow | allow | allow |
| `Listing.read-detail-public` | allow | allow | allow | allow | allow | allow |
| `Order.create` | deny | deny | allow | deny | deny | deny |
| `Order.deposit` | deny | deny | conditional:BR-ORD-020 | deny | deny | deny |
| `Order.cancel` | allow | deny | conditional:BR-ORD-030 | deny | deny | deny |
| `Order.accept` | deny | conditional:BR-ORD-040 | deny | deny | deny | deny |
| `Order.reject` | deny | conditional:BR-ORD-050 | deny | deny | deny | deny |
| `Order.read-own-retailer` | allow | deny | allow | deny | deny | deny |
| `Order.read-own-farm` | allow | conditional:BR-FRM-010 | deny | deny | deny | deny |
| `Order.confirm-receipt` | deny | deny | allow | deny | deny | deny |
| `Order.dispute` | allow | conditional:BR-ORD-090 | conditional:BR-ORD-090 | conditional:BR-ORD-090 | conditional:BR-ORD-090 | deny |
| `Order.complete` | allow | conditional:BR-ORD-100 | deny | deny | deny | deny |
| `Order.list-eligible-shipments` | allow | deny | deny | allow | deny | deny |
| `Shipment.create` | allow | deny | deny | conditional:BR-SHP-010 | deny | deny |
| `Shipment.assign` | allow | deny | deny | conditional:BR-SHP-020 | deny | deny |
| `Shipment.cancel` | allow | deny | deny | conditional:BR-SHP-070 | deny | deny |
| `Shipment.update-status-pickup` | deny | deny | deny | deny | conditional:BR-SHP-030 | deny |
| `Shipment.update-status-transit` | deny | deny | deny | deny | conditional:BR-SHP-040 | deny |
| `Shipment.update-status-delivered` | deny | deny | deny | deny | conditional:BR-SHP-050 | deny |
| `Shipment.retailer-reject-delivery` | allow | deny | conditional:BR-SHP-080 | deny | deny | deny |
| `Shipment.dispute` | allow | deny | deny | conditional:BR-SHP-090 | conditional:BR-SHP-090 | deny |
| `Shipment.escalate` | allow | deny | deny | conditional:BR-SHP-100 | conditional:BR-SHP-100 | deny |
| `Shipment.shipping-manager-reject` | allow | deny | deny | conditional:BR-SHP-110 | deny | deny |
| `Shipment.read-list-all` | allow | deny | deny | allow | deny | deny |
| `Shipment.read-related-own` | allow | conditional:BR-FRM-010 | allow | allow | conditional:BR-SHP-030 | deny |
| `Shipment.upload-proof` | allow | deny | conditional:BR-SHP-060 | deny | conditional:BR-SHP-030 | deny |
| `Vehicle.crud` | allow | deny | deny | allow | deny | deny |
| `Driver.crud` | allow | deny | deny | allow | deny | deny |
| `Subscription.purchase` | allow | conditional:BR-SUB-010 | deny | deny | deny | deny |
| `Subscription.cancel` | allow | conditional:BR-SUB-080 | deny | deny | deny | deny |
| `Subscription.renew` | allow | conditional:BR-SUB-070 | deny | deny | deny | deny |
| `Subscription.read-own` | allow | conditional:BR-FRM-010 | deny | deny | deny | deny |
| `ServicePackage.crud` | allow | deny | deny | deny | deny | deny |
| `ServicePackage.read` | allow | allow | allow | allow | allow | allow |
| `Product.catalog.crud` | allow | deny | deny | deny | deny | deny |
| `Product.catalog.read` | allow | allow | allow | allow | allow | allow |
| `Content.create` | allow | deny | deny | deny | deny | deny |
| `Content.read-public` | allow | allow | allow | allow | allow | allow |
| `Content.appearance.update` | allow | deny | deny | deny | deny | deny |
| `Media.upload` | allow | conditional:BR-FRM-010 | conditional:BR-SHP-060 | conditional:BR-SHP-020 | conditional:BR-SHP-030 | deny |
| `Media.read-public` | allow | allow | allow | allow | allow | allow |
| `Trace.public-lookup` | allow | allow | allow | allow | allow | allow |
| `Trace.qr-scan` | allow | allow | allow | allow | conditional:BR-SHP-030 | allow |
| `Notification.read-own` | allow | allow | allow | allow | allow | allow |
| `Notification.send-cross-entity` | allow | conditional:BR-FRM-010 | conditional:BR-ORD-010 | conditional:BR-SHP-010 | conditional:BR-SHP-030 | deny |
| `Report.submit-to-admin` | allow | allow | allow | allow | deny | deny |
| `Report.submit-driver-to-shipping` | deny | deny | deny | deny | allow | deny |
| `Report.read-driver-reports` | allow | conditional:BR-FRM-010 | deny | allow | deny | deny || `Analytics.dashboard.platform` | allow | deny | deny | deny | deny | deny |
| `Analytics.dashboard.role-scoped` | allow | conditional:BR-FRM-010 | allow | allow | allow | deny |
| `Admin.governance.dashboard` | allow | deny | deny | deny | deny | deny |
| `Admin.smart-contract.deploy` | allow | deny | deny | deny | deny | deny |
| `Admin.smart-contract.update` | allow | deny | deny | deny | deny | deny |
| `Admin.audit-log.read` | allow | deny | deny | deny | deny | deny |
| `IoT.sensor.ingest` | allow | conditional:BR-IOT-020 | deny | deny | deny | deny |
| `IoT.alert.read-own` | allow | conditional:BR-FRM-010 | deny | deny | deny | deny |

## Notes

- `Admin.smart-contract.deploy` và `update` reflect Brief; current implementation chỉ partial cover. See [`GAP-001`](../09-governance/gap-register.md).
- `Trace.qr-scan` cell cho driver dùng `conditional:BR-SHP-030` vì driver chỉ scan trong scope shipment được assign (R-DRV-030).
- `Notification.send-cross-entity`: gửi notification giữa các entity khác nhau yêu cầu relationship đã established (e.g., farm owns order, shipping manager owns shipment).
- `Media.upload` cells cho retailer/driver dùng conditional vì chỉ cho phép upload trong scope cụ thể (retailer upload proof cho shipment họ confirm; driver upload proof cho shipment được assign).

## Frontend Implementation Note

Per design D5: frontend route guards check role-only (e.g., `RoleProtectedRoute role="farm_manager"`). Conditional cells (e.g., farm ownership) enforced server-side; UI renders optimistic action buttons and handles `403 FORBIDDEN` responses with toast notification. This is design-only — implementation deferred to follow-up spec `frontend-rbac-binding`.

## Update Procedure

1. Add new resource row → default `deny` for all 6 columns (R7.6).
2. Promote a cell to `allow` or `conditional:BR-*` only after BR-* exists in `business-rules.md`.
3. Any cell value outside `allow|deny|conditional:BR-*(&BR-*)*` → `docs:lint` failure.
4. OR/NOT semantics → split resource into multiple rows or open `GAP-*`.
