import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PublicShell } from '../components/public/PublicShell.jsx'
import { PublicState } from '../components/public/PublicState.jsx'
import { TraceTimeline } from '../components/public/TraceTimeline.jsx'
import { traceBatch, traceBatchByCode, verifyBatch } from '../services/phase3Service'
import { getErrorMessage } from '../utils/helpers'

function formatDate(value) { return value ? new Date(value).toLocaleDateString('vi-VN') : 'Chưa có' }
function Info({ label, value }) { return <div className="info-row"><span>{label}</span><strong>{value || 'Chưa có'}</strong></div> }
function resolveBatchId(traceData, fallback) { return traceData?.batch?.batchId || traceData?.batch?.id || traceData?.batchId || Number(fallback) || null }

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

  const runTraceLookup = useCallback(async ({ nextBatchId = batchId, nextTraceCode = traceCode } = {}) => {
    if ((!String(nextBatchId).trim() || Number(nextBatchId) <= 0) && !String(nextTraceCode).trim()) return
    setLoading(true); setError(''); setVerifyError('')
    try {
      const cleanTraceCode = String(nextTraceCode || '').trim()
      const traceData = cleanTraceCode ? await traceBatchByCode(cleanTraceCode) : await traceBatch(Number(nextBatchId), true)
      const resolvedBatchId = resolveBatchId(traceData, nextBatchId)
      let verifyData = null
      if (resolvedBatchId) {
        try { verifyData = await verifyBatch(resolvedBatchId) }
        catch (err) { setVerifyError(getErrorMessage(err, 'Đã tải truy xuất, nhưng tạm thời chưa xác minh được blockchain.')) }
      }
      setTraceResult(traceData); setVerifyResult(verifyData)
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể truy xuất lô hàng công khai.'))
      setTraceResult(null); setVerifyResult(null)
    } finally { setLoading(false) }
  }, [batchId, traceCode])

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    const params = new URLSearchParams(window.location.search)
    const initialBatchId = params.get('batchId') || routeBatchId || ''
    const initialTraceCode = params.get('traceCode') || routeTraceCode || ''
    if (initialBatchId && Number(initialBatchId) > 0) setBatchId(initialBatchId)
    if (initialTraceCode) setTraceCode(initialTraceCode)
    if (initialTraceCode || (initialBatchId && Number(initialBatchId) > 0)) runTraceLookup({ nextBatchId: initialBatchId, nextTraceCode: initialTraceCode })
  }, [routeBatchId, routeTraceCode, runTraceLookup])

  async function handleSubmit(event) { event.preventDefault(); runTraceLookup() }

  return (
    <PublicShell>
      <header className="proto-hero"><div className="proto-hero-content"><span className="proto-kicker"><span className="material-symbols-outlined fill">qr_code_scanner</span> Xác minh QR công khai</span><h1 className="proto-h1">Truy xuất nguồn gốc sản phẩm</h1><form className="trace-search" onSubmit={handleSubmit}><input id="trace-batch-id" type="number" min="1" placeholder="Mã lô" value={batchId} onChange={(e) => setBatchId(e.target.value)} /><input id="trace-code" placeholder="Mã truy xuất / mã QR" value={traceCode} onChange={(e) => setTraceCode(e.target.value)} /><button className="proto-btn-primary" type="submit" disabled={loading}>{loading ? 'Đang xác minh...' : 'Xác minh'}</button></form>{error ? <div className="alert alert-error" style={{ marginTop: 18 }}>{error}</div> : null}{verifyError ? <div className="alert alert-error" style={{ marginTop: 12 }}>{verifyError}</div> : null}</div></header>
      {!traceResult?.batch ? <main className="proto-page"><PublicState title={loading ? 'Đang xác minh truy xuất...' : 'Sẵn sàng truy xuất'} message="Nhập mã lô hoặc mã QR ở phía trên để xem thông tin nguồn gốc công khai của sản phẩm." /></main> : <><section className="trace-verify guest-safe"><div><span className="public-muted">Nguồn gốc</span><strong>{traceResult.seasonInfo?.farmName || 'Đã ghi nhận'}</strong></div><div><span className="public-muted">Mã lô công khai</span><strong>{traceResult.batch.batchCode || traceResult.batch.batchId || traceResult.batch.id}</strong></div><div><span className="public-muted">Xác thực dữ liệu</span><strong>{verifyResult?.matched ? 'ĐÃ XÁC THỰC' : 'ĐÃ GHI NHẬN'}</strong></div></section><section className="trace-grid guest-trace-grid"><article className="trace-card"><h3>Nguồn gốc sản phẩm</h3><div className="info-list"><Info label="Nông trại" value={traceResult.seasonInfo?.farmName} /><Info label="Khu vực" value={traceResult.seasonInfo?.province || traceResult.batch?.province} /><Info label="Phương pháp canh tác" value={traceResult.seasonInfo?.farmingMethod} /><Info label="Mã mùa vụ công khai" value={traceResult.seasonInfo?.seasonCode} /></div></article><article className="trace-card"><h3>Thông tin chất lượng</h3><div className="info-list"><Info label="Ngày thu hoạch" value={formatDate(traceResult.batch.harvestDate)} /><Info label="Hạng chất lượng" value={traceResult.batch.qualityGrade} /><Info label="Trạng thái lô" value={traceResult.batch.batchStatus} /><Info label="QR truy xuất" value={traceResult.qrInfo?.qrValue ? 'Đã phát hành' : 'Chưa phát hành'} /></div></article><article className="trace-card"><h3>Mã QR truy xuất</h3><div className="info-list"><Info label="Mã truy xuất" value={traceResult.qrInfo?.traceCode || traceResult.batch?.traceCode || 'Chưa có'} /><Info label="Đường dẫn công khai" value={traceResult.qrInfo?.qrUrl || traceResult.batch?.publicTraceUrl || 'Chưa có'} /></div>{traceResult.qrInfo?.qrImageBase64 ? <img alt="QR truy xuất sản phẩm" src={`data:image/png;base64,${traceResult.qrInfo.qrImageBase64}`} style={{ maxWidth: 180, marginTop: 12 }} /> : <span className="material-symbols-outlined" style={{ fontSize: 120, color: 'var(--proto-line-2)' }}>qr_code_2</span>}</article><article className="trace-card"><h3>Nhật ký sản xuất công khai</h3><TraceTimeline items={traceResult.processList || traceResult.timeline || []} emptyMessage="Chưa có nhật ký sản xuất công khai cho lô hàng này." />{traceResult.note ? <p className="public-muted">{traceResult.note}</p> : null}</article></section></>}
    </PublicShell>
  )
}
