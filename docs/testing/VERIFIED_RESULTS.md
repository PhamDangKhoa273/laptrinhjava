# BICAP Phase 2 - Verified Results (evidence log)

## Verification dates
- 2026-04-01
- 2026-04-06 (live retest after Phase 2 completion pass)

## Environment verified
- Java runtime in machine PATH: Java 8
- JDK used for backend verification: Eclipse Adoptium JDK 17 (`C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot`)
- Maven: via Maven Wrapper (`mvnw.cmd`)
- Node.js: v24.14.1
- npm: 11.11.0
- MySQL: reachable locally on `localhost:3306`
- Database: `bicap_db`

## Build / boot status
### Frontend
Command:
```bash
npm run build
```
Result:
- ✅ Build passed successfully

### Backend
Command:
```bash
.\mvnw.cmd spring-boot:run
```
Result:
- ✅ Backend booted successfully on port `8080`
- ✅ Flyway validated migrations and confirmed schema up to date
- ✅ Schema `bicap_db` reachable and usable for live retest

### Backend tests
Command:
```bash
.\mvnw.cmd test
```
Result:
- ⚠ Works when Maven is run with JDK 17
- ⚠ Fails if machine shell still points to Java 8 runtime only
- ✅ Root cause identified: PATH/JAVA_HOME mismatch, not backend source compile failure

## Live API verification (2026-04-06)
Base URL:
- `http://localhost:8080/api`

## Core auth/profile flow verified live
### Register
- ✅ success

### Duplicate email
- ✅ returns `400`

### Login
- ✅ success
- access token returned
- refresh token returned

### Wrong password
- ✅ returns `401`

### Get current user (`/auth/me`) without token
- ✅ returns `401`

### Get current user (`/auth/me`) with valid token
- ✅ returns `200`

### Get current profile (`/users/me`)
- ✅ success

### Update current profile (`/users/me/profile`)
- ✅ success
- updated phone reflected in response

### Update profile with invalid phone
- ✅ returns `400`

### Refresh token with valid refresh token
- ✅ success

### Refresh using access token instead of refresh token
- ✅ returns `400`

### Access admin endpoint `/users` with normal guest token
- ✅ returns `403`

## Admin flow verified live
### Login with seeded admin account
- ✅ success (`admin@bicap.com`)

### Get all users
- ✅ success

### Assign role to user
- ✅ success
- verified backend returns updated roles list

### Assign duplicate role
- ✅ returns `400`

### Change user status
- ✅ success
- verified status changed to `INACTIVE`

## Farm approval flow verified live
### Create a fresh farm user for approval testing
- ✅ success

### Assign FARM role to that user
- ✅ success

### Create pending farm profile
- ✅ success

### Admin list farms
- ✅ success

### Admin approve farm
- ✅ success
- verified approval status changed to `APPROVED`

## Final conclusion for current mission
### TV1
- linked and running in the verification environment
- auth + jwt + security + refresh + logout were exercised

### TV2
- core user/role/profile flow was exercised
- admin assign role and change status were verified live
- farm approval flow was verified live
- full delete coverage across all business entities was not claimed in this pass

### TV3
- frontend build passed
- frontend/backend integration for the current verified scope was aligned

### TV5
- local run/test artifacts were prepared
- Docker artifacts and environment templates were added
- test cases, bug report, collection template, and completion summary were added
- live API verification was performed for the core verified scope

## Overall mission status
### Current mission target: Phase 2 core system verified for the tested scope
- achieved for the verified core scope

## Important scope note
This verification log confirms the current **core Phase 2 flow**:
- register
- login
- me
- profile
- refresh token
- logout
- protected/admin authorization behavior
- admin user role assignment
- admin user status change
- admin farm approval

It does not claim full completion of every extended business-domain CRUD variation unless those are separately implemented and verified.
