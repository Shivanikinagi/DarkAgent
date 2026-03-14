import { Clock3, ExternalLink, ShieldCheck, ShieldX, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { demoBlinks } from '../../data/demo'
import { useDarkAgent } from '../../context/DarkAgentContext'
import { AppShell, GlowButton, PageHeader, SectionCard, StatusBadge } from '../../components/darkagent/Ui'

const fallbackActivity = [
  {
    id: 'blocked-demo',
    createdAt: new Date().toISOString(),
    sourceName: '@MoonAlphaX',
    protocol: 'Jupiter',
    amountUsd: 1000,
    status: 'blocked',
    reason: 'Blocked because meme coins are disabled and the amount exceeds the influencer limit.',
    tokenOut: 'MEME',
  },
  {
    id: 'downsized-demo',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    sourceName: '@DeepTrendBot',
    protocol: 'Jupiter',
    amountUsd: 800,
    status: 'auto-downsize',
    reason: 'Trade downsized from 800 USD to 300 USD for ai_bot.',
    tokenOut: 'ETH',
  },
  {
    id: 'safe-demo',
    createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    sourceName: 'Riya',
    protocol: 'Uniswap',
    amountUsd: 120,
    status: 'executed',
    reason: 'Blink fits your current trading policy.',
    tokenOut: 'ETH',
  },
]

function formatTime(value) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusForBadge(status) {
  if (status === 'blocked') return 'blocked'
  if (status === 'auto-downsize') return 'downsized'
  if (status === 'executed') return 'safe'
  return 'risky'
}

export default function ActivityPage() {
  const { state } = useDarkAgent()
  const events = state?.activity?.length ? state.activity : fallbackActivity

  return (
    <AppShell>
      <PageHeader
        eyebrow="Activity log"
        title="A clean timeline of every Blink verdict."
        description="Track what DarkAgent allowed, blocked, and downsized so the product feels like a live consumer security layer, not a static demo."
        actions={<StatusBadge status="safe">{events.length} events</StatusBadge>}
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <SectionCard>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-semibold text-white">{event.sourceName || event.ensName || 'DarkAgent system'}</div>
                      <StatusBadge status={statusForBadge(event.status)}>{event.status}</StatusBadge>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                      <Clock3 className="h-4 w-4" /> {formatTime(event.createdAt)}
                    </div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                    {event.protocol || 'system'}
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-300">
                  {event.amountUsd ? `$${event.amountUsd} - ${event.tokenOut || 'trade action'}` : 'Background policy or watcher event'}
                </div>
                <div className="mt-3 text-sm leading-6 text-white">{event.reason || 'No reason captured.'}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard>
            <div className="text-sm uppercase tracking-[0.24em] text-vault-slate">Demo scenarios</div>
            <div className="mt-4 space-y-3">
              {demoBlinks.map((blink, index) => (
                <div key={blink.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-white">{blink.title}</div>
                    <StatusBadge status={index === 0 ? 'safe' : index === 1 ? 'blocked' : 'downsized'}>
                      {index === 0 ? 'Safe' : index === 1 ? 'Blocked' : 'Downsized'}
                    </StatusBadge>
                  </div>
                  <div className="mt-2 text-sm text-slate-400">{blink.source} - {blink.protocol} - ${blink.amount}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <div className="text-sm uppercase tracking-[0.24em] text-vault-slate">Next steps</div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-4 w-4 text-vault-green" />
                <span>Show judges how policy edits on the dashboard change verdicts instantly.</span>
              </div>
              <div className="flex items-start gap-3">
                <ShieldX className="mt-1 h-4 w-4 text-red-300" />
                <span>Use the blocked influencer Blink to show the strongest risk explanation moment.</span>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 h-4 w-4 text-sky-300" />
                <span>Use the downsized AI trade to show DarkAgent rewriting a Blink instead of just rejecting it.</span>
              </div>
            </div>
            <GlowButton as={Link} to="/create" className="mt-6 border border-white/10 bg-white/5 text-white hover:bg-white/10">
              <ExternalLink className="h-4 w-4" /> Generate another Blink
            </GlowButton>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  )
}
