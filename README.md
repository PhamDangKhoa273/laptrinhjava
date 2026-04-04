# laptrinhjava

Dự án đã được sắp xếp lại để dễ làm việc nhóm và dễ trình bày trên GitHub.

## Cấu trúc chính
- `frontend/` — React/Vite frontend
- `backend/` — Spring Boot backend
- `docs/` — tài liệu, checklist, test guide

## Phase 3 - Farm Management
Phase 3 đang được chia theo module để tránh conflict và dễ tích hợp:

- **TV1** — Farming Season
- **TV2** — Farming Process
- **TV3** — Product Batch + QR Code + Blockchain integration
- **TV4** — Blockchain core service dùng chung
- **TV5** — Frontend + Integration + Testing

## Trạng thái hiện tại trong repo
### TV3 đã có trong backend
Module TV3 hiện đã được code ở mức backend:

- `POST /api/batches`
- `GET /api/batches`
- `GET /api/batches/{id}`
- `PUT /api/batches/{id}`
- `POST /api/batches/{id}/qr`
- `GET /api/batches/{id}/qr`
- `GET /api/trace/batches/{id}`

Các thành phần chính đã có:
- `ProductBatch`
- `QrCode`
- `BlockchainTransaction`
- `ProductBatchService`
- `QrCodeService`
- `BlockchainService` (đang ở mức mock/stub để chờ TV4 tích hợp thật)

## Lưu ý phối hợp nhóm
- TV3 hiện đang **độc lập tương đối** để tránh chờ toàn bộ module khác mới code được.
- Khi TV1 hoàn thiện Season/Product thật, TV3 cần nối validate chặt hơn theo dữ liệu thật.
- Khi TV4 hoàn thiện BlockchainService thật, TV3 sẽ thay mock transaction bằng service dùng chung.
- TV5 có thể dùng các endpoint của TV3 để tích hợp frontend batch/QR/trace.

## Chạy backend
```bash
cd backend
mvnw.cmd spring-boot:run
```

## Chạy frontend
```bash
cd frontend
npm install
npm run dev
```

## Tài liệu liên quan
- `docs/TV3_POSTMAN_TEST_GUIDE.md` — hướng dẫn test TV3
- `docs/TV3_HANDOFF.md` — mô tả module TV3, API, phụ thuộc và cách tích hợp

## Ghi chú
- Một số phần của project đang phụ thuộc tiến độ module khác trong Phase 3.
- Nếu database local bị lệch lịch sử migration cũ, cần đồng bộ lại migration trước khi chạy end-to-end.
