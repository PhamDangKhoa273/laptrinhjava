import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { TextAreaField } from '../components/TextAreaField.jsx'
import { TextInput } from '../components/TextInput.jsx'
import {
  createBatch,
  createSeason,
  createSeasonProcess,
  deleteSeasonProcess,
  generateBatchQr,
  getBatches,
  getSeasonProcesses,
  getSeasons,
  reorderSeasonProcess,
  traceBatch,
  updateBatch,
  updateSeason,
  updateSeasonProcess,
  verifyBatch,
} from '../services/phase3Service'
import { getErrorMessage } from '../utils/helpers'

const initialSeasonForm = {
  farmId: '',
  productId: '',
  seasonCode: '',
  startDate: '',
  expectedHarvestDate: '',
  actualHarvestDate: '',
  farmingMethod: '',
  seasonStatus: 'PLANNED',
}

const initialProcessForm = {
  stepNo: '',
  stepName: '',
  performedAt: '',
  description: '',
  imageUrl: '',
}

const initialBatchForm = {
  seasonId: '',
  productId: '',
  batchCode: '',
  harvestDate: '',
  quantity: '',
  availableQuantity: '',
  qualityGrade: '',
  expiryDate: '',
  batchStatus: 'CREATED',
}

function toDateTimeLocalInput(value) {
  if (!value) return ''
  return String(value).slice(0, 16)
}

