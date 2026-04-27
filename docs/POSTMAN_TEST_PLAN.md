# BICAP Phase 2 - Postman Test Plan

## Base URL
- Backend: `http://localhost:8080/api`

## Variables
- `baseUrl` = `http://localhost:8080/api`
- `accessToken` = token from login
- `refreshToken` = refresh token from login
- `adminAccessToken` = optional admin token
- `userId` = created user id

---

## 1. Auth - Register
### Success
**POST** `{{baseUrl}}/auth/register`
```json
{
  "fullName": "Huy Test",
  "email": "huytest1@example.com",
  "password": "123456",
  "phone": "0901234567",
  "avatarUrl": ""
}
```
Expected:
- 200 OK
- `success = true`
- response contains user data

### Fail - duplicate email
Send same payload again.
Expected:
- 400
- `code = BUSINESS_ERROR`

### Fail - invalid phone
```json
{
  "fullName": "Huy Test",
  "email": "huytest2@example.com",
  "password": "123456",
  "phone": "123",
  "avatarUrl": ""
}
```
Expected:
- 400
- `code = VALIDATION_ERROR`

---

## 2. Auth - Login
### Success
**POST** `{{baseUrl}}/auth/login`
```json
{
  "email": "huytest1@example.com",
  "password": "123456"
}
```
Expected:
- 200
- receive `accessToken`, `refreshToken`, `user`
- save tokens to variables

### Fail - wrong password
Expected:
- 401
- `code = UNAUTHORIZED`

### Fail - unknown email
Expected:
- 401
- `code = UNAUTHORIZED`

---

## 3. Auth - Me
### Success
**GET** `{{baseUrl}}/auth/me`
Header:
- `Authorization: Bearer {{accessToken}}`

Expected:
- 200
- current user profile returned

### Fail - no token
Expected:
- 401

### Fail - invalid token
Expected:
- 401

---

## 4. Auth - Refresh
### Success
**POST** `{{baseUrl}}/auth/refresh`
```json
{
  "refreshToken": "{{refreshToken}}"
}
```
Expected:
- 200
- new access token

### Fail - invalid refresh token
Expected:
- 400 or 401 depending on backend implementation

---

## 5. Auth - Logout
### Success
**POST** `{{baseUrl}}/auth/logout`
Header:
- `Authorization: Bearer {{accessToken}}`

Expected:
- 200
- message explains client-side token removal

---

## 6. User - My profile
### Success
**GET** `{{baseUrl}}/users/me`
Header:
- `Authorization: Bearer {{accessToken}}`

Expected:
- 200

### Alias route success
**GET** `{{baseUrl}}/users/me/profile`
Header:
- `Authorization: Bearer {{accessToken}}`

Expected:
- 200 if backend route exists

---

## 7. User - Update my profile
### Success
**PUT** `{{baseUrl}}/users/me/profile`
Header:
- `Authorization: Bearer {{accessToken}}`
```json
{
  "fullName": "Huy Updated",
  "phone": "0901111222",
  "avatarUrl": "https://example.com/avatar.png"
}
```
Expected:
- 200
- returned user reflects new values

### Fail - invalid phone
Expected:
- 400 validation error

### Fail - no token
Expected:
- 401

---

## 8. Admin only endpoints
Use an account with ADMIN role.

### Get all users
**GET** `{{baseUrl}}/users`
Header:
- `Authorization: Bearer {{adminAccessToken}}`

Expected:
- 200

### Fail - normal user access
Use `accessToken` from non-admin user.
Expected:
- 403

### Get user by id
**GET** `{{baseUrl}}/users/{{userId}}`
Expected:
- 200 for admin
- 403 for non-admin

### Assign role
**POST** `{{baseUrl}}/users/{{userId}}/roles`
```json
{
  "roleName": "FARM"
}
```
Expected:
- 200 for admin
- 400 if role already assigned

### Change status
**PATCH** `{{baseUrl}}/users/{{userId}}/status`
```json
{
  "status": "INACTIVE"
}
```
Expected:
- 200 for admin

---

## 9. Security / negative cases
- Access admin endpoint without token -> 401
- Access admin endpoint with normal user token -> 403
- Use expired token -> 401
- Use malformed bearer token -> 401
- Refresh with access token instead of refresh token -> fail

---

## 10. Frontend manual smoke test
1. Open login page
2. Open register page
3. Register new account
4. Login with created account
5. Verify redirect to dashboard
6. Refresh browser and verify session persists
7. Open profile page
8. Update full name / phone / avatar
9. Logout
10. Try to revisit protected page and verify redirect to login

---

## Current known scope limit
- Role-specific business profile fields in frontend are placeholders only.
- Current backend scope mainly supports core user profile fields: `fullName`, `email`, `phone`, `avatarUrl`, `roles`, `status`.
- Extended domain entities like farms / retailers / drivers / vehicles still need deeper backend completion if required by the full Phase 2 spec.
