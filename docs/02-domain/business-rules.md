---
title: BICAP Business Rules — Atomic Catalog
ids: [BR-FRM-010, BR-FRM-020, BR-FRM-030, BR-FRMAPP-010, BR-FRMAPP-020, BR-FRMAPP-030, BR-FRMAPP-040, BR-FRMAPP-050, BR-FRMAPP-060, BR-ORD-010, BR-ORD-020, BR-ORD-030, BR-ORD-040, BR-ORD-050, BR-ORD-060, BR-ORD-070, BR-ORD-080, BR-ORD-090, BR-ORD-100, BR-ORD-110, BR-SHP-010, BR-SHP-020, BR-SHP-030, BR-SHP-040, BR-SHP-050, BR-SHP-060, BR-SHP-070, BR-SHP-080, BR-SHP-090, BR-SHP-100, BR-SHP-110, BR-SEA-010, BR-SEA-020, BR-SEA-030, BR-SEA-040, BR-SEA-050, BR-SUB-010, BR-SUB-020, BR-SUB-030, BR-SUB-040, BR-SUB-050, BR-SUB-060, BR-SUB-070, BR-SUB-080, BR-IOT-010, BR-IOT-020, BR-USR-010, BR-USR-020, BR-AUT-010, BR-LST-010, BR-LST-020, BR-MED-010, BR-VCH-010, BR-VCH-020, BR-TRC-010]
status: active
last-reviewed: 2026-05-16
language: vi
---

# BICAP Business Rules — Atomic Catalog

Mỗi BR-* là một quy tắc nguyên tử (single thought, single testable assertion). Statement chứa từ "AND" join hai assertion độc lập đã bị tách thành hai BR-*. Tất cả BR-* được referenced từ R-*, STM-*, hoặc cells trong RBAC matrix.

## Farm Ownership and Suspension

### BR-FRM-010 — Farm ownership check

- **domain:** FRM
- **statement:** User là owner (creator/đã được gán) của farm.
- **rationale:** Đa số farm-side actions yêu cầu user phải là owner; deny-by-default cho cross-farm access.
- **related-r:** R-FRM-030, R-FRM-080, R-FRM-090, R-FRM-100, R-FRM-110, R-FRM-120
- **related-stm:** STM-SEA-T01

### BR-FRM-020 — Active subscription required

- **domain:** FRM
- **statement:** Farm có ít nhất một `FarmSubscription` đang ở `status = ACTIVE` hoặc `EXPIRING_SOON` hoặc `GRACE_PERIOD`.
- **rationale:** Brief: "Mua gói dịch vụ để sử dụng hệ thống". Write actions yêu cầu subscription valid.
- **related-r:** R-FRM-120
- **related-stm:** STM-SUB-T02..T07

### BR-FRM-030 — Farm not suspended

- **domain:** FRM
- **statement:** Farm không ở `STM-FRMAPP` state `SUSPENDED` hoặc `REVOKED`.
- **rationale:** Admin-controlled platform health.
- **related-r:** R-FRM-030, R-FRM-120
- **related-stm:** STM-FRMAPP-T04, STM-FRMAPP-T06

## Farm Approval

### BR-FRMAPP-010 — Farm self-registration

- **domain:** FRMAPP
- **statement:** User với role `FARM` có thể submit FarmApplication mới với `status = PENDING`.
- **related-r:** R-FRM-010
- **related-stm:** STM-FRMAPP-T01

### BR-FRMAPP-020 — Approve only by ADMIN

- **domain:** FRMAPP
- **statement:** Chỉ user role `ADMIN` được phép transition FarmApplication từ `PENDING` sang `APPROVED`.
- **related-r:** R-ADM-020
- **related-stm:** STM-FRMAPP-T02

### BR-FRMAPP-030 — Reject only by ADMIN

