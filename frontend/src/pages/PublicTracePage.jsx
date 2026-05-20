import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PublicShell } from '../components/public/PublicShell.jsx'
import { PublicState } from '../components/public/PublicState.jsx'
import { TraceTimeline } from '../components/public/TraceTimeline.jsx'
import { traceBatch, traceBatchByCode, verifyBatch } from '../services/phase3Service'
import { getErrorMessage } from '../utils/helpers'

function formatDate(value) {
  if (!value) return 'Chưa có'
  return new Date(value).toLocaleDateString('vi-VN')
}

function Info({ label, value }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value || 'Chưa có'}</strong>
    </div>
  )
}

function resolveBatchId(traceData, fallback) {
  return traceData?.batch?.batchId || traceData?.batch?.id || traceData?.batchId || Number(fallback) || null
}

function isLocalhostUrl(value) {
  try {
    const host = new URL(value).hostname
    return host === 'localhost' || host === '127.0.0.1'
  } catch {
    return false
  }
}

export function PublicTracePage() {
  const [batchId, setBatchId] = useState('')
  const [traceCode, setTraceCode] = useState('')
  const [traceResult, setTraceResult] = useState(null)
  const [verifyResult, setVerifyResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const { traceCode: routeTraceCode, batchId: routeBatchId } = useParams()
  const initializedRef = useRef(false)

  const resolvedTraceCode = traceResult?.qrInfo?.traceCode || traceResult?.batch?.traceCode || traceCode
  const browserTraceUrl = useMemo(() => {
    if (!resolvedTraceCode || typeof window === 'undefined') return ''
    return `${window.location.origin}/public/trace?traceCode=${encodeURIComponent(resolvedTraceCode)}`
  }, [resolvedTraceCode])
  const backendTraceUrl = traceResult?.qrInfo?.qrUrl || traceResult?.batch?.publicTraceUrl || ''
  const shownTraceUrl = browserTraceUrl || backendTraceUrl
  const qrUsesLocalhost = isLocalhostUrl(backendTraceUrl)

  const runTraceLookup = useCallback(async ({ nextBatchId = batchId, nextTraceCode = traceCode } = {}) => {
    if ((!String(nextBatchId).trim() || Number(nextBatchId) <= 0) && !String(nextTraceCode).trim()) return
    setLoading(true)
    setError('')
    setVerifyError('')
    try {
      const cleanTraceCode = String(nextTraceCode || '').trim()
      const traceData = cleanTraceCode ? await traceBatchByCode(cleanTraceCode) : await traceBatch(Number(nextBatchId), true)
      const resolvedBatchId = resolveBatchId(traceData, nextBatchId)
      let verifyData = null
      if (resolvedBatchId) {
        try {
          verifyData = await verifyBatch(resolvedBatchId)
        } catch (err) {
          setVerifyError(getErrorMessage(err, 'Đã tải truy xuất, nhưng tạm thời chưa xác minh được blockchain.'))
        }
      }
      setTraceResult(traceData)
      setVerifyResult(verifyData)
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể truy xuất lô hàng công khai.'))
      setTraceResult(null)
      setVerifyResult(null)
    } finally {
      setLoading(false)
    }
  }, [batchId, traceCode])

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    const params = new URLSearchParams(window.location.search)
    const initialBatchId = params.get('batchId') || routeBatchId || ''
    const initialTraceCode = params.get('traceCode') || routeTraceCode || ''
    if (initialBatchId && Number(initialBatchId) > 0) setBatchId(initialBatchId)
    if (initialTraceCode) setTraceCode(initialTraceCode)
    if (initialTraceCode || (initialBatchId && Number(initialBatchId) > 0)) {
      runTraceLookup({ nextBatchId: initialBatchId, nextTraceCode: initialTraceCode })
    }
  }, [routeBatchId, routeTraceCode, runTraceLookup])

  async function handleSubmit(event) {
    event.preventDefault()
    runTraceLookup()
  }

  const hasTrace = Boolean(traceResult?.batch)
  const batchCode = traceResult?.batch?.batchCode || traceResult?.batch?.batchId || traceResult?.batch?.id || 'Lô sản phẩm'
  const farmName = traceResult?.seasonInfo?.farmName || 'Nông trại đã ghi nhận'

  return (
    <PublicShell>
      {!hasTrace ? (
        <header className="proto-hero trace-lookup-hero">
          <div className="proto-hero-content">
            <span className="proto-kicker"><span className="material-symbols-outlined fill">qr_code_scanner</span> Xác minh QR công khai</span>
            <h1 className="proto-h1">Truy xuất nguồn gốc sản phẩm</h1>
            <form className="trace-search" onSubmit={handleSubmit}>
              <input id="trace-batch-id" type="number" min="1" placeholder="Mã lô" value={batchId} onChange={(event) => setBatchId(event.target.value)} />
              <input id="trace-code" placeholder="Mã truy xuất / mã QR" value={traceCode} onChange={(event) => setTraceCode(event.target.value)} />
              <button className="proto-btn-primary" type="submit" disabled={loading}>{loading ? 'Đang xác minh...' : 'Xác minh'}</button>
            </form>
            {error ? <div className="alert alert-error" style={{ marginTop: 18 }}>{error}</div> : null}
            {verifyError ? <div className="alert alert-error" style={{ marginTop: 12 }}>{verifyError}</div> : null}
          </div>
        </header>
      ) : null}

      {!hasTrace ? (
        <main className="proto-page">
          <PublicState title={loading ? 'Đang xác minh truy xuất...' : 'Sẵn sàng truy xuất'} message="Nhập mã lô hoặc mã QR ở phía trên để xem thông tin nguồn gốc công khai của sản phẩm." />
        </main>
      ) : (
        <main className="public-trace-result">
          <section className="trace-result-head">
            <span className="proto-kicker"><span className="material-symbols-outlined fill">verified</span> Truy xuất nguồn gốc</span>
            <h1>{batchCode}</h1>
            <p>{farmName} · {verifyResult?.matched ? 'Blockchain đã xác thực' : 'Dữ liệu đã ghi nhận'}</p>
          </section>

          {error ? <div className="alert alert-error trace-inline-alert">{error}</div> : null}
          {verifyError ? <div className="alert alert-error trace-inline-alert">{verifyError}</div> : null}

          <section className="trace-verify guest-safe">
            <div><span className="public-muted">Nguồn gốc</span><strong>{farmName}</strong></div>
            <div><span className="public-muted">Mã lô</span><strong>{batchCode}</strong></div>
            <div><span className="public-muted">Xác thực</span><strong>{verifyResult?.matched ? 'Đã xác thực' : 'Đã ghi nhận'}</strong></div>
          </section>

          <section className="trace-grid guest-trace-grid">
            <article className="trace-card">
              <h3>Nguồn gốc sản phẩm</h3>
              <div className="info-list">
                <Info label="Nông trại" value={farmName} />
                <Info label="Khu vực" value={traceResult.seasonInfo?.province || traceResult.batch?.province} />
                <Info label="Canh tác" value={traceResult.seasonInfo?.farmingMethod} />
                <Info label="Mã mùa vụ" value={traceResult.seasonInfo?.seasonCode} />
              </div>
            </article>

            <article className="trace-card">
              <h3>Chất lượng</h3>
              <div className="info-list">
                <Info label="Ngày thu hoạch" value={formatDate(traceResult.batch.harvestDate)} />
                <Info label="Hạng chất lượng" value={traceResult.batch.qualityGrade} />
                <Info label="Trạng thái lô" value={traceResult.batch.batchStatus} />
                <Info label="QR truy xuất" value={traceResult.qrInfo?.qrValue ? 'Đã phát hành' : 'Chưa phát hành'} />
              </div>
            </article>

            <article className="trace-card">
              <h3>Mã QR truy xuất</h3>
              <div className="info-list">
                <Info label="Mã truy xuất" value={resolvedTraceCode || 'Chưa có'} />
                <Info label="Đường dẫn" value={shownTraceUrl || 'Chưa có'} />
              </div>
              {traceResult.qrInfo?.qrImageBase64 ? (
                <img alt="QR truy xuất sản phẩm" src={`data:image/png;base64,${traceResult.qrInfo.qrImageBase64}`} className="trace-qr-image" />
              ) : (
                <span className="material-symbols-outlined trace-qr-placeholder">qr_code_2</span>
              )}
              {qrUsesLocalhost ? (
                <div className="trace-qr-warning">
                  <span className="material-symbols-outlined">wifi_tethering_error</span>
                  <p>QR đang trỏ về localhost. Điện thoại chỉ quét được khi URL dùng IP LAN của máy chạy Docker.</p>
                </div>
              ) : null}
              {shownTraceUrl ? <a className="trace-open-link" href={shownTraceUrl} target="_blank" rel="noreferrer">Mở đường dẫn truy xuất</a> : null}
            </article>

            <article className="trace-card">
              <h3>Nhật ký sản xuất</h3>
              <TraceTimeline items={traceResult.processList || traceResult.timeline || []} emptyMessage="Chưa có nhật ký sản xuất công khai cho lô hàng này." />
              {traceResult.note ? <p className="public-muted">{traceResult.note}</p> : null}
            </article>
          </section>
        </main>
      )}
    </PublicShell>
  )
}
