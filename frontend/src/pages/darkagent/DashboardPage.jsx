import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Shield, SlidersHorizontal } from 'lucide-react'
import { useDarkAgent } from '../../context/DarkAgentContext'
import { PERSONA_PRESETS, TRUSTED_PROTOCOLS } from '../../lib/policyEngine'
import { AppShell, GlowButton, Input, Label, MetricCard, PageHeader, SectionCard, Select, StatusBadge } from '../../components/darkagent/Ui'

const DEFAULT_PROFILE = 'alice.eth'

export default function DashboardPage() {
  const { state, updatePolicy, busy } = useDarkAgent()
  const profile = state?.policies?.find((entry) => entry.ensName === DEFAULT_PROFILE)

  const [form, setForm] = useState({
    persona: 'balanced',
    maxTradeUsd: 800,
    maxSlippageBps: 125,
    trustedProtocolsOnly: true,
    blockMemeCoins: true,
    blockUnknownTokens: true,
    allowLowLiquidityAssets: false,
    trustedProtocols: 'Jupiter, Uniswap, 1inch, Aave',
    ai_bot: 300,
    influencer: 200,
    friend: 150,
    unknown: 0,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!profile?.stored) return
    const stored = profile.stored
    setForm({
      persona: stored.persona,
      maxTradeUsd: stored.maxTradeUsd,
      maxSlippageBps: stored.maxSlippageBps,
      trustedProtocolsOnly: stored.trustedProtocolsOnly !== false,
      blockMemeCoins: stored.blockMemeCoins,
      blockUnknownTokens: stored.blockUnknownTokens !== false,
      allowLowLiquidityAssets: stored.allowLowLiquidityAssets === true,
      trustedProtocols: (stored.trustedProtocols || TRUSTED_PROTOCOLS).join(', '),
      ai_bot: stored.sourceLimits?.ai_bot ?? 300,
      influencer: stored.sourceLimits?.influencer ?? 200,
      friend: stored.sourceLimits?.friend ?? 150,
      unknown: stored.sourceLimits?.unknown ?? 0,
    })
  }, [profile])

  const summary = useMemo(
    () => [
      `Max trade size: $${form.maxTradeUsd}`,
      `AI bot max: $${form.ai_bot}`,
      `Influencer max: $${form.influencer}`,
      form.blockMemeCoins ? 'Meme coins blocked' : 'Meme coins allowed',
      form.blockUnknownTokens ? 'Unknown tokens blocked' : 'Unknown tokens allowed',
      form.trustedProtocolsOnly ? 'Trusted protocols only' : 'Expanded protocol access',
    ],
    [form]
  )

  function applyPersona(persona) {
    const preset = PERSONA_PRESETS[persona]
    setForm({
      persona,
      maxTradeUsd: preset.maxTradeUsd,
      maxSlippageBps: preset.maxSlippageBps,
      trustedProtocolsOnly: preset.trustedProtocolsOnly,
      blockMemeCoins: preset.blockMemeCoins,
      blockUnknownTokens: preset.blockUnknownTokens,
      allowLowLiquidityAssets: preset.allowLowLiquidityAssets,
      trustedProtocols: preset.trustedProtocols.join(', '),
      ai_bot: preset.sourceLimits.ai_bot,
      influencer: preset.sourceLimits.influencer,
      friend: preset.sourceLimits.friend,
      unknown: preset.sourceLimits.unknown,
    })
    setSaved(false)
  }

  async function handleSave() {
    await updatePolicy(DEFAULT_PROFILE, {
      persona: form.persona,
      maxTradeUsd: Number(form.maxTradeUsd),
      maxSlippageBps: Number(form.maxSlippageBps),
      trustedProtocolsOnly: form.trustedProtocolsOnly,
      blockMemeCoins: form.blockMemeCoins,
      blockUnknownTokens: form.blockUnknownTokens,
      allowLowLiquidityAssets: form.allowLowLiquidityAssets,
      minLiquidityUsd: form.allowLowLiquidityAssets ? 75000 : 250000,
      trustedProtocols: form.trustedProtocols
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
      sourceLimits: {
        ai_bot: Number(form.ai_bot),
        influencer: Number(form.influencer),
        friend: Number(form.friend),
        unknown: Number(form.unknown),
      },
    })
    setSaved(true)
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Policy dashboard"
        title="Set your personal trading firewall."
        description="Choose a persona, tune your limits, and define how DarkAgent treats AI bots, influencers, friends, and unknown Blink sources."
        actions={<StatusBadge status={saved ? 'safe' : 'downsized'}>{saved ? 'Policy saved' : 'Live demo policy'}</StatusBadge>}
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <SectionCard>
          <div className="flex items-center gap-3 text-white">
            <Shield className="h-5 w-5 text-vault-green" />
            <div className="text-xl font-semibold">Persona selection</div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {Object.values(PERSONA_PRESETS).map((preset) => (
              <button
                key={preset.persona}
                onClick={() => applyPersona(preset.persona)}
                className={`rounded-[24px] border p-5 text-left transition ${
                  form.persona === preset.persona
                    ? 'border-vault-green/30 bg-vault-green/10'
                    : 'border-white/10 bg-black/20 hover:border-vault-blue/20'
                }`}
              >
                <div className="text-lg font-semibold capitalize text-white">{preset.persona}</div>
                <div className="mt-2 text-sm text-slate-300">Max trade ${preset.maxTradeUsd}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.22em] text-vault-slate">
                  {preset.blockMemeCoins ? 'Strict meme filtering' : 'Flexible token access'}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div>
              <Label>Max trade size</Label>
              <Input value={form.maxTradeUsd} onChange={(event) => setForm((current) => ({ ...current, maxTradeUsd: event.target.value }))} />
            </div>
            <div>
              <Label>Max slippage (bps)</Label>
              <Input value={form.maxSlippageBps} onChange={(event) => setForm((current) => ({ ...current, maxSlippageBps: event.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <Label>Trusted protocols</Label>
              <Input value={form.trustedProtocols} onChange={(event) => setForm((current) => ({ ...current, trustedProtocols: event.target.value }))} />
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <ToggleCard label="Trusted protocols only" active={form.trustedProtocolsOnly} onClick={() => setForm((current) => ({ ...current, trustedProtocolsOnly: !current.trustedProtocolsOnly }))} />
            <ToggleCard label="Block meme coins" active={form.blockMemeCoins} onClick={() => setForm((current) => ({ ...current, blockMemeCoins: !current.blockMemeCoins }))} />
            <ToggleCard label="Block unknown tokens" active={form.blockUnknownTokens} onClick={() => setForm((current) => ({ ...current, blockUnknownTokens: !current.blockUnknownTokens }))} />
            <ToggleCard label="Allow low liquidity assets" active={form.allowLowLiquidityAssets} onClick={() => setForm((current) => ({ ...current, allowLowLiquidityAssets: !current.allowLowLiquidityAssets }))} />
          </div>

          <div className="mt-8 flex items-center gap-3 text-white">
            <SlidersHorizontal className="h-5 w-5 text-vault-blue" />
            <div className="text-xl font-semibold">Source-based limits</div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <Label>AI bot max amount</Label>
              <Input value={form.ai_bot} onChange={(event) => setForm((current) => ({ ...current, ai_bot: event.target.value }))} />
            </div>
            <div>
              <Label>Influencer max amount</Label>
              <Input value={form.influencer} onChange={(event) => setForm((current) => ({ ...current, influencer: event.target.value }))} />
            </div>
            <div>
              <Label>Friend max amount</Label>
              <Input value={form.friend} onChange={(event) => setForm((current) => ({ ...current, friend: event.target.value }))} />
            </div>
            <div>
              <Label>Unknown source max amount</Label>
              <Input value={form.unknown} onChange={(event) => setForm((current) => ({ ...current, unknown: event.target.value }))} />
            </div>
          </div>

          <div className="mt-8">
            <GlowButton onClick={handleSave} className="bg-vault-green text-black hover:bg-vault-green/90 disabled:opacity-60" disabled={busy}>
              <CheckCircle2 className="h-4 w-4" /> {busy ? 'Saving...' : 'Save policy'}
            </GlowButton>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <div className="text-sm uppercase tracking-[0.24em] text-vault-slate">Policy summary</div>
            <div className="mt-4 space-y-3">
              {summary.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard label="Current profile" value={form.persona} detail="Applies to alice.eth in the demo" />
            <MetricCard label="Watcher status" value={profile?.pendingSync ? 'Pending sync' : 'Live'} detail="Backend policy mirror for the Blink proxy" />
          </div>

          <SectionCard>
            <div className="text-sm uppercase tracking-[0.24em] text-vault-slate">Preloaded profile values</div>
            <div className="mt-4 grid gap-3">
              {[['Conservative', '$300 max, meme blocked, unknown blocked'], ['Balanced', '$800 max, moderate flexibility'], ['Aggressive', '$2000 max, wider protocol access']].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="font-semibold text-white">{title}</div>
                  <div className="mt-1 text-sm text-slate-400">{body}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  )
}

function ToggleCard({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border px-4 py-4 text-left text-sm transition ${
        active ? 'border-vault-green/20 bg-vault-green/10 text-vault-green' : 'border-white/10 bg-black/20 text-slate-300'
      }`}
    >
      {label}
    </button>
  )
}
