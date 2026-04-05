package com.bicap.backend.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(min = 2, max = 150, message = "Họ tên từ 2 đến 150 ký tự")
    private String fullName;

    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @Size(max = 255, message = "Avatar URL không vượt quá 255 ký tự")
    private String avatarUrl;
}
