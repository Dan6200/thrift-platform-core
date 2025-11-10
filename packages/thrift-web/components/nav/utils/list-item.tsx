import React from 'react'
import { NavigationMenuLink } from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

export const ListItem = React.forwardRef<
  React.ComponentRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/20',
            className,
          )}
          {...props}
        >
          <div className="font-bold text-base leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})

ListItem.displayName = 'ListItem'
