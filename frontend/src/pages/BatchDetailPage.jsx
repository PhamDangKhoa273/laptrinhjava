import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { VerificationStatus } from '../components/VerificationStatus'
import '../batch-detail.css'

function Icon({ children, filled = false }) {
  return (
    <span
      className="material-symbols-outlined"
      aria-hidden="true"
      style={filled ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
    >
      {children}
    </span>
  )
}

function valueOf(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function formatDate(value, fallback = 'Oct 12, 2023') {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: '2-digit' })
}

function formatQuantity(value, fallback = '500 kg') {
  if (value === undefined || value === null || value === '') return fallback
  const number = Number(value)
  if (!Number.isFinite(number)) return String(value)
  return `${number.toLocaleString('vi-VN')} kg`
}

function statusLabel(status) {
  const normalized = String(status || '').trim()
  if (!normalized) return 'Verified'
  if (normalized.toUpperCase() === 'ACTIVE') return 'Verified'
  return normalized.replaceAll('_', ' ')
}

const timelineSteps = [
  {
    icon: 'inventory_2',
    title: 'Lô hàng được tạo',
    time: 'Oct 14, 2023 | 08:30',
    meta: 'By Green Valley Farm',
    tone: 'neutral',
  },
  {
    icon: 'inventory',
    title: 'Đóng gói & Kiểm định',
    time: 'Oct 15, 2023 | 14:15',
    meta: 'Quality Pass (A+)',
    tone: 'success',
  },
  {
    icon: 'qr_code',
    title: 'Xuất mã định danh QR',
    time: 'Oct 15, 2023 | 16:00',
    meta: 'UID: BCH-29384',
    tone: 'secondary',
  },
  {
    icon: 'storefront',
    title: 'Niêm yết Marketplace',
    time: 'Oct 16, 2023 | 09:00',
    meta: 'Live Status',
    tone: 'warning',
  },
  {
    icon: 'local_shipping',
    title: 'Lập lệnh vận chuyển',
    time: 'Oct 17, 2023 | 11:45',
    meta: '#SHP-88219',
    tone: 'neutral',
  },
  {
    icon: 'check_circle',
    title: 'Giao hàng thành công',
    time: 'Oct 20, 2023 | 15:20',
    meta: 'Retailer Confirmed',
    tone: 'active',
  },
]

