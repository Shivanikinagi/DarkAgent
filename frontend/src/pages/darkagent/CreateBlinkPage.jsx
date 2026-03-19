import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, ExternalLink, Sparkles, Twitter } from 'lucide-react'
import { buildSharePreview } from '../../data/demo'
import { useDarkAgent } from '../../context/DarkAgentContext'
import {
  ACTION_OPTIONS,
  buildBlinkUrl,
  buildTweetText,
  buildXIntentUrl,
  CHAIN_OPTIONS,
  parseBlinkFromUrl,
  resolveShareOrigin,
  SOURCE_OPTIONS,
  titleizeSource,
} from '../../lib/policyEngine'
import { AppShell, GlowButton, Input, Label, MetricCard, PageHeader, SectionCard, StatusBadge, Textarea, ViewportFit } from '../../components/darkagent/Ui'
import { TwitterShareDialog } from '../../components/darkagent/TwitterShareDialog'
import { DEFAULT_ENS_PROFILE, formatUsd } from '../../lib/product'
import { feedEntryToDraft, shareToEntry } from '../../lib/liveFeed'

const EMPTY_DRAFT_TITLE = 'Incoming Twitter Blink'
const EMPTY_URL = ''

export default function CreateBlinkPage() {
  const navigate = useNavigate()
  const { createShareLink, busy, state } = useDarkAgent()
  const recentShares = useMemo(
    () =>
      (state?.shares || [])
        .slice()
        .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
        .map(shareToEntry)
        .filter(Boolean)
        .slice(0, 4),
    [state?.shares]
  )
  const [draft, setDraft] = useState({
    title: EMPTY_DRAFT_TITLE,
    source: 'twitter',
    action: 'swap',
    tokenIn: 'USDC',
    tokenOut: 'ETH',
    amount: 100,
    protocol: 'Uniswap',
    chain: 'Base',
    referralTag: '@signal_bot',
    tweetCopy: 'Fresh Blink to review.',
  })
  const [inputUrl, setInputUrl] = useState(EMPTY_URL)
  const [generatedRawUrl, setGeneratedRawUrl] = useState('')
  const [shareLink, setShareLink] = useState(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [posted, setPosted] = useState(false)
  const [localError, setLocalError] = useState('')
  const activeDraft = draft

  const shareOrigin = useMemo(() => resolveShareOrigin(), [])
  const rawBlinkUrl = useMemo(() => generatedRawUrl || buildBlinkUrl(shareOrigin, activeDraft), [shareOrigin, activeDraft, generatedRawUrl])
  const cleanShareUrl = useMemo(() => (shareLink ? `${shareOrigin}/analyze/${shareLink.id}` : rawBlinkUrl), [shareLink, shareOrigin, rawBlinkUrl])
  const tweetText = useMemo(() => buildTweetText(activeDraft), [activeDraft])
  const tweet = useMemo(() => buildSharePreview(activeDraft), [activeDraft])
  const intentUrl = useMemo(() => buildXIntentUrl({ text: tweetText, url: cleanShareUrl }), [tweetText, cleanShareUrl])

  function resetShareState() {
    setShareLink(null)
    setPosted(false)
    setLocalError('')
  }

  function applyRecentShare(index) {
    const nextEntry = recentShares[index]
    if (!nextEntry) return
    setDraft(feedEntryToDraft(nextEntry))
    setInputUrl(nextEntry.parsedBlink?.rawUrl || '')
    setGeneratedRawUrl('')
    resetShareState()
  }

  function hydrateFromUrl(url) {
    try {
      const parsed = parseBlinkFromUrl(url)
      setDraft({
        title:
          parsed.title === 'Shared trading Blink' || parsed.title === 'DarkAgent trading Blink'
            ? 'Incoming Blink'
            : parsed.title,
        source: parsed.sourceCategory || 'twitter',
        action: parsed.action || 'swap',
        tokenIn: parsed.tokenIn || 'USDC',
        tokenOut: parsed.tokenOut || 'ETH',
        amount: parsed.amountUsd || 0,
        protocol: parsed.protocol ? parsed.protocol.charAt(0).toUpperCase() + parsed.protocol.slice(1) : 'Uniswap',
        chain: parsed.chain ? parsed.chain.charAt(0).toUpperCase() + parsed.chain.slice(1) : 'Base',
        referralTag: parsed.sourceName?.startsWith('@') ? parsed.sourceName : parsed.sourceName ? `@${parsed.sourceName}` : '',
        tweetCopy: parsed.tweetCopy || '',
        slippageBps: parsed.slippageBps,
        liquidityUsd: parsed.liquidityUsd,
      })
      setGeneratedRawUrl(url)
      setLocalError('')
      return true
    } catch {
      setLocalError('Paste a valid Blink URL with query params like tokenIn, tokenOut, amountUsd, and protocol.')
      return false
    }
  }

  async function ensureShareLink(nextDraft = activeDraft) {
    const nextRawUrl = generatedRawUrl || buildBlinkUrl(shareOrigin, nextDraft)
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
    if (inputUrl && !generatedRawUrl) {
      const ok = hydrateFromUrl(inputUrl)
      if (!ok) return
    }
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
            eyebrow="Blink lab"
            title="Paste a real Blink URL and send it through DarkAgent."
            description="Use a real Blink link as the source of truth. DarkAgent will create a review link from that live input."
            actions={<StatusBadge status="safe">Share-ready</StatusBadge>}
          />

          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_380px]">
            <SectionCard className="p-5">
              <div>
                <Label>Blink URL</Label>
                <Input
                  value={inputUrl}
                  onChange={(event) => {
                    setInputUrl(event.target.value)
                    setGeneratedRawUrl('')
                    resetShareState()
                  }}
                  placeholder="https://x.com/...?...&tokenIn=USDC&tokenOut=ETH&amountUsd=100"
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <GlowButton
                  onClick={() => {
                    if (!inputUrl) {
                      setLocalError('Paste a Blink URL first.')
                      return
                    }
                    hydrateFromUrl(inputUrl)
                  }}
                  className="border border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]"
                >
                  Parse Blink
                </GlowButton>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Title">
                  <Input value={activeDraft.title} onChange={(event) => { setDraft((current) => ({ ...(current?.title === EMPTY_DRAFT_TITLE ? activeDraft : current), title: event.target.value })); resetShareState() }} />
                </Field>
                <Field label="Source">
                  <select value={activeDraft.source} onChange={(event) => { setDraft((current) => ({ ...(current?.title === EMPTY_DRAFT_TITLE ? activeDraft : current), source: event.target.value })); resetShareState() }} className="input-shell">
                    {SOURCE_OPTIONS.map((option) => <option key={option} value={option}>{titleizeSource(option)}</option>)}
                  </select>
                </Field>
                <Field label="Action">
                  <select value={activeDraft.action} onChange={(event) => { setDraft((current) => ({ ...(current?.title === EMPTY_DRAFT_TITLE ? activeDraft : current), action: event.target.value })); resetShareState() }} className="input-shell">
                    {ACTION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </Field>
                <Field label="Protocol">
                  <Input value={activeDraft.protocol} onChange={(event) => { setDraft((current) => ({ ...(current?.title === EMPTY_DRAFT_TITLE ? activeDraft : current), protocol: event.target.value })); resetShareState() }} />
                </Field>
                <Field label="Token in">
                  <Input value={activeDraft.tokenIn} onChange={(event) => { setDraft((current) => ({ ...(current?.title === EMPTY_DRAFT_TITLE ? activeDraft : current), tokenIn: event.target.value.toUpperCase() })); resetShareState() }} />
                </Field>
                <Field label="Token out">
                  <Input value={activeDraft.tokenOut} onChange={(event) => { setDraft((current) => ({ ...(current?.title === EMPTY_DRAFT_TITLE ? activeDraft : current), tokenOut: event.target.value.toUpperCase() })); resetShareState() }} />
                </Field>
                <Field label="Amount">
                  <Input value={activeDraft.amount} onChange={(event) => { setDraft((current) => ({ ...(current?.title === EMPTY_DRAFT_TITLE ? activeDraft : current), amount: Number(event.target.value || 0) })); resetShareState() }} />
                </Field>
                <Field label="Chain">
                  <select value={activeDraft.chain} onChange={(event) => { setDraft((current) => ({ ...(current?.title === EMPTY_DRAFT_TITLE ? activeDraft : current), chain: event.target.value })); resetShareState() }} className="input-shell">
                    {CHAIN_OPTIONS.map((chain) => <option key={chain} value={chain}>{chain}</option>)}
                  </select>
                </Field>
                <Field label="Sender">
                  <Input value={activeDraft.referralTag || ''} onChange={(event) => { setDraft((current) => ({ ...(current?.title === EMPTY_DRAFT_TITLE ? activeDraft : current), referralTag: event.target.value })); resetShareState() }} />
                </Field>
                <Field label="Copy">
                  <Textarea rows={3} value={activeDraft.tweetCopy || ''} onChange={(event) => { setDraft((current) => ({ ...(current?.title === EMPTY_DRAFT_TITLE ? activeDraft : current), tweetCopy: event.target.value })); resetShareState() }} />
                </Field>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <GlowButton onClick={generateBlink} className="bg-vault-green text-black hover:bg-vault-green/90" disabled={busy}>
                  <Sparkles className="h-4 w-4" /> {busy ? 'Sending...' : 'Send through DarkAgent'}
                </GlowButton>
                <GlowButton onClick={openShareDialog} className="bg-[#1d9bf0] text-white hover:bg-[#1a8ad4]" disabled={busy}>
                  <Twitter className="h-4 w-4" /> Share to X
                </GlowButton>
              </div>
              {localError && <div className="mt-3 text-xs text-amber-200">{localError}</div>}
            </SectionCard>

            <div className="space-y-5">
              <SectionCard>
                <div className="text-xs uppercase tracking-[0.24em] text-vault-slate">Recent Real Blinks</div>
                {recentShares.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {recentShares.map((entry, index) => (
                      <button
                        key={entry.id}
                        onClick={() => applyRecentShare(index)}
                        className="w-full rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-left transition hover:border-white/15"
                      >
                        <div className="text-sm font-semibold text-white">{entry.label}</div>
                        <div className="mt-1 text-sm text-slate-400">
                          {entry.parsedBlink?.sourceName || 'Unknown source'} · {formatUsd(entry.parsedBlink?.amountUsd)}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-slate-300">
                    No live Blink links saved yet.
                  </div>
                )}
              </SectionCard>

              <SectionCard>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-vault-slate">Blink preview</div>
                    <div className="mt-2 text-lg font-semibold text-white">{activeDraft.title}</div>
                  </div>
                  <StatusBadge status="downsized">Queued</StatusBadge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <MetricCard label="Source" value={titleizeSource(activeDraft.source)} detail={activeDraft.referralTag || '@agent'} />
                  <MetricCard label="Amount" value={formatUsd(activeDraft.amount)} detail={`${activeDraft.tokenIn} -> ${activeDraft.tokenOut}`} />
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
