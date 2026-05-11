# Requirement Traceability Matrix

| Đề bài / tiêu chí | Backend evidence | Frontend evidence | Test evidence | Status |
|---|---|---|---|---|
| Quản lý sản xuất nông sản sạch | Farm, Season, Batch, Process modules | Farm workspace, phase 3 services | Season/Batch service tests | Đạt |
| Truy xuất nguồn gốc từ farm đến bàn ăn | Season export, QR, public trace, shipment/order modules | Public trace, marketplace, workflow services | QR/season/shipment/order tests | Đạt |
| Blockchain đảm bảo minh bạch/bất biến | `VeChainProofService`, blockchain governance | Admin blockchain governance UI/service | Blockchain governance/security tests | Đạt |
| IoT giám sát điều kiện sản xuất | `IoTService`, sensor readings, threshold alerts | Farm IoT alert workspace | IoT acceptance/authorization tests | Đạt, đã harden ownership |
| Phân quyền theo vai trò | `@PreAuthorize`, service ownership checks | `RoleProtectedRoute`, role workspaces | Frontend route tests, backend auth tests | Đạt |
| Farm workspace | Farm/Season/Batch/IoT/Order APIs | Farm pages and navigation | Farm/season/IoT tests | Đạt |
| Retailer workspace | Listing/Order/Deposit/Delivery APIs | Retailer marketplace/order pages | Order authorization/payment tests | Đạt |
| Shipping Manager workspace | Shipment creation/assignment/report APIs | Shipping manager workspace | Shipment service tests | Đạt |
| Driver workspace | Mine/pickup/checkpoint/handover/report APIs | Driver workspace | Shipment authorization tests | Đạt |
| Admin workspace | User/permission/governance/content APIs | Admin dashboard modules | User security/governance tests | Đạt |
| Guest access | Public marketplace/trace/content endpoints | Guest marketplace/trace pages | Frontend public route tests | Đạt |
| Production readiness | Env-based prod config, JWT, RBAC, tests | Vite build/test pipeline | Maven/Vitest suites | Gần production-grade |

## Notes for Defense

- Explain BICAP as a **Modular Monolith + Layered Modules + RBAC Frontend**.
- Emphasize that VeChainThor stores proof hashes, not raw farm/private data.
- Mention ownership hardening: Farm users cannot submit IoT readings for another farm.
