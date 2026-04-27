import { useEffect, useState } from 'react'
import { getPublishedContent } from '../services/workflowService.js'

export function PublicAnnouncementsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await getPublishedContent()
        if (mounted) setItems(Array.isArray(data) ? data : [])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <section style={{ padding: 24 }}>
      <h1>Announcements</h1>
      <p>Public platform updates, product drops, and educational notices.</p>
      {loading ? <p>Loading...</p> : items.length === 0 ? <p>No announcements yet.</p> : items.map((item) => (
        <article key={item.contentId} style={{ marginBottom: 16, padding: 16, border: '1px solid #ddd', borderRadius: 12 }}>
          <strong>{item.title}</strong>
          <p>{item.summary}</p>
        </article>
      ))}
    </section>
  )
}
