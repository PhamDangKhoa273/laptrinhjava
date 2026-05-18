package com.bicap.core.enums;

/**
 * Enum các loại thông báo trong hệ thống
 * Author: Dinh Khang199
 */
public enum NotificationType {
    // Thông báo đơn hàng
    ORDER_CREATED("Đơn hàng mới được tạo"),
    ORDER_CONFIRMED("Đơn hàng đã được xác nhận"),
    ORDER_SHIPPED("Đơn hàng đang được giao"),
    ORDER_DELIVERED("Đơn hàng đã giao thành công"),
    ORDER_CANCELLED("Đơn hàng đã bị hủy"),
    ORDER_REFUNDED("Đơn hàng đã được hoàn tiền"),

    // Thông báo thanh toán
    PAYMENT_SUCCESS("Thanh toán thành công"),
    PAYMENT_FAILED("Thanh toán thất bại"),
    PAYMENT_PENDING("Thanh toán đang chờ xử lý"),
    PAYMENT_REFUND("Hoàn tiền thành công"),

    // Thông báo sản phẩm
    PRODUCT_APPROVED("Sản phẩm đã được duyệt"),
    PRODUCT_REJECTED("Sản phẩm bị từ chối"),
    PRODUCT_LOW_STOCK("Sản phẩm sắp hết hàng"),
    PRODUCT_OUT_OF_STOCK("Sản phẩm đã hết hàng"),
    PRODUCT_PRICE_CHANGED("Giá sản phẩm đã thay đổi"),

    // Thông báo người dùng
    USER_REGISTERED("Đăng ký thành công"),
    USER_VERIFIED("Tài khoản đã được xác minh"),
    USER_PASSWORD_CHANGED("Mật khẩu đã được thay đổi"),
    USER_PROFILE_UPDATED("Hồ sơ đã được cập nhật"),
    USER_BANNED("Tài khoản đã bị khóa"),
    USER_UNBANNED("Tài khoản đã được mở khóa"),

    // Thông báo hệ thống
    SYSTEM_MAINTENANCE("Bảo trì hệ thống"),
    SYSTEM_UPDATE("Cập nhật hệ thống"),
    SYSTEM_ALERT("Cảnh báo hệ thống"),

    // Thông báo blockchain
    BLOCKCHAIN_TRANSACTION_SUCCESS("Giao dịch blockchain thành công"),
    BLOCKCHAIN_TRANSACTION_FAILED("Giao dịch blockchain thất bại"),
    BLOCKCHAIN_GOVERNANCE_VOTE("Bỏ phiếu quản trị blockchain"),

    // Thông báo khuyến mãi
    PROMOTION_STARTED("Chương trình khuyến mãi bắt đầu"),
    PROMOTION_ENDING_SOON("Khuyến mãi sắp kết thúc"),
    PROMOTION_ENDED("Khuyến mãi đã kết thúc"),

    // Thông báo chung
    GENERAL("Thông báo chung"),
    REMINDER("Nhắc nhở"),
    INFO("Thông tin");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
