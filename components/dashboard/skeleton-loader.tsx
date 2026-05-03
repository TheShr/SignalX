export function CardSkeleton() {
  return (
    <div className="glass rounded-lg p-6 border border-white/10 space-y-4">
      <div className="animate-shimmer h-6 w-3/4 rounded" />
      <div className="space-y-2">
        <div className="animate-shimmer h-4 w-full rounded" />
        <div className="animate-shimmer h-4 w-5/6 rounded" />
      </div>
      <div className="flex justify-between">
        <div className="animate-shimmer h-6 w-20 rounded" />
        <div className="animate-shimmer h-6 w-16 rounded" />
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="glass rounded-lg p-6 border border-white/10">
      <div className="animate-shimmer h-6 w-40 rounded mb-6" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="animate-shimmer h-12 flex-1 rounded" />
            <div className="animate-shimmer h-12 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
