import { useEffect, useState } from 'react'
import { getAdminContents, createContent, updateContent, deleteContent } from '../services/workflowService'
import { getErrorMessage } from '../utils/helpers'

const emptyForm = {
  title: '',
  summary: '',
  body: '',
  contentType: 'ARTICLE',
  mediaUrl: '',
  status: 'PUBLISHED',
}

export default function AdminEducationContentPage() {
  const [list, setList] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const data = await getAdminContents()
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
      body: item.body || '',
      contentType: item.contentType || 'ARTICLE',
      mediaUrl: item.mediaUrl || '',
      status: item.status || 'PUBLISHED',
    })
    setEditingId(item.contentId)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) {
      setError('Tiêu đề và nội dung không được để trống')
      return
    }
    setBusy(true); setError(''); setSuccess('')
    try {
      if (editingId) {
        await updateContent(editingId, form)
        setSuccess('Cập nhật bài viết thành công')
      } else {
        await createContent(form)
        setSuccess('Tạo bài viết thành công')
      }
      resetForm()
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally { setBusy(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Xóa bài viết này?')) return
    setBusy(true); setError(''); setSuccess('')
    try {
      await deleteContent(id)
      setSuccess('Đã xóa bài viết')
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally { setBusy(false) }
  }

  return (
    <section className="page-section admin-page">
      <div className="section-heading">
        <div>
          <h2>Quản lý bài viết giáo dục</h2>
          <p>Tạo, sửa, xóa nội dung giáo dục hiển thị trên trang public.</p>
        </div>
      </div>

      {error && <div className="error-message" style={{margin:'1rem 0'}}>{error}</div>}
      {success && <div className="success-message" style={{margin:'1rem 0'}}>{success}</div>}

      <form onSubmit={handleSubmit} className="admin-form" style={{marginBottom:'2rem'}}>
        <div className="admin-form-grid">
          <div className="form-group">
            <label>Tiêu đề *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Tiêu đề bài viết" />
          </div>
          <div className="form-group">
            <label>Loại nội dung</label>
            <select value={form.contentType} onChange={e => setForm({...form, contentType: e.target.value})}>
              <option value="ARTICLE">Bài viết</option>
              <option value="VIDEO">Video</option>
              <option value="GUIDE">Hướng dẫn</option>
              <option value="EVENT">Sự kiện</option>
            </select>
          </div>
          <div className="form-group">
            <label>Trạng thái</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              <option value="PUBLISHED">Xuất bản</option>
              <option value="DRAFT">Bản nháp</option>
              <option value="ARCHIVED">Lưu trữ</option>
            </select>
          </div>
          <div className="form-group">
            <label>URL hình ảnh</label>
            <input value={form.mediaUrl} onChange={e => setForm({...form, mediaUrl: e.target.value})} placeholder="https://..." />
          </div>
          <div className="form-group" style={{gridColumn:'1 / -1'}}>
            <label>Tóm tắt</label>
            <textarea value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} rows={2} placeholder="Tóm tắt ngắn về bài viết" />
          </div>
          <div className="form-group" style={{gridColumn:'1 / -1'}}>
            <label>Nội dung *</label>
            <textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} rows={10} placeholder="Nội dung bài viết..." />
          </div>
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="button button-primary" disabled={busy}>
            {busy ? 'Đang xử lý...' : editingId ? 'Cập nhật' : 'Tạo bài viết'}
          </button>
          {editingId && <button type="button" className="button button-secondary" onClick={resetForm}>Hủy</button>}
        </div>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Loại</th>
              <th>Trạng thái</th>
              <th>Slug</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={7} style={{textAlign:'center',padding:'2rem'}}>Chưa có bài viết nào</td></tr>}
            {list.map(item => (
              <tr key={item.contentId}>
                <td>{item.contentId}</td>
                <td>{item.title}</td>
                <td>{item.contentType}</td>
                <td>{item.status}</td>
                <td style={{fontSize:'0.85em'}}>{item.slug}</td>
                <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
                <td>
                  <button className="button button-sm" onClick={() => startEdit(item)}>Sửa</button>
                  <button className="button button-sm button-danger" onClick={() => handleDelete(item.contentId)} style={{marginLeft:'0.5rem'}}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
