'use client'
import { cn } from '@/lib/utils'
import AnimatedText from './ui/animated-text'
import { useAtomValue } from 'jotai'
import { isSmallScreenAtom } from '@/atoms'

export function Hero({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const isSmallScreen = useAtomValue(isSmallScreenAtom)
  const text = isSmallScreen
    ? 'Create lasting memories shopping with Thrift.'
    : 'Create lasting|memories shopping|with Thrift.'
  const delim = isSmallScreen ? ' ' : '|'
  return (
    <div className="h-screen">
      <video
        width="1920"
        height="1080"
        src="/laptop-unboxing-hd.mp4" // Public ID of your video
        playsInline={true}
        loop={true}
        muted={true}
        className="z-0 absolute inset-0 top-0 h-screen w-full object-cover"
      />
      <div
        className={cn(
          'text-3xl sm:text-8xl capitalize p-8 md:p-16 bg-foreground/60 dark:bg-background/60 inset-0 top-0 absolute font-extrabold z-5 flex h-full text-left items-start justify-end',
          className,
        )}
      >
        <AnimatedText text={text} delim={delim} />
        {children}
      </div>
    </div>
  )
}
