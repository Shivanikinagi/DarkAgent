import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowRight, ShieldAlert, ShieldCheck, ShieldX, Wallet } from 'lucide-react'
import { useAccount, useChainId, usePublicClient, useSwitchChain, useWriteContract } from 'wagmi'
import { parseAbi, stringToHex } from 'viem'
import { useDarkAgent } from '../../context/DarkAgentContext'
import { buildBlinkUrl, parseBlinkFromSearchParams, parseBlinkFromUrl, titleizeSource } from '../../lib/policyEngine'
import { AppShell, GlowButton, MetricCard, PageHeader, SectionCard, StatusBadge, ViewportFit, WalletSummaryCard } from '../../components/darkagent/Ui'
import { ExecutionDialog } from '../../components/darkagent/ExecutionDialog'
import {
  addressExplorerUrl,
  BASE_SEPOLIA_CHAIN_ID,
  DARKAGENT_CONTRACTS,
  DEFAULT_ENS_PROFILE,
  DEMO_AGENT_ADDRESS,
  formatUsd,
  resolveSettlementLabel,
  txExplorerUrl,
} from '../../lib/product'
import { feedEntryToHref, shareToEntry } from '../../lib/liveFeed'

const PROFILE = DEFAULT_ENS_PROFILE
const DARKAGENT_PROPOSE_ABI = parseAbi([
  'function propose(address agent, address user, bytes action) external returns (bytes32)',
])

function mapDecision(decision) {
  if (decision === 'block') return 'blocked'
  if (decision === 'auto-downsize') return 'downsized'
  if (decision === 'allow-with-warning') return 'risky'
  return 'safe'
}