export function FarmPhase3Page() {
  const [seasons, setSeasons] = useState([])
  const [batches, setBatches] = useState([])
  const [seasonTimeline, setSeasonTimeline] = useState(null)
  const [traceResult, setTraceResult] = useState(null)
  const [verifyResult, setVerifyResult] = useState(null)
  const [selectedSeasonId, setSelectedSeasonId] = useState('')
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [editingSeasonId, setEditingSeasonId] = useState('')
  const [editingProcessId, setEditingProcessId] = useState('')
  const [editingBatchId, setEditingBatchId] = useState('')
  const [seasonForm, setSeasonForm] = useState(initialSeasonForm)
  const [processForm, setProcessForm] = useState(initialProcessForm)
  const [batchForm, setBatchForm] = useState(initialBatchForm)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadDashboard() {
    setLoading(true)
    try {
      const [seasonData, batchData] = await Promise.all([getSeasons(), getBatches()])
      const safeSeasons = Array.isArray(seasonData) ? seasonData : []
      const safeBatches = Array.isArray(batchData) ? batchData : []
      setSeasons(safeSeasons)
      setBatches(safeBatches)

      const seasonId = selectedSeasonId || (safeSeasons[0]?.id ? String(safeSeasons[0].id) : '')
      const batchId = selectedBatchId || (safeBatches[0]?.batchId ? String(safeBatches[0].batchId) : '')

      if (seasonId) {
        setSelectedSeasonId(String(seasonId))
        setSeasonTimeline(await getSeasonProcesses(Number(seasonId)))
      } else {
        setSeasonTimeline(null)
      }

      if (batchId) {
        setSelectedBatchId(String(batchId))
        setTraceResult(await traceBatch(Number(batchId)))
        setVerifyResult(await verifyBatch(Number(batchId)))
      } else {
        setTraceResult(null)
        setVerifyResult(null)
      }
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải dữ liệu Phase 3.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const selectedSeason = useMemo(
    () => seasons.find((item) => String(item.id) === String(selectedSeasonId)) || null,
    [seasons, selectedSeasonId],
  )

  function handleSeasonChange(event) {
    const { name, value } = event.target
    setSeasonForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleProcessChange(event) {
    const { name, value } = event.target
    setProcessForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleBatchChange(event) {
    const { name, value } = event.target
    setBatchForm((prev) => ({ ...prev, [name]: value }))
  }

  function resetForms() {
    setSeasonForm(initialSeasonForm)
    setProcessForm(initialProcessForm)
    setBatchForm(initialBatchForm)
    setEditingSeasonId('')
    setEditingProcessId('')
    setEditingBatchId('')
  }

  async function handleSeasonSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      const payload = {
        farmId: Number(seasonForm.farmId),
        productId: Number(seasonForm.productId),
        seasonCode: seasonForm.seasonCode.trim(),
        startDate: seasonForm.startDate,
        expectedHarvestDate: seasonForm.expectedHarvestDate,
        actualHarvestDate: seasonForm.actualHarvestDate || null,
        farmingMethod: seasonForm.farmingMethod.trim(),
        seasonStatus: seasonForm.seasonStatus.trim(),
      }
      if (editingSeasonId) {
        await updateSeason(Number(editingSeasonId), payload)
        setSuccess('Cập nhật mùa vụ thành công.')
      } else {
        await createSeason(payload)
        setSuccess('Tạo mùa vụ thành công.')
      }
      resetForms()
      await loadDashboard()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể lưu mùa vụ.'))
    }
  }

  async function handleProcessSubmit(event) {
    event.preventDefault()
    if (!selectedSeasonId) {
      setError('Hãy chọn mùa vụ trước khi thêm quy trình.')
      return
    }
    setError('')
    setSuccess('')
    try {
      const payload = {
        stepNo: Number(processForm.stepNo),
        stepName: processForm.stepName.trim(),
        performedAt: processForm.performedAt,
        description: processForm.description.trim(),
        imageUrl: processForm.imageUrl.trim(),
      }
      if (editingProcessId) {
        await updateSeasonProcess(Number(editingProcessId), payload)
        setSuccess('Cập nhật bước quy trình thành công.')
      } else {
        await createSeasonProcess(Number(selectedSeasonId), payload)
        setSuccess('Thêm bước quy trình thành công.')
      }
      setProcessForm(initialProcessForm)
      setEditingProcessId('')
      setSeasonTimeline(await getSeasonProcesses(Number(selectedSeasonId)))
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể lưu bước quy trình.'))
    }
  }

  async function handleBatchSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      const payload = {
        seasonId: Number(batchForm.seasonId),
        productId: Number(batchForm.productId),
        batchCode: batchForm.batchCode.trim(),
        harvestDate: batchForm.harvestDate,
        quantity: Number(batchForm.quantity),
        availableQuantity: Number(batchForm.availableQuantity),
        qualityGrade: batchForm.qualityGrade.trim(),
        expiryDate: batchForm.expiryDate,
        batchStatus: batchForm.batchStatus.trim(),
      }
      if (editingBatchId) {
        await updateBatch(Number(editingBatchId), payload)
        setSuccess('Cập nhật lô sản phẩm thành công.')
      } else {
        await createBatch(payload)
        setSuccess('Tạo lô sản phẩm thành công.')
      }
      setBatchForm(initialBatchForm)
      setEditingBatchId('')
      await loadDashboard()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể lưu lô sản phẩm.'))
    }
  }

  async function handleGenerateQr(batchId) {
    try {
      await generateBatchQr(batchId)
      setSuccess('Tạo QR thành công.')
      setSelectedBatchId(String(batchId))
      setTraceResult(await traceBatch(batchId))
      setVerifyResult(await verifyBatch(batchId))
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tạo QR.'))
    }
  }

  async function handleLoadTrace(batchId) {
    setSelectedBatchId(String(batchId))
    try {
      setTraceResult(await traceBatch(batchId))
      setVerifyResult(await verifyBatch(batchId))
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải truy xuất lô hàng.'))
    }
  }

  async function handleSelectSeason(seasonId) {
    setSelectedSeasonId(String(seasonId))
    try {
      setSeasonTimeline(await getSeasonProcesses(seasonId))
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải timeline mùa vụ.'))
    }
  }

  function fillSeason(season) {
    setEditingSeasonId(String(season.id))
    setSeasonForm({
      farmId: String(season.farmId || ''),
      productId: String(season.productId || ''),
      seasonCode: season.seasonCode || '',
      startDate: season.startDate || '',
      expectedHarvestDate: season.expectedHarvestDate || '',
      actualHarvestDate: season.actualHarvestDate || '',
      farmingMethod: season.farmingMethod || '',
      seasonStatus: season.seasonStatus || 'PLANNED',
    })
  }

  function fillProcess(process) {
    setEditingProcessId(String(process.id))
    setProcessForm({
      stepNo: String(process.stepNo || ''),
      stepName: process.stepName || '',
      performedAt: toDateTimeLocalInput(process.performedAt),
      description: process.description || '',
      imageUrl: process.imageUrl || '',
    })
  }

  function fillBatch(batch) {
    setEditingBatchId(String(batch.batchId))
    setBatchForm({
      seasonId: String(batch.seasonId || ''),
      productId: String(batch.productId || ''),
      batchCode: batch.batchCode || '',
      harvestDate: batch.harvestDate || '',
      quantity: String(batch.quantity || ''),
      availableQuantity: String(batch.availableQuantity || ''),
      qualityGrade: batch.qualityGrade || '',
      expiryDate: batch.expiryDate || '',
      batchStatus: batch.batchStatus || 'CREATED',
    })
  }

  async function handleDeleteProcess(processId) {
    try {
      await deleteSeasonProcess(processId)
      setSuccess('Đã xóa bước quy trình.')
      if (selectedSeasonId) {
        setSeasonTimeline(await getSeasonProcesses(Number(selectedSeasonId)))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể xóa bước quy trình.'))
    }
  }

  async function handleReorderProcess(processId, nextStepNo) {
    try {
      await reorderSeasonProcess(processId, nextStepNo)
      setSuccess('Đã đổi thứ tự bước quy trình.')
      if (selectedSeasonId) {
        setSeasonTimeline(await getSeasonProcesses(Number(selectedSeasonId)))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể đổi thứ tự bước quy trình.'))
    }
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Phase 3 workspace</p>
          <h2>Season, process, batch và truy xuất nguồn gốc</h2>
          <p>Luồng demo đầy đủ cho FARM: tạo mùa vụ, ghi quy trình, tạo batch, sinh QR và xem trace.</p>
        </div>
      </div>

      {loading ? <div className="glass-card">Đang tải dữ liệu Phase 3...</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="content-grid">
        <article className="glass-card">
          <h3>{editingSeasonId ? 'Cập nhật mùa vụ' : 'Tạo mùa vụ'}</h3>
          <form className="form-grid" onSubmit={handleSeasonSubmit}>
            <div className="grid-two">
              <TextInput label="Farm ID" name="farmId" value={seasonForm.farmId} onChange={handleSeasonChange} required />
              <TextInput label="Product ID" name="productId" value={seasonForm.productId} onChange={handleSeasonChange} required />
            </div>
            <div className="grid-two">
              <TextInput label="Season code" name="seasonCode" value={seasonForm.seasonCode} onChange={handleSeasonChange} required />
              <TextInput label="Farming method" name="farmingMethod" value={seasonForm.farmingMethod} onChange={handleSeasonChange} required />
            </div>
            <div className="grid-two">
              <TextInput label="Start date" name="startDate" type="date" value={seasonForm.startDate} onChange={handleSeasonChange} required />
              <TextInput label="Expected harvest date" name="expectedHarvestDate" type="date" value={seasonForm.expectedHarvestDate} onChange={handleSeasonChange} required />
            </div>
            <div className="grid-two">
              <TextInput label="Actual harvest date" name="actualHarvestDate" type="date" value={seasonForm.actualHarvestDate} onChange={handleSeasonChange} />
              <TextInput label="Season status" name="seasonStatus" value={seasonForm.seasonStatus} onChange={handleSeasonChange} required />
            </div>
            <div className="flex gap-3">
              <Button type="submit">{editingSeasonId ? 'Lưu cập nhật mùa vụ' : 'Tạo mùa vụ'}</Button>
              <Button type="button" variant="secondary" onClick={resetForms}>Làm mới form</Button>
            </div>
          </form>

          <h3 className="top-gap">Danh sách mùa vụ</h3>
          <div className="form-grid">
            {seasons.length === 0 ? <p>Chưa có mùa vụ.</p> : null}
            {seasons.map((season) => (
              <div key={season.id} className="business-card">
                <div>
                  <strong>{season.seasonCode}</strong>
                  <p>Farm: {season.farmName} | Product: {season.productName || season.productId}</p>
                  <p>Method: {season.farmingMethod || 'N/A'}</p>
                  <p>Status: {season.seasonStatus}</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => handleSelectSeason(season.id)}>Xem timeline</Button>
                  <Button variant="secondary" onClick={() => fillSeason(season)}>Sửa</Button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card">
          <h3>{editingProcessId ? 'Cập nhật bước quy trình' : 'Thêm bước quy trình'}</h3>
          <p>Mùa vụ đang chọn: <strong>{selectedSeason?.seasonCode || 'Chưa chọn'}</strong></p>
          <form className="form-grid" onSubmit={handleProcessSubmit}>
            <div className="grid-two">
              <TextInput label="Step no" name="stepNo" value={processForm.stepNo} onChange={handleProcessChange} required />
              <TextInput label="Step name" name="stepName" value={processForm.stepName} onChange={handleProcessChange} required />
            </div>
            <TextInput label="Performed at" name="performedAt" type="datetime-local" value={processForm.performedAt} onChange={handleProcessChange} required />
            <TextAreaField label="Description" name="description" value={processForm.description} onChange={handleProcessChange} />
            <TextInput label="Image URL" name="imageUrl" value={processForm.imageUrl} onChange={handleProcessChange} />
            <Button type="submit">{editingProcessId ? 'Lưu cập nhật bước' : 'Thêm bước mới'}</Button>
          </form>

          <h3 className="top-gap">Timeline quy trình</h3>
          <div className="form-grid">
            {seasonTimeline?.steps?.length ? seasonTimeline.steps.map((process) => (
              <div key={process.id} className="business-card">
                <div>
                  <strong>Bước {process.stepNo}: {process.stepName}</strong>
                  <p>Performed at: {process.performedAt}</p>
                  <p>Recorded by: {process.recordedByName || 'N/A'}</p>
                  <p>{process.description || 'Không có mô tả.'}</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => fillProcess(process)}>Sửa</Button>
                  <Button variant="secondary" onClick={() => handleReorderProcess(process.id, Math.max(1, (process.stepNo || 1) - 1))}>↑</Button>
                  <Button variant="secondary" onClick={() => handleReorderProcess(process.id, (process.stepNo || 1) + 1)}>↓</Button>
                  <Button variant="danger" onClick={() => handleDeleteProcess(process.id)}>Xóa</Button>
                </div>
              </div>
            )) : <p>Chưa có quy trình cho mùa vụ này.</p>}
          </div>
        </article>
      </div>

      <div className="content-grid top-gap">
        <article className="glass-card">
          <h3>{editingBatchId ? 'Cập nhật lô sản phẩm' : 'Tạo lô sản phẩm'}</h3>
          <form className="form-grid" onSubmit={handleBatchSubmit}>
            <div className="grid-two">
              <TextInput label="Season ID" name="seasonId" value={batchForm.seasonId} onChange={handleBatchChange} required />
              <TextInput label="Product ID" name="productId" value={batchForm.productId} onChange={handleBatchChange} required />
            </div>
            <div className="grid-two">
              <TextInput label="Batch code" name="batchCode" value={batchForm.batchCode} onChange={handleBatchChange} required />
              <TextInput label="Quality grade" name="qualityGrade" value={batchForm.qualityGrade} onChange={handleBatchChange} required />
            </div>
            <div className="grid-two">
              <TextInput label="Harvest date" name="harvestDate" type="date" value={batchForm.harvestDate} onChange={handleBatchChange} required />
              <TextInput label="Expiry date" name="expiryDate" type="date" value={batchForm.expiryDate} onChange={handleBatchChange} required />
            </div>
            <div className="grid-two">
              <TextInput label="Quantity" name="quantity" value={batchForm.quantity} onChange={handleBatchChange} required />
              <TextInput label="Available quantity" name="availableQuantity" value={batchForm.availableQuantity} onChange={handleBatchChange} required />
            </div>
            <TextInput label="Batch status" name="batchStatus" value={batchForm.batchStatus} onChange={handleBatchChange} required />
            <Button type="submit">{editingBatchId ? 'Lưu cập nhật batch' : 'Tạo batch'}</Button>
          </form>

          <h3 className="top-gap">Danh sách batch</h3>
          <div className="form-grid">
            {batches.length === 0 ? <p>Chưa có batch.</p> : null}
            {batches.map((batch) => (
              <div key={batch.batchId} className="business-card">
                <div>
                  <strong>{batch.batchCode}</strong>
                  <p>Season ID: {batch.seasonId} | Product ID: {batch.productId}</p>
                  <p>Quantity: {batch.availableQuantity}/{batch.quantity}</p>
                  <p>Status: {batch.batchStatus}</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => fillBatch(batch)}>Sửa</Button>
                  <Button variant="secondary" onClick={() => handleGenerateQr(batch.batchId)}>Tạo QR</Button>
                  <Button variant="secondary" onClick={() => handleLoadTrace(batch.batchId)}>Xem trace</Button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card">
          <h3>Truy xuất nguồn gốc</h3>
          {traceResult?.batch ? (
            <div className="form-grid">
              <div className="business-card">
                <div>
                  <strong>{traceResult.batch.batchCode}</strong>
                  <p>Harvest: {traceResult.batch.harvestDate}</p>
                  <p>Quality: {traceResult.batch.qualityGrade}</p>
                  <p>Status: {traceResult.batch.batchStatus}</p>
                </div>
              </div>
              <div className="business-card">
                <div>
                  <strong>Season info</strong>
                  <p>Code: {traceResult.seasonInfo?.seasonCode}</p>
                  <p>Farm: {traceResult.seasonInfo?.farmName}</p>
                  <p>Method: {traceResult.seasonInfo?.farmingMethod}</p>
                </div>
              </div>
              <div className="business-card">
                <div>
                  <strong>QR info</strong>
                  <p>Serial: {traceResult.qrInfo?.serialNo || 'Chưa tạo'}</p>
                  <p>URL: {traceResult.qrInfo?.qrUrl || 'Chưa tạo'}</p>
                  {traceResult.qrInfo?.qrImageBase64 ? <img alt="QR batch" src={`data:image/png;base64,${traceResult.qrInfo.qrImageBase64}`} style={{ maxWidth: 180 }} /> : null}
                </div>
              </div>
              <div className="business-card">
                <div>
                  <strong>Blockchain verify</strong>
                  <p>Matched: {verifyResult?.matched ? 'YES' : 'NO'}</p>
                  <p>Local hash: {verifyResult?.localHash || 'N/A'}</p>
                  <p>On-chain hash: {verifyResult?.onChainHash || 'N/A'}</p>
                </div>
              </div>
              <div className="business-card">
                <div>
                  <strong>Timeline</strong>
                  <ul className="feature-list">
                    {(traceResult.processList || []).map((item, index) => (
                      <li key={`${item.stepNo}-${index}`}>
                        Bước {item.stepNo}: {item.stepName} ({item.performedAt})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : <p>Chọn một batch để xem truy xuất nguồn gốc.</p>}
        </article>
      </div>
    </section>
  )
}
