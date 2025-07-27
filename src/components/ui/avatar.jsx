import * as React from "react"
import { cn } from "@/lib/utils"

function Avatar({
  className,
  children,
  ...props
}) {
  return (
    <div
      className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function AvatarImage({
  className,
  src,
  alt,
  ...props
}) {
  return (
    <img
      className={cn("aspect-square size-full", className)}
      src={src}
      alt={alt}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  children,
  ...props
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Avatar, AvatarImage, AvatarFallback }
