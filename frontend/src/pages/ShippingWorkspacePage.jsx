<<<<<<< HEAD
import { useEffect, useMemo, useState } from 'react'
=======
﻿import { useEffect, useMemo, useState } from 'react'
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
import { useAuth } from '../context/AuthContext.jsx'
import { changePassword } from '../services/authService.js'
import '../shipping-workspace.css'
import '../transaction-hardening.css'
import { createDriver, createDriverWithUser, createVehicle, deleteDriver, deleteVehicle, getDrivers, getUsers, getVehicles, updateDriver, updateVehicle, createNotification } from '../services/businessService'
import { createReport, createShipment, getEligibleShipmentOrders, getMyNotifications, getShipmentReportsForReview, getShipments, markNotificationRead, updateShipmentStatus } from '../services/workflowService.js'
import { getErrorMessage } from '../utils/helpers'

const initialDriverForm = { driverCode: '', licenseNo: '', userId: '', status: 'ACTIVE', fullName: '', email: '', password: '' }
const initialVehicleForm = { plateNo: '', vehicleType: '', capacity: '', status: 'ACTIVE' }
const initialShipmentForm = { orderId: '', driverId: '', vehicleId: '', note: '' }
const initialShipmentStatusForm = { status: 'ASSIGNED', note: '' }
const initialReportForm = { title: '', description: '', severity: 'LOW' }
const initialNotificationForm = { recipientRole: 'FARM', title: '', message: '' }

function Icon({ children, fill = false }) { return <span className={`material-symbols-outlined${fill ? ' fill' : ''}`}>{children}</span> }
function safeList(list) { return Array.isArray(list) ? list : [] }
function toPositiveNumber(value) { const numeric = Number(value); return Number.isFinite(numeric) && numeric > 0 ? numeric : null }
function formatCapacity(value) { const numeric = Number(value); return Number.isFinite(numeric) ? `${numeric.toLocaleString('vi-VN')} kg` : 'N/A' }
function Status({ value }) { const key = String(value || 'ASSIGNED').toLowerCase(); return <span className={`ship-status ${key}`}>{value || 'ASSIGNED'}</span> }

export function ShippingWorkspacePage({ module = 'overview' }) {
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [eligibleOrders, setEligibleOrders] = useState([])
  const [shipments, setShipments] = useState([])
  const [shipmentReports, setShipmentReports] = useState([])
  const [notifications, setNotifications] = useState([])
  const [users, setUsers] = useState([])
  const [driverForm, setDriverForm] = useState(initialDriverForm)
  const [vehicleForm, setVehicleForm] = useState(initialVehicleForm)
  const [shipmentForm, setShipmentForm] = useState(initialShipmentForm)
  const [shipmentStatusForm, setShipmentStatusForm] = useState(initialShipmentStatusForm)
  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [selectedShipmentId, setSelectedShipmentId] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingShipment, setSavingShipment] = useState(false)
  const [savingDriver, setSavingDriver] = useState(false)
  const [savingVehicle, setSavingVehicle] = useState(false)
  const [savingReport, setSavingReport] = useState(false)
  const [savingNotification, setSavingNotification] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const displayShipments = safeList(shipments)
  const displayDrivers = safeList(drivers)
  const displayVehicles = safeList(vehicles)
  const selectedShipment = useMemo(() => displayShipments.find((item) => String(item.shipmentId) === String(selectedShipmentId)) || displayShipments[0] || null, [displayShipments, selectedShipmentId])
  const activeDrivers = useMemo(() => displayDrivers.filter((item) => item.status === 'ACTIVE'), [displayDrivers])
  const activeVehicles = useMemo(() => displayVehicles.filter((item) => item.status === 'ACTIVE'), [displayVehicles])
  const availableUsers = useMemo(() => users.filter((item) => item.status === 'ACTIVE'), [users])

  useEffect(() => { loadWorkspace() }, [])

  async function loadWorkspace() {
    setLoading(true)
    try {
      const [driverData, vehicleData, eligibleData, shipmentData, reportData, notificationData, userData] = await Promise.all([getDrivers(), getVehicles(), getEligibleShipmentOrders(), getShipments(), getShipmentReportsForReview(), getMyNotifications(), getUsers('DRIVER')])
      setDrivers(Array.isArray(driverData) ? driverData : [])
      setVehicles(Array.isArray(vehicleData) ? vehicleData : [])
      setEligibleOrders(Array.isArray(eligibleData) ? eligibleData : [])
      setShipments(Array.isArray(shipmentData) ? shipmentData : [])
      setShipmentReports(Array.isArray(reportData) ? reportData : [])
      setNotifications(Array.isArray(notificationData) ? notificationData : [])
      setUsers(Array.isArray(userData) ? userData : [])
      setError('')
    } catch (err) { setError(getErrorMessage(err, 'KhÃ´ng táº£i Ä‘Æ°á»£c shipping manager workspace.')) }
    finally { setLoading(false) }
  }
  function change(setter) { return (event) => { const { name, value } = event.target; setter((prev) => ({ ...prev, [name]: value })) } }
<<<<<<< HEAD
  async function submitShipment(event) { event.preventDefault(); setSavingShipment(true); setError(''); setSuccess(''); try { const created = await createShipment({ orderId: Number(shipmentForm.orderId), driverId: toPositiveNumber(shipmentForm.driverId), vehicleId: toPositiveNumber(shipmentForm.vehicleId), note: shipmentForm.note.trim() }); setSuccess('Đã tạo shipment và assign logistics resource.'); setShipmentForm(initialShipmentForm); setSelectedShipmentId(String(created.shipmentId)); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'Không thể tạo shipment.')) } finally { setSavingShipment(false) } }
  async function submitDriver(event) { event.preventDefault(); setSavingDriver(true); setError(''); setSuccess(''); try { if (selectedDriverId) await updateDriver(Number(selectedDriverId), { licenseNo: driverForm.licenseNo.trim(), status: driverForm.status.trim() }); else if (driverForm.fullName && driverForm.email) await createDriverWithUser({ fullName: driverForm.fullName.trim(), email: driverForm.email.trim(), password: driverForm.password, driverCode: driverForm.driverCode.trim(), licenseNo: driverForm.licenseNo.trim(), status: driverForm.status.trim() }); else await createDriver({ driverCode: driverForm.driverCode.trim(), licenseNo: driverForm.licenseNo.trim(), userId: toPositiveNumber(driverForm.userId), status: driverForm.status.trim() }); setSuccess(selectedDriverId ? 'Đã cập nhật driver.' : 'Đã tạo driver mới.'); setSelectedDriverId(''); setDriverForm(initialDriverForm); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'Không thể lưu driver.')) } finally { setSavingDriver(false) } }
  async function submitVehicle(event) { event.preventDefault(); setSavingVehicle(true); setError(''); setSuccess(''); try { if (selectedVehicleId) await updateVehicle(Number(selectedVehicleId), { vehicleType: vehicleForm.vehicleType.trim(), capacity: Number(vehicleForm.capacity), status: vehicleForm.status.trim() }); else await createVehicle({ plateNo: vehicleForm.plateNo.trim(), vehicleType: vehicleForm.vehicleType.trim(), capacity: Number(vehicleForm.capacity), status: vehicleForm.status.trim() }); setSuccess(selectedVehicleId ? 'Đã cập nhật vehicle.' : 'Đã tạo vehicle mới.'); setSelectedVehicleId(''); setVehicleForm(initialVehicleForm); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'Không thể lưu vehicle.')) } finally { setSavingVehicle(false) } }
  async function submitShipmentStatus(event) { event.preventDefault(); if (!selectedShipment) return; setSavingShipment(true); try { await updateShipmentStatus(selectedShipment.shipmentId, { status: shipmentStatusForm.status, note: shipmentStatusForm.note.trim() }); setSuccess('Đã cập nhật shipment.'); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'Không thể cập nhật shipment.')) } finally { setSavingShipment(false) } }
  function fillDriver(driver) { setSelectedDriverId(String(driver.driverId)); setDriverForm({ driverCode: driver.driverCode || '', licenseNo: driver.licenseNo || '', userId: String(driver.userId || ''), status: driver.status || 'ACTIVE' }) }
  function fillVehicle(vehicle) { setSelectedVehicleId(String(vehicle.vehicleId)); setVehicleForm({ plateNo: vehicle.plateNo || '', vehicleType: vehicle.vehicleType || '', capacity: vehicle.capacity || '', status: vehicle.status || 'ACTIVE' }) }
  async function handleMarkRead(notificationId) { try { await markNotificationRead(notificationId); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'Không đánh dấu notification được.')) } }
  async function handleDeleteDriver(id) { if (!window.confirm('Xóa tài xế này?')) return; setError(''); setSuccess(''); try { await deleteDriver(id); setSuccess('Đã xóa tài xế.'); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'Không thể xóa tài xế.')) } }
  async function handleDeleteVehicle(id) { if (!window.confirm('Xóa phương tiện này?')) return; setError(''); setSuccess(''); try { await deleteVehicle(id); setSuccess('Đã xóa phương tiện.'); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'Không thể xóa phương tiện.')) } }
  const [reportForm, setReportForm] = useState(initialReportForm)
  const [notificationForm, setNotificationForm] = useState(initialNotificationForm)
  async function submitReport(event) {
    event.preventDefault(); setSavingReport(true); setError(''); setSuccess('')
    try {
      // R-SHM-070 — backend yêu cầu schema {recipientRole, reportType, subject, content}.
      // Severity được encode vào subject vì PlatformReport entity không có cột severity.
      const sev = reportForm.severity || 'LOW'
      await createReport({
        recipientRole: 'ADMIN',
        reportType: 'SHIPPING_OPERATION',
        subject: `[${sev}] ${reportForm.title.trim()}`,
        content: reportForm.description.trim(),
      })
      setSuccess('Đã gửi báo cáo đến admin.'); setReportForm(initialReportForm); await loadWorkspace()
    } catch (err) { setError(getErrorMessage(err, 'Không thể gửi báo cáo.')) }
    finally { setSavingReport(false) }
  }
  async function submitNotification(event) { event.preventDefault(); setSavingNotification(true); setError(''); setSuccess(''); try { await createNotification({ recipientRole: notificationForm.recipientRole, title: notificationForm.title.trim(), message: notificationForm.message.trim(), notificationType: 'MANUAL' }); setSuccess('Đã gửi thông báo.'); setNotificationForm(initialNotificationForm); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'Không thể gửi thông báo.')) } finally { setSavingNotification(false) } }
