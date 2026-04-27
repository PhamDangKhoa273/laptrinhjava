import { useEffect, useState } from 'react'
import { getAnalyticsDashboard } from '../services/analyticsService'

function Card({ title, data }) {
  if (!data) return null
  return (
    <article className="mp-card">
      <div className="mp-card__body">
        <span className="mp-card__category">{title}</span>
        <h3 className="mp-card__title">{data.label || data.scope}</h3>
        <p className="mp-card__desc">{data.value ?? data.forecastValue} {data.unit || ''}</p>
        {data.trend ? <p className="mp-card__farm">Trend: {data.trend}</p> : null}
        {data.confidence ? <p className="mp-card__farm">Confidence: {Math.round((data.confidence || 0) * 100)}%</p> : null}
        {data.signals ? <p className="mp-card__desc">Signals: {data.signals.join(', ')}</p> : null}
        {data.actions ? <p className="mp-card__desc">Actions: {data.actions.join(', ')}</p> : null}
      </div>
    </article>
  )
}

function ViewSection({ title, subtitle, data }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <div className="section-heading" style={{ marginBottom: 12 }}>
        <div>
          <p className="eyebrow">{title}</p>
          <h2 style={{ marginBottom: 6 }}>{subtitle}</h2>
        </div>
      </div>
      <div className="mp-grid">
        <Card title={`${title} metric 1`} data={data?.production || data?.delivery} />
        <Card title={`${title} metric 2`} data={data?.inventory || data?.issues} />
        <Card title={`${title} metric 3`} data={data?.sales || data?.iot} />
        <Card title="Forecast" data={data?.forecast} />
      </div>
    </section>
  )
}

export function AnalyticsDashboardPage() {
  const [dashboard, setDashboard] = useState(null)

  useEffect(() => {
    getAnalyticsDashboard().then(setDashboard)
  }, [])

  return (
    <section className="marketplace">
      <div className="section-heading" style={{ marginBottom: 16 }}>
        <div>
          <p className="eyebrow">Analytics and forecasting</p>
          <h2 style={{ marginBottom: 6 }}>Admin operations, farm planning, shipping ops</h2>
          <p style={{ margin: 0, color: '#5f6b7a' }}>Production, inventory, sales speed, lead time, shipping issues, and IoT risk signals with forecast actions.</p>
        </div>
      </div>
      <ViewSection title="Admin operations" subtitle="Control room view" data={dashboard?.admin} />
      <ViewSection title="Farm planning" subtitle="Production and inventory view" data={dashboard?.farm} />
      <ViewSection title="Shipping ops" subtitle="Delivery and incident view" data={dashboard?.shipping} />
      {dashboard?.recommendations ? (
        <div className="mp-card" style={{ marginTop: 24 }}>
          <div className="mp-card__body">
            <h3 className="mp-card__title">Recommended actions</h3>
            <ul>
              {dashboard.recommendations.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  )
}