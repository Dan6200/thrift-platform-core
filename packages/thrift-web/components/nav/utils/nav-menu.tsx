// cspell:ignore womens
'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ModeToggle } from '../../dark-mode-toggle'
import { Button } from '../../ui/button'
import { useSetAtom } from 'jotai'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { ListItem } from '../utils/list-item'
import { components } from '../utils/nav-components'
import { ShoppingCart, UserCircle2 } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useCart } from '@/lib/cart/use-cart'
import { ShoppingCartDrawerContent } from '@/components/shopping-cart/drawer'
import { Drawer, DrawerTrigger } from '@/components/ui/drawer'
import Search from '@/components/search'
import { signOutWrapper } from '@/app/auth'
import { Montagu_Slab } from 'next/font/google'
import { usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/types/profile'

type SetUser = ReturnType<typeof useSetAtom<User | Profile | null, any[], any>>

const font = Montagu_Slab({ weight: '500', subsets: ['latin'] })

export function NavMenu({
  user,
  setUser,
}: {
  user: User | Profile | null
  setUser: SetUser
}) {
  const pathname = usePathname()
  const { data: cart } = useCart()
  const totalItems = cart?.total_items ?? 0
  const searchRef = useRef<null | HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    document.addEventListener('click', hide)
    return () => document.removeEventListener('click', hide)
  }, [])
  const hide = (e: Event) => {
    if (searchRef.current && !searchRef.current.contains(e.target as any)) {
      setShow(false)
    }
  }
  useEffect(() => {
    setShow(false)
  }, [pathname])
  return (
    <NavigationMenu
      className={`max-w-none flex flex-row items-center justify-between w-[95vw] mx-auto px-4 my-8 h-16 ${pathname === '/' && !user ? 'rounded-xl bg-background text-foreground shadow-sm' : ''}`}
    >
      <div className="justify-start flex items-center">
        <Link
          href="/"
          className={`${font?.className} text-secondary text-2xl font-bold`}
        >
          Thrift
        </Link>
        <NavigationMenuList className="ml-6 bg-transparent">
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent hover:bg-accent focus-visible:ring-2 focus-visible:ring-foreground rounded-md">
              Welcome
            </NavigationMenuTrigger>
            <NavigationMenuContent className="rounded-xl bg-popover text-popover-foreground">
              <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <Link
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-primary text-primary-foreground dark:text-background p-6 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                      href="/"
                    >
                      <div className="mb-2 mt-4 text-lg font-bold">
                        Thrift Commerce
                      </div>
                      <p className="text-sm leading-snug">
                        Shop new handpicked deals in categories such as
                        electronics, computers & tablets, fashion & fashion
                        accessories etc.
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                <ListItem href="/deals/new-arrivals" title="New Arrivals">
                  New Arrivals for fashion and fashion accessories.
                </ListItem>
                <ListItem
                  href="/deals/electronics"
                  title="Deals on Electronics"
                >
                  Hot new deals on electronic items such as TVs, mobile phones
                  and household electronics
                </ListItem>
                <ListItem href="/deals/computers" title="Computer Deals">
                  Hot new deals on computers and computer accessories.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent hover:bg-accent focus-visible:ring-2 focus-visible:ring-foreground rounded-md">
              Browse Categories
            </NavigationMenuTrigger>
            <NavigationMenuContent className="rounded-xl bg-popover text-popover-foreground">
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </div>
      <Search
        className="relative mx-6 flex min-w-0 max-w-md flex-1 flex-col items-center z-20"
        ref={searchRef}
        {...{ show, setShow }}
      />
      <div className="flex space-x-4 items-center justify-between">
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              aria-label={`Shopping cart, ${totalItems} items`}
              className="relative h-11 w-11 border-none bg-transparent hover:bg-accent focus-visible:ring-2 focus-visible:ring-foreground"
            >
              <ShoppingCart className="w-5" aria-hidden="true" />
              {!!totalItems && (
                <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-sm text-primary-foreground dark:text-background">
                  {totalItems}
                </span>
              )}
            </Button>
          </DrawerTrigger>
          <ShoppingCartDrawerContent />
        </Drawer>
        {user ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="border-none bg-transparent hover:bg-accent focus-visible:ring-2 focus-visible:ring-foreground"
              >
                Hello,
                {user && (
                  <span className="w-20 flex items-center justify-between">
                    {(user as Profile).first_name ??
                      (user as User).user_metadata.first_name}
                    <UserCircle2 />
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="rounded-xl bg-popover text-popover-foreground">
              <section className="flex flex-col space-y-2">
                <Link
                  href="/create-vendor"
                  className="rounded-md p-2 hover:bg-white/20"
                >
                  Create A Vendor Account
                </Link>
                <Button
                  className="w-full text-destructive text-md bg-transparent hover:bg-destructive/20"
                  onClick={
                    user ? signOutWrapper.bind(null, setUser) : undefined
                  }
                >
                  Sign out
                </Button>
              </section>
            </PopoverContent>
          </Popover>
        ) : (
          <Button
            asChild
            className="min-h-11 bg-primary text-primary-foreground dark:text-background hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-foreground"
          >
            <Link href="/auth/login">Sign In</Link>
          </Button>
        )}
        <ModeToggle />
      </div>
    </NavigationMenu>
  )
}
