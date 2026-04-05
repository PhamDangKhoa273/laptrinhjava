package com.bicap.backend.controller;

import com.bicap.backend.dto.UpdateUserStatusRequest;
import com.bicap.backend.dto.request.AssignRoleRequest;
import com.bicap.backend.dto.request.CreateUserRequest;
import com.bicap.backend.dto.request.UpdateProfileRequest;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<?> getMyProfile() {
        return ApiResponse.success(
                "Lấy hồ sơ cá nhân thành công",
                userService.getCurrentUserProfile()
        );
    }

    @GetMapping("/me/profile")
    public ApiResponse<?> getMyProfileAlias() {
        return ApiResponse.success(
                "Lấy hồ sơ cá nhân thành công",
                userService.getCurrentUserProfile()
        );
    }

    @PutMapping("/me/profile")
    public ApiResponse<?> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.success(
                "Cập nhật hồ sơ cá nhân thành công",
                userService.updateCurrentUserProfile(request)
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ApiResponse.success(
                "Tạo user thành công",
                userService.createUserByAdmin(request)
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> getAllUsers() {
        return ApiResponse.success(
                "Lấy danh sách user thành công",
                userService.getAllUsers()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> getUserById(@PathVariable Long id) {
        return ApiResponse.success(
                "Lấy thông tin user thành công",
                userService.getUserById(id)
        );
    }

    @GetMapping("/{id}/profile")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> getUserProfileById(@PathVariable Long id) {
        return ApiResponse.success(
                "Lấy hồ sơ người dùng thành công",
                userService.getUserById(id)
        );
    }

    @PutMapping("/{id}/profile")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> updateProfileAsAdmin(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ApiResponse.success(
                "Admin cập nhật hồ sơ người dùng thành công",
                userService.updateProfileAsAdmin(id, request)
        );
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        return ApiResponse.success(
                "Đổi trạng thái người dùng thành công",
                userService.changeStatus(id, request)
        );
    }

    @PostMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> assignRole(
            @PathVariable Long id,
            @Valid @RequestBody AssignRoleRequest request
    ) {
        return ApiResponse.success(
                "Gán role thành công",
                userService.assignRole(id, request)
        );
    }
}
