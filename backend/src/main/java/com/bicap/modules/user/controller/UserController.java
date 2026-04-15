package com.bicap.modules.user.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.user.dto.UpdateUserStatusRequest;
import com.bicap.modules.user.dto.AssignRoleRequest;
import com.bicap.modules.user.dto.CreateUserRequest;
import com.bicap.modules.user.dto.UpdateProfileRequest;
import com.bicap.modules.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<?> getMyProfile() {
        return ApiResponse.success(
                "Láº¥y há»“ sÆ¡ cÃ¡ nhÃ¢n thÃ nh cÃ´ng",
                userService.getCurrentUserProfile()
        );
    }

    @GetMapping("/me/profile")
    public ApiResponse<?> getMyProfileAlias() {
        return ApiResponse.success(
                "Láº¥y há»“ sÆ¡ cÃ¡ nhÃ¢n thÃ nh cÃ´ng",
                userService.getCurrentUserProfile()
        );
    }

    @PutMapping("/me/profile")
    public ApiResponse<?> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.success(
                "Cáº­p nháº­t há»“ sÆ¡ cÃ¡ nhÃ¢n thÃ nh cÃ´ng",
                userService.updateCurrentUserProfile(request)
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ApiResponse.success(
                "Táº¡o user thÃ nh cÃ´ng",
                userService.createUserByAdmin(request)
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> getAllUsers() {
        return ApiResponse.success(
                "Láº¥y danh sÃ¡ch user thÃ nh cÃ´ng",
                userService.getAllUsers()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> getUserById(@PathVariable Long id) {
        return ApiResponse.success(
                "Láº¥y thÃ´ng tin user thÃ nh cÃ´ng",
                userService.getUserById(id)
        );
    }

    @GetMapping("/{id}/profile")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> getUserProfileById(@PathVariable Long id) {
        return ApiResponse.success(
                "Láº¥y há»“ sÆ¡ ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng",
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
                "Admin cáº­p nháº­t há»“ sÆ¡ ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng",
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
                "Äá»•i tráº¡ng thÃ¡i ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng",
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
                "GÃ¡n role thÃ nh cÃ´ng",
                userService.assignRole(id, request)
        );
    }
}