export function BatchDetailPage() {
  const { id } = useParams()
  const [batch, setBatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadBatch() {
      try {
        setLoading(true)
        const res = await axios.get(`/api/v1/batches/${id}`)
        setBatch(res.data.data)
        setError('')
      } catch (err) {
        setError('Không thể tải thông tin batch')
        console.error('Load batch error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadBatch()
    }
  }, [id])

  const viewModel = useMemo(() => {
    const batchCode = valueOf(batch?.batchCode, batch?.traceCode, `BCH-AGRO-${id || '29384'}`)
    const quantity = formatQuantity(valueOf(batch?.quantity, batch?.availableQuantity))
    const availableQuantity = formatQuantity(batch?.availableQuantity, quantity)
    const grade = valueOf(batch?.qualityGrade, batch?.grade, 'Premium Grade')
    const productName = valueOf(batch?.productName, batch?.product?.name, batch?.cropName, 'Organic Arabica Beans')
    const category = valueOf(batch?.categoryName, batch?.product?.categoryName, 'Cà phê hạt')
    const farmName = valueOf(batch?.farmName, batch?.farm?.farmName, batch?.producerName, 'Green Valley Estates')
    const farmLocation = valueOf(batch?.farmLocation, batch?.farm?.address, batch?.originLocation, 'Dalat, Vietnam')
    const seasonId = valueOf(batch?.seasonCode, batch?.seasonId, '#SEA-2024-QT1')
    const hash = valueOf(
      batch?.transactionHash,
      batch?.blockchainTxHash,
      batch?.txHash,
      '0x7a8e2f1c9d3b4a5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9',
    )

    return {
      batchCode,
      status: statusLabel(batch?.batchStatus),
      productName,
      category,
      quantity,
      availableQuantity,
      moisture: valueOf(batch?.moisture, batch?.moisturePercent, '11.5%'),
      grade,
      farmName,
      farmLocation,
      seasonId,
      harvestDate: formatDate(batch?.harvestDate),
      hash,
      blockNumber: valueOf(batch?.blockNumber, batch?.blockchainBlockNumber, '#18,293,842'),
    }
  }, [batch, id])

  if (loading) {
    return (
      <main className="batch-detail-page batch-detail-state">
        <div className="batch-loading-card">
          <Icon>progress_activity</Icon>
          <strong>Đang tải chi tiết lô hàng...</strong>
          <p>Đang đồng bộ dữ liệu batch, QR và blockchain verification.</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="batch-detail-page batch-detail-state">
        <div className="batch-loading-card is-error">
          <Icon>error</Icon>
          <strong>{error}</strong>
          <p>Vui lòng thử lại hoặc kiểm tra kết nối API.</p>
        </div>
      </main>
    )
  }

  if (!batch) {
    return (
      <main className="batch-detail-page batch-detail-state">
        <div className="batch-loading-card">
          <Icon>inventory_2</Icon>
          <strong>Không tìm thấy batch</strong>
          <p>Lô hàng này không tồn tại hoặc đã bị gỡ khỏi hệ thống.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="batch-detail-page">
      <section className="batch-detail-header">
        <div>
          <nav className="batch-breadcrumb" aria-label="Breadcrumb">
            <span>Registry</span>
            <Icon>chevron_right</Icon>
            <span>Chi tiết Lô hàng</span>
          </nav>
          <h1>Chi tiết Lô hàng</h1>
          <div className="batch-title-meta">
            <span className="batch-code-pill">#{viewModel.batchCode}</span>
            <span className="batch-verified-pill">
              <Icon filled>verified</Icon>
              {viewModel.status}
            </span>
          </div>
        </div>
        <div className="batch-header-actions">
          <button type="button" className="batch-button batch-button-secondary">
            <Icon>share</Icon>
            Chia sẻ
          </button>
          <button type="button" className="batch-button batch-button-primary">
            <Icon>edit</Icon>
            Cập nhật
          </button>
        </div>
      </section>

      <section className="batch-detail-grid" aria-label="Batch detail content">
        <div className="batch-main-column">
          <article className="batch-card batch-product-card">
            <div className="batch-product-image" aria-hidden="true">
              <div className="batch-product-photo">
                <Icon>coffee</Icon>
              </div>
            </div>
            <div className="batch-product-content">
              <div className="batch-card-heading-row">
                <div>
                  <span className="batch-kicker">Sản phẩm</span>
                  <h2>{viewModel.productName}</h2>
                </div>
                <span className="batch-grade-pill">{viewModel.grade}</span>
              </div>
              <div className="batch-facts-grid">
                <div>
                  <span>Danh mục</span>
                  <strong>{viewModel.category}</strong>
                </div>
                <div>
                  <span>Khối lượng</span>
                  <strong>{viewModel.quantity}</strong>
                </div>
                <div>
                  <span>Khả dụng</span>
                  <strong>{viewModel.availableQuantity}</strong>
                </div>
                <div>
                  <span>Độ ẩm</span>
                  <strong>{viewModel.moisture}</strong>
                </div>
              </div>
            </div>
          </article>

          <article className="batch-card batch-origin-card">
            <div className="batch-section-title">
              <span className="batch-icon-box"><Icon>agriculture</Icon></span>
              <h2>Nguồn gốc & Canh tác</h2>
            </div>
            <div className="batch-origin-grid">
              <div className="batch-farm-profile">
                <div className="batch-farm-photo" aria-hidden="true"><Icon>forest</Icon></div>
                <div>
                  <h3>{viewModel.farmName}</h3>
                  <p><Icon>location_on</Icon>{viewModel.farmLocation}</p>
                  <a href="/dashboard/farm">View Farm Profile</a>
                </div>
              </div>
              <div className="batch-season-card">
                <div>
                  <span>Season ID</span>
                  <strong>{viewModel.seasonId}</strong>
                </div>
                <div>
                  <span>Harvest Date</span>
                  <strong>{viewModel.harvestDate}</strong>
                </div>
              </div>
            </div>
          </article>

          <article className="batch-card batch-blockchain-card">
            <div className="batch-card-heading-row">
              <div className="batch-section-title compact">
                <span className="batch-icon-box blue"><Icon>token</Icon></span>
                <h2>Xác thực Blockchain</h2>
              </div>
              <span className="batch-immutable-pill"><Icon>shield</Icon>Immutable Record</span>
            </div>
            <div className="batch-chain-stack">
              <div>
                <span className="batch-field-label">Transaction Hash</span>
                <div className="batch-hash-row">
                  <code>{viewModel.hash}</code>
                  <button type="button" aria-label="Copy transaction hash"><Icon>content_copy</Icon></button>
                </div>
              </div>
              <div className="batch-chain-footer">
                <div>
                  <span className="batch-field-label">Block Number</span>
                  <strong>{viewModel.blockNumber}</strong>
                </div>
                <button type="button" className="batch-button batch-button-blue">
                  <Icon>open_in_new</Icon>
                  Verify on Explorer
                </button>
              </div>
              <VerificationStatus batchId={id} />
            </div>
          </article>
        </div>

        <aside className="batch-side-column">
          <article className="batch-card batch-qr-card">
            <h2>Mã định danh QR</h2>
            <div className="batch-qr-frame">
              <div className="batch-qr-inner"><Icon>qr_code_2</Icon></div>
              <span className="batch-qr-verified"><Icon>verified_user</Icon></span>
            </div>
            <p>Scan to view complete immutable history of this specific batch.</p>
            <button type="button" className="batch-button batch-button-wide batch-button-secondary">
              <Icon>download</Icon>
              Download QR Label
            </button>
          </article>

          <article className="batch-card batch-actions-card">
            <h2>Hành động nhanh</h2>
            <nav aria-label="Quick batch actions">
              <button type="button">
                <span><Icon>timeline</Icon>View Traceability</span>
                <Icon>chevron_right</Icon>
              </button>
              <button type="button">
                <span><Icon>local_shipping</Icon>View Linked Shipments</span>
                <Icon>chevron_right</Icon>
              </button>
              <button type="button">
                <span><Icon>description</Icon>Export Detailed Report</span>
                <Icon>chevron_right</Icon>
              </button>
            </nav>
          </article>
        </aside>

        <article className="batch-card batch-timeline-card">
          <div className="batch-section-title">
            <span className="batch-icon-box"><Icon>history</Icon></span>
            <h2>Hành trình Lô hàng</h2>
          </div>
          <div className="batch-timeline-scroll">
            <div className="batch-timeline">
              {timelineSteps.map((step, index) => (
                <div className={`batch-timeline-step tone-${step.tone}`} key={step.title}>
                  <div className={`batch-timeline-node ${index === timelineSteps.length - 1 ? 'is-active' : ''}`}>
                    <Icon>{step.icon}</Icon>
                    {index === timelineSteps.length - 1 ? <i aria-hidden="true" /> : null}
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.time}</p>
                  <span>{step.meta}</span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    </main>
  )
}
