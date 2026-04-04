# laptrinhjava

Cấu trúc dự án đã được sắp xếp lại để gọn hơn khi đưa lên GitHub:

- `frontend/` — React/Vite frontend
- `backend/` — Spring Boot backend
- `docs/` — tài liệu, checklist, test plan

## Frontend
```bash
cd frontend
npm install
npm run dev
```

## Backend
```bash
cd backend
mvnw.cmd spring-boot:run
```

## Ghi chú
- `frontend/node_modules/` và `backend/target/` là thư mục build/dependency.
- Không sửa logic code, chỉ sắp xếp lại cấu trúc thư mục.
