import { useEffect, useMemo, useState } from 'react'
import '../farm-workspace.css'
import { Button } from '../components/Button.jsx'
import { TextAreaField } from '../components/TextAreaField.jsx'
import { TextInput } from '../components/TextInput.jsx'
import {
  createFarm,
  createSubscription,
  createSubscriptionPayment,
  getMyFarm,
  getMySubscriptionPayments,
  getMySubscriptions,
  getPackages,
  updateFarm,
} from '../services/businessService'
import { createListing, getMyListings, updateListing } from '../services/listingService.js'
import {
  createBatch,
  createSeason,
  createSeasonProcess,
  deleteSeasonProcess,
  generateBatchQr,
  getBatches,
  getPhase3FarmContext,
  getSeasonProcesses,
  getSeasons,
  reorderSeasonProcess,
  traceBatch,
  updateBatch,
  updateSeason,
  updateSeasonProcess,
  verifyBatch,
} from '../services/phase3Service.js'
import { getMyListingRegistrations, getMyNotifications, getMyReports, markNotificationRead, submitListingRegistration } from '../services/workflowService.js'
import { getErrorMessage } from '../utils/helpers'

const initialProfileForm = {
  farmCode: '',
  farmName: '',
  businessLicenseNo: '',
  address: '',
  province: '',
  description: '',
}

const initialListingForm = {
  batchId: '',
  title: '',
  description: '',
  price: '',
  quantityAvailable: '',
  unit: 'kg',
  imageUrl: '',
  registrationNote: '',
  status: 'DRAFT',
}

const initialPaymentForm = {
  subscriptionId: '',
  amount: '',
  method: 'BANK_TRANSFER',
  transactionRef: '',
  paymentStatus: 'PENDING',
}

const initialSeasonForm = {
  farmId: '',
  productId: '',
  seasonCode: '',
  startDate: '',
  expectedHarvestDate: '',
  actualHarvestDate: '',
  farmingMethod: '',
  seasonStatus: 'PLANNED',
}

const initialProcessForm = {
  stepNo: '',
  stepName: '',
  performedAt: '',
  description: '',
  imageUrl: '',
}

const initialBatchForm = {
  seasonId: '',
  productId: '',
  batchCode: '',
  harvestDate: '',
  quantity: '',
  availableQuantity: '',
  qualityGrade: '',
  expiryDate: '',
  batchStatus: 'CREATED',
}

const listingStatuses = ['DRAFT', 'ACTIVE', 'INACTIVE']
const paymentMethods = ['BANK_TRANSFER', 'MOMO', 'CASH']
const paymentStatuses = ['PENDING', 'PAID', 'FAILED']
const seasonStatuses = ['PLANNED', 'IN_PROGRESS', 'HARVESTED', 'COMPLETED']
const batchStatuses = ['CREATED', 'READY', 'STORED', 'SOLD_OUT']
const qualityGrades = ['A', 'B', 'C']

function formatDateTime(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString('vi-VN')
}

function formatDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString('vi-VN')
}

function formatCurrency(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return 'N/A'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numeric)
}

function toPositiveNumber(value) {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null
}

function toDateTimeLocalInput(value) {
  if (!value) return ''
  return String(value).slice(0, 16)
}

function buildSeasonCode(farmCode) {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  return `${farmCode || 'SEASON'}-${stamp}`
}

function buildBatchCode(seasonCode) {
  const stamp = new Date().toISOString().slice(11, 19).replaceAll(':', '')
  return `${seasonCode || 'BATCH'}-${stamp}`
}

function copyToClipboard(text) {
  if (!text || !navigator?.clipboard) return Promise.reject(new Error('Clipboard không khả dụng.'))
  return navigator.clipboard.writeText(text)
}

