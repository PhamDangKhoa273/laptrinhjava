# BICAP Phase 2 - Bug Report & Retest Log

## Mục tiêu
Ghi nhận các lỗi phát hiện trong quá trình rà soát Phase 2, cách khắc phục và trạng thái retest.

| Bug ID | Mô tả lỗi | Mức độ | Trạng thái trước sửa | Cách khắc phục | Trạng thái retest |
|---|---|---:|---|---|---|
| P2-BUG-01 | Frontend admin user page chỉ hiển thị role và đổi status, chưa có thao tác assign role dù backend đã có endpoint `/api/users/{id}/roles`. | High | Chưa hoàn chỉnh luồng quản trị user theo mô tả Phase 2. | Bổ sung form chọn role + nút assign role trên `AdminUsersPage.jsx`, gọi API backend và reload danh sách user sau khi gán. | Pending live Postman/UI retest |
| P2-BUG-02 | Backend hardcode datasource và JWT config trong `application.properties`, gây lệch môi trường giữa các máy và cản trở Docker hóa. | High | Chạy local phụ thuộc cấu hình máy cá nhân. | Chuyển sang đọc biến môi trường với giá trị mặc định fallback. | Pending docker retest |
| P2-BUG-03 | Repo chưa có `Dockerfile` và `docker-compose.yml`, chưa chứng minh được phần chuẩn hóa môi trường chạy local của TV5. | High | Không có artifact DevOps tương ứng mô tả phân công. | Bổ sung Dockerfile backend/frontend, `.dockerignore`, `.env.example`, `docker-compose.yml`, và tài liệu chạy Docker. | Pending docker retest |
| P2-BUG-04 | Test artifact cho Phase 2 mới nghiêng về test plan / verified core flow, chưa có bug log riêng. | Medium | Minh chứng tester chưa đầy đủ. | Bổ sung file bug report và retest log. | Updated documentation |
| P2-BUG-05 | Claim về Phase 2 dễ bị hiểu là đã ổn định toàn bộ module, trong khi verified result mới xác nhận core scope. | Medium | Nguy cơ lệch giữa mô tả và phạm vi kiểm chứng. | Giữ mô tả kết quả test theo đúng core scope, yêu cầu live retest thêm admin/farm approval/role assignment khi demo. | Pending live retest |

## Ghi chú retest
- Sau khi có quyền dùng máy của bạn, nên chạy lại toàn bộ Postman collection / manual UI check để đổi trạng thái `Pending` thành `Passed`.
- Nếu trong live test phát sinh thêm lỗi, tiếp tục append vào bảng này thay vì mô tả miệng.
