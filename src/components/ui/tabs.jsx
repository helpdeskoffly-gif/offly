import * as React from "react"
import { gsap } from "gsap"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext()

function Tabs({
  value,
  onValueChange,
  className,
  children,
  ...props
}) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("flex flex-col gap-2", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function TabsList({
  className,
  children,
  ...props
}) {
  return (
    <div
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function TabsTrigger({
  value,
  className,
  children,
  ...props
}) {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext)
  const isSelected = selectedValue === value
  const buttonRef = React.useRef(null)

  React.useEffect(() => {
    if (isSelected && buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 1.05,
        duration: 0.2,
        ease: "power2.out"
      })
    } else if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out"
      })
    }
  }, [isSelected])

  return (
    <button
      ref={buttonRef}
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        isSelected && "data-[state=active]:bg-background dark:data-[state=active]:text-foreground data-[state=active]:border-input dark:data-[state=active]:bg-input/30 data-[state=active]:shadow-sm",
        className
      )}
      onClick={() => onValueChange(value)}
      data-state={isSelected ? "active" : "inactive"}
      {...props}
    >
      {children}
    </button>
  )
}

function TabsContent({
  value,
  className,
  children,
  ...props
}) {
  const { value: selectedValue } = React.useContext(TabsContext)
  const isSelected = selectedValue === value
  const contentRef = React.useRef(null)

  React.useEffect(() => {
    if (isSelected && contentRef.current) {
      gsap.fromTo(contentRef.current, 
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      )
    }
  }, [isSelected])

  if (!isSelected) return null

  return (
    <div
      ref={contentRef}
      className={cn("flex-1 outline-none", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
