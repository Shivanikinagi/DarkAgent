import { truncateAddress, formatRelativeTime } from '../utils/format'

const TYPE_ICONS = {
  proposal: '⚡',
  verification: '🔍',
  execution: '✅',
  freeze: '🛑',
}

const STATUS_COLORS = {
  proposed: 'bg-vault-blue/20 text-vault-blue border-vault-blue/30',
  verified: 'bg-vault-green/20 text-vault-green border-vault-green/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  executed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

export default function ActivityFeedItem({ type, agentAddress, proposalId, status, timestamp, txHash }) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-vault-slate/5 transition-colors border border-transparent hover:border-vault-slate/10">
      <span className="text-lg flex-shrink-0 w-7 text-center">{TYPE_ICONS[type] || '•'}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-vault-text/80">{truncateAddress(agentAddress)}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[status] || 'bg-vault-slate/20 text-vault-slate border-vault-slate/30'}`}>
            {status?.toUpperCase()}
          </span>
        </div>
        <div className="text-xs text-vault-slate mt-0.5 capitalize">{type}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-vault-slate">{formatRelativeTime(timestamp)}</span>
        {txHash && (
          <a
            href={`https://sepolia.basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-vault-blue hover:text-vault-blue/80 text-xs"
            aria-label="View transaction"
          >
            ↗
          </a>
        )}
      </div>
    </div>
  )
}
