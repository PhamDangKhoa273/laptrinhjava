import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getPrimaryRole } from '../utils/helpers'
import { ROLES } from '../utils/constants'
import '../driver-workspace.css'
import {
  driverAddCheckpoint,
  driverConfirmHandover,
  driverConfirmPickup,
  driverReportIssue,
  getMyShipments,
  getShipmentById,
} from '../services/workflowService.js'
import { uploadShippingProofFile } from '../services/mediaService.js'
import { getErrorMessage } from '../utils/helpers'

const TABS = [
  { key: 'trips', label: 'Tuyến', icon: 'local_shipping' },
  { key: 'scan', label: 'QR', icon: 'qr_code_scanner' },
  { key: 'actions', label: 'Thao tác', icon: 'handyman' },
  { key: 'report', label: 'Báo cáo', icon: 'warning' },
]

const STATUS_STEPS = ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CONFIRMED']
const ACTIVE_STATUSES = ['CREATED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT']
const COMPLETE_STATUSES = ['DELIVERED', 'CONFIRMED']
const LOCKED_STATUSES = ['CONFIRMED', 'CANCELLED', 'REJECTED', 'DISPUTED', 'ESCALATED']
const STATUS_LABELS = {
  ASSIGNED: 'Đã phân công',
  PICKED_UP: 'Đã nhận hàng',
  IN_TRANSIT: 'Đang giao',
  DELIVERED: 'Đã giao',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
  WAITING: 'Đang chờ',
}
const ISSUE_LABELS = {
  ACCIDENT: 'Tai nạn',
  BREAKDOWN: 'Xe hỏng',
  DELAY: 'Chậm trễ',
  DAMAGED: 'Hư hỏng',
  THEFT: 'Mất hàng',
  OTHER: 'Khác',
}

const MODULE_TAB_MAP = {
  shipments: 'trips',
  qr: 'scan',
  pickup: 'actions',
  checkpoint: 'actions',
  handover: 'actions',
  report: 'report',
}

function stepIndex(status) {
  return STATUS_STEPS.indexOf(String(status || '').toUpperCase())
}

function normalizeStatus(status) {
  return String(status || '').toUpperCase()
}

function isActiveStatus(status) {
  return ACTIVE_STATUSES.includes(normalizeStatus(status))
}

function isLockedStatus(status) {
  return LOCKED_STATUSES.includes(normalizeStatus(status))
}

function nextStepLabel(status) {
  const normalized = normalizeStatus(status)
  if (normalized === 'ASSIGNED') return 'Nhận hàng'
  if (normalized === 'PICKED_UP') return 'Ghi điểm'
  if (normalized === 'IN_TRANSIT') return 'Bàn giao'
  if (normalized === 'DELIVERED') return 'Chờ xác nhận'
  if (normalized === 'CONFIRMED') return 'Hoàn tất'
  if (isLockedStatus(normalized)) return 'Không thao tác'
  return 'Chờ phân công'
}

function safeList(list) {
  return Array.isArray(list) ? list : []
}

function normalizeScannedCode(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''
  try {
    const url = new URL(raw, 'https://bicap.local')
    const queryCode = url.searchParams.get('traceCode') || url.searchParams.get('batchCode') || url.searchParams.get('batchId')
    if (queryCode) return queryCode.trim()
    const pathCode = url.pathname.split('/').filter(Boolean).pop()
    return pathCode || raw
  } catch {
    return raw
  }
}

function compactCode(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

function shipmentMatchesScannedCode(item, value) {
  const code = compactCode(normalizeScannedCode(value))
  if (!code || !item) return false
  const candidates = [item.traceCode, item.batchCode, item.batchId, item.shipmentId, item.qrCodeUrl].map((candidate) => compactCode(normalizeScannedCode(candidate)))
  return candidates.includes(code)
}

function findAssignedShipmentByCode(shipments, value) {
  const matches = safeList(shipments).filter((item) => shipmentMatchesScannedCode(item, value))
  const priority = ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'CREATED', 'DELIVERED', 'CONFIRMED']
  return matches.sort((a, b) => priority.indexOf(normalizeStatus(a.status)) - priority.indexOf(normalizeStatus(b.status)))[0] || null
}

