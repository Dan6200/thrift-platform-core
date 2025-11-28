// cspell:ignore womens
'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ModeToggle } from '../../dark-mode-toggle'
import { Button } from '../../ui/button'
import { useAtomValue, useSetAtom } from 'jotai'
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
import { getTotalCountAtom } from '@/atoms'
import { ShoppingCartDrawerContent } from '@/components/shopping-cart/drawer'
import { Drawer, DrawerTrigger } from '@/components/ui/drawer'
import Search from '@/components/search'
import { signOutWrapper } from '@/app/auth'
import { Montagu_Slab } from 'next/font/google'
import { Profile } from '@/types/profile'
import { usePathname } from 'next/navigation'

type SetUser = ReturnType<typeof useSetAtom<Profile | null, any[], any>>

const font = Montagu_Slab({ weight: '500', subsets: ['latin'] })

export function NavMenu({
  user,
  setUser,
}: {
  user: Profile | null
  setUser: SetUser
}) {
  const pathname = usePathname()
  const totalItems = useAtomValue(getTotalCountAtom)
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
      className={`max-w-none flex flex-row items-center justify-between w-[95vw] mx-auto px-4 my-8 h-16 rounded-xl shadow-lg bg-accent/60 dark:bg-accent/20`}
    >
      <div className="justify-start flex items-center">
        <Link
          href="/"
          className={`${font?.className} text-secondary text-2xl font-bold`}
        >
          Thrift
        </Link>
        <NavigationMenuList className="ml-16 bg-transparent">
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent hover:bg-white/20 focus:bg-white/20 rounded-md">
              Welcome
            </NavigationMenuTrigger>
            <NavigationMenuContent className="rounded-xl backdrop-blur-md bg-accent/30">
              <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <Link
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/80 to-secondary text-primary-foreground dark:from-primary/40 dark:to-secondary/50 p-6 no-underline outline-none focus:shadow-md"
                      href="/"
                    >
                      <div className="mb-2 mt-4 text-lg font-bold">
                        Thrift Commerce
                      </div>
                      <p className="text-sm leading-tight text-primary-foreground dark:text-primary-foreground/80">
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
            <NavigationMenuTrigger className="bg-transparent hover:bg-white/20 focus:bg-white/20 rounded-md">
              Browse Categories
            </NavigationMenuTrigger>
            <NavigationMenuContent className="rounded-xl backdrop-blur-xl bg-accent/30">
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
        className="absolute top-0 sm:top-0 w-80 sm:w-[25rem] border-white/20 flex flex-col z-100 items-center mt-[.75rem] left-[50%] translate-x-[-50%]"
        ref={searchRef}
        {...{ show, setShow }}
      />
      <div className="flex space-x-4 items-center justify-between">
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <div className="relative h-12 w-12 p-0 z-10">
              {!!totalItems && (
                <span className="bg-primary text-primary-foreground w-6 text-center block absolute right-0 top-0 text-sm rounded-full">
                  {totalItems}
                </span>
              )}
              <Button
                variant="outline"
                className="my-2 p-0 w-10 bg-transparent hover:bg-white/20 focus:bg-white/20 border-none"
              >
                <ShoppingCart className="w-5" />
              </Button>
            </div>
          </DrawerTrigger>
          <ShoppingCartDrawerContent />
        </Drawer>
        {user ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="border-none bg-transparent hover:bg-white/20 focus:bg-white/20"
              >
                Hello,
                {user && user.first_name && (
                  <span className="w-20 flex items-center justify-between">
                    {user.first_name}
                    <UserCircle2 />
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="rounded-xl glass-effect">
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
          <Link href="/auth/login">
            <Button
              type="button"
              className="text-md py-1 px-3 bg-primary/80 hover:bg-primary"
            >
              Sign In
            </Button>
          </Link>
        )}
        <ModeToggle />
      </div>
    </NavigationMenu>
  )
}
