import { CTA } from '@/components/cta'
import { HeroLoading } from '@/components/hero-loading'

export default function HomeLoading() {
  return (
    <div className="w-full mx-auto space-y-8 md:space-y-16">
      <HeroLoading>
        <CTA />
      </HeroLoading>
    </div>
  )
}
