import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Menu, Search, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
  DrawerTitle,
} from '@/components/ui/drawer'
import { PanelRightClose, UserCircle2 } from 'lucide-react'
import { components } from './nav-components'
import { ModeToggle } from '@/components/dark-mode-toggle'
import { useSetAtom } from 'jotai'
import { useCart } from '@/lib/cart/use-cart'
import SearchComp from '@/components/search'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { signOutWrapper } from '@/app/auth'
import { Montagu_Slab } from 'next/font/google'
import { Profile } from '@/types/profile'
import { usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'

type SetUser = ReturnType<typeof useSetAtom<Profile | null, any[], any>>

const font = Montagu_Slab({ weight: '500', subsets: ['latin'] })

export const NavMenuSmall = ({
  user,
  setUser,
}: {
  user: User | Profile | null
  setUser: SetUser
}) => {
  const [showSearchBox, setShowSearchBox] = useState(false)
  const { data: cart } = useCart()
  const totalItems = cart?.total_items ?? 0
  const searchRef = useRef<null | HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setShow(false)
    setShowSearchBox(false)
  }, [pathname])

  return (
    <div
      className={cn(
        'z-10 max-w-none flex flex-row items-center justify-between w-[95vw] mx-auto my-8 px-3 h-16',
        'relative',
        pathname === '/' &&
          !user &&
          'rounded-xl bg-background/85 backdrop-blur-xl text-foreground shadow-sm',
      )}
    >
      <Link
        href="/"
        className={`${font?.className} text-secondary text-2xl font-bold`}
      >
        Thrift
      </Link>
      <div className="flex items-center justify-between gap-1">
        <Dialog open={showSearchBox} onOpenChange={setShowSearchBox}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="h-11 w-11 border-none bg-transparent"
              size="icon"
              aria-label="Search products"
            >
              <Search aria-hidden="true" />
            </Button>
          </DialogTrigger>
          <DialogContent
            aria-describedby={undefined}
            className="top-4 translate-y-0 w-[95vw] max-h-[90svh] overflow-y-auto bg-background/90 backdrop-blur-xl text-foreground [&>button]:h-11 [&>button]:w-11"
          >
            <DialogTitle className="pr-12">Search products</DialogTitle>
            <SearchComp
              className="flex w-full flex-col items-center"
              ref={searchRef}
              {...{ show, setShow, setShowSearchBox }}
            />
          </DialogContent>
        </Dialog>
        <Link
          href="/shopping-cart"
          aria-label={`Shopping cart, ${totalItems} items`}
          className="relative flex h-11 w-11 items-center justify-center rounded-md hover:bg-accent/75 focus-visible:outline-2 focus-visible:outline-foreground"
        >
          <ShoppingCart className="w-5" aria-hidden="true" />
          {!!totalItems && (
            <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-sm text-primary-foreground dark:text-background">
              {totalItems}
            </span>
          )}
        </Link>
        {user ? (
          <Link
            href="/account"
            aria-label="Your account"
            className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-accent/75 focus-visible:outline-2 focus-visible:outline-foreground"
          >
            <UserCircle2 />
          </Link>
        ) : (
          <Button
            asChild
            className="h-11 px-3 bg-primary/90 backdrop-blur-xl text-primary-foreground dark:text-background hover:bg-primary/95"
          >
            <Link href="/auth/login">Sign In</Link>
          </Button>
        )}
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="h-11 w-11 bg-transparent border-none"
              aria-label="Open menu"
              size="icon"
            >
              <Menu />
            </Button>
          </DrawerTrigger>
          <DrawerContent
            aria-describedby={undefined}
            className="h-full w-[85vw] max-w-sm overflow-y-auto p-4 bg-background/90 backdrop-blur-xl text-foreground"
          >
            <DrawerTitle className="sr-only">Navigation</DrawerTitle>
            <DrawerClose asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Close menu"
                className="h-11 w-11 border-none relative bg-transparent"
              >
                <PanelRightClose />
              </Button>
            </DrawerClose>
            <Accordion type="single" collapsible className="my-8">
              <AccordionItem value="item-1">
                <AccordionTrigger className="hover:no-underline">
                  Welcome
                  {user &&
                    `, ${(user as Profile).first_name ?? (user as User).user_metadata.first_name}`}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col space-y-3 p-4">
                    <Link
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-primary/90 backdrop-blur-xl text-primary-foreground dark:text-background p-6 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                      href="/"
                    >
                      <div className="mb-2 mt-4 text-lg font-medium">
                        Thrift Commerce
                      </div>
                      <p className="text-sm leading-snug">
                        Shop new handpicked deals in categories such as
                        electronics, computers & tablets, fashion & fashion
                        accessories etc.
                      </p>
                    </Link>
                    <Link
                      href="/deals/new-arrivals"
                      title="New Arrivals"
                      className="block min-h-11 rounded-md p-2 hover:bg-accent/75 focus-visible:outline-2 focus-visible:outline-foreground"
                    >
                      New Arrivals for fashion and fashion accessories.
                    </Link>
                    <Link
                      href="/deals/electronics"
                      title="Deals on Electronics"
                      className="block min-h-11 rounded-md p-2 hover:bg-accent/75 focus-visible:outline-2 focus-visible:outline-foreground"
                    >
                      Hot new deals on electronic items such as TVs, mobile
                      phones and household electronics
                    </Link>
                    <Link
                      href="/deals/computers"
                      title="Computer Deals"
                      className="block min-h-11 rounded-md p-2 hover:bg-accent/75 focus-visible:outline-2 focus-visible:outline-foreground"
                    >
                      Hot new deals on computers and computer accessories.
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="hover:no-underline">
                  Browse Categories
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col space-y-3 p-4">
                    {components.map((component) => (
                      <Link
                        key={component.title}
                        title={component.title}
                        href={component.href}
                        className="block min-h-11 rounded-md p-2 hover:bg-accent/75 focus-visible:outline-2 focus-visible:outline-foreground"
                      >
                        {component.description}
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <ModeToggle />
            </Accordion>
            {user && (
              <Button
                className="w-full text-destructive text-md bg-transparent"
                onClick={user ? signOutWrapper.bind(null, setUser) : undefined}
              >
                Sign out
              </Button>
            )}
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}
