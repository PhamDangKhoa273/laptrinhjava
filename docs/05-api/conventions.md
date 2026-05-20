---
title: API Conventions
ids: []
status: active
last-reviewed: 2026-05-16
language: en
---

# API Conventions

Cross-cutting conventions inherited by every endpoint in [`openapi.yaml`](openapi.yaml). When in doubt, this doc is canonical for envelope, error, and pagination shapes.

## Path Versioning

- Base path: `/api/v1/<resource>`
- Major version bumps when breaking changes; track in `openapi.yaml` `info.version`.
- Backend currently exposes both `/api/v1/orders` and `/api/orders` (legacy alias) for orders; new endpoints SHALL use `/api/v1` only.

## Response Envelope

All API responses use a consistent envelope:

```json
{
  "success": true,
  "code": "200",
  "message": "OK",
  "data": { },
  "errors": null,
  "timestamp": "2026-05-16T03:00:00Z"
}
```

Field semantics:

- `success` — boolean; `true` for 2xx, `false` otherwise
- `code` — machine code (English `UPPER_SNAKE_CASE` for errors, e.g., `ORDER_DEPOSIT_INSUFFICIENT`)
- `message` — user-facing message (Vietnamese)
- `data` — response payload (object, array, or null)
- `errors` — optional field-level errors map for validation failures
- `timestamp` — ISO 8601 UTC

## Error Codes

Standard error codes (English machine identifiers):

| HTTP | code | Use |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Field validation failures |
| 400 | `BUSINESS_ERROR` | Business rule violation |
| 400 | `INVALID_STATE_TRANSITION` | STM-* transition not in table |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 402 | `SUBSCRIPTION_REQUIRED` | Active subscription required |
| 403 | `FORBIDDEN` | RBAC denial |
| 403 | `FARM_OWNERSHIP_VIOLATION` | Cross-farm access denied |
| 403 | `FARM_SUSPENDED` | Farm in SUSPENDED state |
| 403 | `CROSS_FARM_INGEST_FORBIDDEN` | IoT cross-farm ingest |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Concurrency / version conflict |
| 422 | `CONTENT_POLICY_VIOLATION` | Content sanitization failure |
| 500 | `INTERNAL_SERVER_ERROR` | Unhandled |

Error message text Vietnamese (D7); error code English. Pattern: `^[A-Z][A-Z_]+$`.

## Pagination

- Cursor-based for unbounded lists (preferred)
- Page-based legacy supported for compatibility

Cursor request:

```
GET /api/v1/orders?cursor=eyJpZCI6MTIzfQ&limit=20
```

Cursor response:

```json
{
  "data": [ ... ],
  "pagination": {
    "nextCursor": "eyJpZCI6MTQzfQ",
    "hasMore": true
  }
}
```

`limit` capped at 100 server-side. Default 20.

## Idempotency

Sensitive write endpoints accept `Idempotency-Key` header (UUID v4). Server caches responses for 24h keyed by `(method, path, idempotency-key)`. Duplicate requests return cached response.

Required for:

- `POST /api/v1/auth/register`
- `POST /api/v1/orders`
- `POST /api/v1/orders/{id}/deposit`
- `POST /api/v1/farm-subscriptions`
- IoT sensor ingest

Optional elsewhere.

## API Versioning Header

Optional `X-API-Version` request header for clients pinning to a specific minor version. Server logs mismatches.

## JSON Casing

- Field names: `camelCase`
- Enum values: `UPPER_SNAKE_CASE` (matches database enum)
- File / route segments: `kebab-case`

## Date and Time

- Format: ISO 8601 with timezone (UTC preferred)
- Examples: `2026-05-16T03:00:00Z` or `2026-05-16T10:00:00+07:00`
- Date-only: `2026-05-16`
- Server stores in UTC; display layer converts to user timezone

## Authentication

See [`authentication.md`](authentication.md). Bearer token via `Authorization: Bearer <jwt>`.

## CORS

Allowed origins per `APP_CORS_ALLOWED_ORIGINS` env var. Default local: `http://localhost:5173,http://127.0.0.1:5173`.

## Rate Limiting

`RateLimitFilter` protects sensitive endpoints (login, register, forgot-password, IoT ingest). Limit values configured per environment. Excess requests get `429 TOO_MANY_REQUESTS`.

## Logging and Trace

Each response includes `traceId` in `Error` envelope. Logs correlated by `traceId` for debugging.

## Public Endpoints

No bearer required:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/public/listings`
- `GET /api/v1/public/trace/*`
- `GET /actuator/health/*`

All other endpoints require valid bearer.
