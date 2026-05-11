import { useEffect, useMemo, useState } from 'react'
import { getAnalyticsDashboard } from '../services/analyticsService'

function formatMetric(data) {
  if (!data) return 'N/A'
  const value = data.value ?? data.forecastValue ?? 'N/A'
  return `${value}${data.unit ? ` ${data.unit}` : ''}`
}

function AnalyticsPanel({ title, subtitle, data, accent }) {
  const cards = [
    { label: 'Production / Delivery', value: data?.production || data?.delivery },
    { label: 'Inventory / Issues', value: data?.inventory || data?.issues },
    { label: 'Sales / IoT', value: data?.sales || data?.iot },
    { label: 'Forecast', value: data?.forecast },
  ]

  return (
    <article className={`glass-card admin-analytics-panel accent-${accent}`}>
      <div className="admin-table-head">
        <div>
          <span className="feature-badge">{title}</span>
          <h3>{subtitle}</h3>
          <p>Theo dõi tín hiệu vận hành, xu hướng và gợi ý hành động theo thời gian thực.</p>
        </div>
      </div>
      <div className="admin-analytics-metric-grid">
        {cards.map((card) => (
          <div key={card.label} className="admin-analytics-metric-card">
            <span>{card.label}</span>
            <strong>{card.value?.label || card.value?.scope || 'Chưa có dữ liệu'}</strong>
            <em>{formatMetric(card.value)}</em>
            {card.value?.trend ? <small>Trend: {card.value.trend}</small> : null}
            {card.value?.confidence ? <small>Confidence: {Math.round((card.value.confidence || 0) * 100)}%</small> : null}
          </div>
        ))}
      </div>
    </article>
  )
}

export function AnalyticsDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadDashboard() {
    try {
      setLoading(true)
      setError('')
      setDashboard(await getAnalyticsDashboard())
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không tải được analytics dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const overview = useMemo(() => {
    const recommendations = dashboard?.recommendations || []
    const confidenceValues = [
      dashboard?.admin?.forecast?.confidence,
      dashboard?.farm?.forecast?.confidence,
      dashboard?.shipping?.forecast?.confidence,
    ].filter((value) => typeof value === 'number')
    const confidence = confidenceValues.length
      ? Math.round((confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length) * 100)
      : 0
    return { recommendations: recommendations.length, confidence }
  }, [dashboard])

  return (
    <section className="page-section admin-page admin-analytics-page">
      <div className="section-heading">
        <div>
          <h2>Analytics & forecasting</h2>
          <p>Control room cho tăng trưởng, đơn hàng, tồn kho, vận chuyển và tín hiệu rủi ro IoT.</p>
        </div>
        <div className="section-actions">
          <button type="button" className="button button-secondary" onClick={loadDashboard} disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới'}</button>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="status-grid admin-overview-grid">
        <article className="status-card"><span>Admin signals</span><strong>{dashboard?.admin ? 4 : 0}</strong><small>Operations metrics</small></article>
        <article className="status-card"><span>Farm planning</span><strong>{dashboard?.farm ? 4 : 0}</strong><small>Production + inventory</small></article>
        <article className="status-card"><span>Shipping ops</span><strong>{dashboard?.shipping ? 4 : 0}</strong><small>Delivery + incident</small></article>
        <article className="status-card"><span>Forecast confidence</span><strong>{overview.confidence}%</strong><small>Average model confidence</small></article>
        <article className="status-card"><span>Recommended actions</span><strong>{overview.recommendations}</strong><small>Priority interventions</small></article>
      </div>

      <div className="admin-analytics-shell">
        <AnalyticsPanel title="Admin operations" subtitle="Control room view" data={dashboard?.admin} accent="primary" />
        <AnalyticsPanel title="Farm planning" subtitle="Production and inventory view" data={dashboard?.farm} accent="success" />
        <AnalyticsPanel title="Shipping ops" subtitle="Delivery and incident view" data={dashboard?.shipping} accent="warning" />
      </div>

      <article className="glass-card admin-analytics-recommendations">
        <div className="admin-table-head">
          <div>
            <span className="feature-badge">Action center</span>
            <h3>Recommended actions</h3>
            <p>Ưu tiên xử lý dựa trên các tín hiệu dự báo hiện tại.</p>
          </div>
        </div>
        {dashboard?.recommendations?.length ? (
          <ul className="feature-list">
            {dashboard.recommendations.map((item) => <li key={item} className="is-ok">{item}</li>)}
          </ul>
        ) : (
          <p className="muted-inline">Chưa có khuyến nghị mới.</p>
        )}
      </article>
    </section>
  )
}