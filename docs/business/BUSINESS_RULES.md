# BICAP Business Rules

This file is the root business-rule catalog for BICAP. It documents behavior represented
by the current modular architecture. If a desired behavior is not implemented yet, it
should be documented as a gap inside the relevant module file instead of being stated as
active behavior.

## Global RBAC Rules

1. Authenticated users may access only routes allowed for their primary role.
2. Admin has administrative workspaces and governance functions.
3. Farm users access farm production and farm-owned batch workflows.
4. Retailers access discovery, ordering, deposit, history, and reporting workflows.
5. Shipping managers access shipment planning, tracking, drivers, vehicles, and reports.
6. Drivers access assigned delivery execution workflows.
7. Guests access public marketplace, public trace, announcements, and education workflows.
8. Protected routes must redirect or deny when the role is not allowed.

## Account and User Rules

1. User identity is controlled by the auth/user modules.
2. Roles and permissions are assigned through the user/RBAC model.
3. Admin-only user management must not be exposed to non-admin roles.
4. Production seeding must not create weak default credentials.
5. Local demo reset scripts may create sample accounts and demo password `123456`, but those credentials are strictly for development/demo environments and must not be deployed to production.

## Farm Production Rules

1. Farm-owned resources must be isolated to the owning farm unless admin access is used.
2. Farms manage farm profile, packages/batches, seasons, cultivation process, exports,
   marketplace publishing, shipping coordination, IoT, and reports.
3. Farm workflows should preserve traceability from production to listing/order/shipment.

## Product, Batch, and Traceability Rules

1. Products/categories define catalog structure.
2. Batches/packages represent traceable production units.
3. QR/trace data must map to stable batch or listing information.
4. Blockchain proof is integration evidence, not a replacement for application validation.

## Marketplace, Listing, Order, and Contract Rules

1. Public/guest users may browse public marketplace data.
2. Retailers use listing/product discovery to initiate purchase/order workflows.
3. Orders must preserve status history and ownership boundaries.
4. Contract/dispute flows must be controlled by service-level state rules.

## Logistics and Driver Rules

1. Shipping managers create and manage shipments.
2. Shipments may be assigned to drivers and vehicles.
3. Drivers execute pickup, checkpoint, handover, proof, and incident reporting.
4. Shipping proof must remain connected to shipment and order traceability.

## Subscription and Payment Rules

1. Service packages define subscription capabilities.
2. Farm subscriptions attach service packages to farm accounts.
3. Subscription payments must preserve payment history and status.

## Content and Media Rules

1. Admin/content workflows manage announcements and public education content.
2. Media uploads must use controlled upload paths and should not expose arbitrary files.
3. Website appearance changes are admin-controlled.

## Analytics and Observability Rules

1. Analytics dashboards summarize operational metrics.
2. Actuator/metrics endpoints support operational visibility.
3. Audit logs should capture security-relevant or governance-relevant actions.

## Security Rules

1. JWT authentication must remain enabled for protected APIs.
2. RBAC must be enforced server-side and mirrored in frontend route protection.
3. Rate limiting protects sensitive endpoints from abuse.
4. CORS must be environment-controlled.
5. Secrets must come from environment variables in production.
