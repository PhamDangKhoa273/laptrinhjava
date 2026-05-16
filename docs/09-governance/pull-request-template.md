---
title: Pull Request Template (Canonical)
ids: []
status: active
last-reviewed: 2026-05-16
language: en
---

# Pull Request Template (Canonical)

Đây là canonical PR template. `.github/PULL_REQUEST_TEMPLATE.md` mirrors body content (raw, không front-matter — GitHub đọc raw markdown).

## Template Body

```markdown
## Summary

<!-- 1-2 sentences mô tả thay đổi -->

## Doc IDs touched

<!--
Liệt kê mọi ID trong docs/ mà PR này chạm tới hoặc thực hiện.
Bắt buộc ít nhất một ID nếu PR sửa code dưới backend/ hoặc frontend/.
-->

- R-*: 
- BR-*: 
- STM-*: 
- API-*: 

## Gap entries

<!--
Nếu PR tạo deviation giữa code và docs mà không thể sửa docs ngay,
mở GAP-* trong docs/09-governance/gap-register.md và liệt kê ở đây.
-->

- [ ] None
- [ ] GAP-* opened: 

## OpenAPI delta

<!--
Nếu PR thêm/sửa/xóa endpoint, mô tả thay đổi trong docs/05-api/openapi.yaml.
-->

- [ ] No endpoint change
- [ ] openapi.yaml updated:

## Tests

<!-- Tests added or test-files updated -->

- Backend tests:
- Frontend tests:
- Manual verification:

## RBAC impact

<!--
Nếu PR ảnh hưởng tới RBAC (thêm @PreAuthorize, route guard, conditional rule),
mô tả ô nào của docs/06-security/rbac-matrix.md bị ảnh hưởng.
-->

- [ ] No RBAC change
- [ ] RBAC matrix updated:

## Checklist

- [ ] `scripts/docs/docs-check` chạy không broken links
- [ ] `scripts/docs/docs-lint` chạy không violation
- [ ] `scripts/docs/docs-trace` chạy không gap mới
- [ ] Doc IDs trong test names hoặc @DisplayName (nếu áp dụng)
- [ ] Build pass: `mvnw test` + `npm run build`
```

## Mirror in `.github/PULL_REQUEST_TEMPLATE.md`

Body content trên (không bao gồm front-matter của file canonical này) được copy vào `.github/PULL_REQUEST_TEMPLATE.md`. Khi sửa template, sửa file canonical này trước rồi đồng bộ sang `.github/`.

## Field Definitions

### Doc IDs touched

Mọi ID trong `docs/` mà PR thực hiện hoặc thay đổi. Pattern theo [`id-naming.md`](id-naming.md):

- `R-<ROLE>-<NNN>` — functional requirement
- `NFR-<CAT>-<NNN>` — non-functional
- `BR-<DOMAIN>-<NNN>` — business rule
- `STM-<DOMAIN>-T<NN>` — state machine transition
- `API-<MOD>-<NNN>` — endpoint

### Gap entries

Nếu PR đẩy code đi trước docs (debt được chấp nhận), mở `GAP-*` ghi nhận. Nếu không có deviation, check "None".

### OpenAPI delta

Mọi endpoint change phải kèm `openapi.yaml` update trong cùng PR. Reviewer verify schema validate qua editor.swagger.io.

### Tests

Liệt kê test files thêm/sửa. Test name nên chứa Doc ID (e.g., `@DisplayName("R-RTL-090: retailer hủy đơn khi status=PENDING")`).

### RBAC impact

Mọi thay đổi `@PreAuthorize`, route guard, hoặc conditional rule phải reflect trong [`../06-security/rbac-matrix.md`](../06-security/rbac-matrix.md). Reviewer verify matrix và code khớp.

## Enforcement Status

PR template hiện là **soft enforcement** (reviewer check thủ công). Hard enforcement qua CI deferred sang follow-up spec `docs-quality-gates-impl` per [`ci-check-spec.md`](ci-check-spec.md).