function displayStatus(value) {
  return STATUS_LABELS[String(value || 'WAITING').toUpperCase()] || value || 'Đang chờ'
}

export function DriverMobilePage({ module = 'shipments' }) {
  const [activeTab, setActiveTab] = useState(MODULE_TAB_MAP[module] || 'trips')
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const role = getPrimaryRole(user)
  const isDriver = role === ROLES.DRIVER
  const [shipments, setShipments] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [checkpointNote, setCheckpointNote] = useState('')
  const [checkpointLocation, setCheckpointLocation] = useState('')
  const [handoverNote, setHandoverNote] = useState('')
  const [handoverProof, setHandoverProof] = useState('')
  const [handoverProofFile, setHandoverProofFile] = useState(null)
  const [reportForm, setReportForm] = useState({ issueType: 'DELAY', description: '', severity: 'MEDIUM' })
  const scannerRef = useRef(null)

  useEffect(() => {
    setActiveTab(MODULE_TAB_MAP[module] || 'trips')
  }, [module])

  useEffect(() => {
    if (user?.userId || user?.email) loadShipments()
  }, [user?.userId, user?.email])

  useEffect(() => {
    let cancelled = false
    if (!scannerOpen) {
      scannerRef.current?.clear?.().catch(() => {})
      scannerRef.current = null
      return
    }
    async function mountScanner() {
      const { Html5QrcodeScanner } = await import('html5-qrcode')
      if (cancelled) return
      const scanner = new Html5QrcodeScanner('mobile-qr-reader', { fps: 10, qrbox: { width: 220, height: 220 }, rememberLastUsedCamera: true }, false)
      scannerRef.current = scanner
      scanner.render(
        (decodedText) => { setQrCode(decodedText); setSuccess('Đã quét mã'); setScannerOpen(false) },
        () => {}
      )
    }
    mountScanner().catch(() => setError('Không thể mở camera'))
    return () => { cancelled = true; scannerRef.current?.clear?.().catch(() => {}); scannerRef.current = null }
  }, [scannerOpen])

  useEffect(() => {
    if (!qrCode) return
    const normalizedCode = normalizeScannedCode(qrCode)
    if (normalizedCode !== qrCode) {
      setQrCode(normalizedCode)
      return
    }
    const matched = findAssignedShipmentByCode(shipments, normalizedCode)
    if (matched) {
      if (selectedId !== matched.shipmentId) setSelectedId(matched.shipmentId)
      setError('')
      return
    }
    setSuccess('')
    setError('Mã QR này không thuộc chuyến hàng đang được gán cho tài xế.')
  }, [qrCode, selectedId, shipments])

  async function loadShipments() {
    setError('')
    try {
      const data = await getMyShipments()
      const list = Array.isArray(data) ? data : []
      setShipments(list)
      if (!selectedId && list[0]?.shipmentId) setSelectedId(list[0].shipmentId)
      setError('')
    } catch { setShipments([]); setSelectedId(null); setError('Không tải được danh sách chuyến hàng.') }
    finally { setLoading(false) }
  }

  async function handleSelectShipment(id) {
    setSelectedId(id)
    setError('')
    try {
      const data = await getShipmentById(id)
      if (data) setShipments((items) => items.map((item) => String(item.shipmentId) === String(id) ? { ...item, ...data } : item))
      setError('')
    } catch { setError('Không tải được chi tiết chuyến.') }
  }

  const current = useMemo(() => shipments.find(s => String(s.shipmentId) === String(selectedId)) || shipments[0] || null, [shipments, selectedId])
  const activeShipments = useMemo(() => shipments.filter(s => isActiveStatus(s.status)), [shipments])
  const displayName = user?.fullName || user?.email || 'Driver'
  const roleLabel = role === ROLES.DRIVER ? 'Tài xế' : 'Người dùng'

  async function runAction(callback, okMsg, failMsg) {
    if (!current?.shipmentId || actionLoading) return
    setActionLoading(true); setError(''); setSuccess('')
    try {
      await callback(current.shipmentId)
      setSuccess(okMsg)
      await handleSelectShipment(current.shipmentId)
      await loadShipments()
    } catch (err) { setError(getErrorMessage(err, failMsg)) }
    finally { setActionLoading(false) }
  }

  const doPickup = () => runAction(
    id => driverConfirmPickup(id, { qrCode: qrCode || current.traceCode, expectedCode: current.traceCode || current.batchCode || '', note: 'Pickup confirmed', location: 'At Farm' }),
    'Đã xác nhận nhận hàng', 'Xác nhận nhận hàng thất bại'
  )
  const doCheckpoint = () => runAction(
    id => driverAddCheckpoint(id, { type: 'CHECKPOINT', note: checkpointNote || 'Checkpoint', location: checkpointLocation || 'En route', qrEvidence: qrCode }),
    'Đã ghi checkpoint', 'Không thể ghi checkpoint'
  )
  const doHandover = () => runAction(
    async id => {
      const proof = handoverProofFile && current?.orderId
        ? await uploadShippingProofFile(current.orderId, handoverProofFile)
        : null
      const evidence = proof?.fileUrl || handoverProof
      return driverConfirmHandover(id, { status: 'DELIVERED', note: handoverNote || 'Handover confirmed', evidence })
    },
    'Đã bàn giao thành công', 'Xác nhận bàn giao thất bại'
  )
  const doReport = () => runAction(
    id => driverReportIssue(id, reportForm),
    'Đã gửi báo cáo', 'Không thể gửi báo cáo'
  )

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const currentStatus = normalizeStatus(current?.status)
  const hasPickupQrMatch = current && shipmentMatchesScannedCode(current, qrCode)
  const canPickup = current && currentStatus === 'ASSIGNED' && hasPickupQrMatch
  const canCheckpoint = current && currentStatus === 'PICKED_UP'
  const canHandover = current && currentStatus === 'IN_TRANSIT' && Boolean(handoverProof || handoverProofFile)
  const totals = useMemo(() => ({
    active: activeShipments.length,
    all: shipments.length,
    delivered: shipments.filter((item) => COMPLETE_STATUSES.includes(normalizeStatus(item.status))).length,
    route: current ? `${current.farmName || 'Nông trại'} → ${current.retailerName || 'Nhà bán lẻ'}` : 'Chưa có tuyến',
  }), [activeShipments.length, current, shipments])

  function renderContent() {
    switch (activeTab) {
      case 'trips': return <TripsView shipments={shipments} current={current} selectedId={selectedId} onSelect={handleSelectShipment} loading={loading} />
      case 'scan': return <ScanView qrCode={qrCode} setQrCode={setQrCode} openScanner={() => setScannerOpen(true)} current={current} shipments={shipments} />
      case 'actions': return <ActionsView current={current} canPickup={canPickup} hasPickupQrMatch={hasPickupQrMatch} canCheckpoint={canCheckpoint} canHandover={canHandover} doPickup={doPickup} doCheckpoint={doCheckpoint} doHandover={doHandover} checkpointNote={checkpointNote} setCheckpointNote={setCheckpointNote} checkpointLocation={checkpointLocation} setCheckpointLocation={setCheckpointLocation} handoverNote={handoverNote} setHandoverNote={setHandoverNote} handoverProof={handoverProof} setHandoverProof={setHandoverProof} setHandoverProofFile={setHandoverProofFile} actionLoading={actionLoading} />
      case 'report': return <ReportView form={reportForm} setForm={setReportForm} onSubmit={doReport} actionLoading={actionLoading} />
      default: return null
    }
  }

  return (
    <section className="driver-mobile-shell driver-mobile-workspace">
      <header className="mobile-header">
        <div className="mobile-header-left">
          <span className="mobile-header-brand">BICAP Driver</span>
          <span className="mobile-header-badge">{activeShipments.length} tuyến</span>
        </div>
        <div className="mobile-header-actions">
          <div className="mobile-user-chip" title={displayName}>
            <span className="mobile-user-avatar">{displayName.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{displayName}</strong>
              <small>{roleLabel}</small>
            </div>
          </div>
          <button className="mobile-header-refresh" onClick={loadShipments} disabled={loading} aria-label="Làm mới">
            <span className="material-symbols-outlined">refresh</span>
          </button>
          <button className="mobile-header-logout" onClick={handleLogout} aria-label="Đăng xuất">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      <section className="mobile-summary-hero mobile-summary-bento">
        <div className="mobile-summary-copy">
          <small>Ứng dụng tài xế</small>
          <h1>{current ? `Chuyến #${current.shipmentId}` : 'Bảng điều khiển'}</h1>
          <p>{totals.route}</p>
        </div>
        <div className="mobile-summary-metrics">
          <div>
            <strong>{totals.active}</strong>
            <span>Đang mở</span>
          </div>
          <div>
            <strong>{totals.delivered}</strong>
            <span>Đã giao</span>
          </div>
          <div>
            <strong>{totals.all}</strong>
            <span>Tổng chuyến</span>
          </div>
        </div>
      </section>

      <section className="mobile-metrics">
        <article className="mobile-metric-card">
          <small>Trạng thái</small>
          <strong>{displayStatus(current?.status || 'WAITING')}</strong>
          <span>{current ? `#${current.shipmentId}` : 'Chưa được phân công'}</span>
        </article>
        <article className="mobile-metric-card">
          <small>Mã truy xuất</small>
          <strong>{current?.traceCode || qrCode || 'N/A'}</strong>
          <span>Mã xác thực hiện tại</span>
        </article>
        <article className="mobile-metric-card">
          <small>Bước tiếp theo</small>
          <strong>{nextStepLabel(current?.status)}</strong>
          <span>Theo trạng thái chuyến</span>
        </article>
      </section>

      <nav className="mobile-tab-strip" aria-label="Driver tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            className={`mobile-tab-button ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="material-symbols-outlined">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {isDriver ? null : <div className="mobile-alert error">Tài khoản này chưa có quyền tài xế.</div>}

      {error ? <div className="mobile-alert error">{error}</div> : null}
      {success ? <div className="mobile-alert success">{success}</div> : null}

      {scannerOpen && (
        <div className="mobile-scanner-overlay">
          <div className="mobile-scanner-box">
            <div id="mobile-qr-reader" />
            <button className="mobile-scanner-close" onClick={() => setScannerOpen(false)}>Đóng</button>
          </div>
        </div>
      )}

      <div className="mobile-content">
        <div className="mobile-bento">
          <article className="mobile-card mobile-main-card">
            {renderContent()}
          </article>
        </div>

        <article className="mobile-card mobile-route-card">
          <div className="mobile-card-head">
            <div>
              <p>Tuyến hiện tại</p>
              <h3>{current ? `#${current.shipmentId}` : 'Chưa có chuyến'}</h3>
            </div>
            <span className={`mobile-status ${current ? `status-${String(current.status).toLowerCase()}` : 'status-assigned'}`}>{displayStatus(current?.status)}</span>
          </div>
          <div className="mobile-route-stack">
            <div className="mobile-route-point">
              <span className="material-symbols-outlined">location_on</span>
              <div>
                <small>Điểm lấy</small>
                <strong>{current?.farmName || 'Chưa xác định'}</strong>
              </div>
            </div>
            <div className="mobile-route-line" />
            <div className="mobile-route-point">
              <span className="material-symbols-outlined">flag</span>
              <div>
                <small>Điểm giao</small>
                <strong>{current?.retailerName || 'Chưa xác định'}</strong>
              </div>
            </div>
          </div>
        </article>
      </div>

      {actionLoading && <div className="mobile-loading-bar"><div className="mobile-loading-inner" /></div>}
    </section>
  )
}

function TripsView({ shipments, current, selectedId, onSelect, loading }) {
  return (
    <div className="mobile-trips">
      {current ? (
        <div className="mobile-current-trip">
          <div className="mobile-trip-header">
            <h2>Chuyến #{current.shipmentId}</h2>
            <span className={`mobile-status status-${String(current.status).toLowerCase()}`}>{displayStatus(current.status)}</span>
          </div>
          <div className="mobile-trip-route">
            <div className="mobile-route-point">
              <span className="material-symbols-outlined">location_on</span>
              <div><small>Điểm lấy</small><strong>{current.farmName || 'Chưa xác định'}</strong></div>
            </div>
            <div className="mobile-route-line" />
            <div className="mobile-route-point">
              <span className="material-symbols-outlined">flag</span>
              <div><small>Điểm giao</small><strong>{current.retailerName || 'Chưa xác định'}</strong></div>
            </div>
          </div>
          <div className="mobile-trip-meta">
            <span><span className="material-symbols-outlined">qr_code</span>{current.traceCode || 'Chưa có mã'}</span>
            <span><span className="material-symbols-outlined">directions_car</span>{current.vehiclePlateNo || 'N/A'}</span>
          </div>
          <div className="mobile-progress-steps">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className={`mobile-step ${stepIndex(current.status) >= i ? 'done' : ''}`}>
                <div className="mobile-step-dot" />
                <span>{s === 'ASSIGNED' ? 'Phân công' : s === 'PICKED_UP' ? 'Nhận hàng' : s === 'IN_TRANSIT' ? 'Đang giao' : s === 'DELIVERED' ? 'Bàn giao' : 'Xác nhận'}</span>
              </div>
            ))}
          </div>
        </div>
      ) : loading ? (
        <div className="mobile-center">Đang tải...</div>
      ) : (
        <div className="mobile-empty-shell">
          <div className="mobile-empty-summary">
            <span className="material-symbols-outlined">local_shipping</span>
            <div>
              <h2>Chưa có chuyến hàng nào</h2>
              <p>Quản lý vận chuyển chưa gán chuyến cho tài xế.</p>
            </div>
          </div>

          <div className="mobile-empty-grid">
            <article className="mobile-mini-card">
              <small>Tổng tuyến</small>
              <strong>0</strong>
              <span>Đang chờ phân công</span>
            </article>
            <article className="mobile-mini-card">
              <small>Trạng thái</small>
              <strong>Đang chờ</strong>
              <span>Chưa có chuyến</span>
            </article>
            <article className="mobile-mini-card">
              <small>Mã QR</small>
              <strong>N/A</strong>
              <span>Sẽ hiện khi có chuyến</span>
            </article>
          </div>

          <div className="mobile-empty-stack">
            <section className="mobile-empty-card">
              <h3>Xem trước tuyến</h3>
              <div className="mobile-empty-map">
                <span className="material-symbols-outlined">map</span>
                <small>Chưa có tuyến được gán</small>
              </div>
            </section>
            <section className="mobile-empty-card">
              <h3>Thao tác nhanh</h3>
              <div className="mobile-empty-actions">
                <button type="button"><span className="material-symbols-outlined">qr_code_scanner</span> QR</button>
                <button type="button"><span className="material-symbols-outlined">inventory_2</span> Nhận hàng</button>
                <button type="button"><span className="material-symbols-outlined">handshake</span> Bàn giao</button>
              </div>
            </section>
          </div>
        </div>
      )}

      <div className="mobile-trip-list">
        <h3>Danh sách tuyến ({shipments.length})</h3>
        {shipments.length ? shipments.map(s => (
          <button key={s.shipmentId} className={`mobile-trip-item ${selectedId === s.shipmentId ? 'active' : ''}`} onClick={() => onSelect(s.shipmentId)}>
            <div className="mobile-trip-item-left">
              <strong>#{s.shipmentId}</strong>
              <small>{s.farmName} → {s.retailerName}</small>
            </div>
            <span className={`mobile-status status-${String(s.status).toLowerCase()}`}>{displayStatus(s.status)}</span>
          </button>
        )) : (
          <div className="mobile-trip-item disabled">
            <div className="mobile-trip-item-left">
              <strong>Chưa có chuyến</strong>
              <small>Đang chờ phân công</small>
            </div>
            <span className="mobile-status status-assigned">Đang chờ</span>
          </div>
        )}
      </div>
    </div>
  )
}

