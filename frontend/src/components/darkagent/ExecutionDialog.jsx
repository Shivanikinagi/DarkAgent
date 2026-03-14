import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Wallet, X } from 'lucide-react'
import { StatusBadge } from './Ui'

export function ExecutionDialog({ open, onOpenChange, blink, analysis, execution, onConfirm, confirming }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <AnimatePresence>
          <Dialog.Overlay asChild>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            />
          </Dialog.Overlay>
          <Dialog.Content asChild>
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              className="fixed left-1/2 top-1/2 z-[60] w-[min(720px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-[30px] border border-white/10 bg-[#0c1118]/95 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.45)]"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Dialog.Title className="text-2xl font-semibold text-white">Execution Preview</Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm text-slate-400">
                    Review the DarkAgent-approved trade before sending it to your wallet.
                  </Dialog.Description>
                </div>
                <Dialog.Close className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:text-white">
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Trade</div>
                  <div className="mt-3 text-lg font-semibold text-white">
                    {blink?.tokenIn} to {blink?.tokenOut}
                  </div>
                  <div className="mt-2 text-sm text-slate-400">
                    {blink?.action} on {blink?.protocol} - {blink?.chain}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-500">DarkAgent Verdict</div>
                  <div className="mt-3 flex items-center gap-3">
                    <StatusBadge status={analysis?.status || 'safe'}>{analysis?.status || 'safe'}</StatusBadge>
                    <div className="text-sm text-slate-300">Score {analysis?.score || '--'}</div>
                  </div>
                </div>
              </div>

              {!execution ? (
                <div className="mt-6 rounded-[28px] border border-white/10 bg-[#0b1016] p-5">
                  <div className="flex items-center gap-3 text-white">
                    <Wallet className="h-5 w-5 text-vault-green" />
                    <div className="text-lg font-semibold">Wallet confirmation</div>
                  </div>
                  <div className="mt-3 text-sm leading-6 text-slate-300">
                    You are about to execute the {analysis?.status === 'downsized' ? 'rewritten safe Blink' : 'approved Blink'} through DarkAgent.
                  </div>
                  <button
                    onClick={onConfirm}
                    disabled={confirming}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-vault-green px-5 py-3 text-sm font-semibold text-black transition hover:bg-vault-green/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Wallet className="h-4 w-4" /> {confirming ? 'Confirming...' : 'Confirm Execution'}
                  </button>
                </div>
              ) : (
                <div className="mt-6 rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-5">
                  <div className="flex items-center gap-3 text-emerald-100">
                    <CheckCircle2 className="h-5 w-5" />
                    <div className="text-lg font-semibold">Execution confirmed</div>
                  </div>
                  <div className="mt-3 text-sm leading-6 text-emerald-50/90">
                    The Blink was routed through DarkAgent and returned a mock settlement receipt.
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-emerald-50/90">
                    <div>Transaction ID: {execution.txid}</div>
                    <div>Stealth address: {execution.stealthAddress}</div>
                  </div>
                </div>
              )}
            </motion.div>
          </Dialog.Content>
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
