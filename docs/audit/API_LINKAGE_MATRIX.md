# API Linkage Matrix

| Frontend service/page | Method | Endpoint | Backend controller/module | Role | Status |
|---|---|---|---|---|---|
| `workflowService.createOrder` | POST | `/orders` | Order module | Retailer | OK |
| `workflowService.getOrders` | GET | `/orders` | Order module | Retailer/Farm/Admin scoped | OK |
| `workflowService.payOrderDeposit` | POST | `/orders/{id}/deposit` | Order module | Retailer owner | OK |
| `workflowService.confirmDelivery` | POST | `/orders/{id}/confirm-delivery` | Order module | Retailer owner | OK |
| `workflowService.createShipment` | POST | `/shipments` | `ShipmentController` | Shipping Manager | OK |
| `workflowService.getEligibleOrders` | GET | `/shipments/eligible-orders` | `ShipmentController` | Shipping Manager | OK |
| `workflowService.getDriverShipments` | GET | `/shipments/mine` | `ShipmentController` | Driver | OK |
| `workflowService.confirmPickup` | POST | `/shipments/{id}/pickup` | `ShipmentController` | Assigned Driver | OK |
| `workflowService.addCheckpoint` | POST | `/shipments/{id}/checkpoints` | `ShipmentController` | Assigned Driver | OK |
| `workflowService.confirmHandover` | POST | `/shipments/{id}/handover` | `ShipmentController` | Assigned Driver | OK |
| `workflowService.createShipmentReport` | POST | `/shipments/{id}/reports` | `ShipmentController` | Driver/Shipping Manager | OK |
| `phase3Service.getSeasons` | GET | `/seasons` | Season module | Farm/Admin scoped | OK |
| `phase3Service.createSeason` | POST | `/seasons` | Season module | Farm | OK |
| `phase3Service.generateBatchQr` | POST | `/batches/{id}/qr` | Batch/QR module | Farm/Admin scoped | OK |
| `phase3Service.traceBatchByCode` | GET | `/public/trace` | Traceability module | Guest/Public | OK |
| Public season export trace | GET | `/seasons/public/export` | `SeasonExportController` | Guest/Public | OK |
| Admin blockchain governance | GET/POST | `/blockchain/governance/**` | `BlockchainGovernanceController` | Admin | OK |
| IoT ingest | POST | `/iot/readings` | `IoTController`/`IoTService` | Farm owner/Admin | OK, ownership hardened |
| IoT my alerts | GET | `/iot/alerts/me` | `IoTController`/`IoTService` | Farm owner | OK |
| IoT resolve alert | POST | `/iot/alerts/{id}/resolve` | `IoTController`/`IoTService` | Farm owner | OK |

## Linkage Assessment

- The core demo flow is linked to real backend APIs.
- Route-level RBAC is covered by frontend tests.
- Server-side authorization is enforced by controller annotations and service-level ownership checks.
- The highest-risk IoT ingest ownership path has been hardened.
