import { useMemo } from 'react'
import { ArrowRight, Bot, CheckCircle2, ShieldAlert, Twitter } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDarkAgent } from '../../context/DarkAgentContext'
import { AppShell, GlowButton, PageHeader, ProductPulse, SectionCard, StatusBadge, ViewportFit, WalletSummaryCard } from '../../components/darkagent/Ui'
import { DEFAULT_ENS_PROFILE, formatUsd } from '../../lib/product'
import { decisionToStatus, feedEntryToHref } from '../../lib/liveFeed'

export default function LandingPage() {
  const { state } = useDarkAgent()
  const liveBlinks = useMemo(() => state?.feed || [], [state?.feed])
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
                <div className="text-xs uppercase tracking-[0.24em] text-vault-slate">Try Demo</div>
                <h2 className="mt-2 text-2xl font-semibold text-white">Open a live Blink from the local server feed.</h2>
                <div className="mt-2 text-sm text-slate-300">
                  These cards are rendered from the running DarkAgent server, then checked against your saved policy when you open them.
                </div>
              </div>
              <GlowButton as={Link} to="/dashboard" className="border border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]">
                Set Twitter rule
              </GlowButton>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {liveBlinks.map((blink) => {
                const status = decisionToStatus(blink.analysis?.decision)
                return (
                  <Link
                    key={blink.id}
                    to={feedEntryToHref(blink, window.location.origin)}
                    className="rounded-3xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20 hover:bg-black/30"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#1d9bf0]/25 bg-[#1d9bf0]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-sky-200">
                        <Twitter className="h-3.5 w-3.5" />
                        Server feed
                      </div>
                      <StatusBadge status={status}>{status}</StatusBadge>
                    </div>

                    <div className="mt-4 text-lg font-semibold text-white">{blink.label}</div>
                    <div className="mt-2 text-sm text-slate-300">{blink.analysis?.summary || blink.parsedBlink?.summary}</div>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
                      <span>{blink.parsedBlink?.sourceName}</span>
                      <span>{formatUsd(blink.parsedBlink?.amountUsd)}</span>
                      <span>{blink.parsedBlink?.tokenIn} to {blink.parsedBlink?.tokenOut}</span>
                      <span>{blink.parsedBlink?.protocol} on {blink.parsedBlink?.chain}</span>
                    </div>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-vault-green">
                      Open in DarkAgent <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                )
              })}
            </div>
            {liveBlinks.length === 0 && (
              <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-slate-300">
                No live Blink entries are being served yet.
              </div>
            )}
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <SectionCard className="p-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-slate-300">
                  Twitter Blink to wallet approval
                </div>
                <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                  DarkAgent sits between social Blinks and your Base wallet.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                  When a Blink appears on Twitter, DarkAgent checks the request against your ENS-linked safety rules before any approval can happen.
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
                  <StepCard label="1" title="Twitter sends Blink" />
                  <StepCard label="2" title="DarkAgent catches it" />
                  <StepCard label="3" title="Wallet sees only safe actions" />
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
