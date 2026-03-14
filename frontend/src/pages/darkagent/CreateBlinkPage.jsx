import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Sparkles, Twitter } from 'lucide-react'
import { demoBlinks, buildMockTweet } from '../../data/demo'
import {
  ACTION_OPTIONS,
  buildBlinkUrl,
  buildTweetText,
  buildXIntentUrl,
  CHAIN_OPTIONS,
  getBlinkDisplayUrl,
  resolveShareOrigin,
  SOURCE_OPTIONS,
} from '../../lib/policyEngine'
import { AppShell, GlowButton, Input, Label, PageHeader, SectionCard, Select, Textarea, StatusBadge } from '../../components/darkagent/Ui'
import { TwitterShareDialog } from '../../components/darkagent/TwitterShareDialog'

export default function CreateBlinkPage() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState(demoBlinks[2])
  const [generated, setGenerated] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const [posted, setPosted] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareOrigin = useMemo(() => resolveShareOrigin(), [])
  const generatedUrl = useMemo(() => generated || buildBlinkUrl(shareOrigin, draft), [shareOrigin, draft, generated])
  const displayUrl = useMemo(() => getBlinkDisplayUrl(generatedUrl), [generatedUrl])
  const tweetText = useMemo(() => buildTweetText(draft), [draft])
  const tweet = useMemo(() => buildMockTweet(draft), [draft])
  const intentUrl = useMemo(() => buildXIntentUrl({ text: tweetText, url: generatedUrl }), [tweetText, generatedUrl])

  function useScenario(index) {
    setDraft(demoBlinks[index])
    setGenerated('')
    setPosted(false)
    setCopied(false)
  }

  function generateBlink() {
    setGenerated(buildBlinkUrl(shareOrigin, draft))
    setPosted(false)
    setCopied(false)
  }

  async function copyBlink() {
    await navigator.clipboard.writeText(generatedUrl)
    setCopied(true)
  }

  function openXComposer() {
    const popup = window.open(intentUrl, '_blank', 'noopener,noreferrer')
    if (!popup) {
      window.location.href = intentUrl
      return
    }
    setPosted(true)
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Blink creator"
        title="Generate a shareable trading Blink."
        description="Compose a Blink the way an AI bot, influencer, or social trader would share it on X, then route it into DarkAgent for policy-aware analysis."
        actions={
          <>
            <StatusBadge status="downsized">Creator flow</StatusBadge>
            <StatusBadge status="safe">Real X intent</StatusBadge>
          </>
        }
      />

      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={() => useScenario(0)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">Load SAFE demo</button>
        <button onClick={() => useScenario(1)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">Load BLOCKED demo</button>
        <button onClick={() => useScenario(2)} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">Load DOWNSIZED demo</button>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <SectionCard>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Blink title</Label>
              <Input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div>
              <Label>Source type</Label>
              <Select value={draft.source} onChange={(event) => setDraft((current) => ({ ...current, source: event.target.value }))}>
                {SOURCE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </Select>
            </div>
            <div>
              <Label>Action type</Label>
              <Select value={draft.action} onChange={(event) => setDraft((current) => ({ ...current, action: event.target.value }))}>
                {ACTION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </Select>
            </div>
            <div>
              <Label>Protocol</Label>
              <Input value={draft.protocol} onChange={(event) => setDraft((current) => ({ ...current, protocol: event.target.value }))} />
            </div>
            <div>
              <Label>Token in</Label>
              <Input value={draft.tokenIn} onChange={(event) => setDraft((current) => ({ ...current, tokenIn: event.target.value.toUpperCase() }))} />
            </div>
            <div>
              <Label>Token out</Label>
              <Input value={draft.tokenOut} onChange={(event) => setDraft((current) => ({ ...current, tokenOut: event.target.value.toUpperCase() }))} />
            </div>
            <div>
              <Label>Amount</Label>
              <Input value={draft.amount} onChange={(event) => setDraft((current) => ({ ...current, amount: Number(event.target.value || 0) }))} />
            </div>
            <div>
              <Label>Chain</Label>
              <Select value={draft.chain} onChange={(event) => setDraft((current) => ({ ...current, chain: event.target.value }))}>
                {CHAIN_OPTIONS.map((chain) => <option key={chain} value={chain}>{chain}</option>)}
              </Select>
            </div>
            <div>
              <Label>Referral or influencer tag</Label>
              <Input value={draft.referralTag || ''} onChange={(event) => setDraft((current) => ({ ...current, referralTag: event.target.value }))} />
            </div>
            <div>
              <Label>Tweet copy</Label>
              <Textarea rows={4} value={draft.tweetCopy || ''} onChange={(event) => setDraft((current) => ({ ...current, tweetCopy: event.target.value }))} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <GlowButton onClick={generateBlink} className="bg-vault-green text-black hover:bg-vault-green/90">
              <Sparkles className="h-4 w-4" /> Generate Blink
            </GlowButton>
            <GlowButton onClick={copyBlink} className="border border-white/10 bg-white/5 text-white hover:bg-white/10">
              <Copy className="h-4 w-4" /> {copied ? 'Copied' : 'Copy Blink URL'}
            </GlowButton>
            <GlowButton onClick={() => setShareOpen(true)} className="bg-[#1d9bf0] text-white hover:bg-[#1a8ad4]">
              <Twitter className="h-4 w-4" /> Share to X
            </GlowButton>
            <GlowButton as="button" onClick={() => navigate(`/analyze?${new URL(generatedUrl).searchParams.toString()}`)} className="border border-sky-400/20 bg-sky-400/10 text-sky-200 hover:bg-sky-400/15">
              Analyze this Blink
            </GlowButton>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <div className="text-sm uppercase tracking-[0.24em] text-vault-slate">Generated Blink object</div>
            <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-[#0b1016] p-4 text-xs leading-6 text-slate-300">
{JSON.stringify(draft, null, 2)}
            </pre>
          </SectionCard>

          <SectionCard>
            <div className="text-sm uppercase tracking-[0.24em] text-vault-slate">Shareable Blink URL</div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b1016] p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Display URL</div>
              <div className="mt-2 text-sm font-medium text-white">{displayUrl}</div>
              <div className="mt-3 break-all text-xs leading-6 text-slate-400">{generatedUrl}</div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="text-sm uppercase tracking-[0.24em] text-vault-slate">X composer text</div>
            <div className="mt-4 whitespace-pre-wrap break-words rounded-2xl border border-white/10 bg-[#0b1016] p-4 text-sm leading-6 text-slate-200">{tweetText}</div>
          </SectionCard>
        </div>
      </div>

      <TwitterShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        tweet={tweet}
        blinkUrl={generatedUrl}
        displayUrl={displayUrl}
        posted={posted}
        intentUrl={intentUrl}
        onCopy={copyBlink}
        onPost={openXComposer}
      />
    </AppShell>
  )
}
