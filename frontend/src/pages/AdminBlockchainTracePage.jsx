import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import {
  deploySmartContract,
  getBlockchainGovernanceConfig,
  getBlockchainTransactions,
  retryBlockchainTransaction,
} from '../services/adminService.js'
import { getBatches, verifyBatch } from '../services/phase3Service.js'

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.batches)) return payload.batches
  return []
}

function getBatchId(item) {
  return item?.batchId || item?.id || item?.batchCode || 'N/A'
}

function getTraceCode(item) {
  return item?.traceCode || item?.batchCode || `BATCH-${getBatchId(item)}`
}

function getVerifyStatus(record) {
  if (!record) return 'PENDING'
  if (record.error) return 'ERROR'
  return record.matched ? 'MATCHED' : 'MISMATCH'
}

function statusClass(status) {
  return `status-pill status-${String(status || 'pending').toLowerCase()}`
}

function shortHash(value) {
  if (!value) return 'N/A'
  const text = String(value)
  return text.length > 22 ? `${text.slice(0, 12)}...${text.slice(-8)}` : text
}

function getTraceKeyword(item, verify) {
  return [
    item?.batchCode,
    item?.traceCode,
    item?.blockchainTxHash,
    item?.txHash,
    verify?.localHash,
    verify?.onChainHash,
    getVerifyStatus(verify),
  ].filter(Boolean).join(' ').toLowerCase()
}

function formatDateTime(value) {
  if (!value) return 'N/A'
  try {
    return new Date(value).toLocaleString('vi-VN')
  } catch {
    return String(value)
  }
}

