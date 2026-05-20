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
        setError('Không th? xác th?c d? li?u batch')
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
    return <div className="text-gray-500">Đang xác th?c...</div>
  }

  if (error) {
    return <div className="rounded bg-yellow-100 text-yellow-700 p-3">{error}</div>
  }

  return (
    <div className="space-y-2">
      {verify?.matched ? (
        <div className="rounded bg-green-100 text-green-700 p-3">
          ? D? li?u h?p l?, kh?p v?i blockchain.
        </div>
      ) : (
        <div className="rounded bg-red-100 text-red-700 p-3">
          ? C?nh báo: d? li?u hi?n t?i không kh?p v?i blockchain.
        </div>
      )}
      
      {verify && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded font-mono">
          <div className="mb-1">
            <strong>Hash c?c b?:</strong> {verify.localHash?.substring(0, 16)}...
          </div>
          <div>
            <strong>Hash blockchain:</strong> {verify.onChainHash ? verify.onChainHash.substring(0, 16) + '...' : 'N/A'}
          </div>
        </div>
      )}
    </div>
  )
}
