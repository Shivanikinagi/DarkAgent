import { useToast } from '../hooks/useToast'

const ICONS = {
  success: '✅',
  error: '❌',
  pending: '⏳',
  info: 'ℹ️',
}

const COLORS = {
  success: 'border-vault-green/40 bg-vault-green/10',
  error: 'border-red-500/40 bg-red-500/10',
  pending: 'border-vault-blue/40 bg-vault-blue/10',
  info: 'border-vault-slate/40 bg-vault-slate/10',
}

export default function Toast() {
  const { toasts, toast } = useToast()

  if (!toasts.length) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-xl animate-fade-in ${COLORS[t.type] || COLORS.info}`}
        >
          <span className="text-lg flex-shrink-0">{ICONS[t.type]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-vault-text leading-snug">{t.message}</p>
            {t.txHash && (
              <a
                href={`https://sepolia.basescan.org/tx/${t.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-vault-blue hover:underline mt-1 block truncate"
              >
                View on Basescan ↗
              </a>
            )}
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-vault-slate hover:text-vault-text flex-shrink-0 text-lg leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
