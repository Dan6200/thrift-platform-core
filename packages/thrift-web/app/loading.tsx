// import { Montagu_Slab } from 'next/font/google'
import { CTA } from '@/components/cta'
import { HeroLoading } from '@/components/hero-loading'

// const font = Montagu_Slab({ weight: '500', subsets: ['latin'] })

export default function HomeLoading() {
  return (
    <div className="w-full mx-auto space-y-8 md:space-y-16">
      <HeroLoading>
        <CTA />
      </HeroLoading>
    </div>
  )
}
