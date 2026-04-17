/*
 * IoT simulation script for Producer module.
 * Sends temperature/humidity payloads every 30 minutes by default.
 *
 * Run:
 *   node docs/iot-simulator.js --batchId=1 --seasonId=1 --farmId=1
 * Optional:
 *   --intervalMinutes=30
 *   --endpoint=http://localhost:8080/api/v1/iot/readings/mock
 */

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.replace(/^--/, '').split('=')
    return [key, value ?? '']
  }),
)

const batchId = Number(args.batchId || 1)
const seasonId = Number(args.seasonId || 1)
const farmId = Number(args.farmId || 1)
const intervalMinutes = Number(args.intervalMinutes || 30)
const endpoint = args.endpoint || ''

function randomBetween(min, max, fractionDigits = 1) {
  const value = Math.random() * (max - min) + min
  return Number(value.toFixed(fractionDigits))
}

function buildPayload() {
  return {
    farmId,
    seasonId,
    batchId,
    sensorId: `SIM-${farmId}-${seasonId}-${batchId}`,
    timestamp: new Date().toISOString(),
    temperatureC: randomBetween(18, 35),
    humidityPercent: randomBetween(55, 90),
    status: 'RECORDED',
    source: 'IOT_SIMULATION',
  }
}

async function emitReading() {
  const payload = buildPayload()
  console.log(`[${new Date().toLocaleString('vi-VN')}] IoT payload:`, JSON.stringify(payload))

  if (!endpoint) {
    return
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const text = await response.text()
    console.log(`-> POST ${endpoint} | status=${response.status} | body=${text}`)
  } catch (error) {
    console.error(`-> POST ${endpoint} failed:`, error.message)
  }
}

console.log('Starting IoT simulator with config:', {
  farmId,
  seasonId,
  batchId,
  intervalMinutes,
  endpoint: endpoint || '(console only)',
})

emitReading()
setInterval(emitReading, intervalMinutes * 60 * 1000)
