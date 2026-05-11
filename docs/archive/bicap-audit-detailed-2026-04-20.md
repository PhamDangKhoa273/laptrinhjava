# BICAP Detailed Audit

Date: 2026-04-20
Purpose: Requirement-by-requirement audit, backend package review, frontend route review, and gap list to reach 100%.

## 1) Requirement audit

### A. Farm Management (Web App)

- Register and log in to your account. **Status: DONE**
- Update owner personal information. **Status: DONE**
- Update Business License and information of farm. **Status: DONE**
- Purchase a package to use services. **Status: DONE**
- Payment of purchasing a package. **Status: DONE**
- View processes of farming seasons. **Status: DONE**
- View detail of farming seasons. **Status: DONE**
- Create a farming season (information is saved into blockchain). **Status: PARTIAL**
 - DB flow exists, blockchain proof flow needs final verification.
- Updating processes of farming seasons (information is saved into blockchain). **Status: PARTIAL**
 - Process update exists, on-chain persistence must be fully proven.
- Export a farming season. **Status: DONE**
- Generate QR Code with every export farming season (information is saved into blockchain). **Status: PARTIAL**
 - QR/export exists, but on-chain proof linkage must be verified end-to-end.
- Register to push to the trading floor. **Status: DONE**
- View registration of pushing to the trading floor. **Status: DONE**
- Handle requests to buy agricultural products from Retailers. **Status: DONE**
- View information of Retailers that do contract. **Status: PARTIAL**
 - Contract/relationship view exists only partially.
- View and view detail of shipping processes. **Status: DONE**
- View reports of shipping processes. **Status: DONE**
- Get notifications of Retailer’s reports. **Status: PARTIAL**
- Get notifications of Shipper’s reports. **Status: PARTIAL**
- Get notifications about temperature, humidity, pH during the day. **Status: DONE/PARTIAL**
 - IoT ingest/alerts exist, but delivery path should be verified.
- Send reports to the admin. **Status: DONE**

### B. Retailer (Web App)

- Register and log in to your account. **Status: DONE**
- Update owner personal information. **Status: DONE**
- Update Business License and information of farm. **Status: DONE**
- Search for agricultural products on the trading floor. **Status: DONE**
- View detail agricultural products. **Status: DONE**
- Scan QR Code to retrieve product information about processes of seasons. **Status: DONE**
- Create a request to order agricultural products. **Status: DONE**
- Pay the deposit to order agricultural products. **Status: DONE**
- Cancel request to order agricultural products. **Status: DONE**
- View history of orders. **Status: DONE**
- View detail and status of buying request. **Status: DONE**
- Get notification from Farm Management. **Status: PARTIAL**
- Send notification to Farm Management. **Status: PARTIAL**
- View and view detail processings shipping. **Status: DONE**
- Get notifications from Shippers. **Status: PARTIAL**
- Confirm that products are shipped completely. **Status: DONE**
- Upload images products that are shipped completely. **Status: DONE**
- Get notifications from shippers. **Status: PARTIAL**
- Send reports to the admin. **Status: DONE**

### C. Ship Driver (Mobile App)

- View and view detail of your shipments. **Status: PARTIAL**
- Update the processes of shipments. **Status: DONE**
- Scan QR Code to track information of products when completely come farms. **Status: DONE**
- Confirm that completely to receive products. **Status: DONE**
- Confirm that completely to give products to retailers. **Status: DONE**
- Send reports to Shipping Manager. **Status: DONE**

- Separate mobile app. **Status: UNCLEAR / LIKELY MISSING**
 - Current UI looks like a web app with a mobile-like route, not a dedicated mobile app deliverable.

### D. Shipping Manager (Web App)

- View successful orders between Retailers and Farm Managements. **Status: DONE**
- Create a shipment for every successful order. **Status: DONE**
- Cancel created-shipment. **Status: DONE**
- View processes of shipment. **Status: DONE**
- Management transportation vehicles (Create, Update, Delete, View). **Status: DONE**
- Management transportation drivers (Create, Update, Delete, View). **Status: DONE**
- Send reports to the admin. **Status: DONE**
- Send notifications to Farm Managements, Retailers. **Status: PARTIAL**
- View reports from ship Driver. **Status: DONE**

### E. Admin (Web App)

- Create, view, edit, and delete other admin accounts. **Status: DONE**
- Assigning roles and permissions as needed. **Status: DONE**
- View, approve, or reject new farm registrations. **Status: DONE**
- Access and manage farm details. **Status: DONE**
- Oversee all products registered on the platform. **Status: DONE**
- Manage product categories, descriptions, and ensure data accuracy. **Status: DONE**
- Blockchain governance follows the VeChainThor main path. **Status: PARTIAL**
 - The codebase still contains Hardhat/EVM sandbox assets, but they are not the submission path and must not be described as the primary architecture.
 - The VeChainThor governance flow is the one to keep as the canonical submission story.

### F. Guest (Web Application/Mobile App)

- Receive general notifications about the platform. **Status: PARTIAL**
- Use search and filter options to locate products. **Status: DONE**
- Access articles, videos, and other educational content. **Status: DONE**

### G. Non-functional requirements

- Scale flexibly with cloud, Docker, Redis. **Status: PARTIAL**
 - Docker and Redis exist; cloud scaling strategy needs confirmation.
- Blockchain should support multiple concurrent transactions. **Status: PARTIAL**
 - Design intent exists, but needs verified throughput/resilience.
- Blockchain must ensure transparency and immutability. **Status: PARTIAL**
 - On-chain proof exists in intent, but must be validated end-to-end.