- **domain:** FRMAPP
- **statement:** Chỉ user role `ADMIN` được phép transition FarmApplication từ `PENDING` sang `REJECTED`.
- **related-r:** R-ADM-020
- **related-stm:** STM-FRMAPP-T03

### BR-FRMAPP-040 — Suspend only by ADMIN

- **domain:** FRMAPP
- **statement:** Chỉ user role `ADMIN` được phép transition FarmApplication từ `APPROVED` sang `SUSPENDED`.
- **related-stm:** STM-FRMAPP-T04

### BR-FRMAPP-050 — Reinstate only by ADMIN

- **domain:** FRMAPP
- **statement:** Chỉ user role `ADMIN` được phép transition FarmApplication từ `SUSPENDED` sang `APPROVED`.
- **related-stm:** STM-FRMAPP-T05

### BR-FRMAPP-060 — Revoke only by ADMIN

- **domain:** FRMAPP
- **statement:** Chỉ user role `ADMIN` được phép transition FarmApplication sang `REVOKED`.
- **related-stm:** STM-FRMAPP-T06

## Order Rules

### BR-ORD-010 — Order create requires retailer + active listing

- **domain:** ORD
- **statement:** User role `RETAILER` tạo order chỉ khi listing tồn tại với `status = ACTIVE`.
- **related-r:** R-RTL-070
- **related-stm:** STM-ORD-T01

### BR-ORD-020 — Deposit at-least minimum

- **domain:** ORD
- **statement:** Deposit amount phải ≥ `deposit_minimum` của listing.
- **related-r:** R-RTL-080
- **related-stm:** STM-ORD-T02

### BR-ORD-030 — Cancel only before fulfillment

- **domain:** ORD
- **statement:** Cancel order hợp lệ chỉ khi `status ∈ {PENDING, DEPOSIT_PAID}`.
- **related-r:** R-RTL-090
- **related-stm:** STM-ORD-T07

### BR-ORD-040 — Accept only by farm owner

- **domain:** ORD
- **statement:** Accept order chỉ bởi user là owner của farm sở hữu listing.
- **related-r:** R-FRM-140
- **related-stm:** STM-ORD-T03

### BR-ORD-050 — Reject only by farm owner

- **domain:** ORD
- **statement:** Reject order chỉ bởi user là owner của farm sở hữu listing.
- **related-r:** R-FRM-140
- **related-stm:** STM-ORD-T04

### BR-ORD-060 — IN_FULFILLMENT requires shipment created

- **domain:** ORD
- **statement:** Order chỉ transition sang `IN_FULFILLMENT` khi đã có Shipment được tạo (`STM-SHP-T01`).
- **related-stm:** STM-ORD-T05

### BR-ORD-070 — Order DELIVERED follows shipment CONFIRMED

- **domain:** ORD
- **statement:** Order chỉ transition sang `DELIVERED` khi shipment liên kết đạt `CONFIRMED` (`STM-SHP-T06`).
- **related-stm:** STM-ORD-T06, STM-SHP-T06

### BR-ORD-080 — Refund follows rejection or cancellation

- **domain:** ORD
- **statement:** Order transition sang `REFUNDED` chỉ sau khi deposit refund job hoàn tất.
- **related-stm:** STM-ORD-T08

### BR-ORD-090 — Dispute can be raised by any involved party

- **domain:** ORD
- **statement:** Order có thể chuyển sang `DISPUTED` từ `READY_FOR_SHIPMENT`, `SHIPPING`, hoặc `DELIVERED` bởi retailer, farm_manager, shipping_manager hoặc driver. Cũng tự động fire khi shipment chuyển sang `REJECTED`/`DISPUTED`/`ESCALATED` (mirror).
- **related-r:** R-RTL-160 (retailer reject delivery)
- **related-stm:** STM-ORD-T09, STM-SHP-T08, STM-SHP-T09, STM-SHP-T10, STM-SHP-T11

### BR-ORD-100 — Complete only after dispute window closes

