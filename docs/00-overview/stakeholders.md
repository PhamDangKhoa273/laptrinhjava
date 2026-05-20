---
title: BICAP Stakeholders
ids: []
status: active
last-reviewed: 2026-05-16
language: vi
---

# BICAP Stakeholders

Sáu vai trò chính của hệ thống. Quyền cụ thể được định nghĩa trong [`06-security/rbac-matrix.md`](../06-security/rbac-matrix.md). Yêu cầu chức năng theo từng vai trò ở [`01-requirements/functional/`](../01-requirements/functional/).

| Vai trò | Workspace | Trách nhiệm chính | Yêu cầu chức năng |
|---|---|---|---|
| **Admin** | `/dashboard/admin/control-center` (web) | Quản trị nền tảng, duyệt farm, quản lý sản phẩm/danh mục, quản lý smart contract trace | [`01-requirements/functional/admin.md`](../01-requirements/functional/admin.md) |
| **Farm Manager** | `/dashboard/farm` (web) | Quản lý hồ sơ trang trại, mùa vụ canh tác, đăng sàn giao dịch, hợp đồng với retailer, theo dõi IoT | [`01-requirements/functional/farm-manager.md`](../01-requirements/functional/farm-manager.md) |
| **Retailer** | `/dashboard/retailer` (web) | Tìm kiếm sản phẩm trên sàn, đặt mua, đặt cọc, quét QR truy xuất, xác nhận giao hàng | [`01-requirements/functional/retailer.md`](../01-requirements/functional/retailer.md) |
| **Shipping Manager** | `/dashboard/shipping-manager` (web) | Tạo chuyến hàng, gán tài xế/phương tiện, quản lý đội xe, theo dõi báo cáo từ tài xế | [`01-requirements/functional/shipping-manager.md`](../01-requirements/functional/shipping-manager.md) |
| **Driver** | `/dashboard/driver` (mobile) | Nhận chuyến hàng, quét QR tại trang trại, xác nhận pickup/delivery, gửi báo cáo | [`01-requirements/functional/driver.md`](../01-requirements/functional/driver.md) |
| **Guest** | `/dashboard/guest` (web/mobile) | Duyệt sàn công khai, tìm kiếm theo nguồn gốc/chứng nhận, xem nội dung giáo dục | [`01-requirements/functional/guest.md`](../01-requirements/functional/guest.md) |

## External Stakeholders

- **VeChainThor network** — blockchain chính cho proof of traceability
- **IoT sensor gateways** — nguồn dữ liệu nhiệt độ/độ ẩm/pH
- **SMTP / Notification provider** — gửi email/notification đến vai trò
