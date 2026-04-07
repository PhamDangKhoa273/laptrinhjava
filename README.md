# LỘ TRÌNH THỰC HIỆN DỰ ÁN BICAP

Tài liệu này mô tả lộ trình triển khai dự án **“Tích hợp Blockchain trong sản xuất nông sản sạch (BICAP)”** trong khuôn khổ học phần phát triển ứng dụng Web.

Mục tiêu của lộ trình là tổ chức công việc theo từng giai đoạn (**phase**) nhằm giúp nhóm phát triển xây dựng hệ thống một cách có kế hoạch, rõ ràng về nhiệm vụ, đồng thời đảm bảo tất cả thành viên đều tham gia đóng góp trong mỗi giai đoạn.

---

## Phase 1 – Phân tích yêu cầu và thiết kế hệ thống

### Mục tiêu
- Phân tích yêu cầu nghiệp vụ dựa trên đặc tả của dự án.
- Xác định các tác nhân (**Actors**) và các chức năng chính của hệ thống.
- Thiết kế kiến trúc tổng thể cho hệ thống.

### Công việc thực hiện
- Phân tích nghiệp vụ và xác định các vai trò:
  - Admin
  - Farm
  - Retailer
  - Shipping Manager
  - Ship Driver
  - Guest
- Xây dựng **Use Case Diagram** mô tả các chức năng của hệ thống.
- Thiết kế kiến trúc hệ thống (**System Architecture**).
- Thiết kế mô hình cơ sở dữ liệu (**ERD – Entity Relationship Diagram**).
- Soạn thảo tài liệu mô tả dự án và cấu trúc hệ thống.

### Kết quả đầu ra
- Use Case Diagram
- Architecture Diagram
- Thiết kế cơ sở dữ liệu
- Tài liệu phân tích yêu cầu hệ thống

---

## Phase 2 – Xây dựng hệ thống lõi (Core System)

### Mục tiêu
- Xây dựng nền tảng hệ thống và các chức năng quản lý người dùng.

### Công việc thực hiện
- Khởi tạo dự án Backend và Frontend.
- Thiết kế và triển khai hệ thống đăng ký, đăng nhập.
- Xây dựng cơ chế phân quyền người dùng (**Role-based Access Control**).
- Phát triển chức năng quản lý hồ sơ người dùng.
- Kết nối Backend với cơ sở dữ liệu.

### Kết quả đầu ra
- Hệ thống đăng ký / đăng nhập hoạt động
- Cơ chế phân quyền người dùng
- API quản lý người dùng

---

## Phase 3 – Phát triển chức năng quản lý nông trại (Farm Management)

### Mục tiêu
- Xây dựng các chức năng cho phép nông trại quản lý quá trình sản xuất nông sản.

### Công việc thực hiện
- Xây dựng chức năng tạo mùa vụ (**Farming Season**).
- Cập nhật các bước trong quy trình sản xuất.
- Lưu trữ thông tin quy trình vào hệ thống và blockchain.
- Phát triển chức năng xuất lô sản phẩm.
- Tạo mã QR để truy xuất nguồn gốc sản phẩm.

### Kết quả đầu ra
- Module quản lý mùa vụ
- Chức năng cập nhật quy trình sản xuất
- Hệ thống tạo mã QR truy xuất nguồn gốc

---

## Phase 4 – Phát triển hệ thống giao dịch giữa Farm và Retailer

### Mục tiêu
- Xây dựng chức năng kết nối giữa nông trại và nhà bán lẻ.

### Công việc thực hiện
- Phát triển chức năng đăng tải sản phẩm lên sàn giao dịch.
- Xây dựng chức năng tìm kiếm và xem thông tin sản phẩm.
- Tạo yêu cầu đặt hàng từ phía Retailer.
- Quản lý trạng thái đơn hàng.
- Xây dựng lịch sử giao dịch.

### Kết quả đầu ra
- Module quản lý sản phẩm
- Module đặt hàng
- Giao diện tìm kiếm và xem sản phẩm

---

## Phase 5 – Phát triển hệ thống vận chuyển (Shipping System)

### Mục tiêu
- Xây dựng hệ thống quản lý vận chuyển sản phẩm từ nông trại đến nhà bán lẻ.

### Công việc thực hiện
- Phát triển chức năng tạo và quản lý đơn vận chuyển.
- Quản lý phương tiện vận chuyển và tài xế.
- Cho phép tài xế cập nhật trạng thái giao hàng.
- Theo dõi tiến trình vận chuyển theo thời gian thực.
- Gửi thông báo đến các bên liên quan.

### Kết quả đầu ra
- Module quản lý vận chuyển
- Hệ thống theo dõi trạng thái giao hàng
- Thông báo hệ thống

---

## Phase 6 – Tích hợp Blockchain, kiểm thử và triển khai hệ thống

### Mục tiêu
- Hoàn thiện hệ thống, tích hợp blockchain và triển khai sản phẩm.

### Công việc thực hiện
- Tích hợp blockchain để lưu trữ dữ liệu truy xuất nguồn gốc.
- Kiểm thử hệ thống (**Unit Test, Integration Test**).
- Sửa lỗi và tối ưu hệ thống.
- Đóng gói ứng dụng bằng Docker.
- Triển khai hệ thống trên nền tảng Cloud.

### Kết quả đầu ra
- Hệ thống hoàn chỉnh có khả năng truy xuất nguồn gốc bằng blockchain
- Bản demo hệ thống