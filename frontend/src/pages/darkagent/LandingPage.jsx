import { ArrowRight, Bot, CheckCircle2, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDarkAgent } from '../../context/DarkAgentContext'
import { AppShell, GlowButton, PageHeader, ProductPulse, SectionCard, StatusBadge, ViewportFit, WalletSummaryCard } from '../../components/darkagent/Ui'
import { DEFAULT_ENS_PROFILE } from '../../lib/product'

export default function LandingPage() {
  const { state } = useDarkAgent()
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

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <SectionCard className="p-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-slate-300">
                  AI agent to onchain approval
                </div>
               

                <div className="mt-6 flex flex-wrap gap-3">
                  <GlowButton as={Link} to="/create" className="bg-vault-green text-black hover:bg-vault-green/90">
                    Open inbox <ArrowRight className="h-4 w-4" />
                  </GlowButton>
                  <GlowButton as={Link} to="/dashboard" className="border border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]">
                    Set policy
                  </GlowButton>
                </div>

                <div className="mt-8 grid gap-3 md:grid-cols-3">
                  <StepCard label="1" title="Agent sends Blink" />
                  <StepCard label="2" title="DarkAgent reviews" />
                  <StepCard label="3" title="Wallet signs safe action" />
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
