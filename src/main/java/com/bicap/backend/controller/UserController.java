package com.bicap.backend.controller;

import com.bicap.backend.dto.request.AssignRoleRequest;
import com.bicap.backend.dto.request.CreateUserRequest;
import com.bicap.backend.dto.request.UpdateProfileRequest;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.entity.User;
import com.bicap.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ApiResponse<User> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ApiResponse.success("Tạo user thành công", userService.createUser(request));
    }

    @GetMapping
    public ApiResponse<?> getAllUsers() {
        return ApiResponse.success(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ApiResponse<User> getUserById(@PathVariable Long id) {
        return ApiResponse.success(userService.getUserById(id));
    }

    @PutMapping("/{id}/profile")
    public ApiResponse<User> updateProfile(@PathVariable Long id,
                                           @Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.success("Cập nhật profile thành công", userService.updateProfile(id, request));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<User> changeStatus(@PathVariable Long id,
                                          @RequestParam String status) {
        return ApiResponse.success("Đổi trạng thái thành công", userService.changeStatus(id, status));
    }

    @PostMapping("/{id}/roles")
    public ApiResponse<String> assignRole(@PathVariable Long id,
                                          @Valid @RequestBody AssignRoleRequest request) {
        return ApiResponse.success(userService.assignRole(id, request), null);
    }

    @GetMapping("/{id}/profile")
    public ApiResponse<?> getProfile(@PathVariable Long id) {
        return ApiResponse.success(userService.getProfile(id));
    }
}