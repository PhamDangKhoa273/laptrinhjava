# System Diagram

```mermaid
flowchart LR
  Guest --> PublicTrace[Public trace / marketplace]
  Admin --> Governance[Blockchain governance]
  Farm --> Seasons[Season / batch management]
  Retailer --> Orders[Order / QR verification]
  Driver --> Shipping[Shipment execution]
  Shipping --> Admin
  Governance --> Thor[VeChainThor]
```
