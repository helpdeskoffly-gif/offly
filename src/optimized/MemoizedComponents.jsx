import React, { memo, useRef } from "react";
import { gsap } from "gsap";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";

// Memoized Card component
export const MemoizedCard = memo(({ className, children, ...props }) => (
  <Card className={className} {...props}>
    {children}
  </Card>
));

// Memoized Button component
export const MemoizedButton = memo(
  ({ children, onClick, className, variant, size, ...props }) => (
    <Button
      onClick={onClick}
      className={className}
      variant={variant}
      size={size}
      {...props}
    >
      {children}
    </Button>
  ),
);

// Memoized Badge component
export const MemoizedBadge = memo(({ className, children, ...props }) => (
  <Badge className={className} {...props}>
    {children}
  </Badge>
));

// Memoized Progress component
export const MemoizedProgress = memo(({ value, className, ...props }) => (
  <Progress value={value} className={className} {...props} />
));

// Memoized Floating Background Element
export const MemoizedFloatingElement = memo(
  ({ className, style, animate, transition, children }) => (
    <motion.div
      className={className}
      style={style}
      animate={animate}
      transition={transition}
    >
      {children}
    </motion.div>
  ),
);

// Memoized Hero Section
export const MemoizedHeroSection = memo(
  ({ children, className, variants, initial, animate }) => (
    <motion.div
      className={className}
      variants={variants}
      initial={initial}
      animate={animate}
    >
      {children}
    </motion.div>
  ),
);

// Set display names for debugging
MemoizedCard.displayName = "MemoizedCard";
MemoizedButton.displayName = "MemoizedButton";
MemoizedBadge.displayName = "MemoizedBadge";
MemoizedProgress.displayName = "MemoizedProgress";
MemoizedFloatingElement.displayName = "MemoizedFloatingElement";
MemoizedHeroSection.displayName = "MemoizedHeroSection";
