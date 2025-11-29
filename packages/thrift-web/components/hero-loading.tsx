// import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Montagu_Slab } from 'next/font/google'

const font = Montagu_Slab({ weight: '500', subsets: ['latin'] })

export function HeroLoading({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const text = 'Create lasting|memories shopping|with Thrift.'
  return (
    <div className="h-screen">
      <Image
        width="1920"
        height="1080"
        src="/laptop-unboxing-hd.jpg" // Public ID of your video
        className="z-0 absolute inset-0 top-0 h-screen w-full object-cover"
        alt="unboxing laptop placeholder"
        priority={true}
      />
      <div
        className={
          'text-black-500 dark:text-foreground flex flex-col gap-16 md:gap-32 text-3xl sm:text-8xl capitalize p-8 md:p-16 bg-foreground/60 dark:bg-background/60 inset-0 top-0 absolute font-extrabold z-5 h-full text-left items-start justify-end'
        }
      >
        <span className={'block w-full ' + font?.className}>
          {text.split('|')}
        </span>
        {children}
      </div>
    </div>
  )
}
