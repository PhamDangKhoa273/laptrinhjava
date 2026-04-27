package com.bicap.modules.common.notification.service;

import java.util.List;

public final class NotificationMatrix {
    private NotificationMatrix() {}

    public record NotificationRoute(String eventType, String actor, String template, String deepLink, List<String> recipients) {}

    public static NotificationRoute route(String eventType) {
        return switch (eventType) {
            case "ORDER_CREATED" -> new NotificationRoute(eventType, "retailer", "ORDER_CREATED_FARM", "/orders/{id}", List.of("farm"));
            case "DEPOSIT_PAID" -> new NotificationRoute(eventType, "retailer", "DEPOSIT_PAID_FARM", "/orders/{id}", List.of("farm", "retailer"));
            case "SHIPMENT_CREATED" -> new NotificationRoute(eventType, "shipping_manager", "SHIPMENT_CREATED", "/shipments/{id}", List.of("farm", "retailer", "shipping_manager"));
            case "SHIPMENT_ASSIGNED" -> new NotificationRoute(eventType, "shipping_manager", "SHIPMENT_ASSIGNED", "/shipments/{id}", List.of("driver", "farm", "retailer"));
            case "SHIPMENT_PICKED_UP" -> new NotificationRoute(eventType, "driver", "SHIPMENT_PICKED_UP", "/shipments/{id}", List.of("farm", "retailer", "shipping_manager"));
            case "SHIPMENT_IN_TRANSIT" -> new NotificationRoute(eventType, "driver", "SHIPMENT_IN_TRANSIT", "/shipments/{id}", List.of("farm", "retailer", "shipping_manager"));
            case "SHIPMENT_DELIVERED" -> new NotificationRoute(eventType, "driver", "SHIPMENT_DELIVERED", "/shipments/{id}", List.of("farm", "retailer", "shipping_manager"));
            case "SHIPMENT_CANCELLED" -> new NotificationRoute(eventType, "shipping_manager", "SHIPMENT_CANCELLED", "/shipments/{id}", List.of("farm", "retailer", "shipping_manager"));
            case "DRIVER_ISSUE" -> new NotificationRoute(eventType, "driver", "DRIVER_ISSUE", "/shipments/{id}", List.of("admin", "shipping_manager", "farm", "retailer"));
            case "IOT_ALERT" -> new NotificationRoute(eventType, "system", "IOT_ALERT", "/iot-alerts/{id}", List.of("farm", "admin", "shipping_manager"));
            case "REPORT_CREATED" -> new NotificationRoute(eventType, "driver", "REPORT_CREATED", "/reports/{id}", List.of("admin", "shipping_manager", "farm", "retailer"));
            case "ANNOUNCEMENT_PUBLISHED" -> new NotificationRoute(eventType, "admin", "ANNOUNCEMENT", "/announcements", List.of("guest", "farm", "retailer", "driver", "shipping_manager", "admin"));
            default -> new NotificationRoute(eventType, "system", eventType, "/", List.of("admin"));
        };
    }
}
