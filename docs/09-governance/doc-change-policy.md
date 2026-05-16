---
title: Documentation Change Policy
ids: []
status: active
last-reviewed: 2026-05-16
language: vi
---

# Documentation Change Policy

Quy tắc bắt buộc cho mọi thay đổi tài liệu trong `docs/`. Mọi PR sửa file trong `docs/` phải đi qua các kiểm tra ở đây trước khi merge.

## Adding IDs

Khi cần ID mới (`R-*`, `NFR-*`, `BR-*`, `STM-*`, `API-*`, `ADR-*`, `GAP-*`):

1. Xác định loại ID phù hợp (xem `id-naming.md`).
2. Cấp **next free number** theo allocation rule (stride-10 hoặc dense).
3. Khai báo ID trong front-matter `ids:` của file owning.
4. Nếu ID xuất hiện trong nhiều file (cross-reference), chỉ một file là **owner**; cross-reference dùng `related-*` hoặc giá trị inline, không thêm vào `ids:` của file khác.
5. Bảo đảm ID xuất hiện đúng một lần trong toàn bộ `docs/` ở `ids:` lists.

Vi phạm uniqueness = `docs:lint` failure.

## Deprecating IDs

ID không còn được sử dụng nhưng phải giữ để không bị tái sử dụng:

1. Mở entry mới trong `gap-register.md` với title `Deprecated: <ID>` và lý do.
2. Sửa file owner: thêm note `[DEPRECATED: see GAP-<NNN>]` ở phần body của ID.
3. KHÔNG xoá ID khỏi `ids:` (giữ để uniqueness check vẫn hoạt động).
4. Nếu ID có replacement, ghi `superseded-by: <new-id>` trong note.

## Superseding IDs

Khi cần ID mới thay thế ID cũ (ví dụ business rule chia tách per atomicity):

1. Cấp ID mới (next free number).
2. Mở GAP entry: title `<old-id> superseded by <new-id>`.
3. ID cũ status sang `deprecated` hoặc `superseded` trong note body.
4. Không bao giờ rename ID cũ thành ID mới.

## Brief Revision Protocol

Khi Brief gốc thay đổi (`docs/01-requirements/functional/_brief-source.md`):

1. **Prepend** một section mới `## Brief Revision YYYY-MM-DD` ngay sau front-matter và H1, **trên** revision cũ. Revision trên cùng = authoritative.
2. Cập nhật `last-reviewed` trong front-matter `_brief-source.md` thành ngày mới.
3. Với mỗi `R-*` chịu ảnh hưởng (source quote thay đổi), cập nhật `brief-revision: YYYY-MM-DD` trong front-matter file `R-*`.
4. Với mỗi `R-*` không tham chiếu được nguyên văn trong revision mới (bullet đã bị xoá hoặc viết lại):
   - Mở `GAP-*`: `R-X obsoleted by Brief Revision YYYY-MM-DD`.
   - Đặt `status: deprecated` cho `R-*`.
5. Với mỗi bullet mới trong revision không có `R-*` tương ứng: vi phạm `docs:trace`. Tạo `R-*` mới hoặc mở `GAP-*`.

KHÔNG bao giờ sửa nội dung của một revision đã ban hành. Chỉ append revision mới.

## Schema Change Procedure

Nếu cần thay đổi front-matter schema (D9) hoặc thêm trường mới:

1. Mở ADR mới mô tả thay đổi.
2. ADR status `proposed`, chờ review.
3. Khi ADR `accepted`, cập nhật `id-naming.md` (nếu thêm ID type) hoặc structure.md (nếu thêm folder).
4. Sửa `docs:lint` spec ở `09-governance/ci-check-spec.md` để phản ánh schema mới.
5. Migration plan cho file đã tồn tại: bulk update qua một PR riêng, không trộn với thay đổi nội dung.

## ADR Lifecycle

ADRs có 4 status states:

- `proposed` — đề xuất, đang review
- `accepted` — quyết định đã chốt, ràng buộc với hệ thống
- `rejected` — đã review và từ chối; giữ lại để biết "đã từng cân nhắc"
- `superseded` — bị thay thế bởi một ADR mới

**Transitions hợp lệ:**
- `proposed → accepted | rejected`
- `accepted → superseded` (chỉ khi ADR mới có `supersedes: ADR-<NNN>`)

**Bất biến của ADR `accepted`:** không sửa nội dung quyết định. Chỉ phép sửa typo, link, formatting. Mọi thay đổi nội dung yêu cầu ADR mới `supersedes` cái cũ.

## GAP Hygiene

- GAP open >1 release cycle (≈3 tháng) **không có owner**: escalation trong PR review tiếp theo. Reviewer yêu cầu assign owner hoặc resolve.
- GAP `wont-fix` yêu cầu link tới ADR giải thích.
- GAP đã `resolved`: KHÔNG xoá row, cập nhật `target-date` thành ngày resolve thực.

## PR Requirements

Mọi PR sửa `docs/` hoặc `backend/`/`frontend/` phải có:

1. Trường `Doc IDs touched` trong description (xem `pull-request-template.md`).
2. Nếu thay đổi hành vi mới mà chưa có ID trong docs: tạo ID mới ở `docs/01-requirements/` trong cùng commit.
3. Nếu code mâu thuẫn với docs: hoặc sửa docs trước (thường được khuyến nghị), hoặc tạo `GAP-*` ghi nhận deviation.
4. Nếu thay đổi endpoint: cập nhật `openapi.yaml` trong cùng PR.
5. Nếu thay đổi state machine code: cập nhật bảng STM-* trong cùng PR.

## Quality Gates

Local commands (stub-then-implement, xem design D13):

- `docs:check` — kiểm tra Markdown links
- `docs:lint` — front-matter + ID format + uniqueness + folder placement
- `docs:trace` — Brief bullet → R-* → test coverage

Reviewer chạy 3 lệnh trước approve. CI hard-enforcement defer sang spec `docs-quality-gates-impl`.

## Conflict Resolution

Khi docs và code mâu thuẫn:

1. Xác định "nguồn đúng" qua thảo luận với product owner.
2. Nếu Brief đúng và code sai: mở GAP với target-date, code fix sau.
3. Nếu code đúng và Brief lỗi thời: Brief revision (theo Brief Revision Protocol ở trên).
4. Nếu cả hai cần điều chỉnh: ADR mô tả quyết định, sau đó cập nhật cả docs và code.

KHÔNG silent override — luôn để lại traceability qua GAP hoặc ADR.
