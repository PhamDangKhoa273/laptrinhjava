# BICAP Phase 2 - Test Cases

## Phạm vi kiểm thử
- Auth: register, login, me, refresh, logout
- User profile: xem / cập nhật hồ sơ cá nhân
- Admin user management: list user, assign role, change status
- Farm approval: list farm, approve/reject farm
- Frontend route protection theo role
- Security: không token, token sai, sai quyền, validate lỗi

## Danh sách test case

| ID | Nhóm | Test case | Kỳ vọng |
|---|---|---|---|
| TC-AUTH-01 | Auth | Register với dữ liệu hợp lệ | 200, tạo user thành công |
| TC-AUTH-02 | Auth | Register trùng email | 400 BUSINESS_ERROR |
| TC-AUTH-03 | Auth | Register sai số điện thoại | 400 VALIDATION_ERROR |
| TC-AUTH-04 | Auth | Login đúng tài khoản | 200, có accessToken + refreshToken |
| TC-AUTH-05 | Auth | Login sai mật khẩu | 401 UNAUTHORIZED |
| TC-AUTH-06 | Auth | `/auth/me` với token hợp lệ | 200, trả user hiện tại |
| TC-AUTH-07 | Auth | `/auth/me` không token | 401 |
| TC-AUTH-08 | Auth | Refresh bằng refresh token hợp lệ | 200, trả access token mới |
| TC-AUTH-09 | Auth | Refresh bằng access token | 400/401 |
| TC-PROFILE-01 | Profile | Xem `/users/me` | 200 |
| TC-PROFILE-02 | Profile | Update `/users/me/profile` hợp lệ | 200, dữ liệu đổi đúng |
| TC-PROFILE-03 | Profile | Update profile sai phone | 400 validation error |
| TC-ADMIN-01 | Admin user | Admin lấy danh sách user | 200 |
| TC-ADMIN-02 | Admin user | User thường gọi `/users` | 403 |
| TC-ADMIN-03 | Admin user | Admin assign role cho user | 200 |
| TC-ADMIN-04 | Admin user | Gán role trùng | 400 BUSINESS_ERROR |
| TC-ADMIN-05 | Admin user | Admin đổi status ACTIVE -> INACTIVE | 200 |
| TC-FARM-01 | Farm approval | Admin xem danh sách farm | 200 |
| TC-FARM-02 | Farm approval | Admin approve farm | 200 |
| TC-FARM-03 | Farm approval | Admin reject farm | 200 |
| TC-FARM-04 | Farm approval | User không phải admin gọi approve/reject | 403 |
| TC-ROUTE-01 | Frontend route | Chưa login vào `/dashboard` | redirect về `/login` |
| TC-ROUTE-02 | Frontend route | Login role admin | thấy route admin |
| TC-ROUTE-03 | Frontend route | Login role farm | không truy cập được route admin |
| TC-ROUTE-04 | Frontend route | Admin page users có form assign role | hiển thị dropdown + button assign |
| TC-SEC-01 | Security | Token malformed | 401 |
| TC-SEC-02 | Security | Token sai role vào admin endpoint | 403 |
| TC-SEC-03 | Security | API validate lỗi payload | 400 + error detail |

## Tiêu chí kết luận
- Pass toàn bộ test auth/profile/user admin/farm approval core flow
- Pass toàn bộ negative case về token / role / validate
- Frontend route protection đúng với role
- Không overclaim sang các module ngoài core scope nếu chưa retest đủ
