import React from "react";
import { useTheme } from "../contexts/ThemeContext.jsx";

const Logo = ({ size = "md", className = "", onClick }) => {
  const { theme } = useTheme();
  
  const sizeClasses = {
    sm: "w-6 h-6 sm:w-8 sm:h-8",
    md: "w-8 h-8 sm:w-10 sm:h-10", 
    lg: "w-10 h-10 sm:w-12 sm:h-12",
    xl: "w-12 h-12 sm:w-16 sm:h-16"
  };

  const textSizes = {
    sm: "text-xs sm:text-sm",
    md: "text-sm sm:text-base",
    lg: "text-base sm:text-lg", 
    xl: "text-lg sm:text-xl"
  };

  // Use the exact same gradient as dashboard
  const premiumGradients = {
    secondary:
      theme === "dark"
        ? "from-blue-600 via-indigo-600 to-purple-600"
        : "from-emerald-400 via-teal-500 to-cyan-600",
  };

  return (
    <div 
      className={`flex items-center space-x-2 ${className}`}
      onClick={onClick}
    >
      <div
        className={`${sizeClasses[size]} bg-gradient-to-r ${premiumGradients.secondary} rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm`}
      >
        <span className={`text-white font-semibold ${textSizes[size]}`}>O</span>
      </div>
      <span
        className={`font-semibold bg-gradient-to-r ${premiumGradients.secondary} bg-clip-text text-transparent ${textSizes[size]}`}
      >
        OFFLY
      </span>
    </div>
  );
};

export default Logo; 