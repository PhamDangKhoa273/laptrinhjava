# BICAP Phase 2-4 Spec Checklist

| Requirement | Module / File / API | Status | Evidence |
|---|---|---|---|
| Authentication, RBAC, profile bootstrap | `modules/auth`, `modules/user`, `SecurityConfig.java` | Done | Backend controllers/services + existing tests |
| Farm profile CRUD | `modules/farm`, `frontend/src/pages/FarmWorkspacePage.jsx` | Done | Controller/service/UI |
| Retailer profile CRUD | `modules/retailer`, `frontend/src/pages/RetailerWorkspacePage.jsx` | Done | Controller/service/UI |
| Service package + subscription | `modules/subscription` | Done | Controller/service/tests |
| Subscription payment visibility | `SubscriptionPaymentController.java`, `/api/v1/subscription-payments/me` | Done | Backend endpoint + test-passing build |
| Season / process / batch / QR traceability | `modules/season`, `modules/batch` | Done | Controllers/services/tests |
| Marketplace listing creation | `modules/listing`, `ProductListingService.java` | Done | Controller/service |
| Listing approval workflow | `ListingRegistrationRequest*`, `/api/v1/listings/{id}/submit`, review APIs, `AdminOperationsPage.jsx`, `FarmWorkflowPage.jsx` | Partial | Backend done, frontend basic page added, not yet polished into unified dashboard |
| Marketplace public listing visibility after approval | `ProductListing.approvalStatus`, `findByStatusAndApprovalStatus` | Done | Backend query gate |
| Retailer order creation | `modules/order`, `RetailerOrderWorkflowPage.jsx` | Done | Backend + basic UI |
| Retailer deposit payment | `/api/v1/orders/{id}/deposit`, `RetailerOrderWorkflowPage.jsx` | Done | Backend + basic UI |
| Order status workflow | `OrderService.java`, `OrderController.java` | Done | Actor-based transition rules added for farm, retailer, shipping manager/driver |
| Order cancellation with reason | `/api/v1/orders/{id}/cancel`, retailer page | Done | Backend + basic UI, restricted to `PENDING` and `CONFIRMED` |
| Delivery confirmation with proof | `/api/v1/orders/{id}/confirm-delivery`, `/api/v1/orders/{id}/delivery-proof/upload`, retailer page | Done | Multipart upload + proof requirement before completion |
| Shipping proof / logistics evidence | `/api/v1/orders/{id}/shipping-proof`, `/api/v1/orders/{id}/shipping-proof/upload`, `ShippingProofPage.jsx` | Done | Multipart upload + proof requirement before `DELIVERED` |
| Notifications between roles | `modules/common/notification`, `workflowService.js`, admin/farm/retailer pages | Partial | Backend done, basic UI views added, no realtime/push yet |
| Reporting workflow | `modules/common/report`, admin/farm pages | Partial | Backend done, basic UI views added, no escalation lifecycle yet |
| Guest educational content | `modules/content`, `AdminOperationsPage.jsx`, `GuestMarketplacePage.jsx` | Done | Backend + admin create UI + public guest rendering |
| Admin operations for phase 2-4 | `AdminDashboardPage.jsx`, `AdminOperationsPage.jsx`, `DashboardLayout.jsx` | Partial | Better consolidated with a control-center entry point, but still not a fully unified polished admin console |
| Proof upload as real files | `modules/media`, `V16__create_media_storage_for_order_proofs.sql`, multipart endpoints | Done | File validation, metadata storage, and static serving via `/uploads/**` |
| Repo hygiene and secret cleanup | `.gitignore`, `application.properties`, `.env.example`, removal of `frontend/frontend/**` | Partial | Hardcoded mail secret removed, nested duplicate frontend trees removed, frontend build verified, but broader artifact/history cleanup is still advisable |

## Honest summary

- **Done**: core phase 2-4 business backbone is now real and usable.
- **Partial**: the newly-added notification/report/listing-approval/proof flows exist end-to-end at a baseline level, but are not yet polished enough to call "fully complete".
- **Missing before a strong phase 5-6 handoff**:
  1. admin UX consolidation to a more polished single-pane workflow
  2. broader artifact/history cleanup and final repo hygiene pass
  3. notification/report UX polish and realtime strategy if desired