- Encryption standards and access restricted by roles. **Status: DONE/PARTIAL**
 - Security exists, but needs final hardening review.

## 2) Backend package-by-package review

### core
**Has**
- Security config, exceptions, audit logging, response wrapper, enums.

**Missing / risk**
- Some CORS/security rules need central cleanup.
- Rate-limit, headers, and permit rules should be audited endpoint by endpoint.

### auth
**Has**
- Register, login, refresh, forgot/reset password.

**Missing / risk**
- Token revocation, expiry handling, abuse limits should be verified.

### user
**Has**
- User CRUD, profile management, role controls.

**Missing / risk**
- Admin-only privilege checks must be confirmed.

### farm
**Has**
- Farm CRUD, approval/review, business license management.

**Missing / risk**
- Ownership validation, file upload hygiene, approval audit trail.

### subscription
**Has**
- Package/subscription flows.

**Missing / risk**
- Payment consistency, package entitlement gating.

### product
**Has**
- Product/category management.

**Missing / risk**
- Public exposure, filtering, and data consistency checks.

### listing
**Has**
- Marketplace registration and listing review/public listing.

**Missing / risk**
- Ensure listing visibility and order linkage are strict.

### order
**Has**
- Create order, deposit, cancel, status history, shipping proof, confirm delivery, upload proof files.

**Missing / risk**
- Strict status machine, idempotency, duplicate payment prevention.

### shipment
**Has**
- Shipment CRUD, workflow, reports, driver-facing process support.

**Missing / risk**
- Strong linkage to orders and proof file validation.

### logistics
**Has**
- Vehicle and driver management.

**Missing / risk**
- Assignment lifecycle and status controls.

### season
**Has**
- Season CRUD, export, process timeline.

**Missing / risk**
- Blockchain sync parity, immutable history proof.

### batch
**Has**
- Blockchain transaction persistence, QR trace, process trace.

**Missing / risk**
- Retry, receipt verification, failed tx recovery.

### iot
**Has**
- Sensor ingest, threshold alerts, resolve flow.

**Missing / risk**
- Device auth, spam control, real-time delivery path.

### media
**Has**
- Upload/storage.

**Missing / risk**
- File type/size restrictions, public download exposure.

### content
**Has**
- Educational content module exists.

**Missing / risk**
- Must confirm it is exposed in FE and usable by guests.

### discovery
**Has**
- Search/filter support.

**Missing / risk**
- Pagination, ranking, result visibility rules.

### common notification/report
**Has**
- Central notification and report modules.

**Missing / risk**
- Need proof that major flows emit/consume notifications.

### admin
**Has**
- Admin governance, farm/product/user control.

**Missing / risk**
- Smart contract management semantics still need verification.

### vechain
**Has**
- Config class and intent for VeChainThor integration.

**Missing / risk**
- Final service wiring, signing, tx submission, receipt verification, key handling.

## 3) Frontend route-by-route review

### Public/auth routes
- `/` -> redirect login: **OK**
- `/login`: **OK**
- `/register`: **OK**
- `/forgot-password`: **OK**
- `/reset-password`: **OK**

### Protected/common
- `/dashboard`: **OK**
- `/profile`: **OK**
- `/public/trace`: **OK**
- `/listings/:id`: **OK**

### Admin routes
- `/dashboard/admin`: **OK**
- `/dashboard/appearance`: **OK**
- legacy redirects under `/admin/*`: **OK**

### Farm routes
- `/dashboard/farm`: **OK**
- `/farm/workspace`: **OK**
- `/farm/workflow`: **OK**
- `/farm/phase3`: **OK**
- `/batches/:id`: **OK**

### Retailer routes
- `/dashboard/retailer`: **OK**
- `/retailer/workspace`: **OK**
- `/retailer/orders`: **redirect only**
 - likely needs real dedicated page if requirement says order history/detail/status explicitly.

### Shipping manager routes
- `/dashboard/shipping-manager`: **OK**
- `/shipping/workspace`: **OK**
- `/shipping/proof`: **redirect only**
 - may be enough if handled inside workspace, but not ideal for explicit requirement mapping.

### Driver routes
- `/dashboard/driver`: **OK**
- `/driver/workspace`: **OK**
- `/driver/mobile`: **OK**
- `/driver/proof`: **OK**

### Guest routes
- `/dashboard/guest`: **OK**

### Missing / unclear
- Dedicated pages for content browsing details.
- Dedicated pages for shipment detail/report views if not inside workspace shell.
- Explicit mobile app deliverable is not clear from route structure.

## 4) Main issues to fix for 100%

1. Verify blockchain flow end-to-end.
2. Make smart contract admin flow real, not just descriptive.
3. Harden payment/order/shipment state machine.
4. Prove notification delivery for farm, retailer, shipper, admin.
5. Clarify mobile driver app deliverable.
6. Clean up repo noise, tmp probes, and leftover artifacts.
7. Add integration tests for critical flows.
8. Tighten security: CORS, upload validation, role boundaries, idempotency, token lifecycle.

## 5) Priority fix list

### P0
- Blockchain season export and receipt verification.
- Order/deposit/cancel/shipping state consistency.
- RBAC and endpoint access review.

### P1
- Notifications end-to-end.
- Driver/shipping manager flow completeness.
- Admin smart contract management.

### P2
- Mobile app clarification.
- Guest content completeness.
- Repo cleanup and docs.

## 6) Final assessment
- The project is **real and advanced**, not a mock.
- It is **not yet safe to claim 100% requirement completion**.
- It is **close enough for a strong submission**, but needs the P0 items closed first.
