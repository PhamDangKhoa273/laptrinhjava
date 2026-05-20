import { useEffect, useMemo, useState } from 'react'
import '../shipping-workspace.css'
import {
  generateBatchQr,
  getBatches,
  getSeasons,
  traceBatch,
  verifyBatch,
} from '../services/phase3Service'
import { exportSeason, getLatestSeasonExport } from '../services/seasonExportService'
import { getErrorMessage } from '../utils/helpers'

function Icon({ children, fill = false }) {
  return <span className={`material-symbols-outlined${fill ? ' fill' : ''}`}>{children}</span>
}

function Status({ value }) {
  const key = String(value || 'PLANNED').toLowerCase()
  return <span className={`ship-status ${key}`}>{value || 'PLANNED'}</span>
}

function Metric({ icon, label, value, tone = 'green' }) {
  return (
    <article className={`ship-metric ${tone}`}>
      <div><Icon fill>{icon}</Icon></div>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  )
}

function fmtDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('vi-VN')
}

function fmtDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('vi-VN')
}

function shortHash(value) {
  if (!value) return '-'
  const text = String(value)
  if (text.length <= 18) return text
  return `${text.slice(0, 10)}...${text.slice(-8)}`
}

function InfoItem({ label, value, mono = false }) {
  return (
    <div style={{ display: 'grid', gap: 4, minWidth: 0 }}>
      <span style={{ color: '#64748b', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>{label}</span>
      <strong style={{ color: '#0f172a', fontSize: 15, overflowWrap: 'anywhere', fontFamily: mono ? 'ui-monospace, SFMono-Regular, Consolas, monospace' : undefined }}>{value || '-'}</strong>
    </div>
  )
}

function TracePanel({ title, icon, children }) {
  return (
    <section style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, background: '#fff', display: 'grid', gap: 14, alignContent: 'start' }}>
      <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
        <Icon>{icon}</Icon>{title}
      </h4>
      {children}
    </section>
  )
}

