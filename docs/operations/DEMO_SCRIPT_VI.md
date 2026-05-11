# Kịch bản demo BICAP

Thời lượng đề xuất: 5–7 phút. Có thể mở rộng lên 10–12 phút bằng phần ghi chú mở rộng ở cuối.

## 1. Mở đầu — 30 giây

Xin chào thầy/cô và các bạn.

Hôm nay em xin trình bày **BICAP**, một nền tảng quản lý và truy xuất nguồn gốc chuỗi cung ứng nông sản. Điểm chính của hệ thống là chia trải nghiệm theo từng vai trò: khách xem công khai, nông trại, nhà bán lẻ, vận chuyển/tài xế và quản trị viên.

Mục tiêu của BICAP là giúp dữ liệu từ sản xuất, giao dịch, vận chuyển đến truy xuất công khai được quản lý nhất quán, có kiểm soát quyền truy cập và có khả năng ghi nhận bằng blockchain governance.

## 2. Luồng công khai — 60 giây

Đầu tiên là phần không cần đăng nhập.

- Ở trang marketplace, người dùng có thể xem các sản phẩm/lô hàng công khai.
- Ở trang public trace, người dùng có thể nhập hoặc quét mã để xem thông tin truy xuất.

Điểm quan trọng là hai luồng này mở cho khách, nhưng các khu vực nghiệp vụ như dashboard admin, farm, retailer hoặc driver đều được route guard bảo vệ và sẽ chuyển về trang đăng nhập nếu chưa xác thực.

## 3. Luồng theo vai trò — 2 phút

BICAP được thiết kế theo mô hình role-based workspace.

### Farm

Với vai trò nông trại, người dùng tập trung vào dữ liệu sản xuất, lô hàng, sản phẩm và quy trình liên quan đến nguồn gốc.

### Retailer

Với vai trò nhà bán lẻ, giao diện tập trung vào marketplace, đơn hàng và các hoạt động thương mại.

### Shipping / Driver

Với vận chuyển và tài xế, hệ thống tập trung vào shipment, trạng thái giao hàng, bằng chứng giao hàng và báo cáo sự cố.

Driver có giao diện web thân thiện mobile theo hướng PWA, nhưng không claim là native mobile app.

### Admin

Admin có trung tâm điều hành để quản lý người dùng, farms, retailers, logistics, sản phẩm, nội dung website, gói dịch vụ và blockchain trace.

Điểm quan trọng là sidebar và route đều được lọc theo vai trò, hạn chế việc người dùng thấy hoặc truy cập nhầm module không thuộc quyền của mình.

## 4. Bảo mật và phân quyền — 60 giây

Về bảo mật, hệ thống đã có các lớp kiểm tra chính:

- Route guard cho frontend.
- Service-level authorization để chống IDOR.
- Kiểm tra HMAC và idempotency cho callback thanh toán.
- Refresh token được quản lý phía server.
- CORS cấu hình tập trung.
- Rate limit filter.
- JWT secret bắt buộc đủ mạnh ở production.

Trong quá trình kiểm thử, các test trọng tâm về auth, shipment authorization, order ownership và payment replay đều đã chạy pass.

## 5. Blockchain governance — 60 giây

BICAP có phần blockchain governance để ghi nhận và kiểm tra trạng thái giao dịch blockchain.

Điểm em muốn nhấn mạnh là hệ thống không tự động deploy contract production một cách nguy hiểm. Thay vào đó, phần governance tập trung vào:

- kiểm tra readiness,
- phát hiện read-only/safe mode,
- lưu evidence giao dịch,
- hỗ trợ retry khi giao dịch lỗi.

VeChainThor là hướng blockchain chính của dự án. Các Hardhat/EVM asset chỉ nên xem là sandbox hoặc demo nội bộ.

## 6. Deployment và vận hành — 60 giây

Ở phần vận hành, dự án đã có Docker Compose production, env template, healthcheck và deployment runbook.

Production compose có healthcheck cho:

- MySQL,
- Redis,
- Backend,
- Frontend.

Frontend nginx là public edge, có `/healthz`, security headers và proxy `/api/` vào backend. Backend trong production compose không expose public port 8080 trực tiếp.

Dự án cũng có backup/recovery runbook cho MySQL, uploads và reconciliation blockchain transaction.

## 7. Kết luận — 30 giây

Tóm lại, BICAP đã hoàn thiện phần lõi để demo như một nền tảng truy xuất nguồn gốc nông sản theo vai trò, có kiểm soát bảo mật, có blockchain governance và có tài liệu triển khai/vận hành.

Các điểm chưa nên claim là đã hoàn thành gồm: deploy cloud thật, native mobile app, forecasting AI, và full logged-in E2E cho mọi role nếu chưa seed account demo.

Em xin hết phần trình bày.

## Ghi chú mở rộng nếu cần 10–12 phút

Nếu cần kéo dài demo, có thể mở rộng thêm:

1. Mở code `RoleProtectedRoute.jsx` để giải thích role guard.
2. Mở `DashboardLayout.jsx` để chỉ cách sidebar lọc theo role.
3. Mở `docker-compose.prod.yml` để chỉ healthcheck và backend internal-only.
4. Mở `SECURITY_REVIEW_CHECKLIST.md` để trình bày bằng chứng test bảo mật.
5. Mở `final-evidence-pack.md` để chốt phần claim/limitation một cách trung thực.
