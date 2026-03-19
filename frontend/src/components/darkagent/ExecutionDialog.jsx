import * as Dialog from '@radix-ui/react-dialog'
import { CheckCircle2, ExternalLink, Wallet, X } from 'lucide-react'
import { formatUsd } from '../../lib/product'
import { StatusBadge } from './Ui'

export function ExecutionDialog({ open, onOpenChange, blink, analysis, execution, onConfirm, confirming, canConfirm = true }) {
  const walletApproval = execution?.walletApproval
  const settlement = execution?.execution
  const blocked = analysis?.status === 'blocked'

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 md:items-center">
          <div className="flex w-full max-w-[640px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0c1118]/95 p-4 shadow-[0_40px_120px_rgba(0,0,0,0.45)] md:max-h-[calc(100vh-40px)] md:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Dialog.Title className="text-xl font-semibold text-white">DarkAgent Handoff</Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-slate-400">DarkAgent either blocks the Blink here or forwards the approved action to the wallet.</Dialog.Description>
              </div>
              <Dialog.Close className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:text-white">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Blink request</div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {blink?.tokenIn} to {blink?.tokenOut}
                </div>
                <div className="mt-1.5 text-sm text-slate-400">
                  {blink?.action} on {blink?.protocol} / {blink?.chain}
                </div>
                <div className="mt-2 text-sm text-slate-300">Spend {formatUsd(blink?.amount)}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">DarkAgent verdict</div>
                <div className="mt-2 flex items-center gap-3">
                  <StatusBadge status={analysis?.status || 'safe'}>{analysis?.status || 'safe'}</StatusBadge>
                  <div className="text-sm text-slate-300">Risk {analysis?.score || '--'}</div>
                </div>
                <div className="mt-2 text-sm text-slate-300">{analysis?.summary || 'Policy checks completed.'}</div>
              </div>
            </div>

            {!execution ? (
              <div className="mt-4 rounded-[24px] border border-white/10 bg-[#0b1016] p-4">
                <div className="flex items-center gap-3 text-white">
                  <Wallet className="h-4.5 w-4.5 text-vault-green" />
                  <div className="text-base font-semibold">{blocked ? 'Blocked before wallet' : 'Forwarding to wallet'}</div>
                </div>
                <div className="mt-2 text-sm text-slate-300">
                  {blocked
                    ? 'DarkAgent stops the Blink here, so the wallet never receives the request.'
                    : 'A real Base Sepolia transaction records the approved Blink before backend settlement.'}
                </div>
                <div className="mt-4 flex justify-start">
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={confirming || !canConfirm}
                    className="inline-flex items-center gap-2 rounded-full bg-vault-green px-5 py-3 text-sm font-semibold text-black transition hover:bg-vault-green/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Wallet className="h-4 w-4" /> {confirming ? 'Submitting...' : canConfirm ? 'Approve on Base Sepolia' : 'Blocked by DarkAgent'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 p-4">
                <div className="flex items-center gap-3 text-emerald-100">
                  <CheckCircle2 className="h-5 w-5" />
                  <div className="text-base font-semibold">Wallet handoff recorded</div>
                </div>
                <div className="mt-2 text-sm text-emerald-50/90">
                  The approved Blink was handed to the wallet and recorded on Base.
                </div>

                <div className="mt-4 grid gap-3">
                  {walletApproval?.txHash && (
                    <ResultCard
                      label="Wallet approval tx"
                      value={walletApproval.txHash}
                      href={walletApproval.explorerUrl}
                      helper={walletApproval.blockNumber ? `Block ${walletApproval.blockNumber}` : 'Base Sepolia'}
                    />
                  )}

                  {settlement?.txid && (
                    <ResultCard
                      label="Settlement reference"
                      value={settlement.txid}
                      href={execution?.settlementUrl}
                      helper={execution?.settlementLabel}
                    />
                  )}

                  {walletApproval?.contractAddress && (
                    <ResultCard
                      label="DarkAgent contract"
                      value={walletApproval.contractAddress}
                      href={walletApproval.contractUrl}
                      helper="On-chain approval target"
                    />
                  )}

                  {execution?.proof?.id && (
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Proof artifact</div>
                      <div className="mt-2 font-medium">{execution.proof.id}</div>
                      <div className="mt-1 text-slate-300">Stored by the DarkAgent proof service for audit and demo playback.</div>
                    </div>
                  )}

                  {execution?.error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
                      {execution.error}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function ResultCard({ label, value, helper, href }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 break-all">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
        {href && (
          <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-emerald-300 hover:text-emerald-200">
            Open <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
      {helper && <div className="mt-1 text-sm text-slate-400">{helper}</div>}
    </div>
  )
}
