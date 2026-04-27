package com.bicap.modules.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class CreateOrderRequest {

    @NotEmpty(message = "Danh sách sản phẩm đặt hàng là bắt buộc")
    @Valid
    private List<OrderItemRequest> items;
    private Long contractId;

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }

    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }
}
