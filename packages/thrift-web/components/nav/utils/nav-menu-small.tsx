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
} from '@/components/ui/drawer'
import { PanelRightClose, UserCircle2 } from 'lucide-react'
import { components } from './nav-components'
import { ModeToggle } from '@/components/dark-mode-toggle'
import { useAtomValue, useSetAtom } from 'jotai'
import { getTotalCountAtom } from '@/atoms'
import SearchComp from '@/components/search'
import { cn } from '@/lib/utils'
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
  const totalItems = useAtomValue(getTotalCountAtom)
  const searchOverLayRef = useRef<null | HTMLDivElement>(null)
  const searchRef = useRef<null | HTMLDivElement>(null)
  const toggleSearchButton = useRef<null | HTMLButtonElement>(null)
  const [show, setShow] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setShow(false)
    setShowSearchBox(false)
  }, [pathname])

  useEffect(() => {
    document.addEventListener('click', hide)
    return () => document.removeEventListener('click', hide)
  }, [])

  const hide = (e: Event) => {
    if (
      searchRef.current &&
      !searchRef.current.contains(e.target as any) &&
      !toggleSearchButton.current?.contains(e.target as any)
    ) {
      setShow(false)
      setShowSearchBox(false)
    }
  }

  return (
    <div
      className={cn(
        'z-10 max-w-none flex flex-row items-center justify-between w-[95vw] mx-auto my-8 px-4 h-16',
        showSearchBox ? '' : 'relative',
      )}
    >
      <Link
        href="/"
        className={`${font?.className} text-secondary text-2xl font-bold`}
      >
        Thrift
      </Link>
      <div className="flex items-center justify-between space-x-2">
        <Button
          variant={'outline'}
          className="bg-transparent self-center border-none"
          size="icon"
          onClick={() => setShowSearchBox(true)}
          ref={toggleSearchButton}
        >
          <Search />
        </Button>
        <Link href="/shopping-cart" className="block relative h-12 w-12 p-0">
          {!!totalItems && (
            <span className="bg-primary text-primary-foreground w-6 text-center block absolute right-0 top-0 text-sm rounded-full">
              {totalItems}
            </span>
          )}
          <Button
            variant="outline"
            size="icon"
            className="my-2 p-0 w-10 bg-transparent border-none"
          >
            <ShoppingCart className="w-5" />
          </Button>
        </Link>
        {user ? (
          <Link
            href="/account"
            className="active:bg-neutral-300 dark:active:bg-neutral-700"
          >
            <UserCircle2 />
          </Link>
        ) : (
          <Link href="/auth/login">
            <Button type="button" className="py-1 px-3 text-md h-8">
              Sign In
            </Button>
          </Link>
        )}
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              className="bg-transparent border-none"
              size="icon"
            >
              <Menu />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-full w-[70vw] sm:w-[50vw] p-4 thick-glass-effect">
            <DrawerClose asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-none relative bg-transparent"
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
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/80 to-secondary/90 text-primary-foreground dark:from-primary/40 dark:to-secondary/50 p-6 no-underline outline-none focus:shadow-md"
                      href="/"
                    >
                      <div className="mb-2 mt-4 text-lg font-medium">
                        Thrift Commerce
                      </div>
                      <p className="text-sm leading-tight text-primary-foreground dark:text-primary-foreground/80">
                        Shop new handpicked deals in categories such as
                        electronics, computers & tablets, fashion & fashion
                        accessories etc.
                      </p>
                    </Link>
                    <Link
                      href="/deals/new-arrivals"
                      title="New Arrivals"
                      className="active:bg-neutral-300 dark:active:bg-neutral-700"
                    >
                      New Arrivals for fashion and fashion accessories.
                    </Link>
                    <Link
                      href="/deals/electronics"
                      title="Deals on Electronics"
                      className="active:bg-neutral-300 dark:active:bg-neutral-700"
                    >
                      Hot new deals on electronic items such as TVs, mobile
                      phones and household electronics
                    </Link>
                    <Link
                      href="/deals/computers"
                      title="Computer Deals"
                      className="active:bg-neutral-300 dark:active:bg-neutral-700"
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
                  <ul className="flex flex-col space-y-3 p-4">
                    {components.map((component) => (
                      <Link
                        key={component.title}
                        title={component.title}
                        href={component.href}
                        className="active:bg-neutral-300 dark:active:bg-neutral-700"
                      >
                        {component.description}
                      </Link>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <ModeToggle />
            </Accordion>
            {user && (
              <Link href="/account">
                <Button
                  className="w-full text-destructive text-md bg-transparent"
                  onClick={
                    user ? signOutWrapper.bind(null, setUser) : undefined
                  }
                >
                  Sign out
                </Button>
              </Link>
            )}
          </DrawerContent>
        </Drawer>
      </div>
      <div
        className={cn(
          'absolute z-10 top-0 left-0 w-full h-screen bg-background/60 backdrop-blur-md',
          showSearchBox ? '' : 'hidden',
        )}
        ref={searchOverLayRef}
      >
        <SearchComp
          className="absolute z-10 top-0 sm:top-0 w-80 sm:w-[25rem] flex flex-col items-center  mt-[.75rem] left-[50%] translate-x-[-50%]"
          ref={searchRef}
          {...{ show, setShow, setShowSearchBox }}
        />
      </div>
    </div>
  )
}
