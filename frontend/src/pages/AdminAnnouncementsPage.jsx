import { useEffect, useState } from 'react'
import { getAdminAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../services/workflowService'
import { getErrorMessage } from '../utils/helpers'

const emptyForm = {
  title: '',
  summary: '',
  contentHtml: '',
  category: 'ANNOUNCEMENT',
  pinned: false,
}

const categories = [
  { value: 'ANNOUNCEMENT', label: 'Thông báo' },
  { value: 'EVENT', label: 'S? ki?n' },
  { value: 'NEWS', label: 'Tin t?c' },
  { value: 'POLICY', label: 'Chính sách' },
]

export default function AdminAnnouncementsPage() {
  const [list, setList] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const data = await getAdminAnnouncements()
      setList(Array.isArray(data) ? data : [])
    } catch { setList([]) }
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
    setError('')
  }

  function startEdit(item) {
    setForm({
      title: item.title || '',
      summary: item.summary || '',
      contentHtml: item.contentHtml || '',
      category: item.category || 'ANNOUNCEMENT',
      pinned: item.pinned || false,
    })
    setEditingId(item.announcementId)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.contentHtml.trim()) {
      setError('Tiêu đề và n?i dung không được để tr?ng')
      return
    }
    setBusy(true); setError(''); setSuccess('')
    try {
      if (editingId) {
        await updateAnnouncement(editingId, form)
        setSuccess('C?p nh?t thông báo thành công')
      } else {
        await createAnnouncement(form)
        setSuccess('T?o thông báo thành công')
      }
      resetForm()
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally { setBusy(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Xóa thông báo này?')) return
    setBusy(true); setError(''); setSuccess('')
    try {
      await deleteAnnouncement(id)
      setSuccess('Đã xóa thông báo')
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally { setBusy(false) }
  }

  return (
    <section className="page-section admin-page">
      <div className="section-heading">
        <div>
          <h2>Qu?n l? thông báo</h2>
          <p>T?o, s?a, xóa thông báo hi?n th? trên trang public.</p>
        </div>
      </div>

      {error && <div className="error-message" style={{margin:'1rem 0'}}>{error}</div>}
      {success && <div className="success-message" style={{margin:'1rem 0'}}>{success}</div>}

      <form onSubmit={handleSubmit} className="admin-form" style={{marginBottom:'2rem'}}>
        <div className="admin-form-grid">
          <div className="form-group">
            <label>Tiêu đề *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Tiêu đề thông báo" />
          </div>
          <div className="form-group">
            <label>Danh m?c</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Tóm t?t</label>
            <input value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} placeholder="Tóm t?t ng?n" />
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={form.pinned} onChange={e => setForm({...form, pinned: e.target.checked})} />
              {' '}Ghim lên đầu
            </label>
          </div>
          <div className="form-group" style={{gridColumn:'1 / -1'}}>
            <label>N?i dung (HTML) *</label>
            <textarea value={form.contentHtml} onChange={e => setForm({...form, contentHtml: e.target.value})} rows={6} placeholder="<p>N?i dung thông báo...</p>" />
          </div>
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="button button-primary" disabled={busy}>
            {busy ? 'Đang x? l?...' : editingId ? 'C?p nh?t' : 'T?o thông báo'}
          </button>
          {editingId && <button type="button" className="button button-secondary" onClick={resetForm}>H?y</button>}
        </div>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Danh m?c</th>
              <th>Ghim</th>
              <th>Kích ho?t</th>
              <th>Ngày t?o</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={7} style={{textAlign:'center',padding:'2rem'}}>Chưa có thông báo nào</td></tr>}
            {list.map(item => (
              <tr key={item.announcementId}>
                <td>{item.announcementId}</td>
                <td>{item.title}</td>
                <td>{item.category}</td>
                <td>{item.pinned ? '??' : '-'}</td>
                <td>{item.active ? '?' : '?'}</td>
                <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
                <td>
                  <button className="button button-sm" onClick={() => startEdit(item)}>S?a</button>
                  <button className="button button-sm button-danger" onClick={() => handleDelete(item.announcementId)} style={{marginLeft:'0.5rem'}}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
