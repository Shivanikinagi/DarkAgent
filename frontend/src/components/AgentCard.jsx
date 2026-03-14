import { useState } from 'react'
import { truncateAddress, formatEth } from '../utils/format'

const STATUS_BADGE = {
  active: 'bg-vault-green/20 text-vault-green border-vault-green/30',
  frozen: 'bg-red-500/20 text-red-400 border-red-500/30',
  expired: 'bg-vault-slate/20 text-vault-slate border-vault-slate/30',
}

export default function AgentCard({ address, status, spendLimit, dailyLimit, dailySpent, expiresAt, capabilities = [], ensRecords, onRevoke }) {
  const [ensOpen, setEnsOpen] = useState(false)

  const progress = dailyLimit > 0n
    ? Math.min(100, Math.max(0, Number((dailySpent * 100n) / dailyLimit)))
    : 0

  const expiresDate = expiresAt ? new Date(expiresAt * 1000).toLocaleDateString() : '—'

  return (
    <div className={`p-5 rounded-2xl border bg-[#1a1d23]/60 backdrop-blur-xl transition-all duration-300 ${
      status === 'frozen'
        ? 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-pulse'
        : 'border-vault-slate/20 hover:border-vault-green/20'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="font-mono text-sm text-vault-text">{truncateAddress(address)}</div>
          <div className="text-xs text-vault-slate mt-0.5">Expires {expiresDate}</div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex-shrink-0 ${STATUS_BADGE[status] || STATUS_BADGE.expired}`}>
          {status?.toUpperCase()}
        </span>
      </div>

      {/* Daily allowance */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-vault-slate mb-1">
          <span>Daily Allowance</span>
          <span>{formatEth(dailySpent)} / {formatEth(dailyLimit)} ETH</span>
        </div>
        <div className="h-1.5 rounded-full bg-vault-slate/20 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progress > 80 ? 'bg-red-400' : 'bg-vault-green'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Capabilities */}
      {capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {capabilities.map((cap) => (
            <span key={cap} className="text-[10px] px-2 py-0.5 rounded-full bg-vault-blue/10 text-vault-blue border border-vault-blue/20">
              {cap}
            </span>
          ))}
        </div>
      )}

      {/* ENS Records */}
      {ensRecords?.isSet && (
        <div className="mb-4">
          <button
            onClick={() => setEnsOpen((v) => !v)}
            className="text-xs text-vault-blue hover:underline flex items-center gap-1"
          >
            {ensOpen ? '▾' : '▸'} ENS Permissions
          </button>
          {ensOpen && (
            <div className="mt-2 p-3 rounded-xl bg-vault-slate/5 border border-vault-slate/10 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-vault-slate">max_spend</span>
                <span className="text-vault-text font-mono">{ensRecords.maxSpend} ETH</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-vault-slate">slippage</span>
                <span className="text-vault-text font-mono">{ensRecords.slippage}%</span>
              </div>
              <div className="text-xs">
                <span className="text-vault-slate">protocols</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ensRecords.protocols?.map((p) => (
                    <span key={p} className="px-1.5 py-0.5 rounded bg-vault-green/10 text-vault-green text-[10px] border border-vault-green/20">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {onRevoke && (
        <button
          onClick={() => onRevoke(address)}
          className="w-full py-2 rounded-xl border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-colors"
        >
          Revoke Agent
        </button>
      )}
    </div>
  )
}