=======
  async function submitShipment(event) { event.preventDefault(); setSavingShipment(true); setError(''); setSuccess(''); try { const created = await createShipment({ orderId: Number(shipmentForm.orderId), driverId: toPositiveNumber(shipmentForm.driverId), vehicleId: toPositiveNumber(shipmentForm.vehicleId), note: shipmentForm.note.trim() }); setSuccess('ÄÃ£ táº¡o shipment vÃ  assign logistics resource.'); setShipmentForm(initialShipmentForm); setSelectedShipmentId(String(created.shipmentId)); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'KhÃ´ng thá»ƒ táº¡o shipment.')) } finally { setSavingShipment(false) } }
  async function submitDriver(event) { event.preventDefault(); setSavingDriver(true); setError(''); setSuccess(''); try { if (selectedDriverId) await updateDriver(Number(selectedDriverId), { licenseNo: driverForm.licenseNo.trim(), status: driverForm.status.trim() }); else if (driverForm.fullName && driverForm.email) await createDriverWithUser({ fullName: driverForm.fullName.trim(), email: driverForm.email.trim(), password: driverForm.password, driverCode: driverForm.driverCode.trim(), licenseNo: driverForm.licenseNo.trim(), status: driverForm.status.trim() }); else await createDriver({ driverCode: driverForm.driverCode.trim(), licenseNo: driverForm.licenseNo.trim(), userId: toPositiveNumber(driverForm.userId), status: driverForm.status.trim() }); setSuccess(selectedDriverId ? 'ÄÃ£ cáº­p nháº­t driver.' : 'ÄÃ£ táº¡o driver má»›i.'); setSelectedDriverId(''); setDriverForm(initialDriverForm); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'KhÃ´ng thá»ƒ lÆ°u driver.')) } finally { setSavingDriver(false) } }
  async function submitVehicle(event) { event.preventDefault(); setSavingVehicle(true); setError(''); setSuccess(''); try { if (selectedVehicleId) await updateVehicle(Number(selectedVehicleId), { vehicleType: vehicleForm.vehicleType.trim(), capacity: Number(vehicleForm.capacity), status: vehicleForm.status.trim() }); else await createVehicle({ plateNo: vehicleForm.plateNo.trim(), vehicleType: vehicleForm.vehicleType.trim(), capacity: Number(vehicleForm.capacity), status: vehicleForm.status.trim() }); setSuccess(selectedVehicleId ? 'ÄÃ£ cáº­p nháº­t vehicle.' : 'ÄÃ£ táº¡o vehicle má»›i.'); setSelectedVehicleId(''); setVehicleForm(initialVehicleForm); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'KhÃ´ng thá»ƒ lÆ°u vehicle.')) } finally { setSavingVehicle(false) } }
  async function submitShipmentStatus(event) { event.preventDefault(); if (!selectedShipment) return; setSavingShipment(true); try { await updateShipmentStatus(selectedShipment.shipmentId, { status: shipmentStatusForm.status, note: shipmentStatusForm.note.trim() }); setSuccess('ÄÃ£ cáº­p nháº­t shipment.'); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'KhÃ´ng thá»ƒ cáº­p nháº­t shipment.')) } finally { setSavingShipment(false) } }
  function fillDriver(driver) { setSelectedDriverId(String(driver.driverId)); setDriverForm({ driverCode: driver.driverCode || '', licenseNo: driver.licenseNo || '', userId: String(driver.userId || ''), status: driver.status || 'ACTIVE' }) }
  function fillVehicle(vehicle) { setSelectedVehicleId(String(vehicle.vehicleId)); setVehicleForm({ plateNo: vehicle.plateNo || '', vehicleType: vehicle.vehicleType || '', capacity: vehicle.capacity || '', status: vehicle.status || 'ACTIVE' }) }
  async function handleMarkRead(notificationId) { try { await markNotificationRead(notificationId); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'KhÃ´ng Ä‘Ã¡nh dáº¥u notification Ä‘Æ°á»£c.')) } }
  async function handleDeleteDriver(id) { if (!window.confirm('XÃ³a tÃ i xáº¿ nÃ y?')) return; setError(''); setSuccess(''); try { await deleteDriver(id); setSuccess('ÄÃ£ xÃ³a tÃ i xáº¿.'); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'KhÃ´ng thá»ƒ xÃ³a tÃ i xáº¿.')) } }
  async function handleDeleteVehicle(id) { if (!window.confirm('XÃ³a phÆ°Æ¡ng tiá»‡n nÃ y?')) return; setError(''); setSuccess(''); try { await deleteVehicle(id); setSuccess('ÄÃ£ xÃ³a phÆ°Æ¡ng tiá»‡n.'); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'KhÃ´ng thá»ƒ xÃ³a phÆ°Æ¡ng tiá»‡n.')) } }
  const [reportForm, setReportForm] = useState(initialReportForm)
  const [notificationForm, setNotificationForm] = useState(initialNotificationForm)
  async function submitReport(event) { event.preventDefault(); setSavingReport(true); setError(''); setSuccess(''); try { await createReport({ title: reportForm.title.trim(), description: reportForm.description.trim(), severity: reportForm.severity }); setSuccess('ÄÃ£ gá»­i bÃ¡o cÃ¡o Ä‘áº¿n admin.'); setReportForm(initialReportForm); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'KhÃ´ng thá»ƒ gá»­i bÃ¡o cÃ¡o.')) } finally { setSavingReport(false) } }
  async function submitNotification(event) { event.preventDefault(); setSavingNotification(true); setError(''); setSuccess(''); try { await createNotification({ recipientRole: notificationForm.recipientRole, title: notificationForm.title.trim(), message: notificationForm.message.trim(), notificationType: 'MANUAL' }); setSuccess('ÄÃ£ gá»­i thÃ´ng bÃ¡o.'); setNotificationForm(initialNotificationForm); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'KhÃ´ng thá»ƒ gá»­i thÃ´ng bÃ¡o.')) } finally { setSavingNotification(false) } }
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd

  const props = { module, loading, error, success, displayShipments, shipmentReports, displayDrivers, displayVehicles, eligibleOrders, activeDrivers, activeVehicles, availableUsers, notifications, shipmentForm, driverForm, vehicleForm, shipmentStatusForm, reportForm, notificationForm, selectedShipment, selectedDriverId, selectedVehicleId, savingShipment, savingDriver, savingVehicle, savingReport, savingNotification, setShipmentForm, setShipmentStatusForm, setReportForm, setNotificationForm, submitShipment, submitDriver, submitVehicle, submitShipmentStatus, submitReport, submitNotification, fillDriver, fillVehicle, handleMarkRead, handleDeleteDriver, handleDeleteVehicle, onShipmentChange: change(setShipmentForm), onDriverChange: change(setDriverForm), onVehicleChange: change(setVehicleForm), onShipmentStatusChange: change(setShipmentStatusForm), onReportChange: change(setReportForm), onNotificationChange: change(setNotificationForm), loadWorkspace }
  const pages = { overview: <OverviewPage {...props} />, orders: <OrdersPage {...props} />, create: <CreateShipmentPage {...props} />, tracking: <TrackingPage {...props} />, drivers: <DriversPage {...props} />, vehicles: <VehiclesPage {...props} />, notifications: <NotificationsPage {...props} />, reports: <ReportsPage {...props} />, sendreport: <SendReportPage {...props} />, sendnotification: <SendNotificationPage {...props} />, completed: <SuccessfulOrdersPage {...props} />, profile: <ShippingProfilePage /> }
  return <section className={`shipping-prototype-shell shipping-module-${module}`}>{pages[module] || pages.overview}</section>
}

function PageChrome({ eyebrow, title, subtitle, actions, children, error, success, loading }) { return <><div className="ship-page-head"><div><p>{eyebrow}</p><h2>{title}</h2><span>{subtitle}</span></div><div className="ship-actions">{actions}</div></div>{loading ? <div className="ship-alert neutral">Äang Ä‘á»“ng bá»™ dá»¯ liá»‡u váº­n chuyá»ƒn...</div> : null}{error ? <div className="ship-alert danger">{error}</div> : null}{success ? <div className="ship-alert success">{success}</div> : null}{children}</> }
function Metric({ icon, label, value, note, tone = 'green' }) { return <article className={`ship-metric ${tone}`}><div><Icon fill>{icon}</Icon><span>{note}</span></div><p>{label}</p><strong>{value}</strong></article> }
<<<<<<< HEAD
function OverviewPage(p) { const deliveredCount = p.displayShipments.filter((s)=>String(s.status).toUpperCase()==='DELIVERED').length; const delayedCount = p.displayShipments.filter((s)=>['REJECTED','DISPUTED','ESCALATED'].includes(String(s.status).toUpperCase())).length; const statuses = ['ASSIGNED','PICKED_UP','IN_TRANSIT','DELIVERED','CANCELLED']; return <PageChrome eyebrow="Shipping Manager" title="Tổng quan Vận chuyển" subtitle="Điều phối đơn hàng, đội xe, tài xế và cảnh báo vận hành." loading={p.loading} error={p.error} success={p.success} actions={<button onClick={p.loadWorkspace}><Icon>refresh</Icon>Làm mới</button>}><section className="ship-metrics"><Metric icon="inventory" label="Chờ phân bổ" value={p.eligibleOrders.length} note="Eligible orders" tone="blue"/><Metric icon="local_shipping" label="Đang vận chuyển" value={p.displayShipments.length} note="Shipments API" tone="amber"/><Metric icon="task_alt" label="Đã giao" value={deliveredCount} note="Delivered"/><Metric icon="warning" label="Cần xử lý" value={delayedCount} note="Exception states" tone="red"/><Metric icon="badge" label="Tài xế hoạt động" value={p.activeDrivers.length} note="Active drivers"/></section><div className="ship-overview-grid"><ShipmentStatusChart shipments={p.displayShipments} /><aside className="ship-stack"><AlertsCard reports={p.shipmentReports} /><ActivityCard shipments={p.displayShipments} /></aside></div><PendingOrders orders={p.eligibleOrders} setShipmentForm={p.setShipmentForm} /></PageChrome> }
=======
function OverviewPage(p) { const deliveredCount = p.displayShipments.filter((s)=>String(s.status).toUpperCase()==='DELIVERED').length; const delayedCount = p.displayShipments.filter((s)=>['REJECTED','DISPUTED','ESCALATED'].includes(String(s.status).toUpperCase())).length; const statuses = ['ASSIGNED','PICKED_UP','IN_TRANSIT','DELIVERED','CANCELLED']; return <PageChrome eyebrow="Quáº£n lÃ½ váº­n chuyá»ƒn" title="Tá»•ng quan váº­n chuyá»ƒn" subtitle="Äiá»u phá»‘i Ä‘Æ¡n hÃ ng, Ä‘á»™i xe, tÃ i xáº¿ vÃ  cáº£nh bÃ¡o váº­n hÃ nh." loading={p.loading} error={p.error} success={p.success} actions={<button onClick={p.loadWorkspace}><Icon>refresh</Icon>LÃ m má»›i</button>}><section className="ship-metrics"><Metric icon="inventory" label="Chá» phÃ¢n bá»•" value={p.eligibleOrders.length} note="ÄÆ¡n Ä‘á»§ Ä‘iá»u kiá»‡n" tone="blue"/><Metric icon="local_shipping" label="Äang váº­n chuyá»ƒn" value={p.displayShipments.length} note="Chuyáº¿n hÃ ng" tone="amber"/><Metric icon="task_alt" label="ÄÃ£ giao" value={deliveredCount} note="ÄÃ£ giao"/><Metric icon="warning" label="Cáº§n xá»­ lÃ½" value={delayedCount} note="Tráº¡ng thÃ¡i ngoáº¡i lá»‡" tone="red"/><Metric icon="badge" label="TÃ i xáº¿ hoáº¡t Ä‘á»™ng" value={p.activeDrivers.length} note="TÃ i xáº¿ Ä‘ang trá»±c"/></section><div className="ship-overview-grid"><ShipmentStatusChart shipments={p.displayShipments} /><aside className="ship-stack"><AlertsCard reports={p.shipmentReports} /><ActivityCard shipments={p.displayShipments} /></aside></div><PendingOrders orders={p.eligibleOrders} setShipmentForm={p.setShipmentForm} /></PageChrome> }
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd

