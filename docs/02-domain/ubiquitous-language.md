---
title: Ubiquitous Language
ids: []
status: active
last-reviewed: 2026-05-16
language: bilingual
---

# Ubiquitous Language

Tên gọi chính tắc cho mọi domain term. Mã nguồn, frontend label, doc body, và Brief đều phải tuân thủ. Synonyms bị từ chối được liệt kê để chống đặt tên loạn (R5.2).

## Term Catalog

| Term (canonical EN) | Vietnamese | Rejected synonyms | Notes |
|---|---|---|---|
| `Farm` | Trang trại | farmstead, plantation | Đơn vị sản xuất nông nghiệp; FK chính cho seasons, batches, listings |
| `Farm Manager` | Quản lý Trang trại | Farmer, Farm Owner | Vai trò vận hành Farm; cũng là canonical role name `farm_manager` |
| `Farm Application` | Đơn đăng ký trang trại | Farm Registration | Entity cho farm self-registration workflow (xem `STM-FRMAPP`) |
| `Retailer` | Nhà bán lẻ | Buyer, Customer, Shop | Vai trò mua sản phẩm |
| `Shipping Manager` | Quản lý Vận chuyển | Logistics Manager | Vai trò điều phối chuyến hàng; role name `shipping_manager` |
| `Driver` | Tài xế vận chuyển | Delivery Person, Courier | Vai trò thực hiện giao nhận; mobile app |
| `Guest` | Khách | Visitor, Anonymous User | Public user; role name `guest` |
| `Admin` | Quản trị viên | Administrator, Super User | Governance role; role name `admin` |
| `Season` | Mùa vụ | **Cultivation Season**, Crop Cycle, Growing Season | Một chu kỳ canh tác; canonical = `Season` |
| `Batch` | Lô hàng | Package, Crate | Đơn vị sản phẩm gắn nguồn gốc Season |
| `Listing` | Đăng sàn | Marketplace Item, Product Posting | Sản phẩm trên sàn giao dịch |
| `Order` | Đơn hàng | Purchase Request | Yêu cầu mua từ Retailer |
| `Deposit` | Tiền đặt cọc | Down Payment, Pre-payment | Khoản trả trước cho order |
| `Shipment` | Chuyến hàng | Delivery, Transport | Đơn vị vận chuyển một order |
| `Vehicle` | Phương tiện vận chuyển | Truck, Vehicle Asset | Tài sản dùng để vận chuyển |
| `Subscription` | Gói dịch vụ | Plan, Service Tier | `FarmSubscription` đính một farm với một `ServicePackage` |
| `Service Package` | Gói dịch vụ | Plan Tier | Định nghĩa các tier; entity tách biệt với `FarmSubscription` |
| `QR Code` | Mã QR | Barcode | Mã truy xuất nguồn gốc |
| `Trace` | Truy xuất nguồn gốc | Tracking, Provenance | Quá trình theo dõi sản phẩm; canonical noun = `Trace` |
| `Proof` | Bằng chứng blockchain | Blockchain Record, Hash | Bản ghi trên VeChainThor |
| `IoT Alert` | Thông báo IoT | Sensor Alert | Cảnh báo từ cảm biến |
| `Sensor Reading` | Bản ghi cảm biến | Measurement, Data Point | Dữ liệu thô từ sensor |
| `Contract` | Hợp đồng | Agreement | Farm-retailer contract |
| `Listing` | Đăng sàn | Posting, Ad | Marketplace item |
| `Cultivation Process` | Quy trình canh tác | Farming Step, Growing Step | Một bước trong farming season timeline |

## Resolved Variant

Per requirement R5.3:

- **Canonical:** `Season`
- **Vietnamese:** `Mùa vụ`
- **Rejected:** `Cultivation Season`, `Crop Cycle`, `Growing Season`

`Cultivation Process` là khái niệm khác (bước trong season), không phải synonym của `Season`.

## Role Naming Convention

Backend code, RBAC matrix, JWT claims dùng `snake_case` lowercase:

- `admin`
- `farm_manager`
- `retailer`
- `shipping_manager`
- `driver`
- `guest`

Spring Security prefix là `ROLE_<ROLE_NAME>` ở mức `GrantedAuthority` (e.g., `ROLE_ADMIN`).

## Technical Terms

| Term | Description |
|---|---|
| RBAC | Role-Based Access Control |
| JWT | JSON Web Token |
| EARS | Easy Approach to Requirements Syntax (sáu mẫu câu yêu cầu) |
| SSOT | Single Source of Truth |
| BR | Business Rule |
| STM | State Machine |
| ADR | Architecture Decision Record |
| GAP | Gap (entry trong gap-register) |

Mọi thuật ngữ kỹ thuật khác → giữ nguyên dạng English; phiên dịch Vietnamese chỉ ở context giải thích.
