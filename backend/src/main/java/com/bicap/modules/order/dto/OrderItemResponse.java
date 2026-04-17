package com.bicap.modules.order.dto;

import java.math.BigDecimal;

public class OrderItemResponse {

    private Long listingId;
    private String title;
    private String batchCode;
    private BigDecimal quantity;
    private BigDecimal price;
    private BigDecimal subTotal;

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final OrderItemResponse response = new OrderItemResponse();

        public Builder listingId(Long listingId) {
            response.listingId = listingId;
            return this;
        }

        public Builder title(String title) {
            response.title = title;
            return this;
        }

        public Builder batchCode(String batchCode) {
            response.batchCode = batchCode;
            return this;
        }

        public Builder quantity(BigDecimal quantity) {
            response.quantity = quantity;
            return this;
        }

        public Builder price(BigDecimal price) {
            response.price = price;
            return this;
        }

        public Builder subTotal(BigDecimal subTotal) {
            response.subTotal = subTotal;
            return this;
        }

        public OrderItemResponse build() {
            return response;
        }
    }

    public Long getListingId() {
        return listingId;
    }

    public String getTitle() {
        return title;
    }

    public String getBatchCode() {
        return batchCode;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public BigDecimal getSubTotal() {
        return subTotal;
    }
}
