<<<<<<< Updated upstream:backend/src/main/java/com/bicap/backend/service/DriverService.java
package com.bicap.backend.service;

import com.bicap.backend.dto.CreateDriverRequest;
import com.bicap.backend.dto.DriverResponse;
import com.bicap.backend.dto.UpdateDriverRequest;
import com.bicap.backend.entity.Driver;
=======
package com.bicap.modules.logistics.service;

import com.bicap.modules.logistics.dto.CreateDriverRequest;
import com.bicap.modules.logistics.dto.DriverResponse;
import com.bicap.modules.logistics.dto.UpdateDriverRequest;
import com.bicap.modules.logistics.entity.Driver;
>>>>>>> Stashed changes:backend/src/main/java/com/bicap/modules/logistics/service/DriverService.java
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverService {

    public DriverResponse create(CreateDriverRequest request, Long currentUserId) {
        return null;
    }

    public List<DriverResponse> getAll() {
        return new ArrayList<>();
    }

    public DriverResponse getById(Long id) {
        return null;
    }

    public DriverResponse update(Long id, UpdateDriverRequest request, Long currentUserId) {
        return null;
    }

    public DriverResponse deactivate(Long id, Long currentUserId) {
        return null;
    }

    public Driver getEntityById(Long id) {
        return null;
    }
}
