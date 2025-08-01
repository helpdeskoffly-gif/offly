import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import Logo from "./Logo";
import { WaitlistSection } from "./WaitlistSection";
import { 
  ArrowLeft, 
  Users, 
  Heart, 
  Sparkles,
  Globe,
  Star
} from "lucide-react";

export function WaitlistPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  // GSAP refs
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const backgroundRef = useRef(null);

  const premiumGradients = {
    primary: theme === "dark"
      ? "from-violet-500 via-purple-500 to-fuchsia-500"
      : "from-violet-600 via-purple-600 to-fuchsia-600",
    secondary: theme === "dark"
      ? "from-blue-500 via-indigo-500 to-purple-500"
      : "from-blue-600 via-indigo-600 to-purple-600",
    accent: theme === "dark"
      ? "from-emerald-400 via-teal-400 to-cyan-400"
      : "from-emerald-500 via-teal-500 to-cyan-500",
    background: theme === "dark"
      ? "from-slate-950 via-gray-950 to-slate-950"
      : "from-slate-50 via-white to-slate-100",
  };

  const themeColors = {
    text: {
      primary: theme === "dark" ? "text-white" : "text-gray-900",
      secondary: theme === "dark" ? "text-slate-300" : "text-gray-700",
      muted: theme === "dark" ? "text-slate-400" : "text-gray-500",
    },
  };

  // Enhanced GSAP animations
  useEffect(() => {
    if (containerRef.current && headerRef.current && contentRef.current) {
      const ctx = gsap.context(() => {
        // Background elements animation
        gsap.set(".floating-orb", { opacity: 0, scale: 0.8 });
        gsap.to(".floating-orb", {
          opacity: 1,
          scale: 1,
          duration: 2,
          stagger: 0.3,
          ease: "power2.out"
        });

        // Floating animation for orbs
        gsap.to(".floating-orb-1", {
          x: 30,
          y: -20,
          rotation: 360,
          duration: 20,
          repeat: -1,
          ease: "none"
        });

        gsap.to(".floating-orb-2", {
          x: -25,
          y: 25,
          rotation: -360,
          duration: 25,
          repeat: -1,
          ease: "none"
        });

        // Main content animation
        const tl = gsap.timeline();
        
        tl.fromTo(
          headerRef.current,
          { opacity: 0, y: 40, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
        )
        .fromTo(
          contentRef.current,
          { opacity: 0, y: 60, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" },
          "-=0.4"
        )
        .fromTo(
          ".feature-item",
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" },
          "-=0.6"
        );
      }, containerRef);

      return () => ctx.revert();
    }
  }, []);

  // Enhanced floating background
  const FloatingBackground = () => (
    <div ref={backgroundRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient orbs */}
      <div className={`floating-orb floating-orb-1 absolute top-20 left-20 w-96 h-96 bg-gradient-to-r ${premiumGradients.primary} opacity-10 rounded-full blur-3xl`} />
      <div className={`floating-orb floating-orb-2 absolute top-40 right-32 w-80 h-80 bg-gradient-to-r ${premiumGradients.secondary} opacity-10 rounded-full blur-3xl`} />
      <div className={`floating-orb floating-orb-3 absolute bottom-32 left-1/3 w-72 h-72 bg-gradient-to-r ${premiumGradients.accent} opacity-10 rounded-full blur-3xl`} />
      
      {/* Grid pattern */}
      <div className={`absolute inset-0 ${theme === "dark" ? "opacity-5" : "opacity-10"}`} 
           style={{
             backgroundImage: `radial-gradient(circle at 1px 1px, ${theme === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} 1px, transparent 0)`,
             backgroundSize: "24px 24px"
           }} 
      />
    </div>
  );

  return (
    <div ref={containerRef} className={`min-h-screen bg-gradient-to-br ${premiumGradients.background} relative overflow-hidden`}>
      <FloatingBackground />

      {/* Header */}
      <div className="relative z-10 w-full p-4 lg:p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Logo size="lg" />
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className={`${themeColors.text.secondary} hover:${themeColors.text.primary}`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/auth")}
              className={`${themeColors.text.secondary} hover:${themeColors.text.primary}`}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 lg:px-6">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Info */}
          <div ref={headerRef} className="space-y-8 w-full text-center lg:text-left">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto lg:mx-0 shadow-2xl">
                <Heart className="w-10 h-10 text-white" />
              </div>
              
              <div>
                <h1 className={`text-4xl lg:text-6xl font-bold ${themeColors.text.primary} leading-tight mb-4`}>
                  Join Our 
                  <span className={`bg-gradient-to-r ${premiumGradients.primary} bg-clip-text text-transparent`}>
                    {" "}Waitlist
                  </span>
                </h1>
                <p className={`text-xl ${themeColors.text.secondary} leading-relaxed max-w-2xl mx-auto lg:mx-0`}>
                  Be the first to know when we expand our wellness community. 
                  We're building something special and can't wait to share it with you.
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {[
                { icon: Users, title: "Early Access", desc: "Get priority access when we open more spots" },
                { icon: Sparkles, title: "Exclusive Updates", desc: "Receive updates on new features and improvements" },
                { icon: Globe, title: "Community Updates", desc: "Stay connected with our growing wellness community" },
                { icon: Star, title: "Special Perks", desc: "Enjoy exclusive benefits for early supporters" }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="feature-item flex items-center space-x-4 lg:justify-start justify-center">
                    <div className={`w-12 h-12 bg-gradient-to-r ${premiumGradients.secondary} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className={`font-semibold ${themeColors.text.primary}`}>{feature.title}</h3>
                      <p className={`text-sm ${themeColors.text.muted}`}>{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side - Waitlist Form */}
          <div ref={contentRef} className="w-full max-w-md mx-auto">
            <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-violet-200/50 dark:border-slate-800/50 rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h2 className={`text-2xl font-bold ${themeColors.text.primary} mb-2`}>
                  Reserve Your Spot
                </h2>
                <p className={`text-sm ${themeColors.text.muted}`}>
                  Join our waitlist and be notified when we're ready for more members
                </p>
              </div>

              <WaitlistSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
