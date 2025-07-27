import * as React from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "../ui/Button"

const CarouselContext = React.createContext()

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback(() => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [api])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api) return

    setApi?.(api)
    onSelect()
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api.off("select", onSelect)
    }
  }, [api, onSelect, setApi])

  return (
    <CarouselContext.Provider
      value={{
        carouselApi: api,
        api: {
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        },
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        ref={carouselRef}
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({
  className,
  children,
  ...props
}) {
  const { carouselApi } = React.useContext(CarouselContext)

  return (
    <div className={cn("flex", className)} {...props}>
      <div className="flex w-full">
        {children}
      </div>
    </div>
  )
}

function CarouselItem({
  className,
  children,
  ...props
}) {
  return (
    <div
      className={cn("min-w-0 flex-[0_0_100%]", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  children,
  ...props
}) {
  const { api, canScrollPrev } = React.useContext(CarouselContext)

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("absolute left-4 top-1/2 -translate-y-1/2", className)}
      disabled={!canScrollPrev}
      onClick={api?.scrollPrev}
      {...props}
    >
      {children || <ArrowLeft className="h-4 w-4" />}
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  children,
  ...props
}) {
  const { api, canScrollNext } = React.useContext(CarouselContext)

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("absolute right-4 top-1/2 -translate-y-1/2", className)}
      disabled={!canScrollNext}
      onClick={api?.scrollNext}
      {...props}
    >
      {children || <ArrowRight className="h-4 w-4" />}
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