- **domain:** ORD
- **statement:** Order chuyển sang `COMPLETED` từ `DELIVERED` khi (a) farm/admin chủ động complete, hoặc (b) `OrderDisputeWindowJob` tự đóng sau hết grace window và payment đã `DEPOSIT_PAID`.
- **related-stm:** STM-ORD-T07
- **rationale:** Tránh đóng order quá sớm khi retailer còn quyền raise dispute.

### BR-ORD-110 — Dispute resolution by admin

- **domain:** ORD
- **statement:** Order ở trạng thái `DISPUTED` chỉ chuyển sang `COMPLETED` bởi admin hoặc farm_manager sau khi dispute được xử lý ngoài hệ thống.
- **related-stm:** STM-ORD-T08

## Shipment Rules

### BR-SHP-010 — Create only by SHIPPING_MANAGER

- **domain:** SHP
- **statement:** Shipment được tạo bởi user role `SHIPPING_MANAGER` từ order eligible.
- **related-stm:** STM-SHP-T01

### BR-SHP-020 — Assign requires active driver and vehicle

- **domain:** SHP
- **statement:** Assign shipment yêu cầu driver `status = ACTIVE` và vehicle `status = ACTIVE`.
- **related-stm:** STM-SHP-T02

### BR-SHP-030 — Pickup only by assigned driver

- **domain:** SHP
- **statement:** Transition `ASSIGNED → PICKED_UP` chỉ bởi driver được assign cho shipment.
- **related-stm:** STM-SHP-T03

### BR-SHP-040 — In-transit only by assigned driver

- **domain:** SHP
- **statement:** Transition `PICKED_UP → IN_TRANSIT` chỉ bởi driver được assign.
- **related-stm:** STM-SHP-T04

### BR-SHP-050 — Delivery confirmation by assigned driver

- **domain:** SHP
- **statement:** Transition `IN_TRANSIT → DELIVERED` chỉ bởi driver được assign.
- **related-stm:** STM-SHP-T05

### BR-SHP-060 — Confirmation requires retailer photo

- **domain:** SHP
- **statement:** Transition `DELIVERED → CONFIRMED` yêu cầu ít nhất một photo upload bởi retailer (link tới shipment proof).
- **related-r:** R-RTL-160, R-RTL-170
- **related-stm:** STM-SHP-T06

### BR-SHP-070 — Cancel only before delivery

- **domain:** SHP
- **statement:** Cancel shipment hợp lệ chỉ khi `status ∈ {CREATED, ASSIGNED, PICKED_UP, IN_TRANSIT}`.
- **related-r:** R-SHM-030
- **related-stm:** STM-SHP-T07

### BR-SHP-080 — Retailer reject delivery only after DELIVERED

- **domain:** SHP
- **statement:** Retailer chỉ được transition shipment sang `REJECTED` khi shipment đang ở `DELIVERED` (kiện hàng đã giao nhưng retailer từ chối nhận).
- **related-r:** R-RTL-160
- **related-stm:** STM-SHP-T08

### BR-SHP-090 — Dispute can be raised on active shipment

- **domain:** SHP
- **statement:** Shipping manager hoặc driver có thể transition shipment sang `DISPUTED` khi shipment đang ở `CREATED`, `ASSIGNED`, `PICKED_UP`, hoặc `IN_TRANSIT`.
- **related-stm:** STM-SHP-T09
- **rationale:** Phản ánh thực tế khi xảy ra sự cố (mất hàng, hư hại) cần khoá shipment để admin xét.

### BR-SHP-100 — Escalation reaches admin governance

- **domain:** SHP
- **statement:** Shipping manager hoặc driver escalate shipment sang `ESCALATED` để admin can thiệp; chuyển trạng thái `ESCALATED` từ một trong các state pre-DELIVERED.
- **related-stm:** STM-SHP-T10
- **rationale:** Phân biệt "dispute thường" (shipping manager xử) vs "escalated" (admin xử).

