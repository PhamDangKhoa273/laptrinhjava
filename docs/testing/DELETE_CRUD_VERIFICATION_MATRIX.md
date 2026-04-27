# Delete CRUD Verification Matrix

| Entity | Backend delete route | Frontend action | Notes |
|---|---|---|---|
| User | `DELETE /api/v1/users/{id}` | Admin dashboard/user control center | Real delete implemented, role cleanup guarded |
| Product | `DELETE /api/v1/products/{id}` | Admin dashboard / admin control center | Real delete implemented |
| Category | `DELETE /api/v1/products/categories/{id}` | Admin dashboard / admin control center | Real delete implemented |
| Farm | `DELETE /api/v1/farms/{id}` | Admin farm/admin control center | Real delete implemented |
| Season process step | `DELETE /api/v1/processes/{id}` | Farm workspace / phase 3 | Real delete implemented with blockchain logging |
| Service package | `DELETE /api/v1/packages/{id}` | Admin/package management | Real delete implemented |
| Order | `POST /api/v1/orders/{id}/cancel` | Retailer workflow | Cancel path covers deletion-like removal from active flow |
| Shipment | status/actions endpoints | Shipping manager / driver | Lifecycle handled through status transitions, not hard delete |

## Run notes

- Backend compile: pass
- Frontend build: pass
- Evidence pack: in progress
