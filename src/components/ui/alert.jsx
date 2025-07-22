import React from "react";

const Alert = React.forwardRef(({ className = "", variant = "default", ...props }, ref) => {
  const baseClasses = "relative w-full rounded-lg border p-4";

  const variantClasses = {
    default: "bg-background text-foreground border-border",
    destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-800",
    warning: "border-yellow-500/50 text-yellow-900 dark:text-yellow-100 bg-yellow-50 dark:bg-yellow-950/10 border-yellow-200 dark:border-yellow-800",
    success: "border-green-500/50 text-green-900 dark:text-green-100 bg-green-50 dark:bg-green-950/10 border-green-200 dark:border-green-800",
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
});
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className = "", ...props }, ref) => (
  <h5
    ref={ref}
    className={`mb-1 font-medium leading-none tracking-tight ${className}`}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`text-sm [&_p]:leading-relaxed ${className}`}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
