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

function PageChrome({ eyebrow, title, subtitle, actions, children, error, success, loading }) {
  return (
    <>
      <div className="ship-page-head">
        <div><p>{eyebrow}</p><h2>{title}</h2><span>{subtitle}</span></div>
        <div className="ship-actions">{actions}</div>
      </div>
      {loading ? <div className="ship-alert neutral">Đang tải dữ liệu QR & truy xuất...</div> : null}
      {error ? <div className="ship-alert danger">{error}</div> : null}
      {success ? <div className="ship-alert success">{success}</div> : null}
      {children}
    </>
  )
}

function Metric({ icon, label, value, note, tone = 'green' }) {
  return (
    <article className={`ship-metric ${tone}`}>
      <div><Icon fill>{icon}</Icon>{note ? <span>{note}</span> : null}</div>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  )
}

function fmtDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString('vi-VN')
}

function fmtDateTime(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString('vi-VN')
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
      // Pre-load latest export for each exportable season.
      const exportables = seasonArr.filter((s) => ['HARVESTED', 'COMPLETED'].includes(s.seasonStatus))
      const results = await Promise.all(
        exportables.map((s) => getLatestSeasonExport(s.id).then((data) => [s.id, data]).catch(() => [s.id, null])),
      )
      const map = {}
      results.forEach(([id, data]) => { if (data) map[String(id)] = data })
      setSeasonExports(map)
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được dữ liệu.'))
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
    setError(''); setSuccess('')
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
    setError(''); setSuccess('')
    try {
      const qr = await generateBatchQr(batchId)
      setSuccess(`Đã tạo QR cho batch #${batchId}.`)
      // Update local batch state so column reflects new QR.
      setBatches((prev) => prev.map((b) => (b.batchId === batchId ? { ...b, traceCode: qr.traceCode, publicTraceUrl: qr.qrUrl } : b)))
    } catch (err) {
      setError(getErrorMessage(err, 'Không tạo được QR.'))
    }
  }

  async function handleViewTrace(batchId) {
    setSelectedBatchId(String(batchId))
    setError(''); setSuccess('')
    try {
      const [traceData, verify] = await Promise.allSettled([traceBatch(batchId), verifyBatch(batchId)])
      setTrace(traceData.status === 'fulfilled' ? traceData.value : null)
      setVerifyResult(verify.status === 'fulfilled' ? verify.value : null)
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được trace.'))
    }
  }

  async function handleCopy(text) {
    if (!text || !navigator?.clipboard) return
    try {
      await navigator.clipboard.writeText(text)
      setSuccess('Đã copy vào clipboard.')
    } catch {
      setError('Clipboard không khả dụng.')
    }
  }

  return (
    <section className="shipping-prototype-shell">
      <PageChrome
        eyebrow="Farm / Sản xuất / Xuất QR & Truy xuất"
        title="Xuất mùa vụ, Mã QR & Truy xuất nguồn gốc"
        subtitle={`${stats.exportable} mùa vụ sẵn sàng xuất • ${stats.exported} đã xuất • ${stats.qrIssued}/${stats.totalBatches} batch đã có QR`}
        loading={loading}
        error={error}
        success={success}
        actions={<button type="button" onClick={load}><Icon>refresh</Icon>Làm mới</button>}
      >
        <section className="ship-metrics four">
          <Metric icon="file_export" label="Mùa vụ có thể xuất" value={stats.exportable} tone="blue" />
          <Metric icon="task_alt" label="Đã xuất" value={stats.exported} />
          <Metric icon="qr_code_2" label="Batch có QR" value={`${stats.qrIssued}/${stats.totalBatches}`} tone="amber" />
          <Metric icon="link" label="Đang xem trace" value={selectedBatchId ? `#${selectedBatchId}` : '—'} />
        </section>

        <article className="ship-card">
          <div className="ship-card-head">
            <h3><Icon>file_export</Icon>Xuất mùa vụ</h3>
          </div>
          {seasons.filter((s) => ['HARVESTED', 'COMPLETED'].includes(s.seasonStatus)).length === 0 ? (
            <p>Chưa có mùa vụ nào ở trạng thái HARVESTED hoặc COMPLETED. <a href="/farm/seasons">Cập nhật mùa vụ</a> trước.</p>
          ) : (
            <div className="ship-table-wrap">
              <table className="ship-table">
                <thead>
                  <tr><th>Mã mùa vụ</th><th>Trạng thái</th><th>Thu hoạch</th><th>Export</th><th>Trace URL</th><th></th></tr>
                </thead>
                <tbody>
                  {seasons.filter((s) => ['HARVESTED', 'COMPLETED'].includes(s.seasonStatus)).map((s) => {
                    const exp = seasonExports[String(s.id)]
                    return (
                      <tr key={s.id}>
                        <td><b>{s.seasonCode}</b><small>ID #{s.id}</small></td>
                        <td><Status value={s.seasonStatus} /></td>
                        <td>{fmtDate(s.actualHarvestDate || s.expectedHarvestDate)}</td>
                        <td>{exp ? `${fmtDateTime(exp.exportedAt)} · ${exp.batchCount || 0} batch` : 'Chưa xuất'}</td>
                        <td>{exp?.publicTraceUrl ? <a href={exp.publicTraceUrl} target="_blank" rel="noreferrer">{exp.publicTraceUrl}</a> : '-'}</td>
                        <td>
                          <button type="button" onClick={() => handleExport(s.id)} disabled={exportingSeasonId === String(s.id)}>
                            <Icon>file_export</Icon>{exportingSeasonId === String(s.id) ? 'Đang xuất...' : (exp ? 'Xuất lại' : 'Xuất + Sinh QR')}
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
            <h3><Icon>qr_code_2</Icon>QR và Trace của batch</h3>
          </div>
          {batches.length === 0 ? (
            <p>Chưa có batch. <a href="/farm/packages">Tạo batch</a> trước.</p>
          ) : (
            <div className="ship-table-wrap">
              <table className="ship-table">
                <thead>
                  <tr><th>Mã batch</th><th>Mùa vụ</th><th>Còn (kg)</th><th>Trạng thái</th><th>Trace code</th><th></th></tr>
                </thead>
                <tbody>
                  {batches.map((b) => (
                    <tr key={b.batchId} style={String(selectedBatchId) === String(b.batchId) ? { background: '#fbfdfb' } : undefined}>
                      <td><b>{b.batchCode}</b><small>ID #{b.batchId}</small></td>
                      <td>#{b.seasonId}</td>
                      <td>{Number(b.availableQuantity || 0).toLocaleString('vi-VN')}</td>
                      <td><Status value={b.batchStatus} /></td>
                      <td>{b.traceCode || <span style={{ opacity: .5 }}>Chưa có</span>}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {!b.traceCode ? <button type="button" onClick={() => handleGenerateQr(b.batchId)} title="Tạo QR"><Icon>qr_code_2</Icon></button> : null}
                          <button type="button" onClick={() => handleViewTrace(b.batchId)} title="Xem trace"><Icon>visibility</Icon></button>
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
              <h3><Icon>route</Icon>Truy xuất nguồn gốc · {trace.batch.batchCode}</h3>
              {verifyResult ? <span className={`live-pill ${verifyResult.matched ? '' : 'danger-pill'}`}>{verifyResult.matched ? '✓ Blockchain match' : '✗ Mismatch'}</span> : null}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div>
                <strong>Batch info</strong>
                <p>Status: {trace.batch.batchStatus}</p>
                <p>Harvest: {fmtDate(trace.batch.harvestDate)}</p>
                <p>Quality: {trace.batch.qualityGrade || 'N/A'}</p>
                <p>Available: {trace.batch.availableQuantity}/{trace.batch.quantity}</p>
              </div>
              <div>
                <strong>Season info</strong>
                <p>Code: {trace.seasonInfo?.seasonCode}</p>
                <p>Farm: {trace.seasonInfo?.farmName}</p>
                <p>Method: {trace.seasonInfo?.farmingMethod || 'N/A'}</p>
                <p>Start: {fmtDate(trace.seasonInfo?.startDate)}</p>
              </div>
              <div>
                <strong>QR info</strong>
                <p>Serial: {trace.qrInfo?.serialNo || 'Chưa tạo'}</p>
                <p>URL: {trace.qrInfo?.qrUrl || 'Chưa tạo'}</p>
                <p>Trace code: {trace.qrInfo?.traceCode || 'N/A'}</p>
                {trace.qrInfo?.qrUrl ? <button type="button" onClick={() => handleCopy(trace.qrInfo.qrUrl)}><Icon>content_copy</Icon>Copy URL</button> : null}
                {trace.qrInfo?.qrImageBase64 ? <img alt="QR" src={`data:image/png;base64,${trace.qrInfo.qrImageBase64}`} style={{ maxWidth: 160, marginTop: 8 }} /> : null}
              </div>
              <div>
                <strong>Blockchain verify</strong>
                <p>Matched: {verifyResult?.matched ? 'YES' : 'NO'}</p>
                <p>Local hash: <code style={{ fontSize: 11 }}>{verifyResult?.localHash || 'N/A'}</code></p>
                <p>On-chain hash: <code style={{ fontSize: 11 }}>{verifyResult?.onChainHash || 'N/A'}</code></p>
              </div>
            </div>
            {trace.processList?.length ? (
              <div className="ship-timeline" style={{ marginTop: 24 }}>
                {trace.processList.map((step, i) => (
                  <div key={`${step.stepNo}-${i}`}>
                    <i />
                    <strong>Bước {step.stepNo}: {step.stepName}</strong>
                    <p>{fmtDateTime(step.performedAt)}{step.description ? ` · ${step.description}` : ''}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ) : null}
      </PageChrome>
    </section>
  )
}
