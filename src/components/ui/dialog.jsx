import * as React from "react"
import { gsap } from "gsap"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const DialogContext = React.createContext()

function Dialog({
  open,
  onOpenChange,
  children,
  ...props
}) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
          <div className="relative z-50" {...props}>
            {children}
          </div>
        </div>
      )}
    </DialogContext.Provider>
  )
}

function DialogTrigger({
  asChild = false,
  children,
  ...props
}) {
  const { onOpenChange } = React.useContext(DialogContext)
  
  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => onOpenChange(true),
      ...props
    })
  }
  
  return (
    <button onClick={() => onOpenChange(true)} {...props}>
      {children}
    </button>
  )
}

function DialogContent({
  className,
  children,
  ...props
}) {
  const { onOpenChange } = React.useContext(DialogContext)
  const contentRef = React.useRef(null)
  
  React.useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, 
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power2.out" }
      )
    }
  }, [])

  return (
    <div
      ref={contentRef}
      className={cn(
        "relative grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <button
        onClick={() => onOpenChange(false)}
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}

function DialogHeader({
  className,
  children,
  ...props
}) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function DialogFooter({
  className,
  children,
  ...props
}) {
  return (
    <div
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function DialogTitle({
  className,
  children,
  ...props
}) {
  return (
    <h2
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    >
      {children}
    </h2>
  )
}

function DialogDescription({
  className,
  children,
  ...props
}) {
  return (
    <p
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    >
      {children}
    </p>
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
