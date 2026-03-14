import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Bot, ShieldCheck, ShieldX, Sparkles, Twitter, Wallet } from 'lucide-react'
import { demoBlinks } from '../../data/demo'
import { useDarkAgent } from '../../context/DarkAgentContext'
import { buildBlinkUrl, evaluateBlink, parseBlinkFromSearchParams, titleizeSource } from '../../lib/policyEngine'
import { AppShell, GlowButton, MetricCard, PageHeader, SectionCard, StatusBadge } from '../../components/darkagent/Ui'
import { ExecutionDialog } from '../../components/darkagent/ExecutionDialog'

const PROFILE = 'alice.eth'

function mapDecision(decision) {
  if (decision === 'block') return 'blocked'
  if (decision === 'auto-downsize') return 'downsized'
  if (decision === 'allow-with-warning') return 'risky'
  return 'safe'
}

export default function AnalyzeBlinkPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { analyzeBlinkUrl, executeBlinkUrl, state, busy } = useDarkAgent()
  const [analysisPayload, setAnalysisPayload] = useState(null)
  const [executionPayload, setExecutionPayload] = useState(null)
  const [analysisError, setAnalysisError] = useState('')
  const [executionOpen, setExecutionOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const hasBlink = Array.from(searchParams.keys()).length > 0
  const localBlink = useMemo(() => parseBlinkFromSearchParams(searchParams), [searchParams])
  const localPolicy = useMemo(() => state?.policies?.find((entry) => entry.ensName === PROFILE)?.stored, [state])
  const localFallback = useMemo(() => evaluateBlink(localBlink, localPolicy), [localBlink, localPolicy])
  const currentUrl = typeof window !== 'undefined' ? window.location.href : buildBlinkUrl('https://darkagent.app', localBlink)

  useEffect(() => {
    if (!hasBlink) return
    let cancelled = false

    analyzeBlinkUrl({ url: currentUrl, ensName: PROFILE })
      .then((payload) => {
        if (!cancelled) {
          setAnalysisPayload(payload)
          setAnalysisError('')
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
  }, [analyzeBlinkUrl, currentUrl, hasBlink])

  const blink = analysisPayload?.parsedBlink
    ? {
        ...localBlink,
        ...analysisPayload.parsedBlink,
      }
    : localBlink

  const verdict = analysisPayload
    ? {
        status: mapDecision(analysisPayload.analysis.decision),
        score: Math.max(100 - analysisPayload.analysis.riskScore, 18),
        reasons: analysisPayload.analysis.explanation,
        originalAmount: blink.amountUsd || localBlink.amount,
        safeAmount:
          analysisPayload.analysis.decision === 'auto-downsize'
            ? analysisPayload.analysis.executionAmountUsd
            : undefined,
        mockedSlippageBps: blink.slippageBps || localFallback.mockedSlippageBps,
        mockedLiquidityUsd: blink.liquidityUsd || localFallback.mockedLiquidityUsd,
        tokenCategory: blink.tokenCategory || localFallback.tokenCategory,
        sourceLimit: analysisPayload.analysis.sourceLimitUsd,
      }
    : localFallback

  async function confirmExecution() {
    try {
      setConfirming(true)
      const payload = await executeBlinkUrl({ url: currentUrl, ensName: PROFILE })
      setExecutionPayload(payload)
    } finally {
      setConfirming(false)
    }
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Blink analyzer"
        title="Parse the Blink. Explain the risk. Decide before execution."
        description="This is the core DarkAgent moment: read the Blink query params, score the trade against the user policy, and only forward the safe version."
        actions={
          hasBlink ? (
            <StatusBadge status={verdict.status}>{verdict.status}</StatusBadge>
          ) : (
            <StatusBadge status="downsized">Awaiting Blink</StatusBadge>
          )
        }
      />

      {!hasBlink ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {demoBlinks.map((demo, index) => {
            const url = buildBlinkUrl(window.location.origin, demo)
            return (
              <SectionCard key={demo.title}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-white">{demo.title}</div>
                    <div className="mt-1 text-sm text-slate-400">{titleizeSource(demo.source)} on {demo.protocol}</div>
                  </div>
                  <StatusBadge status={index === 0 ? 'safe' : index === 1 ? 'blocked' : 'downsized'}>
                    {index === 0 ? 'Safe' : index === 1 ? 'Blocked' : 'Downsized'}
                  </StatusBadge>
                </div>
                <div className="mt-4 text-sm text-slate-300">{demo.tokenIn} to {demo.tokenOut} for ${demo.amount}</div>
                <GlowButton as={Link} to={`/analyze?${new URL(url).searchParams.toString()}`} className="mt-5 border border-white/10 bg-white/5 text-white hover:bg-white/10">
                  Open scenario
                </GlowButton>
              </SectionCard>
            )
          })}
        </div>
      ) : (
        <>
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <SectionCard>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm uppercase tracking-[0.24em] text-vault-slate">Parsed Blink</div>
                  <h2 className="mt-3 text-2xl font-semibold text-white">{blink.title || localBlink.title}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={verdict.status}>{verdict.status}</StatusBadge>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">DarkAgent score {verdict.score}</div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <MetricCard label="Source" value={titleizeSource(blink.sourceCategory || localBlink.source)} detail={blink.sourceName || localBlink.referralTag || '@sharedBlink'} />
                <MetricCard label="Action" value={blink.action || localBlink.action} detail={`${blink.protocol || localBlink.protocol} - ${blink.chain || localBlink.chain}`} />
                <MetricCard label="Token pair" value={`${blink.tokenIn || localBlink.tokenIn} -> ${blink.tokenOut || localBlink.tokenOut}`} detail={`Category: ${verdict.tokenCategory}`} />
                <MetricCard label="Requested size" value={`$${blink.amountUsd || localBlink.amount}`} detail={`Source limit: $${verdict.sourceLimit}`} />
                <MetricCard label="Liquidity" value={`$${verdict.mockedLiquidityUsd.toLocaleString()}`} detail="Mocked market depth check" />
                <MetricCard label="Slippage" value={`${verdict.mockedSlippageBps} bps`} detail="Mocked execution estimate" />
              </div>

              <div className="mt-6 rounded-[28px] border border-white/10 bg-[#0b1016] p-5">
                <div className="text-sm uppercase tracking-[0.24em] text-vault-slate">Why it was {verdict.status === 'blocked' ? 'blocked' : verdict.status === 'downsized' ? 'downsized' : 'rated this way'}</div>
                <div className="mt-4 space-y-3">
                  {verdict.reasons.map((reason) => (
                    <div key={reason} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                      {reason}
                    </div>
                  ))}
                </div>
              </div>

              {analysisPayload?.rewrittenBlinkUrl && analysisPayload.rewrittenBlinkUrl !== currentUrl && (
                <div className="mt-6 rounded-[28px] border border-sky-400/20 bg-sky-400/10 p-5">
                  <div className="flex items-center gap-3 text-sky-100">
                    <Sparkles className="h-5 w-5" />
                    <div className="text-lg font-semibold">Rewritten safe Blink</div>
                  </div>
                  <div className="mt-3 break-all text-sm text-sky-50/90">{analysisPayload.rewrittenBlinkUrl}</div>
                </div>
              )}
            </SectionCard>

            <div className="space-y-6">
              <SectionCard>
                <div className="text-sm uppercase tracking-[0.24em] text-vault-slate">Policy alignment</div>
                <div className="mt-4 grid gap-3">
                  <PolicyLine ok={verdict.status !== 'blocked'} label={verdict.status === 'blocked' ? 'Violates your policy' : 'Trusted by your policy'} />
                  <PolicyLine ok={verdict.tokenCategory !== 'meme'} label={`Token category: ${verdict.tokenCategory}`} />
                  <PolicyLine ok={verdict.mockedSlippageBps <= (localPolicy?.maxSlippageBps || 125)} label={`Slippage threshold: ${localPolicy?.maxSlippageBps || 125} bps`} />
                  <PolicyLine ok={(blink.amountUsd || localBlink.amount) <= verdict.sourceLimit || verdict.status === 'downsized'} label={`Source-aware limit: $${verdict.sourceLimit}`} />
                </div>
              </SectionCard>

              <SectionCard>
                <div className="text-sm uppercase tracking-[0.24em] text-vault-slate">Execution panel</div>
                <div className="mt-4 text-sm leading-6 text-slate-300">
                  {verdict.status === 'blocked'
                    ? 'This Blink cannot proceed because it violates the current policy.'
                    : verdict.status === 'downsized'
                      ? `DarkAgent suggests a rewritten execution size of $${verdict.safeAmount}.`
                      : 'This Blink matches your policy and can proceed to the execution preview.'}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <GlowButton
                    onClick={() => setExecutionOpen(true)}
                    disabled={verdict.status === 'blocked'}
                    className="bg-vault-green text-black hover:bg-vault-green/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Wallet className="h-4 w-4" /> Continue to Execution
                  </GlowButton>
                  <GlowButton as={Link} to="/dashboard" className="border border-white/10 bg-white/5 text-white hover:bg-white/10">
                    Adjust Policy
                  </GlowButton>
                </div>
                {analysisPayload?.proof && (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                    Proof receipt: {analysisPayload.proof.receiptHash}
                  </div>
                )}
              </SectionCard>

              <SectionCard>
                <div className="text-sm uppercase tracking-[0.24em] text-vault-slate">Source trust badge</div>
                <div className="mt-4 flex items-center gap-3 text-white">
                  {blink.sourceCategory === 'ai_bot' || localBlink.source === 'ai_bot' ? <Bot className="h-5 w-5 text-vault-green" /> : verdict.status === 'blocked' ? <ShieldX className="h-5 w-5 text-red-300" /> : <AlertTriangle className="h-5 w-5 text-amber-300" />}
                  <div>
                    <div className="font-semibold">{titleizeSource(blink.sourceCategory || localBlink.source)}</div>
                    <div className="text-sm text-slate-400">Origin signal captured from the Blink itself.</div>
                  </div>
                </div>
                {analysisError && <div className="mt-4 text-sm text-amber-200">Backend analysis unavailable, using local engine fallback: {analysisError}</div>}
              </SectionCard>
            </div>
          </div>

          <ExecutionDialog
            open={executionOpen}
            onOpenChange={setExecutionOpen}
            blink={{
              tokenIn: blink.tokenIn || localBlink.tokenIn,
              tokenOut: blink.tokenOut || localBlink.tokenOut,
              action: blink.action || localBlink.action,
              protocol: blink.protocol || localBlink.protocol,
              chain: blink.chain || localBlink.chain,
            }}
            analysis={verdict}
            execution={executionPayload?.execution || null}
            onConfirm={confirmExecution}
            confirming={confirming || busy}
          />
        </>
      )}
    </AppShell>
  )
}

function PolicyLine({ ok, label }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${ok ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100' : 'border-red-400/20 bg-red-400/10 text-red-100'}`}>
      {ok ? <ShieldCheck className="mr-2 inline h-4 w-4" /> : <ShieldX className="mr-2 inline h-4 w-4" />}
      {label}
    </div>
  )
}
