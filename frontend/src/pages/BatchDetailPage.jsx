import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { VerificationStatus } from '../components/VerificationStatus'

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

  if (loading) {
    return <div className="p-6">Đang tải...</div>
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>
  }

  if (!batch) {
    return <div className="p-6">Không tìm thấy batch</div>
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Chi tiết Lô Hàng</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm text-gray-600">Mã Lô Hàng</label>
            <p className="text-lg font-semibold">{batch.batchCode}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Trạng Thái</label>
            <p className="text-lg font-semibold">{batch.batchStatus}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Số Lượng</label>
            <p className="text-lg font-semibold">{batch.quantity}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Số Lượng Khả Dụng</label>
            <p className="text-lg font-semibold">{batch.availableQuantity}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Chất Lượng</label>
            <p className="text-lg font-semibold">{batch.qualityGrade}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Ngày Thu Hoạch</label>
            <p className="text-lg font-semibold">{batch.harvestDate}</p>
          </div>
        </div>

        <hr className="my-6" />

        <h2 className="text-xl font-bold mb-4">Xác Thực Blockchain</h2>
        <VerificationStatus batchId={id} />
      </div>
    </div>
  )
}
