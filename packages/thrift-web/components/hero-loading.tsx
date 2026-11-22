import Image from 'next/image'
import { Montagu_Slab } from 'next/font/google'
import { cn } from '@/lib/utils'
import { heroContent, heroFrame, heroHeading, heroTitle } from './hero-layout'
const font = Montagu_Slab({ weight: '500', subsets: ['latin'] })

export function HeroLoading({
  children,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section aria-labelledby="hero-heading" className={heroFrame}>
      <Image
        width={1920}
        height={1080}
        src="/laptop-unboxing-hd.jpg"
        className="absolute inset-0 h-full w-full object-cover"
        alt=""
        priority
      />
      <div className={cn(heroContent, font.className)}>
        <h1 id="hero-heading" className={heroHeading}>
          {heroTitle.split('|').map((line) => (
            <span className="block" key={line}>
              {line}
            </span>
          ))}
        </h1>
        {children}
      </div>
    </section>
  )
}
