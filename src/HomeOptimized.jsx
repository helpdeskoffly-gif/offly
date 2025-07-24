import React, {
  useState,
  useMemo,
  useCallback,
  Suspense,
  useRef,
  useEffect,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "./hooks/useAuth";
import { useTheme } from "./contexts/ThemeContext.jsx";
import { useNavigate } from "react-router-dom";
import { useOptimizedInView } from "./hooks/useOptimizedInView";

// Optimized imports
import {
  containerVariants,
  itemVariants,
  fastCardVariants,
  OptimizedMotionDiv,
  animateContainer,
  animateItem,
  animateCard,
} from "./optimized/OptimizedAnimations.jsx";

gsap.registerPlugin(ScrollTrigger);
import {
  MemoizedCard,
  MemoizedButton,
  MemoizedBadge,
  MemoizedProgress,
} from "./optimized/MemoizedComponents";
import OptimizedBackground from "./optimized/OptimizedBackground";
import {
  LazyTestimonialsSection,
  LazyTeamsSection,
  LazyCTASection,
  LazyFooterSection,
} from "./optimized/LazyLoadedSections";

// Import other required components
import { Switch } from "./components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Separator } from "./components/ui/separator";
import { WaitlistSection } from "./components/WaitlistSection";
import { Skeleton } from "./components/ui/skeleton";
import { trackLandingPageView } from "./services/database";

export function HomeOptimized() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  // Track landing page view on mount
  useEffect(() => {
    trackLandingPageView();
  }, []);

  // Scroll progress refs for GSAP
  const scrollProgressRef = useRef(0);
  const y1Ref = useRef(null);
  const y2Ref = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      scrollProgressRef.current = scrollY / maxScroll;

      if (y1Ref.current) {
        gsap.set(y1Ref.current, { y: -50 * scrollProgressRef.current });
      }
      if (y2Ref.current) {
        gsap.set(y2Ref.current, { y: -100 * scrollProgressRef.current });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Memoized handlers to prevent unnecessary re-renders
  const handleGetStarted = useCallback(() => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleJoinWaitlist = useCallback(() => {
    if (user) {
      navigate("/dashboard");
    } else {
      const waitlistSection = document.getElementById("waitlist");
      if (waitlistSection) {
        waitlistSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [user, navigate]);

  const handleWatchDemo = useCallback(() => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Memoized theme configurations
  const premiumGradients = useMemo(
    () => ({
      primary:
        theme === "dark"
          ? "from-violet-500 via-purple-500 to-fuchsia-500"
          : "from-violet-600 via-purple-600 to-fuchsia-600",
      secondary:
        theme === "dark"
          ? "from-emerald-400 via-teal-400 to-cyan-400"
          : "from-emerald-500 via-teal-500 to-cyan-500",
      tertiary:
        theme === "dark"
          ? "from-rose-400 via-pink-400 to-fuchsia-400"
          : "from-rose-500 via-pink-500 to-fuchsia-500",
    }),
    [theme],
  );

  const themeColors = useMemo(
    () => ({
      background:
        theme === "dark"
          ? "bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950"
          : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50",
      text: {
        primary: theme === "dark" ? "text-white" : "text-gray-900",
        secondary: theme === "dark" ? "text-slate-300" : "text-gray-700",
        muted: theme === "dark" ? "text-slate-400" : "text-gray-600",
      },
      card:
        theme === "dark"
          ? "bg-slate-800/50 border-slate-700/50"
          : "bg-white/70 border-orange-200/50",
    }),
    [theme],
  );

  return (
    <div
      className={`min-h-screen ${themeColors.background} relative overflow-hidden transition-colors duration-500`}
    >
      {/* Optimized background with reduced particles */}
      <OptimizedBackground theme={theme} />

      {/* Hero Section - Above the fold, no lazy loading */}
      <HeroSection
        theme={theme}
        themeColors={themeColors}
        premiumGradients={premiumGradients}
        handleJoinWaitlist={handleJoinWaitlist}
        handleWatchDemo={handleWatchDemo}
        user={user}
      />

      {/* Features Section - Above the fold */}
      <FeaturesSection
        theme={theme}
        themeColors={themeColors}
        premiumGradients={premiumGradients}
      />

      {/* Celebrate Streaks Section */}
      <CelebrateStreaksSection
        theme={theme}
        themeColors={themeColors}
        premiumGradients={premiumGradients}
      />

      {/* Lazy loaded sections below the fold */}
      <Suspense fallback={<SectionSkeleton />}>
        <LazyTeamsSection theme={theme} themeColors={themeColors} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <LazyTestimonialsSection theme={theme} themeColors={themeColors} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <LazyCTASection handleJoinWaitlist={handleJoinWaitlist} user={user} />
      </Suspense>

      {/* Waitlist Section - Only for logged out users */}
      {!user && <WaitlistSection />}

      <Suspense fallback={<SectionSkeleton />}>
        <LazyFooterSection />
      </Suspense>
    </div>
  );
}

// Memoized Hero Section Component
const HeroSection = React.memo(
  ({
    theme,
    themeColors,
    premiumGradients,
    handleJoinWaitlist,
    handleWatchDemo,
    user,
  }) => {
    const { ref, inView } = useOptimizedInView();

    return (
      <div
        className="min-h-screen flex items-center px-4 sm:px-6 lg:px-8 relative pt-16 pb-8"
        ref={ref}
      >
        <div className="max-w-7xl mx-auto w-full">
          <OptimizedMotionDiv
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            {/* Left Content */}
            <div
              ref={(el) => {
                if (el) {
                  animateItem(el, { delay: 0.2 });
                }
              }}
              className="text-center lg:text-left order-2 lg:order-1"
            >
              <div
                ref={(el) => {
                  if (el) {
                    gsap.fromTo(
                      el,
                      { scale: 0.8, opacity: 0 },
                      {
                        scale: 1,
                        opacity: 1,
                        duration: 0.6,
                        ease: "back.out(1.7)",
                      },
                    );
                  }
                }}
                className="mb-4 lg:mb-6"
              >
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 border-violet-500/30 backdrop-blur-sm">
                  ✨ Your emotional wellness companion
                </div>
              </div>

              <h1
                ref={(el) => {
                  if (el) {
                    animateItem(el, { delay: 0.3 });
                  }
                }}
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight ${themeColors.text.primary} mb-4 lg:mb-6 leading-tight`}
              >
                Your{" "}
                <span
                  className={`bg-gradient-to-r ${premiumGradients.secondary} bg-clip-text text-transparent`}
                >
                  Fitbit
                </span>{" "}
                for
                <br />
                <span
                  className={`bg-gradient-to-r ${premiumGradients.primary} bg-clip-text text-transparent`}
                >
                  Emotional Wellness
                </span>
              </h1>

              <p
                ref={(el) => {
                  if (el) {
                    animateItem(el, { delay: 0.4 });
                  }
                }}
                className={`text-lg sm:text-xl ${themeColors.text.secondary} mb-6 lg:mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed`}
              >
                Track your joy, not just your tasks. Build intentional habits
                that actually matter.
              </p>

              <div
                ref={(el) => {
                  if (el) {
                    animateItem(el, { delay: 0.5 });
                  }
                }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <button
                  ref={(el) => {
                    if (el) {
                      el.addEventListener("mouseenter", () =>
                        gsap.to(el, { scale: 1.02, duration: 0.2 }),
                      );
                      el.addEventListener("mouseleave", () =>
                        gsap.to(el, { scale: 1, duration: 0.2 }),
                      );
                    }
                  }}
                  className={`bg-gradient-to-r ${premiumGradients.secondary} hover:shadow-2xl hover:shadow-emerald-500/25 text-gray-900 font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg transition-all duration-300 w-full sm:w-auto rounded-md inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`}
                  onClick={handleJoinWaitlist}
                >
                  {user ? "Go to Dashboard" : "Try Offly Free"}
                </button>

                <button
                  ref={(el) => {
                    if (el) {
                      el.addEventListener("mouseenter", () =>
                        gsap.to(el, { scale: 1.02, duration: 0.2 }),
                      );
                      el.addEventListener("mouseleave", () =>
                        gsap.to(el, { scale: 1, duration: 0.2 }),
                      );
                    }
                  }}
                  className={`px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg border-2 ${theme === "dark" ? "border-slate-700 text-slate-300 hover:bg-violet-500/10 hover:border-violet-500/50" : "border-orange-200 text-gray-700 hover:bg-orange-50 hover:border-orange-300"} backdrop-blur-sm transition-all duration-300 w-full sm:w-auto rounded-md inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-transparent`}
                  onClick={handleWatchDemo}
                >
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right Mobile Wireframe */}
            <div
              ref={(el) => {
                if (el) {
                  animateItem(el, { delay: 0.6 });
                }
              }}
              className="flex justify-center lg:justify-end order-1 lg:order-2"
            >
              <MobileWireframe
                theme={theme}
                themeColors={themeColors}
                premiumGradients={premiumGradients}
              />
            </div>
          </OptimizedMotionDiv>
        </div>
      </div>
    );
  },
);

// Memoized Mobile Wireframe Component
const MobileWireframe = React.memo(
  ({ theme, themeColors, premiumGradients }) => (
    <div className="relative">
      <div
        className={`relative w-64 sm:w-72 md:w-80 h-[520px] sm:h-[580px] md:h-[640px] ${
          theme === "dark"
            ? "bg-gradient-to-b from-slate-800/90 to-gray-800/90 border-slate-700/50"
            : "bg-gradient-to-b from-white/90 to-gray-100/90 border-orange-200/50"
        } rounded-[2.5rem] md:rounded-[3rem] p-3 md:p-4 shadow-2xl border-4 backdrop-blur-xl`}
      >
        {/* Screen Content */}
        <div
          className={`w-full h-full ${
            theme === "dark"
              ? "bg-gradient-to-br from-slate-900/95 to-gray-900/95 border-white/10"
              : "bg-gradient-to-br from-gray-50/95 to-white/95 border-gray-200/50"
          } rounded-[2rem] md:rounded-[2rem] overflow-hidden relative backdrop-blur-2xl border`}
        >
          {/* Status Bar */}
          <div
            className={`flex justify-between items-center px-4 md:px-6 py-2 md:py-3 ${
              theme === "dark"
                ? "bg-slate-900/90 border-white/5"
                : "bg-white/90 border-gray-200/50"
            } backdrop-blur-sm border-b`}
          >
            <span
              className={`text-sm font-semibold ${themeColors.text.primary}`}
            >
              9:41
            </span>
            <div className="flex space-x-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3 md:w-4 h-1.5 md:h-2 ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                      : "bg-gradient-to-r from-green-500 to-emerald-500"
                  } rounded-sm`}
                />
              ))}
            </div>
          </div>

          {/* App Content */}
          <div className="p-4 md:p-6 space-y-3 md:space-y-4 relative">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="relative w-8 md:w-12 h-8 md:h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm md:text-lg">
                    A
                  </span>
                </div>
                <div>
                  <h3
                    className={`${themeColors.text.primary} font-semibold text-sm md:text-base`}
                  >
                    Welcome back, Alex!
                  </h3>
                  <p className={`${themeColors.text.muted} text-xs`}>
                    How are you feeling today?
                  </p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            {/* Joy Score Card */}
            <div
              ref={(el) => {
                if (el) {
                  el.addEventListener("mouseenter", () =>
                    gsap.to(el, { scale: 1.02, duration: 0.2 }),
                  );
                  el.addEventListener("mouseleave", () =>
                    gsap.to(el, { scale: 1, duration: 0.2 }),
                  );
                }
              }}
              className={`rounded-lg border bg-card text-card-foreground shadow-sm ${
                theme === "dark"
                  ? "bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border-violet-500/30"
                  : "bg-gradient-to-br from-amber-200/30 via-orange-200/30 to-yellow-200/30 border-orange-300/50"
              } border rounded-xl md:rounded-2xl p-3 md:p-5 backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center space-x-2">
                  <svg
                    className={`w-4 md:w-5 h-4 md:h-5 ${
                      theme === "dark" ? "text-violet-400" : "text-orange-500"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h4
                    className={`${themeColors.text.primary} font-semibold text-sm md:text-base`}
                  >
                    Joy Score
                  </h4>
                </div>
                <div
                  className={`text-2xl md:text-3xl font-bold ${
                    theme === "dark" ? "text-emerald-400" : "text-green-600"
                  }`}
                >
                  8.7
                </div>
              </div>

              <div
                className={`relative overflow-hidden rounded-full h-2 md:h-3 ${
                  theme === "dark" ? "bg-slate-800/50" : "bg-gray-200/50"
                } backdrop-blur-sm`}
              >
                <div
                  ref={(el) => {
                    if (el) {
                      gsap.fromTo(
                        el,
                        { width: 0 },
                        { width: "87%", duration: 1.5, ease: "power2.out" },
                      );
                    }
                  }}
                  className="h-full bg-primary"
                  style={{
                    background:
                      theme === "dark"
                        ? "linear-gradient(to right, rgb(34, 197, 94), rgb(16, 185, 129))"
                        : "linear-gradient(to right, rgb(34, 197, 94), rgb(34, 197, 94))",
                  }}
                />
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {[
                { emoji: "😊", label: "Log Mood" },
                { emoji: "📊", label: "Analytics" },
              ].map((action, i) => (
                <div
                  key={i}
                  className={`${themeColors.card} border rounded-lg md:rounded-xl p-2 md:p-3 backdrop-blur-sm cursor-pointer`}
                >
                  <div className="text-lg md:text-xl mb-1 md:mb-2">
                    {action.emoji}
                  </div>
                  <div
                    className={`text-xs font-medium ${themeColors.text.secondary}`}
                  >
                    {action.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
);

// Optimized Features Section
const FeaturesSection = React.memo(
  ({ theme, themeColors, premiumGradients }) => {
    const { ref, inView } = useOptimizedInView();

    return (
      <div
        className={`py-16 md:py-24 ${
          theme === "dark"
            ? "bg-gradient-to-b from-slate-900 to-gray-900"
            : "bg-gradient-to-b from-orange-50 to-yellow-50"
        } relative overflow-hidden`}
        ref={ref}
        id="features"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <OptimizedMotionDiv
            className="text-center mb-12 md:mb-16"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <div
              ref={(el) => {
                if (el) {
                  animateItem(el, { delay: 0.1 });
                }
              }}
            >
              <div
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mb-4 md:mb-6 bg-gradient-to-r ${
                  theme === "dark"
                    ? `${premiumGradients.primary}/20 text-violet-300 border-violet-500/30`
                    : `${premiumGradients.primary}/20 text-violet-600 border-violet-400/50`
                } backdrop-blur-sm`}
              >
                ✨ Holistic Approach
              </div>
            </div>

            <h2
              ref={(el) => {
                if (el) {
                  animateItem(el, { delay: 0.2 });
                }
              }}
              className={`text-3xl sm:text-4xl md:text-5xl font-bold ${themeColors.text.primary} mb-3 md:mb-4`}
            >
              Built for your{" "}
              <span
                className={`bg-gradient-to-r ${premiumGradients.secondary} bg-clip-text text-transparent`}
              >
                emotional journey
              </span>
            </h2>

            <p
              ref={(el) => {
                if (el) {
                  animateItem(el, { delay: 0.3 });
                }
              }}
              className={`text-lg md:text-xl ${themeColors.text.secondary} max-w-3xl mx-auto px-4`}
            >
              Every feature designed to help you understand and nurture your
              emotional wellness.
            </p>
          </OptimizedMotionDiv>

          {/* Joy Tracker Demo */}
          <JoyTrackerDemo
            theme={theme}
            themeColors={themeColors}
            premiumGradients={premiumGradients}
            inView={inView}
          />
        </div>
      </div>
    );
  },
);

// Memoized Joy Tracker Demo
const JoyTrackerDemo = React.memo(
  ({ theme, themeColors, premiumGradients, inView }) => (
    <OptimizedMotionDiv
      className="mb-16 md:mb-24"
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
        <div
          ref={(el) => {
            if (el) {
              animateContainer(el, { delay: 0.1 });
            }
          }}
          className="order-2 lg:order-1"
        >
          <h3
            ref={(el) => {
              if (el) {
                animateItem(el, { delay: 0.2 });
              }
            }}
            className={`text-2xl md:text-3xl font-bold ${themeColors.text.primary} mb-4 md:mb-6`}
          >
            Joy Tracker • Joy Score • Dashboard
          </h3>

          <div
            ref={(el) => {
              if (el) {
                animateItem(el, { delay: 0.3 });
              }
            }}
            className={`space-y-3 md:space-y-4 text-base md:text-lg ${themeColors.text.secondary}`}
          >
            {[
              "Log your mood with text, emojis, and context.",
              "Beautiful visualizations of your emotional patterns.",
              "Photos, audio, location — capture what matters in the moment.",
              "See how joy flows through different activities and relationships.",
            ].map((text, index) => (
              <div key={index} className="flex items-start space-x-3">
                <span
                  className={`${
                    theme === "dark" ? "text-emerald-400" : "text-green-600"
                  } mt-1 font-bold`}
                >
                  ✓
                </span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          ref={(el) => {
            if (el) {
              animateItem(el, { delay: 0.4 });
            }
          }}
          className="relative order-1 lg:order-2"
        >
          <div
            ref={(el) => {
              if (el) {
                animateCard(el, { delay: 0.5 });
                el.addEventListener("mouseenter", () =>
                  gsap.to(el, { scale: 1.02, duration: 0.2 }),
                );
                el.addEventListener("mouseleave", () =>
                  gsap.to(el, { scale: 1, duration: 0.2 }),
                );
              }
            }}
            className={`rounded-lg border bg-card text-card-foreground shadow-sm p-6 md:p-8 ${
              theme === "dark"
                ? `bg-gradient-to-br ${premiumGradients.secondary}/5 border-emerald-500/20`
                : `bg-gradient-to-br ${premiumGradients.secondary}/10 border-emerald-400/30`
            } backdrop-blur-sm shadow-2xl`}
          >
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-center justify-between">
                <h4
                  className={`text-lg md:text-xl font-semibold ${themeColors.text.primary}`}
                >
                  Today's Joy Score
                </h4>
                <div
                  className={`text-2xl md:text-3xl font-bold ${
                    theme === "dark" ? "text-emerald-400" : "text-green-600"
                  }`}
                >
                  8.7
                </div>
              </div>

              <div
                className={`relative overflow-hidden rounded-full h-2 md:h-3 ${
                  theme === "dark" ? "bg-slate-800" : "bg-gray-200"
                }`}
              >
                <div
                  ref={(el) => {
                    if (el) {
                      gsap.fromTo(
                        el,
                        { width: 0 },
                        {
                          width: "87%",
                          duration: 2,
                          ease: "power2.out",
                          delay: 0.8,
                        },
                      );
                    }
                  }}
                  className="h-full bg-primary"
                  style={{
                    background:
                      theme === "dark"
                        ? "linear-gradient(to right, rgb(34, 197, 94), rgb(16, 185, 129))"
                        : "linear-gradient(to right, rgb(34, 197, 94), rgb(34, 197, 94))",
                  }}
                />
              </div>

              <div
                className={`h-24 md:h-32 ${
                  theme === "dark"
                    ? "bg-slate-800/50 border-slate-700"
                    : "bg-white/50 border-gray-200"
                } rounded-lg p-3 md:p-4 border`}
              >
                <div className="flex items-end justify-between h-full space-x-1 md:space-x-2">
                  {[70, 85, 60, 90, 75, 95, 87].map((height, i) => (
                    <div
                      key={i}
                      ref={(el) => {
                        if (el) {
                          gsap.fromTo(
                            el,
                            { height: 0 },
                            {
                              height: `${height}%`,
                              duration: 1.5,
                              delay: 1 + i * 0.1,
                              ease: "power2.out",
                            },
                          );
                        }
                      }}
                      className={`bg-gradient-to-t ${premiumGradients.secondary} rounded-t-lg flex-1`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OptimizedMotionDiv>
  ),
);

// Memoized Celebrate Streaks Section
const CelebrateStreaksSection = React.memo(
  ({ theme, themeColors, premiumGradients }) => {
    const { ref, inView } = useOptimizedInView();

    return (
      <div
        className="py-32 bg-gradient-to-br from-slate-950 via-gray-900 to-emerald-950/30"
        ref={ref}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <OptimizedMotionDiv
            className="text-center mb-16"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <h2
              ref={(el) => {
                if (el) {
                  animateItem(el, { delay: 0.1 });
                }
              }}
              className="text-4xl sm:text-5xl font-bold text-white mb-6"
            >
              Celebrate your{" "}
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                streaks
              </span>
            </h2>
            <p
              ref={(el) => {
                if (el) {
                  animateItem(el, { delay: 0.2 });
                }
              }}
              className="text-xl text-gray-400 max-w-3xl mx-auto"
            >
              You're not a machine - you don't need to optimize everything. But
              building gentle habits? That's worth celebrating.
            </p>
          </OptimizedMotionDiv>

          <div className="flex justify-center">
            <div
              ref={(el) => {
                if (el && inView) {
                  animateItem(el, { delay: 0.3 });
                  el.addEventListener("mouseenter", () =>
                    gsap.to(el, { scale: 1.02, duration: 0.2 }),
                  );
                  el.addEventListener("mouseleave", () =>
                    gsap.to(el, { scale: 1, duration: 0.2 }),
                  );
                }
              }}
              className="rounded-lg border bg-card text-card-foreground shadow-sm p-8 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-2xl max-w-md border-amber-500/20"
            >
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center space-x-4">
                  <div
                    ref={(el) => {
                      if (el) {
                        el.addEventListener("mouseenter", () =>
                          gsap.to(el, { rotation: 360, duration: 0.6 }),
                        );
                      }
                    }}
                    className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center"
                  >
                    <span
                      ref={(el) => {
                        if (el) {
                          gsap.fromTo(
                            el,
                            { scale: 0 },
                            {
                              scale: 1,
                              duration: 0.6,
                              delay: 0.6,
                              ease: "back.out(1.7)",
                            },
                          );
                        }
                      }}
                      className="text-white font-bold text-2xl"
                    >
                      7
                    </span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white">
                      Day Streak!
                    </h3>
                    <p className="text-slate-400 text-sm">Joy tracking</p>
                  </div>
                </div>

                <div className="flex justify-center space-x-2">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      ref={(el) => {
                        if (el) {
                          el.addEventListener("mouseenter", () =>
                            gsap.to(el, { scale: 1.1, duration: 0.2 }),
                          );
                          el.addEventListener("mouseleave", () =>
                            gsap.to(el, { scale: 1, duration: 0.2 }),
                          );
                        }
                      }}
                      className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center"
                    >
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <p className="text-white text-lg font-medium">
                    7-day joy streak!
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    Share with your circle or keep it just for you. Both are
                    perfect.
                  </p>

                  <div className="flex space-x-3 justify-center pt-4">
                    <button
                      ref={(el) => {
                        if (el) {
                          el.addEventListener("mouseenter", () =>
                            gsap.to(el, { scale: 1.05, duration: 0.2 }),
                          );
                          el.addEventListener("mouseleave", () =>
                            gsap.to(el, { scale: 1, duration: 0.2 }),
                          );
                        }
                      }}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                    >
                      Share
                    </button>
                    <button
                      ref={(el) => {
                        if (el) {
                          el.addEventListener("mouseenter", () =>
                            gsap.to(el, { scale: 1.05, duration: 0.2 }),
                          );
                          el.addEventListener("mouseleave", () =>
                            gsap.to(el, { scale: 1, duration: 0.2 }),
                          );
                        }
                      }}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 text-slate-400 hover:text-white"
                    >
                      Keep private
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

// Loading skeleton for lazy sections
const SectionSkeleton = React.memo(() => (
  <div className="py-16 space-y-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </div>
  </div>
));

// Set display names for all components
HeroSection.displayName = "HeroSection";
MobileWireframe.displayName = "MobileWireframe";
FeaturesSection.displayName = "FeaturesSection";
JoyTrackerDemo.displayName = "JoyTrackerDemo";
CelebrateStreaksSection.displayName = "CelebrateStreaksSection";
SectionSkeleton.displayName = "SectionSkeleton";
