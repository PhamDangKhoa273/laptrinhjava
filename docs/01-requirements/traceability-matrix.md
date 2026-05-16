---
title: Traceability Matrix
ids: []
status: active
last-reviewed: 2026-05-16
language: en
---

# Traceability Matrix

Brief bullet → R-* → Module → API-* → Test file. One row per `(brief-bullet, R-*)` pair (per R11.6). Rows with empty `R-*` cell are coverage gaps; rows with empty `test-file` cell are verification gaps. Test column is mostly `[TBD]` and will be filled in a follow-up spec.

## Admin (5 rows)

| brief-bullet | R-* | module | API-* | test-file |
|---|---|---|---|---|
| Quản trị viên có thể tạo, xem, chỉnh sửa và xóa các tài khoản quản trị viên khác | R-ADM-010 | admin, user | (pending; user CRUD) | [TBD] |
| Quản trị viên có thể xem, phê duyệt hoặc từ chối các đăng ký trang trại mới | R-ADM-020 | admin | (pending; STM-FRMAPP) | [TBD] |
| Quản trị viên có thể truy cập và quản lý thông tin chi tiết của trang trại | R-ADM-030 | admin, farm | (pending) | [TBD] |
| Quản trị viên có thể giám sát tất cả sản phẩm được đăng ký, quản lý danh mục | R-ADM-040 | admin, product | (pending) | [TBD] |
| Quản trị viên có thể triển khai, cập nhật và quản lý các hợp đồng thông minh | R-ADM-050 | admin, vechain | (pending; GAP-001) | [TBD] |

## Farm Manager (21 rows)

| brief-bullet | R-* | module | API-* | test-file |
|---|---|---|---|---|
| Đăng ký và đăng nhập tài khoản | R-FRM-010 | auth | API-AUT-001, API-AUT-002 | AppRoutes.test.jsx |
| Cập nhật thông tin cá nhân của chủ sở hữu | R-FRM-020 | user | (pending) | [TBD] |
| Cập nhật Giấy phép Kinh doanh và thông tin trang trại | R-FRM-030 | farm | (pending) | [TBD] |
| Mua gói dịch vụ để sử dụng hệ thống | R-FRM-040 | subscription | (pending) | [TBD] |
| Thanh toán cho việc mua gói dịch vụ | R-FRM-050 | subscription | (pending) | [TBD] |
| Xem các quy trình của mùa vụ canh tác | R-FRM-060 | season | (pending) | [TBD] |
| Xem chi tiết mùa vụ canh tác | R-FRM-070 | season | (pending) | [TBD] |
| Tạo mùa vụ canh tác (thông tin được lưu vào blockchain) | R-FRM-080 | season, vechain | (pending) | [TBD] |
| Cập nhật quy trình của mùa vụ canh tác (thông tin được lưu vào blockchain) | R-FRM-090 | season, vechain | (pending) | [TBD] |
| Xuất mùa vụ canh tác | R-FRM-100 | season | (pending) | [TBD] |
| Tạo mã QR cho mỗi mùa vụ đã xuất (thông tin được lưu vào blockchain) | R-FRM-110 | season, vechain, traceability | (pending) | [TBD] |
| Đăng ký đưa sản phẩm lên sàn giao dịch | R-FRM-120 | listing | (pending) | [TBD] |
| Xem đăng ký đưa sản phẩm lên sàn giao dịch | R-FRM-130 | listing | (pending) | [TBD] |
| Xử lý các yêu cầu mua nông sản từ Nhà bán lẻ | R-FRM-140 | order | API-ORD-002 | [TBD] |
| Xem thông tin Nhà bán lẻ đã ký hợp đồng | R-FRM-150 | contract | (pending) | [TBD] |
| Xem và xem chi tiết các quy trình vận chuyển | R-FRM-160 | shipment | (pending) | [TBD] |
| Xem báo cáo của các quy trình vận chuyển | R-FRM-170 | common (reports) | (pending) | [TBD] |
| Nhận thông báo về báo cáo từ Nhà bán lẻ | R-FRM-180 | common (notifications) | (pending) | [TBD] |
| Nhận thông báo về báo cáo từ Người vận chuyển | R-FRM-190 | common (notifications) | (pending) | [TBD] |
| Nhận thông báo về nhiệt độ, độ ẩm, độ pH trong ngày | R-FRM-200 | iot | (pending) | [TBD] |
| Gửi báo cáo đến quản trị viên | R-FRM-210 | common (reports) | (pending) | [TBD] |

## Retailer (19 rows)

