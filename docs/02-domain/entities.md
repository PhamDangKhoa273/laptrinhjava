---
title: Domain Entities
ids: []
status: active
last-reviewed: 2026-05-16
language: en
---

# Domain Entities

Each entity definition includes 4 fields per requirement R5.6: `name`, `attributes`, `invariants`, `owning-module`. Cross-references to module docs in [`../04-modules/`](../04-modules/).

## User

- **attributes:** `id, email, passwordHash (BCrypt), fullName, phone, status, createdAt, updatedAt`
- **invariants:** email unique; passwordHash never returned in API response (BR-AUT-010)
- **owning-module:** [`user`](../04-modules/user.md)

## Role

- **attributes:** `id, name (enum: ADMIN, FARM, RETAILER, SHIPPING_MANAGER, DRIVER, GUEST), description`
- **invariants:** name unique; system roles cannot be deleted
- **owning-module:** [`user`](../04-modules/user.md)

## UserRole

- **attributes:** `userId, roleId, assignedAt`
- **invariants:** composite key (userId, roleId); user has at least one role
- **owning-module:** [`user`](../04-modules/user.md)

## Farm

- **attributes:** `id, ownerId (User.id), name, businessLicense, contactInfo, location, certifications, createdAt`
- **invariants:** ownerId references existing user with role FARM; farm not used after `STM-FRMAPP` reaches REVOKED
- **owning-module:** [`farm`](../04-modules/farm.md)

## FarmApplication

- **attributes:** `id, farmId, status (STM-FRMAPP), submittedBy (userId), reviewedBy (userId), reviewedAt, rejectionReason`
- **invariants:** transitions follow [`STM-FRMAPP`](state-machines/farm-approval.md); status changes triggered only by admin (BR-FRMAPP-020..060)
- **owning-module:** [`admin`](../04-modules/admin.md)

## Season

- **attributes:** `id, farmId, name, startDate, endDate, status (STM-SEA), blockchainTxHash, createdAt`
- **invariants:** transitions follow [`STM-SEA`](state-machines/season.md); blockchainTxHash set only after STM-SEA-T02; farmId references owned farm (BR-FRM-010)
- **owning-module:** [`season`](../04-modules/season.md)

## CultivationProcess

- **attributes:** `id, seasonId, stepName, stepDescription, performedAt, blockchainTxHash`
- **invariants:** seasonId references existing season; blockchainTxHash set after async commit
- **owning-module:** [`season`](../04-modules/season.md)

## Batch

- **attributes:** `id, farmId, seasonId, productId, quantity, unit, harvestDate, qrCode, blockchainTxHash`
- **invariants:** farmId references owned farm; seasonId references existing season; qrCode unique
- **owning-module:** [`batch`](../04-modules/batch.md)

## Product

- **attributes:** `id, name, description, categoryId, createdBy, createdAt`
- **invariants:** categoryId references existing category
- **owning-module:** [`product`](../04-modules/product.md)

## ProductCategory

- **attributes:** `id, name, parentCategoryId (nullable), description`
- **invariants:** name unique within parent; cycle in parent chain forbidden
- **owning-module:** [`product`](../04-modules/product.md)

## Listing (ProductListing)

- **attributes:** `id, batchId, farmId, price, depositMinimum, status (PENDING_REVIEW, ACTIVE, ARCHIVED), createdAt`
- **invariants:** ACTIVE listing requires farm owner + active subscription (BR-LST-010); depositMinimum > 0
- **owning-module:** [`listing`](../04-modules/listing.md)

## Order

- **attributes:** `id, retailerId, listingId, farmId, quantity, totalAmount, status (STM-ORD), depositAmount, createdAt`
- **invariants:** transitions follow [`STM-ORD`](state-machines/order.md); depositAmount ≥ listing.depositMinimum (BR-ORD-020)
- **owning-module:** [`order`](../04-modules/order.md)

## OrderDeposit

- **attributes:** `id, orderId, amount, gatewayTxId, status (PENDING, CONFIRMED, REFUNDED), confirmedAt`
- **invariants:** orderId references existing order; gatewayTxId unique per gateway; HMAC verified before status change (BR-SUB-020 pattern)
- **owning-module:** [`order`](../04-modules/order.md)

## Contract (FarmRetailerContract)

- **attributes:** `id, farmId, retailerId, terms, status, signedAt, expiresAt`
- **invariants:** farmId, retailerId reference existing entities
- **owning-module:** [`contract`](../04-modules/contract.md)

## Shipment

- **attributes:** `id, orderId, status (STM-SHP), driverId, vehicleId, pickupAt, deliveredAt, confirmedAt`
- **invariants:** transitions follow [`STM-SHP`](state-machines/shipment.md); driverId/vehicleId required after ASSIGNED (BR-SHP-020)
- **owning-module:** [`shipment`](../04-modules/shipment.md)

