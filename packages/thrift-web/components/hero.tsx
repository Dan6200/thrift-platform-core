import { cn } from '@/lib/utils'
import AnimatedText from './ui/animated-text'

export function Hero({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const text = 'Create lasting memories shopping with Thrift.'
  return (
    <div className="h-screen">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src="/laptop-unboxing-hd.mp4"
        poster="/laptop-unboxing-hd.jpg"
      ></video>
      <div
        className={cn(
          'text-5xl sm:text-[7rem] uppercase p-8 md:p-16 bg-foreground/60 dark:bg-background/60 top-0 absolute font-extrabold z-5 flex h-screen text-left items-start justify-center',
          className,
        )}
      >
        <AnimatedText text={text} />
        {children}
      </div>
    </div>
  )
}
