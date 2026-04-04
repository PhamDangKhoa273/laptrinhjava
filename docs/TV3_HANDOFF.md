# TV3 Handoff - Product Batch + QR Code + Blockchain Integration

## 1. Mục tiêu TV3
TV3 phụ trách module:
- tạo và quản lý lô sản phẩm (`Product Batch`)
- tạo QR truy xuất nguồn gốc cho từng batch
- cung cấp API trace theo batch
- gọi blockchain service để ghi nhận dữ liệu batch

## 2. Phạm vi đã làm trong repo hiện tại
### Entity / Table
- `product_batches`
- `qr_codes`
- `blockchain_transactions`

### DTO
- `CreateBatchRequest`
- `UpdateBatchRequest`
- `BatchResponse`
- `QrCodeResponse`
- `TraceBatchResponse`

### Service
- `ProductBatchService`
- `QrCodeService`
- `BlockchainService` *(đang là mock/stub, chờ TV4 tích hợp thật)*

### API
#### Batch
- `POST /api/batches`
- `GET /api/batches`
- `GET /api/batches/{id}`
- `PUT /api/batches/{id}`

#### QR
- `POST /api/batches/{id}/qr`
- `GET /api/batches/{id}/qr`

#### Trace
- `GET /api/trace/batches/{id}`
- endpoint trace đang được mở public trong security để phục vụ quét QR không cần token

## 3. Validate hiện có
- `batch_code` không trùng
- `available_quantity <= quantity`
- mỗi batch chỉ có 1 QR active
- `seasonId` phải hợp lệ (>0)
- `productId` phải hợp lệ (>0)

## 4. Những phần đang chờ tích hợp module khác
### Chờ TV1
- validate `season` tồn tại thật trong bảng season
- validate `product` khớp với `season`
- trả season detail thật trong trace response

### Chờ TV2
- trả `processList` thật trong trace response để hoàn thiện truy xuất nguồn gốc

### Chờ TV4
- thay `BlockchainService` mock bằng service blockchain thật
- chuẩn hóa payload/response blockchain dùng chung

### Chờ TV5
- dựng UI cho tạo batch, xem batch, xem QR, trace batch

## 5. Dữ liệu QR hiện tại
QR hiện chứa:
- `batch_id`
- `batch_code`
- `season_id`
- `trace_url`

Ví dụ:
```json
{
  "batch_id": 1,
  "batch_code": "BATCH-001",
  "season_id": 10,
  "trace_url": "/api/trace/batches/1"
}
```

## 6. Blockchain integration hiện tại
TV3 hiện gọi:
- `BlockchainService.saveBatch(batch)`

Service đang trả về:
- `txHash`
- `status`
- `message`

Kết quả được lưu vào bảng:
- `blockchain_transactions`

## 7. Trạng thái trace API
Trace API hiện trả tốt các dữ liệu trong phạm vi TV3:
- batch info
- QR info
- blockchain info

Tuy nhiên, đây **chưa phải trace full end-to-end của toàn Phase 3**, vì:
- `seasonInfo` hiện là placeholder chờ TV1
- `processList` hiện để rỗng chờ TV2

## 8. Hướng nâng cấp tiếp theo
1. nối dữ liệu season/product thật từ TV1
2. nối process list thật từ TV2
3. thay blockchain mock bằng TV4 core service
4. test end-to-end khi DB migration toàn nhóm ổn định
5. frontend TV5 dùng API TV3 để render batch/QR/trace

## 9. Ghi chú minh bạch
Module TV3 hiện đã hoàn thành phần backend ở mức độc lập.
Các phần chưa full 100% là do phụ thuộc module chung của nhóm (season thật, process thật, blockchain thật, migration DB toàn hệ thống).
