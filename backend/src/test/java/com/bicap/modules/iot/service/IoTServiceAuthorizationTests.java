package com.bicap.modules.iot.service;

import com.bicap.core.AuditLogService;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.batch.repository.ProductBatchRepository;
import com.bicap.modules.common.notification.service.NotificationDispatcher;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.iot.entity.IoTAlert;
import com.bicap.modules.iot.repository.IoTAlertRepository;
import com.bicap.modules.iot.repository.SensorReadingRepository;
import com.bicap.modules.iot.repository.ThresholdRuleRepository;
import com.bicap.modules.season.repository.FarmingSeasonRepository;
import com.bicap.modules.user.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IoTServiceAuthorizationTests {

    @Mock SensorReadingRepository sensorReadingRepository;
    @Mock ThresholdRuleRepository thresholdRuleRepository;
    @Mock IoTAlertRepository iotAlertRepository;
    @Mock ProductBatchRepository productBatchRepository;
    @Mock FarmingSeasonRepository farmingSeasonRepository;
    @Mock NotificationDispatcher notificationDispatcher;
    @Mock AuditLogService auditLogService;

    @InjectMocks IoTService service;

    @Test
    void resolve_shouldRejectAlertFromAnotherFarm() {
        User owner = new User();
        owner.setUserId(1L);
        Farm farm = new Farm();
        farm.setFarmId(10L);
        farm.setOwnerUser(owner);
        IoTAlert alert = new IoTAlert();
        alert.setAlertId(5L);
        alert.setFarm(farm);
        alert.setStatus("OPEN");

        when(iotAlertRepository.findById(5L)).thenReturn(Optional.of(alert));

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(2L);
            assertThatThrownBy(() -> service.resolve(5L)).isInstanceOf(BusinessException.class);
        }
    }
}
