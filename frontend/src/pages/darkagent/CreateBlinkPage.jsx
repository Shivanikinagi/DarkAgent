import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, ExternalLink, Sparkles, Twitter } from 'lucide-react'
import { demoBlinks, buildMockTweet } from '../../data/demo'
import { useDarkAgent } from '../../context/DarkAgentContext'
import {
  ACTION_OPTIONS,
  buildBlinkUrl,
  buildTweetText,
  buildXIntentUrl,
  CHAIN_OPTIONS,
  resolveShareOrigin,
  SOURCE_OPTIONS,
  titleizeSource,
} from '../../lib/policyEngine'
import { AppShell, GlowButton, Input, Label, MetricCard, PageHeader, SectionCard, StatusBadge, Textarea, ViewportFit, WalletSummaryCard } from '../../components/darkagent/Ui'
import { TwitterShareDialog } from '../../components/darkagent/TwitterShareDialog'
import { DEFAULT_ENS_PROFILE, formatUsd } from '../../lib/product'

export default function CreateBlinkPage() {
  const navigate = useNavigate()
  const { createShareLink, busy } = useDarkAgent()
  const [draft, setDraft] = useState(demoBlinks[2])
  const [generatedRawUrl, setGeneratedRawUrl] = useState('')
  const [shareLink, setShareLink] = useState(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [posted, setPosted] = useState(false)
  const [localError, setLocalError] = useState('')

  const shareOrigin = useMemo(() => resolveShareOrigin(), [])
  const rawBlinkUrl = useMemo(() => generatedRawUrl || buildBlinkUrl(shareOrigin, draft), [shareOrigin, draft, generatedRawUrl])
  const cleanShareUrl = useMemo(() => (shareLink ? `${shareOrigin}/analyze/${shareLink.id}` : rawBlinkUrl), [shareLink, shareOrigin, rawBlinkUrl])
  const tweetText = useMemo(() => buildTweetText(draft), [draft])
  const tweet = useMemo(() => buildMockTweet(draft), [draft])
  const intentUrl = useMemo(() => buildXIntentUrl({ text: tweetText, url: cleanShareUrl }), [tweetText, cleanShareUrl])

  function resetShareState() {
    setShareLink(null)
    setPosted(false)
    setLocalError('')
  }

  function applyScenario(index) {
    setDraft(demoBlinks[index])
    setGeneratedRawUrl('')
    resetShareState()
  }

  async function ensureShareLink(nextDraft = draft) {
    const nextRawUrl = buildBlinkUrl(shareOrigin, nextDraft)
    setGeneratedRawUrl(nextRawUrl)
    setLocalError('')

    if (shareLink?.blinkUrl === nextRawUrl) {
      return {
        rawUrl: nextRawUrl,
        share: shareLink,
        shareUrl: `${shareOrigin}/analyze/${shareLink.id}`,
      }
    }

    try {
      const payload = await createShareLink({
        blinkUrl: nextRawUrl,
        ensName: DEFAULT_ENS_PROFILE,
        meta: {
          title: nextDraft.title,
          source: nextDraft.source,
          tokenOut: nextDraft.tokenOut,
        },
      })

      setShareLink(payload.share)
      return {
        rawUrl: nextRawUrl,
        share: payload.share,
        shareUrl: `${shareOrigin}/analyze/${payload.share.id}`,
      }
    } catch {
      setShareLink(null)
      setLocalError('Share API unavailable. Using direct Blink URL.')
      return {
        rawUrl: nextRawUrl,
        share: null,
        shareUrl: nextRawUrl,
      }
    }
  }

  async function generateBlink() {
    const payload = await ensureShareLink()
    setPosted(false)
    if (payload?.share?.id) {
      navigate(`/analyze/${payload.share.id}`)
      return
    }
    navigate(`/analyze?${new URL(payload.shareUrl).searchParams.toString()}`)
  }

  async function openShareDialog() {
    await ensureShareLink()
    setShareOpen(true)
  }

  async function openXComposer() {
    const payload = await ensureShareLink()
    const nextIntentUrl = buildXIntentUrl({ text: tweetText, url: payload.shareUrl })
    const popup = window.open(nextIntentUrl, '_blank', 'noopener,noreferrer')
    if (!popup) {
      window.location.href = nextIntentUrl
      return
    }
    setPosted(true)
  }

  return (
    <AppShell>
      <ViewportFit>
        <>
          <PageHeader
            eyebrow="Agent inbox"
            title="Create one Blink and send it to review."
            description="Pick a scenario or adjust the payload."
            actions={<StatusBadge status="safe">Share-ready</StatusBadge>}
          />

          <div className="mt-5 flex flex-wrap gap-3">
            <ScenarioButton active={draft.title === demoBlinks[0].title} onClick={() => applyScenario(0)} label="Safe" />
            <ScenarioButton active={draft.title === demoBlinks[1].title} onClick={() => applyScenario(1)} label="Blocked" />
            <ScenarioButton active={draft.title === demoBlinks[2].title} onClick={() => applyScenario(2)} label="Downsize" />
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_380px]">
            <SectionCard className="p-5">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Title">
                  <Input value={draft.title} onChange={(event) => { setDraft((current) => ({ ...current, title: event.target.value })); resetShareState() }} />
                </Field>
                <Field label="Source">
                  <select value={draft.source} onChange={(event) => { setDraft((current) => ({ ...current, source: event.target.value })); resetShareState() }} className="input-shell">
                    {SOURCE_OPTIONS.map((option) => <option key={option} value={option}>{titleizeSource(option)}</option>)}
                  </select>
                </Field>
                <Field label="Action">
                  <select value={draft.action} onChange={(event) => { setDraft((current) => ({ ...current, action: event.target.value })); resetShareState() }} className="input-shell">
                    {ACTION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </Field>
                <Field label="Protocol">
                  <Input value={draft.protocol} onChange={(event) => { setDraft((current) => ({ ...current, protocol: event.target.value })); resetShareState() }} />
                </Field>
                <Field label="Token in">
                  <Input value={draft.tokenIn} onChange={(event) => { setDraft((current) => ({ ...current, tokenIn: event.target.value.toUpperCase() })); resetShareState() }} />
                </Field>
                <Field label="Token out">
                  <Input value={draft.tokenOut} onChange={(event) => { setDraft((current) => ({ ...current, tokenOut: event.target.value.toUpperCase() })); resetShareState() }} />
                </Field>
                <Field label="Amount">
                  <Input value={draft.amount} onChange={(event) => { setDraft((current) => ({ ...current, amount: Number(event.target.value || 0) })); resetShareState() }} />
                </Field>
                <Field label="Chain">
                  <select value={draft.chain} onChange={(event) => { setDraft((current) => ({ ...current, chain: event.target.value })); resetShareState() }} className="input-shell">
                    {CHAIN_OPTIONS.map((chain) => <option key={chain} value={chain}>{chain}</option>)}
                  </select>
                </Field>
                <Field label="Sender">
                  <Input value={draft.referralTag || ''} onChange={(event) => { setDraft((current) => ({ ...current, referralTag: event.target.value })); resetShareState() }} />
                </Field>
                <Field label="Copy">
                  <Textarea rows={3} value={draft.tweetCopy || ''} onChange={(event) => { setDraft((current) => ({ ...current, tweetCopy: event.target.value })); resetShareState() }} />
                </Field>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <GlowButton onClick={generateBlink} className="bg-vault-green text-black hover:bg-vault-green/90" disabled={busy}>
                  <Sparkles className="h-4 w-4" /> {busy ? 'Sending...' : 'Send to review'}
                </GlowButton>
                <GlowButton onClick={openShareDialog} className="bg-[#1d9bf0] text-white hover:bg-[#1a8ad4]" disabled={busy}>
                  <Twitter className="h-4 w-4" /> Share to X
                </GlowButton>
              </div>
              {localError && <div className="mt-3 text-xs text-amber-200">{localError}</div>}
            </SectionCard>

            <div className="space-y-5">

              <SectionCard>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-vault-slate">Request</div>
                    <div className="mt-2 text-lg font-semibold text-white">{draft.title}</div>
                  </div>
                  <StatusBadge status="downsized">Queued</StatusBadge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <MetricCard label="Source" value={titleizeSource(draft.source)} detail={draft.referralTag || '@agent'} />
                  <MetricCard label="Amount" value={formatUsd(draft.amount)} detail={`${draft.tokenIn} -> ${draft.tokenOut}`} />
                </div>

                <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-white">Review URL</div>
                    <button
                      type="button"
                      onClick={async () => navigator.clipboard.writeText(cleanShareUrl)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/[0.08]"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </button>
                  </div>
                  <div className="mt-3 break-all text-sm text-slate-300">{cleanShareUrl}</div>
                  <a href={intentUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-sky-300 hover:text-sky-200">
                    Open X composer <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </SectionCard>
            </div>
          </div>
        </>
      </ViewportFit>

      <TwitterShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        tweet={tweet}
        blinkUrl={cleanShareUrl}
        displayUrl={cleanShareUrl}
        posted={posted}
        intentUrl={intentUrl}
        onCopy={async () => {
          await navigator.clipboard.writeText(cleanShareUrl)
        }}
        onPost={openXComposer}
      />
    </AppShell>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function ScenarioButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        active ? 'border-vault-green/25 bg-vault-green/10 text-vault-green' : 'border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]'
      }`}
    >
      {label}
    </button>
  )
}
