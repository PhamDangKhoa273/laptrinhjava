# BICAP Phase 2-4 Audit

## Đánh giá tổng quan

Tài liệu này đối chiếu trực tiếp giữa roadmap phase 2-4, đặc tả nghiệp vụ và code hiện tại trong repo.

## Phase 2, Core system

### Đã có
- Đăng ký, đăng nhập, refresh token.
- RBAC cho Admin, Farm, Retailer, Shipping Manager, Driver, Guest.
- Hồ sơ người dùng và business profile cho Farm/Retailer.
- Kết nối MySQL, migration bằng Flyway.

### Ghi chú chuyên môn
- Auth đủ mạnh cho đồ án và demo.
- Chưa phải production auth hoàn chỉnh, nhưng phase 2 đã đạt phần lõi.

## Phase 3, Farm management

### Đã có
- Farm profile CRUD.
- Service package subscription.
- Subscription payment record và truy vấn payment của farm.
- Mùa vụ, quy trình canh tác, batch/export, QR truy xuất.
- Ghi blockchain cho season, process, batch.
- Đăng listing sản phẩm lên sàn giao dịch.

### Chưa nằm trong phạm vi code lõi hiện tại
- Notification IoT (temperature, humidity, pH).
- Tích hợp cảm biến và cảnh báo tự động theo dữ liệu IoT thật.

## Phase 4, Marketplace and retailer operations

### Đã có
- Marketplace listing công khai.
- Search/filter sản phẩm.
- Xem chi tiết listing.
- Tạo order request.
- Xem chi tiết, lịch sử trạng thái order.
- QR/public trace cho truy xuất nguồn gốc.
- Đặt cọc đơn hàng retailer trước khi farm xác nhận.

### Còn ở mức nền hoặc chưa có đầy đủ
- Upload file thực cho proof/evidence hiện mới ở mức lưu `imageUrl`, chưa có subsystem media storage hoàn chỉnh.
- Notification hiện là in-app backend workflow, chưa phải websocket/push realtime.
- Report workflow đã có module nền nhưng chưa có quy trình xử lý/escalation nhiều bước.
- Listing registration/approval đã có flow backend nhưng frontend chưa được nối đầy đủ.

### Mới được bổ sung trong đợt nâng cấp này
- Notification module nền: tạo thông báo, lấy danh sách thông báo cá nhân/theo role, đánh dấu đã đọc.
- Reporting module nền: gửi report tới user/role đích, truy vấn report của mình.
- Guest educational/platform content: CRUD mức nền cho nội dung bài viết/video/tài liệu công khai.
- Listing registration/approval workflow: farm gửi yêu cầu duyệt listing, admin duyệt/từ chối, listing chỉ public khi `APPROVED`.
- Order workflow được làm tròn hơn:
  - thêm trạng thái `DELIVERED`
  - shipping proof URL
  - retailer confirm delivery với proof ảnh
  - cancel order có lý do và timestamp
  - phát notification nền khi trạng thái order thay đổi

## Kết luận

Nếu bám đúng phạm vi phase 2-4 cốt lõi, repo hiện tại đã có nền chức năng đủ mạnh để trình bày là hoàn thành phần chính.

Nếu bám toàn bộ mọi mục mở rộng trong đặc tả lớn của đề tài, vẫn còn các phần thuộc phase 5-6 hoặc phần mở rộng chưa hoàn thành.
