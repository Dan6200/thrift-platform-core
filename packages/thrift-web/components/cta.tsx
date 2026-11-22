import { cn } from '@/lib/utils'
import Link from 'next/link'

export function CTA({
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  const base =
    'inline-flex min-h-12 w-full items-center justify-center rounded-xl px-6 py-3 text-base sm:text-lg font-semibold transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'
  return (
    <div
      className={cn(
        'flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:gap-6',
        className,
      )}
    >
      <Link
        href="/products"
        className={cn(
          base,
          'bg-primary text-primary-foreground dark:text-background hover:bg-primary/90',
        )}
      >
        Browse
      </Link>
      <Link
        href="/create-store"
        className={cn(
          base,
          'border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
        )}
      >
        Start selling
      </Link>
    </div>
  )
}
