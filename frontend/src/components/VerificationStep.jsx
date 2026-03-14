import * as Tooltip from '@radix-ui/react-tooltip'

const STATUS_STYLES = {
  pending: 'border-vault-slate/30 bg-vault-slate/10 text-vault-slate',
  active: 'border-[#e879f9]/60 bg-[#e879f9]/10 text-[#e879f9] shadow-[0_0_12px_rgba(232,121,249,0.4)] animate-pulse',
  complete: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400',
  error: 'border-red-500/60 bg-red-500/10 text-red-400',
}

export default function VerificationStep({ id, label, icon, status, timeMs, error, tooltip }) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div className="flex flex-col items-center gap-2 cursor-default" data-testid={`step-${id}`}>
            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl transition-all duration-300 ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
              {status === 'complete' ? '✓' : status === 'error' ? '✗' : icon}
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-vault-text whitespace-nowrap">{label}</div>
              {(status === 'complete' || status === 'error') && timeMs !== undefined && (
                <div className="text-[10px] text-vault-slate">{timeMs}ms</div>
              )}
              {status === 'error' && error && (
                <div className="text-[10px] text-red-400 max-w-[80px] text-center leading-tight mt-0.5">{error}</div>
              )}
            </div>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-[#1a1d23] border border-vault-slate/30 text-vault-text text-xs px-3 py-2 rounded-lg shadow-xl max-w-[200px] z-50"
            sideOffset={8}
          >
            {tooltip}
            <Tooltip.Arrow className="fill-vault-slate/30" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
