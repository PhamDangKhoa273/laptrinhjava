package com.bicap.backend.controller;

import com.bicap.backend.dto.UpdateUserStatusRequest;
import com.bicap.backend.dto.UserResponse;
import com.bicap.backend.dto.request.AssignRoleRequest;
import com.bicap.backend.dto.request.CreateUserRequest;
import com.bicap.backend.dto.request.UpdateProfileRequest;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.dto.response.UserProfileResponse;
import com.bicap.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ApiResponse<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ApiResponse.success("Tạo user thành công", userService.createUser(request));
    }

    @GetMapping
    public ApiResponse<List<UserResponse>> getAllUsers() {
        return ApiResponse.success(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getUserById(@PathVariable Long id) {
        return ApiResponse.success(userService.getUserById(id));
    }

    @PutMapping("/{id}/profile")
    public ApiResponse<UserResponse> updateProfile(@PathVariable Long id,
                                                   @Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.success("Cập nhật profile thành công", userService.updateProfile(id, request));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<UserResponse> changeStatus(@PathVariable Long id,
                                                  @Valid @RequestBody UpdateUserStatusRequest request) {
        return ApiResponse.success("Đổi trạng thái thành công", userService.changeStatus(id, request));
    }

    @PostMapping("/{id}/roles")
    public ApiResponse<String> assignRole(@PathVariable Long id,
                                          @Valid @RequestBody AssignRoleRequest request) {
        return ApiResponse.success(userService.assignRole(id, request), null);
    }

    @GetMapping("/{id}/profile")
    public ApiResponse<UserProfileResponse> getProfile(@PathVariable Long id) {
        return ApiResponse.success(userService.getProfile(id));
    }
}
