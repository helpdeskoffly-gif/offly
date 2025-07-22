import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { addToWaitlist } from "../services/database";

export function WaitlistSection() {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(""); // '', 'loading', 'success', 'error'
  const [message, setMessage] = useState("");

  // GSAP refs
  const containerRef = useRef(null);
  const backgroundElement1Ref = useRef(null);
  const backgroundElement2Ref = useRef(null);
  const titleSectionRef = useRef(null);
  const formSectionRef = useRef(null);
  const successSectionRef = useRef(null);
  const button1Ref = useRef(null);
  const button2Ref = useRef(null);
  const errorMessageRef = useRef(null);
  const submitButtonRef = useRef(null);

  const themeColors = {
    text: {
      primary: theme === "dark" ? "text-white" : "text-gray-900",
      secondary: theme === "dark" ? "text-slate-300" : "text-gray-700",
      muted: theme === "dark" ? "text-slate-400" : "text-gray-600",
    },
    card:
      theme === "dark"
        ? "bg-slate-800/50 border-slate-700/50"
        : "bg-white/70 border-orange-200/50",
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

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setStatus("error");
      setMessage("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");

    try {
      const result = await addToWaitlist(email);

      if (result.success) {
        setStatus("success");
        setMessage(
          "🎉 You're on the waitlist! We'll notify you when we launch.",
        );
        setEmail("");
      } else {
        setStatus("error");
        setMessage(result.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
      // Error adding to waitlist
    }
  };

  const resetStatus = () => {
    setStatus("idle");
    setMessage("");
  };

  // Button hover effects
  const setupButtonHover = (ref) => {
    if (!ref.current) return;

    const element = ref.current;

    const handleMouseEnter = () =>
      gsap.to(element, { scale: 1.05, duration: 0.2 });
    const handleMouseLeave = () =>
      gsap.to(element, { scale: 1, duration: 0.2 });

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  };

  // Submit button hover effects
  const setupSubmitButtonHover = (ref) => {
    if (!ref.current) return;

    const element = ref.current;

    const handleMouseEnter = () =>
      gsap.to(element, { scale: 1.02, duration: 0.2 });
    const handleMouseLeave = () =>
      gsap.to(element, { scale: 1, duration: 0.2 });
    const handleMouseDown = () =>
      gsap.to(element, { scale: 0.98, duration: 0.1 });
    const handleMouseUp = () =>
      gsap.to(element, { scale: 1.02, duration: 0.1 });

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousedown", handleMouseDown);
    element.addEventListener("mouseup", handleMouseUp);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousedown", handleMouseDown);
      element.removeEventListener("mouseup", handleMouseUp);
    };
  };

  useEffect(() => {
    // Background elements animation
    if (backgroundElement1Ref.current) {
      gsap.to(backgroundElement1Ref.current, {
        scale: 1.2,
        rotation: 180,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });
    }

    if (backgroundElement2Ref.current) {
      gsap.to(backgroundElement2Ref.current, {
        scale: 1.1,
        rotation: -90,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        delay: 1,
      });
    }

    // Initial container animation
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      );
    }
  }, []);

  useEffect(() => {
    // Title section animation
    if (titleSectionRef.current) {
      gsap.fromTo(
        titleSectionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      );
    }
  }, []);

  useEffect(() => {
    // Form section animation
    if (formSectionRef.current && status !== "success") {
      gsap.fromTo(
        formSectionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.1 },
      );
    }
  }, [status]);

  useEffect(() => {
    // Success section animation
    if (successSectionRef.current && status === "success") {
      gsap.fromTo(
        successSectionRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
      );
    }
  }, [status]);

  useEffect(() => {
    // Error message animation
    if (errorMessageRef.current && status === "error") {
      gsap.fromTo(
        errorMessageRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
      );
    }
  }, [status, message]);

  useEffect(() => {
    // Setup button hover effects
    const cleanup1 = setupButtonHover(button1Ref);
    const cleanup2 = setupButtonHover(button2Ref);
    const cleanup3 = setupSubmitButtonHover(submitButtonRef);

    return () => {
      cleanup1?.();
      cleanup2?.();
      cleanup3?.();
    };
  }, [status]);

  return (
    <div
      ref={containerRef}
      id="waitlist"
      className={`py-16 md:py-24 ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-900/50 via-purple-900/20 to-emerald-900/20"
          : "bg-gradient-to-br from-orange-100/50 via-yellow-100/50 to-amber-100/50"
      } relative overflow-hidden`}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          ref={backgroundElement1Ref}
          className={`absolute top-10 right-10 w-32 h-32 ${
            theme === "dark"
              ? "bg-gradient-to-r from-violet-500/20 to-purple-500/20"
              : "bg-gradient-to-r from-amber-300/30 to-orange-300/30"
          } rounded-full blur-2xl`}
        />
        <div
          ref={backgroundElement2Ref}
          className={`absolute bottom-10 left-10 w-24 h-24 ${
            theme === "dark"
              ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20"
              : "bg-gradient-to-r from-yellow-300/30 to-amber-300/30"
          } rounded-full blur-2xl`}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={titleSectionRef} className="text-center mb-12">
          <div
            className={`inline-flex items-center px-4 py-2 rounded-full mb-6 ${
              theme === "dark"
                ? "bg-amber-500/10 border border-amber-500/20"
                : "bg-amber-100 border border-amber-200"
            }`}
          >
            <span className="text-2xl mr-2">📬</span>
            <span
              className={`text-sm font-medium ${
                theme === "dark" ? "text-amber-400" : "text-amber-700"
              }`}
            >
              Join Our Waitlist
            </span>
          </div>

          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${themeColors.text.primary} mb-6`}
          >
            Be the first to experience{" "}
            <span
              className={`bg-gradient-to-r ${premiumGradients.secondary} bg-clip-text text-transparent`}
            >
              Offly
            </span>
          </h2>

          <p
            className={`text-lg sm:text-xl ${themeColors.text.secondary} max-w-2xl mx-auto mb-8`}
          >
            Join thousands of early adopters who are ready to transform their
            emotional wellness journey. Get exclusive early access and special
            launch benefits.
          </p>
        </div>

        <div ref={formSectionRef} className="max-w-2xl mx-auto">
          <Card className={`${themeColors.card} backdrop-blur-lg p-8`}>
            {status === "success" ? (
              <div ref={successSectionRef} className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3
                  className={`text-2xl font-bold ${themeColors.text.primary} mb-4`}
                >
                  You're on the list!
                </h3>
                <p className={`${themeColors.text.secondary} mb-6`}>
                  {message}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <div ref={button1Ref}>
                    <Button
                      onClick={resetStatus}
                      variant="outline"
                      className={`${
                        theme === "dark"
                          ? "border-slate-600 text-slate-300 hover:bg-slate-700/50"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Join Another Email
                    </Button>
                  </div>
                  <div ref={button2Ref}>
                    <Button
                      className={`bg-gradient-to-r ${premiumGradients.secondary} hover:shadow-xl hover:shadow-emerald-500/25 text-gray-900 font-semibold transition-all duration-300`}
                    >
                      Share with Friends
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    className={`block text-sm font-medium ${themeColors.text.secondary} mb-3`}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className={`w-full px-4 py-4 rounded-xl border ${
                        status === "error"
                          ? "border-red-500 focus:border-red-500"
                          : theme === "dark"
                            ? "border-slate-600 focus:border-violet-500"
                            : "border-gray-200 focus:border-violet-500"
                      } ${
                        theme === "dark"
                          ? "bg-slate-700/50 text-white placeholder-slate-400"
                          : "bg-white text-gray-900 placeholder-gray-500"
                      } focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-lg`}
                      disabled={status === "loading"}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <span className="text-2xl">✉️</span>
                    </div>
                  </div>
                </div>

                {status === "error" && message && (
                  <div
                    ref={errorMessageRef}
                    className="p-4 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <p className="text-sm text-red-500">{message}</p>
                  </div>
                )}

                <div ref={submitButtonRef}>
                  <Button
                    type="submit"
                    disabled={status === "loading"}
                    className={`w-full bg-gradient-to-r ${premiumGradients.primary} hover:shadow-xl hover:shadow-violet-500/25 text-white font-semibold py-4 text-lg transition-all duration-300`}
                  >
                    {status === "loading" ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Joining Waitlist...
                      </div>
                    ) : (
                      <>
                        <span>Join Waitlist</span>
                        <svg
                          className="ml-2 w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          ref={(el) => {
                            if (el) {
                              gsap.to(el, {
                                x: 4,
                                duration: 1.5,
                                repeat: -1,
                                yoyo: true,
                                ease: "power2.inOut",
                              });
                            }
                          }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <p className={`text-sm ${themeColors.text.muted}`}>
                    🔒 We respect your privacy. No spam, unsubscribe anytime.
                  </p>
                </div>
              </form>
            )}
          </Card>
        </div>

        {/* Benefits */}
        <div
          ref={(el) => {
            if (el) {
              gsap.fromTo(
                el,
                { opacity: 0, y: 20 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  delay: 0.4,
                  ease: "power2.out",
                },
              );
            }
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
        >
          {[
            {
              icon: "🚀",
              title: "Early Access",
              description: "Be among the first to use Offly when we launch",
            },
            {
              icon: "🎁",
              title: "Exclusive Benefits",
              description: "Special launch pricing and premium features",
            },
            {
              icon: "💬",
              title: "Shape the Product",
              description:
                "Your feedback will help us build the perfect experience",
            },
          ].map((benefit, index) => (
            <div
              key={index}
              ref={(el) => {
                if (el) {
                  gsap.fromTo(
                    el,
                    { opacity: 0, y: 20 },
                    {
                      opacity: 1,
                      y: 0,
                      duration: 0.8,
                      delay: 0.5 + index * 0.1,
                      ease: "power2.out",
                    },
                  );
                }
              }}
              className="text-center"
            >
              <div className="text-3xl mb-3">{benefit.icon}</div>
              <h3
                className={`text-lg font-semibold ${themeColors.text.primary} mb-2`}
              >
                {benefit.title}
              </h3>
              <p className={`text-sm ${themeColors.text.secondary}`}>
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