export default function AnalyzeBlinkPage() {
  const { shareId } = useParams()
  const [searchParams] = useSearchParams()
  const { analyzeBlinkUrl, executeBlinkUrl, getShareLink, busy, state } = useDarkAgent()
  const [analysisPayload, setAnalysisPayload] = useState(null)
  const [executionPayload, setExecutionPayload] = useState(null)
  const [analysisError, setAnalysisError] = useState('')
  const [executionOpen, setExecutionOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [resolvedBlinkUrl, setResolvedBlinkUrl] = useState('')
  const [loadingSharedBlink, setLoadingSharedBlink] = useState(false)
  const [executionError, setExecutionError] = useState('')

  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync } = useWriteContract()

  const hasQueryBlink = Array.from(searchParams.keys()).length > 0
  const hasBlink = Boolean(shareId || hasQueryBlink)

  useEffect(() => {
    if (!shareId) {
      setResolvedBlinkUrl('')
      return
    }

    let cancelled = false
    setLoadingSharedBlink(true)

    getShareLink(shareId)
      .then((payload) => {
        if (!cancelled) {
          setResolvedBlinkUrl(payload.share?.blinkUrl || '')
          setAnalysisError('')
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setResolvedBlinkUrl('')
          setAnalysisError(error.message)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingSharedBlink(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [getShareLink, shareId])

  const localBlink = useMemo(() => {
    if (resolvedBlinkUrl) return parseBlinkFromUrl(resolvedBlinkUrl)
    return parseBlinkFromSearchParams(searchParams)
  }, [resolvedBlinkUrl, searchParams])
  const recentShares = useMemo(
    () =>
      (state?.shares || [])
        .slice()
        .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
        .map(shareToEntry)
        .filter(Boolean)
        .slice(0, 6),
    [state?.shares]
  )

  const analysisTargetUrl = resolvedBlinkUrl || (hasQueryBlink ? (typeof window !== 'undefined' ? window.location.href : buildBlinkUrl('https://darkagent.app', localBlink)) : '')

  useEffect(() => {
    if (!hasBlink || !analysisTargetUrl || loadingSharedBlink) return
    let cancelled = false

    analyzeBlinkUrl({ url: analysisTargetUrl, ensName: PROFILE })
      .then((payload) => {
        if (!cancelled) {
          setAnalysisPayload(payload)
          setAnalysisError('')
          setExecutionError('')
          setExecutionPayload(null)
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setAnalysisPayload(null)
          setAnalysisError(error.message)
        }
      })

    return () => {
      cancelled = true
    }
  }, [analyzeBlinkUrl, analysisTargetUrl, hasBlink, loadingSharedBlink])

  const blink = analysisPayload?.parsedBlink ? { ...localBlink, ...analysisPayload.parsedBlink } : localBlink
  const verdict = analysisPayload
    ? {
        status: mapDecision(analysisPayload.analysis.decision),
        score: analysisPayload.analysis.riskScore,
        reasons: analysisPayload.analysis.explanation || [],
        originalAmount: blink.amountUsd || localBlink.amount,
        safeAmount:
          analysisPayload.analysis.decision === 'auto-downsize'
            ? analysisPayload.analysis.executionAmountUsd
            : undefined,
        mockedSlippageBps: blink.slippageBps,
        mockedLiquidityUsd: blink.liquidityUsd,
        tokenCategory: blink.tokenCategory,
        sourceLimit: analysisPayload.analysis.sourceLimitUsd,
        summary: analysisPayload.analysis.summary,
      }
    : null

  const reviewStatus = verdict?.status || (analysisError ? 'blocked' : 'downsized')
  const executionBlocked = verdict?.status === 'blocked'
  const contractAddress = DARKAGENT_CONTRACTS?.DarkAgent
  const canSubmitWalletApproval = Boolean(isConnected && contractAddress && !executionBlocked)
  const sourceLabel = titleizeSource(blink.sourceCategory || localBlink.source)
  const requestedAmount = blink.amountUsd || localBlink.amount
  const blockedByAmount = requestedAmount > (verdict?.sourceLimit || 0)
  const primaryReason = verdict?.reasons?.[0] || verdict?.summary || 'This Blink violated your live policy.'

  async function confirmExecution() {
    let walletApproval = null

    try {
      setConfirming(true)
      setExecutionError('')

      if (!address) throw new Error('Connect a wallet first.')
      if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
        await switchChainAsync({ chainId: BASE_SEPOLIA_CHAIN_ID })
      }
      if (!contractAddress) throw new Error('DarkAgent contract missing.')
      if (!publicClient) throw new Error('Base Sepolia client unavailable.')

      const actionPayload = stringToHex(
        JSON.stringify({
          blink: {
            title: blink.title || localBlink.title,
            tokenIn: blink.tokenIn || localBlink.tokenIn,
            tokenOut: blink.tokenOut || localBlink.tokenOut,
            amountUsd: verdict.safeAmount || blink.amountUsd || localBlink.amount,
            protocol: blink.protocol || localBlink.protocol,
            source: blink.sourceCategory || localBlink.source,
          },
          reviewedAt: new Date().toISOString(),
        })
      )

      const walletHash = await writeContractAsync({
        address: contractAddress,
        abi: DARKAGENT_PROPOSE_ABI,
        functionName: 'propose',
        args: [DEMO_AGENT_ADDRESS || address, address, actionPayload],
      })

      const receipt = await publicClient.waitForTransactionReceipt({ hash: walletHash })
      walletApproval = {
        txHash: walletHash,
        explorerUrl: txExplorerUrl(walletHash),
        blockNumber: receipt.blockNumber?.toString?.() || '',
        contractAddress,
        contractUrl: addressExplorerUrl(contractAddress),
      }

      const payload = await executeBlinkUrl({ url: analysisTargetUrl, ensName: PROFILE })
      setExecutionPayload({
        walletApproval,
        execution: payload.execution,
        proof: payload.proof,
        settlementLabel: resolveSettlementLabel(payload.execution?.mode),
        settlementUrl: payload.execution?.receiptUrl || txExplorerUrl(payload.execution?.txid),
      })
    } catch (error) {
      setExecutionError(error.message || 'Execution failed.')
      if (walletApproval) {
        setExecutionPayload({
          walletApproval,
          execution: null,
          proof: null,
          settlementLabel: 'Settlement failed',
          settlementUrl: '',
          error: error.message || 'Execution failed.',
        })
      }
    } finally {
      setConfirming(false)
    }
  }

  return (
    <AppShell>
      <ViewportFit>
        <>
          <PageHeader
            eyebrow="DarkAgent Intercept"
            title="Blink intercepted"
            description="DarkAgent catches the Blink at open time, checks your live policy, and either blocks it or hands a safe version to the wallet."
            actions={hasBlink ? <StatusBadge status={reviewStatus}>{analysisPayload ? reviewStatus : analysisError ? 'error' : 'reviewing'}</StatusBadge> : <StatusBadge status="downsized">Awaiting Blink</StatusBadge>}
          />

          {!hasBlink ? (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {recentShares.map((sample) => {
                return (
                  <SectionCard key={sample.id}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">{sample.label}</div>
                        <div className="mt-1 text-sm text-slate-400">{sample.parsedBlink?.tokenIn} {'->'} {sample.parsedBlink?.tokenOut}</div>
                      </div>
                      <StatusBadge status="downsized">shared</StatusBadge>
                    </div>
                    <div className="mt-4 text-sm text-slate-300">{sample.parsedBlink?.summary}</div>
                    <GlowButton as={Link} to={feedEntryToHref(sample, window.location.origin)} className="mt-5 border border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]">
                      Open
                    </GlowButton>
                  </SectionCard>
                )
              })}
              {recentShares.length === 0 && (
                <SectionCard className="md:col-span-3">
                  <div className="text-sm text-slate-300">No live Blink links yet. Paste one in Inbox to start a real review.</div>
                </SectionCard>
              )}
            </div>
          ) : loadingSharedBlink && !analysisPayload ? (
            <SectionCard className="mt-6">
              <div className="text-sm text-slate-300">Resolving Blink...</div>
            </SectionCard>
          ) : !analysisPayload && !analysisError ? (
            <SectionCard className="mt-6">
              <div className="text-sm text-slate-300">Running review...</div>
            </SectionCard>
          ) : !analysisPayload ? (
            <SectionCard className="mt-6">
              <div className="text-sm text-red-100">{analysisError}</div>
            </SectionCard>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <SectionCard className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-vault-slate">Incoming Blink</div>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{blink.title || localBlink.title}</h2>
                    <div className="mt-1 text-sm text-slate-400">
                      {sourceLabel} / {blink.protocol || localBlink.protocol} / {blink.chain || localBlink.chain}
                    </div>
                  </div>
                  <StatusBadge status={verdict.status}>{verdict.status}</StatusBadge>
                </div>

                <div className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-vault-slate">What the Blink asked for</div>
                      <div className="mt-3 text-3xl font-semibold text-white">{formatUsd(blink.amountUsd || localBlink.amount)}</div>
                      <div className="mt-1 text-sm text-slate-300">
                        {blink.tokenIn || localBlink.tokenIn} to {blink.tokenOut || localBlink.tokenOut}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-right">
                      <div className="text-xs uppercase tracking-[0.2em] text-vault-slate">Your live rule</div>
                      <div className="mt-1 text-xl font-semibold text-white">{formatUsd(verdict.sourceLimit)}</div>
                      <div className="mt-1 text-sm text-slate-400">{PROFILE} from {sourceLabel}</div>
                    </div>
                  </div>
                </div>

                {executionBlocked ? (
                  <div className="mt-5 rounded-[28px] border border-red-500/20 bg-red-500/10 px-5 py-5 text-sm text-red-50">
                    <div className="flex items-center gap-3 font-semibold text-red-100">
                      <ShieldX className="h-5 w-5" />
                      DarkAgent blocked this Blink
                    </div>
                    <div className="mt-3 text-sm leading-6 text-red-50/95">
                      {blockedByAmount
                        ? `${sourceLabel} tried to open a Blink for ${formatUsd(requestedAmount)}, but your live limit is ${formatUsd(verdict.sourceLimit)}. The wallet never sees this request.`
                        : `${primaryReason} The wallet never sees this request.`}
                    </div>
                  </div>
                ) : verdict.safeAmount ? (
                  <div className="mt-5 rounded-[28px] border border-sky-400/20 bg-sky-400/10 px-5 py-5 text-sm text-sky-50">
                    <div className="flex items-center gap-3 font-semibold text-sky-100">
                      <ShieldAlert className="h-5 w-5" />
                      DarkAgent rewrote the Blink
                    </div>
                    <div className="mt-3">
                      Requested {formatUsd(verdict.originalAmount)}. Safe amount is {formatUsd(verdict.safeAmount)}.
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 px-5 py-5 text-sm text-emerald-50">
                    <div className="flex items-center gap-3 font-semibold text-emerald-100">
                      <ShieldCheck className="h-5 w-5" />
                      DarkAgent approved this Blink
                    </div>
                    <div className="mt-3">
                      The Blink fits your live policy, so the wallet can see the approved action.
                    </div>
                  </div>
                )}

                <div className="mt-5 grid gap-3">
                  {(verdict.reasons || []).slice(0, 2).map((reason, index) => (
                    <div key={`${reason}-${index}`} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-slate-200">
                      {reason}
                    </div>
                  ))}
                </div>

                {executionError && (
                  <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {executionError}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <GlowButton
                    onClick={() => setExecutionOpen(true)}
                    disabled={executionBlocked}
                    className="bg-vault-green text-black hover:bg-vault-green/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Wallet className="h-4 w-4" /> {executionBlocked ? 'Blocked before wallet' : 'Continue to wallet'}
                  </GlowButton>
                  <GlowButton as={Link} to="/dashboard" className="border border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]">
                    Change rule
                  </GlowButton>
                </div>
              </SectionCard>

              <div className="space-y-5">
                <SectionCard className="p-6">
                  <div className="text-xs uppercase tracking-[0.24em] text-vault-slate">DarkAgent Extension View</div>
                  <div className="mt-4 space-y-4">
                    <InterceptRow
                      title="Agent opened Blink"
                      text={`${sourceLabel} attempted ${blink.action || localBlink.action} on ${blink.protocol || localBlink.protocol}.`}
                    />
                    <InterceptRow
                      title="DarkAgent checked policy"
                      text={`Live ${PROFILE} rule: ${formatUsd(verdict.sourceLimit)} max from ${sourceLabel}.`}
                    />
                    <InterceptRow
                      title={executionBlocked ? 'Wallet stopped' : 'Wallet unlocked'}
                      text={executionBlocked ? 'This Blink is blocked before wallet approval.' : 'Only the approved action reaches the wallet.'}
                    />
                  </div>
                </SectionCard>

                {analysisPayload?.proof?.id && (
                  <SectionCard>
                    <div className="text-xs uppercase tracking-[0.24em] text-vault-slate">DarkAgent receipt</div>
                    <div className="mt-3 text-sm font-medium text-white">{analysisPayload.proof.id}</div>
                    <div className="mt-1 text-sm text-slate-300">
                      Signed verdict: {analysisPayload.proof.verdict}
                    </div>
                  </SectionCard>
                )}

                {executionPayload?.walletApproval?.explorerUrl && (
                  <SectionCard>
                    <div className="text-xs uppercase tracking-[0.24em] text-vault-slate">Approval</div>
                    <a href={executionPayload.walletApproval.explorerUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm text-sky-300 hover:text-sky-200">
                      View Base approval <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </SectionCard>
                )}
              </div>
            </div>
          )}

          <ExecutionDialog
            open={executionOpen}
            onOpenChange={setExecutionOpen}
            blink={{
              tokenIn: blink.tokenIn || localBlink.tokenIn,
              tokenOut: blink.tokenOut || localBlink.tokenOut,
              action: blink.action || localBlink.action,
              protocol: blink.protocol || localBlink.protocol,
              chain: blink.chain || localBlink.chain,
              amount: verdict?.safeAmount || blink.amountUsd || localBlink.amount,
            }}
            analysis={verdict}
            execution={executionPayload || null}
            onConfirm={confirmExecution}
            confirming={confirming || busy}
            canConfirm={canSubmitWalletApproval}
          />
        </>
      </ViewportFit>
    </AppShell>
  )
}

function InterceptRow({ title, text }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-1 text-sm text-slate-300">{text}</div>
    </div>
  )
}