## ShipmentCheckpoint

- **attributes:** `id, shipmentId, type (PICKUP, IN_TRANSIT, HANDOVER), location, timestamp, driverId, mediaIds[]`
- **invariants:** shipmentId references existing shipment; type matches state at time of event
- **owning-module:** [`shipment`](../04-modules/shipment.md)

## Vehicle

- **attributes:** `id, plateNumber, model, capacity, status (ACTIVE, MAINTENANCE, RETIRED), createdBy`
- **invariants:** plateNumber unique; ACTIVE vehicle required for assign (BR-SHP-020); cannot delete vehicle with active shipments (R-SHM-050 AC 3)
- **owning-module:** [`logistics`](../04-modules/logistics.md)

## Driver (entity, distinct from User)

- **attributes:** `id, userId (nullable, links to User with role DRIVER), fullName, licenseNumber, status (ACTIVE, INACTIVE), createdBy`
- **invariants:** licenseNumber unique; cannot delete driver with active shipments (R-SHM-060 AC 3)
- **owning-module:** [`logistics`](../04-modules/logistics.md)

## ServicePackage

- **attributes:** `id, name, price, durationDays, capabilities[]`
- **invariants:** durationDays > 0; price ≥ 0
- **owning-module:** [`subscription`](../04-modules/subscription.md)

## FarmSubscription

- **attributes:** `id, farmId, packageId, status (STM-SUB), purchasedAt, activatedAt, expiresAt`
- **invariants:** transitions follow [`STM-SUB`](state-machines/subscription.md); only one ACTIVE subscription per farm at a time
- **owning-module:** [`subscription`](../04-modules/subscription.md)

## SubscriptionPayment

- **attributes:** `id, subscriptionId, amount, gatewayTxId, status, callbackVerifiedAt`
- **invariants:** HMAC signature verified before status update (BR-SUB-020); idempotent on duplicate callbacks
- **owning-module:** [`subscription`](../04-modules/subscription.md)

## SensorReading

- **attributes:** `id, farmId, batchId (nullable), seasonId (nullable), kind (TEMPERATURE, HUMIDITY, PH), value, unit, deviceCode, gatewayTimestamp`
- **invariants:** deviceCode validates against farm/device contract before persist (BR-IOT-020); cross-farm ingest rejected
- **owning-module:** [`iot`](../04-modules/iot.md)

## IoTAlert

- **attributes:** `id, farmId, sensorReadingId, kind (BREACH, DAILY_DIGEST), severity, message, deliveredAt`
- **invariants:** kind=BREACH triggered immediate; kind=DAILY_DIGEST triggered scheduled 07:00 ICT (BR-IOT-010)
- **owning-module:** [`iot`](../04-modules/iot.md)

## BlockchainTransaction

- **attributes:** `id, kind (SEASON_COMMIT, PROCESS_COMMIT, QR_COMMIT, CONTRACT_DEPLOY), refId, txHash, status (PENDING, SUCCESS, FAILED, GOVERNED, RETRY_SCHEDULED), submittedAt, confirmedAt, idempotencyKey`
- **invariants:** idempotencyKey unique; status follows VeChain governance lifecycle (see component.md)
- **owning-module:** [`vechain`](../04-modules/vechain.md)

## Notification

- **attributes:** `id, recipientUserId, kind, payload, deliveredAt, readAt`
- **invariants:** recipient receives only notifications targeting their userId or role group
- **owning-module:** [`common`](../04-modules/common.md)

## Report

- **attributes:** `id, submittedBy, kind (FARM_TO_ADMIN, RETAILER_TO_ADMIN, RETAILER_TO_FARM, FARM_TO_RETAILER, DRIVER_TO_SHIPPING_MANAGER, SHIPPING_TO_ADMIN), content, attachmentMediaIds[], submittedAt`
- **invariants:** content sanitized; submittedBy must have appropriate role for kind
- **owning-module:** [`common`](../04-modules/common.md)

## Media

- **attributes:** `id, uploadedBy, ownerEntityType, ownerEntityId, mimeType, sizeBytes, storagePath, createdAt`
- **invariants:** mimeType in whitelist (BR-MED-010); storagePath normalized (no path traversal)
- **owning-module:** [`media`](../04-modules/media.md)

## AuditLog

- **attributes:** `id, actorUserId, action, targetEntityType, targetEntityId, beforeState (JSON), afterState (JSON), occurredAt`
- **invariants:** append-only; never edited or deleted
- **owning-module:** [`common`](../04-modules/common.md)
