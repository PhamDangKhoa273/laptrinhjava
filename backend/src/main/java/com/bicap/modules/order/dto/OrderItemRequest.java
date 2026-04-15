package com.bicap.modules.order.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class OrderItemRequest {

    @NotNull(message = "listing_id là bắt buộc")
    private Long listingId;

    @NotNull(message = "Số lượng là bắt buộc")
    @DecimalMin(value = "0.01", message = "Số lượng phải lớn hơn 0")
    private BigDecimal quantity;

    public Long getListingId() {
        return listingId;
    }

    public void setListingId(Long listingId) {
        this.listingId = listingId;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }
}
