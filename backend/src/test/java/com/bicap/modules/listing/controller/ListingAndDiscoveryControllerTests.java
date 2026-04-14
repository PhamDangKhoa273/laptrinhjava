package com.bicap.modules.listing.controller;

import com.bicap.core.exception.GlobalExceptionHandler;
import com.bicap.modules.discovery.controller.DiscoveryController;
import com.bicap.modules.discovery.service.DiscoveryService;
import com.bicap.modules.listing.dto.ListingResponse;
import com.bicap.modules.listing.service.ProductListingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ListingAndDiscoveryControllerTests {

    private MockMvc listingMockMvc;
    private MockMvc discoveryMockMvc;

    @Mock
    private ProductListingService listingService;

    @Mock
    private DiscoveryService discoveryService;

    @BeforeEach
    void setUp() {
        listingMockMvc = MockMvcBuilders.standaloneSetup(new ProductListingController(listingService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        discoveryMockMvc = MockMvcBuilders.standaloneSetup(new DiscoveryController(discoveryService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void createListing_shouldReturnValidationErrorWhenPayloadInvalid() throws Exception {
        listingMockMvc.perform(post("/api/v1/listings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "batchId": null,
                                  "title": "",
                                  "price": 0,
                                  "quantityAvailable": 0
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    void updateListing_shouldValidatePayload() throws Exception {
        listingMockMvc.perform(put("/api/v1/listings/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "price": 0,
                                  "quantityAvailable": 0,
                                  "status": "THIS_STATUS_NAME_IS_TOO_LONG"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void getListingById_shouldReturnContractFields() throws Exception {
        ListingResponse response = ListingResponse.builder()
                .listingId(1L)
                .batchId(10L)
                .batchCode("BATCH-10")
                .productName("Rau cải")
                .productCode("P-01")
                .farmName("Green Farm")
                .farmCode("GF-01")
                .province("Lam Dong")
                .title("Rau cải hữu cơ")
                .description("Mô tả")
                .price(BigDecimal.valueOf(45000))
                .quantityAvailable(BigDecimal.valueOf(12))
                .unit("kg")
                .status("ACTIVE")
                .build();

        when(listingService.getListingById(1L)).thenReturn(response);

        listingMockMvc.perform(get("/api/v1/listings/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.productCode").value("P-01"))
                .andExpect(jsonPath("$.data.farmCode").value("GF-01"))
                .andExpect(jsonPath("$.data.province").value("Lam Dong"));
    }

    @Test
    void search_shouldReturnPagedPayloadContract() throws Exception {
        ListingResponse item = ListingResponse.builder()
                .listingId(1L)
                .title("Rau cải hữu cơ")
                .productCode("P-01")
                .farmCode("GF-01")
                .province("Lam Dong")
                .price(BigDecimal.valueOf(45000))
                .build();

        when(discoveryService.search(eq("rau"), eq(BigDecimal.valueOf(10000)), eq(BigDecimal.valueOf(50000)), eq("Lam Dong"), eq(1), eq(9), eq("price,asc")))
                .thenReturn(new PageImpl<>(List.of(item), PageRequest.of(1, 9, Sort.by(Sort.Direction.ASC, "price")), 15));

        discoveryMockMvc.perform(get("/api/v1/search")
                        .param("keyword", "rau")
                        .param("minPrice", "10000")
                        .param("maxPrice", "50000")
                        .param("province", "Lam Dong")
                        .param("page", "1")
                        .param("size", "9")
                        .param("sort", "price,asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items[0].productCode").value("P-01"))
                .andExpect(jsonPath("$.data.page").value(1))
                .andExpect(jsonPath("$.data.size").value(9))
                .andExpect(jsonPath("$.data.totalItems").value(10))
                .andExpect(jsonPath("$.data.totalPages").value(2))
                .andExpect(jsonPath("$.data.sort").value("price,asc"));
    }

    @Test
    void search_shouldRejectInvalidPriceRange() throws Exception {
        discoveryMockMvc.perform(get("/api/v1/search")
                        .param("minPrice", "90000")
                        .param("maxPrice", "10000"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void search_shouldRejectInvalidSize() throws Exception {
        discoveryMockMvc.perform(get("/api/v1/search")
                        .param("size", "101"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }
}
