import React, { useMemo, useCallback, Suspense, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "./hooks/useAuth";
import { useTheme } from "./contexts/ThemeContext.jsx";
import { useNavigate } from "react-router-dom";
import { useOptimizedInView } from "./hooks/useOptimizedInView";

// Optimized imports
import {
  containerVariants,
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
  LazyCheckInSection,
  LazyAntiTodoSection,
  LazyAIInsightsSection,
  LazyCommunitySection,
  LazyPricingSection,
  LazyAboutSection,
} from "./optimized/LazyLoadedSections";
import FAQSection from "./optimized/sections/FAQSection";

// Import other required components
import { Switch } from "./components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Separator } from "./components/ui/separator";
import { WaitlistSection } from "./components/WaitlistSection";
import { Skeleton } from "./components/ui/skeleton";
import { trackLandingPageView } from "./services/database";
import { Sparkles, ArrowRight, Star, Zap, Heart, TrendingUp } from "lucide-react";

export function HomeOptimized() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  

  // Debug user state
  useEffect(() => {
    console.log("HomeOptimized: User state changed:", user ? user.id : "null");
  }, [user]);

  // Track landing page view on mount
  useEffect(() => {
    trackLandingPageView();
  }, []);

  // Enhanced scroll progress refs for GSAP
  const scrollProgressRef = useRef(0);
  const y1Ref = useRef(null);
  const y2Ref = useRef(null);
  const parallaxRefs = useRef([]);

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

      // Enhanced parallax effect
      parallaxRefs.current.forEach((ref, index) => {
        if (ref) {
          const speed = 0.5 + (index * 0.1);
          gsap.set(ref, { y: -scrollY * speed });
        }
      });
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

  // Enhanced premium gradients and theme configurations
  const premiumGradients = useMemo(
    () => ({
      primary:
        theme === "dark"
          ? "from-violet-500 via-purple-500 to-fuchsia-500"
          : "from-indigo-600 via-purple-600 to-violet-600",
      secondary:
        theme === "dark"
          ? "from-emerald-400 via-teal-400 to-cyan-400"
          : "from-emerald-600 via-teal-600 to-cyan-600",
      tertiary:
        theme === "dark"
          ? "from-rose-400 via-pink-400 to-fuchsia-400"
          : "from-blue-600 via-indigo-600 to-purple-600",
      premium:
        theme === "dark"
          ? "from-amber-400 via-orange-400 to-red-400"
          : "from-amber-600 via-orange-600 to-red-600",
      glass:
        theme === "dark"
          ? "from-slate-800/80 via-slate-700/60 to-slate-800/80"
          : "from-white/95 via-indigo-50/90 to-purple-50/80",
    }),
    [theme],
  );

  const themeColors = useMemo(
    () => ({
      background:
        theme === "dark"
          ? "bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
      text: {
        primary: theme === "dark" ? "text-white" : "text-gray-900",
        secondary: theme === "dark" ? "text-slate-300" : "text-gray-700",
        muted: theme === "dark" ? "text-slate-400" : "text-gray-600",
      },
      card:
        theme === "dark"
          ? "bg-slate-800/80 border-slate-700/50 backdrop-blur-xl"
          : "bg-white/95 border-indigo-200/40 backdrop-blur-xl",
      glass:
        theme === "dark"
          ? "bg-slate-800/40 border-slate-700/30 backdrop-blur-xl"
          : "bg-white/70 border-indigo-200/30 backdrop-blur-xl",
    }),
    [theme],
  );

  return (
    <div
      className={`min-h-screen ${themeColors.background} relative overflow-hidden`}
    >
      {/* Enhanced Optimized background with premium particles */}
      <OptimizedBackground theme={theme} />

      {/* Premium floating elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) parallaxRefs.current[i] = el;
            }}
            className={`absolute w-2 h-2 rounded-full ${
              theme === "dark" ? "bg-emerald-400/20" : "bg-emerald-500/20"
            }`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 12}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) parallaxRefs.current[i] = el;
            }}
            className={`absolute w-2 h-2 rounded-full ${
              theme === "dark" ? "bg-emerald-400/20" : "bg-emerald-500/20"
            }`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 12}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Hero Section - Enhanced with premium animations */}
      <HeroSection
        theme={theme}
        themeColors={themeColors}
        premiumGradients={premiumGradients}
        handleJoinWaitlist={handleJoinWaitlist}
        handleWatchDemo={handleWatchDemo}
        user={user}
      />

      {/* Features Section - Enhanced with premium styling */}
      <div id="features">
        <FeaturesSection
          theme={theme}
          themeColors={themeColors}
          premiumGradients={premiumGradients}
        />
      </div>

      {/* Check In Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <LazyCheckInSection theme={theme} themeColors={themeColors} premiumGradients={premiumGradients} />
      </Suspense>

      {/* Anti Todo Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <LazyAntiTodoSection theme={theme} themeColors={themeColors} premiumGradients={premiumGradients} />
      </Suspense>

      {/* AI Insights Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <LazyAIInsightsSection theme={theme} themeColors={themeColors} premiumGradients={premiumGradients} />
      </Suspense>

      {/* Community Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <LazyCommunitySection theme={theme} themeColors={themeColors} premiumGradients={premiumGradients} />
      </Suspense>

      {/* Celebrate Streaks Section */}
      <CelebrateStreaksSection
        theme={theme}
        themeColors={themeColors}
        premiumGradients={premiumGradients}
      />

      {/* Teams Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <LazyTeamsSection theme={theme} themeColors={themeColors} />
      </Suspense>

      {/* Pricing Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <LazyPricingSection theme={theme} themeColors={themeColors} premiumGradients={premiumGradients} />
      </Suspense>

      {/* About Section */}
      <Suspense fallback={<SectionSkeleton />}>
        <LazyAboutSection theme={theme} themeColors={themeColors} premiumGradients={premiumGradients} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <LazyTestimonialsSection theme={theme} themeColors={themeColors} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <LazyCTASection handleJoinWaitlist={handleJoinWaitlist} user={user} theme={theme} themeColors={themeColors} premiumGradients={premiumGradients} />
      </Suspense>

      {/* Waitlist Section - Only for logged out users */}
      {!user && <WaitlistSection theme={theme} themeColors={themeColors} />}

      {/* FAQ Section */}
      <FAQSection theme={theme} themeColors={themeColors} />

      <Suspense fallback={<SectionSkeleton />}>
        <LazyFooterSection theme={theme} themeColors={themeColors} />
      </Suspense>
    </div>
  );
}

