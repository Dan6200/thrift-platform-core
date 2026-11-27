import { Skeleton } from '@/components/ui/skeleton'

export function SearchLoading() {
  const placeholder = 'bg-foreground/10 motion-reduce:animate-none'
  return (
    <div role="status" aria-busy="true" className="py-2">
      <span className="sr-only">Loading search results</span>
      <div aria-hidden="true" className="space-y-4">
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className="flex h-20 items-center gap-4 rounded-md p-2"
          >
            <Skeleton className={`h-16 w-16 shrink-0 ${placeholder}`} />
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className={`h-5 w-3/5 ${placeholder}`} />
              <Skeleton className={`h-4 w-4/5 ${placeholder}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
