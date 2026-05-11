import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getPrimaryRole } from '../utils/helpers'
import { ROLES } from '../utils/constants'
import '../driver-workspace.css'
import { SupportButton } from '../components/SupportButton.jsx'
import {
  driverAddCheckpoint,
  driverConfirmHandover,
  driverConfirmPickup,
  driverReportIssue,
  getMyShipments,
  getShipmentById,
} from '../services/workflowService.js'
import { getErrorMessage } from '../utils/helpers'

const TABS = [
  { key: 'trips', label: 'Tuyến', icon: 'local_shipping' },
  { key: 'scan', label: 'QR', icon: 'qr_code_scanner' },
  { key: 'actions', label: 'Thao tác', icon: 'handyman' },
  { key: 'report', label: 'Báo cáo', icon: 'warning' },
]

const STATUS_STEPS = ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED']

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

function safeList(list) {
  return Array.isArray(list) ? list : []
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
  const [reportForm, setReportForm] = useState({ issueType: 'DELAY', description: '', severity: 'MEDIUM' })
  const scannerRef = useRef(null)

  useEffect(() => {
    setActiveTab(MODULE_TAB_MAP[module] || 'trips')
  }, [module])

  useEffect(() => { loadShipments() }, [])

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

  async function loadShipments() {
    setLoading(true)
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
    setLoading(true)
    try {
      const data = await getShipmentById(id)
      if (data) { setSelectedId(data.shipmentId); setQrCode(data?.traceCode || data?.batchCode || '') }
      setError('')
    } catch { setError('Không tải được chi tiết chuyến.') }
    finally { setLoading(false) }
  }

  const current = useMemo(() => shipments.find(s => s.shipmentId === selectedId) || shipments[0] || null, [shipments, selectedId])
  const activeShipments = useMemo(() => shipments.filter(s => !['DELIVERED', 'CANCELLED'].includes(String(s.status).toUpperCase())), [shipments])
  const displayName = user?.fullName || user?.email || 'Driver'
  const roleLabel = role ? role.charAt(0) + role.slice(1).toLowerCase() : 'Driver'

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
    id => driverConfirmHandover(id, { status: 'DELIVERED', note: handoverNote || 'Handover confirmed', evidence: qrCode }),
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

  const canPickup = current && stepIndex(current.status) < 1
  const canCheckpoint = current && stepIndex(current.status) >= 1 && stepIndex(current.status) < 2
  const canHandover = current && stepIndex(current.status) >= 2 && stepIndex(current.status) < 3
  const totals = useMemo(() => ({
    active: activeShipments.length,
    all: shipments.length,
    delivered: shipments.filter((item) => String(item.status).toUpperCase() === 'DELIVERED').length,
    route: current ? `${current.farmName || 'Farm'} → ${current.retailerName || 'Retailer'}` : 'Chưa có tuyến',
  }), [activeShipments.length, current, shipments])

  function renderContent() {
    switch (activeTab) {
      case 'trips': return <TripsView shipments={activeShipments} current={current} selectedId={selectedId} onSelect={handleSelectShipment} loading={loading} />
      case 'scan': return <ScanView qrCode={qrCode} setQrCode={setQrCode} openScanner={() => setScannerOpen(true)} current={current} shipments={shipments} />
      case 'actions': return <ActionsView current={current} canPickup={canPickup} canCheckpoint={canCheckpoint} canHandover={canHandover} doPickup={doPickup} doCheckpoint={doCheckpoint} doHandover={doHandover} checkpointNote={checkpointNote} setCheckpointNote={setCheckpointNote} checkpointLocation={checkpointLocation} setCheckpointLocation={setCheckpointLocation} handoverNote={handoverNote} setHandoverNote={setHandoverNote} actionLoading={actionLoading} />
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
          <SupportButton />
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
          <small>Driver Mobile</small>
          <h1>{current ? `Shipment #${current.shipmentId}` : 'Driver Workspace'}</h1>
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
            <span>Tổng shipment</span>
          </div>
        </div>
      </section>

      <section className="mobile-metrics">
        <article className="mobile-metric-card">
          <small>Trạng thái</small>
          <strong>{current?.status || 'WAITING'}</strong>
          <span>{current ? `#${current.shipmentId}` : 'Chưa được phân công'}</span>
        </article>
        <article className="mobile-metric-card">
          <small>Trace code</small>
          <strong>{current?.traceCode || qrCode || 'N/A'}</strong>
          <span>Mã xác thực hiện tại</span>
        </article>
        <article className="mobile-metric-card">
          <small>Next step</small>
          <strong>{canPickup ? 'Pickup' : canCheckpoint ? 'Checkpoint' : canHandover ? 'Handover' : 'Done'}</strong>
          <span>Theo trạng thái shipment</span>
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

      {isDriver ? null : <div className="mobile-alert error">Bạn đang mở trang tài xế nhưng chưa có role DRIVER.</div>}

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
              <p>Current route</p>
              <h3>{current ? `#${current.shipmentId}` : 'Chưa có shipment'}</h3>
            </div>
            <span className={`mobile-status ${current ? `status-${String(current.status).toLowerCase()}` : 'status-assigned'}`}>{current?.status || 'WAITING'}</span>
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
            <span className={`mobile-status status-${String(current.status).toLowerCase()}`}>{current.status}</span>
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
                <span>{s === 'ASSIGNED' ? 'Đã nhận' : s === 'PICKED_UP' ? 'Lấy hàng' : s === 'IN_TRANSIT' ? 'Đang giao' : 'Bàn giao'}</span>
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
              <p>Shipping Manager chưa gán shipment cho tài xế.</p>
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
              <strong>WAITING</strong>
              <span>Chưa có shipment</span>
            </article>
            <article className="mobile-mini-card">
              <small>QR Trace</small>
              <strong>N/A</strong>
              <span>Sẽ hiện khi có chuyến</span>
            </article>
          </div>

          <div className="mobile-empty-stack">
            <section className="mobile-empty-card">
              <h3>Route Preview</h3>
              <div className="mobile-empty-map">
                <span className="material-symbols-outlined">map</span>
                <small>Chưa có tuyến được gán</small>
              </div>
            </section>
            <section className="mobile-empty-card">
              <h3>Quick Actions</h3>
              <div className="mobile-empty-actions">
                <button type="button"><span className="material-symbols-outlined">qr_code_scanner</span> QR</button>
                <button type="button"><span className="material-symbols-outlined">inventory_2</span> Pickup</button>
                <button type="button"><span className="material-symbols-outlined">handshake</span> Handover</button>
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
            <span className={`mobile-status status-${String(s.status).toLowerCase()}`}>{s.status}</span>
          </button>
        )) : (
          <div className="mobile-trip-item disabled">
            <div className="mobile-trip-item-left">
              <strong>Chưa có shipment</strong>
              <small>Đang chờ phân công</small>
            </div>
            <span className="mobile-status status-assigned">WAITING</span>
          </div>
        )}
      </div>
    </div>
  )
}