| brief-bullet | R-* | module | API-* | test-file |
|---|---|---|---|---|
| Đăng ký và đăng nhập tài khoản | R-RTL-010 | auth | API-AUT-001, API-AUT-002 | AppRoutes.test.jsx |
| Cập nhật thông tin cá nhân của chủ sở hữu | R-RTL-020 | user | (pending) | [TBD] |
| Cập nhật Giấy phép Kinh doanh và thông tin trang trại | R-RTL-030 | retailer | (pending) | [TBD] |
| Tìm kiếm nông sản trên sàn giao dịch | R-RTL-040 | discovery | API-RTL-001 | [TBD] |
| Xem chi tiết nông sản | R-RTL-050 | listing | (pending) | [TBD] |
| Quét mã QR để truy xuất thông tin sản phẩm về các quy trình mùa vụ | R-RTL-060 | traceability | (pending) | [TBD] |
| Tạo yêu cầu đặt mua nông sản | R-RTL-070 | order | API-ORD-001 | [TBD] |
| Thanh toán tiền đặt cọc để đặt mua nông sản | R-RTL-080 | order | API-ORD-004 | [TBD] |
| Hủy yêu cầu đặt mua nông sản | R-RTL-090 | order | API-ORD-003 | [TBD] |
| Xem lịch sử đơn hàng | R-RTL-100 | order | (pending) | [TBD] |
| Xem chi tiết và trạng thái yêu cầu mua hàng | R-RTL-110 | order | (pending) | [TBD] |
| Nhận thông báo từ Quản lý Trang trại | R-RTL-120 | common (notifications) | (pending) | [TBD] |
| Gửi thông báo đến Quản lý Trang trại | R-RTL-130 | common (notifications) | (pending) | [TBD] |
| Xem và xem chi tiết các quy trình vận chuyển | R-RTL-140 | shipment | (pending) | [TBD] |
| Nhận thông báo từ Người vận chuyển | R-RTL-150 | common (notifications) | (pending) | [TBD] |
| Xác nhận sản phẩm đã được giao đầy đủ | R-RTL-160 | shipment | (pending) | [TBD] |
| Tải lên hình ảnh sản phẩm đã được giao đầy đủ | R-RTL-170 | media | (pending) | [TBD] |
| Nhận thông báo từ người vận chuyển (duplicated trong Brief) | R-RTL-180 | common (notifications) | (pending) | [TBD] |
| Gửi báo cáo đến quản trị viên | R-RTL-190 | common (reports) | (pending) | [TBD] |

## Driver (6 rows)

| brief-bullet | R-* | module | API-* | test-file |
|---|---|---|---|---|
| Xem và xem chi tiết các chuyến hàng của bạn | R-DRV-010 | shipment | API-DRV-010 | AppRoutes.test.jsx |
| Cập nhật các quy trình vận chuyển | R-DRV-020 | shipment | API-SHM-003 | [TBD] |
| Quét mã QR để theo dõi thông tin sản phẩm khi hoàn tất đến trang trại | R-DRV-030 | traceability | (pending) | [TBD] |
| Xác nhận đã hoàn tất việc nhận sản phẩm | R-DRV-040 | shipment | API-SHM-003 (status=PICKED_UP) | [TBD] |
| Xác nhận đã hoàn tất việc giao sản phẩm cho nhà bán lẻ | R-DRV-050 | shipment | API-SHM-003 (status=DELIVERED) | [TBD] |
| Gửi báo cáo đến Quản lý Vận chuyển | R-DRV-060 | common (reports) | (pending) | [TBD] |

## Shipping Manager (9 rows)

| brief-bullet | R-* | module | API-* | test-file |
|---|---|---|---|---|
| Xem các đơn hàng thành công giữa Nhà bán lẻ và Quản lý Trang trại | R-SHM-010 | order | (pending) | [TBD] |
| Tạo chuyến hàng cho mỗi đơn hàng thành công | R-SHM-020 | shipment | API-SHM-001 | [TBD] |
| Hủy chuyến hàng đã tạo | R-SHM-030 | shipment | (pending; cancel endpoint) | [TBD] |
| Xem các quy trình vận chuyển | R-SHM-040 | shipment | API-SHM-010 | AppRoutes.test.jsx |
| Quản lý phương tiện vận chuyển (CRUD) | R-SHM-050 | logistics | (pending; vehicle CRUD) | [TBD] |
| Quản lý tài xế vận chuyển (CRUD) | R-SHM-060 | logistics | (pending; driver CRUD) | [TBD] |
| Gửi báo cáo đến quản trị viên | R-SHM-070 | common (reports) | (pending) | [TBD] |
| Gửi thông báo đến Quản lý Trang trại và Nhà bán lẻ | R-SHM-080 | common (notifications) | (pending) | [TBD] |
| Xem báo cáo từ Tài xế vận chuyển | R-SHM-090 | common (reports) | (pending) | [TBD] |

## Guest (3 rows)

| brief-bullet | R-* | module | API-* | test-file |
|---|---|---|---|---|
| Khách có thể nhận các thông báo chung về nền tảng | R-GST-010 | content, common (notifications) | (pending) | [TBD] |
| Khách có thể sử dụng chức năng tìm kiếm và bộ lọc | R-GST-020 | discovery | API-GST-001 | [TBD] |
| Khách có thể truy cập các bài viết, video và nội dung giáo dục | R-GST-030 | content | (pending) | [TBD] |

## Non-Functional (3 rows)

| brief-bullet | NFR-* | module | notes | test-file |
|---|---|---|---|---|
| Hệ thống phải có khả năng mở rộng linh hoạt (AWS/GCP, Docker, Redis) | NFR-SCL-010 | (cross-cutting) | [TBD targets — GAP-003] | [TBD] |
| Blockchain (VeChainThor) cần hỗ trợ nhiều giao dịch đồng thời | NFR-BC-010 | vechain, iot | [TBD targets — GAP-006] | [TBD] |
| Blockchain phải đảm bảo tính minh bạch và bất biến + RBAC | NFR-BC-020, NFR-SEC-010 | vechain, common | active | [TBD] |

## Summary

- 66 brief bullets → 66+ R-* / NFR-* mappings (no empty R-* cells = no coverage gaps).
- Test column mostly `[TBD]` — verification gaps tracked separately.
- Test column population is out of scope for `docs-as-blueprint`; deferred to a follow-up spec or normal development PRs.
