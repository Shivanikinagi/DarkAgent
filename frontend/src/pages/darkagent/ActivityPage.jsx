import { Clock3 } from 'lucide-react'
import { useDarkAgent } from '../../context/DarkAgentContext'
import { AppShell, PageHeader, ProductPulse, SectionCard, StatusBadge, ViewportFit } from '../../components/darkagent/Ui'

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
  const events = state?.activity || []

  return (
    <AppShell>
      <ViewportFit>
        <>
          <PageHeader
            eyebrow="Ops log"
            title="Live activity."
            description="Recent reviews, executions, and syncs."
            actions={<StatusBadge status="safe">{events.length} events</StatusBadge>}
          />

          <div className="mt-6">
            <ProductPulse
              stats={[
                {
                  label: 'Analyses',
                  value: events.filter((event) => event.type === 'analysis' || event.status === 'blocked').length,
                  detail: 'Reviewed',
                },
                {
                  label: 'Executions',
                  value: events.filter((event) => event.type === 'execution' || event.status === 'executed').length,
                  detail: 'Moved forward',
                },
                {
                  label: 'Watcher',
                  value: events.filter((event) => event.type === 'watcher').length,
                  detail: 'Policy syncs',
                },
              ]}
            />
          </div>

          <SectionCard className="mt-6">
            {events.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-black/20 p-5 text-sm text-slate-300">
                No live events yet.
              </div>
            ) : (
              <div className="grid gap-3">
                {events.slice(0, 8).map((event) => (
                  <div key={event.id} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="font-semibold text-white">{event.sourceName || event.ensName || 'DarkAgent system'}</div>
                          <StatusBadge status={statusForBadge(event.status)}>{event.status}</StatusBadge>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                          <Clock3 className="h-4 w-4" /> {formatTime(event.createdAt)}
                        </div>
                      </div>
                      <div className="text-sm text-slate-400">{event.protocol || 'system'}</div>
                    </div>
                    <div className="mt-2 text-sm text-slate-300">{event.amountUsd ? `$${event.amountUsd}` : 'System event'}</div>
                    <div className="mt-1.5 text-sm text-white">{event.reason || 'No reason captured.'}</div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      </ViewportFit>
    </AppShell>
  )
}
