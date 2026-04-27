# Guest Marketplace Module

## Purpose

The Guest Marketplace module owns public and guest-facing discovery: public marketplace,
listing detail, public trace, announcements, education content, and guest workspace overview.

## Backend Ownership

- Packages: `modules/listing`, `modules/content`, `modules/product`, `modules/vechain`
- Guest flows should use public-safe endpoints only.

## Frontend Ownership

- Routes:
  - `/marketplace`
  - `/content`
  - `/announcements`
  - `/listings/:id`
  - `/public/trace`
  - `/dashboard/guest`
  - `/guest/search`
  - `/guest/announcements`
  - `/guest/education`
- Pages:
  - `PublicMarketplacePage.jsx`
  - `GuestMarketplacePage.jsx`
  - `ListingDetailPage.jsx`
  - `PublicTracePage.jsx`
  - `PublicAnnouncementsPage.jsx`

## Roles

| Role | Access |
|---|---|
| Public unauthenticated | Public marketplace/trace/announcements |
| Guest | Guest dashboard and guest workspace routes |
| Other authenticated roles | May use public pages where exposed |

## Business Rules

1. Public marketplace data must be safe to expose.
2. Public trace must not reveal private operational data beyond traceable product evidence.
3. Guest workspace organizes browsing, search, announcements, and education.
4. Listing detail should preserve product and traceability context.
5. Public marketplace filters must be derived from backend listing data only; frontend code must not invent product categories, regions, certifications, or sample listings.

## Security Rules

1. Guest routes require `ROLES.GUEST` when under `/dashboard/guest` or `/guest/*`.
2. Public routes must not expose admin/farm/retailer private data.
3. Public fallback states must render safely when data is unavailable.

## Tests and Verification

- `AppRoutes.test.jsx` validates guest marketplace and guest dashboard route access.

## Known Gaps

- Add public endpoint contract tests for data redaction if not already present.
- Keep marketplace filter UI synchronized with backend listing fields; do not add static demo filter values in frontend pages.
