const STATUS_DOT = {
  connected: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]',
  disconnected: 'bg-red-400',
  pending: 'bg-amber-400 animate-pulse',
}

const STATUS_LABEL = {
  connected: 'Connected',
  disconnected: 'Disconnected',
  pending: 'Pending',
}

export default function IntegrationCard({ name, logo, status, metric, description, learnMoreUrl }) {
  return (
    <div className="p-5 rounded-2xl border border-vault-slate/20 bg-[#1a1d23]/60 backdrop-blur-xl hover:border-vault-green/20 transition-all duration-300 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{logo}</span>
          <span className="font-semibold text-vault-text text-sm">{name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${STATUS_DOT[status] || STATUS_DOT.pending}`} />
          <span className="text-xs text-vault-slate">{STATUS_LABEL[status] || status}</span>
        </div>
      </div>
      {metric && (
        <div>
          <div className="text-xs text-vault-slate uppercase tracking-wider">{metric.label}</div>
          <div className="text-xl font-bold text-vault-text">{metric.value}</div>
        </div>
      )}
      <p className="text-xs text-vault-slate leading-relaxed">{description}</p>
      {learnMoreUrl && (
        <a
          href={learnMoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-vault-blue hover:underline self-start"
        >
          Learn More ↗
        </a>
      )}
    </div>
  )
}
