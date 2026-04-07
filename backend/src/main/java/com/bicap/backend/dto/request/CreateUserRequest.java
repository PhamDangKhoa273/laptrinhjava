package com.bicap.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateUserRequest {

    @NotBlank(message = "Há» tÃªn lÃ  báº¯t buá»™c")
    @Size(min = 2, max = 150, message = "Há» tÃªn tá»« 2 Ä‘áº¿n 150 kÃ½ tá»±")
    private String fullName;

    @NotBlank(message = "Email lÃ  báº¯t buá»™c")
    @Email(message = "Email khÃ´ng há»£p lá»‡")
    private String email;

    @NotBlank(message = "Máº­t kháº©u lÃ  báº¯t buá»™c")
    @Size(min = 6, max = 100, message = "Máº­t kháº©u tá»« 6 Ä‘áº¿n 100 kÃ½ tá»±")
    private String password;

    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng há»£p lá»‡")
    private String phone;

    @Size(max = 255, message = "Avatar URL khÃ´ng vÆ°á»£t quÃ¡ 255 kÃ½ tá»±")
    private String avatarUrl;
}
