import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Custom hook for managing navigation menu state
function useNavigationMenu() {
  const [open, setOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

  return {
    open,
    setOpen,
    activeIndex,
    setActiveIndex,
  }
}

// Navigation Menu Context
type NavigationMenuContextValue = ReturnType<typeof useNavigationMenu>

const NavigationMenuContext = React.createContext<NavigationMenuContextValue>(
  {} as NavigationMenuContextValue
)

function useNavigationMenuContext() {
  const context = React.useContext(NavigationMenuContext)
  if (!context) {
    throw new Error(
      "Navigation Menu components must be used within a NavigationMenu"
    )
  }
  return context
}

// Simplified Navigation Menu components
type NavigationMenuProps = React.HTMLAttributes<HTMLDivElement>

const NavigationMenu = React.forwardRef<HTMLDivElement, NavigationMenuProps>(
  ({ className, children, ...props }, ref) => {
    const navigationMenu = useNavigationMenu()

    return (
      <NavigationMenuContext.Provider value={navigationMenu}>
        <div
          ref={ref}
          className={cn(
            "relative z-10 flex max-w-max flex-1 items-center justify-center",
            className
          )}
          {...props}
        >
          {children}
          <NavigationMenuViewport />
        </div>
      </NavigationMenuContext.Provider>
    )
  }
)
NavigationMenu.displayName = "NavigationMenu"

type NavigationMenuListProps = React.HTMLAttributes<HTMLUListElement>

const NavigationMenuList = React.forwardRef<HTMLUListElement, NavigationMenuListProps>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn(
        "group flex flex-1 list-none items-center justify-center space-x-1",
        className
      )}
      {...props}
    />
  )
)
NavigationMenuList.displayName = "NavigationMenuList"

const NavigationMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("relative", className)}
    {...props}
  />
))
NavigationMenuItem.displayName = "NavigationMenuItem"

// Style for navigation menu trigger
const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-active:bg-accent/50 data-[state=open]:bg-accent/50"
)

type NavigationMenuTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>

const NavigationMenuTrigger = React.forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useNavigationMenuContext()

    return (
      <button
        ref={ref}
        className={cn(navigationMenuTriggerStyle(), "group", className)}
        onClick={() => setOpen(!open)}
        data-state={open ? "open" : "closed"}
        {...props}
      >
        {children}{" "}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "relative top-[1px] ml-1 h-3 w-3 transition duration-300",
            open ? "rotate-180" : "rotate-0"
          )}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    )
  }
)
NavigationMenuTrigger.displayName = "NavigationMenuTrigger"

type NavigationMenuContentProps = React.HTMLAttributes<HTMLDivElement>

const NavigationMenuContent = React.forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  ({ className, ...props }, ref) => {
    const { open } = useNavigationMenuContext()

    if (!open) return null

    return (
      <div
        ref={ref}
        className={cn(
          "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto",
          className
        )}
        {...props}
      />
    )
  }
)
NavigationMenuContent.displayName = "NavigationMenuContent"

type NavigationMenuLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  active?: boolean
}

const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  ({ className, active, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        active && "bg-accent text-accent-foreground",
        className
      )}
      {...props}
    />
  )
)
NavigationMenuLink.displayName = "NavigationMenuLink"

type NavigationMenuViewportProps = React.HTMLAttributes<HTMLDivElement>

const NavigationMenuViewport = React.forwardRef<HTMLDivElement, NavigationMenuViewportProps>(
  ({ className, ...props }, ref) => {
    const { open } = useNavigationMenuContext()

    return (
      <div className={cn("absolute left-0 top-full flex justify-center")}>
        <div
          ref={ref}
          className={cn(
            "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
            !open && "hidden",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
NavigationMenuViewport.displayName = "NavigationMenuViewport"

type NavigationMenuIndicatorProps = React.HTMLAttributes<HTMLDivElement>

const NavigationMenuIndicator = React.forwardRef<HTMLDivElement, NavigationMenuIndicatorProps>(
  ({ className, ...props }, ref) => {
    const { open } = useNavigationMenuContext()
    
    if (!open) return null
    
    return (
      <div
        ref={ref}
        className={cn(
          "top-full z-1 flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
          className
        )}
        data-state={open ? "visible" : "hidden"}
        {...props}
      >
        <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
      </div>
    )
  }
)
NavigationMenuIndicator.displayName = "NavigationMenuIndicator"

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
}
