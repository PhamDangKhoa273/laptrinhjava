import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { TextAreaField } from '../components/TextAreaField.jsx'
import { createReport, farmReviewOrder, getFarmShipments, getMyListingRegistrations, getMyNotifications, getMyReports, getOrdersV2, markNotificationRead } from '../services/workflowService.js'
import { getErrorMessage } from '../utils/helpers.js'

function formatDateTime(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString('vi-VN')
}

export function FarmWorkflowPage() {
  const [notifications, setNotifications] = useState([])
  const [reports, setReports] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [orders, setOrders] = useState([])
  const [shipments, setShipments] = useState([])
  const [farmDecisionNotes, setFarmDecisionNotes] = useState({})
  const [reviewingOrderId, setReviewingOrderId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadData() {
    try {
      setLoading(true)
      const [notificationData, reportData, registrationData, orderData, shipmentData] = await Promise.all([
        getMyNotifications(),
        getMyReports(),
        getMyListingRegistrations(),
        getOrdersV2(),
        getFarmShipments(),
      ])
      setNotifications(Array.isArray(notificationData) ? notificationData : [])
      setReports(Array.isArray(reportData) ? reportData : [])
      setRegistrations(Array.isArray(registrationData) ? registrationData : [])
      setOrders(Array.isArray(orderData) ? orderData : [])
      setShipments(Array.isArray(shipmentData) ? shipmentData : [])
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được workflow của farm.'))
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
      setSuccess('Đã đánh dấu notification là đã đọc.')
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không đánh dấu notification được.'))
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
          ? 'Farm đã xác nhận buy request và sẵn sàng chờ retailer đặt cọc.'
          : 'Farm từ chối buy request vì chưa phù hợp điều kiện cung ứng hiện tại.'),
      })
      setSuccess(status === 'CONFIRMED' ? 'Đã xác nhận buy request.' : 'Đã từ chối buy request.')
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không xử lý được buy request.'))
    } finally {
      setReviewingOrderId(null)
    }
  }

  async function handleCreateReport() {
    try {
      await createReport({
        recipientRole: 'ADMIN',
        reportType: 'FARM_OPERATION',
        subject: 'Farm cần hỗ trợ vận hành',
        content: 'Farm muốn phản hồi tình trạng duyệt listing hoặc vấn đề nghiệp vụ phát sinh.',
        relatedEntityType: 'FARM_WORKFLOW',
      })
      setSuccess('Đã gửi report lên admin.')
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không gửi được report.'))
    }
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Farm workflow</p>
          <h2>Notification, report và tiến độ duyệt listing</h2>
          <p>Giúp phía farm nhìn thấy rõ listing nào đang chờ duyệt, bị từ chối hay đã được public.</p>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadData} disabled={loading}>Làm mới</Button>
          <Button onClick={handleCreateReport}>Gửi report cho admin</Button>
        </div>
      </div>

      {loading ? <div className="glass-card">Đang tải dữ liệu workflow...</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="content-grid">
        <article className="glass-card">
          <h3>Buy requests từ retailer</h3>
          {pendingOrders.length === 0 ? <p>Chưa có buy request nào cần farm xử lý.</p> : null}
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
                  label="Ghi chú quyết định"
                  name={`farmDecision-${item.orderId}`}
                  value={farmDecisionNotes[item.orderId] || ''}
                  onChange={(event) => handleDecisionNoteChange(item.orderId, event.target.value)}
                  placeholder="Ví dụ: Farm xác nhận đủ sản lượng, chờ retailer đặt cọc."
                />
                <div className="inline-actions">
                  <Button onClick={() => handleFarmReview(item.orderId, 'CONFIRMED')} disabled={reviewingOrderId === item.orderId}>Xác nhận</Button>
                  <Button variant="secondary" onClick={() => handleFarmReview(item.orderId, 'REJECTED')} disabled={reviewingOrderId === item.orderId}>Từ chối</Button>
                </div>
              </div>
            ))}
          </div>
        </article>
        <article className="glass-card">
          <h3>Yêu cầu duyệt listing của tôi</h3>
          {registrations.length === 0 ? <p>Chưa có yêu cầu duyệt listing.</p> : null}
          <div className="form-grid">
            {registrations.map((item) => (
              <div key={item.registrationId} className="business-card">
                <div>
                  <strong>{item.listingTitle}</strong>
                  <p>Trạng thái duyệt: {item.status}</p>
                  <p>Ghi chú: {item.note || 'Không có'}</p>
                  <p>Reviewer: {item.reviewedByName || 'Chưa xử lý'}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card">
          <h3>Thông báo</h3>
          {notifications.length === 0 ? <p>Chưa có thông báo.</p> : null}
          <div className="form-grid">
            {notifications.map((item) => (
              <div key={item.notificationId} className="business-card">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                  <p>Loại: {item.notificationType}</p>
                </div>
                <div className="inline-actions">
                  <span className={`status-pill status-${item.read ? 'active' : 'pending'}`}>{item.read ? 'Đã đọc' : 'Chưa đọc'}</span>
                  {!item.read ? <Button variant="secondary" onClick={() => handleMarkRead(item.notificationId)}>Đánh dấu đã đọc</Button> : null}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="glass-card top-gap">
        <h3>Shipment visibility của farm</h3>
        {shipments.length === 0 ? <p>Chưa có shipment nào liên quan tới farm này.</p> : null}
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
                )) : <p>Chưa có timeline vận chuyển.</p>}
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
                )) : <p>Chưa có báo cáo sự cố.</p>}
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="glass-card top-gap">
        <h3>Report liên quan</h3>
        {reports.length === 0 ? <p>Chưa có report.</p> : null}
        <div className="form-grid">
          {reports.map((item) => (
            <div key={item.reportId} className="business-card">
              <div>
                <strong>{item.subject}</strong>
                <p>{item.content}</p>
                <p>Trạng thái: {item.status}</p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
