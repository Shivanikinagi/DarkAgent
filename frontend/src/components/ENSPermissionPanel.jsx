import { truncateAddress } from '../utils/format'

export default function ENSPermissionPanel({ ensName, records, agentAddress }) {
  if (!records?.isSet) {
    return (
      <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="font-semibold text-amber-400 mb-1">ENS Records Not Set</div>
            <p className="text-sm text-vault-slate leading-relaxed">
              No ENS permission records found for this agent. Set up ENS text records to define spending limits, slippage tolerance, and protocol whitelist.
            </p>
            <a
              href="https://app.ens.domains"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-xs text-vault-blue hover:underline"
            >
              Set up on app.ens.domains ↗
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 rounded-2xl border border-vault-slate/20 bg-[#1a1d23]/60 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-semibold text-vault-text">ENS Permissions</div>
          {ensName && <div className="text-xs text-vault-blue mt-0.5">{ensName}</div>}
          {agentAddress && <div className="font-mono text-xs text-vault-slate mt-0.5">{truncateAddress(agentAddress)}</div>}
        </div>
        <a
          href="https://app.ens.domains"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-lg border border-vault-blue/30 text-vault-blue hover:bg-vault-blue/10 transition-colors"
        >
          Edit ENS Records ↗
        </a>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-vault-slate/10">
          <span className="text-sm text-vault-slate">max_spend</span>
          <span className="font-mono text-sm text-vault-text">{records.maxSpend} ETH</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-vault-slate/10">
          <span className="text-sm text-vault-slate">slippage</span>
          <span className="font-mono text-sm text-vault-text">{records.slippage}%</span>
        </div>
        <div className="py-2">
          <span className="text-sm text-vault-slate block mb-2">protocols</span>
          <div className="flex flex-wrap gap-2">
            {records.protocols?.map((p) => (
              <button
                key={p}
                className="px-3 py-1 rounded-full bg-vault-green/10 text-vault-green text-xs border border-vault-green/20 hover:bg-vault-green/20 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        {records.lastUpdated && (
          <div className="text-xs text-vault-slate pt-1">
            Last updated: {new Date(records.lastUpdated * 1000).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  )
}
