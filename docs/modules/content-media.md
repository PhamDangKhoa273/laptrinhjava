# Content and Media Module

## Purpose

The Content/Media module owns public announcements, education content, uploaded media,
and website appearance assets/settings.

## Backend Ownership

- Packages:
  - `modules/content`
  - `modules/media`
- Related infrastructure: upload directory configuration and content sanitization rules.

## Frontend Ownership

- Admin content page: `AdminContentPage.jsx`
- Public announcements page: `PublicAnnouncementsPage.jsx`
- Website appearance page: `WebsiteAppearancePage.jsx`
- Media service: `mediaService.js`
- Content sanitization: `announcementSanitizer` bundle/source where applicable

## Roles

| Role | Access |
|---|---|
| Admin | Create/manage public content and appearance |
| Guest/Public | Read public announcements/education content |
| Other authenticated roles | May read public content where exposed |

## Business Rules

1. Admin controls announcements and education content.
2. Public content must be safe to render for unauthenticated users.
3. Website appearance settings affect public/brand presentation.
4. Media uploads should be associated with controlled content workflows.

## Security Rules

1. Content writes are admin-only.
2. Rendered public content must be sanitized.
3. Upload paths must be controlled and must not expose arbitrary filesystem access.
4. Media responses should avoid leaking internal storage details.

## Tests and Verification

- Verify public announcement pages render safely after content changes.
- Add sanitizer tests when changing rich-text/HTML handling.

## Known Gaps

- Maintain a content moderation/status model if draft/publish workflows expand.
