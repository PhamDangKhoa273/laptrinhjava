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

function formatDateTime(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString('vi-VN')
}

function canRetryGovernance(tx) {
  return tx?.governanceStatus === 'FAILED' && tx?.txStatus !== 'DISABLED'
}

function traceKeyword(item, verify) {
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

export function AdminBlockchainTracePage() {
  const [batches, setBatches] = useState([])
  const [verifyMap, setVerifyMap] = useState({})
  const [governanceConfig, setGovernanceConfig] = useState(null)
  const [governanceTransactions, setGovernanceTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [governanceBusy, setGovernanceBusy] = useState(false)
  const [error, setError] = useState('')
  const [governanceMessage, setGovernanceMessage] = useState('')
  const [lastAction, setLastAction] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedTraceId, setSelectedTraceId] = useState(null)
  const [contractAddress, setContractAddress] = useState('')

  async function loadGovernanceData() {
    const [config, transactions] = await Promise.all([
      getBlockchainGovernanceConfig(),
      getBlockchainTransactions(),
    ])
    setGovernanceConfig(config)
    setGovernanceTransactions(normalizeList(transactions))
    setContractAddress(config?.contractAddress && config.contractAddress !== 'N/A' ? config.contractAddress : '')
    return config
  }

  async function loadTraceData() {
    try {
      setLoading(true)
      setError('')
      setGovernanceMessage('')
      const config = await loadGovernanceData()
      const nextBatches = normalizeList(await getBatches())
      setBatches(nextBatches)
      if (!selectedTraceId && nextBatches.length > 0) setSelectedTraceId(getBatchId(nextBatches[0]))

      const nextVerifyMap = {}
      if (config?.active) {
        const results = await Promise.allSettled(
          nextBatches.map(async (batch) => [getBatchId(batch), await verifyBatch(getBatchId(batch))]),
        )
        results.forEach((result, index) => {
          const id = getBatchId(nextBatches[index])
          nextVerifyMap[id] = result.status === 'fulfilled'
            ? result.value[1]
            : { error: true, message: result.reason?.message || 'VERIFY_ERROR' }
        })
      }
      setVerifyMap(nextVerifyMap)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không tải được dữ liệu blockchain trace.')
    } finally {
      setLoading(false)
    }
  }

  async function handleContractAction(actionType, dryRun) {
    try {
      setGovernanceBusy(true)
      setError('')
      setGovernanceMessage('')
      setLastAction({ actionType, status: 'PROCESSING', note: 'Đang gửi yêu cầu governance...' })
      const result = await deploySmartContract({
        dryRun,
        actionType,
        contractAddress: contractAddress.trim() || undefined,
      })
      const status = result?.deploymentStatus || (result?.active ? 'READY' : 'NEEDS_CONFIG')
      const note = result?.note || `Đã ghi nhận thao tác ${actionType}.`
      setLastAction({ actionType, status, note, contractAddress: result?.contractAddress })
      setGovernanceMessage(`${actionType}: ${status}. ${note}`)
      await loadGovernanceData()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không xử lý được hợp đồng thông minh.')
      setLastAction({ actionType, status: 'ERROR', note: err?.response?.data?.message || err?.message || 'Không xử lý được hợp đồng thông minh.' })
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
      setGovernanceMessage('Đã lên lịch retry governance transaction.')
      await loadGovernanceData()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không retry được transaction.')
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
      const matchesKeyword = !keyword || traceKeyword(item, verify).includes(keyword)
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
    const pending = batches.length - matched - mismatch - errors
    return { total: batches.length, matched, mismatch, errors, pending }
  }, [batches, verifyMap])

  const missingRequirements = governanceConfig?.missingRequirements || []
  const readinessScore = governanceConfig?.readinessScore ?? 0
  const failedGovernanceTransactions = governanceTransactions.filter(canRetryGovernance)

  return (
    <section className="page-section admin-page admin-blockchain-page">
      <div className="section-heading">
        <div>
          <span className="feature-badge">Smart contract governance</span>
          <h2>Quản lý hợp đồng thông minh</h2>
          <p className="muted-inline">Triển khai, cập nhật, quản lý hợp đồng traceability và xác thực dữ liệu truy xuất nguồn gốc trên VeChainThor.</p>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadTraceData} disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới'}</Button>
          <Button onClick={() => handleContractAction('VALIDATE', true)} disabled={governanceBusy}>{governanceBusy ? 'Đang xử lý...' : 'Kiểm tra cấu hình'}</Button>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {governanceMessage ? <div className="alert alert-success">{governanceMessage}</div> : null}

      <div className="status-grid admin-overview-grid">
        <article className="status-card"><span>Tổng trace</span><strong>{metrics.total}</strong></article>
        <article className="status-card"><span>Đã xác thực</span><strong>{metrics.matched}</strong></article>
        <article className="status-card"><span>Chưa kiểm tra</span><strong>{metrics.pending}</strong></article>
        <article className="status-card"><span>Lỗi verify</span><strong>{metrics.errors}</strong></article>
        <article className="status-card"><span>Governance score</span><strong>{readinessScore}/100</strong></article>
      </div>

      <div className="admin-blockchain-workspace">
        <aside className="glass-card admin-blockchain-list-card">
          <h3>Hợp đồng thông minh</h3>
          <div className="admin-blockchain-info-grid">
            <div><span>Tên contract</span><strong>{governanceConfig?.contractName || 'BICAP Traceability'}</strong></div>
            <div><span>Network</span><strong>{governanceConfig?.contractNetwork || 'VeChainThor'}</strong></div>
            <div><span>Phiên bản</span><strong>{governanceConfig?.contractVersion || 'v1'}</strong></div>
            <div><span>Trạng thái</span><strong>{governanceConfig?.deploymentStatus || 'LOADING'}</strong></div>
            <div><span>Ghi on-chain</span><strong>{governanceConfig?.writeMode ? 'Sẵn sàng' : 'Cần cấu hình key'}</strong></div>
            <div><span>Contract</span><strong>{shortHash(governanceConfig?.contractAddress)}</strong></div>
          </div>

          <div className="admin-form-panel">
            <label className="form-field">
              <span className="form-label">Địa chỉ hợp đồng</span>
              <input className="form-input" value={contractAddress} onChange={(event) => setContractAddress(event.target.value)} placeholder="0x..." />
            </label>
            <div className="inline-actions top-gap">
              <Button onClick={() => handleContractAction('DEPLOY', false)} disabled={governanceBusy}>Triển khai</Button>
              <Button variant="secondary" onClick={() => handleContractAction('UPDATE', false)} disabled={governanceBusy}>Cập nhật</Button>
              <Button variant="secondary" onClick={() => handleContractAction('MANAGE', false)} disabled={governanceBusy}>Quản lý</Button>
            </div>
            {lastAction ? (
              <div className="alert alert-success top-gap">
                <strong>{lastAction.actionType}</strong>: {lastAction.status}. {lastAction.note}
              </div>
            ) : null}
            {!governanceConfig?.active ? (
              <div className="alert alert-error top-gap">
                Chưa thể verify trace vì thiếu cấu hình blockchain. Bấm "Kiểm tra cấu hình" để xem thiếu gì.
              </div>
            ) : null}
          </div>

          <div className="admin-blockchain-checklist">
            <h3>Điều kiện governance</h3>
            <ul className="feature-list">
              {missingRequirements.length === 0 ? <li className="is-ok">Đủ cấu hình tối thiểu cho contract governance.</li> : missingRequirements.map((item) => <li className="is-warning" key={item}>Thiếu {item}</li>)}
              <li className={governanceConfig?.safeMode ? 'is-warning' : 'is-ok'}>{governanceConfig?.safeMode ? 'Chưa có signing key để ghi on-chain.' : 'Signing key sẵn sàng.'}</li>
            </ul>
          </div>

          <h3>Dữ liệu trace</h3>
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
              const status = getVerifyStatus(verifyMap[id])
              return (
                <button key={id} type="button" className={`admin-user-item admin-blockchain-item ${String(id) === String(getBatchId(selectedTrace)) ? 'is-selected' : ''}`} onClick={() => setSelectedTraceId(id)}>
                  <div className="admin-user-item-main"><strong className="admin-user-name">{getTraceCode(item)}</strong><span className="admin-user-email">Batch: {item.batchCode || `#${id}`}</span></div>
                  <div className="admin-user-item-meta"><span className={statusClass(status)}>{status}</span><span className="admin-user-id">#{id}</span></div>
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
                <div><span className="feature-badge">Trace verify</span><h3>{getTraceCode(selectedTrace)}</h3><p>Batch: {selectedTrace.batchCode || `#${getBatchId(selectedTrace)}`}</p></div>
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
            </>
          ) : <p className="muted-inline">Chưa có blockchain trace để hiển thị.</p>}

          <div className="admin-blockchain-checklist">
            <h3>Lịch sử hợp đồng / governance</h3>
            <ul className="feature-list">
              {governanceTransactions.slice(0, 10).map((tx) => (
                <li className={tx.governanceStatus === 'FAILED' ? 'is-warning' : 'is-ok'} key={tx.txId || `${tx.actionType}-${tx.createdAt}`}>
                  <strong>{tx.actionType || tx.relatedEntityType}</strong> · {tx.governanceStatus || tx.txStatus || 'UNKNOWN'} · {formatDateTime(tx.createdAt)}
                  {canRetryGovernance(tx) ? <Button variant="secondary" onClick={() => handleRetry(tx)} disabled={governanceBusy}>Retry</Button> : null}
                </li>
              ))}
              {!loading && governanceTransactions.length === 0 ? <li className="is-warning">Chưa có lịch sử governance.</li> : null}
              {failedGovernanceTransactions.length > 0 ? <li className="is-warning">Có {failedGovernanceTransactions.length} transaction cần retry.</li> : null}
            </ul>
          </div>
        </main>
      </div>
    </section>
  )
}