### BR-SHP-110 — Shipping manager reject shipment

- **domain:** SHP
- **statement:** Shipping manager có thể reject shipment khi không khả thi giao (ví dụ vehicle hỏng, vùng vận chuyển không phục vụ); reject từ pre-DELIVERED state.
- **related-stm:** STM-SHP-T11

## Season Rules

### BR-SEA-010 — Season create with farm owner + blockchain commit

- **domain:** SEA
- **statement:** Season create yêu cầu user là owner farm AND emit blockchain commit job (idempotency-key = seasonId).
- **note:** [SPLIT-NOTE: hai assertion độc lập — ownership và blockchain commit. Theo R5.5 atomicity rule, BR này có thể bị split. Hiện tại giữ nguyên vì blockchain commit là post-condition của create operation, không phải guard độc lập. Nếu sau này tooling enforce strict atomicity, split thành BR-SEA-010 (ownership) + BR-SEA-011 (commit job).]
- **related-r:** R-FRM-080
- **related-stm:** STM-SEA-T01

### BR-SEA-020 — Commit confirmation transitions to COMMITTED

- **domain:** SEA
- **statement:** Khi blockchain commit cho season `DRAFT` confirm thành công, season transition sang `COMMITTED`.
- **related-stm:** STM-SEA-T02

### BR-SEA-030 — Start activation only by farm owner

- **domain:** SEA
- **statement:** Transition `COMMITTED → ACTIVE` chỉ bởi farm owner.
- **related-stm:** STM-SEA-T03

### BR-SEA-040 — Export only by farm owner

- **domain:** SEA
- **statement:** Transition `ACTIVE → EXPORTED` chỉ bởi farm owner.
- **related-r:** R-FRM-100
- **related-stm:** STM-SEA-T04

### BR-SEA-050 — Archive by farm owner or admin

- **domain:** SEA
- **statement:** Transition `EXPORTED → ARCHIVED` bởi farm owner hoặc admin.
- **related-stm:** STM-SEA-T05

## Subscription Rules

### BR-SUB-010 — Purchase only by FARM

- **domain:** SUB
- **statement:** Subscription purchase chỉ bởi user role `FARM` cho farm thuộc mình.
- **related-r:** R-FRM-040
- **related-stm:** STM-SUB-T01

### BR-SUB-020 — Active after verified payment callback

- **domain:** SUB
- **statement:** Subscription transition sang `ACTIVE` chỉ sau khi payment callback HMAC verified.
- **related-r:** R-FRM-050
- **related-stm:** STM-SUB-T02

### BR-SUB-030 — Expiring-soon trigger 7 days before expiry

- **domain:** SUB
- **statement:** Scheduled job transition subscription sang `EXPIRING_SOON` 7 days trước expiry timestamp.
- **related-stm:** STM-SUB-T03

### BR-SUB-040 — Grace period at expiry

- **domain:** SUB
- **statement:** Tại expiry timestamp, subscription transition sang `GRACE_PERIOD`.
- **related-stm:** STM-SUB-T04

### BR-SUB-050 — Expire after grace window

- **domain:** SUB
- **statement:** Sau grace window, subscription transition sang `EXPIRED`.
- **related-stm:** STM-SUB-T05

### BR-SUB-060 — Expired blocks write actions only

- **domain:** SUB
- **statement:** Subscription `EXPIRED` chỉ block farm write actions; data đọc được vẫn truy cập được.
- **rationale:** Brief không nói data bị xoá khi expire; chỉ hạn chế tính năng write.

### BR-SUB-070 — Renew during expiring or grace period

- **domain:** SUB
- **statement:** Renew hợp lệ chỉ khi `status ∈ {EXPIRING_SOON, GRACE_PERIOD}`.
- **related-stm:** STM-SUB-T06

### BR-SUB-075 — Repurchase while effective creates queued start date

