import axios from 'axios'
import { useEffect, useState } from 'react'

export function VerificationStatus({ batchId }) {
  const [verify, setVerify] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchVerification() {
      try {
        setLoading(true)
        const res = await axios.get(`/api/v1/batches/${batchId}/verify`)
        setVerify(res.data.data)
        setError('')
      } catch (err) {
        setError('Không thể xác thực dữ liệu batch')
        console.error('Verification error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (batchId) {
      fetchVerification()
    }
  }, [batchId])

  if (loading) {
    return <div className="text-gray-500">Đang xác thực...</div>
  }

  if (error) {
    return <div className="rounded bg-yellow-100 text-yellow-700 p-3">{error}</div>
  }

  return (
    <div className="space-y-2">
      {verify?.matched ? (
        <div className="rounded bg-green-100 text-green-700 p-3">
          ✓ Dữ liệu hợp lệ, khớp với blockchain.
        </div>
      ) : (
        <div className="rounded bg-red-100 text-red-700 p-3">
          ✗ Cảnh báo: dữ liệu hiện tại không khớp với blockchain.
        </div>
      )}
      
      {verify && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded font-mono">
          <div className="mb-1">
            <strong>Hash cục bộ:</strong> {verify.localHash?.substring(0, 16)}...
          </div>
          <div>
            <strong>Hash blockchain:</strong> {verify.onChainHash ? verify.onChainHash.substring(0, 16) + '...' : 'N/A'}
          </div>
        </div>
      )}
    </div>
  )
}
