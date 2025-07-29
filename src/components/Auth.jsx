import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import Logo from "./Logo";
import { Card } from "./ui/Card";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { ProfileCompletionModal } from "./ProfileCompletionModal";
import { supabase, supabaseHelpers } from "../supabase";
import { createSignupUser, createActiveUser } from "../services/database";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  Shield, 
  Heart,
  CheckCircle,
  ArrowRight,
  Globe,
  Zap,
  Menu,
  X,
  ChevronDown
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";

export function Auth() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");

  // GSAP refs for animations
  const containerRef = useRef(null);
  const authCardRef = useRef(null);
  const titleRef = useRef(null);
  const backgroundRef = useRef(null);

  // Premium theme colors
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
    card: theme === "dark"
      ? "bg-slate-900/80 border-slate-800/50 backdrop-blur-xl"
      : "bg-white/90 border-slate-200/50 backdrop-blur-xl",
    input: theme === "dark"
      ? "bg-slate-800/50 border-slate-700/50 focus:border-violet-400"
      : "bg-white/50 border-slate-300/50 focus:border-violet-500",
  };

  useEffect(() => {
    if (!loading && user) {
      console.log("Auth: User authenticated, navigating to dashboard...", { userId: user.id, loading });
      // Add a small delay to ensure router is ready
      const timer = setTimeout(() => {
        console.log("Auth: Executing navigation to dashboard");
        navigate("/dashboard", { replace: true });
      }, 200); // Slightly longer delay
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  // Additional safety mechanism - navigate even if userProfile is still loading
  useEffect(() => {
    if (user && !loading) {
      console.log("Auth: Safety navigation check - user exists and not loading");
      const safetyTimer = setTimeout(() => {
        if (user) {
          console.log("Auth: Safety navigation triggered");
          navigate("/dashboard", { replace: true });
        }
      }, 3000); // Wait 3 seconds then force navigation
      return () => clearTimeout(safetyTimer);
    }
  }, [user, loading, navigate]);

  // Handle OAuth callback
  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session?.user && !user) {
        // Check if this is a new user
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.session.user.id)
          .single();

        if (!existingUser) {
          // New user - create records and show profile completion
          await createSignupUser(
            data.session.user.id,
            data.session.user.email,
            data.session.user.user_metadata?.full_name ||
              data.session.user.email,
            { termsAccepted },
          );
          setShowProfileModal(true);
        }
      }
    };

    handleAuthCallback();
  }, [user, termsAccepted]);

  // Enhanced GSAP animations with mobile considerations
  useEffect(() => {
    if (containerRef.current && authCardRef.current && titleRef.current) {
      const ctx = gsap.context(() => {
        // Stagger entrance animations
        const tl = gsap.timeline();

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

        gsap.to(".floating-orb-3", {
          x: 20,
          y: -30,
          rotation: 360,
          duration: 30,
          repeat: -1,
          ease: "none"
        });

        // Main content animation
        tl.fromTo(
          titleRef.current,
          { opacity: 0, y: 40, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
        )
        .fromTo(
          authCardRef.current,
          { opacity: 0, y: 60, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" },
          "-=0.4"
        )
        .fromTo(
          ".auth-feature",
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" },
          "-=0.6"
        );

        // Mobile-specific animations
        const isMobile = window.innerWidth < 1024;
        if (isMobile) {
          // Add subtle hover animations for mobile
          gsap.utils.toArray(".mobile-touch-target").forEach(element => {
            element.addEventListener("touchstart", () => {
              gsap.to(element, { scale: 0.98, duration: 0.1 });
            });
            element.addEventListener("touchend", () => {
              gsap.to(element, { scale: 1, duration: 0.1 });
            });
          });

          // Add form field focus animations
          gsap.utils.toArray("input").forEach(input => {
            input.addEventListener("focus", () => {
              gsap.to(input, { 
                scale: 1.02, 
                duration: 0.2, 
                ease: "power2.out" 
              });
            });
            input.addEventListener("blur", () => {
              gsap.to(input, { 
                scale: 1, 
                duration: 0.2, 
                ease: "power2.out" 
              });
            });
          });
        }
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

  const handleGoogleSignIn = async () => {
    try {
      setFormLoading(true);
      setError("");

      const { data, error } = await supabaseHelpers.signInWithGoogle();

      if (error) {
        throw error;
      }

      // The auth state change will be handled by the useAuth hook
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(err.message || "Google sign-in failed. Please try again.");
      setFormLoading(false);
    }
  };

  const handleEmailPasswordAuth = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the terms and conditions");
      return;
    }

    try {
      setFormLoading(true);
      setError("");

      if (isSignUp) {
        // Sign up with email/password
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth?confirmed=true`,
            data: {
              full_name: username || email.split("@")[0],
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data.user && !data.session) {
          // Email confirmation required
          setSuccessMessage(
            "🎉 Account created successfully! Please check your email for a confirmation link to complete your registration."
          );
          setIsSignUp(false); // Switch to sign in mode
          setFormLoading(false);
          return;
        } else if (data.user && data.session) {
          // Create user records
          await createSignupUser(
            data.user.id,
            email,
            username || email.split("@")[0],
            { termsAccepted },
          );
          // Immediate login (email confirmation disabled)
          console.log("Auth: Sign up successful, navigating to dashboard");
          setTimeout(() => navigate("/dashboard"), 100);
        }
      } else {
        // Sign in with email/password
        const { data, error } = await supabaseHelpers.signIn(email, password);

        if (error) {
          throw error;
        }

        // The auth state change will be handled by the useAuth hook
        console.log("Auth: Sign in successful, letting useAuth handle navigation");
        // Don't navigate immediately, let the useEffect handle it
        // navigate("/dashboard");
      }
    } catch (err) {
      console.error("Email auth error:", err);

      // Handle specific Supabase auth errors
      let errorMessage = "Authentication failed. Please try again.";

      if (err.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (err.message?.includes("Email not confirmed")) {
        errorMessage = "Please check your email and click the confirmation link.";
      } else if (err.message?.includes("Password should be at least")) {
        errorMessage = "Password should be at least 6 characters long.";
      } else if (err.message?.includes("User already registered")) {
        errorMessage = "This email is already registered. Try signing in instead.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    try {
      setFormLoading(true);
      setError("");

      // Update user profile with username
      if (user) {
        const { error } = await supabase
          .from("users")
          .update({ username: username.trim() })
          .eq("id", user.id);

        if (error) throw error;

        await createActiveUser(user.id, username.trim());
        console.log("Auth: Username updated, navigating to dashboard");
        setTimeout(() => navigate("/dashboard"), 100);
      }
    } catch (err) {
      setError("Failed to update username. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleProfileComplete = async (profileData) => {
    try {
      if (user) {
        // Update user profile
        const { error } = await supabase
          .from("users")
          .update({
            username: profileData.username,
            full_name: profileData.displayName,
          })
          .eq("id", user.id);

        if (error) throw error;

        await createActiveUser(user.id, profileData.username);
        setShowProfileModal(false);
        console.log("Auth: Profile completed, navigating to dashboard");
        setTimeout(() => navigate("/dashboard"), 100);
      }
    } catch (err) {
      console.error("Profile completion error:", err);
      setError("Failed to complete profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${premiumGradients.background} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent mx-auto mb-4"></div>
          <p className={`${themeColors.text.secondary} text-lg`}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`min-h-screen bg-gradient-to-br ${premiumGradients.background} relative overflow-hidden`}>
      <FloatingBackground />

      {/* Mobile Header */}
      <div className="relative z-10 w-full p-4 lg:p-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Logo size="lg" />
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className={`${themeColors.text.secondary} hover:${themeColors.text.primary}`}
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Back to Home
            </Button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <Drawer open={showMobileMenu} onOpenChange={setShowMobileMenu}>
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`${themeColors.text.secondary} hover:${themeColors.text.primary} p-2`}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </DrawerTrigger>
          </div>
          <DrawerContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50">
            <DrawerHeader className="text-center">
              <DrawerTitle className={`${themeColors.text.primary} text-lg`}>
                Navigation
              </DrawerTitle>
            </DrawerHeader>
            <div className="p-6 space-y-4">
              <Button
                variant="ghost"
                onClick={() => {
                  navigate("/");
                  setShowMobileMenu(false);
                }}
                className={`w-full justify-start h-12 ${themeColors.text.secondary} hover:${themeColors.text.primary} text-left`}
              >
                <ArrowRight className="w-4 h-4 mr-3 rotate-180" />
                Back to Home
              </Button>
              
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Quick Actions</div>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setActiveTab("signin");
                      setIsSignUp(false);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 h-12 flex items-center ${
                      activeTab === "signin" 
                        ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg" 
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <User className="w-4 h-4 mr-3" />
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("signup");
                      setIsSignUp(true);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 h-12 flex items-center ${
                      activeTab === "signup" 
                        ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg" 
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 mr-3" />
                    Create Account
                  </button>
                </div>
              </div>
              
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Features</div>
                <div className="space-y-2">
                  {[
                    { icon: Heart, title: "Daily Check-ins", desc: "Track your mood and thoughts" },
                    { icon: Sparkles, title: "AI Insights", desc: "Get personalized recommendations" },
                    { icon: Shield, title: "Private & Secure", desc: "Your data is encrypted" },
                    { icon: Globe, title: "Community Support", desc: "Connect with others" }
                  ].map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <div className={`w-8 h-8 bg-gradient-to-r ${premiumGradients.secondary} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium text-sm ${themeColors.text.primary}`}>{feature.title}</div>
                          <div className={`text-xs ${themeColors.text.muted}`}>{feature.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 lg:px-6">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Side - Features (Hidden on mobile) */}
          <div className="hidden lg:block space-y-8 w-full">
            <div ref={titleRef} className="space-y-4">
              <h1 className={`text-4xl lg:text-5xl font-bold ${themeColors.text.primary} leading-tight`}>
                {isSignUp ? "Join the Community" : "Welcome Back"}
              </h1>
              <p className={`text-xl ${themeColors.text.secondary} leading-relaxed`}>
                {isSignUp 
                  ? "Start your wellness journey with personalized insights and a supportive community"
                  : "Continue your wellness journey with meaningful check-ins and insights"
                }
              </p>
            </div>

            <div className="space-y-6">
              {[
                { icon: Heart, title: "Daily Check-ins", desc: "Track your mood and thoughts with meaningful reflections" },
                { icon: Sparkles, title: "AI Insights", desc: "Get personalized recommendations based on your patterns" },
                { icon: Shield, title: "Private & Secure", desc: "Your data is encrypted and completely private" },
                { icon: Globe, title: "Community Support", desc: "Connect with others on similar wellness journeys" }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="auth-feature flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${premiumGradients.secondary} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${themeColors.text.primary}`}>{feature.title}</h3>
                      <p className={`text-sm ${themeColors.text.muted}`}>{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Title */}
          <div className="lg:hidden w-full text-center mb-6">
            <div ref={titleRef} className="space-y-3">
              <h1 className={`text-3xl font-bold ${themeColors.text.primary} leading-tight`}>
                {isSignUp ? "Join the Community" : "Welcome Back"}
              </h1>
              <p className={`text-base ${themeColors.text.secondary} leading-relaxed px-4`}>
                {isSignUp 
                  ? "Start your wellness journey with personalized insights"
                  : "Continue your wellness journey with meaningful check-ins"
                }
              </p>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="flex justify-center w-full">
            <Card ref={authCardRef} className={`w-full max-w-md ${themeColors.card} border shadow-2xl overflow-hidden`}>
              <div className={`p-6 lg:p-8 bg-gradient-to-br ${premiumGradients.primary} relative`}>
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <div className="relative z-10 text-center text-white">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-6 h-6 lg:w-8 lg:h-8" />
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold mb-2">
                    {showUsernameInput
                      ? "Choose Username"
                      : isSignUp
                        ? "Create Account"
                        : "Sign In"}
                  </h2>
                  <p className="text-white/80 text-sm lg:text-base">
                    {showUsernameInput
                      ? "Pick a unique username for your account"
                      : isSignUp
                        ? "Join thousands on their wellness journey"
                        : "Continue your wellness journey"}
                  </p>
                </div>
              </div>

              <div className="p-4 lg:p-6 sm:p-8 space-y-6">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-sm">
                    {successMessage}
                  </div>
                )}

                {showUsernameInput ? (
                  <form onSubmit={handleUsernameSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="username" className={`${themeColors.text.secondary} text-sm font-medium`}>Username</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter your username"
                          className={`pl-12 h-14 text-base ${themeColors.input} rounded-xl`}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={formLoading || !username.trim()}
                      className={`w-full h-14 bg-gradient-to-r ${premiumGradients.primary} text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 text-base mobile-touch-target`}
                    >
                      {formLoading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <>
                    <form onSubmit={handleEmailPasswordAuth} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className={`${themeColors.text.secondary} text-sm font-medium`}>Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className={`pl-12 h-14 text-base ${themeColors.input} rounded-xl`}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className={`${themeColors.text.secondary} text-sm font-medium`}>Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className={`pl-12 pr-12 h-14 text-base ${themeColors.input} rounded-xl`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {isSignUp && (
                        <div className="space-y-2">
                          <Label htmlFor="username" className={`${themeColors.text.secondary} text-sm font-medium`}>Username (Optional)</Label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="username"
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              placeholder="Choose a username"
                              className={`pl-12 h-14 text-base ${themeColors.input} rounded-xl`}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-start space-x-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <Checkbox
                          id="terms"
                          checked={termsAccepted}
                          onCheckedChange={setTermsAccepted}
                          className="mt-1"
                        />
                        <Label htmlFor="terms" className={`text-sm ${themeColors.text.muted} leading-relaxed flex-1`}>
                          I agree to the Terms of Service and Privacy Policy
                        </Label>
                      </div>

                      <Button
                        type="submit"
                        disabled={formLoading || !termsAccepted}
                        className={`w-full h-14 bg-gradient-to-r ${premiumGradients.primary} text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 text-base mobile-touch-target`}
                      >
                        {formLoading ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            {isSignUp ? "Create Account" : "Sign In"}
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>

                    <div className="space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className={`px-4 bg-white dark:bg-slate-900 ${themeColors.text.muted}`}>
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleSignIn}
                        disabled={formLoading}
                        className={`w-full h-14 border-2 ${themeColors.text.secondary} hover:${themeColors.text.primary} transition-all duration-300 rounded-xl text-base mobile-touch-target`}
                      >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </Button>
                    </div>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(!isSignUp);
                          setActiveTab(isSignUp ? "signin" : "signup");
                        }}
                        className={`text-sm ${themeColors.text.muted} hover:${themeColors.text.primary} transition-colors duration-300 py-2 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 mobile-touch-target`}
                      >
                        {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileCompletionModal
          isOpen={showProfileModal}
          onComplete={handleProfileComplete}
          onSkip={() => {
            setShowProfileModal(false);
            console.log("Auth: Profile skipped, navigating to dashboard");
            setTimeout(() => navigate("/dashboard"), 100);
          }}
          userEmail={user?.email}
        />
      )}
    </div>
  );
}
