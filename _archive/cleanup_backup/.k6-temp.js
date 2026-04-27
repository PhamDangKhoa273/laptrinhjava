import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const failRate = new Rate('fail_rate');
export const traceReadLatency = new Trend('trace_read_latency');
export const iotReadLatency = new Trend('iot_read_latency');
export const shipmentLatency = new Trend('shipment_latency');

export const options = {
  scenarios: {
    trace_reads: { executor: 'constant-arrival-rate', rate: 30, timeUnit: '1s', duration: '30s', preAllocatedVUs: 20, maxVUs: 60, exec: 'traceReads' },
    iot_reads: { executor: 'constant-arrival-rate', rate: 20, timeUnit: '1s', duration: '30s', preAllocatedVUs: 10, maxVUs: 30, exec: 'iotReads' },
    shipment_events: { executor: 'constant-arrival-rate', rate: 10, timeUnit: '1s', duration: '30s', preAllocatedVUs: 10, maxVUs: 30, exec: 'shipmentEvents' },
  },
  thresholds: { http_req_failed: ['rate<0.20'] },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const ADMIN_TOKEN = __ENV.ADMIN_TOKEN || '';
const SHIPPING_TOKEN = __ENV.SHIPPING_TOKEN || '';
const TRACE_CODE = __ENV.TRACE_CODE || 'TRACE-DEMO-001';

export function traceReads() {
  const res = http.get(`${BASE_URL}/api/v1/public/trace?traceCode=${encodeURIComponent(TRACE_CODE)}`);
  check(res, { 'trace ok': r => r.status === 200 });
  failRate.add(res.status >= 500);
  traceReadLatency.add(res.timings.duration);
}

export function iotReads() {
  const headers = ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : {};
  const res = http.get(`${BASE_URL}/api/v1/iot/alerts`, { headers });
  check(res, { 'iot ok': r => r.status === 200 || r.status === 401 || r.status === 403 });
  failRate.add(res.status >= 500);
  iotReadLatency.add(res.timings.duration);
}

export function shipmentEvents() {
  if (!SHIPPING_TOKEN) return;
  const payload = JSON.stringify({ status: 'IN_TRANSIT', note: 'benchmark', currentLocation: 'test', updatedAt: new Date().toISOString() });
  const res = http.patch(`${BASE_URL}/api/v1/shipments/1/status`, payload, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SHIPPING_TOKEN}` } });
  check(res, { 'shipment ok': r => r.status === 200 || r.status === 400 || r.status === 403 || r.status === 404 });
  failRate.add(res.status >= 500);
  shipmentLatency.add(res.timings.duration);
}
