# API Contract Notes

## Success response
- `success`
- `code`
- `message`
- `data`
- `timestamp`

## Error response
- `code`
- `message`
- `traceId`
- `fieldErrors`
- `timestamp`

## Pagination
Standard paged response shape:
- `items`
- `page`
- `size`
- `totalItems`
- `totalPages`
- `sort`

Use this shape for public listing/search endpoints and document request/response fields next to each endpoint when exposed in frontend code.

## Rule
If the frontend relies on a backend response shape, the shape should be documented here or in the endpoint’s own API docs.
