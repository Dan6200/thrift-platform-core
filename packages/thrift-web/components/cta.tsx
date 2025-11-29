import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from './ui/button'

export function CTA({
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'text-base sm:text-lg flex flex-col sm:flex-row gap-3 md:gap-6 lg:gap-24 w-3/4 md:w-[50vw] lg:w-[40vw] md:items-start',
        className,
      )}
    >
      <Link href="/products" className="h-9 sm:h-12 w-full flex-1">
        <button
          type="button"
          className="h-full px-4 py-2 items-center justify-center rounded-md sm:rounded-lg md:rounded-xl transition-colors duration-1000 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 flex w-full bg-primary hover:bg-secondary capitalize text-primary-foreground font-semibold hover:shadow-lg shadow-primary hover:shadow-primary/30"
        >
          Browse
        </button>
      </Link>
      <Link href="/create-store" className="h-9 sm:h-12 w-full flex-1">
        <Button
          type="button"
          variant="outline"
          className="h-full text-base sm:text-lg w-full capitalize font-semibold text-background hover:bg-foreground border-none hover:text-background transition-colors duration-1000 bg-foreground/80 rounded-md sm:rounded-xl"
        >
          Start selling
        </Button>
      </Link>
    </div>
  )
}
