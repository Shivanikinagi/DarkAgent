import { useMemo } from 'react'
import { ArrowRight, Bot, CheckCircle2, ShieldAlert, Twitter } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDarkAgent } from '../../context/DarkAgentContext'
import { AppShell, GlowButton, PageHeader, ProductPulse, SectionCard, StatusBadge, ViewportFit, WalletSummaryCard } from '../../components/darkagent/Ui'
import { DEFAULT_ENS_PROFILE, formatUsd } from '../../lib/product'
import { feedEntryToHref, shareToEntry } from '../../lib/liveFeed'

export default function LandingPage() {
  const { state } = useDarkAgent()
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
  const liveStats = [
    {
      label: 'Policies',
      value: state?.policies?.length || 1,
      detail: DEFAULT_ENS_PROFILE,
      icon: ShieldAlert,
    },
    {
      label: 'Reviews',
      value: state?.activity?.length || 0,
      detail: 'Agent requests checked',
      icon: Bot,
    },
    {
      label: 'Proofs',
      value: state?.proofs?.length || 0,
      detail: 'Audit trail created',
      icon: CheckCircle2,
    },
  ]

  return (
    <AppShell>
      <ViewportFit>
        <section className="mx-auto flex max-w-5xl flex-col gap-6 py-4">
          <PageHeader
            eyebrow="Live AI wallet control"
            actions={<StatusBadge status="safe">Base + wallet live</StatusBadge>}
          />

          <SectionCard className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <div className="text-xs uppercase tracking-[0.24em] text-vault-slate">Live Intercept</div>
                <h2 className="mt-2 text-2xl font-semibold text-white">Paste a real Blink URL and let DarkAgent catch it first.</h2>
                <div className="mt-2 text-sm text-slate-300">
                  The live flow starts when you paste a Blink into Inbox. DarkAgent intercepts it against your current rulebook before the wallet sees anything.
                </div>
              </div>
              <GlowButton as={Link} to="/create" className="border border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]">
                Paste Blink URL
              </GlowButton>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#1d9bf0]/25 bg-[#1d9bf0]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-sky-200">
                  <Twitter className="h-3.5 w-3.5" />
                  Real Intercept Path
                </div>
                <div className="mt-4 text-lg font-semibold text-white">1. Paste Blink URL</div>
                <div className="mt-2 text-sm text-slate-300">Bring any Blink or agent-generated action link into DarkAgent.</div>
                <div className="mt-4 text-lg font-semibold text-white">2. DarkAgent checks live rules</div>
                <div className="mt-2 text-sm text-slate-300">The local server reads your current policy and returns a real verdict.</div>
                <div className="mt-4 text-lg font-semibold text-white">3. Wallet only sees safe actions</div>
                <div className="mt-2 text-sm text-slate-300">Blocked Blinks stop here. Safe Blinks continue to Base approval.</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-vault-slate">Recent Shared Blinks</div>
                {recentShares.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {recentShares.map((blink) => (
                      <Link
                        key={blink.id}
                        to={feedEntryToHref(blink, window.location.origin)}
                        className="block rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-white/15"
                      >
                        <div className="text-sm font-semibold text-white">{blink.label}</div>
                        <div className="mt-1 text-sm text-slate-400">
                          {blink.parsedBlink?.sourceName || 'Unknown source'} · {formatUsd(blink.parsedBlink?.amountUsd)}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                    No live shared Blinks yet. Paste one in Inbox to start the flow.
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <SectionCard className="p-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-slate-300">
                  Blink interception layer
                </div>
                <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                  DarkAgent acts like the extension between a Blink and your wallet.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                  When an agent or social feed opens a Blink, DarkAgent intercepts it, checks the live rulebook, and only forwards a safe action to Base.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <GlowButton as={Link} to="/create" className="bg-vault-green text-black hover:bg-vault-green/90">
                    Open Blink lab <ArrowRight className="h-4 w-4" />
                  </GlowButton>
                  <GlowButton as={Link} to="/dashboard" className="border border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]">
                    Edit ENS policy
                  </GlowButton>
                </div>

                <div className="mt-8 grid gap-3 md:grid-cols-3">
                  <StepCard label="1" title="Blink opens" />
                  <StepCard label="2" title="DarkAgent intercepts" />
                  <StepCard label="3" title="Wallet sees safe actions only" />
                </div>
              </div>
            </SectionCard>

            <div className="space-y-5">
              <WalletSummaryCard detail="Use this wallet during the demo." />
            </div>
          </div>

          <ProductPulse stats={liveStats} />
        </section>
      </ViewportFit>
    </AppShell>
  )
}

function StepCard({ label, title }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.24em] text-vault-slate">{label}</div>
      <div className="mt-2 text-sm font-medium text-white">{title}</div>
    </div>
  )
}