function ScanView({ qrCode, setQrCode, openScanner, current, shipments }) {
  const normalizedCode = normalizeScannedCode(qrCode)
  const matchedShipment = findAssignedShipmentByCode(shipments, normalizedCode)
  const hasScannedCode = Boolean(normalizedCode)
  const traceShipment = hasScannedCode ? matchedShipment : current
  const isUnassignedCode = hasScannedCode && !matchedShipment
  return (
    <div className="mobile-scan">
      <div className="mobile-scan-header">
        <h2>Quet QR pickup</h2>
        <p>Driver den farm, quet QR san pham dung voi chuyen duoc gan roi moi duoc nhan hang.</p>
      </div>
      <div className="mobile-scan-display">
        {hasScannedCode ? (
          <div className="mobile-scan-result">
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: isUnassignedCode ? '#b91c1c' : 'var(--driver-primary)' }}>{isUnassignedCode ? 'error' : 'check_circle'}</span>
            <strong>Da quet</strong>
            <code>{normalizedCode}</code>
            <p className="scan-match-message" style={{ color: isUnassignedCode ? '#b91c1c' : 'var(--driver-primary)' }}>{isUnassignedCode ? 'Ma nay khong nam trong chuyen duoc gan.' : 'Ma khop voi chuyen duoc gan.'}</p>
            <button className="mobile-btn secondary" onClick={() => setQrCode('')}>Quet lai</button>
          </div>
        ) : (
          <div className="mobile-scan-empty">
            <span className="material-symbols-outlined" style={{ fontSize: 64, opacity: 0.3 }}>qr_code_scanner</span>
            <p>Chua co ma</p>
          </div>
        )}
      </div>
      <button className="mobile-btn primary scan-btn" onClick={openScanner}>
        <span className="material-symbols-outlined">photo_camera</span> Mo camera
      </button>
      <div className="mobile-scan-manual">
        <label>Nhap thu cong</label>
        <div className="mobile-input-row">
          <input value={qrCode} onChange={e => setQrCode(e.target.value)} placeholder="Trace code, batch code, shipment id, hoac URL QR" />
        </div>
      </div>
      <article className="mobile-empty-card mobile-scan-card">
        <h3>Thong tin shipment</h3>
        {traceShipment ? (
          <div className="mobile-scan-info-grid">
            <div><small>Shipment</small><strong>#{traceShipment.shipmentId}</strong></div>
            <div><small>Farm pickup</small><strong>{traceShipment.farmName || 'Chua xac dinh'}</strong></div>
            <div><small>Retailer delivery</small><strong>{traceShipment.retailerName || 'Chua xac dinh'}</strong></div>
            <div><small>Batch</small><strong>{traceShipment.batchCode || 'Chua co'}</strong></div>
            <div><small>Trace</small><strong>{traceShipment.traceCode || 'Chua co'}</strong></div>
            <div><small>Status</small><strong>{displayStatus(traceShipment.status)}</strong></div>
          </div>
        ) : (
          <div className="mobile-scan-info-empty">
            <p>Ma QR public ngoai cho se khong dung neu khong thuoc shipment cua driver.</p>
          </div>
        )}
      </article>
    </div>
  )
}
function ActionsView({ current, canPickup, hasPickupQrMatch, canCheckpoint, canHandover, doPickup, doCheckpoint, doHandover, checkpointNote, setCheckpointNote, checkpointLocation, setCheckpointLocation, handoverNote, setHandoverNote, handoverProof, setHandoverProof, setHandoverProofFile, actionLoading }) {
  const hasNoCurrent = !current
  const currentIdx = stepIndex(current?.status)
  function handleProofFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setHandoverProofFile(file)
    setHandoverProof(`photo:${file.name}:${file.size}`)
  }
  return (
    <div className="mobile-actions">
      {hasNoCurrent ? (
        <div className="mobile-center">
          <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3 }}>handyman</span>
          <p>Chon shipment de thao tac</p>
        </div>
      ) : (
        <>
          <div className="mobile-actions-header">
            <h2>Shipment #{current.shipmentId}</h2>
            <span className={`mobile-status status-${String(current.status).toLowerCase()}`}>{displayStatus(current.status)}</span>
          </div>

          <div className="mobile-action-cards">
            <div className={`mobile-action-card ${canPickup ? '' : 'disabled'}`}>
              <div className="mobile-action-icon"><span className="material-symbols-outlined">inventory_2</span></div>
              <div className="mobile-action-body">
                <h3>Nhận hàng tại farm</h3>
                <p>Quét đúng QR sản phẩm của shipment này trước khi nhận hàng.</p>
                {!hasPickupQrMatch && currentIdx < 1 ? <small>Chưa khớp QR. Sang tab QR và quét mã trên sản phẩm.</small> : null}
              </div>
              <button className="mobile-btn primary sm" disabled={!canPickup || actionLoading} onClick={doPickup}>
                {currentIdx < 1 ? 'Xác nhận' : 'Đã nhận'}
              </button>
            </div>

            <div className={`mobile-action-card ${canCheckpoint ? '' : 'disabled'}`}>
              <div className="mobile-action-icon"><span className="material-symbols-outlined">pin_drop</span></div>
              <div className="mobile-action-body">
                <h3>Đang giao</h3>
                <input placeholder="Vị trí" value={checkpointLocation} onChange={e => setCheckpointLocation(e.target.value)} />
                <input placeholder="Ghi chú" value={checkpointNote} onChange={e => setCheckpointNote(e.target.value)} />
              </div>
              <button className="mobile-btn primary sm" disabled={!canCheckpoint || actionLoading} onClick={doCheckpoint}>
                Ghi checkpoint
              </button>
            </div>

            <div className={`mobile-action-card ${canHandover ? '' : 'disabled'}`}>
              <div className="mobile-action-icon"><span className="material-symbols-outlined">photo_camera</span></div>
              <div className="mobile-action-body">
                <h3>Giao cho retailer</h3>
                <input placeholder="Ghi chú giao hàng" value={handoverNote} onChange={e => setHandoverNote(e.target.value)} />
                <label className="mobile-proof-picker">
                  <span className="material-symbols-outlined">photo_camera</span>
                  <strong>{handoverProof ? 'Đổi ảnh proof' : 'Chụp ảnh proof'}</strong>
                  <input type="file" accept="image/*" capture="environment" onChange={handleProofFile} />
                </label>
                <small>{handoverProof ? 'Đã có ảnh bằng chứng.' : 'Cần ảnh bàn giao rồi mới xác nhận.'}</small>
              </div>
              <button className="mobile-btn primary sm" disabled={!canHandover || actionLoading} onClick={doHandover}>
                Xác nhận giao
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
function ReportView({ form, setForm, onSubmit, actionLoading }) {
  const types = [
    ['ACCIDENT', 'no_crash'], ['BREAKDOWN', 'build'], ['DELAY', 'traffic'],
    ['DAMAGED', 'inventory_2'], ['THEFT', 'security'], ['OTHER', 'more_horiz'],
  ]
  return (
    <div className="mobile-report">
      <div className="mobile-report-header">
        <h2>Báo cáo sự cố</h2>
        <p>Gửi báo cáo đến quản lý vận chuyển.</p>
      </div>
      <form onSubmit={e => { e.preventDefault(); onSubmit() }}>
        <div className="mobile-report-types">
          {types.map(([t, icon]) => (
            <label key={t} className={`mobile-type-chip ${form.issueType === t ? 'active' : ''}`}>
              <input type="radio" name="issueType" checked={form.issueType === t} onChange={() => setForm({ ...form, issueType: t })} />
              <span className="material-symbols-outlined">{icon}</span>
              <span>{ISSUE_LABELS[t] || t}</span>
            </label>
          ))}
        </div>
        <label className="mobile-field">
          <span>Mức độ</span>
          <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
            <option value="LOW">Thấp</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="HIGH">Cao</option>
          </select>
        </label>
        <label className="mobile-field">
          <span>Mô tả</span>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả chi tiết sự cố..." rows={4} />
        </label>
        <button className="mobile-btn primary full" disabled={actionLoading}>
          <span className="material-symbols-outlined">send</span> Gửi báo cáo
        </button>
      </form>
    </div>
  )
}
