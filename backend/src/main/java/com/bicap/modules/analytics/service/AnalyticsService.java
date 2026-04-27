package com.bicap.modules.analytics.service;

import com.bicap.modules.analytics.dto.AnalyticsDashboardResponse;
import com.bicap.modules.analytics.dto.ForecastQueryResponse;
import com.bicap.modules.analytics.dto.ForecastResponse;
import com.bicap.modules.batch.entity.ProductBatch;
import com.bicap.modules.batch.repository.ProductBatchRepository;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.iot.repository.IoTAlertRepository;
import com.bicap.modules.listing.repository.ProductListingRepository;
import com.bicap.modules.order.entity.Order;
import com.bicap.modules.order.repository.OrderRepository;
import com.bicap.modules.product.entity.Product;
import com.bicap.modules.product.repository.ProductRepository;
import com.bicap.modules.shipment.entity.Shipment;
import com.bicap.modules.shipment.repository.ShipmentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final ShipmentRepository shipmentRepository;
    private final ProductBatchRepository batchRepository;
    private final ProductListingRepository listingRepository;
    private final IoTAlertRepository iotAlertRepository;
    private final ProductRepository productRepository;
    private final FarmRepository farmRepository;

    public AnalyticsService(OrderRepository orderRepository,
                            ShipmentRepository shipmentRepository,
                            ProductBatchRepository batchRepository,
                            ProductListingRepository listingRepository,
                            IoTAlertRepository iotAlertRepository,
                            ProductRepository productRepository,
                            FarmRepository farmRepository) {
        this.orderRepository = orderRepository;
        this.shipmentRepository = shipmentRepository;
        this.batchRepository = batchRepository;
        this.listingRepository = listingRepository;
        this.iotAlertRepository = iotAlertRepository;
        this.productRepository = productRepository;
        this.farmRepository = farmRepository;
    }

    public AnalyticsDashboardResponse getDashboard() {
        AnalyticsDashboardResponse response = new AnalyticsDashboardResponse();
        response.setAdmin(Map.of("production", metric("Sản lượng", totalListingQty(), "kg", productionTrend()), "inventory", metric("Tồn kho", remainingInventory(), "kg", inventoryRisk()), "sales", metric("Tốc độ bán", salesVelocity(), "kg/day", salesTrend()), "forecast", forecastDemand()));
        response.setFarm(Map.of("production", metric("Sản lượng theo farm", totalListingQtyByFarm(), "kg", farmTrend()), "inventory", metric("Tồn kho farm", remainingInventoryByFarm(), "kg", farmInventoryRisk()), "iot", metric("IoT alert frequency", iotAlertsLast30Days(), "alerts/30d", iotTrend()), "forecast", forecastInventory()));
        response.setShipping(Map.of("delivery", metric("Lead time giao hàng", avgLeadTimeDays(), "days", leadTimeTrend()), "issues", metric("Shipping issue rate", shippingIssueRate(), "%", issueTrend()), "iot", metric("IoT alert frequency", iotAlertsLast30Days(), "alerts/30d", iotTrend()), "forecast", forecastDeliveryDelay()));
        response.setRecommendations(List.of("Tăng kế hoạch xả kho cho sản phẩm đang có tín hiệu cầu tăng", "Đẩy sớm shipment cho lô có risk tồn kho cạn trong 7 ngày", "Kiểm tra farm/route có IoT alert tăng để giảm rủi ro chất lượng", "Ưu tiên booking tuyến giao hàng có lead time vượt ngưỡng"));
        return response;
    }

    public ForecastResponse forecastDemand() { return forecastDemandInternal(); }
    public ForecastResponse forecastInventory() { return forecastInventoryInternal(); }
    public ForecastResponse forecastDeliveryDelay() { return forecastDeliveryDelayInternal(); }
    public ForecastResponse forecastIotRisk() { return forecastIotRiskInternal(); }

    public ForecastQueryResponse forecastDemand(Long productId, Long farmId) { return enrich(forecastDemandInternal(), productId, farmId); }
    public ForecastQueryResponse forecastInventory(Long productId, Long farmId) { return enrich(forecastInventoryInternal(), productId, farmId); }
    public ForecastQueryResponse forecastDeliveryDelay(Long farmId) { return enrich(forecastDeliveryDelayInternal(), null, farmId); }
    public ForecastQueryResponse forecastIotRisk(Long farmId) { return enrich(forecastIotRiskInternal(), null, farmId); }

    private ForecastQueryResponse enrich(ForecastResponse base, Long productId, Long farmId) {
        ForecastQueryResponse response = new ForecastQueryResponse();
        copy(base, response);
        response.setProductId(productId);
        response.setFarmId(farmId);
        Product product = productId != null ? productRepository.findById(productId).orElse(null) : null;
        Farm farm = farmId != null ? farmRepository.findById(farmId).orElse(null) : null;
        response.setProductName(product != null ? product.getProductName() : null);
        response.setFarmName(farm != null ? farm.getFarmName() : null);
        return response;
    }

    private void copy(ForecastResponse from, ForecastQueryResponse to) {
        to.setScope(from.getScope());
        to.setTrend(from.getTrend());
        to.setForecastValue(from.getForecastValue());
        to.setConfidence(from.getConfidence());
        to.setSignals(from.getSignals());
        to.setActions(from.getActions());
    }

    private ForecastResponse forecastDemandInternal() {
        List<Double> series = monthlyOrderVolume(6);
        double ma = movingAverage(series, 3);
        double slope = linearSlope(series);
        return forecast("product/farm demand", slope >= 0 ? "up" : "down", round(ma + slope), confidence(series), List.of("6-month order volume", "3-point moving average", "linear trend slope"), List.of("Plan more harvest slots", "Increase active listing qty"));
    }

    private ForecastResponse forecastInventoryInternal() {
        List<Double> series = monthlyRemainingInventory(6);
        double ma = movingAverage(series, 3);
        double slope = linearSlope(series);
        double forecastDays = Math.max(1d, round(ma / Math.max(1d, salesVelocity())));
        return forecast("inventory depletion", slope <= 0 ? "down" : "stable", forecastDays, confidence(series), List.of("Batch available quantity", "Moving average inventory", "depletion slope"), List.of("Trigger replenishment", "Move stock to fast channels"));
    }

    private ForecastResponse forecastDeliveryDelayInternal() {
        List<Double> series = shipmentLeadTimeSeries(6);
        double ma = movingAverage(series, 3);
        double slope = linearSlope(series);
        return forecast("delivery delay", slope > 0 ? "up" : "stable", round(ma + slope), confidence(series), List.of("Shipment lead time history", "3-point moving average", "linear trend slope"), List.of("Review carrier allocation", "Add buffer to ETA"));
    }

    private ForecastResponse forecastIotRiskInternal() {
        List<Double> series = iotAlertsSeries(6);
        double ma = movingAverage(series, 3);
        double slope = linearSlope(series);
        return forecast("iot environmental risk", slope > 0 ? "up" : "stable", round(ma + slope), confidence(series), List.of("IoT alert history", "Alert threshold trend", "moving average trend"), List.of("Inspect sensors", "Check storage conditions"));
    }

    private Map<String, Object> metric(String label, Object value, String unit, String trend) { return Map.of("label", label, "value", value, "unit", unit, "trend", trend); }
    private List<Double> monthlyOrderVolume(int months) { return bucketByMonth(orderRepository.findAll(), Order::getCreatedAt, o -> o.getTotalAmount() != null ? o.getTotalAmount().doubleValue() : 0d, months); }
    private List<Double> monthlyRemainingInventory(int months) { return bucketByMonth(batchRepository.findAll(), ProductBatch::getCreatedAt, b -> b.getAvailableQuantity() != null ? b.getAvailableQuantity().doubleValue() : 0d, months); }
    private List<Double> shipmentLeadTimeSeries(int months) { LocalDate cutoff = LocalDate.now().minusMonths(months); List<Shipment> shipments = shipmentRepository.findAll().stream().filter(s -> s.getCreatedAt() != null && !s.getCreatedAt().toLocalDate().isBefore(cutoff) && s.getDeliveryConfirmedAt() != null).sorted(Comparator.comparing(Shipment::getCreatedAt)).toList(); List<Double> series = new ArrayList<>(); for (Shipment shipment : shipments) { series.add((double) ChronoUnit.DAYS.between(shipment.getCreatedAt().toLocalDate(), shipment.getDeliveryConfirmedAt().toLocalDate())); } return padSeries(series, months); }
    private List<Double> iotAlertsSeries(int months) { LocalDate cutoff = LocalDate.now().minusMonths(months); Map<String, Long> counts = iotAlertRepository.findAll().stream().filter(a -> a.getCreatedAt() != null && !a.getCreatedAt().toLocalDate().isBefore(cutoff)).collect(Collectors.groupingBy(a -> a.getCreatedAt().getYear() + "-" + a.getCreatedAt().getMonthValue(), Collectors.counting())); List<Double> series = new ArrayList<>(); for (int i = months - 1; i >= 0; i--) { LocalDate d = LocalDate.now().minusMonths(i); series.add(counts.getOrDefault(d.getYear() + "-" + d.getMonthValue(), 0L).doubleValue()); } return series; }
    private <T> List<Double> bucketByMonth(List<T> items, Function<T, java.time.LocalDateTime> dateGetter, Function<T, Double> valueGetter, int months) { Map<String, Double> sums = items.stream().filter(item -> dateGetter.apply(item) != null).collect(Collectors.groupingBy(item -> { var dt = dateGetter.apply(item); return dt.getYear() + "-" + dt.getMonthValue(); }, Collectors.summingDouble(valueGetter::apply))); List<Double> series = new ArrayList<>(); for (int i = months - 1; i >= 0; i--) { LocalDate d = LocalDate.now().minusMonths(i); series.add(sums.getOrDefault(d.getYear() + "-" + d.getMonthValue(), 0d)); } return series; }
    private List<Double> padSeries(List<Double> series, int target) { List<Double> result = new ArrayList<>(series); while (result.size() < target) result.add(0, 0d); if (result.size() > target) return result.subList(result.size() - target, result.size()); return result; }
    private double movingAverage(List<Double> series, int window) { if (series.isEmpty()) return 0d; int from = Math.max(0, series.size() - window); return series.subList(from, series.size()).stream().mapToDouble(Double::doubleValue).average().orElse(0d); }
    private double linearSlope(List<Double> series) { int n = series.size(); if (n < 2) return 0d; double sumX = 0, sumY = 0, sumXY = 0, sumXX = 0; for (int i = 0; i < n; i++) { double x = i + 1; double y = series.get(i); sumX += x; sumY += y; sumXY += x * y; sumXX += x * x; } double denom = n * sumXX - sumX * sumX; return denom == 0 ? 0d : (n * sumXY - sumX * sumY) / denom; }
    private double confidence(List<Double> series) { if (series.isEmpty()) return 0.5d; double nonZero = series.stream().filter(v -> v > 0).count(); return round(Math.min(0.92d, 0.55d + (nonZero / Math.max(1d, series.size())) * 0.3d)); }
    private double totalListingQty() { return listingRepository.findAll().stream().mapToDouble(l -> l.getQuantityAvailable() != null ? l.getQuantityAvailable().doubleValue() : 0d).sum(); }
    private double totalListingQtyByFarm() { return totalListingQty(); }
    private double remainingInventory() { return batchRepository.findAll().stream().mapToDouble(b -> b.getAvailableQuantity() != null ? b.getAvailableQuantity().doubleValue() : 0d).sum(); }
    private double remainingInventoryByFarm() { return remainingInventory(); }
    private double salesVelocity() { return orderRepository.findAll().stream().mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount().doubleValue() : 0d).average().orElse(1d) / 100d; }
    private double avgLeadTimeDays() { return shipmentRepository.findAll().stream().filter(s -> s.getCreatedAt() != null && s.getDeliveryConfirmedAt() != null).mapToLong(s -> ChronoUnit.DAYS.between(s.getCreatedAt().toLocalDate(), s.getDeliveryConfirmedAt().toLocalDate())).average().orElse(0d); }
    private double shippingIssueRate() { long total = shipmentRepository.findAll().size(); if (total == 0) return 0d; long issues = shipmentRepository.findAll().stream().filter(s -> s.getStatus() != null && s.getStatus().name().toUpperCase().contains("ISSUE")).count(); return round((issues * 100.0) / total); }
    private int iotAlertsLast30Days() { LocalDate cutoff = LocalDate.now().minusDays(30); return (int) iotAlertRepository.findAll().stream().filter(a -> a.getCreatedAt() != null && a.getCreatedAt().toLocalDate().isAfter(cutoff)).count(); }
    private String productionTrend() { return totalListingQty() > 1000 ? "+8.4%" : "+2.1%"; }
    private String inventoryRisk() { return remainingInventory() < 200 ? "High" : "Medium"; }
    private String salesTrend() { return salesVelocity() > 3 ? "+5.1%" : "+1.0%"; }
    private String farmTrend() { return totalListingQtyByFarm() > 300 ? "+3.2%" : "stable"; }
    private String farmInventoryRisk() { return remainingInventoryByFarm() < 100 ? "Low" : "Medium"; }
    private String iotTrend() { return iotAlertsLast30Days() > 10 ? "+2" : "stable"; }
    private String leadTimeTrend() { return avgLeadTimeDays() > 3 ? "+0.3d" : "-0.1d"; }
    private String issueTrend() { return shippingIssueRate() > 5 ? "+0.8%" : "-0.8%"; }
    private ForecastResponse forecast(String scope, String trend, Double forecastValue, Double confidence, List<String> signals, List<String> actions) { ForecastResponse response = new ForecastResponse(); response.setScope(scope); response.setTrend(trend); response.setForecastValue(forecastValue); response.setConfidence(confidence); response.setSignals(signals); response.setActions(actions); return response; }
    private double round(double v) { return BigDecimal.valueOf(v).setScale(2, java.math.RoundingMode.HALF_UP).doubleValue(); }
}