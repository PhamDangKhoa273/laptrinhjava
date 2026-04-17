import { useEffect, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { getAllFarms, updateFarmApprovalStatus } from '../services/businessService'
import { getErrorMessage } from '../utils/helpers.js'

export function AdminFarmsPage() {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadFarms()
  }, [])

  async function loadFarms() {
    try {
      setLoading(true)
      setError('')
      const data = await getAllFarms()
      setFarms(data || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleChangeApprovalStatus(farmId, newStatus) {
    try {
      setError('')
      await updateFarmApprovalStatus(farmId, newStatus)
      setSuccess('Approval status updated successfully')
      loadFarms()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  function formatDate(dateString) {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function getStatusColor(status) {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  function getCertificationColor(status) {
    switch (status) {
      case 'VALID':
        return 'bg-green-100 text-green-800'
      case 'INVALID':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading farms...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontSize: '24px' }} className="text-3xl font-bold text-gray-900">Farm Management</h1>
        <p className="mt-2 text-gray-600">Review and approve farm registrations, manage certifications, and monitor farm status.</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}
      {success && <div className="rounded-lg bg-green-50 p-4 text-green-700">{success}</div>}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Farm Code</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Farm Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Owner</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Province</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Certification</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Approval Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reviewed By</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reviewed At</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {farms.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                  No farms found
                </td>
              </tr>
            ) : (
              farms.map((farm) => (
                <tr key={farm.farmId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{farm.farmCode}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{farm.farmName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="font-medium">{farm.ownerName}</div>
                    <div className="text-xs text-gray-500">ID: {farm.ownerId}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{farm.province}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCertificationColor(farm.certificationStatus)}`}>
                      {farm.certificationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(farm.approvalStatus)}`}>
                      {farm.approvalStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {farm.reviewedByFullName ? <div className="font-medium">{farm.reviewedByFullName}</div> : <span className="text-gray-400">Not reviewed</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(farm.reviewedAt)}</td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    {farm.approvalStatus !== 'APPROVED' && (
                      <Button onClick={() => handleChangeApprovalStatus(farm.farmId, 'APPROVED')} variant="success">
                        Approve
                      </Button>
                    )}
                    {farm.approvalStatus !== 'REJECTED' && (
                      <Button onClick={() => handleChangeApprovalStatus(farm.farmId, 'REJECTED')} variant="danger">
                        Reject
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
