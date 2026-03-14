import { Link, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, ShieldAlert, ShieldCheck, ShieldX, Sparkles, Twitter } from 'lucide-react'

const verdictStyles = {
  safe: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  risky: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  blocked: 'border-red-400/20 bg-red-400/10 text-red-200',
  downsized: 'border-sky-400/20 bg-sky-400/10 text-sky-200',
}

const verdictIcons = {
  safe: ShieldCheck,
  risky: ShieldAlert,
  blocked: ShieldX,
  downsized: Sparkles,
}

export function AppShell({ children }) {
  const navItems = [
    ['/', 'Home'],
    ['/dashboard', 'Policy'],
    ['/create', 'Create Blink'],
    ['/analyze', 'Analyze'],
    ['/activity', 'Activity'],
  ]

  return (
    <div className="min-h-screen bg-[#090d12] text-vault-text">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_left,rgba(0,255,136,0.10),transparent_32%)]" />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090d12]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-vault-green/20 bg-vault-green/10 text-vault-green shadow-[0_0_30px_rgba(0,255,136,0.15)]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">DarkAgent</div>
              <div className="text-xs uppercase tracking-[0.24em] text-vault-slate">Trading Blink Firewall</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 md:flex">
            {navItems.map(([href, label]) => (
              <NavLink
                key={href}
                to={href}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm transition ${
                    isActive ? 'bg-white/10 text-white' : 'text-vault-slate hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <a
            href="/create"
            className="inline-flex items-center gap-2 rounded-full border border-vault-green/20 bg-vault-green/10 px-4 py-2 text-sm font-medium text-vault-green transition hover:bg-vault-green/15"
          >
            <Twitter className="h-4 w-4" /> Launch Demo
          </a>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-8">{children}</main>
    </div>
  )
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <div className="text-sm uppercase tracking-[0.28em] text-vault-slate">{eyebrow}</div>}
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">{title}</h1>
        {description && <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  )
}

export function SectionCard({ className = '', children }) {
  return (
    <div className={`rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.22)] backdrop-blur-xl ${className}`}>
      {children}
    </div>
  )
}

export function MetricCard({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs uppercase tracking-[0.22em] text-vault-slate">{label}</div>
      <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
      {detail && <div className="mt-2 text-sm text-slate-400">{detail}</div>}
    </div>
  )
}

export function StatusBadge({ status, children }) {
  const Icon = verdictIcons[status] || ShieldAlert
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${verdictStyles[status] || verdictStyles.risky}`}>
      <Icon className="h-3.5 w-3.5" />
      {children || status}
    </span>
  )
}

export function GlowButton({ as: Comp = 'button', className = '', children, ...props }) {
  return (
    <Comp
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${className}`}
      {...props}
    >
      {children}
    </Comp>
  )
}

export function Label({ children }) {
  return <div className="mb-2 text-xs uppercase tracking-[0.22em] text-vault-slate">{children}</div>
}

export function Input(props) {
  return <input {...props} className={`input-shell ${props.className || ''}`} />
}

export function Textarea(props) {
  return <textarea {...props} className={`input-shell resize-none ${props.className || ''}`} />
}

export function Select(props) {
  return <select {...props} className={`input-shell ${props.className || ''}`} />
}

export function HeroMockCard({ title, subtitle, status, lines }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="rounded-[28px] border border-white/10 bg-black/30 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.28)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="mt-1 text-sm text-slate-400">{subtitle}</div>
        </div>
        <StatusBadge status={status}>{status}</StatusBadge>
      </div>
      <div className="mt-5 space-y-3">
        {lines.map((line) => (
          <div key={line.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
            <span className="text-slate-400">{line.label}</span>
            <span className="font-medium text-white">{line.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