function ShipmentStatusChart({ shipments = [] }) {
  const total = shipments.length
  const groups = { ASSIGNED: [], PICKED_UP: [], IN_TRANSIT: [], DELIVERED: [], CANCELLED: [], ISSUE: [] }
  shipments.forEach(s => {
    const key = String(s.status).toUpperCase()
    if (groups[key]) groups[key].push(s)
    else if (['REJECTED','DISPUTED','ESCALATED'].includes(key)) groups.ISSUE.push(s)
  })
  const bars = [
<<<<<<< HEAD
    { key: 'ASSIGNED', label: 'Chờ lấy hàng', color: '#3b82f6' },
    { key: 'PICKED_UP', label: 'Đã lấy hàng', color: '#8b5cf6' },
    { key: 'IN_TRANSIT', label: 'Đang vận chuyển', color: '#f59e0b' },
    { key: 'DELIVERED', label: 'Đã giao', color: '#22c55e' },
    { key: 'CANCELLED', label: 'Đã hủy', color: '#a1a1aa' },
    { key: 'ISSUE', label: 'Có vấn đề', color: '#ef4444' },
  ]
  return <article className="ship-card ship-map-card">
    <div className="ship-card-head"><h3><Icon>bar_chart</Icon>Phân bổ trạng thái</h3><span className="live-pill"><i />{total} chuyến</span></div>
=======
    { key: 'ASSIGNED', label: 'Chá» láº¥y hÃ ng', color: '#3b82f6' },
    { key: 'PICKED_UP', label: 'ÄÃ£ láº¥y hÃ ng', color: '#8b5cf6' },
    { key: 'IN_TRANSIT', label: 'Äang váº­n chuyá»ƒn', color: '#f59e0b' },
    { key: 'DELIVERED', label: 'ÄÃ£ giao', color: '#22c55e' },
    { key: 'CANCELLED', label: 'ÄÃ£ há»§y', color: '#a1a1aa' },
    { key: 'ISSUE', label: 'CÃ³ váº¥n Ä‘á»', color: '#ef4444' },
  ]
  return <article className="ship-card ship-map-card">
    <div className="ship-card-head"><h3><Icon>bar_chart</Icon>PhÃ¢n bá»• tráº¡ng thÃ¡i</h3><span className="live-pill"><i />{total} chuyáº¿n</span></div>
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
    <div className="ship-status-chart">
      {bars.map(b => {
        const count = groups[b.key].length
        const pct = total > 0 ? (count / total) * 100 : 0
        return <div key={b.key} className="chart-bar-row">
          <span className="chart-label">{b.label}</span>
          <div className="chart-bar-track">
            <div className="chart-bar-fill" style={{ width: pct + '%', background: b.color }} />
          </div>
          <span className="chart-value">{count}</span>
        </div>
      })}
    </div>
  </article>
}
<<<<<<< HEAD
function MapPanel({ shipments = [] }) { const visible = shipments.slice(0, 2); return <div className="ship-map">{visible.map((s, index)=><div className={`map-marker ${index===0?'one':'two'}`} key={s.shipmentId}><Icon>local_shipping</Icon><b>{s.vehiclePlateNo || `Shipment #${s.shipmentId}`}</b><small>{s.status || 'UNKNOWN'}</small></div>)}{visible.length===0?<div className="map-marker one"><Icon>map</Icon><b>Chưa có shipment</b><small>Backend chưa trả về vị trí vận chuyển.</small></div>:null}</div> }
function AlertsCard({ reports = [] }) { const openReports = reports.filter((r)=>String(r.status).toUpperCase()==='OPEN').slice(0,3); return <article className="ship-card"><div className="ship-card-head"><h3><Icon>emergency_home</Icon>Cảnh báo Vận hành</h3><span className="danger-pill">{openReports.length} OPEN</span></div>{openReports.length ? openReports.map((r,i)=><div className={`ship-warning w${i}`} key={r.reportId}><strong>{r.issueType || 'Issue report'}</strong><p>{r.description || `Shipment #${r.shipmentId}`}</p></div>) : <p>Không có issue report mở từ backend.</p>}</article> }
function ActivityCard({ shipments = [] }) { return <article className="ship-card"><h3>Hoạt động Gần đây</h3><div className="ship-timeline">{shipments.slice(0,3).map((s)=><div key={s.shipmentId}><i /><strong>Shipment #{s.shipmentId}</strong><p>{s.status || 'UNKNOWN'} · {s.updatedAt || s.createdAt || 'No timestamp'}</p></div>)}{shipments.length===0?<p>Chưa có hoạt động shipment từ backend.</p>:null}</div></article> }
function PendingOrders({ orders, setShipmentForm }) { const list = safeList(orders); return <article className="ship-card"><div className="ship-card-head"><h3>Đơn hàng Chờ Phân bổ</h3><a href="/shipping/create">Tạo shipment</a></div>{list.length ? <div className="ship-table-wrap"><table className="ship-table"><thead><tr><th>Mã đơn</th><th>Điểm xuất phát</th><th>Điểm đến</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{list.map(o=><tr key={o.orderId}><td>#{o.orderId}</td><td>{o.farmName || 'Farm'}</td><td>{o.retailerName || 'Retailer'}</td><td><Status value={o.orderStatus} /></td><td><button onClick={()=>setShipmentForm(prev=>({...prev, orderId:String(o.orderId)}))}>Chọn</button></td></tr>)}</tbody></table></div> : <p>Không có order đủ điều kiện tạo shipment.</p>}</article> }
=======
function MapPanel({ shipments = [] }) { const visible = shipments.slice(0, 2); return <div className="ship-map">{visible.map((s, index)=><div className={`map-marker ${index===0?'one':'two'}`} key={s.shipmentId}><Icon>local_shipping</Icon><b>{s.vehiclePlateNo || `Chuyáº¿n #${s.shipmentId}`}</b><small>{s.status || 'CHÆ¯A XÃC Äá»ŠNH'}</small></div>)}{visible.length===0?<div className="map-marker one"><Icon>map</Icon><b>ChÆ°a cÃ³ chuyáº¿n hÃ ng</b><small>Backend chÆ°a tráº£ vá» vá»‹ trÃ­ váº­n chuyá»ƒn.</small></div>:null}<div className="map-controls"><button type="button">+</button><button type="button">âˆ’</button></div></div> }
function AlertsCard({ reports = [] }) { const openReports = reports.filter((r)=>String(r.status).toUpperCase()==='OPEN').slice(0,3); return <article className="ship-card"><div className="ship-card-head"><h3><Icon>emergency_home</Icon>Cáº£nh bÃ¡o váº­n hÃ nh</h3><span className="danger-pill">{openReports.length} Ä‘ang má»Ÿ</span></div>{openReports.length ? openReports.map((r,i)=><div className={`ship-warning w${i}`} key={r.reportId}><strong>{r.issueType || 'BÃ¡o cÃ¡o sá»± cá»‘'}</strong><p>{r.description || `Chuyáº¿n #${r.shipmentId}`}</p></div>) : <p>KhÃ´ng cÃ³ bÃ¡o cÃ¡o sá»± cá»‘ Ä‘ang má»Ÿ.</p>}</article> }
function ActivityCard({ shipments = [] }) { return <article className="ship-card"><h3>Hoáº¡t Ä‘á»™ng gáº§n Ä‘Ã¢y</h3><div className="ship-timeline">{shipments.slice(0,3).map((s)=><div key={s.shipmentId}><i /><strong>Chuyáº¿n #{s.shipmentId}</strong><p>{s.status || 'CHÆ¯A XÃC Äá»ŠNH'} Â· {s.updatedAt || s.createdAt || 'ChÆ°a cÃ³ má»‘c thá»i gian'}</p></div>)}{shipments.length===0?<p>ChÆ°a cÃ³ hoáº¡t Ä‘á»™ng chuyáº¿n hÃ ng.</p>:null}</div></article> }
function PendingOrders({ orders, setShipmentForm }) { const list = safeList(orders); return <article className="ship-card"><div className="ship-card-head"><h3>ÄÆ¡n hÃ ng chá» phÃ¢n bá»•</h3><a href="/shipping/orders">Táº¡o chuyáº¿n</a></div>{list.length ? <div className="ship-table-wrap"><table className="ship-table"><thead><tr><th>MÃ£ Ä‘Æ¡n</th><th>Äiá»ƒm xuáº¥t phÃ¡t</th><th>Äiá»ƒm Ä‘áº¿n</th><th>Tráº¡ng thÃ¡i</th><th>Thao tÃ¡c</th></tr></thead><tbody>{list.map(o=><tr key={o.orderId}><td>#{o.orderId}</td><td>{o.farmName || 'NÃ´ng tráº¡i'}</td><td>{o.retailerName || 'NhÃ  bÃ¡n láº»'}</td><td><Status value={o.orderStatus} /></td><td><button onClick={()=>setShipmentForm(prev=>({...prev, orderId:String(o.orderId)}))}>Chá»n</button></td></tr>)}</tbody></table></div> : <p>KhÃ´ng cÃ³ Ä‘Æ¡n Ä‘á»§ Ä‘iá»u kiá»‡n táº¡o chuyáº¿n.</p>}</article> }
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
function OrdersPage(p) {
  const orders = safeList(p.eligibleOrders)
  const delivered = p.displayShipments.filter((s)=>String(s.status).toUpperCase()==='DELIVERED')
  const inTransit = p.displayShipments.filter((s)=>['ASSIGNED','PICKED_UP','IN_TRANSIT'].includes(String(s.status).toUpperCase()))
  const [tab, setTab] = useState('pending')
  const pendingCount = orders.length; const activeCount = inTransit.length; const doneCount = delivered.length
<<<<<<< HEAD
  return <PageChrome eyebrow="Đơn hàng & Vận chuyển" title="Quản lý đơn hàng" subtitle="Xem đơn hàng, tạo chuyến, theo dõi và hủy chuyến hàng." loading={p.loading} error={p.error} success={p.success} actions={<button onClick={p.loadWorkspace}><Icon>refresh</Icon>Làm mới</button>}>
    <section className="ship-metrics four">
      <Metric icon="order_approve" label="Chờ tạo chuyến" value={pendingCount} note={pendingCount+' đơn'} tone="blue"/>
      <Metric icon="local_shipping" label="Đang vận chuyển" value={activeCount} note={activeCount+' chuyến'}/>
      <Metric icon="task_alt" label="Đã giao" value={doneCount} note={doneCount+' chuyến'}/>
      <Metric icon="farm" label="Nông trại đối tác" value={[...new Set(orders.map(o=>o.farmName).filter(Boolean))].length || 0} note="Đang hợp tác" tone="green"/>
    </section>
    <div className="ship-tabs" style={{marginBottom:20}}>
      <button className={tab==='pending'?'active':''} onClick={()=>setTab('pending')}>Chờ xử lý {pendingCount>0?`(${pendingCount})`:''}</button>
      <button className={tab==='active'?'active':''} onClick={()=>setTab('active')}>Đang vận chuyển {activeCount>0?`(${activeCount})`:''}</button>
      <button className={tab==='done'?'active':''} onClick={()=>setTab('done')}>Đã giao {doneCount>0?`(${doneCount})`:''}</button>
=======
  return <PageChrome eyebrow="ÄÆ¡n hÃ ng & Váº­n chuyá»ƒn" title="Quáº£n lÃ½ Ä‘Æ¡n hÃ ng" subtitle="Xem Ä‘Æ¡n hÃ ng, táº¡o chuyáº¿n, theo dÃµi vÃ  há»§y chuyáº¿n hÃ ng." loading={p.loading} error={p.error} success={p.success} actions={<button onClick={p.loadWorkspace}><Icon>refresh</Icon>LÃ m má»›i</button>}>
    <section className="ship-metrics four">
      <Metric icon="order_approve" label="Chá» táº¡o chuyáº¿n" value={pendingCount} note={pendingCount+' Ä‘Æ¡n'} tone="blue"/>
      <Metric icon="local_shipping" label="Äang váº­n chuyá»ƒn" value={activeCount} note={activeCount+' chuyáº¿n'}/>
      <Metric icon="task_alt" label="ÄÃ£ giao" value={doneCount} note={doneCount+' chuyáº¿n'}/>
      <Metric icon="farm" label="NÃ´ng tráº¡i Ä‘á»‘i tÃ¡c" value={[...new Set(orders.map(o=>o.farmName).filter(Boolean))].length || 0} note="Äang há»£p tÃ¡c" tone="green"/>
    </section>
    <div className="ship-tabs" style={{marginBottom:20}}>
      <button className={tab==='pending'?'active':''} onClick={()=>setTab('pending')}>Chá» xá»­ lÃ½ {pendingCount>0?`(${pendingCount})`:''}</button>
      <button className={tab==='active'?'active':''} onClick={()=>setTab('active')}>Äang váº­n chuyá»ƒn {activeCount>0?`(${activeCount})`:''}</button>
      <button className={tab==='done'?'active':''} onClick={()=>setTab('done')}>ÄÃ£ giao {doneCount>0?`(${doneCount})`:''}</button>
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
    </div>
    {tab==='pending' && <PendingTab orders={orders} activeDrivers={p.activeDrivers} activeVehicles={p.activeVehicles} shipmentForm={p.shipmentForm} savingShipment={p.savingShipment} onSubmit={p.submitShipment} onChange={p.onShipmentChange} eligibleOrders={p.eligibleOrders} setShipmentForm={p.setShipmentForm} />}
    {tab==='active' && <ActiveTab shipments={inTransit} loadWorkspace={p.loadWorkspace} />}
    {tab==='done' && <DoneTab shipments={delivered} />}
  </PageChrome>
}
function PendingTab({ orders, activeDrivers, activeVehicles, shipmentForm, savingShipment, onSubmit, onChange, eligibleOrders, setShipmentForm }) {
  const [creating, setCreating] = useState(null)
<<<<<<< HEAD
  if (!orders.length) return <article className="ship-card"><div className="ship-empty"><Icon>inbox</Icon><h4>Chưa có đơn hàng</h4><p>Không có đơn hàng nào sẵn sàng từ backend.</p></div></article>
=======
  if (!orders.length) return <article className="ship-card"><div className="ship-empty"><Icon>inbox</Icon><h4>ChÆ°a cÃ³ Ä‘Æ¡n hÃ ng</h4><p>KhÃ´ng cÃ³ Ä‘Æ¡n hÃ ng nÃ o sáºµn sÃ ng tá»« backend.</p></div></article>
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
  return <div className="order-list">{orders.map(o=>{
    const isOpen = creating===o.orderId
    return <div key={o.orderId} className="order-card">
      <div className="order-card-top">
<<<<<<< HEAD
        <div className="order-parties"><span className="order-party farm">{o.farmName || 'Nông trại'}</span><span className="order-arrow"><Icon>arrow_forward</Icon></span><span className="order-party retailer">{o.retailerName || 'Nhà bán lẻ'}</span></div>
        <Status value={o.status || 'READY_FOR_SHIPMENT'} />
      </div>
      <div className="order-card-details">
        <span className="order-detail"><Icon>tag</Icon>Mã đơn: #{o.orderId}</span>
        {o.batchCode?<span className="order-detail"><Icon>inventory_2</Icon>Lô: {o.batchCode}</span>:null}
        {o.traceCode?<span className="order-detail"><Icon>qr_code_scanner</Icon>Mã vạch: {o.traceCode}</span>:null}
        <span className="order-detail"><Icon>payments</Icon>TT: {o.paymentStatus || '---'}</span>
        <span className="order-detail"><Icon>calendar_today</Icon>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</span>
      </div>
      {!isOpen ? <div className="order-card-action"><button className="order-create-btn" onClick={()=>{setCreating(o.orderId); setShipmentForm(prev=>({...prev, orderId:String(o.orderId)}))}}><Icon>add_shipping</Icon>Tạo chuyến hàng</button></div>
      :<form className="ship-form" onSubmit={async(e)=>{e.preventDefault(); await onSubmit(e); setCreating(null)}} style={{borderTop:'1px solid var(--ship-border)',paddingTop:16}}>
        <div className="two-cols">
          <label>Tài xế<select name="driverId" value={shipmentForm.driverId} onChange={onChange} required><option value="">Chọn tài xế</option>{activeDrivers.map(d=><option key={d.driverId} value={d.driverId}>{d.driverCode} - {d.userFullName}</option>)}</select></label>
          <label>Phương tiện<select name="vehicleId" value={shipmentForm.vehicleId} onChange={onChange} required><option value="">Chọn xe</option>{activeVehicles.map(v=><option key={v.vehicleId} value={v.vehicleId}>{v.plateNo} - {v.vehicleType}</option>)}</select></label>
        </div>
        <textarea name="note" value={shipmentForm.note} onChange={onChange} placeholder="Ghi chú (không bắt buộc)" rows={2}/>
        <div style={{display:'flex',gap:10}}>
          <button className="order-create-btn" disabled={savingShipment}>{savingShipment?'Đang tạo...':'Xác nhận tạo chuyến'}</button>
          <button type="button" className="secondary-action" onClick={()=>setCreating(null)} style={{padding:'10px 20px'}}>Hủy</button>
=======
        <div className="order-parties"><span className="order-party farm">{o.farmName || 'NÃ´ng tráº¡i'}</span><span className="order-arrow"><Icon>arrow_forward</Icon></span><span className="order-party retailer">{o.retailerName || 'NhÃ  bÃ¡n láº»'}</span></div>
        <Status value={o.status || 'READY_FOR_SHIPMENT'} />
      </div>
      <div className="order-card-details">
        <span className="order-detail"><Icon>tag</Icon>MÃ£ Ä‘Æ¡n: #{o.orderId}</span>
        {o.batchCode?<span className="order-detail"><Icon>inventory_2</Icon>LÃ´: {o.batchCode}</span>:null}
        {o.traceCode?<span className="order-detail"><Icon>qr_code_scanner</Icon>MÃ£ váº¡ch: {o.traceCode}</span>:null}
        <span className="order-detail"><Icon>payments</Icon>TT: {o.paymentStatus || '---'}</span>
        <span className="order-detail"><Icon>calendar_today</Icon>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</span>
      </div>
      {!isOpen ? <div className="order-card-action"><button className="order-create-btn" onClick={()=>{setCreating(o.orderId); setShipmentForm(prev=>({...prev, orderId:String(o.orderId)}))}}><Icon>add_shipping</Icon>Táº¡o chuyáº¿n hÃ ng</button></div>
      :<form className="ship-form" onSubmit={async(e)=>{e.preventDefault(); await onSubmit(e); setCreating(null)}} style={{borderTop:'1px solid var(--ship-border)',paddingTop:16}}>
        <div className="two-cols">
          <label>TÃ i xáº¿<select name="driverId" value={shipmentForm.driverId} onChange={onChange} required><option value="">Chá»n tÃ i xáº¿</option>{activeDrivers.map(d=><option key={d.driverId} value={d.driverId}>{d.driverCode} - {d.userFullName}</option>)}</select></label>
          <label>PhÆ°Æ¡ng tiá»‡n<select name="vehicleId" value={shipmentForm.vehicleId} onChange={onChange} required><option value="">Chá»n xe</option>{activeVehicles.map(v=><option key={v.vehicleId} value={v.vehicleId}>{v.plateNo} - {v.vehicleType}</option>)}</select></label>
        </div>
        <textarea name="note" value={shipmentForm.note} onChange={onChange} placeholder="Ghi chÃº (khÃ´ng báº¯t buá»™c)" rows={2}/>
        <div style={{display:'flex',gap:10}}>
          <button className="order-create-btn" disabled={savingShipment}>{savingShipment?'Äang táº¡o...':'XÃ¡c nháº­n táº¡o chuyáº¿n'}</button>
          <button type="button" className="secondary-action" onClick={()=>setCreating(null)} style={{padding:'10px 20px'}}>Há»§y</button>
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
        </div>
      </form>}
    </div>
  })}</div>
}
function ActiveTab({ shipments, loadWorkspace }) {
  const [cancelId, setCancelId] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
<<<<<<< HEAD
  if (!shipments.length) return <article className="ship-card"><div className="ship-empty"><Icon>local_shipping</Icon><h4>Không có chuyến hàng nào</h4><p>Chưa có chuyến hàng đang vận chuyển.</p></div></article>
=======
  if (!shipments.length) return <article className="ship-card"><div className="ship-empty"><Icon>local_shipping</Icon><h4>KhÃ´ng cÃ³ chuyáº¿n hÃ ng nÃ o</h4><p>ChÆ°a cÃ³ chuyáº¿n hÃ ng Ä‘ang váº­n chuyá»ƒn.</p></div></article>
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
  async function handleCancel(shipmentId) {
    if (cancelling||!cancelReason.trim()) return
    setCancelling(true)
    try {
      await import('../services/workflowService.js').then(m=>m.updateShipmentStatus(shipmentId, {status:'CANCELLED', note:cancelReason.trim()}))
      setCancelId(null); setCancelReason('')
      await loadWorkspace()
    } catch(e) { setCancelling(false) }
  }
  return <div className="order-list">{shipments.map(s=>{
    const isCancelling = cancelId===s.shipmentId
    return <div key={s.shipmentId} className="order-card">
      <div className="order-card-top">
<<<<<<< HEAD
        <div><b>Chuyến #{s.shipmentId}</b><span style={{marginLeft:12,color:'var(--ship-muted)',fontSize:13}}>Đơn #{s.orderId}</span></div>
=======
        <div><b>Chuyáº¿n #{s.shipmentId}</b><span style={{marginLeft:12,color:'var(--ship-muted)',fontSize:13}}>ÄÆ¡n #{s.orderId}</span></div>
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
        <Status value={s.status} />
      </div>
      <div className="order-card-details">
        <span className="order-detail"><Icon>person</Icon>{s.driverCode||'---'}</span>
        <span className="order-detail"><Icon>directions_car</Icon>{s.vehiclePlateNo||'---'}</span>
        <span className="order-detail"><Icon>store</Icon>{s.farmName||'---'}</span>
        <span className="order-detail"><Icon>storefront</Icon>{s.retailerName||'---'}</span>
        <span className="order-detail"><Icon>calendar_today</Icon>{new Date(s.updatedAt||s.createdAt).toLocaleDateString('vi-VN')}</span>
      </div>
      <div className="progress" style={{marginBottom:12}}><i style={{width:String(s.status).toUpperCase()==='IN_TRANSIT'?'68%':String(s.status).toUpperCase()==='PICKED_UP'?'35%':'18%'}}/></div>
<<<<<<< HEAD
      {!isCancelling ? <button className="order-create-btn" style={{background:'var(--ship-secondary)'}} onClick={()=>{setCancelId(s.shipmentId); setCancelReason('')}}><Icon>cancel</Icon>Hủy chuyến</button>
      :<form className="ship-form" onSubmit={e=>{e.preventDefault(); handleCancel(s.shipmentId)}} style={{borderTop:'1px solid var(--ship-border)',paddingTop:16}}>
        <textarea rows={2} placeholder="Lý do hủy..." value={cancelReason} onChange={e=>setCancelReason(e.target.value)} required/>
        <div style={{display:'flex',gap:10}}>
          <button className="order-create-btn" style={{background:'var(--ship-danger)'}} disabled={cancelling}>{cancelling?'Đang hủy...':'Xác nhận hủy'}</button>
          <button type="button" className="secondary-action" onClick={()=>setCancelId(null)} style={{padding:'10px 20px'}}>Quay lại</button>
=======
      {!isCancelling ? <button className="order-create-btn" style={{background:'var(--ship-secondary)'}} onClick={()=>{setCancelId(s.shipmentId); setCancelReason('')}}><Icon>cancel</Icon>Há»§y chuyáº¿n</button>
      :<form className="ship-form" onSubmit={e=>{e.preventDefault(); handleCancel(s.shipmentId)}} style={{borderTop:'1px solid var(--ship-border)',paddingTop:16}}>
        <textarea rows={2} placeholder="LÃ½ do há»§y..." value={cancelReason} onChange={e=>setCancelReason(e.target.value)} required/>
        <div style={{display:'flex',gap:10}}>
          <button className="order-create-btn" style={{background:'var(--ship-danger)'}} disabled={cancelling}>{cancelling?'Äang há»§y...':'XÃ¡c nháº­n há»§y'}</button>
          <button type="button" className="secondary-action" onClick={()=>setCancelId(null)} style={{padding:'10px 20px'}}>Quay láº¡i</button>
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
        </div>
      </form>}
    </div>
  })}</div>
}
function DoneTab({ shipments }) {
<<<<<<< HEAD
  if (!shipments.length) return <article className="ship-card"><div className="ship-empty"><Icon>check_circle</Icon><h4>Chưa có đơn đã giao</h4><p>Các chuyến hàng đã giao thành công sẽ hiển thị ở đây.</p></div></article>
  return <article className="ship-card"><div className="ship-table-wrap"><table className="ship-table"><thead><tr><th>Chuyến</th><th>Đơn hàng</th><th>Nông trại</th><th>Nhà bán lẻ</th><th>Tài xế</th><th>Phương tiện</th><th>Ngày giao</th></tr></thead><tbody>{shipments.map(s=><tr key={s.shipmentId}><td><b>#{s.shipmentId}</b></td><td>#{s.orderId}</td><td>{s.farmName||'---'}</td><td>{s.retailerName||'---'}</td><td>{s.driverCode||'---'}</td><td>{s.vehiclePlateNo||'---'}</td><td>{new Date(s.updatedAt||s.createdAt).toLocaleDateString('vi-VN')}</td></tr>)}</tbody></table></div></article>
=======
  if (!shipments.length) return <article className="ship-card"><div className="ship-empty"><Icon>check_circle</Icon><h4>ChÆ°a cÃ³ Ä‘Æ¡n Ä‘Ã£ giao</h4><p>CÃ¡c chuyáº¿n hÃ ng Ä‘Ã£ giao thÃ nh cÃ´ng sáº½ hiá»ƒn thá»‹ á»Ÿ Ä‘Ã¢y.</p></div></article>
  return <article className="ship-card"><div className="ship-table-wrap"><table className="ship-table"><thead><tr><th>Chuyáº¿n</th><th>ÄÆ¡n hÃ ng</th><th>NÃ´ng tráº¡i</th><th>NhÃ  bÃ¡n láº»</th><th>TÃ i xáº¿</th><th>PhÆ°Æ¡ng tiá»‡n</th><th>NgÃ y giao</th></tr></thead><tbody>{shipments.map(s=><tr key={s.shipmentId}><td><b>#{s.shipmentId}</b></td><td>#{s.orderId}</td><td>{s.farmName||'---'}</td><td>{s.retailerName||'---'}</td><td>{s.driverCode||'---'}</td><td>{s.vehiclePlateNo||'---'}</td><td>{new Date(s.updatedAt||s.createdAt).toLocaleDateString('vi-VN')}</td></tr>)}</tbody></table></div></article>
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
}
function SuccessfulOrdersPage(p) {
  const delivered = p.displayShipments.filter(s=>String(s.status).toUpperCase()==='DELIVERED')
  const pairs = {}
  delivered.forEach(s=>{
<<<<<<< HEAD
    const key = `${s.farmName||'?'} → ${s.retailerName||'?'}`
    if (!pairs[key]) pairs[key] = []
    pairs[key].push(s)
  })
  return <PageChrome eyebrow="Báo cáo thành công" title="Đơn hàng hoàn thành" subtitle="Danh sách đơn hàng đã giao thành công giữa Nhà bán lẻ và Quản lý Trang trại." loading={p.loading} error={p.error} success={p.success} actions={<button onClick={p.loadWorkspace}><Icon>refresh</Icon>Làm mới</button>}>
    <section className="ship-metrics four">
      <Metric icon="check_circle" label="Đã giao thành công" value={delivered.length} note={`${delivered.length} chuyến`} tone="green"/>
      <Metric icon="store" label="Nông trại" value={Object.keys(pairs).length} note="Đối tác" tone="blue"/>
      <Metric icon="badge" label="Tài xế" value={[...new Set(delivered.map(s=>s.driverCode).filter(Boolean))].length} note="Đã giao hàng" tone="amber"/>
      <Metric icon="local_shipping" label="Phương tiện" value={[...new Set(delivered.map(s=>s.vehiclePlateNo).filter(Boolean))].length} note="Đã sử dụng"/>
    </section>
    {Object.keys(pairs).length===0 ? <article className="ship-card"><div className="ship-empty"><Icon>check_circle</Icon><h4>Chưa có đơn hàng hoàn thành</h4><p>Các đơn hàng đã giao thành công giữa nhà bán lẻ và trang trại sẽ xuất hiện tại đây.</p></div></article>
    : Object.entries(pairs).map(([route, items])=><article key={route} className="ship-card" style={{marginBottom:16}}>
      <div className="ship-card-head"><h3><Icon>swap_horiz</Icon>{route}</h3><span className="success-pill">{items.length} đơn</span></div>
      <div className="ship-table-wrap"><table className="ship-table"><thead><tr><th>Chuyến</th><th>Đơn hàng</th><th>Tài xế</th><th>Phương tiện</th><th>Ngày giao</th></tr></thead><tbody>{items.map(s=><tr key={s.shipmentId}><td><b>#{s.shipmentId}</b></td><td>#{s.orderId}</td><td>{s.driverCode||'---'}</td><td>{s.vehiclePlateNo||'---'}</td><td>{new Date(s.updatedAt||s.createdAt).toLocaleDateString('vi-VN')}</td></tr>)}</tbody></table></div>
    </article>)}
  </PageChrome>
}
function ShipmentStatusForm(p) { const canCancel = p.selectedShipment && !['DELIVERED','CANCELLED','REJECTED','DISPUTED','ESCALATED'].includes(String(p.selectedShipment.status).toUpperCase()); return <article className="ship-card"><div className="ship-card-head"><h3><Icon>switch_access_shortcut</Icon>Cập nhật trạng thái</h3></div>{!p.selectedShipment?<p>Chọn shipment để cập nhật.</p>:<form className="ship-form" onSubmit={p.submitShipmentStatus}><select name="status" value={p.shipmentStatusForm.status} onChange={p.onShipmentStatusChange}><option value="ASSIGNED">ASSIGNED</option><option value="PICKED_UP">PICKED_UP</option><option value="IN_TRANSIT">IN_TRANSIT</option><option value="DELIVERED">DELIVERED</option>{canCancel?<option value="CANCELLED">CANCELLED (Hủy)</option>:null}</select><textarea name="note" value={p.shipmentStatusForm.note} onChange={p.onShipmentStatusChange} placeholder="Ghi chú..." rows={2}/><button disabled={p.savingShipment}>{p.savingShipment?'Đang lưu...':'Cập nhật'}</button></form>}</article> }
function ShipmentTable({ shipments }) { if (!shipments.length) return <p>Chưa có shipment từ backend.</p>; return <div className="ship-table-wrap"><table className="ship-table large"><thead><tr><th>Shipment ID</th><th>Origin</th><th>Destination</th><th>Driver & Vehicle</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{shipments.map((s)=><tr key={s.shipmentId}><td><b>#{s.shipmentId}</b><small>Order #{s.orderId || 'N/A'}</small></td><td>{s.farmName || 'Nông trại'}</td><td>{s.retailerName || 'Retailer'}</td><td>{s.driverCode ? `${s.driverCode} • ${s.vehiclePlateNo || 'N/A'}` : <a href="/shipping/drivers" className="dash-btn">Assign Driver</a>}</td><td><Status value={s.status} /></td><td>{s.updatedAt || s.createdAt || 'N/A'}</td><td><a href={`/shipping/tracking?shipmentId=${s.shipmentId}`} title="Xem chi tiết"><Icon>open_in_new</Icon></a></td></tr>)}</tbody></table></div> }
function CreateShipmentPage(p) { return <PageChrome eyebrow="Shipping / Orders / New Shipment" title="Lập Lệnh Vận chuyển" subtitle="Configure logistics and blockchain verification for agricultural orders." loading={p.loading} error={p.error} success={p.success}><form className="ship-create-grid" onSubmit={p.submitShipment}><div className="ship-form-stack"><FormSection step="1" title="Order Identification"><label>Related Order<select name="orderId" value={p.shipmentForm.orderId} onChange={p.onShipmentChange} required><option value="">Chọn order</option>{safeList(p.eligibleOrders).map(o=><option key={o.orderId} value={o.orderId}>#{o.orderId} • {o.farmName} → {o.retailerName}</option>)}</select></label></FormSection><FormSection step="2" title="Logistics Nodes"><div className="node-card"><Icon>location_on</Icon><input value={p.eligibleOrders.find(o=>String(o.orderId)===String(p.shipmentForm.orderId))?.farmName || ''} readOnly placeholder="Origin resolved from selected order" /></div><div className="node-line"/><div className="node-card"><Icon>local_shipping</Icon><input value={p.eligibleOrders.find(o=>String(o.orderId)===String(p.shipmentForm.orderId))?.retailerName || ''} readOnly placeholder="Destination resolved from selected order" /></div></FormSection><FormSection step="3" title="Scheduling & Resources"><div className="two-cols"><label>Driver<select name="driverId" value={p.shipmentForm.driverId} onChange={p.onShipmentChange}><option value="">Chọn driver</option>{p.activeDrivers.map(d=><option key={d.driverId} value={d.driverId}>{d.driverCode} • {d.userFullName}</option>)}</select></label><label>Vehicle<select name="vehicleId" value={p.shipmentForm.vehicleId} onChange={p.onShipmentChange}><option value="">Chọn vehicle</option>{p.activeVehicles.map(v=><option key={v.vehicleId} value={v.vehicleId}>{v.plateNo} • {v.vehicleType}</option>)}</select></label></div></FormSection><FormSection title="Special Instructions"><textarea name="note" value={p.shipmentForm.note} onChange={p.onShipmentChange} placeholder="Mention handling requirements, temperature thresholds, or ledger notes..." /></FormSection></div><aside className="ship-summary"><MapPanel shipments={p.displayShipments} /><div className="protocol-card"><Icon fill>verified_user</Icon><h3>Backend Verification</h3><p>Shipment evidence is committed by the backend after successful creation and status updates.</p><small>HASH: assigned by API / blockchain service</small></div><button className="primary-action" disabled={p.savingShipment}><Icon>send</Icon>{p.savingShipment?'Đang tạo...':'Confirm & Create Shipment'}</button><button type="button" className="secondary-action" onClick={()=>p.setShipmentForm({orderId:'',driverId:'',vehicleId:'',note:''})}>Clear form</button></aside></form></PageChrome> }
function FormSection({ step, title, children }) { return <article className="ship-card form-section"><h3>{step ? <span>{step}</span> : <Icon>notes</Icon>}{title}</h3>{children}</article> }
function TrackingPage(p) { return <PageChrome eyebrow="Shipping / Tracking" title="Theo dõi Hành trình" subtitle="Live shipment status from backend." loading={p.loading} error={p.error} success={p.success}><div className="tracking-layout"><div className="tracking-map"><MapPanel shipments={p.displayShipments} /><div className="tracking-stats"><Metric icon="check_circle" label="Delivered" value={p.displayShipments.filter((s)=>String(s.status).toUpperCase()==='DELIVERED').length} note="API"/><Metric icon="sensors" label="Active Units" value={p.displayShipments.length} note="LIVE" tone="blue"/></div></div><aside className="tracking-list"><h3>Lô hàng đang đi <span className="live-pill"><i/>LIVE</span></h3>{p.displayShipments.length ? p.displayShipments.map((s,i)=><div className={`tracking-card ${i===0?'active':''}`} key={s.shipmentId}><strong>Shipment #{s.shipmentId}</strong><p>{s.farmName} → {s.retailerName}</p><div className="progress"><i style={{width:String(s.status).toUpperCase()==='DELIVERED'?'100%':String(s.status).toUpperCase()==='IN_TRANSIT'?'68%':'35%'}} /></div><Status value={s.status}/></div>) : <p>Chưa có shipment active để theo dõi.</p>}</aside></div></PageChrome> }
function DriversPage(p) { return <PageChrome eyebrow="Shipping / Drivers" title="Quản lý Tài xế" subtitle={`${p.displayDrivers.length} tài xế trong mạng lưới • ${p.activeDrivers.length} đang hoạt động`} loading={p.loading} error={p.error} success={p.success}><section className="ship-metrics four"><Metric icon="group" label="Tổng số tài xế" value={p.displayDrivers.length} note="API"/><Metric icon="radio_button_checked" label="Đang hoạt động" value={p.activeDrivers.length} note="ACTIVE"/><Metric icon="star" label="Đã gán shipment" value={p.displayShipments.filter((s)=>s.driverCode).length} note="Assignments" tone="amber"/><Metric icon="task_alt" label="Đã giao" value={p.displayShipments.filter((s)=>String(s.status).toUpperCase()==='DELIVERED').length} note="Delivered" tone="blue"/></section><div className="drivers-grid"><article className="ship-card"><DriverTable drivers={p.displayDrivers} fillDriver={p.fillDriver} handleDeleteDriver={p.handleDeleteDriver}/></article><DriverForm {...p}/></div><article className="ship-card"><h3>Bản đồ Tài xế thời gian thực</h3><MapPanel shipments={p.displayShipments} /></article></PageChrome> }
function DriverTable({ drivers, fillDriver, handleDeleteDriver }) { if (!drivers.length) return <p>Chưa có driver từ backend.</p>; return <div className="ship-table-wrap"><table className="ship-table"><thead><tr><th>Tài xế</th><th>Liên hệ</th><th>Trạng thái</th><th>Đơn hiện tại</th><th>Đánh giá</th><th></th></tr></thead><tbody>{drivers.map(d=><tr key={d.driverId}><td><b>{d.userFullName || d.driverCode}</b><small>ID: {d.driverId}</small></td><td>{d.phone || 'N/A'}<small>{d.email || d.driverCode || ''}</small></td><td><Status value={d.status}/></td><td><div className="progress"><i style={{width:d.status==='ACTIVE'?'75%':'30%'}}/></div></td><td>{d.rating || 'N/A'}</td><td style={{display:'flex',gap:4}}><button onClick={()=>fillDriver(d)}><Icon>edit</Icon></button><button onClick={()=>handleDeleteDriver(d.driverId)} style={{color:'var(--proto-error)'}}><Icon>delete</Icon></button></td></tr>)}</tbody></table></div> }
function DriverForm(p) { const isUpdate = Boolean(p.selectedDriverId); return <article className="ship-card"><h3>{isUpdate ? 'Cập nhật tài xế' : 'Thêm tài xế mới'}</h3><form className="ship-form" onSubmit={p.submitDriver}>{!isUpdate && <><input name="fullName" placeholder="Họ và tên" value={p.driverForm.fullName} onChange={p.onDriverChange} required/><input name="email" type="email" placeholder="Email" value={p.driverForm.email} onChange={p.onDriverChange} required/><input name="password" type="password" placeholder="Mật khẩu (ít nhất 8 ký tự)" value={p.driverForm.password} onChange={p.onDriverChange} required/></>}<input name="driverCode" placeholder="Mã tài xế" value={p.driverForm.driverCode} onChange={p.onDriverChange} disabled={isUpdate} required/><input name="licenseNo" placeholder="Số giấy phép lái xe" value={p.driverForm.licenseNo} onChange={p.onDriverChange} required/>{isUpdate && <input name="status" value={p.driverForm.status} onChange={p.onDriverChange}/>}<button disabled={p.savingDriver}>{p.savingDriver?'Đang lưu...':(isUpdate?'Cập nhật':'Tạo tài xế')}</button></form></article> }
function VehiclesPage(p) { return <PageChrome eyebrow="Shipping / Vehicles" title="Quản lý Phương tiện" subtitle="Biển số, tải trọng, trạng thái vận hành." loading={p.loading} error={p.error} success={p.success}><div className="drivers-grid"><article className="ship-card"><div className="ship-table-wrap"><table className="ship-table"><thead><tr><th>Biển số</th><th>Loại xe</th><th>Tải trọng</th><th>Trạng thái</th><th></th></tr></thead><tbody>{p.displayVehicles.map(v=><tr key={v.vehicleId}><td><b>{v.plateNo}</b></td><td>{v.vehicleType}</td><td>{formatCapacity(v.capacity)}</td><td><Status value={v.status}/></td><td style={{display:'flex',gap:4}}><button onClick={()=>p.fillVehicle(v)}><Icon>edit</Icon></button><button onClick={()=>p.handleDeleteVehicle(v.vehicleId)} style={{color:'var(--proto-error)'}}><Icon>delete</Icon></button></td></tr>)}{p.displayVehicles.length===0?<tr><td colSpan="5">Chưa có vehicle từ backend.</td></tr>:null}</tbody></table></div></article><article className="ship-card"><h3>{p.selectedVehicleId?'Cập nhật vehicle':'Tạo vehicle'}</h3><form className="ship-form" onSubmit={p.submitVehicle}><input name="plateNo" placeholder="Plate number" value={p.vehicleForm.plateNo} onChange={p.onVehicleChange} disabled={Boolean(p.selectedVehicleId)} required/><input name="vehicleType" placeholder="Vehicle type" value={p.vehicleForm.vehicleType} onChange={p.onVehicleChange} required/><input name="capacity" type="number" placeholder="Capacity" value={p.vehicleForm.capacity} onChange={p.onVehicleChange} required/><input name="status" value={p.vehicleForm.status} onChange={p.onVehicleChange}/><button disabled={p.savingVehicle}>Lưu vehicle</button></form></article></div></PageChrome> }
function NotificationsPage(p) { return <PageChrome eyebrow="Shipping / Notifications" title="Thông báo logistics" subtitle="Nhận/gửi thông tin thay đổi shipment." loading={p.loading} error={p.error} success={p.success}><article className="ship-card">{p.notifications.length===0?<p>Chưa có notification.</p>:p.notifications.map(n=><div className="notification-row" key={n.notificationId}><div><strong>{n.title}</strong><p>{n.message}</p></div>{!n.read?<button onClick={()=>p.handleMarkRead(n.notificationId)}>Đánh dấu đọc</button>:<Status value="READ"/>}</div>)}</article></PageChrome> }
function ReportsPage(p) { const reports = safeList(p.shipmentReports); return <PageChrome eyebrow="Shipping / Reports" title="Báo cáo vận hành" subtitle="Driver issue inbox, proof, QR scan và SLA." loading={p.loading} error={p.error} success={p.success} actions={<button onClick={p.loadWorkspace}><Icon>refresh</Icon>Làm mới</button>}><VerificationHub shipments={p.displayShipments} /><article className="ship-card"><div className="ship-card-head"><h3>Driver Issue Inbox</h3><span className="danger-pill">{reports.filter((r)=>String(r.status).toUpperCase()==='OPEN').length} OPEN</span></div>{reports.length ? <div className="ship-table-wrap"><table className="ship-table"><thead><tr><th>Report</th><th>Shipment</th><th>Driver</th><th>Issue</th><th>Severity</th><th>Status</th></tr></thead><tbody>{reports.map((r)=><tr key={r.reportId}><td><b>#{r.reportId}</b><small>{r.description || 'Không có mô tả'}</small></td><td>#{r.shipmentId}</td><td>{r.driverId || 'N/A'}</td><td>{r.issueType}</td><td><Status value={r.severity}/></td><td><Status value={r.status}/></td></tr>)}</tbody></table></div> : <p>Chưa có driver issue report từ backend.</p>}</article></PageChrome> }
function VerificationHub({ shipments = [] }) { const latest = shipments[0]; return <section className="verification-grid"><article className="ship-card"><h3><Icon fill>verified_user</Icon>Verification Hub</h3><div className="ship-timeline"><div><i/><strong>Selected shipment</strong><p>{latest ? `Shipment #${latest.shipmentId} · ${latest.status}` : 'No shipment selected from backend'}</p></div><div><i/><strong>Order reference</strong><p>{latest?.orderId ? `Order #${latest.orderId}` : 'N/A'}</p></div><div><i/><strong>Trace evidence</strong><p>{latest?.blockchainTxHash || latest?.txHash || 'Awaiting backend/blockchain proof'}</p></div></div></article><article className="ship-card image-card"><span>LIVE OPS</span><h3>Fleet Management Dashboard</h3><p>Giám sát đội xe bằng dữ liệu shipment, report và notification từ backend.</p></article></section> }
function SendReportPage(p) { return <PageChrome eyebrow="Shipping / Reports / New Report" title="Gửi báo cáo đến Admin" subtitle="Báo cáo sự cố vận hành, đề xuất cải tiến hoặc yêu cầu hỗ trợ." loading={p.loading} error={p.error} success={p.success}><form className="ship-create-grid" onSubmit={p.submitReport}><div className="ship-form-stack"><article className="ship-card form-section"><h3><Icon>description</Icon>Nội dung báo cáo</h3><label>Tiêu đề<input name="title" value={p.reportForm.title} onChange={p.onReportChange} placeholder="VD: Xe hỏng trên đường giao hàng" required/></label><label>Mô tả chi tiết<textarea name="description" value={p.reportForm.description} onChange={p.onReportChange} rows={4} placeholder="Mô tả vấn đề, thời gian, địa điểm..." required/></label><label>Mức độ<select name="severity" value={p.reportForm.severity} onChange={p.onReportChange}><option value="LOW">Thấp</option><option value="MEDIUM">Trung bình</option><option value="HIGH">Cao</option><option value="CRITICAL">Nghiêm trọng</option></select></label><button disabled={p.savingReport}>{p.savingReport?'Đang gửi...':'Gửi báo cáo'}</button></article></div></form></PageChrome> }
function SendNotificationPage(p) { return <PageChrome eyebrow="Shipping / Notifications / New" title="Gửi thông báo" subtitle="Gửi thông báo đến Nông trại, Nhà bán lẻ hoặc Quản trị viên." loading={p.loading} error={p.error} success={p.success}><form className="ship-create-grid" onSubmit={p.submitNotification}><div className="ship-form-stack"><article className="ship-card form-section"><h3><Icon>notifications</Icon>Soạn thông báo</h3><label>Đối tượng<select name="recipientRole" value={p.notificationForm.recipientRole} onChange={p.onNotificationChange}><option value="FARM">Nông trại</option><option value="RETAILER">Nhà bán lẻ</option><option value="ADMIN">Quản trị viên</option></select></label><label>Tiêu đề<input name="title" value={p.notificationForm.title} onChange={p.onNotificationChange} placeholder="Tiêu đề thông báo" required/></label><label>Nội dung<textarea name="message" value={p.notificationForm.message} onChange={p.onNotificationChange} rows={4} placeholder="Nội dung thông báo..." required/></label><button disabled={p.savingNotification}>{p.savingNotification?'Đang gửi...':'Gửi thông báo'}</button></article></div></form></PageChrome> }
=======
    const key = `${s.farmName||'?'} â†’ ${s.retailerName||'?'}`
    if (!pairs[key]) pairs[key] = []
    pairs[key].push(s)
  })
  return <PageChrome eyebrow="BÃ¡o cÃ¡o thÃ nh cÃ´ng" title="ÄÆ¡n hÃ ng hoÃ n thÃ nh" subtitle="Danh sÃ¡ch Ä‘Æ¡n hÃ ng Ä‘Ã£ giao thÃ nh cÃ´ng giá»¯a NhÃ  bÃ¡n láº» vÃ  Quáº£n lÃ½ Trang tráº¡i." loading={p.loading} error={p.error} success={p.success} actions={<button onClick={p.loadWorkspace}><Icon>refresh</Icon>LÃ m má»›i</button>}>
    <section className="ship-metrics four">
      <Metric icon="check_circle" label="ÄÃ£ giao thÃ nh cÃ´ng" value={delivered.length} note={`${delivered.length} chuyáº¿n`} tone="green"/>
      <Metric icon="store" label="NÃ´ng tráº¡i" value={Object.keys(pairs).length} note="Äá»‘i tÃ¡c" tone="blue"/>
      <Metric icon="badge" label="TÃ i xáº¿" value={[...new Set(delivered.map(s=>s.driverCode).filter(Boolean))].length} note="ÄÃ£ giao hÃ ng" tone="amber"/>
      <Metric icon="local_shipping" label="PhÆ°Æ¡ng tiá»‡n" value={[...new Set(delivered.map(s=>s.vehiclePlateNo).filter(Boolean))].length} note="ÄÃ£ sá»­ dá»¥ng"/>
    </section>
    {Object.keys(pairs).length===0 ? <article className="ship-card"><div className="ship-empty"><Icon>check_circle</Icon><h4>ChÆ°a cÃ³ Ä‘Æ¡n hÃ ng hoÃ n thÃ nh</h4><p>CÃ¡c Ä‘Æ¡n hÃ ng Ä‘Ã£ giao thÃ nh cÃ´ng giá»¯a nhÃ  bÃ¡n láº» vÃ  trang tráº¡i sáº½ xuáº¥t hiá»‡n táº¡i Ä‘Ã¢y.</p></div></article>
    : Object.entries(pairs).map(([route, items])=><article key={route} className="ship-card" style={{marginBottom:16}}>
      <div className="ship-card-head"><h3><Icon>swap_horiz</Icon>{route}</h3><span className="success-pill">{items.length} Ä‘Æ¡n</span></div>
      <div className="ship-table-wrap"><table className="ship-table"><thead><tr><th>Chuyáº¿n</th><th>ÄÆ¡n hÃ ng</th><th>TÃ i xáº¿</th><th>PhÆ°Æ¡ng tiá»‡n</th><th>NgÃ y giao</th></tr></thead><tbody>{items.map(s=><tr key={s.shipmentId}><td><b>#{s.shipmentId}</b></td><td>#{s.orderId}</td><td>{s.driverCode||'---'}</td><td>{s.vehiclePlateNo||'---'}</td><td>{new Date(s.updatedAt||s.createdAt).toLocaleDateString('vi-VN')}</td></tr>)}</tbody></table></div>
    </article>)}
  </PageChrome>
}
function ShipmentStatusForm(p) { const canCancel = p.selectedShipment && !['DELIVERED','CANCELLED','REJECTED','DISPUTED','ESCALATED'].includes(String(p.selectedShipment.status).toUpperCase()); return <article className="ship-card"><div className="ship-card-head"><h3><Icon>switch_access_shortcut</Icon>Cáº­p nháº­t tráº¡ng thÃ¡i</h3></div>{!p.selectedShipment?<p>Chá»n shipment Ä‘á»ƒ cáº­p nháº­t.</p>:<form className="ship-form" onSubmit={p.submitShipmentStatus}><select name="status" value={p.shipmentStatusForm.status} onChange={p.onShipmentStatusChange}><option value="ASSIGNED">ASSIGNED</option><option value="PICKED_UP">PICKED_UP</option><option value="IN_TRANSIT">IN_TRANSIT</option><option value="DELIVERED">DELIVERED</option>{canCancel?<option value="CANCELLED">CANCELLED (Há»§y)</option>:null}</select><textarea name="note" value={p.shipmentStatusForm.note} onChange={p.onShipmentStatusChange} placeholder="Ghi chÃº..." rows={2}/><button disabled={p.savingShipment}>{p.savingShipment?'Äang lÆ°u...':'Cáº­p nháº­t'}</button></form>}</article> }
function ShipmentTable({ shipments }) { if (!shipments.length) return <p>ChÆ°a cÃ³ chuyáº¿n hÃ ng tá»« backend.</p>; return <div className="ship-table-wrap"><table className="ship-table large"><thead><tr><th>MÃ£ chuyáº¿n</th><th>Äiá»ƒm xuáº¥t</th><th>Äiá»ƒm Ä‘áº¿n</th><th>TÃ i xáº¿ & xe</th><th>Tráº¡ng thÃ¡i</th><th>Cáº­p nháº­t</th><th>Thao tÃ¡c</th></tr></thead><tbody>{shipments.map((s)=><tr key={s.shipmentId}><td><b>#{s.shipmentId}</b><small>ÄÆ¡n #{s.orderId || 'N/A'}</small></td><td>{s.farmName || 'NÃ´ng tráº¡i'}</td><td>{s.retailerName || 'NhÃ  bÃ¡n láº»'}</td><td>{s.driverCode ? `${s.driverCode} â€¢ ${s.vehiclePlateNo || 'N/A'}` : <button className="dash-btn">GÃ¡n tÃ i xáº¿</button>}</td><td><Status value={s.status} /></td><td>{s.updatedAt || s.createdAt || 'N/A'}</td><td><button><Icon>more_vert</Icon></button></td></tr>)}</tbody></table></div> }
function CreateShipmentPage(p) { return <PageChrome eyebrow="Váº­n chuyá»ƒn / ÄÆ¡n hÃ ng / Chuyáº¿n má»›i" title="Láº­p lá»‡nh váº­n chuyá»ƒn" subtitle="Cáº¥u hÃ¬nh logistics vÃ  xÃ¡c thá»±c blockchain cho Ä‘Æ¡n hÃ ng nÃ´ng sáº£n." loading={p.loading} error={p.error} success={p.success}><form className="ship-create-grid" onSubmit={p.submitShipment}><div className="ship-form-stack"><FormSection step="1" title="Äá»‹nh danh Ä‘Æ¡n hÃ ng"><label>ÄÆ¡n hÃ ng liÃªn quan<select name="orderId" value={p.shipmentForm.orderId} onChange={p.onShipmentChange} required><option value="">Chá»n Ä‘Æ¡n hÃ ng</option>{safeList(p.eligibleOrders).map(o=><option key={o.orderId} value={o.orderId}>#{o.orderId} â€¢ {o.farmName} â†’ {o.retailerName}</option>)}</select></label></FormSection><FormSection step="2" title="Äiá»ƒm giao nháº­n"><div className="node-card"><Icon>location_on</Icon><input value={p.eligibleOrders.find(o=>String(o.orderId)===String(p.shipmentForm.orderId))?.farmName || ''} readOnly placeholder="NÆ¡i láº¥y hÃ ng sáº½ tá»± xÃ¡c Ä‘á»‹nh theo Ä‘Æ¡n" /></div><div className="node-line"/><div className="node-card"><Icon>local_shipping</Icon><input value={p.eligibleOrders.find(o=>String(o.orderId)===String(p.shipmentForm.orderId))?.retailerName || ''} readOnly placeholder="NÆ¡i giao hÃ ng sáº½ tá»± xÃ¡c Ä‘á»‹nh theo Ä‘Æ¡n" /></div></FormSection><FormSection step="3" title="PhÃ¢n bá»• tÃ i nguyÃªn"><div className="two-cols"><label>TÃ i xáº¿<select name="driverId" value={p.shipmentForm.driverId} onChange={p.onShipmentChange}><option value="">Chá»n tÃ i xáº¿</option>{p.activeDrivers.map(d=><option key={d.driverId} value={d.driverId}>{d.driverCode} â€¢ {d.userFullName}</option>)}</select></label><label>PhÆ°Æ¡ng tiá»‡n<select name="vehicleId" value={p.shipmentForm.vehicleId} onChange={p.onShipmentChange}><option value="">Chá»n phÆ°Æ¡ng tiá»‡n</option>{p.activeVehicles.map(v=><option key={v.vehicleId} value={v.vehicleId}>{v.plateNo} â€¢ {v.vehicleType}</option>)}</select></label></div></FormSection><FormSection title="Ghi chÃº Ä‘áº·c biá»‡t"><textarea name="note" value={p.shipmentForm.note} onChange={p.onShipmentChange} placeholder="YÃªu cáº§u xá»­ lÃ½, ngÆ°á»¡ng nhiá»‡t Ä‘á»™, ghi chÃº cho sá»• cÃ¡i..." /></FormSection></div><aside className="ship-summary"><MapPanel shipments={p.displayShipments} /><div className="protocol-card"><Icon fill>verified_user</Icon><h3>XÃ¡c thá»±c blockchain</h3><p>Báº±ng chá»©ng váº­n chuyá»ƒn sáº½ Ä‘Æ°á»£c backend commit sau khi táº¡o vÃ  cáº­p nháº­t tráº¡ng thÃ¡i.</p><small>HASH sáº½ Ä‘Æ°á»£c sinh ra bá»Ÿi dá»‹ch vá»¥ blockchain.</small></div><button className="primary-action" disabled={p.savingShipment}><Icon>send</Icon>{p.savingShipment?'Äang táº¡o...':'XÃ¡c nháº­n & táº¡o chuyáº¿n'}</button><button type="button" className="secondary-action">XÃ³a biá»ƒu máº«u</button></aside></form></PageChrome> }
function FormSection({ step, title, children }) { return <article className="ship-card form-section"><h3>{step ? <span>{step}</span> : <Icon>notes</Icon>}{title}</h3>{children}</article> }
function TrackingPage(p) { return <PageChrome eyebrow="Váº­n chuyá»ƒn / Theo dÃµi" title="Theo dÃµi hÃ nh trÃ¬nh" subtitle="Tráº¡ng thÃ¡i chuyáº¿n hÃ ng trá»±c tiáº¿p tá»« backend." loading={p.loading} error={p.error} success={p.success}><div className="tracking-layout"><div className="tracking-map"><MapPanel shipments={p.displayShipments} /><div className="tracking-stats"><Metric icon="check_circle" label="ÄÃ£ giao" value={p.displayShipments.filter((s)=>String(s.status).toUpperCase()==='DELIVERED').length} note="API"/><Metric icon="sensors" label="Äang hoáº¡t Ä‘á»™ng" value={p.displayShipments.length} note="Trá»±c tiáº¿p" tone="blue"/></div></div><aside className="tracking-list"><h3>LÃ´ hÃ ng Ä‘ang Ä‘i <span className="live-pill"><i/>Trá»±c tiáº¿p</span></h3>{p.displayShipments.length ? p.displayShipments.map((s,i)=><div className={`tracking-card ${i===0?'active':''}`} key={s.shipmentId}><strong>Chuyáº¿n #{s.shipmentId}</strong><p>{s.farmName} â†’ {s.retailerName}</p><div className="progress"><i style={{width:String(s.status).toUpperCase()==='DELIVERED'?'100%':String(s.status).toUpperCase()==='IN_TRANSIT'?'68%':'35%'}} /></div><Status value={s.status}/></div>) : <p>ChÆ°a cÃ³ chuyáº¿n hÃ ng Ä‘ang hoáº¡t Ä‘á»™ng.</p>}</aside></div></PageChrome> }
function DriversPage(p) { return <PageChrome eyebrow="Váº­n chuyá»ƒn / TÃ i xáº¿" title="Quáº£n lÃ½ tÃ i xáº¿" subtitle={`${p.displayDrivers.length} tÃ i xáº¿ trong máº¡ng lÆ°á»›i â€¢ ${p.activeDrivers.length} Ä‘ang hoáº¡t Ä‘á»™ng`} loading={p.loading} error={p.error} success={p.success}><section className="ship-metrics four"><Metric icon="group" label="Tá»•ng sá»‘ tÃ i xáº¿" value={p.displayDrivers.length} note="API"/><Metric icon="radio_button_checked" label="Äang hoáº¡t Ä‘á»™ng" value={p.activeDrivers.length} note="KÃ­ch hoáº¡t"/><Metric icon="star" label="ÄÃ£ gÃ¡n chuyáº¿n" value={p.displayShipments.filter((s)=>s.driverCode).length} note="PhÃ¢n bá»•" tone="amber"/><Metric icon="task_alt" label="ÄÃ£ giao" value={p.displayShipments.filter((s)=>String(s.status).toUpperCase()==='DELIVERED').length} note="ÄÃ£ giao" tone="blue"/></section><div className="drivers-grid"><article className="ship-card"><DriverTable drivers={p.displayDrivers} fillDriver={p.fillDriver} handleDeleteDriver={p.handleDeleteDriver}/></article><DriverForm {...p}/></div><article className="ship-card"><h3>Báº£n Ä‘á»“ tÃ i xáº¿ thá»i gian thá»±c</h3><MapPanel shipments={p.displayShipments} /></article></PageChrome> }
function DriverTable({ drivers, fillDriver, handleDeleteDriver }) { if (!drivers.length) return <p>ChÆ°a cÃ³ tÃ i xáº¿ tá»« backend.</p>; return <div className="ship-table-wrap"><table className="ship-table"><thead><tr><th>TÃ i xáº¿</th><th>LiÃªn há»‡</th><th>Tráº¡ng thÃ¡i</th><th>ÄÆ¡n hiá»‡n táº¡i</th><th>ÄÃ¡nh giÃ¡</th><th></th></tr></thead><tbody>{drivers.map(d=><tr key={d.driverId}><td><b>{d.userFullName || d.driverCode}</b><small>ID: {d.driverId}</small></td><td>{d.phone || 'N/A'}<small>{d.email || d.driverCode || ''}</small></td><td><Status value={d.status}/></td><td><div className="progress"><i style={{width:d.status==='ACTIVE'?'75%':'30%'}}/></div></td><td>{d.rating || 'N/A'}</td><td style={{display:'flex',gap:4}}><button onClick={()=>fillDriver(d)}><Icon>edit</Icon></button><button onClick={()=>handleDeleteDriver(d.driverId)} style={{color:'var(--proto-error)'}}><Icon>delete</Icon></button></td></tr>)}</tbody></table></div> }
function DriverForm(p) { const isUpdate = Boolean(p.selectedDriverId); return <article className="ship-card"><h3>{isUpdate ? 'Cáº­p nháº­t tÃ i xáº¿' : 'ThÃªm tÃ i xáº¿ má»›i'}</h3><form className="ship-form" onSubmit={p.submitDriver}>{!isUpdate && <><input name="fullName" placeholder="Há» vÃ  tÃªn" value={p.driverForm.fullName} onChange={p.onDriverChange} required/><input name="email" type="email" placeholder="Email" value={p.driverForm.email} onChange={p.onDriverChange} required/><input name="password" type="password" placeholder="Máº­t kháº©u (Ã­t nháº¥t 8 kÃ½ tá»±)" value={p.driverForm.password} onChange={p.onDriverChange} required/></>}<input name="driverCode" placeholder="MÃ£ tÃ i xáº¿" value={p.driverForm.driverCode} onChange={p.onDriverChange} disabled={isUpdate} required/><input name="licenseNo" placeholder="Sá»‘ giáº¥y phÃ©p lÃ¡i xe" value={p.driverForm.licenseNo} onChange={p.onDriverChange} required/>{isUpdate && <input name="status" value={p.driverForm.status} onChange={p.onDriverChange}/>}<button disabled={p.savingDriver}>{p.savingDriver?'Äang lÆ°u...':(isUpdate?'Cáº­p nháº­t':'Táº¡o tÃ i xáº¿')}</button></form></article> }
function VehiclesPage(p) { return <PageChrome eyebrow="Váº­n chuyá»ƒn / PhÆ°Æ¡ng tiá»‡n" title="Quáº£n lÃ½ phÆ°Æ¡ng tiá»‡n" subtitle="Biá»ƒn sá»‘, táº£i trá»ng, tráº¡ng thÃ¡i váº­n hÃ nh." loading={p.loading} error={p.error} success={p.success}><div className="drivers-grid"><article className="ship-card"><div className="ship-table-wrap"><table className="ship-table"><thead><tr><th>Biá»ƒn sá»‘</th><th>Loáº¡i xe</th><th>Táº£i trá»ng</th><th>Tráº¡ng thÃ¡i</th><th></th></tr></thead><tbody>{p.displayVehicles.map(v=><tr key={v.vehicleId}><td><b>{v.plateNo}</b></td><td>{v.vehicleType}</td><td>{formatCapacity(v.capacity)}</td><td><Status value={v.status}/></td><td style={{display:'flex',gap:4}}><button onClick={()=>p.fillVehicle(v)}><Icon>edit</Icon></button><button onClick={()=>p.handleDeleteVehicle(v.vehicleId)} style={{color:'var(--proto-error)'}}><Icon>delete</Icon></button></td></tr>)}{p.displayVehicles.length===0?<tr><td colSpan="5">ChÆ°a cÃ³ phÆ°Æ¡ng tiá»‡n tá»« backend.</td></tr>:null}</tbody></table></div></article><article className="ship-card"><h3>{p.selectedVehicleId?'Cáº­p nháº­t phÆ°Æ¡ng tiá»‡n':'ThÃªm phÆ°Æ¡ng tiá»‡n'}</h3><form className="ship-form" onSubmit={p.submitVehicle}><input name="plateNo" placeholder="Biá»ƒn sá»‘" value={p.vehicleForm.plateNo} onChange={p.onVehicleChange} disabled={Boolean(p.selectedVehicleId)} required/><input name="vehicleType" placeholder="Loáº¡i xe" value={p.vehicleForm.vehicleType} onChange={p.onVehicleChange} required/><input name="capacity" type="number" placeholder="Táº£i trá»ng (kg)" value={p.vehicleForm.capacity} onChange={p.onVehicleChange} required/><input name="status" value={p.vehicleForm.status} onChange={p.onVehicleChange}/><button disabled={p.savingVehicle}>LÆ°u phÆ°Æ¡ng tiá»‡n</button></form></article></div></PageChrome> }
function NotificationsPage(p) { return <PageChrome eyebrow="Váº­n chuyá»ƒn / ThÃ´ng bÃ¡o" title="ThÃ´ng bÃ¡o logistics" subtitle="Nháº­n/gá»­i thÃ´ng tin thay Ä‘á»•i chuyáº¿n hÃ ng." loading={p.loading} error={p.error} success={p.success}><article className="ship-card">{p.notifications.length===0?<p>ChÆ°a cÃ³ thÃ´ng bÃ¡o.</p>:p.notifications.map(n=><div className="notification-row" key={n.notificationId}><div><strong>{n.title}</strong><p>{n.message}</p></div>{!n.read?<button onClick={()=>p.handleMarkRead(n.notificationId)}>ÄÃ¡nh dáº¥u Ä‘á»c</button>:<Status value="ÄÃƒ Äá»ŒC"/>}</div>)}</article></PageChrome> }
function ReportsPage(p) { const reports = safeList(p.shipmentReports); return <PageChrome eyebrow="Váº­n chuyá»ƒn / BÃ¡o cÃ¡o" title="BÃ¡o cÃ¡o váº­n hÃ nh" subtitle="Sá»± cá»‘ tÃ i xáº¿, báº±ng chá»©ng, quÃ©t QR vÃ  SLA." loading={p.loading} error={p.error} success={p.success} actions={<button onClick={p.loadWorkspace}><Icon>refresh</Icon>LÃ m má»›i</button>}><VerificationHub shipments={p.displayShipments} /><article className="ship-card"><div className="ship-card-head"><h3>Há»™p thÆ° sá»± cá»‘ tÃ i xáº¿</h3><span className="danger-pill">{reports.filter((r)=>String(r.status).toUpperCase()==='OPEN').length} Ä‘ang má»Ÿ</span></div>{reports.length ? <div className="ship-table-wrap"><table className="ship-table"><thead><tr><th>BÃ¡o cÃ¡o</th><th>Chuyáº¿n</th><th>TÃ i xáº¿</th><th>Sá»± cá»‘</th><th>Má»©c Ä‘á»™</th><th>Tráº¡ng thÃ¡i</th></tr></thead><tbody>{reports.map((r)=><tr key={r.reportId}><td><b>#{r.reportId}</b><small>{r.description || 'KhÃ´ng cÃ³ mÃ´ táº£'}</small></td><td>#{r.shipmentId}</td><td>{r.driverId || 'N/A'}</td><td>{r.issueType}</td><td><Status value={r.severity}/></td><td><Status value={r.status}/></td></tr>)}</tbody></table></div> : <p>ChÆ°a cÃ³ bÃ¡o cÃ¡o sá»± cá»‘ tá»« tÃ i xáº¿.</p>}</article></PageChrome> }
function VerificationHub({ shipments = [] }) { const latest = shipments[0]; return <section className="verification-grid"><article className="ship-card"><h3><Icon fill>verified_user</Icon>Trung tÃ¢m xÃ¡c thá»±c</h3><div className="ship-timeline"><div><i/><strong>Chuyáº¿n Ä‘ang chá»n</strong><p>{latest ? `Chuyáº¿n #${latest.shipmentId} Â· ${latest.status}` : 'ChÆ°a chá»n chuyáº¿n nÃ o'}</p></div><div><i/><strong>ÄÆ¡n hÃ ng liÃªn quan</strong><p>{latest?.orderId ? `ÄÆ¡n #${latest.orderId}` : 'N/A'}</p></div><div><i/><strong>Báº±ng chá»©ng truy xuáº¥t</strong><p>{latest?.blockchainTxHash || latest?.txHash || 'Äang chá» báº±ng chá»©ng blockchain'}</p></div></div></article><article className="ship-card image-card"><span>ÄIá»€U HÃ€NH TRá»°C TIáº¾P</span><h3>Báº£ng Ä‘iá»u khiá»ƒn Ä‘á»™i xe</h3><p>GiÃ¡m sÃ¡t Ä‘á»™i xe báº±ng dá»¯ liá»‡u chuyáº¿n hÃ ng, bÃ¡o cÃ¡o vÃ  thÃ´ng bÃ¡o tá»« backend.</p></article></section> }
function SendReportPage(p) { return <PageChrome eyebrow="Váº­n chuyá»ƒn / BÃ¡o cÃ¡o / BÃ¡o cÃ¡o má»›i" title="Gá»­i bÃ¡o cÃ¡o Ä‘áº¿n Admin" subtitle="BÃ¡o cÃ¡o sá»± cá»‘ váº­n hÃ nh, Ä‘á» xuáº¥t cáº£i tiáº¿n hoáº·c yÃªu cáº§u há»— trá»£." loading={p.loading} error={p.error} success={p.success}><form className="ship-create-grid" onSubmit={p.submitReport}><div className="ship-form-stack"><article className="ship-card form-section"><h3><Icon>description</Icon>Ná»™i dung bÃ¡o cÃ¡o</h3><label>TiÃªu Ä‘á»<input name="title" value={p.reportForm.title} onChange={p.onReportChange} placeholder="VD: Xe há»ng trÃªn Ä‘Æ°á»ng giao hÃ ng" required/></label><label>MÃ´ táº£ chi tiáº¿t<textarea name="description" value={p.reportForm.description} onChange={p.onReportChange} rows={4} placeholder="MÃ´ táº£ váº¥n Ä‘á», thá»i gian, Ä‘á»‹a Ä‘iá»ƒm..." required/></label><label>Má»©c Ä‘á»™<select name="severity" value={p.reportForm.severity} onChange={p.onReportChange}><option value="LOW">Tháº¥p</option><option value="MEDIUM">Trung bÃ¬nh</option><option value="HIGH">Cao</option><option value="CRITICAL">NghiÃªm trá»ng</option></select></label><button disabled={p.savingReport}>{p.savingReport?'Äang gá»­i...':'Gá»­i bÃ¡o cÃ¡o'}</button></article></div></form></PageChrome> }
function SendNotificationPage(p) { return <PageChrome eyebrow="Váº­n chuyá»ƒn / ThÃ´ng bÃ¡o / Má»›i" title="Gá»­i thÃ´ng bÃ¡o" subtitle="Gá»­i thÃ´ng bÃ¡o Ä‘áº¿n NÃ´ng tráº¡i, NhÃ  bÃ¡n láº» hoáº·c Quáº£n trá»‹ viÃªn." loading={p.loading} error={p.error} success={p.success}><form className="ship-create-grid" onSubmit={p.submitNotification}><div className="ship-form-stack"><article className="ship-card form-section"><h3><Icon>notifications</Icon>Soáº¡n thÃ´ng bÃ¡o</h3><label>Äá»‘i tÆ°á»£ng<select name="recipientRole" value={p.notificationForm.recipientRole} onChange={p.onNotificationChange}><option value="FARM">NÃ´ng tráº¡i</option><option value="RETAILER">NhÃ  bÃ¡n láº»</option><option value="ADMIN">Quáº£n trá»‹ viÃªn</option></select></label><label>TiÃªu Ä‘á»<input name="title" value={p.notificationForm.title} onChange={p.onNotificationChange} placeholder="TiÃªu Ä‘á» thÃ´ng bÃ¡o" required/></label><label>Ná»™i dung<textarea name="message" value={p.notificationForm.message} onChange={p.onNotificationChange} rows={4} placeholder="Ná»™i dung thÃ´ng bÃ¡o..." required/></label><button disabled={p.savingNotification}>{p.savingNotification?'Äang gá»­i...':'Gá»­i thÃ´ng bÃ¡o'}</button></article></div></form></PageChrome> }
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd

function ShippingProfilePage() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phoneNumber || '' })
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [changing, setChanging] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('')
<<<<<<< HEAD
    try { await updateProfile({ fullName: form.fullName.trim(), phone: form.phone.trim() }); setSuccess('Hồ sơ đã cập nhật.') }
    catch (err) { setError(err?.response?.data?.message || err.message || 'Lỗi cập nhật hồ sơ.') }
=======
    try { await updateProfile({ fullName: form.fullName.trim(), phone: form.phone.trim() }); setSuccess('Há»“ sÆ¡ Ä‘Ã£ cáº­p nháº­t.') }
    catch (err) { setError(err?.response?.data?.message || err.message || 'Lá»—i cáº­p nháº­t há»“ sÆ¡.') }
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
    finally { setSaving(false) }
  }

  async function handleChangePw(e) {
    e.preventDefault(); setError(''); setSuccess('')
<<<<<<< HEAD
    if (pw.newPassword !== pw.confirmPassword) { setError('Mật khẩu xác nhận không khớp.'); return }
    setChanging(true)
    try { const msg = await changePassword(pw); setSuccess(msg || 'Mật khẩu đã đổi.'); setPw({ currentPassword: '', newPassword: '', confirmPassword: '' }) }
    catch (err) { setError(err?.response?.data?.message || err.message || 'Lỗi đổi mật khẩu.') }
    finally { setChanging(false) }
  }

  return <PageChrome eyebrow="Shipping / Hồ sơ" title="Hồ sơ cá nhân" subtitle="Thông tin tài khoản và bảo mật.">
=======
    if (pw.newPassword !== pw.confirmPassword) { setError('Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p.'); return }
    setChanging(true)
    try { const msg = await changePassword(pw); setSuccess(msg || 'Máº­t kháº©u Ä‘Ã£ Ä‘á»•i.'); setPw({ currentPassword: '', newPassword: '', confirmPassword: '' }) }
    catch (err) { setError(err?.response?.data?.message || err.message || 'Lá»—i Ä‘á»•i máº­t kháº©u.') }
    finally { setChanging(false) }
  }

  return <PageChrome eyebrow="Váº­n chuyá»ƒn / Há»“ sÆ¡" title="Há»“ sÆ¡ cÃ¡ nhÃ¢n" subtitle="ThÃ´ng tin tÃ i khoáº£n vÃ  báº£o máº­t.">
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
    {error && <div className="ship-alert danger">{error}</div>}
    {success && <div className="ship-alert success">{success}</div>}
    <div className="ship-create-grid">
      <div className="ship-form-stack">
        <article className="ship-card form-section">
<<<<<<< HEAD
          <h3><Icon>person</Icon>Thông tin cá nhân</h3>
          <form className="ship-form" onSubmit={handleSave}>
            <label>Họ và tên<input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required /></label>
            <label>Email<input value={user?.email || ''} readOnly style={{ opacity: .6 }} /></label>
            <label>Số điện thoại<input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
            <label>Vai trò<input value={'Quản lý vận chuyển'} readOnly style={{ opacity: .6 }} /></label>
            <button disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thông tin'}</button>
=======
          <h3><Icon>person</Icon>ThÃ´ng tin cÃ¡ nhÃ¢n</h3>
          <form className="ship-form" onSubmit={handleSave}>
            <label>Há» vÃ  tÃªn<input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required /></label>
            <label>Email<input value={user?.email || ''} readOnly style={{ opacity: .6 }} /></label>
            <label>Sá»‘ Ä‘iá»‡n thoáº¡i<input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
            <label>Vai trÃ²<input value={'Quáº£n lÃ½ váº­n chuyá»ƒn'} readOnly style={{ opacity: .6 }} /></label>
            <button disabled={saving}>{saving ? 'Äang lÆ°u...' : 'LÆ°u thÃ´ng tin'}</button>
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
          </form>
        </article>
      </div>
      <div className="ship-form-stack">
        <article className="ship-card form-section">
<<<<<<< HEAD
          <h3><Icon>lock</Icon>Bảo mật</h3>
          <form className="ship-form" onSubmit={handleChangePw}>
            <label>Mật khẩu hiện tại<input type="password" value={pw.currentPassword} onChange={e => setPw({ ...pw, currentPassword: e.target.value })} required /></label>
            <label>Mật khẩu mới<input type="password" value={pw.newPassword} onChange={e => setPw({ ...pw, newPassword: e.target.value })} required minLength={8} /></label>
            <label>Xác nhận mật khẩu<input type="password" value={pw.confirmPassword} onChange={e => setPw({ ...pw, confirmPassword: e.target.value })} required /></label>
            <button disabled={changing}>{changing ? 'Đang đổi...' : 'Đổi mật khẩu'}</button>
=======
          <h3><Icon>lock</Icon>Báº£o máº­t</h3>
          <form className="ship-form" onSubmit={handleChangePw}>
            <label>Máº­t kháº©u hiá»‡n táº¡i<input type="password" value={pw.currentPassword} onChange={e => setPw({ ...pw, currentPassword: e.target.value })} required /></label>
            <label>Máº­t kháº©u má»›i<input type="password" value={pw.newPassword} onChange={e => setPw({ ...pw, newPassword: e.target.value })} required minLength={8} /></label>
            <label>XÃ¡c nháº­n máº­t kháº©u<input type="password" value={pw.confirmPassword} onChange={e => setPw({ ...pw, confirmPassword: e.target.value })} required /></label>
            <button disabled={changing}>{changing ? 'Äang Ä‘á»•i...' : 'Äá»•i máº­t kháº©u'}</button>
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
          </form>
        </article>
      </div>
    </div>
  </PageChrome>
<<<<<<< HEAD
}
=======

  function change(setter) { return (event) => { const { name, value } = event.target; setter((prev) => ({ ...prev, [name]: value })) } }
  async function submitShipment(event) { event.preventDefault(); setSavingShipment(true); setError(''); setSuccess(''); try { const created = await createShipment({ orderId: Number(shipmentForm.orderId), driverId: toPositiveNumber(shipmentForm.driverId), vehicleId: toPositiveNumber(shipmentForm.vehicleId), note: shipmentForm.note.trim() }); setSuccess('ÄÃ£ táº¡o shipment vÃ  assign logistics resource.'); setShipmentForm(initialShipmentForm); setSelectedShipmentId(String(created.shipmentId)); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'KhÃ´ng thá»ƒ táº¡o shipment.')) } finally { setSavingShipment(false) } }
  async function submitDriver(event) { event.preventDefault(); setSavingDriver(true); setError(''); setSuccess(''); try { if (selectedDriverId) await updateDriver(Number(selectedDriverId), { licenseNo: driverForm.licenseNo.trim(), status: driverForm.status.trim() }); else if (driverForm.fullName && driverForm.email) await createDriverWithUser({ fullName: driverForm.fullName.trim(), email: driverForm.email.trim(), password: driverForm.password, driverCode: driverForm.driverCode.trim(), licenseNo: driverForm.licenseNo.trim(), status: driverForm.status.trim() }); else await createDriver({ driverCode: driverForm.driverCode.trim(), licenseNo: driverForm.licenseNo.trim(), userId: toPositiveNumber(driverForm.userId), status: driverForm.status.trim() }); setSuccess(selectedDriverId ? 'ÄÃ£ cáº­p nháº­t driver.' : 'ÄÃ£ táº¡o driver má»›i.'); setSelectedDriverId(''); setDriverForm(initialDriverForm); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'KhÃ´ng thá»ƒ lÆ°u driver.')) } finally { setSavingDriver(false) } }
  async function submitVehicle(event) { event.preventDefault(); setSavingVehicle(true); setError(''); setSuccess(''); try { if (selectedVehicleId) await updateVehicle(Number(selectedVehicleId), { vehicleType: vehicleForm.vehicleType.trim(), capacity: Number(vehicleForm.capacity), status: vehicleForm.status.trim() }); else await createVehicle({ plateNo: vehicleForm.plateNo.trim(), vehicleType: vehicleForm.vehicleType.trim(), capacity: Number(vehicleForm.capacity), status: vehicleForm.status.trim() }); setSuccess(selectedVehicleId ? 'ÄÃ£ cáº­p nháº­t vehicle.' : 'ÄÃ£ táº¡o vehicle má»›i.'); setSelectedVehicleId(''); setVehicleForm(initialVehicleForm); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'KhÃ´ng thá»ƒ lÆ°u vehicle.')) } finally { setSavingVehicle(false) } }
  async function submitShipmentStatus(event) { event.preventDefault(); if (!selectedShipment) return; setSavingShipment(true); try { await updateShipmentStatus(selectedShipment.shipmentId, { status: shipmentStatusForm.status, note: shipmentStatusForm.note.trim() }); setSuccess('ÄÃ£ cáº­p nháº­t shipment.'); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'KhÃ´ng thá»ƒ cáº­p nháº­t shipment.')) } finally { setSavingShipment(false) } }
  function fillDriver(driver) { setSelectedDriverId(String(driver.driverId)); setDriverForm({ driverCode: driver.driverCode || '', licenseNo: driver.licenseNo || '', userId: String(driver.userId || ''), status: driver.status || 'ACTIVE' }) }
  function fillVehicle(vehicle) { setSelectedVehicleId(String(vehicle.vehicleId)); setVehicleForm({ plateNo: vehicle.plateNo || '', vehicleType: vehicle.vehicleType || '', capacity: vehicle.capacity || '', status: vehicle.status || 'ACTIVE' }) }
  async function handleMarkRead(notificationId) { try { await markNotificationRead(notificationId); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'KhÃ´ng Ä‘Ã¡nh dáº¥u notification Ä‘Æ°á»£c.')) } }
  async function handleDeleteDriver(id) { if (!window.confirm('XÃ³a tÃ i xáº¿ nÃ y?')) return; setError(''); setSuccess(''); try { await deleteDriver(id); setSuccess('ÄÃ£ xÃ³a tÃ i xáº¿.'); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'KhÃ´ng thá»ƒ xÃ³a tÃ i xáº¿.')) } }
  async function handleDeleteVehicle(id) { if (!window.confirm('XÃ³a phÆ°Æ¡ng tiá»‡n nÃ y?')) return; setError(''); setSuccess(''); try { await deleteVehicle(id); setSuccess('ÄÃ£ xÃ³a phÆ°Æ¡ng tiá»‡n.'); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'KhÃ´ng thá»ƒ xÃ³a phÆ°Æ¡ng tiá»‡n.')) } }
  const [reportForm, setReportForm] = useState(initialReportForm)
  const [notificationForm, setNotificationForm] = useState(initialNotificationForm)
  async function submitReport(event) { event.preventDefault(); setSavingReport(true); setError(''); setSuccess(''); try { await createReport({ title: reportForm.title.trim(), description: reportForm.description.trim(), severity: reportForm.severity }); setSuccess('ÄÃ£ gá»­i bÃ¡o cÃ¡o Ä‘áº¿n admin.'); setReportForm(initialReportForm); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'KhÃ´ng thá»ƒ gá»­i bÃ¡o cÃ¡o.')) } finally { setSavingReport(false) } }
  async function submitNotification(event) { event.preventDefault(); setSavingNotification(true); setError(''); setSuccess(''); try { await createNotification({ recipientRole: notificationForm.recipientRole, title: notificationForm.title.trim(), message: notificationForm.message.trim(), notificationType: 'MANUAL' }); setSuccess('ÄÃ£ gá»­i thÃ´ng bÃ¡o.'); setNotificationForm(initialNotificationForm); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'KhÃ´ng thá»ƒ gá»­i thÃ´ng bÃ¡o.')) } finally { setSavingNotification(false) } }

  const props = { module, loading, error, success, displayShipments, shipmentReports, displayDrivers, displayVehicles, eligibleOrders, activeDrivers, activeVehicles, availableUsers, notifications, shipmentForm, driverForm, vehicleForm, shipmentStatusForm, reportForm, notificationForm, selectedShipment, selectedDriverId, selectedVehicleId, savingShipment, savingDriver, savingVehicle, savingReport, savingNotification, setShipmentForm, setShipmentStatusForm, setReportForm, setNotificationForm, submitShipment, submitDriver, submitVehicle, submitShipmentStatus, submitReport, submitNotification, fillDriver, fillVehicle, handleMarkRead, handleDeleteDriver, handleDeleteVehicle, onShipmentChange: change(setShipmentForm), onDriverChange: change(setDriverForm), onVehicleChange: change(setVehicleForm), onShipmentStatusChange: change(setShipmentStatusForm), onReportChange: change(setReportForm), onNotificationChange: change(setNotificationForm), loadWorkspace }
  const pages = { overview: <OverviewPage {...props} />, orders: <OrdersPage {...props} />, create: <CreateShipmentPage {...props} />, tracking: <TrackingPage {...props} />, drivers: <DriversPage {...props} />, vehicles: <VehiclesPage {...props} />, notifications: <NotificationsPage {...props} />, reports: <ReportsPage {...props} />, sendreport: <SendReportPage {...props} />, sendnotification: <SendNotificationPage {...props} />, completed: <SuccessfulOrdersPage {...props} />, profile: <ShippingProfilePage /> }
  return <section className={`shipping-prototype-shell shipping-module-${module}`}>{pages[module] || pages.overview}</section>
}

>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
