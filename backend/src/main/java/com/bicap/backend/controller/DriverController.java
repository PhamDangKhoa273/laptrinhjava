<<<<<<< Updated upstream:backend/src/main/java/com/bicap/backend/controller/DriverController.java
package com.bicap.backend.controller;

import com.bicap.backend.dto.CreateDriverRequest;
import com.bicap.backend.dto.DriverResponse;
import com.bicap.backend.dto.UpdateDriverRequest;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.security.SecurityUtils;
import com.bicap.backend.service.DriverService;
=======
package com.bicap.modules.logistics.controller;

import com.bicap.core.dto.ApiResponse;

import com.bicap.modules.logistics.dto.CreateDriverRequest;
import com.bicap.modules.logistics.dto.DriverResponse;
import com.bicap.modules.logistics.dto.UpdateDriverRequest;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.logistics.service.DriverService;
>>>>>>> Stashed changes:backend/src/main/java/com/bicap/modules/logistics/controller/DriverController.java
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @PostMapping
    @PreAuthorize("hasRole('SHIPPING_MANAGER')")
    public ApiResponse<DriverResponse> create(@Valid @RequestBody CreateDriverRequest request) {
        return ApiResponse.success(
                "Táº¡o driver thÃ nh cÃ´ng",
                driverService.create(request, SecurityUtils.getCurrentUserId())
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER','ADMIN')")
    public ApiResponse<List<DriverResponse>> getAll() {
        return ApiResponse.success(driverService.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER','ADMIN')")
    public ApiResponse<DriverResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(driverService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER','ADMIN')")
    public ApiResponse<DriverResponse> update(@PathVariable Long id,
                                              @Valid @RequestBody UpdateDriverRequest request) {
        return ApiResponse.success(
                "Cáº­p nháº­t driver thÃ nh cÃ´ng",
                driverService.update(id, request, SecurityUtils.getCurrentUserId())
        );
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('SHIPPING_MANAGER','ADMIN')")
    public ApiResponse<DriverResponse> deactivate(@PathVariable Long id) {
        return ApiResponse.success(
                "Ngá»«ng kÃ­ch hoáº¡t driver thÃ nh cÃ´ng",
                driverService.deactivate(id, SecurityUtils.getCurrentUserId())
        );
    }
}