// Enhanced Memoized Hero Section Component
const HeroSection = React.memo(
  ({ theme, themeColors, premiumGradients, handleJoinWaitlist, handleWatchDemo, user }) => {
    const { ref, inView } = useOptimizedInView();

    return (
      <div
        className="min-h-screen flex items-center px-4 sm:px-6 lg:px-8 relative pt-20 sm:pt-16 pb-8"
        ref={ref}
      >
        <div className="max-w-7xl mx-auto w-full">
          <OptimizedMotionDiv
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            {/* Left Content - Enhanced with premium animations */}
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
                      { scale: 0.8, opacity: 0, y: 20 },
                      {
                        scale: 1,
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: "back.out(1.7)",
                      },
                    );
                  }
                }}
                className="mb-6 lg:mb-8"
              >
                <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-300 border-violet-500/30 backdrop-blur-sm shadow-lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Your emotional wellness companion
                </div>
              </div>

              <h1
                ref={(el) => {
                  if (el) {
                    animateItem(el, { delay: 0.3 });
                  }
                }}
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight ${themeColors.text.primary} mb-6 lg:mb-8 leading-tight`}
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
                className={`text-lg sm:text-xl md:text-2xl ${themeColors.text.secondary} mb-8 lg:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed`}
              >
                Track your joy, not just your tasks. Build intentional habits
                that actually matter with AI-powered insights.
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
                        gsap.to(el, { scale: 1.05, duration: 0.3, ease: "power2.out" }),
                      );
                      el.addEventListener("mouseleave", () =>
                        gsap.to(el, { scale: 1, duration: 0.3, ease: "power2.out" }),
                      );
                    }
                  }}
                  className={`bg-gradient-to-r ${premiumGradients.secondary} text-gray-900 font-semibold px-8 py-4 text-lg w-full sm:w-auto rounded-xl inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-xl hover:shadow-2xl transition-all duration-300`}
                  onClick={handleJoinWaitlist}
                >
                  {user ? "Go to Dashboard" : "Try Offly Free"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>

                <button
                  ref={(el) => {
                    if (el) {
                      el.addEventListener("mouseenter", () =>
                        gsap.to(el, { scale: 1.05, duration: 0.3, ease: "power2.out" }),
                      );
                      el.addEventListener("mouseleave", () =>
                        gsap.to(el, { scale: 1, duration: 0.3, ease: "power2.out" }),
                      );
                    }
                  }}
                  className={`px-8 py-4 text-lg border-2 ${theme === "dark" ? "border-slate-700 text-slate-300 hover:border-slate-600" : "border-gray-200 text-gray-700 hover:border-gray-300"} backdrop-blur-sm w-full sm:w-auto rounded-xl inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-transparent hover:bg-opacity-5 transition-all duration-300`}
                  onClick={handleWatchDemo}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Watch Demo
                </button>
              </div>

              {/* Premium stats */}
              <div
                ref={(el) => {
                  if (el) {
                    animateItem(el, { delay: 0.6 });
                  }
                }}
                className="flex items-center justify-center lg:justify-start space-x-8 mt-8 lg:mt-12"
              >
                {[
                  { icon: Heart, value: "10K+", label: "Happy Users" },
                  { icon: TrendingUp, value: "95%", label: "Satisfaction" },
                  { icon: Star, value: "4.9", label: "App Store Rating" },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${premiumGradients.secondary} mb-2`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`text-2xl font-bold ${themeColors.text.primary}`}>
                      {stat.value}
                    </div>
                    <div className={`text-sm ${themeColors.text.muted}`}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Mobile Wireframe - Enhanced */}
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