function ScanView({ qrCode, setQrCode, openScanner, current, shipments }) {
  const matchedShipment = safeList(shipments).find((item) => {
    const code = String(qrCode || '').trim().toLowerCase()
    return code && [item.traceCode, item.batchCode, String(item.shipmentId)].some((value) => String(value || '').trim().toLowerCase() === code)
  }) || null
  const traceShipment = matchedShipment || current
  return (
    <div className="mobile-scan">
      <div className="mobile-scan-header">
        <h2>Quét mã xác thực</h2>
        <p>Quét QR để xem shipment, batch và trace code tương ứng</p>
      </div>
      <div className="mobile-scan-display">
        {qrCode ? (
          <div className="mobile-scan-result">
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--driver-primary)' }}>check_circle</span>
            <strong>Đã quét</strong>
            <code>{qrCode}</code>
            <button className="mobile-btn secondary" onClick={() => setQrCode('')}>Quét lại</button>
          </div>
        ) : (
          <div className="mobile-scan-empty">
            <span className="material-symbols-outlined" style={{ fontSize: 64, opacity: 0.3 }}>qr_code_scanner</span>
            <p>Chưa có mã</p>
          </div>
        )}
      </div>
      <button className="mobile-btn primary scan-btn" onClick={openScanner}>
        <span className="material-symbols-outlined">photo_camera</span> Mở Camera
      </button>
      <div className="mobile-scan-manual">
        <label>Nhập thủ công</label>
        <div className="mobile-input-row">
          <input value={qrCode} onChange={e => setQrCode(e.target.value)} placeholder="Trace code hoặc batch code" />
        </div>
      </div>
      <article className="mobile-empty-card mobile-scan-card">
        <h3>Thông tin truy vết</h3>
        {traceShipment ? (
          <div className="mobile-scan-info-grid">
            <div><small>Shipment</small><strong>#{traceShipment.shipmentId}</strong></div>
            <div><small>Điểm lấy</small><strong>{traceShipment.farmName || 'Chưa xác định'}</strong></div>
            <div><small>Điểm giao</small><strong>{traceShipment.retailerName || 'Chưa xác định'}</strong></div>
            <div><small>Batch</small><strong>{traceShipment.batchCode || 'Chưa có'}</strong></div>
            <div><small>Trace</small><strong>{traceShipment.traceCode || 'Chưa có'}</strong></div>
            <div><small>Trạng thái</small><strong>{traceShipment.status || 'WAITING'}</strong></div>
          </div>
        ) : (
          <div className="mobile-scan-info-empty">
            <p>Nhập hoặc quét mã để xem thông tin shipment tương ứng.</p>
          </div>
        )}
      </article>
    </div>
  )
}

