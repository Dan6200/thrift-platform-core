import { cn } from '@/lib/utils'
import AnimatedText from './ui/animated-text'
import { CldVideoPlayer } from 'next-cloudinary'
import 'next-cloudinary/dist/cld-video-player.css'

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
      <CldVideoPlayer
        width="1920"
        height="1080"
        src="sellit-media/hero/laptop-unboxing-hd" // Public ID of your video
        autoPlay="always"
        loop={true}
        muted={true}
        className="absolute inset-0 h-full w-full object-cover"
      />
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
