import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { Button } from "./ui/Button";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserAvatarUrl } from "../services/avatars";

export function Navbar() {
  const { user, userProfile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const dropdownRef = useRef(null);

  // GSAP refs
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const dropdownMenuRef = useRef(null);
  const signInButtonRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    // Initial navbar slide down animation
    gsap.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
    );
  }, []);

  useEffect(() => {
    // Dropdown menu animations
    if (isDropdownOpen && dropdownMenuRef.current) {
      gsap.fromTo(
        dropdownMenuRef.current,
        { opacity: 0, scale: 0.95, y: -10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: "power2.out" },
      );
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    // Mobile menu animations
    if (isMobileMenuOpen && mobileMenuRef.current) {
      gsap.fromTo(
        mobileMenuRef.current,
        { opacity: 0, height: 0 },
        { opacity: 1, height: "auto", duration: 0.3, ease: "power2.out" },
      );
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset profile image error when user changes
  useEffect(() => {
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
    await signOut();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const navigationItems = [
    {
      name: "Product",
      href: "#product",
      onClick: () => scrollToSection("product"),
    },
    {
      name: "Pricing",
      href: "#pricing",
      onClick: () => scrollToSection("pricing"),
    },
    {
      name: "Why Offly",
      href: "#why-offly",
      onClick: () => scrollToSection("why-offly"),
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

  return (
    <nav ref={navRef} className="fixed top-4 left-4 right-4 z-50">
      <div
        className={`${themeColors.navbar} backdrop-blur-2xl border rounded-2xl shadow-2xl transition-colors duration-300`}
      >
        <div className="px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div
              ref={logoRef}
              className="flex items-center"
              onMouseEnter={() =>
                gsap.to(logoRef.current, { scale: 1.05, duration: 0.2 })
              }
              onMouseLeave={() =>
                gsap.to(logoRef.current, { scale: 1, duration: 0.2 })
              }
            >
              <button
                onClick={() => navigate("/")}
                className={`text-2xl font-bold bg-gradient-to-r ${premiumGradients.secondary} bg-clip-text text-transparent hover:opacity-80 transition-opacity`}
              >
                Offly
              </button>
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
                <div className="relative" ref={dropdownRef}>
                  <div>
                    <Button
                      variant="ghost"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`flex items-center space-x-2 h-10 ${
                        theme === "dark"
                          ? "hover:bg-slate-700/50"
                          : "hover:bg-orange-100/50"
                      } transition-colors`}
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
                      ref={dropdownMenuRef}
                      className={`absolute right-0 mt-2 w-56 ${themeColors.navbar} backdrop-blur-lg rounded-xl shadow-2xl border ${
                        theme === "dark"
                          ? "border-slate-700/50"
                          : "border-orange-200/50"
                      } py-2 z-50`}
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
                          } transition-colors`}
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
                        <Button
                          variant="ghost"
                          onClick={() => {
                            navigate("/new-dashboard");
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full justify-start px-4 py-2 text-sm rounded-none ${
                            theme === "dark"
                              ? "hover:bg-slate-700/50"
                              : "hover:bg-orange-100/50"
                          } transition-colors`}
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
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          New Dashboard
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
                          } transition-colors`}
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
                          className={`w-full justify-start px-4 py-2 text-sm rounded-none hover:bg-red-500/10 hover:text-red-400 transition-colors`}
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
              ) : (
                <div
                  ref={signInButtonRef}
                  onMouseEnter={() =>
                    gsap.to(signInButtonRef.current, {
                      scale: 1.02,
                      duration: 0.2,
                    })
                  }
                  onMouseLeave={() =>
                    gsap.to(signInButtonRef.current, {
                      scale: 1,
                      duration: 0.2,
                    })
                  }
                >
                  <Button
                    onClick={() => navigate("/auth")}
                    className={`bg-gradient-to-r ${premiumGradients.secondary} hover:shadow-xl hover:shadow-emerald-500/25 text-gray-900 font-semibold transition-all duration-300`}
                  >
                    Sign In
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`${theme === "dark" ? "hover:bg-slate-700/50" : "hover:bg-orange-100/50"} transition-all duration-200`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className={`lg:hidden border-t ${theme === "dark" ? "border-slate-700/50" : "border-orange-200/50"} px-4 py-4`}
          >
            <div className="space-y-2">
              {!user &&
                navigationItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={item.onClick}
                    className={`block w-full text-left px-3 py-2 rounded-lg ${themeColors.text.secondary} hover:${themeColors.text.primary} ${
                      theme === "dark"
                        ? "hover:bg-slate-700/50"
                        : "hover:bg-orange-100/50"
                    } transition-colors duration-200 font-medium`}
                  >
                    {item.name}
                  </button>
                ))}

              {!user && (
                <div className="pt-2 space-y-2">
                  <Button
                    onClick={() => {
                      navigate("/auth");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full bg-gradient-to-r ${premiumGradients.secondary} hover:shadow-xl hover:shadow-emerald-500/25 text-gray-900 font-semibold transition-all duration-300`}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
