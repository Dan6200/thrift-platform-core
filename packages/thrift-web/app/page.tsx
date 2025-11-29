import Link from 'next/link'
import { ProductsHome } from '@/components/products/home-page'
import { MoveRight } from 'lucide-react'
import { Hero } from '@/components/hero'
import { CTA } from '@/components/cta'
import { Suspense } from 'react'
import { HeroLoading } from '@/components/hero-loading'
import { verifySession } from '@/auth/server/definitions'

export default async function Home() {
  let isAuthenticated = true
  try {
    await verifySession()
  } catch (error) {
    isAuthenticated = false
  }

  return (
    <div className="w-full mx-auto space-y-8 md:space-y-16">
      {!isAuthenticated && (
        <Suspense
          fallback={
            <HeroLoading>
              <CTA />
            </HeroLoading>
          }
        >
          <Hero className="text-background dark:text-foreground flex flex-col gap-16 md:gap-32">
            <CTA />
          </Hero>
        </Suspense>
      )}
      <ProductsHome />
      <Link
        href="/products"
        className="dark:text-blue-200 text-blue-700 block w-fit my-8 ml-[60%] sm:ml-[80%]"
      >
        See more
        <MoveRight className="inline ml-2" />
      </Link>
    </div>
  )
}