export function FarmExportQrPage() {
  const [seasons, setSeasons] = useState([])
  const [batches, setBatches] = useState([])
  const [seasonExports, setSeasonExports] = useState({})
  const [exportingSeasonId, setExportingSeasonId] = useState('')
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [trace, setTrace] = useState(null)
  const [verifyResult, setVerifyResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true)
    try {
      const [seasonList, batchList] = await Promise.all([getSeasons(), getBatches()])
      const seasonArr = Array.isArray(seasonList) ? seasonList : []
      setSeasons(seasonArr)
      setBatches(Array.isArray(batchList) ? batchList : [])
      const exportables = seasonArr.filter((s) => ['HARVESTED', 'COMPLETED'].includes(s.seasonStatus))
      const results = await Promise.all(
        exportables.map((s) => getLatestSeasonExport(s.id).then((data) => [s.id, data]).catch(() => [s.id, null])),
      )
      const nextExports = {}
      results.forEach(([id, data]) => { if (data) nextExports[String(id)] = data })
      setSeasonExports(nextExports)
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được dữ liệu QR và truy xuất.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const stats = useMemo(() => {
    const exportable = seasons.filter((s) => ['HARVESTED', 'COMPLETED'].includes(s.seasonStatus)).length
    const exported = Object.keys(seasonExports).length
    const qrIssued = batches.filter((b) => b.publicTraceUrl || b.traceCode).length
    return { exportable, exported, qrIssued, totalBatches: batches.length }
  }, [seasons, batches, seasonExports])

  async function handleExport(seasonId) {
    setExportingSeasonId(String(seasonId))
    setError('')
    setSuccess('')
    try {
      const result = await exportSeason(seasonId)
      setSeasonExports((prev) => ({ ...prev, [String(seasonId)]: result }))
      setSuccess('Đã xuất mùa vụ và sinh QR.')
    } catch (err) {
      setError(getErrorMessage(err, 'Không xuất được mùa vụ.'))
    } finally {
      setExportingSeasonId('')
    }
  }

  async function handleGenerateQr(batchId) {
    setError('')
    setSuccess('')
    try {
      const qr = await generateBatchQr(batchId)
      setSuccess(`Đã tạo QR cho lô #${batchId}.`)
      setBatches((prev) => prev.map((b) => (b.batchId === batchId ? { ...b, traceCode: qr.traceCode, publicTraceUrl: qr.qrUrl } : b)))
    } catch (err) {
      setError(getErrorMessage(err, 'Không tạo được QR.'))
    }
  }

  async function handleViewTrace(batchId) {
    setSelectedBatchId(String(batchId))
    setError('')
    setSuccess('')
    const [traceData, verify] = await Promise.allSettled([traceBatch(batchId), verifyBatch(batchId)])
    setTrace(traceData.status === 'fulfilled' ? traceData.value : null)
    setVerifyResult(verify.status === 'fulfilled' ? verify.value : null)
    if (traceData.status !== 'fulfilled') setError('Không tải được hồ sơ truy xuất.')
  }

  async function handleCopy(text) {
    if (!text || !navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(text)
      setSuccess('Đã copy vào clipboard.')
    } catch {
      setError('Clipboard không khả dụng.')
    }
  }

  const exportableSeasons = seasons.filter((s) => ['HARVESTED', 'COMPLETED'].includes(s.seasonStatus))
  const publicUrl = trace?.qrInfo?.qrUrl || trace?.batch?.publicTraceUrl || ''
  const qrImage = trace?.qrInfo?.qrImageBase64

  return (
    <section className="shipping-prototype-shell">
      <div className="ship-page-head">
        <div>
          <p>Farm / Sản xuất / QR truy xuất</p>
          <h2>Xuất QR & truy xuất nguồn gốc</h2>
          <span>Quản lý QR theo lô hàng, kiểm tra blockchain và xem nhật ký sản xuất công khai.</span>
        </div>
        <div className="ship-actions">
          <button type="button" onClick={load} disabled={loading}><Icon>refresh</Icon>{loading ? 'Đang tải...' : 'Làm mới'}</button>
        </div>
      </div>

      {loading ? <div className="ship-alert neutral">Đang tải dữ liệu QR và truy xuất...</div> : null}
      {error ? <div className="ship-alert danger">{error}</div> : null}
      {success ? <div className="ship-alert success">{success}</div> : null}

      <section className="ship-metrics four">
        <Metric icon="file_export" label="Mùa vụ có thể xuất" value={stats.exportable} tone="blue" />
        <Metric icon="task_alt" label="Đã xuất" value={stats.exported} />
        <Metric icon="qr_code_2" label="Lô có QR" value={`${stats.qrIssued}/${stats.totalBatches}`} tone="amber" />
        <Metric icon="travel_explore" label="Đang xem" value={selectedBatchId ? `#${selectedBatchId}` : '-'} />
      </section>

      <article className="ship-card">
        <div className="ship-card-head">
          <h3><Icon>file_export</Icon>Xuất mùa vụ</h3>
        </div>
        {exportableSeasons.length === 0 ? (
          <p>Chưa có mùa vụ ở trạng thái HARVESTED hoặc COMPLETED. <a href="/farm/seasons">Cập nhật mùa vụ</a> trước.</p>
        ) : (
          <div className="ship-table-wrap">
            <table className="ship-table">
              <thead>
                <tr><th>Mã mùa vụ</th><th>Trạng thái</th><th>Thu hoạch</th><th>Export</th><th>Trace URL</th><th></th></tr>
              </thead>
              <tbody>
                {exportableSeasons.map((season) => {
                  const exp = seasonExports[String(season.id)]
                  return (
                    <tr key={season.id}>
                      <td><b>{season.seasonCode}</b><small>ID #{season.id}</small></td>
                      <td><Status value={season.seasonStatus} /></td>
                      <td>{fmtDate(season.actualHarvestDate || season.expectedHarvestDate)}</td>
                      <td>{exp ? `${fmtDateTime(exp.exportedAt)} - ${exp.batchCount || 0} lô` : 'Chưa xuất'}</td>
                      <td>{exp?.publicTraceUrl ? <a href={exp.publicTraceUrl} target="_blank" rel="noreferrer">{shortHash(exp.publicTraceUrl)}</a> : '-'}</td>
                      <td>
                        <button type="button" onClick={() => handleExport(season.id)} disabled={exportingSeasonId === String(season.id)}>
                          <Icon>file_export</Icon>{exportingSeasonId === String(season.id) ? 'Đang xuất...' : (exp ? 'Xuất lại' : 'Xuất + sinh QR')}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <article className="ship-card" style={{ marginTop: 24 }}>
        <div className="ship-card-head">
          <h3><Icon>qr_code_2</Icon>Lô hàng & QR</h3>
        </div>
        {batches.length === 0 ? (
          <p>Chưa có lô hàng. <a href="/farm/packages">Tạo lô hàng</a> trước.</p>
        ) : (
          <div className="ship-table-wrap">
            <table className="ship-table">
              <thead>
                <tr><th>Mã lô</th><th>Mùa vụ</th><th>Còn lại (kg)</th><th>Trạng thái</th><th>Mã truy xuất</th><th></th></tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.batchId} style={String(selectedBatchId) === String(batch.batchId) ? { background: '#f8fbf7' } : undefined}>
                    <td><b>{batch.batchCode}</b><small>ID #{batch.batchId}</small></td>
                    <td>#{batch.seasonId}</td>
                    <td>{Number(batch.availableQuantity || 0).toLocaleString('vi-VN')}</td>
                    <td><Status value={batch.batchStatus} /></td>
                    <td>{batch.traceCode || <span style={{ opacity: .55 }}>Chưa có</span>}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {!batch.traceCode ? <button type="button" onClick={() => handleGenerateQr(batch.batchId)} title="Tạo QR"><Icon>qr_code_2</Icon></button> : null}
                        <button type="button" onClick={() => handleViewTrace(batch.batchId)} title="Xem truy xuất"><Icon>visibility</Icon></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {trace?.batch ? (
        <article className="ship-card" style={{ marginTop: 24 }}>
          <div className="ship-card-head">
            <h3><Icon>travel_explore</Icon>{trace.batch.batchCode}</h3>
            {verifyResult ? <span className={verifyResult.matched ? 'success-pill' : 'danger-pill'}>{verifyResult.matched ? 'Blockchain khớp' : 'Blockchain lệch'}</span> : null}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 280px) minmax(0, 1fr)', gap: 20, alignItems: 'start' }}>
            <aside style={{ border: '1px solid #dbe7d8', borderRadius: 14, background: '#f8fbf7', padding: 18, display: 'grid', justifyItems: 'center', gap: 14 }}>
              {qrImage ? (
                <img alt="QR truy xuất" src={`data:image/png;base64,${qrImage}`} style={{ width: 180, height: 180, objectFit: 'contain', background: '#fff', borderRadius: 8, padding: 8 }} />
              ) : (
                <div style={{ width: 180, height: 180, borderRadius: 8, background: '#fff', border: '1px dashed #cbd5e1', display: 'grid', placeItems: 'center', color: '#64748b', textAlign: 'center', fontWeight: 800 }}>Chưa có ảnh QR</div>
              )}
              <strong style={{ color: '#0d631b', textAlign: 'center', overflowWrap: 'anywhere' }}>{trace.qrInfo?.traceCode || trace.batch.traceCode || '-'}</strong>
              {publicUrl ? (
                <button type="button" onClick={() => handleCopy(publicUrl)} style={{ borderRadius: 10 }}>
                  <Icon>content_copy</Icon>Copy URL
                </button>
              ) : null}
            </aside>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
              <TracePanel title="Lô hàng" icon="inventory_2">
                <InfoItem label="Trạng thái" value={trace.batch.batchStatus} />
                <InfoItem label="Thu hoạch" value={fmtDate(trace.batch.harvestDate)} />
                <InfoItem label="Chất lượng" value={trace.batch.qualityGrade || '-'} />
                <InfoItem label="Số lượng còn lại" value={`${Number(trace.batch.availableQuantity || 0).toLocaleString('vi-VN')}/${Number(trace.batch.quantity || 0).toLocaleString('vi-VN')} kg`} />
              </TracePanel>

              <TracePanel title="Mùa vụ" icon="eco">
                <InfoItem label="Mã mùa vụ" value={trace.seasonInfo?.seasonCode} />
                <InfoItem label="Nông trại" value={trace.seasonInfo?.farmName} />
                <InfoItem label="Canh tác" value={trace.seasonInfo?.farmingMethod || '-'} />
                <InfoItem label="Bắt đầu" value={fmtDate(trace.seasonInfo?.startDate)} />
              </TracePanel>

              <TracePanel title="QR công khai" icon="qr_code_scanner">
                <InfoItem label="Serial" value={trace.qrInfo?.serialNo || 'Chưa có'} />
                <InfoItem label="Trace code" value={trace.qrInfo?.traceCode || trace.batch.traceCode || '-'} mono />
                <InfoItem label="URL" value={publicUrl ? shortHash(publicUrl) : '-'} mono />
              </TracePanel>

              <TracePanel title="Blockchain" icon="verified">
                <InfoItem label="Kết quả" value={verifyResult?.matched ? 'Khớp dữ liệu' : 'Chưa khớp / chưa xác minh'} />
                <InfoItem label="Local hash" value={shortHash(verifyResult?.localHash)} mono />
                <InfoItem label="On-chain hash" value={shortHash(verifyResult?.onChainHash)} mono />
              </TracePanel>
            </div>
          </div>

          {trace.processList?.length ? (
            <div className="ship-timeline" style={{ marginTop: 24 }}>
              {trace.processList.map((step, index) => (
                <div key={`${step.stepNo}-${index}`}>
                  <i />
                  <strong>Bước {step.stepNo}: {step.stepName}</strong>
                  <p>{fmtDateTime(step.performedAt)}{step.description ? ` - ${step.description}` : ''}</p>
                </div>
              ))}
            </div>
          ) : null}
        </article>
      ) : null}
    </section>
  )
}
