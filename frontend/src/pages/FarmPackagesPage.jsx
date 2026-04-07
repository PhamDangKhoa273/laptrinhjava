import { useEffect, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { createSubscription, getMySubscriptions, getPackages } from '../services/businessService'
import { getErrorMessage } from '../utils/helpers'

export function FarmPackagesPage() {
  const [packages, setPackages] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submittingPackageId, setSubmittingPackageId] = useState(null)

  async function loadData() {
    setLoading(true)
    try {
      const [packageData, subscriptionData] = await Promise.all([
        getPackages(),
        getMySubscriptions(),
      ])
      setPackages(Array.isArray(packageData) ? packageData : [])
      setSubscriptions(Array.isArray(subscriptionData) ? subscriptionData : [])
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load service packages.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleSubscribe(packageId) {
    setSubmittingPackageId(packageId)
    setError('')
    setSuccess('')
    try {
      await createSubscription({ packageId })
      setSuccess('Subscription created successfully.')
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to create subscription.'))
    } finally {
      setSubmittingPackageId(null)
    }
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Farm subscriptions</p>
          <h2>Packages and subscriptions</h2>
          <p>View available service packages and create subscriptions directly from backend TV2 APIs.</p>
        </div>
      </div>

      {loading ? <div className="glass-card">Loading packages and subscriptions...</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="content-grid">
        <article className="glass-card">
          <h3>Available packages</h3>
          <div className="form-grid">
            {packages.map((item) => (
              <div key={item.packageId} className="business-card">
                <div>
                  <strong>{item.packageName}</strong>
                  <p>{item.description || 'No description'}</p>
                  <p>Code: {item.packageCode}</p>
                  <p>Price: {item.price}</p>
                  <p>Duration: {item.durationDays} days</p>
                </div>
                <Button onClick={() => handleSubscribe(item.packageId)} disabled={submittingPackageId === item.packageId}>
                  {submittingPackageId === item.packageId ? 'Submitting...' : 'Subscribe'}
                </Button>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card">
          <h3>My subscriptions</h3>
          <ul className="feature-list">
            {subscriptions.length === 0 ? <li>No subscriptions yet.</li> : null}
            {subscriptions.map((item) => (
              <li key={item.subscriptionId}>
                {item.packageName} - {item.subscriptionStatus} ({item.startDate} → {item.endDate})
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  )
}
