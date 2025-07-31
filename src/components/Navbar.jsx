import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { Button } from "./ui/Button";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserAvatarUrl } from "../services/avatars";
import Logo from "./Logo";
import { MessageSquare, X, Upload } from "lucide-react";

export function Navbar() {
  const { user, userProfile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [profileImageError, setProfileImageError] = useState(false);
  const dropdownRef = useRef(null);
  const feedbackRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (feedbackRef.current && !feedbackRef.current.contains(event.target)) {
        setIsFeedbackOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset profile image error when user changes
  useEffect(() => {
    console.log("Navbar: User state changed:", user ? user.id : "null");
    setProfileImageError(false);
  }, [user]);

  const getProfileImage = () => {
    if (!user) return null;
    return getUserAvatarUrl(user, userProfile);
  };

  const handleImageError = () => {
    setProfileImageError(true);
  };

  const handleSignOut = async () => {
    try {
      console.log("Navbar: Starting sign out process");
      setIsDropdownOpen(false);
      await signOut();
      console.log("Navbar: Sign out completed, navigating to home");
      navigate("/");
      
      // Force a page reload after a short delay to ensure all caches are cleared
      setTimeout(() => {
        console.log("Navbar: Force reloading page to clear all caches");
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error during sign out:", error);
      // Still navigate to home even if there's an error
      navigate("/");
    }
  };

  const handleFeedbackSubmit = () => {
    // TODO: Integrate with backend
    console.log("Feedback submitted:", { text: feedbackText, file: selectedFile });
    setIsFeedbackOpen(false);
    setFeedbackText("");
    setSelectedFile(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const navigationItems = [
    {
      name: "Features",
      href: "#features",
      onClick: () => scrollToSection("features"),
    },
    {
      name: "Pricing",
      href: "#pricing",
      onClick: () => scrollToSection("pricing"),
    },
    {
      name: "About",
      href: "#about",
      onClick: () => scrollToSection("about"),
    },
  ];

  const scrollToSection = (sectionId) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const themeColors = {
    navbar:
      theme === "dark"
        ? "bg-slate-900/70 border-slate-700/60"
        : "bg-white/90 border-slate-200/60 shadow-lg",
    text: {
      primary: theme === "dark" ? "text-white" : "text-slate-900",
      secondary: theme === "dark" ? "text-slate-300" : "text-slate-700",
      muted: theme === "dark" ? "text-slate-400" : "text-slate-600",
    },
  };

  const premiumGradients = {
    primary:
      theme === "dark"
        ? "from-violet-500 via-purple-500 to-fuchsia-500"
        : "from-violet-600 via-purple-600 to-fuchsia-600",
    secondary:
      theme === "dark"
        ? "from-emerald-400 via-teal-400 to-cyan-400"
        : "from-emerald-500 via-teal-500 to-cyan-500",
  };

  // Only show feedback button on product pages (not landing page)
  const isProductPage = location.pathname !== "/";
  
  // Debug logging
  console.log("Navbar Debug:", {
    user: !!user,
    pathname: location.pathname,
    isProductPage,
    shouldShowFeedback: !!user && isProductPage
  });

  return (
    <>
      <nav className="fixed top-4 left-4 right-4 z-50">
        <div
          className={`${themeColors.navbar} backdrop-blur-2xl border rounded-2xl shadow-2xl transition-colors duration-300`}
        >
          <div className="px-4 lg:px-6 py-3 lg:py-4">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <div className="flex items-center">
                <Logo 
                  size="md" 
                  onClick={() => navigate("/")}
                  className="cursor-pointer transition-opacity duration-200 hover:opacity-80"
                />
              </div>

              {/* Desktop Navigation - Centered */}
              <div className="hidden lg:flex flex-grow justify-center items-center space-x-8">
                {!user &&
                  navigationItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={item.onClick}
                      className={`${themeColors.text.secondary} hover:${themeColors.text.primary} transition-colors duration-200 font-medium`}
                    >
                      {item.name}
                    </button>
                  ))}
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-3">

                {user ? (
                  <>
                    {/* Feedback Button - Only on product pages */}
                    {isProductPage && (
                      <Button
                        variant="ghost"
                        onClick={() => setIsFeedbackOpen(true)}
                        className={`flex items-center space-x-2 h-10 ${
                          theme === "dark"
                            ? "hover:bg-slate-700/50"
                            : "hover:bg-orange-100/50"
                        } transition-colors duration-200`}
                      >
                        <MessageSquare className="h-5 w-5" />
                        <span className="hidden md:inline-block font-medium">
                          Feedback
                        </span>
                      </Button>
                    )}

                    <div className="relative" ref={dropdownRef}>
                      <div>
                        <Button
                          variant="ghost"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className={`flex items-center space-x-2 h-10 ${
                            theme === "dark"
                              ? "hover:bg-slate-700/50"
                              : "hover:bg-orange-100/50"
                          } transition-colors duration-200`}
                        >
                          <img
                            className="h-8 w-8 rounded-full ring-2 ring-violet-400/30 object-cover"
                            src={getProfileImage()}
                            alt={
                              userProfile?.username ||
                              user.displayName ||
                              user.email ||
                              "User"
                            }
                            onError={handleImageError}
                          />
                          <span
                            className={`hidden md:inline-block font-medium ${themeColors.text.primary} max-w-[100px] truncate`}
                          >
                            {userProfile?.username || user.displayName || "User"}
                          </span>
                          <svg
                            className={`h-4 w-4 ${themeColors.text.muted} transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </Button>
                      </div>

                      {isDropdownOpen && (
                        <div
                          className={`absolute right-0 mt-2 w-56 ${themeColors.navbar} backdrop-blur-lg rounded-xl shadow-2xl border ${
                            theme === "dark"
                              ? "border-slate-700/50"
                              : "border-orange-200/50"
                          } py-2 z-50 transition-all duration-200 ease-out`}
                        >
                          <div
                            className={`px-4 py-3 border-b ${
                              theme === "dark"
                                ? "border-slate-700/50"
                                : "border-orange-200/50"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <img
                                className="h-10 w-10 rounded-full ring-2 ring-violet-400/30 object-cover"
                                src={getProfileImage()}
                                alt={
                                  userProfile?.username ||
                                  user.displayName ||
                                  user.email ||
                                  "User"
                                }
                                onError={handleImageError}
                              />
                              <div className="flex-1 min-w-0">
                                <div
                                  className={`font-medium ${themeColors.text.primary} truncate`}
                                >
                                  {userProfile?.username ||
                                    user.displayName ||
                                    "User"}
                                </div>
                                <div
                                  className={`text-xs ${themeColors.text.muted} truncate`}
                                >
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="py-1">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                navigate("/dashboard");
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full justify-start px-4 py-2 text-sm rounded-none ${
                                theme === "dark"
                                  ? "hover:bg-slate-700/50"
                                  : "hover:bg-orange-100/50"
                              } transition-colors duration-200`}
                            >
                              <svg
                                className="h-4 w-4 mr-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              Dashboard
                            </Button>

                          </div>

                          <div className="py-1">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                toggleTheme();
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full justify-start px-4 py-2 text-sm rounded-none ${
                                theme === "dark"
                                  ? "hover:bg-slate-700/50"
                                  : "hover:bg-orange-100/50"
                              } transition-colors duration-200`}
                            >
                              <svg
                                className="h-4 w-4 mr-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                {theme === "dark" ? (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                  />
                                ) : (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                  />
                                )}
                              </svg>
                              {theme === "dark" ? "Light Mode" : "Dark Mode"}
                            </Button>
                          </div>

                          <div
                            className={`border-t ${theme === "dark" ? "border-slate-700/50" : "border-orange-200/50"} pt-1`}
                          >
                            <Button
                              variant="ghost"
                              onClick={handleSignOut}
                              className={`w-full justify-start px-4 py-2 text-sm rounded-none hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200`}
                            >
                              <svg
                                className="h-4 w-4 mr-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                              </svg>
                              Sign Out
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    <Button
                      onClick={() => navigate("/auth")}
                      className={`bg-gradient-to-r ${premiumGradients.secondary} hover:shadow-xl hover:shadow-emerald-500/25 text-gray-900 font-semibold transition-all duration-300`}
                    >
                      Sign In
                    </Button>
                  </div>
                )}


              </div>
            </div>
          </div>


        </div>
      </nav>

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            ref={feedbackRef}
            className={`w-full max-w-md ${theme === "dark" ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-2xl border ${
              theme === "dark" ? "border-slate-700" : "border-gray-200"
            } p-6`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Send Feedback
              </h3>
              <Button
                variant="ghost"
                onClick={() => setIsFeedbackOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  What didn't you like?
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us what we can improve..."
                  className={`w-full h-24 px-3 py-2 rounded-lg border resize-none ${
                    theme === "dark"
                      ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Attach file (optional)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border cursor-pointer ${
                      theme === "dark"
                        ? "border-slate-600 text-gray-300 hover:bg-slate-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    } transition-colors duration-200`}
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">
                      {selectedFile ? selectedFile.name : "Choose file"}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setIsFeedbackOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFeedbackSubmit}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg"
                >
                  Send Feedback
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