export function AdminBlockchainTracePage() {
  const [batches, setBatches] = useState([])
  const [verifyMap, setVerifyMap] = useState({})
  const [governanceConfig, setGovernanceConfig] = useState(null)
  const [governanceTransactions, setGovernanceTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [governanceBusy, setGovernanceBusy] = useState(false)
  const [error, setError] = useState('')
  const [governanceMessage, setGovernanceMessage] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedTraceId, setSelectedTraceId] = useState(null)

  async function loadGovernanceData() {
    const [config, transactions] = await Promise.all([
      getBlockchainGovernanceConfig(),
      getBlockchainTransactions(),
    ])
    setGovernanceConfig(config)
    setGovernanceTransactions(normalizeList(transactions))
  }

  async function loadTraceData() {
    try {
      setLoading(true)
      setError('')
      setGovernanceMessage('')
      const nextBatches = normalizeList(await getBatches())
      setBatches(nextBatches)
      if (!selectedTraceId && nextBatches.length > 0) setSelectedTraceId(getBatchId(nextBatches[0]))

      const results = await Promise.allSettled(
        nextBatches.map(async (batch) => [getBatchId(batch), await verifyBatch(getBatchId(batch))]),
      )
      const nextVerifyMap = {}
      results.forEach((result, index) => {
        const id = getBatchId(nextBatches[index])
        if (result.status === 'fulfilled') {
          nextVerifyMap[id] = result.value[1]
        } else {
          nextVerifyMap[id] = { error: true, message: result.reason?.message || 'VERIFY_ERROR' }
        }
      })
      setVerifyMap(nextVerifyMap)
      await loadGovernanceData()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không tải được dữ liệu blockchain trace.')
    } finally {
      setLoading(false)
    }
  }

  async function handleValidateGovernance() {
    try {
      setGovernanceBusy(true)
      setGovernanceMessage('')
      const result = await deploySmartContract({ dryRun: true })
      setGovernanceMessage(result?.note || 'Đã kiểm tra readiness governance.')
      await loadGovernanceData()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không validate được governance.')
    } finally {
      setGovernanceBusy(false)
    }
  }

  async function handleRetry(transaction) {
    if (!transaction?.relatedEntityType || transaction?.relatedEntityId == null) return
    try {
      setGovernanceBusy(true)
      setGovernanceMessage('')
      await retryBlockchainTransaction(transaction.relatedEntityType, transaction.relatedEntityId)
      setGovernanceMessage('Đã schedule retry cho governance transaction.')
      await loadGovernanceData()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không schedule retry được transaction.')
    } finally {
      setGovernanceBusy(false)
    }
  }

  useEffect(() => {
    loadTraceData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredTraces = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return batches.filter((item) => {
      const verify = verifyMap[getBatchId(item)]
      const status = getVerifyStatus(verify)
      const matchesStatus = statusFilter === 'ALL' || status === statusFilter
      const matchesKeyword = !keyword || getTraceKeyword(item, verify).includes(keyword)
      return matchesStatus && matchesKeyword
    })
  }, [batches, verifyMap, search, statusFilter])

  const selectedTrace = useMemo(
    () => batches.find((item) => String(getBatchId(item)) === String(selectedTraceId)) || filteredTraces[0] || null,
    [batches, filteredTraces, selectedTraceId],
  )

  const selectedVerify = selectedTrace ? verifyMap[getBatchId(selectedTrace)] : null

  const metrics = useMemo(() => {
    const records = batches.map((item) => verifyMap[getBatchId(item)])
    const matched = records.filter((item) => getVerifyStatus(item) === 'MATCHED').length
    const mismatch = records.filter((item) => getVerifyStatus(item) === 'MISMATCH').length
    const errors = records.filter((item) => getVerifyStatus(item) === 'ERROR').length
    const pending = records.filter((item) => getVerifyStatus(item) === 'PENDING').length
    return { total: batches.length, matched, mismatch, errors, pending }
  }, [batches, verifyMap])

  const missingRequirements = governanceConfig?.missingRequirements || []
  const readinessScore = governanceConfig?.readinessScore ?? 0
  const failedGovernanceTransactions = governanceTransactions.filter((tx) => tx.governanceStatus === 'FAILED')

  return (
    <section className="page-section admin-page admin-blockchain-page">
      <div className="section-heading">
        <div>
          <span className="feature-badge">VeChainThor governance · production-safe</span>
          <h2>Quản lý blockchain trace</h2>
          <p className="muted-inline">
            Màn hình này xác thực hash lô hàng, kiểm tra readiness VeChainThor và ghi nhận governance evidence.
            Contract production không bị tự động deploy hoặc mutate từ UI này.
          </p>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadTraceData} disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới'}</Button>
          <Button onClick={handleValidateGovernance} disabled={governanceBusy}>{governanceBusy ? 'Đang xử lý...' : 'Validate governance'}</Button>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {governanceMessage ? <div className="alert alert-success">{governanceMessage}</div> : null}

      <div className="status-grid admin-overview-grid">
        <article className="status-card"><span>Tổng trace</span><strong>{metrics.total}</strong></article>
        <article className="status-card"><span>Đã xác thực</span><strong>{metrics.matched}</strong></article>
        <article className="status-card"><span>Hash không khớp</span><strong>{metrics.mismatch}</strong></article>
        <article className="status-card"><span>Lỗi verify</span><strong>{metrics.errors}</strong></article>
        <article className="status-card"><span>Governance score</span><strong>{readinessScore}/100</strong></article>
      </div>

      <div className="admin-blockchain-workspace">
        <aside className="glass-card admin-blockchain-list-card">
          <h3>Governance readiness</h3>
          <div className="admin-blockchain-info-grid">
            <div><span>Network</span><strong>{governanceConfig?.contractNetwork || 'VeChainThor'}</strong></div>
            <div><span>Runtime</span><strong>{governanceConfig?.deploymentStatus || 'LOADING'}</strong></div>
            <div><span>Mode</span><strong>{governanceConfig?.writeMode ? 'WRITE READY' : 'SAFE / READ-ONLY'}</strong></div>
            <div><span>Contract</span><strong>{shortHash(governanceConfig?.contractAddress)}</strong></div>
          </div>
          <div className="admin-blockchain-checklist">
            <h3>Yêu cầu cấu hình</h3>
            <ul className="feature-list">
              {missingRequirements.length === 0 ? (
                <li className="is-ok">Đã đủ cấu hình tối thiểu cho governance read/verify.</li>
              ) : missingRequirements.map((item) => (
                <li className="is-warning" key={item}>Thiếu {item}</li>
              ))}
              <li className={governanceConfig?.safeMode ? 'is-warning' : 'is-ok'}>
                {governanceConfig?.safeMode ? 'Safe mode: không ghi on-chain nếu thiếu signing key.' : 'Write mode đã sẵn sàng qua cấu hình signing.'}
              </li>
            </ul>
          </div>

          <h3>Danh sách trace</h3>
          <div className="admin-users-filters">
            <input className="form-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm trace/batch/hash" />
            <select className="form-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="ALL">Tất cả trạng thái</option>
              <option value="MATCHED">MATCHED</option>
              <option value="MISMATCH">MISMATCH</option>
              <option value="ERROR">ERROR</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>

          <div className="admin-blockchain-items">
            {filteredTraces.map((item) => {
              const id = getBatchId(item)
              const verify = verifyMap[id]
              const status = getVerifyStatus(verify)
              const isSelected = String(id) === String(getBatchId(selectedTrace))
              return (
                <button
                  key={id}
                  type="button"
                  className={`admin-user-item admin-blockchain-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedTraceId(id)}
                >
                  <div className="admin-user-item-main">
                    <strong className="admin-user-name">{getTraceCode(item)}</strong>
                    <span className="admin-user-email">Batch: {item.batchCode || `#${id}`}</span>
                  </div>
                  <div className="admin-user-item-meta">
                    <div className="admin-user-item-meta-left"><span className={statusClass(status)}>{status}</span></div>
                    <span className="admin-user-id">#{id}</span>
                  </div>
                </button>
              )
            })}
            {!loading && filteredTraces.length === 0 ? <p className="muted-inline">Chưa có trace phù hợp.</p> : null}
          </div>
        </aside>

        <main className="glass-card admin-blockchain-detail-card">
          {selectedTrace ? (
            <>
              <div className="admin-blockchain-detail-head">
                <div>
                  <span className="feature-badge">Trace verify</span>
                  <h3>{getTraceCode(selectedTrace)}</h3>
                  <p>Batch: {selectedTrace.batchCode || `#${getBatchId(selectedTrace)}`}</p>
                </div>
                <span className={statusClass(getVerifyStatus(selectedVerify))}>{getVerifyStatus(selectedVerify)}</span>
              </div>

              <div className="admin-blockchain-info-grid">
                <div><span>Local hash</span><strong>{shortHash(selectedVerify?.localHash)}</strong></div>
                <div><span>On-chain hash</span><strong>{shortHash(selectedVerify?.onChainHash)}</strong></div>
                <div><span>Tx hash</span><strong>{shortHash(selectedTrace.blockchainTxHash || selectedTrace.txHash || selectedVerify?.txHash)}</strong></div>
                <div><span>Block number</span><strong>{selectedVerify?.blockNumber || selectedTrace.blockNumber || 'N/A'}</strong></div>
                <div><span>Batch ID</span><strong>#{getBatchId(selectedTrace)}</strong></div>
                <div><span>Entity type</span><strong>BATCH</strong></div>
              </div>

              <div className="admin-blockchain-checklist">
                <h3>Kiểm tra trace</h3>
                <ul className="feature-list">
                  <li className={selectedTrace.blockchainTxHash || selectedTrace.txHash || selectedVerify?.txHash ? 'is-ok' : 'is-warning'}>
                    {selectedTrace.blockchainTxHash || selectedTrace.txHash || selectedVerify?.txHash ? 'Đã có tx hash.' : 'Thiếu tx hash blockchain.'}
                  </li>
                  <li className={selectedVerify?.localHash ? 'is-ok' : 'is-warning'}>
                    {selectedVerify?.localHash ? 'Đã có local hash.' : 'Chưa có local hash.'}
                  </li>
                  <li className={selectedVerify?.matched ? 'is-ok' : 'is-warning'}>
                    {selectedVerify?.matched ? 'Local hash khớp on-chain hash.' : 'Local hash chưa khớp hoặc chưa xác thực on-chain.'}
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <p className="muted-inline">Chưa có blockchain trace để hiển thị.</p>
          )}

          <div className="admin-blockchain-checklist">
            <h3>Governance transaction history</h3>
            <ul className="feature-list">
              {governanceTransactions.slice(0, 8).map((tx) => (
                <li className={tx.governanceStatus === 'FAILED' ? 'is-warning' : 'is-ok'} key={tx.txId || `${tx.relatedEntityType}-${tx.createdAt}`}>
                  <strong>{tx.actionType || tx.relatedEntityType}</strong> · {tx.governanceStatus || tx.txStatus || 'UNKNOWN'} · {formatDateTime(tx.createdAt)}
                  {tx.governanceStatus === 'FAILED' ? (
                    <Button variant="secondary" onClick={() => handleRetry(tx)} disabled={governanceBusy}>Retry</Button>
                  ) : null}
                </li>
              ))}
              {!loading && governanceTransactions.length === 0 ? <li className="is-warning">Chưa có governance transaction evidence.</li> : null}
              {failedGovernanceTransactions.length > 0 ? <li className="is-warning">Có {failedGovernanceTransactions.length} transaction cần retry.</li> : null}
            </ul>
          </div>
        </main>
      </div>
    </section>
  )
}