function ActionsView({ current, canPickup, canCheckpoint, canHandover, doPickup, doCheckpoint, doHandover, checkpointNote, setCheckpointNote, checkpointLocation, setCheckpointLocation, handoverNote, setHandoverNote, actionLoading }) {
  const hasNoCurrent = !current
  const currentIdx = stepIndex(current?.status)
  return (
    <div className="mobile-actions">
      {hasNoCurrent ? (
        <div className="mobile-center">
          <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3 }}>handyman</span>
          <p>Chọn chuyến hàng để thao tác</p>
        </div>
      ) : (
        <>
          <div className="mobile-actions-header">
            <h2>Chuyến #{current.shipmentId}</h2>
            <span className={`mobile-status status-${String(current.status).toLowerCase()}`}>{current.status}</span>
          </div>

          <div className="mobile-action-cards">
            <div className={`mobile-action-card ${canPickup ? '' : 'disabled'}`}>
              <div className="mobile-action-icon"><span className="material-symbols-outlined">inventory_2</span></div>
              <div className="mobile-action-body">
                <h3>Nhận hàng</h3>
                <p>Xác nhận lấy hàng tại nông trại</p>
              </div>
              <button className="mobile-btn primary sm" disabled={!canPickup || actionLoading} onClick={doPickup}>
                {currentIdx < 1 ? 'Xác nhận' : 'Đã nhận'}
              </button>
            </div>

            <div className={`mobile-action-card ${canCheckpoint ? '' : 'disabled'}`}>
              <div className="mobile-action-icon"><span className="material-symbols-outlined">pin_drop</span></div>
              <div className="mobile-action-body">
                <h3>Checkpoint</h3>
                <input placeholder="Vị trí" value={checkpointLocation} onChange={e => setCheckpointLocation(e.target.value)} />
                <input placeholder="Ghi chú" value={checkpointNote} onChange={e => setCheckpointNote(e.target.value)} />
              </div>
              <button className="mobile-btn primary sm" disabled={!canCheckpoint || actionLoading} onClick={doCheckpoint}>
                Ghi
              </button>
            </div>

            <div className={`mobile-action-card ${canHandover ? '' : 'disabled'}`}>
              <div className="mobile-action-icon"><span className="material-symbols-outlined">handshake</span></div>
              <div className="mobile-action-body">
                <h3>Bàn giao</h3>
                <input placeholder="Ghi chú bàn giao" value={handoverNote} onChange={e => setHandoverNote(e.target.value)} />
              </div>
              <button className="mobile-btn primary sm" disabled={!canHandover || actionLoading} onClick={doHandover}>
                Xác nhận
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
        <p>Gửi báo cáo đến quản lý vận chuyển</p>
      </div>
      <form onSubmit={e => { e.preventDefault(); onSubmit() }}>
        <div className="mobile-report-types">
          {types.map(([t, icon]) => (
            <label key={t} className={`mobile-type-chip ${form.issueType === t ? 'active' : ''}`}>
              <input type="radio" name="issueType" checked={form.issueType === t} onChange={() => setForm({ ...form, issueType: t })} />
              <span className="material-symbols-outlined">{icon}</span>
              <span>{t}</span>
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
