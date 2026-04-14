import { useEffect, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { TextInput } from '../components/TextInput.jsx'
import { traceBatch, verifyBatch } from '../services/phase3Service'
import { getErrorMessage } from '../utils/helpers'

function formatDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString('vi-VN')
}

function formatDateTime(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString('vi-VN')
}

export function PublicTracePage() {
  const [batchId, setBatchId] = useState('')
  const [traceResult, setTraceResult] = useState(null)
  const [verifyResult, setVerifyResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const initialBatchId = params.get('batchId')
    if (initialBatchId && Number(initialBatchId) > 0) {
      setBatchId(initialBatchId)
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!batchId.trim() || Number(batchId) <= 0) return

    setLoading(true)
    setError('')
    try {
      const numericBatchId = Number(batchId)
      const [traceData, verifyData] = await Promise.all([
        traceBatch(numericBatchId, true),
        verifyBatch(numericBatchId),
      ])
      setTraceResult(traceData)
      setVerifyResult(verifyData)
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể truy xuất lô hàng công khai.'))
      setTraceResult(null)
      setVerifyResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Public trace</p>
          <h2>Tra cứu nguồn gốc lô hàng</h2>
          <p>Nhập batch ID để xem mùa vụ, quy trình, QR và đối chiếu hash blockchain công khai.</p>
        </div>
      </div>

      <article className="glass-card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <TextInput label="Batch ID" name="batchId" type="number" min="1" value={batchId} onChange={(event) => setBatchId(event.target.value)} required />
          <Button type="submit" disabled={loading}>{loading ? 'Đang truy xuất...' : 'Tra cứu'}</Button>
        </form>
        {error ? <div className="alert alert-error top-gap">{error}</div> : null}
      </article>

      {traceResult?.batch ? (
        <div className="content-grid top-gap">
          <article className="glass-card">
            <h3>Thông tin lô sản phẩm</h3>
            <ul className="feature-list">
              <li>Mã batch: {traceResult.batch.batchCode}</li>
              <li>Ngày thu hoạch: {formatDate(traceResult.batch.harvestDate)}</li>
              <li>Chất lượng: {traceResult.batch.qualityGrade}</li>
              <li>Trạng thái: {traceResult.batch.batchStatus}</li>
              <li>Số lượng còn lại: {traceResult.batch.availableQuantity}/{traceResult.batch.quantity}</li>
            </ul>
          </article>

          <article className="glass-card">
            <h3>Thông tin mùa vụ</h3>
            <ul className="feature-list">
              <li>Mã mùa vụ: {traceResult.seasonInfo?.seasonCode}</li>
              <li>Nông trại: {traceResult.seasonInfo?.farmName}</li>
              <li>Mã nông trại: {traceResult.seasonInfo?.farmCode || 'N/A'}</li>
              <li>Phương thức canh tác: {traceResult.seasonInfo?.farmingMethod}</li>
              <li>Bắt đầu: {formatDate(traceResult.seasonInfo?.startDate)}</li>
            </ul>
          </article>

          <article className="glass-card">
            <h3>Thông tin QR</h3>
            <ul className="feature-list">
              <li>Serial: {traceResult.qrInfo?.serialNo || 'Chưa tạo'}</li>
              <li>URL: {traceResult.qrInfo?.qrUrl || 'Chưa tạo'}</li>
              <li>Payload: {traceResult.qrInfo?.qrValue || 'Chưa tạo'}</li>
            </ul>
            {traceResult.qrInfo?.qrImageBase64 ? <img alt="QR batch" src={`data:image/png;base64,${traceResult.qrInfo.qrImageBase64}`} style={{ maxWidth: 180 }} /> : null}
          </article>

          <article className="glass-card">
            <h3>Xác thực blockchain</h3>
            <ul className="feature-list">
              <li>Khớp hash: {verifyResult?.matched ? 'YES' : 'NO'}</li>
              <li>Local hash: {verifyResult?.localHash || 'N/A'}</li>
              <li>On-chain hash: {verifyResult?.onChainHash || 'N/A'}</li>
            </ul>
          </article>

          <article className="glass-card">
            <h3>Timeline quy trình</h3>
            <ul className="feature-list">
              {(traceResult.processList || []).map((item, index) => (
                <li key={`${item.stepNo}-${index}`}>
                  Bước {item.stepNo}: {item.stepName} ({formatDateTime(item.performedAt)})
                </li>
              ))}
            </ul>
            {traceResult.note ? <p>{traceResult.note}</p> : null}
          </article>
        </div>
      ) : null}
    </section>
  )
}