- **domain:** SUB
- **statement:** Nếu farm mua thêm khi đang có subscription còn hiệu lực (`ACTIVE`, `EXPIRING_SOON`, hoặc `GRACE_PERIOD` và `endDate >= today`), subscription mới được tạo ở trạng thái pending nhưng `startDate` phải bắt đầu sau `endDate` muộn nhất đang còn hiệu lực; không được chồng lấn entitlement window.
- **rationale:** Cho phép farm mua trước để tránh gián đoạn nhưng vẫn giữ một entitlement window hiệu lực tại một thời điểm.
- **related-r:** R-FRM-040, R-FRM-050
- **related-stm:** STM-SUB-T01, STM-SUB-T02

### BR-SUB-080 — Cancel before expiry

- **domain:** SUB
- **statement:** Cancel hợp lệ chỉ khi `status ∈ {PENDING_PAYMENT, ACTIVE, EXPIRING_SOON}`.
- **related-stm:** STM-SUB-T07

## IoT Rules

### BR-IOT-010 — IoT alert ingest with cadence

- **domain:** IoT
- **statement:** Sự kiện vượt ngưỡng (temperature/humidity/pH) tạo `IoTAlert` record và gửi notification theo cadence trong `04-modules/iot.md` (immediate breach + scheduled daily 07:00 ICT digest).
- **note:** [SPLIT-NOTE: Hai cadence channels không phải two assertions độc lập; chúng là một policy duy nhất "deliver per cadence". Atomic.]
- **related-r:** R-FRM-200

### BR-IOT-020 — Cross-farm ingest rejected

- **domain:** IoT
- **statement:** Hệ thống reject IoT reading nếu deviceCode không match farm/device key contract.
- **related-r:** R-FRM-200

## User and Auth Rules

### BR-USR-010 — Self-profile update only

- **domain:** USR
- **statement:** User update profile chỉ cho user `id` của chính mình; trừ khi role là `ADMIN`.
- **related-r:** R-FRM-020, R-RTL-020

### BR-USR-020 — Admin user CRUD only by ADMIN

- **domain:** USR
- **statement:** Tạo/xoá user account khác chỉ bởi user role `ADMIN`.
- **related-r:** R-ADM-010

### BR-AUT-010 — Login with hashed password

- **domain:** AUT
- **statement:** Login verify password bằng BCrypt comparison; password hash không bao giờ trả trong response.
- **related-r:** R-FRM-010, R-RTL-010

## Listing Rules

### BR-LST-010 — Active listing requires farm owner + subscription

- **domain:** LST
- **statement:** Listing chuyển sang `status = ACTIVE` yêu cầu farm owner và active subscription (BR-FRM-010 + BR-FRM-020).
- **related-r:** R-FRM-120

### BR-LST-020 — Public listing data redaction

- **domain:** LST
- **statement:** Public listing response không bao gồm phone/email/payment/internal admin notes.

## Media Rules

### BR-MED-010 — Upload file type whitelist

- **domain:** MED
- **statement:** Upload chỉ chấp nhận file types trong whitelist (image/jpeg, image/png, image/webp).
- **related-r:** R-RTL-170

## VeChain Rules

### BR-VCH-010 — Private key never in response

- **domain:** VCH
- **statement:** VeChain private signing keys không bao giờ xuất hiện trong API response, log, hoặc UI.
- **related-r:** R-ADM-050

### BR-VCH-020 — Idempotent commit jobs

- **domain:** VCH
- **statement:** Blockchain commit jobs idempotent theo idempotency-key (e.g., `seasonId`); duplicate submission không tạo duplicate transactions.

## Trace Rules

### BR-TRC-010 — Public trace data safe-fields only

- **domain:** TRC
- **statement:** Public trace response chỉ trả safe-for-public fields; private operational data (phone, email, payment, admin notes) bị redact.
- **related-r:** R-RTL-060
