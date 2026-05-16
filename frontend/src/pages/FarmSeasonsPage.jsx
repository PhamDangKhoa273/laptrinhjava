import { useEffect, useMemo, useState } from 'react'
import '../shipping-workspace.css'
import {
  createSeason,
  createSeasonProcess,
  deleteSeasonProcess,
  getPhase3FarmContext,
  getSeasonProcesses,
  getSeasons,
  updateSeason,
  updateSeasonProcess,
  updateSeasonStatus,
} from '../services/phase3Service'
import { suggestProduct } from '../services/adminService'
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

const initialProcessForm = { stepNo: '', stepName: '', performedAt: '', description: '', imageUrl: '' }

const seasonStatuses = ['PLANNED', 'IN_PROGRESS', 'HARVESTED', 'COMPLETED']

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
        <div>
          <p>{eyebrow}</p>
          <h2>{title}</h2>
          <span>{subtitle}</span>
        </div>
        <div className="ship-actions">{actions}</div>
      </div>
      {loading ? <div className="ship-alert neutral">Đang đồng bộ dữ liệu mùa vụ...</div> : null}
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

function buildSeasonCode(farmCode) {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  return `${farmCode || 'SEASON'}-${stamp}`
}

function fmtDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString('vi-VN')
}

function fmtDateTime(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString('vi-VN')
}

