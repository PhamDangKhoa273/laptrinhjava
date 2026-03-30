# BICAP Frontend - Phase 2

Frontend module for **Member 3 - Frontend Developer** in Phase 2 of the BICAP system.

## Features completed
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
- Reusable UI components for forms, status cards, loading states, and role badges

## Suggested backend APIs
The frontend expects these endpoints:
- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/me`
- `POST /auth/logout`
- `POST /auth/refresh`
- `PUT /users/profile`

Recommended response shape:

```json
{
  "message": "Success",
  "data": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "user": {
      "id": 1,
      "fullName": "Nguyen Van A",
      "email": "a@example.com",
      "phoneNumber": "0901234567",
      "primaryRole": "FARM",
      "roles": ["FARM"]
    }
  }
}
```

## Run project
```bash
cd bicap-frontend
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

## What to demo in class/report
1. Register account
2. Login account
3. Redirect by role
4. Open dashboard overview and role dashboard
5. View and update profile
6. Show route blocking when not logged in
7. Show backend validation error on form
8. Show token-based session persistence after refresh
9. Logout and verify redirect back to login
