# BICAP Frontend - Phase 2

Frontend module for **Member 3 - Frontend Developer** in Phase 2 of the BICAP system.

## Current verified scope
This frontend has been aligned to the current backend core scope so the Phase 2 demo can run more reliably.

### Verified working scope target
- React + Vite frontend setup
- Login page
- Register page
- Profile / update profile page
- Access token + refresh token storage with localStorage
- Axios API service with bearer token injection
- Auto refresh token flow (if backend supports `/auth/refresh`)
- Protected routes / public-only routes
- Redirect after login based on role
- Dashboard overview for auth/session status
- Backend validation error mapping to form fields
- Loading, timeout, network error, and auth error handling
- Dashboard skeleton for Admin, Farm, Retailer, Shipping Manager, Driver, Guest

## Backend APIs currently used by frontend
- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/me`
- `POST /auth/logout`
- `POST /auth/refresh`
- `PUT /users/me/profile`

## Current expected response shape
```json
{
  "message": "Success",
  "data": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "user": {
      "userId": 1,
      "fullName": "Nguyen Van A",
      "email": "a@example.com",
      "phone": "0901234567",
      "avatarUrl": "https://example.com/avatar.png",
      "primaryRole": "FARM",
      "roles": ["FARM"],
      "status": "ACTIVE"
    }
  }
}
```

## Important scope note
The frontend still contains role dashboards and placeholder texts for Farm / Retailer / Driver / Shipping Manager flows.
However, the currently verified backend core scope is centered on:
- auth
- user profile
- role list / role-based redirect
- admin-level user management basics

Extended role-specific business profile modules may require additional backend entities and APIs.

## Run project
```bash
npm install
npm run dev
```

## Environment
Create `.env` from `.env.example` and update API URL if needed.

## Folder structure
```text
src/
  components/
  context/
  layouts/
  pages/
  routes/
  services/
  utils/
```

## Recommended demo flow
1. Register account
2. Login account
3. Redirect by role
4. Open dashboard overview and role dashboard
5. View and update profile
6. Show route blocking when not logged in
7. Show backend validation error on form
8. Show token-based session persistence after refresh
9. Logout and verify redirect back to login

## Known backend dependency risk
Backend configuration currently expects:
- MySQL running locally
- database `bicap_db`
- username `root`
- password `1234`
- Flyway / validated schema

If backend startup fails, verify database schema and migration files first.
