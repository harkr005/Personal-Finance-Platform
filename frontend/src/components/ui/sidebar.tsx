import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r shadow-lg flex flex-col",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex h-16 items-center px-6 border-b", className)}
    {...props}
  />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <ScrollArea className="flex-1">
    <div
      ref={ref}
      className={cn("px-4 py-6", className)}
      {...props}
    />
  </ScrollArea>
))
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border-t p-4", className)}
    {...props}
  />
))
SidebarFooter.displayName = "SidebarFooter"

interface SidebarNavItemProps extends React.HTMLAttributes<HTMLElement> {
  active?: boolean
  asChild?: boolean
}

const SidebarNavItem = React.forwardRef<HTMLElement, SidebarNavItemProps>(
  ({ className, active, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "a"
    return (
      <Comp
        ref={ref}
        className={cn(
          "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          active
            ? "bg-primary/10 text-primary border-r-2 border-primary"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          className
        )}
        {...props}
      />
    )
  }
)
SidebarNavItem.displayName = "SidebarNavItem"

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarNavItem,
}

