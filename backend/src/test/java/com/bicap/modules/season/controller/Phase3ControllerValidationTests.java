package com.bicap.modules.season.controller;

import com.bicap.core.exception.GlobalExceptionHandler;
import com.bicap.modules.batch.controller.BatchController;
import com.bicap.modules.batch.dto.BatchResponse;
import com.bicap.modules.batch.service.ProductBatchService;
import com.bicap.modules.season.dto.ProcessStepResponse;
import com.bicap.modules.season.service.FarmingProcessService;
import com.bicap.modules.season.service.SeasonService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class Phase3ControllerValidationTests {

    private MockMvc seasonMockMvc;
    private MockMvc processMockMvc;
    private MockMvc batchMockMvc;

    @Mock
    private SeasonService seasonService;

    @Mock
    private FarmingProcessService farmingProcessService;

    @Mock
    private ProductBatchService productBatchService;

    @BeforeEach
    void setUp() {
        GlobalExceptionHandler exceptionHandler = new GlobalExceptionHandler();
        seasonMockMvc = MockMvcBuilders.standaloneSetup(new SeasonController(seasonService))
                .setControllerAdvice(exceptionHandler)
                .build();
        processMockMvc = MockMvcBuilders.standaloneSetup(new FarmingProcessController(farmingProcessService))
                .setControllerAdvice(exceptionHandler)
                .build();
        batchMockMvc = MockMvcBuilders.standaloneSetup(new BatchController(productBatchService))
                .setControllerAdvice(exceptionHandler)
                .build();
    }

    @Test
    void createSeason_shouldRejectMissingRequiredFields() throws Exception {
        seasonMockMvc.perform(post("/api/v1/seasons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void createProcess_shouldRejectInvalidStepNo() throws Exception {
        processMockMvc.perform(post("/api/v1/processes/season/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "stepNo": 0,
                                  "stepName": "Gieo hạt",
                                  "performedAt": "2026-04-14T10:00:00"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void createBatch_shouldRejectInvalidQuantities() throws Exception {
        batchMockMvc.perform(post("/api/v1/batches")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "seasonId": 10,
                                  "productId": 20,
                                  "batchCode": "BATCH-01",
                                  "harvestDate": "2026-04-14",
                                  "quantity": 0,
                                  "availableQuantity": -1,
                                  "qualityGrade": "A",
                                  "expiryDate": "2026-05-14"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void updateProcess_shouldAcceptValidPayload() throws Exception {
        when(farmingProcessService.updateProcessStep(anyLong(), any())).thenReturn(ProcessStepResponse.builder()
                .id(5L)
                .stepNo(2)
                .stepName("Tưới nước")
                .build());

        processMockMvc.perform(put("/api/v1/processes/5")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "stepNo": 2,
                                  "stepName": "Tưới nước",
                                  "performedAt": "2026-04-15T08:30:00",
                                  "description": "Tưới buổi sáng"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.stepName").value("Tưới nước"));
    }

    @Test
    void updateBatch_shouldAcceptValidPayload() throws Exception {
        when(productBatchService.updateBatch(anyLong(), any())).thenReturn(BatchResponse.builder()
                .batchId(30L)
                .batchCode("BATCH-30")
                .build());

        batchMockMvc.perform(put("/api/v1/batches/30")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "quantity": 100,
                                  "availableQuantity": 80,
                                  "qualityGrade": "A",
                                  "harvestDate": "2026-04-14",
                                  "expiryDate": "2026-05-14",
                                  "status": "READY"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.batchCode").value("BATCH-30"));
    }
}
