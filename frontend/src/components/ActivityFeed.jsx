import ActivityFeedItem from './ActivityFeedItem'

export default function ActivityFeed({ items = [], maxItems = 100 }) {
  const sorted = [...items]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, maxItems)

  if (!sorted.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-vault-slate">
        <span className="text-3xl mb-3">📭</span>
        <p className="text-sm">No activity yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto max-h-[480px] divide-y divide-vault-slate/10 pr-1">
      {sorted.map((item) => (
        <ActivityFeedItem key={item.id} {...item} />
      ))}
    </div>
  )
}