export function FarmWorkspacePage() {
  const [farm, setFarm] = useState(null)
  const [packages, setPackages] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [payments, setPayments] = useState([])
  const [listings, setListings] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [notifications, setNotifications] = useState([])
  const [reports, setReports] = useState([])
  const [batches, setBatches] = useState([])
  const [seasons, setSeasons] = useState([])
  const [products, setProducts] = useState([])
  const [farmContext, setFarmContext] = useState(null)
  const [seasonTimeline, setSeasonTimeline] = useState(null)
  const [traceResult, setTraceResult] = useState(null)
  const [verifyResult, setVerifyResult] = useState(null)
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState('')
  const [selectedSeasonId, setSelectedSeasonId] = useState('')
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [editingListingId, setEditingListingId] = useState('')
  const [editingSeasonId, setEditingSeasonId] = useState('')
  const [editingProcessId, setEditingProcessId] = useState('')
  const [editingBatchId, setEditingBatchId] = useState('')
  const [profileForm, setProfileForm] = useState(initialProfileForm)
  const [listingForm, setListingForm] = useState(initialListingForm)
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm)
  const [seasonForm, setSeasonForm] = useState(initialSeasonForm)
  const [processForm, setProcessForm] = useState(initialProcessForm)
  const [batchForm, setBatchForm] = useState(initialBatchForm)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [submittingPackageId, setSubmittingPackageId] = useState(null)
  const [savingListing, setSavingListing] = useState(false)
  const [savingPayment, setSavingPayment] = useState(false)
  const [savingSeason, setSavingSeason] = useState(false)
  const [savingProcess, setSavingProcess] = useState(false)
  const [savingBatch, setSavingBatch] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const activeSubscription = useMemo(
    () => subscriptions.find((item) => String(item.subscriptionId) === String(selectedSubscriptionId)) || subscriptions[0] || null,
    [subscriptions, selectedSubscriptionId],
  )

  const selectedSeason = useMemo(
    () => seasons.find((item) => String(item.id) === String(selectedSeasonId)) || null,
    [seasons, selectedSeasonId],
  )

  const selectedBatch = useMemo(
    () => batches.find((item) => String(item.batchId) === String(selectedBatchId)) || null,
    [batches, selectedBatchId],
  )

  const summary = useMemo(() => ({
    totalPackages: packages.length,
    totalSubscriptions: subscriptions.length,
    totalListings: listings.length,
    pendingRegistrations: registrations.filter((item) => String(item.status || '').toUpperCase().includes('PENDING')).length,
    unreadNotifications: notifications.filter((item) => !item.read).length,
    totalSeasons: seasons.length,
    totalBatches: batches.length,
  }), [packages, subscriptions, listings, registrations, notifications, seasons, batches])

  useEffect(() => {
    loadWorkspace()
  }, [])

  useEffect(() => {
    if (activeSubscription) {
      setPaymentForm((prev) => ({
        ...prev,
        subscriptionId: String(activeSubscription.subscriptionId),
      }))
    }
  }, [activeSubscription])

  useEffect(() => {
    if (selectedSeason && !editingBatchId) {
      setBatchForm((prev) => ({
        ...prev,
        seasonId: String(selectedSeason.id),
        productId: String(selectedSeason.productId || prev.productId || ''),
        batchCode: prev.batchCode || buildBatchCode(selectedSeason.seasonCode),
      }))
    }
  }, [selectedSeason, editingBatchId])

  async function loadWorkspace(options = {}) {
    const { preferredSeasonId = selectedSeasonId, preferredBatchId = selectedBatchId } = options
    setLoading(true)
    try {
      const [
        farmResult,
        packageResult,
        subscriptionResult,
        paymentResult,
        listingResult,
        registrationResult,
        notificationResult,
        reportResult,
        seasonResult,
        batchResult,
        contextResult,
      ] = await Promise.allSettled([
        getMyFarm(),
        getPackages(),
        getMySubscriptions(),
        getMySubscriptionPayments(),
        getMyListings(),
        getMyListingRegistrations(),
        getMyNotifications(),
        getMyReports(),
        getSeasons(),
        getBatches(),
        getPhase3FarmContext(),
      ])

      const farmData = farmResult.status === 'fulfilled' ? farmResult.value : null
      setFarm(farmData)
      setProfileForm({
        farmCode: farmData?.farmCode || '',
        farmName: farmData?.farmName || '',
        businessLicenseNo: farmData?.businessLicenseNo || '',
        address: farmData?.address || '',
        province: farmData?.province || '',
        description: farmData?.description || '',
      })

      const packageData = packageResult.status === 'fulfilled' && Array.isArray(packageResult.value) ? packageResult.value : []
      setPackages(packageData)

      const subscriptionData = subscriptionResult.status === 'fulfilled' && Array.isArray(subscriptionResult.value) ? subscriptionResult.value : []
      setSubscriptions(subscriptionData)
      setSelectedSubscriptionId((prev) => prev || String(subscriptionData[0]?.subscriptionId || ''))

      setPayments(paymentResult.status === 'fulfilled' && Array.isArray(paymentResult.value) ? paymentResult.value : [])
      setListings(listingResult.status === 'fulfilled' && Array.isArray(listingResult.value) ? listingResult.value : [])
      setRegistrations(registrationResult.status === 'fulfilled' && Array.isArray(registrationResult.value) ? registrationResult.value : [])
      setNotifications(notificationResult.status === 'fulfilled' && Array.isArray(notificationResult.value) ? notificationResult.value : [])
      setReports(reportResult.status === 'fulfilled' && Array.isArray(reportResult.value) ? reportResult.value : [])

      const seasonData = seasonResult.status === 'fulfilled' && Array.isArray(seasonResult.value) ? seasonResult.value : []
      setSeasons(seasonData)

      const batchData = batchResult.status === 'fulfilled' && Array.isArray(batchResult.value) ? batchResult.value : []
      setBatches(batchData)

      const contextData = contextResult.status === 'fulfilled' ? contextResult.value : null
      setFarmContext(contextData?.farm || null)
      setProducts(Array.isArray(contextData?.products) ? contextData.products : [])

      const resolvedSeasonId =
        preferredSeasonId && seasonData.some((item) => String(item.id) === String(preferredSeasonId))
          ? String(preferredSeasonId)
          : seasonData[0]?.id ? String(seasonData[0].id) : ''

      const resolvedBatchId =
        preferredBatchId && batchData.some((item) => String(item.batchId) === String(preferredBatchId))
          ? String(preferredBatchId)
          : batchData[0]?.batchId ? String(batchData[0].batchId) : ''

      setSelectedSeasonId(resolvedSeasonId)
      setSelectedBatchId(resolvedBatchId)

      if (resolvedSeasonId) {
        setSeasonTimeline(await getSeasonProcesses(Number(resolvedSeasonId)))
      } else {
        setSeasonTimeline(null)
      }

      if (resolvedBatchId) {
        const [traceData, verifyData] = await Promise.all([
          traceBatch(Number(resolvedBatchId)),
          verifyBatch(Number(resolvedBatchId)),
        ])
        setTraceResult(traceData)
        setVerifyResult(verifyData)
      } else {
        setTraceResult(null)
        setVerifyResult(null)
      }

      setListingForm((prev) => ({
        ...prev,
        batchId: prev.batchId || String(batchData[0]?.batchId || ''),
      }))

      setSeasonForm((prev) => ({
        ...prev,
        farmId: contextData?.farm?.farmId ? String(contextData.farm.farmId) : prev.farmId,
        seasonCode: prev.seasonCode || buildSeasonCode(contextData?.farm?.farmCode),
        productId: prev.productId || String(contextData?.products?.[0]?.productId || ''),
      }))

      setBatchForm((prev) => ({
        ...prev,
        seasonId: prev.seasonId || String(batchData[0]?.seasonId || seasonData[0]?.id || ''),
        productId: prev.productId || String(contextData?.products?.[0]?.productId || ''),
        batchCode: prev.batchCode || buildBatchCode(seasonData[0]?.seasonCode),
      }))

      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được Farm Business Workspace.'))
    } finally {
      setLoading(false)
    }
  }

  function handleProfileChange(event) {
    const { name, value } = event.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleListingChange(event) {
    const { name, value } = event.target
    setListingForm((prev) => ({ ...prev, [name]: value }))
  }

  function handlePaymentChange(event) {
    const { name, value } = event.target
    setPaymentForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSeasonChange(event) {
    const { name, value } = event.target
    setSeasonForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleProcessChange(event) {
    const { name, value } = event.target
    setProcessForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleBatchChange(event) {
    const { name, value } = event.target
    setBatchForm((prev) => ({ ...prev, [name]: value }))
  }

  function resetListingForm() {
    setListingForm({
      ...initialListingForm,
      batchId: String(batches[0]?.batchId || ''),
    })
    setEditingListingId('')
  }

  function resetSeasonForm() {
    setSeasonForm({
      ...initialSeasonForm,
      farmId: farmContext?.farmId ? String(farmContext.farmId) : '',
      productId: products[0]?.productId ? String(products[0].productId) : '',
      seasonCode: buildSeasonCode(farmContext?.farmCode),
    })
    setEditingSeasonId('')
  }

  function resetProcessForm() {
    setProcessForm(initialProcessForm)
    setEditingProcessId('')
  }

  function resetBatchForm() {
    setBatchForm({
      ...initialBatchForm,
      seasonId: selectedSeason?.id ? String(selectedSeason.id) : '',
      productId: selectedSeason?.productId ? String(selectedSeason.productId) : products[0]?.productId ? String(products[0].productId) : '',
      batchCode: buildBatchCode(selectedSeason?.seasonCode),
    })
    setEditingBatchId('')
  }

  function fillListingForm(listing) {
    setEditingListingId(String(listing.listingId))
    setListingForm({
      batchId: String(listing.batchId || ''),
      title: listing.title || '',
      description: listing.description || '',
      price: listing.price || '',
      quantityAvailable: listing.quantityAvailable || '',
      unit: listing.unit || 'kg',
      imageUrl: listing.imageUrl || '',
      registrationNote: '',
      status: listing.status || 'DRAFT',
    })
  }

  function fillSeason(season) {
    setEditingSeasonId(String(season.id))
    setSeasonForm({
      farmId: String(season.farmId || ''),
      productId: String(season.productId || ''),
      seasonCode: season.seasonCode || '',
      startDate: season.startDate || '',
      expectedHarvestDate: season.expectedHarvestDate || '',
      actualHarvestDate: season.actualHarvestDate || '',
      farmingMethod: season.farmingMethod || '',
      seasonStatus: season.seasonStatus || 'PLANNED',
    })
  }

  function fillProcess(process) {
    setEditingProcessId(String(process.id))
    setProcessForm({
      stepNo: String(process.stepNo || ''),
      stepName: process.stepName || '',
      performedAt: toDateTimeLocalInput(process.performedAt),
      description: process.description || '',
      imageUrl: process.imageUrl || '',
    })
  }

  function fillBatch(batch) {
    setEditingBatchId(String(batch.batchId))
    setBatchForm({
      seasonId: String(batch.seasonId || ''),
      productId: String(batch.productId || ''),
      batchCode: batch.batchCode || '',
      harvestDate: batch.harvestDate || '',
      quantity: String(batch.quantity || ''),
      availableQuantity: String(batch.availableQuantity || ''),
      qualityGrade: batch.qualityGrade || '',
      expiryDate: batch.expiryDate || '',
      batchStatus: batch.batchStatus || 'CREATED',
    })
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    if (savingProfile) return
    setSavingProfile(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        farmCode: profileForm.farmCode.trim(),
        farmName: profileForm.farmName.trim(),
        businessLicenseNo: profileForm.businessLicenseNo.trim(),
        address: profileForm.address.trim(),
        province: profileForm.province.trim(),
        description: profileForm.description.trim(),
      }

      const result = farm
        ? await updateFarm(farm.farmId, {
          farmName: payload.farmName,
          businessLicenseNo: payload.businessLicenseNo,
          address: payload.address,
          province: payload.province,
          description: payload.description,
        })
        : await createFarm(payload)

      setFarm(result)
      setFarmContext(result)
      setProfileForm({
        farmCode: result.farmCode || payload.farmCode,
        farmName: result.farmName || '',
        businessLicenseNo: result.businessLicenseNo || '',
        address: result.address || '',
        province: result.province || '',
        description: result.description || '',
      })
      setSuccess(farm ? 'Đã cập nhật hồ sơ nông trại.' : 'Đã tạo hồ sơ nông trại.')
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể lưu hồ sơ nông trại.'))
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleSubscribe(packageId) {
    setSubmittingPackageId(packageId)
    setError('')
    setSuccess('')
    try {
      await createSubscription({ packageId, farmId: farm?.farmId || farmContext?.farmId || null })
      setSuccess('Đã tạo đăng ký gói dịch vụ.')
      await loadWorkspace()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể đăng ký gói dịch vụ.'))
    } finally {
      setSubmittingPackageId(null)
    }
  }

  async function handlePaymentSubmit(event) {
    event.preventDefault()
    if (savingPayment) return

    const subscriptionId = toPositiveNumber(paymentForm.subscriptionId)
    const amount = toPositiveNumber(paymentForm.amount)

    if (!subscriptionId || !amount) {
      setError('Subscription và số tiền phải hợp lệ.')
      return
    }

    setSavingPayment(true)
    setError('')
    setSuccess('')
    try {
      await createSubscriptionPayment({
        subscriptionId,
        amount,
        method: paymentForm.method,
        transactionRef: paymentForm.transactionRef.trim(),
        paymentStatus: paymentForm.paymentStatus,
      })
      setSuccess('Đã ghi nhận payment subscription.')
      setPaymentForm((prev) => ({ ...prev, amount: '', transactionRef: '' }))
      await loadWorkspace()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tạo payment subscription.'))
    } finally {
      setSavingPayment(false)
    }
  }

  async function handleListingSubmit(event) {
    event.preventDefault()
    if (savingListing) return

    const batchId = toPositiveNumber(listingForm.batchId)
    const price = toPositiveNumber(listingForm.price)
    const quantityAvailable = toPositiveNumber(listingForm.quantityAvailable)

    if (!batchId || !price || !quantityAvailable) {
      setError('Batch, giá và số lượng phải hợp lệ.')
      return
    }

    setSavingListing(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        batchId,
        title: listingForm.title.trim(),
        description: listingForm.description.trim(),
        price,
        quantityAvailable,
        unit: listingForm.unit.trim() || 'kg',
        imageUrl: listingForm.imageUrl.trim(),
      }

      const result = editingListingId
        ? await updateListing(Number(editingListingId), { ...payload, status: listingForm.status || 'DRAFT' })
        : await createListing(payload)

      if (!editingListingId && listingForm.registrationNote.trim()) {
        await submitListingRegistration(result.listingId, { note: listingForm.registrationNote.trim() })
      }

      setSuccess(editingListingId ? 'Đã cập nhật listing.' : 'Đã tạo listing mới.')
      resetListingForm()
      await loadWorkspace()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể lưu listing.'))
    } finally {
      setSavingListing(false)
    }
  }

  async function handleSeasonSubmit(event) {
    event.preventDefault()
    if (savingSeason) return

    const farmId = toPositiveNumber(seasonForm.farmId)
    const productId = toPositiveNumber(seasonForm.productId)
    if (!farmId || !productId) {
      setError('Farm ID và Product ID phải hợp lệ.')
      return
    }

    setSavingSeason(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        farmId,
        productId,
        seasonCode: seasonForm.seasonCode.trim(),
        startDate: seasonForm.startDate,
        expectedHarvestDate: seasonForm.expectedHarvestDate,
        actualHarvestDate: seasonForm.actualHarvestDate || null,
        farmingMethod: seasonForm.farmingMethod.trim(),
        seasonStatus: seasonForm.seasonStatus,
      }

      const result = editingSeasonId
        ? await updateSeason(Number(editingSeasonId), payload)
        : await createSeason(payload)

      setSuccess(editingSeasonId ? 'Đã cập nhật mùa vụ.' : 'Đã tạo mùa vụ.')
      resetSeasonForm()
      await loadWorkspace({ preferredSeasonId: result?.id, preferredBatchId: selectedBatchId })
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể lưu mùa vụ.'))
    } finally {
      setSavingSeason(false)
    }
  }

  async function handleProcessSubmit(event) {
    event.preventDefault()
    if (savingProcess) return
    if (!selectedSeasonId) {
      setError('Hãy chọn mùa vụ trước khi thêm quy trình.')
      return
    }

    const stepNo = toPositiveNumber(processForm.stepNo)
    if (!stepNo) {
      setError('Step no phải hợp lệ.')
      return
    }

    setSavingProcess(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        stepNo,
        stepName: processForm.stepName.trim(),
        performedAt: processForm.performedAt,
        description: processForm.description.trim(),
        imageUrl: processForm.imageUrl.trim(),
      }

      if (editingProcessId) {
        await updateSeasonProcess(Number(editingProcessId), payload)
      } else {
        await createSeasonProcess(Number(selectedSeasonId), payload)
      }

      setSuccess(editingProcessId ? 'Đã cập nhật bước quy trình.' : 'Đã thêm bước quy trình.')
      resetProcessForm()
      setSeasonTimeline(await getSeasonProcesses(Number(selectedSeasonId)))
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể lưu bước quy trình.'))
    } finally {
      setSavingProcess(false)
    }
  }

  async function handleBatchSubmit(event) {
    event.preventDefault()
    if (savingBatch) return

    const seasonId = toPositiveNumber(batchForm.seasonId)
    const productId = toPositiveNumber(batchForm.productId)
    const quantity = toPositiveNumber(batchForm.quantity)
    const availableQuantity = toPositiveNumber(batchForm.availableQuantity)

    if (!seasonId || !productId || !quantity || !availableQuantity) {
      setError('Season, Product, Quantity và Available Quantity phải hợp lệ.')
      return
    }

    setSavingBatch(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        seasonId,
        productId,
        batchCode: batchForm.batchCode.trim(),
        harvestDate: batchForm.harvestDate,
        quantity,
        availableQuantity,
        qualityGrade: batchForm.qualityGrade,
        expiryDate: batchForm.expiryDate,
        status: batchForm.batchStatus,
      }

      const result = editingBatchId
        ? await updateBatch(Number(editingBatchId), payload)
        : await createBatch(payload)

      setSuccess(editingBatchId ? 'Đã cập nhật batch.' : 'Đã tạo batch.')
      resetBatchForm()
      await loadWorkspace({ preferredSeasonId: selectedSeasonId, preferredBatchId: result?.batchId })
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể lưu batch.'))
    } finally {
      setSavingBatch(false)
    }
  }

  async function handleSelectSeason(seasonId) {
    setSelectedSeasonId(String(seasonId))
    setError('')
    try {
      setSeasonTimeline(await getSeasonProcesses(Number(seasonId)))
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải timeline mùa vụ.'))
    }
  }

  async function handleSelectBatch(batchId) {
    setSelectedBatchId(String(batchId))
    setError('')
    try {
      const [traceData, verifyData] = await Promise.all([
        traceBatch(Number(batchId)),
        verifyBatch(Number(batchId)),
      ])
      setTraceResult(traceData)
      setVerifyResult(verifyData)
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải trace batch.'))
    }
  }

  async function handleDeleteProcess(processId) {
    setError('')
    setSuccess('')
    try {
      await deleteSeasonProcess(processId)
      setSuccess('Đã xóa bước quy trình.')
      if (selectedSeasonId) {
        setSeasonTimeline(await getSeasonProcesses(Number(selectedSeasonId)))
      }
      if (editingProcessId === String(processId)) {
        resetProcessForm()
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể xóa bước quy trình.'))
    }
  }

  async function handleReorderProcess(processId, nextStepNo) {
    if (!toPositiveNumber(nextStepNo)) return
    setError('')
    setSuccess('')
    try {
      await reorderSeasonProcess(processId, nextStepNo)
      setSuccess('Đã đổi thứ tự bước quy trình.')
      if (selectedSeasonId) {
        setSeasonTimeline(await getSeasonProcesses(Number(selectedSeasonId)))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể đổi thứ tự bước quy trình.'))
    }
  }

  async function handleGenerateQr(batchId) {
    setError('')
    setSuccess('')
    try {
      await generateBatchQr(batchId)
      await handleSelectBatch(batchId)
      setSuccess('Đã tạo QR cho batch.')
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tạo QR.'))
    }
  }

  async function handleCopyQrUrl() {
    try {
      await copyToClipboard(traceResult?.qrInfo?.qrUrl)
      setSuccess('Đã copy đường dẫn QR.')
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể copy QR URL.'))
    }
  }

  async function handleMarkNotificationRead(notificationId) {
    setError('')
    setSuccess('')
    try {
      await markNotificationRead(notificationId)
      setSuccess('Đã đánh dấu notification là đã đọc.')
      await loadWorkspace({ preferredSeasonId: selectedSeasonId, preferredBatchId: selectedBatchId })
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể cập nhật notification.'))
    }
  }

  return (
    <section className="page-section farm-workspace-shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Farm business workspace</p>
          <h2>Trung tâm vận hành hoàn chỉnh cho farm</h2>
          <p>Gom profile, operations, listing, season, batch và traceability vào một workspace thống nhất để farm có thể chạy nghiệp vụ end-to-end.</p>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={() => loadWorkspace()} disabled={loading}>Làm mới</Button>
        </div>
      </div>

      <div className="feature-grid farm-summary-grid">
        <article className="status-card tone-success">
          <span className="summary-label">Farm status</span>
          <strong>{farm?.approvalStatus || farmContext?.approvalStatus || 'NOT_CREATED'}</strong>
          <p>{farm?.farmName || farmContext?.farmName || 'Chưa tạo farm profile'}</p>
        </article>
        <article className="status-card tone-primary">
          <span className="summary-label">Subscriptions</span>
          <strong>{summary.totalSubscriptions}</strong>
          <p>{summary.totalPackages} gói có thể đăng ký</p>
        </article>
        <article className="status-card tone-warning">
          <span className="summary-label">Listings</span>
          <strong>{summary.totalListings}</strong>
          <p>{summary.pendingRegistrations} listing registration đang chờ duyệt</p>
        </article>
        <article className="status-card">
          <span className="summary-label">Operations</span>
          <strong>{summary.totalSeasons}</strong>
          <p>{summary.totalBatches} batch đang nằm trong workspace</p>
        </article>
      </div>

      {loading ? <div className="glass-card">Đang tải Farm Business Workspace...</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="farm-workspace-grid top-gap">
        <article className="glass-card farm-workspace-panel farm-panel-wide">
          <div className="farm-panel-header">
            <div>
              <p className="eyebrow">Farm profile</p>
              <h3>Hồ sơ pháp lý và vận hành</h3>
            </div>
            <span className={`status-pill status-${(farm?.approvalStatus || 'pending').toLowerCase()}`}>{farm?.approvalStatus || 'PENDING'}</span>
          </div>

          <div className="content-grid compact-grid">
            <div className="business-card farm-info-card">
              <div>
                <strong>Approval</strong>
                <p>{farm?.approvalStatus || 'Chưa tạo hồ sơ'}</p>
                <p>Reviewer note: {farm?.reviewComment || 'Chưa có'}</p>
              </div>
            </div>
            <div className="business-card farm-info-card">
              <div>
                <strong>Certification</strong>
                <p>{farm?.certificationStatus || 'N/A'}</p>
                <p>Owner: {farm?.ownerName || 'Current FARM account'}</p>
              </div>
            </div>
          </div>

          <form className="form-grid top-gap" onSubmit={handleProfileSubmit}>
            <div className="grid-two">
              <TextInput label="Farm code" name="farmCode" value={profileForm.farmCode} onChange={handleProfileChange} required disabled={Boolean(farm)} />
              <TextInput label="Farm name" name="farmName" value={profileForm.farmName} onChange={handleProfileChange} required />
            </div>
            <div className="grid-two">
              <TextInput label="Business license" name="businessLicenseNo" value={profileForm.businessLicenseNo} onChange={handleProfileChange} required />
              <TextInput label="Province" name="province" value={profileForm.province} onChange={handleProfileChange} />
            </div>
            <TextInput label="Address" name="address" value={profileForm.address} onChange={handleProfileChange} />
            <TextAreaField label="Description" name="description" value={profileForm.description} onChange={handleProfileChange} />
            <Button type="submit" disabled={savingProfile}>{savingProfile ? 'Đang lưu...' : farm ? 'Cập nhật farm profile' : 'Tạo farm profile'}</Button>
          </form>
        </article>

        <article className="glass-card farm-workspace-panel">
          <div className="farm-panel-header">
            <div>
              <p className="eyebrow">Subscriptions</p>
              <h3>Gói dịch vụ và thanh toán</h3>
            </div>
          </div>

          <div className="form-grid">
            {packages.length === 0 ? <p>Chưa có gói dịch vụ.</p> : null}
            {packages.map((item) => (
              <div key={item.packageId} className="business-card">
                <div>
                  <strong>{item.packageName}</strong>
                  <p>{item.description || 'Không có mô tả'}</p>
                  <p>Mã gói: {item.packageCode}</p>
                  <p>Giá: {formatCurrency(item.price)}</p>
                </div>
                <Button onClick={() => handleSubscribe(item.packageId)} disabled={submittingPackageId === item.packageId}>
                  {submittingPackageId === item.packageId ? 'Đang đăng ký...' : 'Đăng ký'}
                </Button>
              </div>
            ))}
          </div>

          <div className="farm-subscription-strip top-gap">
            {subscriptions.length === 0 ? <p>Chưa có subscription.</p> : subscriptions.map((item) => (
              <button
                key={item.subscriptionId}
                type="button"
                className={`farm-chip ${String(activeSubscription?.subscriptionId) === String(item.subscriptionId) ? 'active' : ''}`}
                onClick={() => setSelectedSubscriptionId(String(item.subscriptionId))}
              >
                {item.packageName} • {item.status}
              </button>
            ))}
          </div>

          <form className="form-grid top-gap" onSubmit={handlePaymentSubmit}>
            <label className="field-group">
              <span className="field-label">Subscription</span>
              <select className="field-input" name="subscriptionId" value={paymentForm.subscriptionId} onChange={handlePaymentChange}>
                <option value="">Chọn subscription</option>
                {subscriptions.map((item) => (
                  <option key={item.subscriptionId} value={item.subscriptionId}>{item.packageName} ({item.status})</option>
                ))}
              </select>
            </label>
            <div className="grid-two">
              <TextInput label="Amount" name="amount" type="number" min="1" value={paymentForm.amount} onChange={handlePaymentChange} required />
              <label className="field-group">
                <span className="field-label">Method</span>
                <select className="field-input" name="method" value={paymentForm.method} onChange={handlePaymentChange}>
                  {paymentMethods.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </div>
            <div className="grid-two">
              <TextInput label="Transaction ref" name="transactionRef" value={paymentForm.transactionRef} onChange={handlePaymentChange} />
              <label className="field-group">
                <span className="field-label">Payment status</span>
                <select className="field-input" name="paymentStatus" value={paymentForm.paymentStatus} onChange={handlePaymentChange}>
                  {paymentStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </div>
            <Button type="submit" disabled={savingPayment}>{savingPayment ? 'Đang ghi nhận...' : 'Ghi nhận payment'}</Button>
          </form>

          <div className="form-grid top-gap">
            {payments.length === 0 ? <p>Chưa có payment subscription.</p> : payments.map((item) => (
              <div key={item.paymentId} className="business-card">
                <div>
                  <strong>{item.farmName || 'Farm payment'}</strong>
                  <p>{formatCurrency(item.amount)} • {item.method}</p>
                  <p>{item.paymentStatus} • {formatDateTime(item.paidAt)}</p>
                  <p>Ref: {item.transactionRef || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="farm-workspace-grid top-gap">
        <article className="glass-card farm-workspace-panel farm-panel-wide">
          <div className="farm-panel-header">
            <div>
              <p className="eyebrow">Operations</p>
              <h3>Season và quy trình canh tác</h3>
              <p>Quản lý mùa vụ, timeline canh tác và thao tác vận hành ngay trong workspace farm.</p>
            </div>
          </div>

          <div className="farm-ops-grid">
            <div className="form-grid">
              <h4>{editingSeasonId ? 'Cập nhật mùa vụ' : 'Tạo mùa vụ'}</h4>
              <form className="form-grid" onSubmit={handleSeasonSubmit}>
                <div className="grid-two">
                  <TextInput label="Farm ID" name="farmId" value={seasonForm.farmId} onChange={handleSeasonChange} required disabled={Boolean(farmContext?.farmId)} />
                  <label className="field-group">
                    <span className="field-label">Product</span>
                    <select className="field-input" name="productId" value={seasonForm.productId} onChange={handleSeasonChange}>
                      <option value="">Chọn sản phẩm</option>
                      {products.map((product) => (
                        <option key={product.productId} value={product.productId}>
                          {product.productCode ? `${product.productCode} - ` : ''}{product.productName}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="grid-two">
                  <TextInput label="Season code" name="seasonCode" value={seasonForm.seasonCode} onChange={handleSeasonChange} required />
                  <TextInput label="Farming method" name="farmingMethod" value={seasonForm.farmingMethod} onChange={handleSeasonChange} required />
                </div>
                <div className="grid-two">
                  <TextInput label="Start date" name="startDate" type="date" value={seasonForm.startDate} onChange={handleSeasonChange} required />
                  <TextInput label="Expected harvest date" name="expectedHarvestDate" type="date" value={seasonForm.expectedHarvestDate} onChange={handleSeasonChange} required />
                </div>
                <div className="grid-two">
                  <TextInput label="Actual harvest date" name="actualHarvestDate" type="date" value={seasonForm.actualHarvestDate} onChange={handleSeasonChange} />
                  <label className="field-group">
                    <span className="field-label">Season status</span>
                    <select className="field-input" name="seasonStatus" value={seasonForm.seasonStatus} onChange={handleSeasonChange}>
                      {seasonStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                </div>
                <div className="section-actions">
                  <Button type="submit" disabled={savingSeason}>{savingSeason ? 'Đang lưu...' : editingSeasonId ? 'Lưu cập nhật mùa vụ' : 'Tạo mùa vụ'}</Button>
                  <Button type="button" variant="secondary" onClick={resetSeasonForm}>Làm mới form</Button>
                </div>
              </form>
            </div>

            <div className="form-grid">
              <h4>Danh sách mùa vụ</h4>
              {seasons.length === 0 ? <p>Chưa có mùa vụ.</p> : seasons.map((season) => {
                const isActive = String(season.id) === String(selectedSeasonId)
                return (
                  <div key={season.id} className="business-card">
                    <div>
                      <strong>{season.seasonCode}</strong>
                      <p>Farm: {season.farmName} • Product: {season.productName || season.productId}</p>
                      <p>Method: {season.farmingMethod || 'N/A'}</p>
                      <p>Status: {season.seasonStatus}</p>
                    </div>
                    <div className="inline-actions">
                      <Button variant={isActive ? 'primary' : 'secondary'} onClick={() => handleSelectSeason(season.id)}>
                        {isActive ? 'Đang xem timeline' : 'Xem timeline'}
                      </Button>
                      <Button variant="secondary" onClick={() => fillSeason(season)}>Sửa</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="farm-ops-grid top-gap">
            <div className="form-grid">
              <h4>{editingProcessId ? 'Cập nhật bước quy trình' : 'Thêm bước quy trình'}</h4>
              <p>Mùa vụ đang chọn: <strong>{selectedSeason?.seasonCode || 'Chưa chọn'}</strong></p>
              <form className="form-grid" onSubmit={handleProcessSubmit}>
                <div className="grid-two">
                  <TextInput label="Step no" name="stepNo" type="number" min="1" value={processForm.stepNo} onChange={handleProcessChange} required />
                  <TextInput label="Step name" name="stepName" value={processForm.stepName} onChange={handleProcessChange} required />
                </div>
                <TextInput label="Performed at" name="performedAt" type="datetime-local" value={processForm.performedAt} onChange={handleProcessChange} required />
                <TextAreaField label="Description" name="description" value={processForm.description} onChange={handleProcessChange} />
                <TextInput label="Image URL" name="imageUrl" value={processForm.imageUrl} onChange={handleProcessChange} />
                <div className="section-actions">
                  <Button type="submit" disabled={savingProcess}>{savingProcess ? 'Đang lưu...' : editingProcessId ? 'Lưu bước quy trình' : 'Thêm bước quy trình'}</Button>
                  <Button type="button" variant="secondary" onClick={resetProcessForm}>Làm mới form</Button>
                </div>
              </form>
            </div>

            <div className="form-grid">
              <h4>Timeline quy trình</h4>
              {seasonTimeline?.steps?.length ? seasonTimeline.steps.map((process) => (
                <div key={process.id} className="business-card">
                  <div>
                    <strong>Bước {process.stepNo}: {process.stepName}</strong>
                    <p>Performed at: {formatDateTime(process.performedAt)}</p>
                    <p>Recorded by: {process.recordedByName || 'N/A'}</p>
                    <p>{process.description || 'Không có mô tả.'}</p>
                  </div>
                  <div className="inline-actions">
                    <Button variant="secondary" onClick={() => fillProcess(process)}>Sửa</Button>
                    <Button variant="secondary" onClick={() => handleReorderProcess(process.id, Math.max(1, (process.stepNo || 1) - 1))}>↑</Button>
                    <Button variant="secondary" onClick={() => handleReorderProcess(process.id, (process.stepNo || 1) + 1)}>↓</Button>
                    <Button variant="danger" onClick={() => handleDeleteProcess(process.id)}>Xóa</Button>
                  </div>
                </div>
              )) : <p>Chưa có quy trình cho mùa vụ này.</p>}
            </div>
          </div>
        </article>

        <article className="glass-card farm-workspace-panel">
          <div className="farm-panel-header">
            <div>
              <p className="eyebrow">Workflow</p>
              <h3>Notifications, reports, registrations</h3>
            </div>
          </div>

          <div className="form-grid">
            <div className="business-card farm-info-card">
              <div>
                <strong>Listing registrations</strong>
                <p>{registrations.length} yêu cầu</p>
              </div>
            </div>
            {registrations.map((item) => (
              <div key={item.registrationId} className="business-card">
                <div>
                  <strong>{item.listingTitle}</strong>
                  <p>{item.status} • Reviewer: {item.reviewedByName || 'Chưa xử lý'}</p>
                  <p>Ghi chú: {item.note || 'Không có'}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="form-grid top-gap">
            <h4>Notifications</h4>
            {notifications.length === 0 ? <p>Chưa có thông báo.</p> : notifications.map((item) => (
              <div key={item.notificationId} className="business-card">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                </div>
                <div className="inline-actions">
                  <span className={`status-pill status-${item.read ? 'active' : 'pending'}`}>{item.read ? 'Đã đọc' : 'Chưa đọc'}</span>
                  {!item.read ? <Button variant="secondary" onClick={() => handleMarkNotificationRead(item.notificationId)}>Đọc</Button> : null}
                </div>
              </div>
            ))}
          </div>

          <div className="form-grid top-gap">
            <h4>Reports</h4>
            {reports.length === 0 ? <p>Chưa có report.</p> : reports.map((item) => (
              <div key={item.reportId} className="business-card">
                <div>
                  <strong>{item.subject}</strong>
                  <p>{item.content}</p>
                  <p>Trạng thái: {item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="farm-workspace-grid top-gap">
        <article className="glass-card farm-workspace-panel farm-panel-wide">
          <div className="farm-panel-header">
            <div>
              <p className="eyebrow">Marketplace</p>
              <h3>Listing workspace</h3>
              <p>Tạo listing từ batch thật và gửi registration note để admin duyệt.</p>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleListingSubmit}>
            <label className="field-group">
              <span className="field-label">Batch</span>
              <select className="field-input" name="batchId" value={listingForm.batchId} onChange={handleListingChange}>
                <option value="">Chọn batch</option>
                {batches.map((batch) => (
                  <option key={batch.batchId} value={batch.batchId}>{batch.batchCode} • {batch.batchStatus}</option>
                ))}
              </select>
            </label>
            <div className="grid-two">
              <TextInput label="Title" name="title" value={listingForm.title} onChange={handleListingChange} required />
              <TextInput label="Unit" name="unit" value={listingForm.unit} onChange={handleListingChange} />
            </div>
            <div className="grid-two">
              <TextInput label="Price" name="price" type="number" min="1" value={listingForm.price} onChange={handleListingChange} required />
              <TextInput label="Quantity available" name="quantityAvailable" type="number" min="1" value={listingForm.quantityAvailable} onChange={handleListingChange} required />
            </div>
            <TextInput label="Image URL" name="imageUrl" value={listingForm.imageUrl} onChange={handleListingChange} />
            <TextAreaField label="Description" name="description" value={listingForm.description} onChange={handleListingChange} />
            {!editingListingId ? <TextAreaField label="Registration note for admin review" name="registrationNote" value={listingForm.registrationNote} onChange={handleListingChange} /> : null}
            {editingListingId ? (
              <label className="field-group">
                <span className="field-label">Listing status</span>
                <select className="field-input" name="status" value={listingForm.status || 'DRAFT'} onChange={handleListingChange}>
                  {listingStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            ) : null}
            <div className="section-actions">
              <Button type="submit" disabled={savingListing}>{savingListing ? 'Đang lưu...' : editingListingId ? 'Cập nhật listing' : 'Tạo listing'}</Button>
              <Button type="button" variant="secondary" onClick={resetListingForm}>Làm mới form</Button>
            </div>
          </form>

          <div className="form-grid top-gap">
            {listings.length === 0 ? <p>Chưa có listing.</p> : listings.map((item) => (
              <div key={item.listingId} className="business-card">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.productName || item.batchCode} • {formatCurrency(item.price)}</p>
                  <p>Available: {item.quantityAvailable} {item.unit || 'kg'}</p>
                  <p>Status: {item.status} • Approval: {item.approvalStatus || 'N/A'}</p>
                </div>
                <div className="inline-actions">
                  <Button variant="secondary" onClick={() => fillListingForm(item)}>Sửa</Button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card farm-workspace-panel">
          <div className="farm-panel-header">
            <div>
              <p className="eyebrow">Traceability</p>
              <h3>Batch, QR và blockchain verify</h3>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleBatchSubmit}>
            <div className="grid-two">
              <label className="field-group">
                <span className="field-label">Season</span>
                <select className="field-input" name="seasonId" value={batchForm.seasonId} onChange={handleBatchChange}>
                  <option value="">Chọn mùa vụ</option>
                  {seasons.map((season) => <option key={season.id} value={season.id}>{season.seasonCode}</option>)}
                </select>
              </label>
              <label className="field-group">
                <span className="field-label">Product</span>
                <select className="field-input" name="productId" value={batchForm.productId} onChange={handleBatchChange}>
                  <option value="">Chọn sản phẩm</option>
                  {products.map((product) => (
                    <option key={product.productId} value={product.productId}>
                      {product.productCode ? `${product.productCode} - ` : ''}{product.productName}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid-two">
              <TextInput label="Batch code" name="batchCode" value={batchForm.batchCode} onChange={handleBatchChange} required />
              <label className="field-group">
                <span className="field-label">Quality grade</span>
                <select className="field-input" name="qualityGrade" value={batchForm.qualityGrade} onChange={handleBatchChange}>
                  <option value="">Chọn chất lượng</option>
                  {qualityGrades.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
                </select>
              </label>
            </div>
            <div className="grid-two">
              <TextInput label="Harvest date" name="harvestDate" type="date" value={batchForm.harvestDate} onChange={handleBatchChange} required />
              <TextInput label="Expiry date" name="expiryDate" type="date" value={batchForm.expiryDate} onChange={handleBatchChange} required />
            </div>
            <div className="grid-two">
              <TextInput label="Quantity" name="quantity" type="number" min="1" value={batchForm.quantity} onChange={handleBatchChange} required />
              <TextInput label="Available quantity" name="availableQuantity" type="number" min="1" value={batchForm.availableQuantity} onChange={handleBatchChange} required />
            </div>
            <label className="field-group">
              <span className="field-label">Batch status</span>
              <select className="field-input" name="batchStatus" value={batchForm.batchStatus} onChange={handleBatchChange}>
                {batchStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <div className="section-actions">
              <Button type="submit" disabled={savingBatch}>{savingBatch ? 'Đang lưu...' : editingBatchId ? 'Cập nhật batch' : 'Tạo batch'}</Button>
              <Button type="button" variant="secondary" onClick={resetBatchForm}>Làm mới form</Button>
            </div>
          </form>

          <div className="form-grid top-gap">
            {batches.length === 0 ? <p>Chưa có batch.</p> : batches.map((batch) => {
              const isActive = String(batch.batchId) === String(selectedBatchId)
              return (
                <div key={batch.batchId} className="business-card">
                  <div>
                    <strong>{batch.batchCode}</strong>
                    <p>Quantity: {batch.availableQuantity}/{batch.quantity}</p>
                    <p>Status: {batch.batchStatus}</p>
                    <p>Harvest: {formatDate(batch.harvestDate)} • Expiry: {formatDate(batch.expiryDate)}</p>
                  </div>
                  <div className="inline-actions">
                    <Button variant="secondary" onClick={() => fillBatch(batch)}>Sửa</Button>
                    <Button variant="secondary" onClick={() => handleGenerateQr(batch.batchId)}>Tạo QR</Button>
                    <Button variant={isActive ? 'primary' : 'secondary'} onClick={() => handleSelectBatch(batch.batchId)}>
                      {isActive ? 'Đang xem trace' : 'Xem trace'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {traceResult?.batch ? (
            <div className="form-grid top-gap">
              <div className="business-card">
                <div>
                  <strong>{traceResult.batch.batchCode}</strong>
                  <p>Harvest: {formatDate(traceResult.batch.harvestDate)}</p>
                  <p>Quality: {traceResult.batch.qualityGrade}</p>
                  <p>Status: {traceResult.batch.batchStatus}</p>
                </div>
              </div>
              <div className="business-card">
                <div>
                  <strong>QR info</strong>
                  <p>Serial: {traceResult.qrInfo?.serialNo || 'Chưa tạo'}</p>
                  <p>URL: {traceResult.qrInfo?.qrUrl || 'Chưa tạo'}</p>
                  <div className="section-actions">
                    <Button type="button" variant="secondary" onClick={handleCopyQrUrl} disabled={!traceResult.qrInfo?.qrUrl}>Copy URL</Button>
                  </div>
                  {traceResult.qrInfo?.qrImageBase64 ? <img alt="QR batch" src={`data:image/png;base64,${traceResult.qrInfo.qrImageBase64}`} style={{ maxWidth: 180, marginTop: 12 }} /> : null}
                </div>
              </div>
              <div className="business-card">
                <div>
                  <strong>Blockchain verify</strong>
                  <p>Batch ID: {verifyResult?.batchId || selectedBatch?.batchId || 'N/A'}</p>
                  <p>Matched: {verifyResult?.matched ? 'YES' : 'NO'}</p>
                  <p>Local hash: {verifyResult?.localHash || 'N/A'}</p>
                  <p>On-chain hash: {verifyResult?.onChainHash || 'N/A'}</p>
                </div>
              </div>
            </div>
          ) : null}
        </article>
      </div>
    </section>
  )
}
