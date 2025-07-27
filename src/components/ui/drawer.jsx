import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"
import { cn } from "@/lib/utils"

function Drawer({
  shouldScaleBackground = true,
  ...props
}) {
  return (
    <DrawerPrimitive.Root
      shouldScaleBackground={shouldScaleBackground}
      {...props}
    />
  )
}

function DrawerTrigger({
  asChild = false,
  className,
  children,
  ...props
}) {
  return (
    <DrawerPrimitive.Trigger
      asChild={asChild}
      className={cn("", className)}
      {...props}
    >
      {children}
    </DrawerPrimitive.Trigger>
  )
}

function DrawerPortal({
  className,
  children,
  ...props
}) {
  return (
    <DrawerPrimitive.Portal className={cn("", className)} {...props}>
      <div className="fixed inset-0 z-50 bg-black/80" />
      {children}
    </DrawerPrimitive.Portal>
  )
}

function DrawerOverlay({
  className,
  ...props
}) {
  return (
    <DrawerPrimitive.Overlay
      className={cn("fixed inset-0 z-50 bg-black/80", className)}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  ...props
}) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
          className
        )}
        {...props}
      >
        <div className="mx-auto mt-4 h-1.5 w-[100px] rounded-full bg-muted" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({
  className,
  children,
  ...props
}) {
  return (
    <div
      className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function DrawerFooter({
  className,
  children,
  ...props
}) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function DrawerTitle({
  className,
  children,
  ...props
}) {
  return (
    <DrawerPrimitive.Title
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </DrawerPrimitive.Title>
  )
}

function DrawerDescription({
  className,
  children,
  ...props
}) {
  return (
    <DrawerPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </DrawerPrimitive.Description>
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
