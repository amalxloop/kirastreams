"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-14 w-fit items-center justify-center rounded-xl p-1.5 bg-background/30 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-base font-medium whitespace-nowrap transition-all duration-300",
        "text-muted-foreground/80",
        "hover:text-foreground hover:bg-white/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:text-foreground data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-500/20 data-[state=active]:to-fuchsia-500/20",
        "data-[state=active]:backdrop-blur-xl data-[state=active]:border data-[state=active]:border-violet-400/30",
        "data-[state=active]:shadow-[0_0_24px_rgba(139,92,246,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }