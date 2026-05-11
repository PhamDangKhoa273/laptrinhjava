param(
  [string]$BaseUrl = "http://localhost:8080"
)
Write-Host "Use k6/JMeter/Gatling against $BaseUrl"
Write-Host "Scenarios: trace reads, IoT writes, order/shipment events"
Write-Host "Metrics: p95, fail ratio, tx retry count, worker lag"
