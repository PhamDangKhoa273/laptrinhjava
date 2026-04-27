# BICAP Final Demo Script

## Duration

Recommended: 10–15 minutes.

## Opening Pitch

BICAP is a modular agricultural traceability platform that connects farms, retailers, logistics teams, drivers, admins, and guests. It uses JWT/RBAC for security, IoT readings for production monitoring, and VeChainThor blockchain proofs for immutable traceability.

---

## Demo Flow

### 1. Guest: Public Marketplace and Trace

Show:

- Guest can browse public marketplace/content.
- Guest can open QR/public trace without login.
- Public trace shows farm/product/season/proof data only.

Key point:

> Guests can verify origin without accessing private operational data.

### 2. Farm: Production Setup

Show:

- Farm dashboard.
- Create/view season.
- Add process or production evidence.
- Create/view batch.
- Generate QR/trace code.

Key point:

> Farm data is scoped to the farm owner. Other farms cannot access or submit IoT data for this farm.

### 3. IoT: Sensor Monitoring

Show:

- Submit or display sensor reading.
- Threshold violation creates alert.
- Farm resolves its own alert.
- Optional IoT gateway identity fields can be supplied with a device code/API key.

Key point:

> IoT ownership has been hardened: cross-farm reading injection is rejected. Device identity hooks are ready for a real gateway registry.

### 4. Retailer: Order Flow

Show:

- Retailer views listings.
- Create order.
- Pay deposit.
- Track order status.

Key point:

> Retailers only access their own orders.

### 5. Shipping Manager: Shipment Creation

Show:

- Eligible orders.
- Create shipment.
- Assign driver/vehicle.
- View shipment reports.

Key point:

> Logistics workflow is separate from farm and retailer workspaces.

### 6. Driver: Fulfillment

Show:

- Driver sees assigned shipments only.
- Confirm pickup with QR/batch trace.
- Add checkpoint.
- Confirm handover.
- Submit incident report if needed.

Key point:

> Driver actions are restricted to assigned shipments.

### 7. Admin: Governance

Show:

- User/role management.
- Blockchain governance page/API.
- Failed transaction inspection/retry.

Key point:

> Admin can govern blockchain transactions but private keys are not exposed.

---

## Closing Summary

- Modular Monolith architecture.
- Full RBAC workspaces.
- Farm-to-table traceability.
- VeChainThor proof layer.
- IoT alert workflow.
- Passing automated tests.
- Security hardening for ownership and anti-IDOR risk.

## Backup Talking Points

If asked why not store all data on blockchain:

> BICAP stores only canonical hashes/proofs on-chain because full agricultural records may contain private or large operational data. This gives immutability while keeping the system performant and privacy-aware.

If asked what happens when blockchain fails:

> Business data is still saved. The failed proof is recorded with governance status `FAILED`, and Admin can inspect or retry it later.