// Enhanced Memoized Mobile Wireframe Component
const MobileWireframe = React.memo(
  ({ theme, themeColors, premiumGradients }) => (
    <div className="relative">
      <div
        className={`relative w-64 sm:w-72 md:w-80 lg:w-96 h-[520px] sm:h-[580px] md:h-[640px] lg:h-[720px] ${
          theme === "dark"
            ? "bg-gradient-to-b from-slate-800/90 to-gray-800/90 border-slate-700/50"
            : "bg-gradient-to-b from-white/90 to-gray-100/90 border-gray-200/50"
        } rounded-[2.5rem] sm:rounded-[3rem] md:rounded-[3.5rem] p-3 sm:p-4 md:p-5 shadow-2xl border-2 sm:border-4 backdrop-blur-xl`}
      >
        {/* Screen Content */}
        <div
          className={`w-full h-full ${
            theme === "dark"
              ? "bg-gradient-to-br from-slate-900/95 to-gray-900/95 border-white/10"
              : "bg-gradient-to-br from-gray-50/95 to-white/95 border-gray-200/50"
          } rounded-[2rem] md:rounded-[2.5rem] overflow-hidden relative backdrop-blur-2xl border`}
        >
          {/* Status Bar */}
          <div
            className={`flex justify-between items-center px-6 md:px-8 py-3 md:py-4 ${
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
                  className={`w-4 md:w-5 h-2 md:h-2.5 ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                      : "bg-gradient-to-r from-green-500 to-emerald-500"
                  } rounded-sm`}
                />
              ))}
            </div>
          </div>

          {/* App Content */}
          <div className="p-6 md:p-8 space-y-4 md:space-y-6 relative">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="relative w-12 md:w-16 h-12 md:h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg md:text-xl">
                    A
                  </span>
                </div>
                <div>
                  <h3
                    className={`${themeColors.text.primary} font-semibold text-base md:text-lg`}
                  >
                    Welcome back, Alex!
                  </h3>
                  <p className={`${themeColors.text.muted} text-sm`}>
                    How are you feeling today?
                  </p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            {/* Enhanced Joy Score Card */}
            <div
              ref={(el) => {
                if (el) {
                  el.addEventListener("mouseenter", () =>
                    gsap.to(el, { scale: 1.02, duration: 0.3, ease: "power2.out" }),
                  );
                  el.addEventListener("mouseleave", () =>
                    gsap.to(el, { scale: 1, duration: 0.3, ease: "power2.out" }),
                  );
                }
              }}
              className={`rounded-2xl border shadow-xl ${
                theme === "dark"
                  ? "bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border-violet-500/30"
                  : "bg-gradient-to-br from-amber-200/30 via-orange-200/30 to-yellow-200/30 border-orange-300/50"
              } p-4 md:p-6 backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 md:w-10 h-8 md:h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <Heart className="w-4 md:w-5 h-4 md:h-5 text-white" />
                  </div>
                  <h4
                    className={`${themeColors.text.primary} font-semibold text-base md:text-lg`}
                  >
                    Joy Score
                  </h4>
                </div>
                <div
                  className={`text-3xl md:text-4xl font-bold ${
                    theme === "dark" ? "text-emerald-400" : "text-green-600"
                  }`}
                >
                  8.7
                </div>
              </div>

              <div
                className={`relative overflow-hidden rounded-full h-3 md:h-4 ${
                  theme === "dark" ? "bg-slate-800/50" : "bg-gray-200/50"
                } backdrop-blur-sm`}
              >
                <div
                  ref={(el) => {
                    if (el) {
                      gsap.fromTo(
                        el,
                        { width: 0 },
                        { width: "87%", duration: 2, ease: "power2.out", delay: 0.5 },
                      );
                    }
                  }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
                />
              </div>
            </div>

            {/* Enhanced Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {[
                { emoji: "😊", label: "Log Mood", icon: Heart },
                { emoji: "📊", label: "Analytics", icon: TrendingUp },
              ].map((action, i) => (
                <div
                  key={i}
                  className={`${themeColors.card} border rounded-xl p-4 md:p-5 backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform duration-300`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-2xl md:text-3xl">{action.emoji}</div>
                    <action.icon className={`w-5 md:w-6 h-5 md:h-6 ${theme === "dark" ? "text-emerald-400" : "text-green-600"}`} />
                  </div>
                  <div
                    className={`text-sm font-medium ${themeColors.text.secondary}`}
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

// Enhanced Optimized Features Section
const FeaturesSection = React.memo(
  ({ theme, themeColors, premiumGradients }) => {
    const { ref, inView } = useOptimizedInView();

    return (
      <div
        className={`py-20 md:py-32 ${
          theme === "dark"
            ? "bg-gradient-to-b from-slate-900 to-gray-900"
            : "bg-gradient-to-b from-orange-50 to-yellow-50"
        } relative overflow-hidden`}
        ref={ref}
        id="features"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <OptimizedMotionDiv
            className="text-center mb-16 md:mb-24"
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
                className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mb-6 md:mb-8 bg-gradient-to-r ${
                  theme === "dark"
                    ? `${premiumGradients.primary}/20 text-violet-300 border-violet-500/30`
                    : `${premiumGradients.primary}/20 text-violet-600 border-violet-400/50`
                } backdrop-blur-sm shadow-lg`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Holistic Approach
              </div>
            </div>

            <h2
              ref={(el) => {
                if (el) {
                  animateItem(el, { delay: 0.2 });
                }
              }}
              className={`text-4xl sm:text-5xl md:text-6xl font-bold ${themeColors.text.primary} mb-4 md:mb-6`}
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
              className={`text-xl md:text-2xl ${themeColors.text.secondary} max-w-4xl mx-auto px-4 leading-relaxed`}
            >
              Every feature designed to help you understand and nurture your
              emotional wellness with AI-powered insights.
            </p>
          </OptimizedMotionDiv>

          {/* Enhanced Joy Tracker Demo */}
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

// Enhanced Memoized Joy Tracker Demo
const JoyTrackerDemo = React.memo(
  ({ theme, themeColors, premiumGradients, inView }) => (
    <OptimizedMotionDiv
      className="mb-20 md:mb-32"
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
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
            className={`text-3xl md:text-4xl font-bold ${themeColors.text.primary} mb-6 md:mb-8`}
          >
            Joy Tracker • Joy Score • Dashboard
          </h3>

          <div
            ref={(el) => {
              if (el) {
                animateItem(el, { delay: 0.3 });
              }
            }}
            className={`space-y-4 md:space-y-6 text-lg md:text-xl ${themeColors.text.secondary}`}
          >
            {[
              "Log your mood with text, emojis, and context.",
              "Beautiful visualizations of your emotional patterns.",
              "Photos, audio, location — capture what matters in the moment.",
              "See how joy flows through different activities and relationships.",
            ].map((text, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${premiumGradients.secondary} flex items-center justify-center flex-shrink-0 mt-1`}>
                  <span className="text-white font-bold text-sm">✓</span>
                </div>
                <span className="leading-relaxed">{text}</span>
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
                  gsap.to(el, { scale: 1.03, duration: 0.3, ease: "power2.out" }),
                );
                el.addEventListener("mouseleave", () =>
                  gsap.to(el, { scale: 1, duration: 0.3, ease: "power2.out" }),
                );
              }
            }}
            className={`rounded-3xl border shadow-2xl p-8 md:p-10 ${themeColors.card}`}
          >
            <div className="space-y-6 md:space-y-8">
              <div className="flex items-center justify-between">
                <h4
                  className={`text-xl md:text-2xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                >
                  Today's Joy Score
                </h4>
                <div
                  className={`text-3xl md:text-4xl font-bold ${
                    theme === "dark" ? "text-emerald-400" : "text-green-600"
                  }`}
                >
                  8.7
                </div>
              </div>

              <div
                className={`relative overflow-hidden rounded-full h-3 md:h-4 ${
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
                          duration: 2.5,
                          ease: "power2.out",
                          delay: 1,
                        },
                      );
                    }
                  }}
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
                />
              </div>

              <div
                className={`h-32 md:h-40 ${
                  theme === "dark"
                    ? "bg-slate-800/50 border-slate-700"
                    : "bg-white/50 border-gray-200"
                } rounded-xl p-4 md:p-6 border`}
              >
                <div className="flex items-end justify-between h-full space-x-2 md:space-x-3">
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
                              duration: 2,
                              delay: 1.5 + i * 0.1,
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

// Enhanced Memoized Celebrate Streaks Section
const CelebrateStreaksSection = React.memo(
  ({ theme, themeColors, premiumGradients }) => {
    const { ref, inView } = useOptimizedInView();

    return (
      <div
        className={`py-32 md:py-40 ${
          theme === "dark"
            ? "bg-gradient-to-br from-slate-950 via-gray-900 to-emerald-950/30"
            : "bg-gradient-to-br from-indigo-50 via-purple-50/70 to-blue-100/50"
        } relative overflow-hidden`}
        ref={ref}
      >
        {/* Premium background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <OptimizedMotionDiv
            className="text-center mb-20"
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
              className={`text-5xl sm:text-6xl md:text-7xl font-bold ${themeColors.text.primary} mb-8`}
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
              className={`text-xl md:text-2xl ${themeColors.text.secondary} max-w-4xl mx-auto leading-relaxed`}
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
                    gsap.to(el, { scale: 1.03, duration: 0.3, ease: "power2.out" }),
                  );
                  el.addEventListener("mouseleave", () =>
                    gsap.to(el, { scale: 1, duration: 0.3, ease: "power2.out" }),
                  );
                }
              }}
              className={`rounded-3xl border shadow-2xl p-10 md:p-12 backdrop-blur-xl max-w-lg ${themeColors.card} border-amber-500/20`}
            >
              <div className="text-center space-y-8">
                <div className="flex items-center justify-center space-x-6">
                  <div
                    ref={(el) => {
                      if (el) {
                        el.addEventListener("mouseenter", () =>
                          gsap.to(el, { rotation: 360, duration: 0.8, ease: "power2.out" }),
                        );
                      }
                    }}
                    className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl"
                  >
                    <span
                      ref={(el) => {
                        if (el) {
                          gsap.fromTo(
                            el,
                            { scale: 0 },
                            {
                              scale: 1,
                              duration: 0.8,
                              delay: 0.8,
                              ease: "back.out(1.7)",
                            },
                          );
                        }
                      }}
                      className="text-white font-bold text-3xl"
                    >
                      7
                    </span>
                  </div>
                  <div className="text-left">
                    <h3 className={`text-3xl font-bold ${themeColors.text.primary}`}>
                      Day Streak!
                    </h3>
                    <p className={`${themeColors.text.muted} text-lg`}>Joy tracking</p>
                  </div>
                </div>

                <div className="flex justify-center space-x-3">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      ref={(el) => {
                        if (el) {
                          el.addEventListener("mouseenter", () =>
                            gsap.to(el, { scale: 1.2, duration: 0.3, ease: "power2.out" }),
                          );
                          el.addEventListener("mouseleave", () =>
                            gsap.to(el, { scale: 1, duration: 0.3, ease: "power2.out" }),
                          );
                        }
                      }}
                      className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg"
                    >
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <p className={`${themeColors.text.primary} text-xl font-medium`}>
                    7-day joy streak!
                  </p>
                  <p className={`${themeColors.text.secondary} leading-relaxed text-lg`}>
                    Share with your circle or keep it just for you. Both are
                    perfect.
                  </p>

                  <div className="flex space-x-4 justify-center pt-6">
                    <button
                      ref={(el) => {
                        if (el) {
                          el.addEventListener("mouseenter", () =>
                            gsap.to(el, { scale: 1.05, duration: 0.3, ease: "power2.out" }),
                          );
                          el.addEventListener("mouseleave", () =>
                            gsap.to(el, { scale: 1, duration: 0.3, ease: "power2.out" }),
                          );
                        }
                      }}
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-xl text-base font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border h-12 px-6 border-amber-500/50 text-amber-400 hover:bg-amber-500/10 transition-colors duration-300 ${
                        theme === "dark" ? "bg-background" : "bg-white/50"
                      }`}
                    >
                      Share
                    </button>
                    <button
                      ref={(el) => {
                        if (el) {
                          el.addEventListener("mouseenter", () =>
                            gsap.to(el, { scale: 1.05, duration: 0.3, ease: "power2.out" }),
                          );
                          el.addEventListener("mouseleave", () =>
                            gsap.to(el, { scale: 1, duration: 0.3, ease: "power2.out" }),
                          );
                        }
                      }}
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-xl text-base font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-6 transition-colors duration-300 ${
                        theme === "dark"
                          ? "text-slate-400 hover:text-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
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

// Enhanced Loading skeleton for lazy sections
const SectionSkeleton = React.memo(() => (
  <div className="py-20 space-y-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-6">
        <Skeleton className="h-10 w-80 mx-auto" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-2xl" />
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
