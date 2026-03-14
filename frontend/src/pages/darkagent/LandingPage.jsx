import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Bot, ShieldCheck, ShieldX, Sparkles, Twitter } from 'lucide-react'
import { demoBlinks, featureHighlights, productPrinciples } from '../../data/demo'
import { AppShell, GlowButton, HeroMockCard, MetricCard, PageHeader, SectionCard, StatusBadge } from '../../components/darkagent/Ui'

export default function LandingPage() {
  return (
    <AppShell>
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <PageHeader
            eyebrow="Personal firewall for trading Blinks on X"
            title="Not every Blink deserves your wallet."
            description="DarkAgent analyzes AI- and influencer-generated trading Blinks before execution, scores them against your personal risk policy, and blocks unsafe trades before they reach your wallet."
            actions={
              <>
                <GlowButton as={Link} to="/create" className="bg-vault-green text-black hover:bg-vault-green/90">
                  Try Demo <ArrowRight className="h-4 w-4" />
                </GlowButton>
                <GlowButton as={Link} to="/dashboard" className="border border-white/10 bg-white/5 text-white hover:bg-white/10">
                  Set Your Policy
                </GlowButton>
                <GlowButton as={Link} to={`/analyze?source=ai_bot&action=swap&tokenIn=USDC&tokenOut=ETH&amountUsd=100&protocol=Jupiter&chain=Solana&sender=%40DeepTrendBot`} className="border border-sky-400/20 bg-sky-400/10 text-sky-200 hover:bg-sky-400/15">
                  Analyze a Blink
                </GlowButton>
              </>
            }
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <MetricCard label="Decision time" value="< 2 sec" detail="Policy verdict from a pasted Blink URL" />
            <MetricCard label="Core outcomes" value="4" detail="Safe, Risky, Blocked, Downsized" />
            <MetricCard label="Built for" value="X + AI" detail="Social and agent-driven trade distribution" />
          </div>
        </div>

        <div className="grid gap-4">
          <HeroMockCard
            title="Safe AI rotation"
            subtitle="Trusted protocol + blue-chip asset"
            status="safe"
            lines={[
              { label: 'Source', value: 'AI Bot' },
              { label: 'Trade', value: 'USDC -> ETH' },
              { label: 'Policy fit', value: 'Fully approved' },
            ]}
          />
          <HeroMockCard
            title="Influencer meme call"
            subtitle="Blocked before execution"
            status="blocked"
            lines={[
              { label: 'Source', value: 'Influencer' },
              { label: 'Token', value: 'MEME' },
              { label: 'Reason', value: 'Meme coins disabled' },
            ]}
          />
          <HeroMockCard
            title="Oversized AI trade"
            subtitle="Automatically rewritten"
            status="downsized"
            lines={[
              { label: 'Original', value: '$800' },
              { label: 'Safe amount', value: '$300' },
              { label: 'Action', value: 'Rewritten Blink' },
            ]}
          />
        </div>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-3">
        {featureHighlights.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
          >
            <SectionCard className="h-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-vault-green">
                {index === 0 ? <Twitter className="h-5 w-5" /> : index === 1 ? <Sparkles className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{feature.body}</p>
            </SectionCard>
          </motion.div>
        ))}
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-vault-slate">How it works</div>
              <h2 className="mt-3 text-3xl font-semibold text-white">A trust layer for social trading.</h2>
            </div>
            <StatusBadge status="safe">Consumer product</StatusBadge>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ['1', 'Paste or generate a Blink', 'Create a shareable Blink or open one from X, Telegram, or a trading feed.'],
              ['2', 'DarkAgent analyzes the trade', 'Source, token, protocol, amount, slippage, and liquidity are checked instantly.'],
              ['3', 'Policy firewall decides', 'DarkAgent returns Safe, Risky, Blocked, or Downsized with exact reasons.'],
              ['4', 'Only the safe version moves forward', 'If it can be executed, DarkAgent forwards the approved amount and shows an execution preview.'],
            ].map(([step, title, body]) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-vault-green/10 text-sm font-semibold text-vault-green">{step}</div>
                <div className="mt-4 text-lg font-semibold text-white">{title}</div>
                <div className="mt-2 text-sm leading-6 text-slate-300">{body}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <div className="text-sm uppercase tracking-[0.24em] text-vault-slate">Example verdicts</div>
          <div className="mt-5 space-y-4">
            {demoBlinks.map((blink, index) => (
              <div key={blink.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{blink.title}</div>
                    <div className="mt-1 text-sm text-slate-400">
                      {blink.source} - {blink.tokenIn} to {blink.tokenOut} - ${blink.amount}
                    </div>
                  </div>
                  {index === 0 ? <StatusBadge status="safe">Safe</StatusBadge> : index === 1 ? <StatusBadge status="blocked">Blocked</StatusBadge> : <StatusBadge status="downsized">Downsized</StatusBadge>}
                </div>
                <div className="mt-3 text-sm text-slate-300">
                  {index === 0
                    ? 'Trusted source, blue-chip asset, and size fits policy.'
                    : index === 1
                      ? 'Influencer meme call violates both token and size rules.'
                      : 'AI trade is acceptable but gets rewritten to the safe amount.'}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionCard>
          <div className="text-sm uppercase tracking-[0.24em] text-vault-slate">Why DarkAgent stands out</div>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            {productPrinciples.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-4 w-4 text-vault-green" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard className="overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-vault-slate">Product positioning</div>
              <h2 className="mt-3 text-3xl font-semibold text-white">A startup-grade demo for safe social trading through Blinks.</h2>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <StatusBadge status="blocked">Unsafe call blocked</StatusBadge>
              <StatusBadge status="downsized">Trade rewritten</StatusBadge>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
              <ShieldCheck className="h-5 w-5 text-emerald-200" />
              <div className="mt-3 text-lg font-semibold text-emerald-50">Safe</div>
              <div className="mt-2 text-sm text-emerald-100/80">The Blink matches your policy and can proceed.</div>
            </div>
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5">
              <ShieldX className="h-5 w-5 text-amber-100" />
              <div className="mt-3 text-lg font-semibold text-amber-50">Risky</div>
              <div className="mt-2 text-sm text-amber-100/80">DarkAgent surfaces slippage, liquidity, and trust warnings before execution.</div>
            </div>
            <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-5">
              <Sparkles className="h-5 w-5 text-sky-100" />
              <div className="mt-3 text-lg font-semibold text-sky-50">Downsized</div>
              <div className="mt-2 text-sm text-sky-100/80">Oversized trades are rewritten into a safe Blink instead of just rejected.</div>
            </div>
          </div>
        </SectionCard>
      </section>
    </AppShell>
  )
}