export function FarmSeasonsPage() {
  const [farmContext, setFarmContext] = useState(null)
  const [products, setProducts] = useState([])
  const [seasons, setSeasons] = useState([])
  const [selectedSeasonId, setSelectedSeasonId] = useState('')
  const [editingSeasonId, setEditingSeasonId] = useState('')
  const [seasonForm, setSeasonForm] = useState(initialSeasonForm)
  const [processForm, setProcessForm] = useState(initialProcessForm)
  const [editingProcessId, setEditingProcessId] = useState('')
  const [seasonTimeline, setSeasonTimeline] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingProcess, setSavingProcess] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true)
    try {
      const [ctx, list] = await Promise.all([getPhase3FarmContext(), getSeasons()])
      setFarmContext(ctx.farm)
      setProducts(ctx.products)
      const arr = Array.isArray(list) ? list : []
      setSeasons(arr)
      // Auto-select first season for immediate timeline visibility.
      if (arr.length > 0 && !selectedSeasonId) {
        setSelectedSeasonId(String(arr[0].id))
      }
      setSeasonForm((prev) => ({
        ...prev,
        farmId: ctx.farm?.farmId ? String(ctx.farm.farmId) : prev.farmId,
        productId: ctx.products?.[0]?.productId ? String(ctx.products[0].productId) : prev.productId,
        seasonCode: prev.seasonCode || buildSeasonCode(ctx.farm?.farmCode),
      }))
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được dữ liệu mùa vụ.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!selectedSeasonId) { setSeasonTimeline(null); return }
    let mounted = true
    getSeasonProcesses(selectedSeasonId)
      .then((data) => { if (mounted) setSeasonTimeline(data) })
      .catch((err) => { if (mounted) setError(getErrorMessage(err, 'Không tải được timeline.')) })
    return () => { mounted = false }
  }, [selectedSeasonId])

  const stats = useMemo(() => {
    const inProgress = seasons.filter((s) => s.seasonStatus === 'IN_PROGRESS').length
    const harvested = seasons.filter((s) => ['HARVESTED', 'COMPLETED'].includes(s.seasonStatus)).length
    const planned = seasons.filter((s) => s.seasonStatus === 'PLANNED').length
    return { total: seasons.length, inProgress, harvested, planned }
  }, [seasons])

  function handleSeasonChange(e) {
    const { name, value } = e.target
    setSeasonForm((prev) => ({ ...prev, [name]: value }))
  }

  function fillSeason(season) {
    setEditingSeasonId(String(season.id))
    setSeasonForm({
      farmId: String(season.farmId || farmContext?.farmId || ''),
      productId: String(season.productId || ''),
      seasonCode: season.seasonCode || '',
      startDate: season.startDate ? String(season.startDate).slice(0, 10) : '',
      expectedHarvestDate: season.expectedHarvestDate ? String(season.expectedHarvestDate).slice(0, 10) : '',
      actualHarvestDate: season.actualHarvestDate ? String(season.actualHarvestDate).slice(0, 10) : '',
      farmingMethod: season.farmingMethod || '',
      seasonStatus: season.seasonStatus || 'PLANNED',
    })
    setSelectedSeasonId(String(season.id))
  }

  function resetForm() {
    setEditingSeasonId('')
    setSeasonForm({
      ...initialSeasonForm,
      farmId: farmContext?.farmId ? String(farmContext.farmId) : '',
      productId: products[0]?.productId ? String(products[0].productId) : '',
      seasonCode: buildSeasonCode(farmContext?.farmCode),
    })
  }

  async function submitSeason(e) {
    e.preventDefault()
    setSaving(true)
    setError(''); setSuccess('')
    try {
      const payload = {
        farmId: Number(seasonForm.farmId),
        productId: Number(seasonForm.productId),
        seasonCode: seasonForm.seasonCode.trim(),
        startDate: seasonForm.startDate || null,
        expectedHarvestDate: seasonForm.expectedHarvestDate || null,
        actualHarvestDate: seasonForm.actualHarvestDate || null,
        farmingMethod: seasonForm.farmingMethod.trim(),
        seasonStatus: seasonForm.seasonStatus,
      }
      if (editingSeasonId) {
        await updateSeason(editingSeasonId, payload)
        setSuccess('Đã cập nhật mùa vụ.')
      } else {
        await createSeason(payload)
        setSuccess('Đã tạo mùa vụ và commit blockchain.')
      }
      resetForm()
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'Không lưu được mùa vụ.'))
    } finally {
      setSaving(false)
    }
  }

  function handleProcessChange(e) {
    const { name, value } = e.target
    setProcessForm((prev) => ({ ...prev, [name]: value }))
  }

  function resetProcessForm() {
    setEditingProcessId('')
    setProcessForm(initialProcessForm)
  }

  async function submitProcess(e) {
    e.preventDefault()
    if (!selectedSeasonId) {
      setError('Hãy chọn 1 mùa vụ trước khi thêm bước quy trình.')
      return
    }
    setSavingProcess(true)
    setError(''); setSuccess('')
    try {
      const payload = {
        stepNo: Number(processForm.stepNo),
        stepName: processForm.stepName.trim(),
        performedAt: processForm.performedAt || null,
        description: processForm.description.trim(),
        imageUrl: processForm.imageUrl.trim() || null,
      }
      if (editingProcessId) {
        await updateSeasonProcess(selectedSeasonId, editingProcessId, payload)
        setSuccess('Đã cập nhật bước quy trình.')
      } else {
        await createSeasonProcess(selectedSeasonId, payload)
        setSuccess('Đã thêm bước quy trình.')
      }
      resetProcessForm()
      const fresh = await getSeasonProcesses(selectedSeasonId)
      setSeasonTimeline(fresh)
    } catch (err) {
      setError(getErrorMessage(err, 'Không lưu được bước quy trình.'))
    } finally {
      setSavingProcess(false)
    }
  }

  function fillProcess(step) {
    setEditingProcessId(String(step.processId || step.id))
    setProcessForm({
      stepNo: String(step.stepNo || ''),
      stepName: step.stepName || '',
      performedAt: step.performedAt ? String(step.performedAt).slice(0, 16) : '',
      description: step.description || '',
      imageUrl: step.imageUrl || '',
    })
  }

  async function handleDeleteProcess(processId) {
    if (!selectedSeasonId || !window.confirm('Xoá bước quy trình này?')) return
    setError(''); setSuccess('')
    try {
      await deleteSeasonProcess(selectedSeasonId, processId)
      setSuccess('Đã xoá bước.')
      const fresh = await getSeasonProcesses(selectedSeasonId)
      setSeasonTimeline(fresh)
    } catch (err) {
      setError(getErrorMessage(err, 'Không xoá được.'))
    }
  }

  const selectedSeason = useMemo(
    () => seasons.find((s) => String(s.id) === String(selectedSeasonId)) || null,
    [seasons, selectedSeasonId],
  )

  const [showSuggestModal, setShowSuggestModal] = useState(false)
  const [suggestForm, setSuggestForm] = useState({ productName: '', description: '' })
  const [suggesting, setSuggesting] = useState(false)

  // Status-only update modal (works after header lock).
  const [statusUpdate, setStatusUpdate] = useState(null) // { season, status, actualHarvestDate }
  const [updatingStatus, setUpdatingStatus] = useState(false)

  function openStatusUpdate(season) {
    const cur = String(season.seasonStatus || 'PLANNED').toUpperCase()
    // Suggest the next valid transition.
    const suggested = cur === 'PLANNED' ? 'IN_PROGRESS' : cur === 'IN_PROGRESS' ? 'HARVESTED' : cur === 'HARVESTED' ? 'COMPLETED' : cur
    setStatusUpdate({
      season,
      status: suggested,
      actualHarvestDate: season.actualHarvestDate ? String(season.actualHarvestDate).slice(0, 10) : '',
    })
  }

  async function submitStatusUpdate(e) {
    e.preventDefault()
    if (!statusUpdate) return
    setUpdatingStatus(true)
    setError('')
    setSuccess('')
    try {
      const payload = { seasonStatus: statusUpdate.status }
      if (statusUpdate.actualHarvestDate) payload.actualHarvestDate = statusUpdate.actualHarvestDate
      await updateSeasonStatus(statusUpdate.season.id, payload)
      setSuccess(`Đã cập nhật mùa vụ ${statusUpdate.season.seasonCode} sang ${statusUpdate.status}.`)
      setStatusUpdate(null)
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'Không cập nhật được trạng thái.'))
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleSuggestProduct(e) {
    e.preventDefault()
    if (!suggestForm.productName.trim()) {
      setError('Vui lòng nhập tên sản phẩm.')
      return
    }
    setSuggesting(true)
    setError('')
    setSuccess('')
    try {
      const created = await suggestProduct({
        productName: suggestForm.productName.trim(),
        description: suggestForm.description.trim() || null,
        status: 'ACTIVE',
      })
      setSuccess(`Đã thêm sản phẩm "${created.productName}" vào catalogue.`)
      setShowSuggestModal(false)
      setSuggestForm({ productName: '', description: '' })
      // Reload context to get the new product in dropdown.
      const ctx = await getPhase3FarmContext()
      setProducts(ctx.products)
      setSeasonForm((prev) => ({ ...prev, productId: String(created.productId) }))
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể thêm sản phẩm.'))
    } finally {
      setSuggesting(false)
    }
  }

  return (
    <section className="shipping-prototype-shell">
      <PageChrome
        eyebrow="Farm / Sản xuất / Mùa vụ"
        title="Quản lý Mùa vụ & Quy trình canh tác"
        subtitle={`${stats.total} mùa vụ • ${stats.inProgress} đang trồng • ${stats.harvested} đã thu hoạch · Click 1 dòng để xem chi tiết, blockchain proof, timeline quy trình`}
        loading={loading}
        error={error}
        success={success}
        actions={<button type="button" onClick={load}><Icon>refresh</Icon>Làm mới</button>}
      >
        <section className="ship-metrics four">
          <Metric icon="eco" label="Tổng số mùa vụ" value={stats.total} />
          <Metric icon="schedule" label="Đã lên kế hoạch" value={stats.planned} tone="amber" />
          <Metric icon="agriculture" label="Đang trồng" value={stats.inProgress} tone="blue" />
          <Metric icon="task_alt" label="Đã thu hoạch" value={stats.harvested} />
        </section>

        {farmContext && String(farmContext.approvalStatus).toUpperCase() !== 'APPROVED' ? (
          <article className="ship-card" style={{ marginBottom: 24, background: '#fff7ed', borderColor: '#fed7aa' }}>
            <div className="ship-card-head">
              <h3 style={{ color: '#9a3412' }}><Icon>schedule</Icon>Hồ sơ nông trại đang chờ admin duyệt</h3>
              <span className="ship-status pending">{farmContext.approvalStatus}</span>
            </div>
            <p style={{ color: '#9a3412', margin: 0 }}>
              Trạng thái hiện tại: <strong>{farmContext.approvalStatus}</strong>. Backend chỉ cho phép tạo mùa vụ khi farm <strong>APPROVED</strong>.
              {farmContext.reviewComment ? <> Ghi chú từ admin: <em>"{farmContext.reviewComment}"</em></> : null}
            </p>
            <p style={{ color: '#9a3412', margin: '8px 0 0', fontSize: 13 }}>
              Lưu ý: nếu bạn vừa cập nhật giấy phép kinh doanh, hồ sơ sẽ tự chuyển về PENDING để admin duyệt lại.
            </p>
          </article>
        ) : null}

        <div className="drivers-grid">
          <article className="ship-card">
            <div className="ship-card-head">
              <h3><Icon>list</Icon>Danh sách mùa vụ</h3>
              {!farmContext ? <a href="/farm/profile">Đăng ký nông trại</a> : null}
            </div>
            {!farmContext ? (
              <p>Bạn chưa đăng ký nông trại. <a href="/farm/profile">Tạo hồ sơ farm</a> trước khi tạo mùa vụ.</p>
            ) : seasons.length === 0 ? (
              <p>Chưa có mùa vụ nào. Dùng form bên cạnh để tạo mùa vụ đầu tiên.</p>
            ) : (
              <div className="ship-table-wrap">
                <table className="ship-table">
                  <thead>
                    <tr><th>Mã mùa vụ</th><th>Sản phẩm</th><th>Bắt đầu</th><th>Thu hoạch dự kiến</th><th>Trạng thái</th><th></th></tr>
                  </thead>
                  <tbody>
                    {seasons.map((s) => {
                      const isSelected = String(selectedSeasonId) === String(s.id)
                      return (
                        <tr
                          key={s.id}
                          onClick={() => setSelectedSeasonId(String(s.id))}
                          style={{
                            cursor: 'pointer',
                            background: isSelected ? '#e8f5e9' : undefined,
                          }}
                        >
                          <td><b>{s.seasonCode}</b><small>ID #{s.id}{isSelected ? ' · đang xem' : ''}</small></td>
                          <td>{s.productName || `#${s.productId}`}</td>
                          <td>{fmtDate(s.startDate)}</td>
                          <td>{fmtDate(s.expectedHarvestDate)}</td>
                          <td><Status value={s.seasonStatus} /></td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {String(s.seasonStatus).toUpperCase() === 'PLANNED' ? (
                                <button type="button" onClick={() => fillSeason(s)} title="Sửa thông tin mùa vụ (chỉ khi PLANNED)"><Icon>edit</Icon></button>
                              ) : null}
                              {String(s.seasonStatus).toUpperCase() !== 'COMPLETED' ? (
                                <button type="button" onClick={() => openStatusUpdate(s)} title="Cập nhật trạng thái mùa vụ" style={{ background: '#0d631b', color: '#fff' }}><Icon>update</Icon></button>
                              ) : (
                                <span title="Mùa vụ đã hoàn tất" style={{ color: 'var(--ship-muted)', padding: '6px 8px' }}><Icon>check_circle</Icon></span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          <article className="ship-card">
            <h3><Icon>{editingSeasonId ? 'edit' : 'add_circle'}</Icon>{editingSeasonId ? 'Cập nhật mùa vụ' : 'Tạo mùa vụ mới'}</h3>
            {editingSeasonId && String(seasonForm.seasonStatus).toUpperCase() !== 'PLANNED' ? (
              <div className="ship-alert danger" style={{ marginBottom: 12 }}>
                <strong>Header mùa vụ đã khóa.</strong> Mùa vụ ở trạng thái <b>{seasonForm.seasonStatus}</b>: bạn chỉ cập nhật được trạng thái và thêm bước quy trình bên dưới. Để chỉnh thông tin (mã, sản phẩm, ngày), tạo mùa vụ mới.
              </div>
            ) : null}
            <form className="ship-form" onSubmit={submitSeason}>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Mã mùa vụ <em style={{ color: 'var(--ship-danger)' }}>*</em></span>
                <input name="seasonCode" placeholder="VD: FARM-HUONG-001-20260516 (tự sinh)" value={seasonForm.seasonCode} onChange={handleSeasonChange} required disabled={Boolean(editingSeasonId)} />
                <small style={{ color: 'var(--ship-muted)' }}>Mã định danh duy nhất cho mùa vụ. Hệ thống đề xuất sẵn theo mã farm + ngày, bạn có thể đổi.</small>
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Trang trại</span>
                <div style={{ padding: '10px 12px', borderRadius: 8, background: '#f7faf7', border: '1px solid var(--ship-border)', fontWeight: 700, color: '#0f172a' }}>
                  {farmContext?.farmName || 'Chưa đăng ký farm'}
                </div>
                <small style={{ color: 'var(--ship-muted)' }}>{farmContext ? `Mã farm: ${farmContext.farmCode}` : 'Đăng ký farm ở trang Hồ sơ farm trước'}</small>
                <input type="hidden" name="farmId" value={seasonForm.farmId} />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Sản phẩm canh tác <em style={{ color: 'var(--ship-danger)' }}>*</em></span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'stretch' }}>
                  <select name="productId" value={seasonForm.productId} onChange={handleSeasonChange} required style={{ flex: 1 }}>
                    <option value="">— Chọn sản phẩm —</option>
                    {products.map((p) => <option key={p.productId} value={p.productId}>{p.productName}</option>)}
                  </select>
                  <button type="button" onClick={() => setShowSuggestModal(true)} title="Thêm sản phẩm mới vào catalogue" style={{ padding: '0 12px', whiteSpace: 'nowrap', background: '#f0f7f1', color: '#0d631b', border: '1px solid var(--ship-border)', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                    + Thêm
                  </button>
                </div>
                <small style={{ color: 'var(--ship-muted)' }}>Không thấy loại nông sản bạn trồng? Bấm "+ Thêm" để bổ sung vào catalogue.</small>
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Ngày bắt đầu trồng <em style={{ color: 'var(--ship-danger)' }}>*</em></span>
                <input type="date" name="startDate" value={seasonForm.startDate} onChange={handleSeasonChange} required />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Ngày thu hoạch dự kiến <em style={{ color: 'var(--ship-danger)' }}>*</em></span>
                <input type="date" name="expectedHarvestDate" value={seasonForm.expectedHarvestDate} onChange={handleSeasonChange} required />
                <small style={{ color: 'var(--ship-muted)' }}>Có thể cập nhật lại sau khi thu hoạch xong.</small>
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Ngày thu hoạch thực tế</span>
                <input type="date" name="actualHarvestDate" value={seasonForm.actualHarvestDate} onChange={handleSeasonChange} />
                <small style={{ color: 'var(--ship-muted)' }}>Để trống khi mới tạo. Cập nhật khi đã thu hoạch xong.</small>
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Phương pháp canh tác</span>
                <input name="farmingMethod" placeholder="VD: Hữu cơ, VietGAP, GlobalGAP, Truyền thống..." value={seasonForm.farmingMethod} onChange={handleSeasonChange} />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Trạng thái</span>
                <select name="seasonStatus" value={seasonForm.seasonStatus} onChange={handleSeasonChange}>
                  <option value="PLANNED">Lên kế hoạch</option>
                  <option value="IN_PROGRESS">Đang trồng</option>
                  <option value="HARVESTED">Đã thu hoạch</option>
                  <option value="COMPLETED">Đã hoàn tất</option>
                </select>
                <small style={{ color: 'var(--ship-muted)' }}>Mặc định "Lên kế hoạch" khi tạo mới. Cập nhật theo tiến độ thực tế.</small>
              </label>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="submit" disabled={saving || !farmContext}>{saving ? 'Đang lưu...' : (editingSeasonId ? 'Cập nhật mùa vụ' : 'Tạo mùa vụ')}</button>
                {editingSeasonId ? <button type="button" onClick={resetForm}>Huỷ</button> : null}
              </div>
              {!farmContext ? <small style={{ color: 'var(--ship-danger)' }}>Cần đăng ký farm trước khi tạo mùa vụ.</small> : null}
            </form>
          </article>
        </div>

        <article className="ship-card" style={{ marginTop: 24 }}>
          <div className="ship-card-head">
            <h3><Icon>timeline</Icon>Chi tiết mùa vụ {selectedSeason ? `· ${selectedSeason.seasonCode}` : ''}</h3>
            {selectedSeason ? <span className="live-pill"><i />Đang xem #{selectedSeason.id}</span> : null}
          </div>

          {!selectedSeasonId ? (
            <p>Click 1 dòng ở bảng trên để xem chi tiết mùa vụ và quy trình canh tác.</p>
          ) : (
            <>
              {/* Detail summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, padding: 16, background: '#f7faf7', borderRadius: 12, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--ship-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Sản phẩm</div>
                  <strong>{selectedSeason?.productName || '—'}</strong>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--ship-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Phương pháp</div>
                  <strong>{selectedSeason?.farmingMethod || '—'}</strong>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--ship-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Trạng thái</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Status value={selectedSeason?.seasonStatus} />
                    {selectedSeason && String(selectedSeason.seasonStatus).toUpperCase() !== 'COMPLETED' ? (
                      <button type="button" onClick={() => openStatusUpdate(selectedSeason)} style={{ padding: '4px 10px', fontSize: 12, background: '#0d631b', color: '#fff' }}><Icon>update</Icon>Cập nhật</button>
                    ) : null}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--ship-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Bắt đầu → Thu hoạch</div>
                  <strong>{fmtDate(selectedSeason?.startDate)} → {fmtDate(selectedSeason?.expectedHarvestDate)}</strong>
                </div>
                <div style={{ gridColumn: '1 / -1', paddingTop: 12, borderTop: '1px solid var(--ship-border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--ship-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Blockchain proof (VeChainThor)</div>
                  {selectedSeason?.txHash ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span className="success-pill">{selectedSeason.blockchainStatus || 'COMMITTED'}</span>
                      <code style={{ fontSize: 12, padding: '4px 8px', background: '#fff', border: '1px solid var(--ship-border)', borderRadius: 6, wordBreak: 'break-all' }}>{selectedSeason.txHash}</code>
                      <button type="button" onClick={() => navigator.clipboard?.writeText(selectedSeason.txHash)}><Icon>content_copy</Icon>Copy</button>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--ship-muted)', fontSize: 13 }}>Mùa vụ này chưa có blockchain commit.</span>
                  )}
                </div>
              </div>
              <h4 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800 }}>Quy trình canh tác · {seasonTimeline?.steps?.length || 0} bước</h4>
              <form className="ship-form" onSubmit={submitProcess} style={{ marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 12 }}>
                  <label style={{ display: 'grid', gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Số thứ tự <em style={{ color: 'var(--ship-danger)' }}>*</em></span>
                    <input name="stepNo" type="number" min="1" placeholder="1" value={processForm.stepNo} onChange={handleProcessChange} required />
                  </label>
                  <label style={{ display: 'grid', gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Tên bước <em style={{ color: 'var(--ship-danger)' }}>*</em></span>
                    <input name="stepName" placeholder="VD: Gieo hạt, Bón phân đợt 1, Tưới tiêu, Thu hoạch" value={processForm.stepName} onChange={handleProcessChange} required />
                  </label>
                  <label style={{ display: 'grid', gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Thực hiện lúc <em style={{ color: 'var(--ship-danger)' }}>*</em></span>
                    <input type="datetime-local" name="performedAt" value={processForm.performedAt} onChange={handleProcessChange} required />
                  </label>
                </div>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Mô tả chi tiết</span>
                  <textarea name="description" placeholder="VD: Sử dụng phân hữu cơ vi sinh kết hợp NPK 16-16-8, mỗi gốc 200g..." value={processForm.description} onChange={handleProcessChange} rows={2} />
                </label>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Ảnh minh chứng (URL)</span>
                  <input name="imageUrl" placeholder="https://... (tùy chọn)" value={processForm.imageUrl} onChange={handleProcessChange} />
                </label>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="submit" disabled={savingProcess}>{savingProcess ? 'Đang lưu...' : (editingProcessId ? 'Cập nhật bước' : 'Thêm bước')}</button>
                  {editingProcessId ? <button type="button" onClick={resetProcessForm}>Huỷ</button> : null}
                </div>
              </form>

              <div className="ship-timeline">
                {seasonTimeline?.steps?.length ? (
                  seasonTimeline.steps.map((step) => (
                    <div key={step.processId || step.id}>
                      <i />
                      <strong>Bước {step.stepNo}: {step.stepName}</strong>
                      <p>{fmtDateTime(step.performedAt)}{step.description ? ` · ${step.description}` : ''}</p>
                      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                        <button type="button" onClick={() => fillProcess(step)}><Icon>edit</Icon>Sửa</button>
                        <button type="button" onClick={() => handleDeleteProcess(step.processId || step.id)} style={{ color: 'var(--ship-danger)' }}><Icon>delete</Icon>Xoá</button>
                      </div>
                    </div>
                  ))
                ) : <p>Chưa có bước quy trình.</p>}
              </div>
            </>
          )}
        </article>
      </PageChrome>

      {showSuggestModal ? (
        <div onClick={() => setShowSuggestModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={handleSuggestProduct} style={{ background: '#fff', borderRadius: 16, padding: 24, width: 480, maxWidth: '100%', boxShadow: '0 24px 60px rgba(0,0,0,.25)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Thêm sản phẩm mới</h3>
            <p style={{ margin: '0 0 20px', color: 'var(--ship-muted)', fontSize: 13 }}>Bổ sung loại nông sản bạn trồng vào catalogue chung của BICAP. Admin có thể chỉnh sửa thông tin sau.</p>
            <label style={{ display: 'grid', gap: 4, marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Tên sản phẩm <em style={{ color: 'var(--ship-danger)' }}>*</em></span>
              <input
                value={suggestForm.productName}
                onChange={(e) => setSuggestForm({ ...suggestForm, productName: e.target.value })}
                placeholder="VD: Sầu riêng Ri6, Bưởi da xanh, Vải thiều Lục Ngạn..."
                required
                autoFocus
                style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--ship-border)' }}
              />
            </label>
            <label style={{ display: 'grid', gap: 4, marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Mô tả ngắn (tùy chọn)</span>
              <textarea
                value={suggestForm.description}
                onChange={(e) => setSuggestForm({ ...suggestForm, description: e.target.value })}
                placeholder="Đặc điểm, vùng trồng phổ biến..."
                rows={3}
                style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--ship-border)', resize: 'vertical' }}
              />
            </label>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowSuggestModal(false)} disabled={suggesting} style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid var(--ship-border)', background: '#fff', cursor: 'pointer', fontWeight: 700 }}>Huỷ</button>
              <button type="submit" disabled={suggesting} style={{ padding: '10px 18px', borderRadius: 8, border: 0, background: '#0d631b', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>{suggesting ? 'Đang thêm...' : 'Thêm sản phẩm'}</button>
            </div>
          </form>
        </div>
      ) : null}

      {statusUpdate ? (
        <div onClick={() => setStatusUpdate(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={submitStatusUpdate} style={{ background: '#fff', borderRadius: 16, padding: 24, width: 480, maxWidth: '100%', boxShadow: '0 24px 60px rgba(0,0,0,.25)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Cập nhật trạng thái mùa vụ</h3>
            <p style={{ margin: '0 0 8px', color: 'var(--ship-muted)', fontSize: 13 }}>
              Mùa vụ <strong>{statusUpdate.season.seasonCode}</strong> · Hiện tại: <strong>{statusUpdate.season.seasonStatus}</strong>
            </p>
            <p style={{ margin: '0 0 20px', color: 'var(--ship-muted)', fontSize: 13 }}>
              Lưu ý: Quy trình PLANNED → IN_PROGRESS → HARVESTED → COMPLETED. Mỗi lần chuyển trạng thái commit blockchain.
            </p>
            <label style={{ display: 'grid', gap: 4, marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Trạng thái mới <em style={{ color: 'var(--ship-danger)' }}>*</em></span>
              <select
                value={statusUpdate.status}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                required
                style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--ship-border)' }}
              >
                <option value="PLANNED">Lên kế hoạch (PLANNED)</option>
                <option value="IN_PROGRESS">Đang trồng (IN_PROGRESS)</option>
                <option value="HARVESTED">Đã thu hoạch (HARVESTED)</option>
                <option value="COMPLETED">Đã hoàn tất (COMPLETED)</option>
              </select>
            </label>
            {(statusUpdate.status === 'HARVESTED' || statusUpdate.status === 'COMPLETED') ? (
              <label style={{ display: 'grid', gap: 4, marginBottom: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Ngày thu hoạch thực tế</span>
                <input
                  type="date"
                  value={statusUpdate.actualHarvestDate}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, actualHarvestDate: e.target.value })}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--ship-border)' }}
                />
                <small style={{ color: 'var(--ship-muted)' }}>Bỏ trống nếu giữ ngày cũ.</small>
              </label>
            ) : null}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setStatusUpdate(null)} disabled={updatingStatus} style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid var(--ship-border)', background: '#fff', cursor: 'pointer', fontWeight: 700 }}>Huỷ</button>
              <button type="submit" disabled={updatingStatus} style={{ padding: '10px 18px', borderRadius: 8, border: 0, background: '#0d631b', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>{updatingStatus ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}</button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  )
}
