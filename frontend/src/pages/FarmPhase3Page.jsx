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
  getPhase3FarmContext,
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

const seasonStatuses = ['PLANNED', 'IN_PROGRESS', 'HARVESTED', 'COMPLETED']
const batchStatuses = ['CREATED', 'READY', 'STORED', 'SOLD_OUT']
const qualityGrades = ['A', 'B', 'C']

function toDateTimeLocalInput(value) {
  if (!value) return ''
  return String(value).slice(0, 16)
}

function isPositiveNumber(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0
}

function formatDateTime(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString('vi-VN')
}

function formatDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString('vi-VN')
}

function copyToClipboard(text) {
  if (!text || !navigator?.clipboard) return Promise.reject(new Error('Clipboard không khả dụng.'))
  return navigator.clipboard.writeText(text)
}

function buildSeasonCode(farmCode) {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  return `${farmCode || 'SEASON'}-${stamp}`
}

function buildBatchCode(seasonCode) {
  const stamp = new Date().toISOString().slice(11, 19).replaceAll(':', '')
  return `${seasonCode || 'BATCH'}-${stamp}`
}

export function FarmPhase3Page() {
  const [farmContext, setFarmContext] = useState(null)
  const [products, setProducts] = useState([])
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

  const selectedSeason = useMemo(
    () => seasons.find((item) => String(item.id) === String(selectedSeasonId)) || null,
    [seasons, selectedSeasonId],
  )

  const selectedBatch = useMemo(
    () => batches.find((item) => String(item.batchId) === String(selectedBatchId)) || null,
    [batches, selectedBatchId],
  )

  useEffect(() => {
    async function loadContext() {
      try {
        const context = await getPhase3FarmContext()
        setFarmContext(context.farm)
        setProducts(context.products)

        setSeasonForm((prev) => ({
          ...prev,
          farmId: context.farm?.farmId ? String(context.farm.farmId) : prev.farmId,
          seasonCode: prev.seasonCode || buildSeasonCode(context.farm?.farmCode),
          productId: context.products[0]?.productId ? String(context.products[0].productId) : prev.productId,
        }))
      } catch {
        // keep page usable even if context preload is partial
      }
    }

    loadContext()
  }, [])

  async function loadDashboard(options = {}) {
    const { preferredSeasonId = selectedSeasonId, preferredBatchId = selectedBatchId } = options
    setLoading(true)
    try {
      const [seasonData, batchData] = await Promise.all([getSeasons(), getBatches()])
      const safeSeasons = Array.isArray(seasonData) ? seasonData : []
      const safeBatches = Array.isArray(batchData) ? batchData : []
      setSeasons(safeSeasons)
      setBatches(safeBatches)

      const resolvedSeasonId =
        preferredSeasonId && safeSeasons.some((item) => String(item.id) === String(preferredSeasonId))
          ? String(preferredSeasonId)
          : safeSeasons[0]?.id
            ? String(safeSeasons[0].id)
            : ''

      const resolvedBatchId =
        preferredBatchId && safeBatches.some((item) => String(item.batchId) === String(preferredBatchId))
          ? String(preferredBatchId)
          : safeBatches[0]?.batchId
            ? String(safeBatches[0].batchId)
            : ''

      if (resolvedSeasonId) {
        setSelectedSeasonId(resolvedSeasonId)
        setSeasonTimeline(await getSeasonProcesses(Number(resolvedSeasonId)))
      } else {
        setSelectedSeasonId('')
        setSeasonTimeline(null)
      }

      if (resolvedBatchId) {
        setSelectedBatchId(resolvedBatchId)
        const [traceData, verifyData] = await Promise.all([
          traceBatch(Number(resolvedBatchId)),
          verifyBatch(Number(resolvedBatchId)),
        ])
        setTraceResult(traceData)
        setVerifyResult(verifyData)
      } else {
        setSelectedBatchId('')
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedSeason && !editingBatchId) {
      setBatchForm((prev) => ({
        ...prev,
        seasonId: String(selectedSeason.id),
        productId: String(selectedSeason.productId || prev.productId || ''),
        batchCode: prev.batchCode || buildBatchCode(selectedSeason.seasonCode),
      }))
    }
  }, [selectedSeason, editingBatchId])

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

  function resetSeasonForm() {
    setSeasonForm({
      ...initialSeasonForm,
      farmId: farmContext?.farmId ? String(farmContext.farmId) : '',
      productId: products[0]?.productId ? String(products[0].productId) : '',
      seasonCode: buildSeasonCode(farmContext?.farmCode),
    })
    setEditingSeasonId('')
  }

  function resetProcessForm() {
    setProcessForm(initialProcessForm)
    setEditingProcessId('')
  }

  function resetBatchForm() {
    setBatchForm({
      ...initialBatchForm,
      seasonId: selectedSeason?.id ? String(selectedSeason.id) : '',
      productId: selectedSeason?.productId ? String(selectedSeason.productId) : products[0]?.productId ? String(products[0].productId) : '',
      batchCode: buildBatchCode(selectedSeason?.seasonCode),
    })
    setEditingBatchId('')
  }

  async function handleSeasonSubmit(event) {
    event.preventDefault()
    if (!isPositiveNumber(seasonForm.farmId) || !isPositiveNumber(seasonForm.productId)) {
      setError('Farm ID và Product ID phải là số dương.')
      return
    }

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

      let result
      if (editingSeasonId) {
        result = await updateSeason(Number(editingSeasonId), payload)
        setSuccess('Cập nhật mùa vụ thành công.')
      } else {
        result = await createSeason(payload)
        setSuccess('Tạo mùa vụ thành công.')
      }

      resetSeasonForm()
      await loadDashboard({ preferredSeasonId: result?.id })
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
    if (!isPositiveNumber(processForm.stepNo)) {
      setError('Số bước phải là số dương.')
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

      resetProcessForm()
      setSeasonTimeline(await getSeasonProcesses(Number(selectedSeasonId)))
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể lưu bước quy trình.'))
    }
  }

  async function handleBatchSubmit(event) {
    event.preventDefault()
    if (!isPositiveNumber(batchForm.seasonId) || !isPositiveNumber(batchForm.productId)) {
      setError('Season ID và Product ID phải là số dương.')
      return
    }
    if (!isPositiveNumber(batchForm.quantity) || !isPositiveNumber(batchForm.availableQuantity)) {
      setError('Số lượng phải là số dương.')
      return
    }

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
        status: batchForm.batchStatus.trim(),
      }

      let result
      if (editingBatchId) {
        result = await updateBatch(Number(editingBatchId), payload)
        setSuccess('Cập nhật lô sản phẩm thành công.')
      } else {
        result = await createBatch(payload)
        setSuccess('Tạo lô sản phẩm thành công.')
      }

      resetBatchForm()
      await loadDashboard({ preferredBatchId: result?.batchId })
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể lưu lô sản phẩm.'))
    }
  }

  async function handleGenerateQr(batchId) {
    setError('')
    setSuccess('')
    try {
      await generateBatchQr(batchId)
      const [traceData, verifyData] = await Promise.all([traceBatch(batchId), verifyBatch(batchId)])
      setSelectedBatchId(String(batchId))
      setTraceResult(traceData)
      setVerifyResult(verifyData)
      setSuccess('Tạo QR thành công.')
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tạo QR.'))
    }
  }

  async function handleLoadTrace(batchId) {
    setSelectedBatchId(String(batchId))
    setError('')
    setSuccess('')
    try {
      const [traceData, verifyData] = await Promise.all([traceBatch(batchId), verifyBatch(batchId)])
      setTraceResult(traceData)
      setVerifyResult(verifyData)
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải truy xuất lô hàng.'))
    }
  }

  async function handleSelectSeason(seasonId) {
    setSelectedSeasonId(String(seasonId))
    setError('')
    try {
      setSeasonTimeline(await getSeasonProcesses(Number(seasonId)))
      const season = seasons.find((item) => String(item.id) === String(seasonId))
      if (season && !editingBatchId) {
        setBatchForm((prev) => ({
          ...prev,
          seasonId: String(season.id),
          productId: String(season.productId || prev.productId || ''),
          batchCode: buildBatchCode(season.seasonCode),
        }))
      }
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
    setError('')
    setSuccess('')
    try {
      await deleteSeasonProcess(processId)
      setSuccess('Đã xóa bước quy trình.')
      if (selectedSeasonId) {
        setSeasonTimeline(await getSeasonProcesses(Number(selectedSeasonId)))
      }
      if (editingProcessId === String(processId)) {
        resetProcessForm()
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể xóa bước quy trình.'))
    }
  }

  async function handleReorderProcess(processId, nextStepNo) {
    if (!isPositiveNumber(nextStepNo)) return

    setError('')
    setSuccess('')
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

  async function handleCopyQrUrl() {
    try {
      await copyToClipboard(traceResult?.qrInfo?.qrUrl)
      setSuccess('Đã copy đường dẫn QR.')
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể copy đường dẫn QR.'))
    }
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Phase 3 workspace</p>
          <h2>Season, process, batch và truy xuất nguồn gốc</h2>
          <p>Luồng FARM hoàn chỉnh hơn, dùng được hơn và bớt nhập tay kỹ thuật hơn trước.</p>
        </div>
      </div>

      {loading ? <div className="glass-card">Đang tải dữ liệu Phase 3...</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="content-grid">
        <article className="glass-card">
          <h3>Ngữ cảnh nông trại hiện tại</h3>
          <ul className="feature-list">
            <li>Farm: {farmContext?.farmName || 'Chưa tải được farm profile'}</li>
            <li>Farm code: {farmContext?.farmCode || 'N/A'}</li>
            <li>Approval: {farmContext?.approvalStatus || 'N/A'}</li>
            <li>Sản phẩm khả dụng: {products.length}</li>
          </ul>
        </article>
      </div>

      <div className="content-grid top-gap">
        <article className="glass-card">
          <h3>{editingSeasonId ? 'Cập nhật mùa vụ' : 'Tạo mùa vụ'}</h3>
          <form className="form-grid" onSubmit={handleSeasonSubmit}>
            <div className="grid-two">
              <TextInput label="Farm ID" name="farmId" value={seasonForm.farmId} onChange={handleSeasonChange} required disabled={Boolean(farmContext?.farmId)} />
              <label className="field-group">
                <span className="field-label">Product</span>
                <select className="field-input" name="productId" value={seasonForm.productId} onChange={handleSeasonChange}>
                  <option value="">Chọn sản phẩm</option>
                  {products.map((product) => (
                    <option key={product.productId} value={product.productId}>
                      {product.productCode ? `${product.productCode} - ` : ''}{product.productName}
                    </option>
                  ))}
                </select>
              </label>
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
              <label className="field-group">
                <span className="field-label">Season status</span>
                <select className="field-input" name="seasonStatus" value={seasonForm.seasonStatus} onChange={handleSeasonChange}>
                  {seasonStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex gap-3">
              <Button type="submit">{editingSeasonId ? 'Lưu cập nhật mùa vụ' : 'Tạo mùa vụ'}</Button>
              <Button type="button" variant="secondary" onClick={resetSeasonForm}>Làm mới form</Button>
            </div>
          </form>

          <h3 className="top-gap">Danh sách mùa vụ</h3>
          <div className="form-grid">
            {seasons.length === 0 ? <p>Chưa có mùa vụ.</p> : null}
            {seasons.map((season) => {
              const isActive = String(season.id) === String(selectedSeasonId)
              return (
                <div key={season.id} className="business-card">
                  <div>
                    <strong>{season.seasonCode}</strong>
                    <p>Farm: {season.farmName} | Product: {season.productName || season.productId}</p>
                    <p>Method: {season.farmingMethod || 'N/A'}</p>
                    <p>Status: {season.seasonStatus}</p>
                    <p>Bắt đầu: {formatDate(season.startDate)} | Dự kiến thu hoạch: {formatDate(season.expectedHarvestDate)}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant={isActive ? 'primary' : 'secondary'} onClick={() => handleSelectSeason(season.id)}>
                      {isActive ? 'Đang xem timeline' : 'Xem timeline'}
                    </Button>
                    <Button variant="secondary" onClick={() => fillSeason(season)}>Sửa</Button>
                  </div>
                </div>
              )
            })}
          </div>
        </article>

        <article className="glass-card">
          <h3>{editingProcessId ? 'Cập nhật bước quy trình' : 'Thêm bước quy trình'}</h3>
          <p>Mùa vụ đang chọn: <strong>{selectedSeason?.seasonCode || 'Chưa chọn'}</strong></p>
          {seasonTimeline?.seasonInfo ? (
            <p>
              Trạng thái: {seasonTimeline.seasonInfo.seasonStatus || 'N/A'} | Bắt đầu: {formatDate(seasonTimeline.seasonInfo.startDate)}
            </p>
          ) : null}
          <form className="form-grid" onSubmit={handleProcessSubmit}>
            <div className="grid-two">
              <TextInput label="Step no" name="stepNo" type="number" min="1" value={processForm.stepNo} onChange={handleProcessChange} required />
              <TextInput label="Step name" name="stepName" value={processForm.stepName} onChange={handleProcessChange} required />
            </div>
            <TextInput label="Performed at" name="performedAt" type="datetime-local" value={processForm.performedAt} onChange={handleProcessChange} required />
            <TextAreaField label="Description" name="description" value={processForm.description} onChange={handleProcessChange} />
            <TextInput label="Image URL" name="imageUrl" value={processForm.imageUrl} onChange={handleProcessChange} />
            <div className="flex gap-3">
              <Button type="submit">{editingProcessId ? 'Lưu cập nhật bước' : 'Thêm bước mới'}</Button>
              <Button type="button" variant="secondary" onClick={resetProcessForm}>Làm mới form</Button>
            </div>
          </form>

          <h3 className="top-gap">Timeline quy trình</h3>
          <div className="form-grid">
            {seasonTimeline?.steps?.length ? seasonTimeline.steps.map((process) => (
              <div key={process.id} className="business-card">
                <div>
                  <strong>Bước {process.stepNo}: {process.stepName}</strong>
                  <p>Performed at: {formatDateTime(process.performedAt)}</p>
                  <p>Recorded by: {process.recordedByName || 'N/A'}</p>
                  <p>{process.description || 'Không có mô tả.'}</p>
                  {process.imageUrl ? <p>Image: {process.imageUrl}</p> : null}
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
              <label className="field-group">
                <span className="field-label">Season</span>
                <select className="field-input" name="seasonId" value={batchForm.seasonId} onChange={handleBatchChange}>
                  <option value="">Chọn mùa vụ</option>
                  {seasons.map((season) => (
                    <option key={season.id} value={season.id}>{season.seasonCode}</option>
                  ))}
                </select>
              </label>
              <label className="field-group">
                <span className="field-label">Product</span>
                <select className="field-input" name="productId" value={batchForm.productId} onChange={handleBatchChange}>
                  <option value="">Chọn sản phẩm</option>
                  {products.map((product) => (
                    <option key={product.productId} value={product.productId}>
                      {product.productCode ? `${product.productCode} - ` : ''}{product.productName}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid-two">
              <TextInput label="Batch code" name="batchCode" value={batchForm.batchCode} onChange={handleBatchChange} required />
              <label className="field-group">
                <span className="field-label">Quality grade</span>
                <select className="field-input" name="qualityGrade" value={batchForm.qualityGrade} onChange={handleBatchChange}>
                  <option value="">Chọn chất lượng</option>
                  {qualityGrades.map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid-two">
              <TextInput label="Harvest date" name="harvestDate" type="date" value={batchForm.harvestDate} onChange={handleBatchChange} required />
              <TextInput label="Expiry date" name="expiryDate" type="date" value={batchForm.expiryDate} onChange={handleBatchChange} required />
            </div>
            <div className="grid-two">
              <TextInput label="Quantity" name="quantity" type="number" min="1" value={batchForm.quantity} onChange={handleBatchChange} required />
              <TextInput label="Available quantity" name="availableQuantity" type="number" min="1" value={batchForm.availableQuantity} onChange={handleBatchChange} required />
            </div>
            <label className="field-group">
              <span className="field-label">Batch status</span>
              <select className="field-input" name="batchStatus" value={batchForm.batchStatus} onChange={handleBatchChange}>
                {batchStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
            <div className="flex gap-3">
              <Button type="submit">{editingBatchId ? 'Lưu cập nhật batch' : 'Tạo batch'}</Button>
              <Button type="button" variant="secondary" onClick={resetBatchForm}>Làm mới form</Button>
            </div>
          </form>

          <h3 className="top-gap">Danh sách batch</h3>
          <div className="form-grid">
            {batches.length === 0 ? <p>Chưa có batch.</p> : null}
            {batches.map((batch) => {
              const isActive = String(batch.batchId) === String(selectedBatchId)
              return (
                <div key={batch.batchId} className="business-card">
                  <div>
                    <strong>{batch.batchCode}</strong>
                    <p>Season ID: {batch.seasonId} | Product ID: {batch.productId}</p>
                    <p>Quantity: {batch.availableQuantity}/{batch.quantity}</p>
                    <p>Status: {batch.batchStatus}</p>
                    <p>Harvest: {formatDate(batch.harvestDate)} | Expiry: {formatDate(batch.expiryDate)}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => fillBatch(batch)}>Sửa</Button>
                    <Button variant="secondary" onClick={() => handleGenerateQr(batch.batchId)}>Tạo QR</Button>
                    <Button variant={isActive ? 'primary' : 'secondary'} onClick={() => handleLoadTrace(batch.batchId)}>
                      {isActive ? 'Đang xem trace' : 'Xem trace'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </article>

        <article className="glass-card">
          <h3>Truy xuất nguồn gốc</h3>
          {traceResult?.batch ? (
            <div className="form-grid">
              <div className="business-card">
                <div>
                  <strong>{traceResult.batch.batchCode}</strong>
                  <p>Harvest: {formatDate(traceResult.batch.harvestDate)}</p>
                  <p>Quality: {traceResult.batch.qualityGrade}</p>
                  <p>Status: {traceResult.batch.batchStatus}</p>
                  <p>Available: {traceResult.batch.availableQuantity}/{traceResult.batch.quantity}</p>
                </div>
              </div>

              <div className="business-card">
                <div>
                  <strong>Season info</strong>
                  <p>Code: {traceResult.seasonInfo?.seasonCode}</p>
                  <p>Farm: {traceResult.seasonInfo?.farmName}</p>
                  <p>Farm code: {traceResult.seasonInfo?.farmCode || 'N/A'}</p>
                  <p>Method: {traceResult.seasonInfo?.farmingMethod}</p>
                  <p>Start: {formatDate(traceResult.seasonInfo?.startDate)}</p>
                </div>
              </div>

              <div className="business-card">
                <div>
                  <strong>QR info</strong>
                  <p>Serial: {traceResult.qrInfo?.serialNo || 'Chưa tạo'}</p>
                  <p>URL: {traceResult.qrInfo?.qrUrl || 'Chưa tạo'}</p>
                  <p>Payload: {traceResult.qrInfo?.qrValue || 'Chưa tạo'}</p>
                  <div className="flex gap-3">
                    <Button type="button" variant="secondary" onClick={handleCopyQrUrl} disabled={!traceResult.qrInfo?.qrUrl}>Copy URL</Button>
                  </div>
                  {traceResult.qrInfo?.qrImageBase64 ? <img alt="QR batch" src={`data:image/png;base64,${traceResult.qrInfo.qrImageBase64}`} style={{ maxWidth: 180, marginTop: 12 }} /> : null}
                </div>
              </div>

              <div className="business-card">
                <div>
                  <strong>Blockchain verify</strong>
                  <p>Batch ID: {verifyResult?.batchId || selectedBatch?.batchId || 'N/A'}</p>
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
                        Bước {item.stepNo}: {item.stepName} ({formatDateTime(item.performedAt)})
                      </li>
                    ))}
                  </ul>
                  {traceResult.note ? <p>{traceResult.note}</p> : null}
                </div>
              </div>
            </div>
          ) : <p>Chọn một batch để xem truy xuất nguồn gốc.</p>}
        </article>
      </div>
    </section>
  )
}
