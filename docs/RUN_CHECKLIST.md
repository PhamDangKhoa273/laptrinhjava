# BICAP Phase 2 - Run Checklist

## Goal
Bring TV1 + TV2 + TV3 into a demo-ready and testable state with the current repository scope.

---

## 1. Required software
Install only these essentials:
- Java 17
- Maven 3.9+
- MySQL 8.x
- Node.js LTS
- Postman
- Git (recommended)

---

## 2. Recommended machine organization
### System drive (C:)
Install software only:
- Java
- Node.js
- Maven
- MySQL Server / MySQL Workbench
- Postman
- VS Code / IntelliJ

### Data drive (D:)
Keep project and data here:
```text
D:\Code\laptrinhjava
D:\Data\mysql
D:\Exports\postman
```

---

## 3. Backend configuration to verify
Current backend config in `application.properties`:
- port: `8080`
- datasource url: `jdbc:mysql://localhost:3306/bicap_db...`
- username: `root`
- password: `1234`
- flyway enabled
- hibernate ddl-auto = `validate`

### Important
If schema/migration files are missing or DB is empty, backend may fail to boot.

---

## 4. Frontend configuration to verify
`.env.example`
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 5. Runtime verification order
### Step 1 - Verify installed tools
Check:
- `java -version`
- `mvn -version`
- `node -v`
- `npm -v`

### Step 2 - Verify MySQL
- MySQL service is running
- user `root` exists
- password is `1234`
- database `bicap_db` can be created/accessed

### Step 3 - Run backend
From repo root:
```bash
mvn spring-boot:run
```
Expected:
- app starts on `http://localhost:8080`
- no Flyway/schema validation crash

### Step 4 - Run frontend
From repo root:
```bash
npm install
npm run dev
```
Expected:
- Vite app starts successfully
- frontend can call backend at `http://localhost:8080/api`

### Step 5 - Run Postman test plan
Use `POSTMAN_TEST_PLAN.md` and test all success + negative cases.

---

## 6. Minimum successful demo
- Register new account
- Login
- Redirect to dashboard
- Call `/auth/me`
- Update profile
- Refresh browser and keep session
- Logout
- Protected route redirects back to login

---

## 7. Known current project limitations
- Extended business profile entities are not fully verified
- Farm/Retailer/Driver-specific backend modules may still be incomplete
- README was previously ahead of backend implementation and has been aligned to the verified core scope
- Database migration/schema presence is still the biggest runtime risk

---

## 8. Completion criteria for current mission
The mission is considered successful when:
- frontend and backend API contracts are aligned for auth/profile core flow
- app can run locally
- Postman auth/profile test cases pass
- login/register/profile/logout demo works end-to-end
