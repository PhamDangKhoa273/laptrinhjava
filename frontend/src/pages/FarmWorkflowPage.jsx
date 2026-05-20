import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { TextAreaField } from '../components/TextAreaField.jsx'
import { createReport, farmReviewOrder, getFarmShipmentReports, getFarmShipments, getMyListingRegistrations, getMyNotifications, getMyReports, getOrdersV2, markNotificationRead } from '../services/workflowService.js'
import { getErrorMessage } from '../utils/helpers.js'

function formatDateTime(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString('vi-VN')
}

export function FarmWorkflowPage({ module = 'all' }) {
  const [notifications, setNotifications] = useState([])
  const [reports, setReports] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [orders, setOrders] = useState([])
  const [shipments, setShipments] = useState([])
  const [shipmentReports, setShipmentReports] = useState([])
  const [farmDecisionNotes, setFarmDecisionNotes] = useState({})
  const [reviewingOrderId, setReviewingOrderId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadData() {
    try {
      setLoading(true)
      const [notificationData, reportData, registrationData, orderData, shipmentData, shipmentReportData] = await Promise.all([
        getMyNotifications(),
        getMyReports(),
        getMyListingRegistrations(),
        getOrdersV2(),
        getFarmShipments(),
        getFarmShipmentReports().catch(() => []),
      ])
      setNotifications(Array.isArray(notificationData) ? notificationData : [])
      setReports(Array.isArray(reportData) ? reportData : [])
      setRegistrations(Array.isArray(registrationData) ? registrationData : [])
      setOrders(Array.isArray(orderData) ? orderData : [])
      setShipments(Array.isArray(shipmentData) ? shipmentData : [])
      setShipmentReports(Array.isArray(shipmentReportData) ? shipmentReportData : [])
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không t?i được workflow c?a farm.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleMarkRead(notificationId) {
    try {
      await markNotificationRead(notificationId)
      setSuccess('Đã đánh d?u notification là đã đọc.')
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không đánh d?u notification được.'))
    }
  }

  const pendingOrders = useMemo(() => orders.filter((item) => item.status === 'PENDING'), [orders])

  function handleDecisionNoteChange(orderId, value) {
    setFarmDecisionNotes((prev) => ({ ...prev, [orderId]: value }))
  }

  async function handleFarmReview(orderId, status) {
    try {
      setReviewingOrderId(orderId)
      const note = (farmDecisionNotes[orderId] || '').trim()
      await farmReviewOrder(orderId, {
        status,
        reason: note || (status === 'CONFIRMED'
          ? 'Farm đã xác nh?n buy request và s?n sàng ch? retailer đặt c?c.'
          : 'Farm t? ch?i buy request v? chưa phù h?p điều ki?n cung ?ng hi?n t?i.'),
      })
      setSuccess(status === 'CONFIRMED' ? 'Đã xác nh?n buy request.' : 'Đã t? ch?i buy request.')
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không x? l? được buy request.'))
    } finally {
      setReviewingOrderId(null)
    }
  }

  async function handleCreateReport() {
    try {
      await createReport({
        recipientRole: 'ADMIN',
        reportType: 'FARM_OPERATION',
        subject: 'Farm c?n h? tr? v?n hành',
        content: 'Farm mu?n ph?n h?i t?nh tr?ng duy?t listing ho?c v?n đề nghi?p v? phát sinh.',
        relatedEntityType: 'FARM_WORKFLOW',
      })
      setSuccess('Đã g?i report lên admin.')
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không g?i được report.'))
    }
  }

  const moduleTitles = {
    orders: { eyebrow: 'Kinh doanh / Đơn hàng', title: 'Đơn hàng t? retailer', subtitle: 'Xác nh?n ho?c t? ch?i buy request, theo d?i ti?n độ duy?t listing.' },
    shipments: { eyebrow: 'Kinh doanh / V?n chuy?n', title: 'V?n chuy?n liên quan farm', subtitle: 'Theo d?i shipment, timeline ti?n độ và driver report.' },
    'shipment-reports': { eyebrow: 'Kinh doanh / Báo cáo v?n chuy?n', title: 'Báo cáo v?n chuy?n', subtitle: 'T?ng h?p báo cáo s? c? do tài x? g?i cho m?i shipment liên quan farm.' },
    all: { eyebrow: 'Farm workflow', title: 'Notification, report và ti?n độ duy?t listing', subtitle: 'Giúp phía farm nh?n th?y r? listing nào đang ch? duy?t, b? t? ch?i hay đã được public.' },
  }
  const head = moduleTitles[module] || moduleTitles.all
  const showOrders = module === 'all' || module === 'orders'
  const showShipments = module === 'all' || module === 'shipments'
  const showShipmentReports = module === 'all' || module === 'shipment-reports'

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{head.eyebrow}</p>
          <h2>{head.title}</h2>
          <p>{head.subtitle}</p>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadData} disabled={loading}>Làm m?i</Button>
          <Button onClick={handleCreateReport}>G?i report cho admin</Button>
        </div>
      </div>

      {loading ? <div className="glass-card">Đang t?i d? li?u workflow...</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="content-grid" hidden={!showOrders}>
        <article className="glass-card" id="orders">
          <h3>Buy requests t? retailer</h3>
          {pendingOrders.length === 0 ? <p>Chưa có buy request nào c?n farm x? l?.</p> : null}
          <div className="form-grid">
            {pendingOrders.map((item) => (
              <div key={item.orderId} className="business-card">
                <div>
                  <strong>Order #{item.orderId}</strong>
                  <p>Retailer: {item.retailerName || item.retailerId}</p>
                  <p>Total: {item.totalAmount}</p>
                  <p>Items: {item.items?.map((orderItem) => `${orderItem.title} (${orderItem.quantity})`).join(', ') || 'N/A'}</p>
                  <p>Allowed: {item.allowedActions?.join(', ') || 'Không có'}</p>
                </div>
                <TextAreaField
                  label="Ghi chú quy?t định"
                  name={`farmDecision-${item.orderId}`}
                  value={farmDecisionNotes[item.orderId] || ''}
                  onChange={(event) => handleDecisionNoteChange(item.orderId, event.target.value)}
                  placeholder="Ví d?: Farm xác nh?n đủ s?n lượng, ch? retailer đặt c?c."
                />
                <div className="inline-actions">
                  <Button onClick={() => handleFarmReview(item.orderId, 'CONFIRMED')} disabled={reviewingOrderId === item.orderId}>Xác nh?n</Button>
                  <Button variant="secondary" onClick={() => handleFarmReview(item.orderId, 'REJECTED')} disabled={reviewingOrderId === item.orderId}>T? ch?i</Button>
                </div>
              </div>
            ))}
          </div>
        </article>
        <article className="glass-card">
          <h3>Yêu c?u duy?t listing c?a tôi</h3>
          {registrations.length === 0 ? <p>Chưa có yêu c?u duy?t listing.</p> : null}
          <div className="form-grid">
            {registrations.map((item) => (
              <div key={item.registrationId} className="business-card">
                <div>
                  <strong>{item.listingTitle}</strong>
                  <p>Tr?ng thái duy?t: {item.status}</p>
                  <p>Ghi chú: {item.note || 'Không có'}</p>
                  <p>Reviewer: {item.reviewedByName || 'Chưa x? l?'}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card" id="notifications">
          <h3>Thông báo</h3>
          {notifications.length === 0 ? <p>Chưa có thông báo.</p> : null}
          <div className="form-grid">
            {notifications.map((item) => (
              <div key={item.notificationId} className="business-card">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                  <p>Lo?i: {item.notificationType}</p>
                </div>
                <div className="inline-actions">
                  <span className={`status-pill status-${item.read ? 'active' : 'pending'}`}>{item.read ? 'Đã đọc' : 'Chưa đọc'}</span>
                  {!item.read ? <Button variant="secondary" onClick={() => handleMarkRead(item.notificationId)}>Đánh d?u đã đọc</Button> : null}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="glass-card top-gap" id="shipments" hidden={!showShipments}>
        <h3>Shipment visibility c?a farm</h3>
        {shipments.length === 0 ? <p>Chưa có shipment nào liên quan t?i farm này.</p> : null}
        <div className="form-grid">
          {shipments.map((shipment) => (
            <div key={shipment.shipmentId} className="business-card">
              <div>
                <strong>Shipment #{shipment.shipmentId}</strong>
                <p>Order #{shipment.orderId} • {shipment.status}</p>
                <p>Retailer: {shipment.retailerName || 'N/A'} • Driver: {shipment.driverName || shipment.driverCode || 'Chưa gán'}</p>
                <p>Vehicle: {shipment.vehiclePlateNo || 'N/A'} • Batch: {shipment.batchCode || 'N/A'} • Trace: {shipment.traceCode || 'N/A'}</p>
                <p>Pickup: {formatDateTime(shipment.pickupConfirmedAt)} • Delivered: {formatDateTime(shipment.deliveryConfirmedAt)}</p>
                <p>Manager note: {shipment.note || 'Không có'}</p>
              </div>

              <div className="top-gap">
                <strong>Progress timeline</strong>
                {shipment.logs?.length ? shipment.logs.map((log) => (
                  <div key={log.logId} className="business-card top-gap">
                    <strong>{log.type}</strong>
                    <p>{log.note || 'Không có ghi chú'}</p>
                    <p>Location: {log.location || 'N/A'}</p>
                    <p>{formatDateTime(log.recordedAt)}</p>
                  </div>
                )) : <p>Chưa có timeline v?n chuy?n.</p>}
              </div>

              <div className="top-gap">
                <strong>Driver reports</strong>
                {shipment.reports?.length ? shipment.reports.map((report) => (
                  <div key={report.reportId} className="business-card top-gap">
                    <strong>{report.issueType}</strong>
                    <p>{report.description}</p>
                    <p>Severity: {report.severity || 'N/A'} • Status: {report.status || 'OPEN'}</p>
                    <p>{formatDateTime(report.createdAt)}</p>
                  </div>
                )) : <p>Chưa có báo cáo s? c?.</p>}
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="glass-card top-gap" id="shipment-reports" hidden={!showShipmentReports}>
        <h3>Báo cáo v?n chuy?n (R-FRM-170)</h3>
        <p>T?ng h?p báo cáo s? c? do tài x? g?i cho m?i shipment liên quan t?i farm c?a b?n.</p>
        {shipmentReports.length === 0 ? <p>Chưa có báo cáo v?n chuy?n nào liên quan t?i farm.</p> : null}
        <div className="form-grid">
          {shipmentReports.map((report) => (
            <div key={report.reportId} className="business-card">
              <div>
                <strong>Báo cáo #{report.reportId}</strong>
                <p>Shipment #{report.shipmentId} • Driver #{report.driverId || 'N/A'}</p>
                <p>Lo?i: {report.issueType || 'N/A'} • Severity: {report.severity || 'N/A'}</p>
                <p>Tr?ng thái: {report.status || 'OPEN'}</p>
                <p>{report.description}</p>
                <p>{formatDateTime(report.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="glass-card top-gap" hidden={module !== 'all'}>
        <h3>Report liên quan</h3>
        {reports.length === 0 ? <p>Chưa có report.</p> : null}
        <div className="form-grid">
          {reports.map((item) => (
            <div key={item.reportId} className="business-card">
              <div>
                <strong>{item.subject}</strong>
                <p>{item.content}</p>
                <p>Tr?ng thái: {item.status}</p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
