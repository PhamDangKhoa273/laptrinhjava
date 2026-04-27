import { useEffect, useMemo, useRef, useState } from 'react'
import {
  driverAddCheckpoint,
  driverConfirmHandover,
  driverConfirmPickup,
  driverReportIssue,
  getMyShipments,
  getShipmentById,
} from '../services/workflowService.js'
import { getErrorMessage } from '../utils/helpers'
import '../driver-workspace.css'

const emptyShipment = {
  shipmentId: null,
  status: 'NO_ASSIGNMENT',
  farmName: 'Chưa có điểm lấy hàng',
  retailerName: 'Chưa có điểm giao',
  vehiclePlateNo: 'N/A',
  batchCode: '',
  traceCode: '',
  logs: [],
  reports: [],
}

function summarizeCargo(shipment) {
  return shipment?.batchCode || shipment?.traceCode || shipment?.orderCode || 'Chưa có batch được gán'
}

function formatShipmentTitle(shipment) {
  if (!shipment?.shipmentId) return 'Chưa có shipment được phân công'
  return `Shipment #${shipment.shipmentId}`
}

function Icon({ children, filled = false }) {
  return <span className="material-symbols-outlined" style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}>{children}</span>
}

export function DriverWorkspacePage({ module = 'shipments' }) {
  const [shipments, setShipments] = useState([])
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [checkpointNote, setCheckpointNote] = useState('')
  const [checkpointLocation, setCheckpointLocation] = useState('')
  const [handoverNote, setHandoverNote] = useState('')
  const [reportForm, setReportForm] = useState({ issueType: 'DELAY', description: '', severity: 'MEDIUM' })
  const [scannerOpen, setScannerOpen] = useState(false)
  const scannerRef = useRef(null)

  useEffect(() => { loadShipments() }, [])

  useEffect(() => {
    let cancelled = false
    if (!scannerOpen) {
      scannerRef.current?.clear?.().catch(() => {})
      scannerRef.current = null
      return undefined
    }

    async function mountScanner() {
      const { Html5QrcodeScanner } = await import('html5-qrcode')
      if (cancelled) return
      const scanner = new Html5QrcodeScanner('driver-qr-reader', { fps: 10, qrbox: { width: 220, height: 220 }, rememberLastUsedCamera: true }, false)
      scannerRef.current = scanner
      scanner.render((decodedText) => {
        setQrCode(decodedText)
        setSuccess('QR scan captured successfully.')
        setScannerOpen(false)
      }, () => {})
    }

    mountScanner().catch(() => setError('Không thể tải camera scanner. Vui lòng nhập trace code thủ công.'))
    return () => {
      cancelled = true
      scannerRef.current?.clear?.().catch(() => {})
      scannerRef.current = null
    }
  }, [scannerOpen])

  async function loadShipments() {
    setLoading(true)
    try {
      const data = await getMyShipments()
      const list = Array.isArray(data) ? data : []
      setShipments(list)
      if (!selectedShipment && list[0]?.shipmentId) handleSelectShipment(list[0].shipmentId)
      setError('')
    } catch (err) {
      setShipments([])
      setSelectedShipment(null)
      setError(getErrorMessage(err, 'Không tải được danh sách shipment. Vui lòng kiểm tra kết nối hoặc quyền tài xế.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectShipment(id) {
    setLoading(true)
    try {
      const data = await getShipmentById(id)
      setSelectedShipment(data)
      setQrCode(data?.traceCode || data?.batchCode || '')
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được chi tiết shipment.'))
    } finally {
      setLoading(false)
    }
  }

  const current = selectedShipment || shipments[0] || emptyShipment
  const activeShipments = useMemo(() => shipments.filter(s => s.status !== 'DELIVERED' && s.status !== 'CANCELLED'), [shipments])
  const hasRealShipment = Boolean(selectedShipment?.shipmentId)

  async function runAction(callback, ok, fallbackError) {
    if (!hasRealShipment || actionLoading) {
      setError('Vui lòng chọn một shipment thật trước khi commit thao tác tài xế.')
      return
    }
    setActionLoading(true)
    try {
      await callback(selectedShipment.shipmentId)
      setSuccess(ok)
      await handleSelectShipment(selectedShipment.shipmentId)
      await loadShipments()
    } catch (err) {
      setError(getErrorMessage(err, fallbackError))
    } finally {
      setActionLoading(false)
    }
  }

  const actions = {
    pickup: () => runAction(id => driverConfirmPickup(id, { qrCode: qrCode || current.traceCode, expectedCode: current.traceCode || current.batchCode || '', note: 'Pickup confirmed by driver.', location: 'At Farm' }), 'Pickup confirmed.', 'Xác nhận pickup thất bại.'),
    checkpoint: () => runAction(id => driverAddCheckpoint(id, { type: 'CHECKPOINT', note: checkpointNote || 'Checkpoint update committed.', location: checkpointLocation || 'Highway checkpoint', qrEvidence: qrCode }), 'Checkpoint committed.', 'Không thể thêm checkpoint.'),
    handover: () => runAction(id => driverConfirmHandover(id, { status: 'DELIVERED', note: handoverNote || 'Handover confirmed by driver.', evidence: qrCode }), 'Shipment delivered.', 'Xác nhận giao hàng thất bại.'),
    report: () => runAction(id => driverReportIssue(id, reportForm), 'Incident report sent to shipping manager.', 'Không thể gửi báo cáo.'),
  }

  const views = {
    shipments: <DriverDashboard current={current} activeShipments={activeShipments} onSelect={handleSelectShipment} loading={loading} />,
    qr: <QrView qrCode={qrCode} setQrCode={setQrCode} openScanner={() => setScannerOpen(true)} onAccept={actions.pickup} />,
    pickup: <PickupView current={current} onConfirm={actions.pickup} />,
    checkpoint: <CheckpointView note={checkpointNote} setNote={setCheckpointNote} location={checkpointLocation} setLocation={setCheckpointLocation} onCommit={actions.checkpoint} />,
    handover: <HandoverView current={current} note={handoverNote} setNote={setHandoverNote} onComplete={actions.handover} />,
    report: <ReportView form={reportForm} setForm={setReportForm} onSubmit={actions.report} />,
    mobile: <MobileDriverView />,
  }

  return (
    <section className={`driver-prototype-shell driver-route-${module}`}>
      <div className="driver-topline">
        <div>
          <p className="driver-eyebrow">BICAP Driver</p>
          <h1>{module === 'qr' ? 'Batch Verification' : module === 'pickup' ? 'Confirm Pickup' : module === 'checkpoint' ? 'Checkpoint Update' : module === 'handover' ? 'Retailer Handover' : module === 'report' ? 'Report a Trip Issue' : 'Driver Workspace'}</h1>
          <p>{module === 'shipments' ? `${activeShipments.length} shipment đang được phân công cho tài xế.` : 'Authenticated driver operations with blockchain-backed traceability.'}</p>
        </div>
        <button className="driver-refresh" onClick={loadShipments} disabled={loading}><Icon>refresh</Icon> Refresh</button>
      </div>
      {error ? <div className="driver-alert error">{error}</div> : null}
      {success ? <div className="driver-alert success">{success}</div> : null}
      {scannerOpen ? <div className="driver-scanner-live"><div id="driver-qr-reader" /><button onClick={() => setScannerOpen(false)}>Close scanner</button></div> : null}
      {views[module] || views.shipments}
      {actionLoading ? <div className="driver-saving">Committing secure transaction...</div> : null}
    </section>
  )
}

function DriverDashboard({ current, activeShipments, onSelect, loading }) {
  const hasShipment = Boolean(current?.shipmentId)
  const progressPercent = activeShipments.length ? Math.round((activeShipments.filter(s => s.status === 'DELIVERED').length / activeShipments.length) * 100) : 0
  return <>
    <div className="driver-bento dashboard-grid">
      <article className="driver-card active-trip">
        <div className="card-bar"><span><i /> {formatShipmentTitle(current)}</span><b>{hasShipment ? current.status : 'WAITING'}</b></div>
        <div className="route-stack">
          <RoutePoint icon="location_on" label="Pickup Location" title={current.farmName || 'N/A'} sub={hasShipment ? 'Lấy từ shipment API' : 'Chưa có phân công'} />
          <RoutePoint icon="local_shipping" label="Current Status" title={current.status || 'N/A'} sub={current.vehiclePlateNo ? `Xe: ${current.vehiclePlateNo}` : 'Chưa gán phương tiện'} active />
          <RoutePoint icon="flag" label="Final Destination" title={current.retailerName || 'N/A'} sub={hasShipment ? 'Theo đơn hàng đã duyệt' : 'Chưa có điểm giao'} />
        </div>
        <div className="payload-box"><small>PAYLOAD</small><strong>{summarizeCargo(current)}</strong><span><Icon>qr_code_2</Icon> {current.traceCode || 'Chưa có trace code'}</span></div>
        <button className="driver-primary" disabled={!hasShipment}>Continue Trip</button>
      </article>
      <aside className="driver-side-stack">
        <div className="driver-card"><small>Daily Progress</small><strong className="big">{progressPercent}%</strong><span className="green">{activeShipments.length} active shipment</span><div className="progress"><i style={{ width: `${progressPercent}%` }} /></div></div>
        <div className="driver-map route"><span>Route Preview</span><small>{hasShipment ? 'Dựa trên shipment hiện tại' : 'Chọn shipment để xem tuyến'}</small></div>
        <button className="driver-dashed" disabled={!hasShipment}><Icon>add_alert</Icon> Log New Incident</button>
      </aside>
    </div>
    <section className="driver-section"><h2>Live backend shipments</h2>{activeShipments.length ? <div className="driver-list-grid">{activeShipments.map(s => <button className="driver-card mini selectable" key={s.shipmentId} onClick={() => onSelect(s.shipmentId)}><b>#{s.shipmentId}</b><strong>{s.farmName} → {s.retailerName}</strong><small>{s.status}</small><span>{summarizeCargo(s)}</span></button>)}</div> : <div className="driver-card"><strong>Chưa có shipment được phân công.</strong><small>Shipping Manager cần gán shipment thật cho tài xế trước khi thao tác pickup/checkpoint/handover.</small></div>}</section>
    {loading ? <p className="driver-muted">Loading assignments...</p> : null}
  </>
}

function RoutePoint({ icon, label, title, sub, active }) { return <div className={`route-point ${active ? 'active' : ''}`}><Icon>{icon}</Icon><div><small>{label}</small><strong>{title}</strong><span>{sub}</span></div></div> }

function QrView({ qrCode, setQrCode, openScanner, onAccept }) {
  return <div className="driver-bento two-col"><article className="driver-card scanner-card"><div className="card-title"><Icon>photo_camera</Icon><b>Camera Scanner</b><span>Browser camera</span></div><div className="scanner-sim"><div className="scanner-frame"><Icon>qr_code_2</Icon><i /></div><div className="camera-actions"><button type="button"><Icon>flashlight_on</Icon></button><button type="button"><Icon>flip_camera_ios</Icon></button></div></div><p>Quét mã QR trên batch hoặc nhập trace code thủ công để xác nhận pickup.</p><button className="driver-secondary" onClick={openScanner}>Open camera scanner</button></article><aside className="driver-side-stack"><div className="driver-card"><h3>Manual Batch Entry</h3><label>Batch ID / Tracking Reference</label><div className="input-row"><input value={qrCode} onChange={e => setQrCode(e.target.value)} placeholder="Nhập trace code hoặc batch code" /><button onClick={onAccept}>Verify</button></div></div><div className="driver-card success-card"><h3><Icon filled>fact_check</Icon> Verification Payload</h3><strong>{qrCode || 'Chưa có mã được quét'}</strong><span>Mã này sẽ được gửi tới backend khi driver xác nhận pickup.</span><div className="data-grid"><p><small>Mode</small>API commit</p><p><small>Evidence</small>{qrCode ? 'Ready' : 'Missing'}</p><p><small>Action</small>Pickup</p><p><small>Trace</small>{qrCode || 'N/A'}</p></div><button className="driver-primary" onClick={onAccept}>Accept Shipment to Loading</button></div></aside><TraceLog currentCode={qrCode} /></div>
}

function PickupView({ current, onConfirm }) {
  return <><div className="driver-bento pickup-grid"><article className="driver-card map-card wide"><div className="driver-map farm"><span>Pickup Location</span><strong>{current.farmName}</strong></div><h3>Farm Metadata</h3><p>Dữ liệu lấy từ shipment đang chọn; driver chỉ có thể xác nhận khi backend đã gán đơn thật.</p><div className="data-grid"><p><small>Shipment</small>{current.shipmentId || 'N/A'}</p><p><small>Batch/Trace</small>{summarizeCargo(current)}</p></div></article><article className="driver-card"><h3><Icon>fact_check</Icon> Batch Checklist</h3>{['Correct Batch ID', 'Verify Quantity', 'Seal Integrity', 'Packaging Standards'].map(x => <label className="check-row" key={x}><input type="checkbox" /> <span><b>{x}</b><small>Required before initiating transit</small></span></label>)}</article><article className="driver-card"><h4>Origin Traceability</h4><TraceMini currentCode={current.traceCode || current.batchCode} /></article><article className="driver-card proof-card"><div><h3>Photo Proof</h3><p>Ảnh chứng từ sẽ được lưu ở backend/media khi module upload được kích hoạt.</p><button className="driver-dashed" type="button"><Icon>add_a_photo</Icon> Attach Photo</button></div><div className="proof-preview"><Icon>image</Icon><small>Evidence pending</small></div></article></div><div className="driver-action-bar"><button className="driver-secondary" type="button">Report Issue</button><button className="driver-primary" onClick={onConfirm}><Icon>check_circle</Icon> Confirm & Start Route</button></div></>
}

function CheckpointView({ note, setNote, location, setLocation, onCommit }) {
  return <div className="driver-bento two-col"><article className="driver-card"><div className="driver-map checkpoint"><span>Current Location</span><strong>{location || 'Nhập vị trí checkpoint'}</strong><small>GPS/browser location có thể được bổ sung ở thiết bị thật.</small></div><h3>Select Current Status</h3><div className="status-options"><button className="active" type="button"><Icon filled>local_shipping</Icon>Moving</button><button type="button"><Icon>pause_circle</Icon>Paused</button><button type="button"><Icon>warning</Icon>Incident</button></div></article><aside className="driver-side-stack"><div className="driver-card"><h4><Icon>add_a_photo</Icon> Visual Proof</h4><button className="upload-zone" type="button"><Icon>upload_file</Icon><b>Attach Photo</b><small>Manifest or cargo condition</small></button></div><div className="driver-card"><h4><Icon>edit_note</Icon> Transit Notes</h4><input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" /><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Enter observations, traffic conditions..." /><div className="chips"><span>Traffic</span><span>Temperature OK</span><span>Route update</span></div></div><button className="driver-primary big-btn" onClick={onCommit}><Icon>publish</Icon> Commit Checkpoint</button></aside></div>
}

function HandoverView({ current, note, setNote, onComplete }) {
  const manifestRows = [current.batchCode || current.traceCode || current.orderCode || 'Batch chưa xác định']
  return <div className="driver-bento handover-grid"><article className="driver-card recipient"><Icon filled>store</Icon><b>RETAILER DESTINATION</b><h3>{current.retailerName}</h3><p>Điểm giao lấy từ shipment API.</p><p>Shipment #{current.shipmentId || 'N/A'}</p><button className="driver-secondary" type="button"><Icon>map</Icon> Open in Navigation</button></article><article className="driver-card manifest"><h3><Icon>inventory_2</Icon> Shipment Manifest</h3>{manifestRows.map(item => <div className="manifest-row" key={item}><span /><div><b>{item}</b><small>Backend shipment payload</small></div><strong>{current.status}<em>API</em></strong></div>)}</article><article className="driver-card proof"><h3><Icon>photo_camera</Icon> Photo Proof</h3><div className="photo-grid"><button type="button"><Icon>add_a_photo</Icon><small>Cargo Load</small></button><span /><span /><button type="button"><Icon>add</Icon><small>Add More</small></button></div></article><article className="driver-card signature"><h3><Icon>draw</Icon> Digital Signature</h3><div className="signature-pad"><span>CONFIRM RECEIPT</span><small><Icon filled>verified</Icon> Backend verification required</small></div><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Handover note" /></article><aside className="driver-card shipment-status"><h4>Shipment Status</h4><p><span>Status</span><b>{current.status}</b></p><p><span>Vehicle</span><b>{current.vehiclePlateNo || 'N/A'}</b></p><button onClick={onComplete}>Complete Shipment</button><ul>{(current.logs || []).slice(-3).map(log => <li key={log.logId || `${log.type}-${log.recordedAt}`}>{log.type}: {log.note || log.location || log.recordedAt}</li>)}{!current.logs?.length ? <li>Chưa có checkpoint log từ backend.</li> : null}</ul></aside></div>
}

function ReportView({ form, setForm, onSubmit }) { const types = [['ACCIDENT','no_crash'],['BREAKDOWN','build'],['DELAY','traffic'],['DAMAGED','inventory_2'],['THEFT','security'],['OTHER','more_horiz']]; return <form className="driver-bento report-grid" onSubmit={e => { e.preventDefault(); onSubmit() }}><article className="driver-card"><h3>Incident Type</h3><div className="incident-types">{types.map(([t,i]) => <label key={t} className={form.issueType === t ? 'active' : ''}><input type="radio" name="type" checked={form.issueType === t} onChange={() => setForm({ ...form, issueType: t })} /><Icon>{i}</Icon><span>{t}</span></label>)}</div><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe what happened in detail..." /></article><aside className="driver-side-stack"><div className="driver-card severity"><h3>Severity Level</h3>{['HIGH','MEDIUM','LOW'].map(s => <label key={s}><input type="radio" checked={form.severity === s} onChange={() => setForm({ ...form, severity: s })} /> <b>{s}</b><small>{s === 'HIGH' ? 'Stop shipment, active hazard' : s === 'MEDIUM' ? 'Needs manager attention' : 'For reporting only'}</small></label>)}</div><div className="driver-card"><h3>Evidence Upload</h3><button className="upload-zone" type="button"><Icon>add_a_photo</Icon> Attach photo evidence</button></div></aside><article className="driver-card map-card full"><h3>Incident Location</h3><p>Nhập vị trí trong mô tả hoặc checkpoint để manager đối chiếu.</p><div className="driver-map incident"><Icon filled>location_on</Icon></div></article><button className="driver-primary submit"><Icon>send</Icon> Notify Shipping Manager</button></form> }

function MobileDriverView() { return <div className="mobile-driver-demo"><section className="mobile-hero"><small>Driver mobile mode</small><h2>Shipment operations</h2><p>Mobile shell dùng cùng backend action: QR, pickup, checkpoint, handover và incident.</p><button type="button"><Icon filled>play_arrow</Icon> Open current shipment</button></section><div className="mobile-actions">{[['qr_code_scanner','Verify Batch'],['local_shipping','Pickup'],['route','Checkpoint'],['handshake','Handover'],['warning','Incident'],['support_agent','Support']].map(([i,t]) => <button key={t}><Icon>{i}</Icon><span>{t}</span></button>)}</div><article className="driver-card"><h3>Trace Status</h3><TraceMini /></article></div> }
function TraceLog({ currentCode }){ return <article className="driver-card trace full"><h3>Blockchain Traceability Log</h3><TraceMini currentCode={currentCode} /></article> }
function TraceMini({ currentCode }){ return <div className="trace-mini">{['Shipment assigned','Pickup verification','Checkpoint updates','Retailer handover'].map((x,i)=><div className={i<1?'done':i===1?'current':''} key={x}><Icon>{i===0?'assignment':i===1?'qr_code_scanner':i===2?'route':'inventory_2'}</Icon><b>{x}</b><small>{i===1 ? (currentCode || 'Awaiting scan') : 'Backend timeline'}</small></div>)}</div> }
