import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { Button } from "./ui/Button";
import { Input } from "./ui/input";
import { addToWaitlist } from "../services/database";
import { 
  Users, 
  Shield, 
  Heart, 
  Mail,
  CheckCircle
} from "lucide-react";

export function UserLimitBanner({ userLimitReached, isSignUp, setIsSignUp, setActiveTab, setShowWaitlist }) {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(""); // '', 'loading', 'success', 'error'
  const [message, setMessage] = useState("");

  const themeColors = {
    text: {
      primary: theme === "dark" ? "text-white" : "text-gray-900",
      secondary: theme === "dark" ? "text-slate-300" : "text-gray-700",
      muted: theme === "dark" ? "text-slate-400" : "text-gray-500",
    },
  };

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleWaitlistSubmit = async (e) => {
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
        setMessage("🎉 You're on the waitlist! We'll notify you when we launch.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(result.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  const resetStatus = () => {
    setStatus("");
    setMessage("");
  };

  if (!userLimitReached) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Banner for Sign In mode - More Prominent */}
      {!isSignUp && (
        <div className="p-6 bg-gradient-to-r from-orange-50/90 to-amber-50/90 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200/50 dark:border-orange-800/50 rounded-xl backdrop-blur-sm mb-6 shadow-lg">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-orange-700 dark:text-orange-300 mb-1">
                🎉 We're at Capacity!
              </p>
              <p className="text-sm text-orange-600/80 dark:text-orange-400/80">
                Our community has reached its current limit. Existing users can sign in as usual.
              </p>
              <button
                onClick={() => {
                  setIsSignUp(true);
                  setActiveTab("signup");
                }}
                className="mt-3 text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline"
              >
                New user? Join our waitlist →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Banner for Sign Up mode with embedded waitlist */}
      {isSignUp && (
        <div className="p-8 bg-gradient-to-br from-orange-50/90 via-amber-50/80 to-yellow-50/90 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20 border border-orange-200/50 dark:border-orange-800/50 rounded-2xl shadow-lg backdrop-blur-sm">
          {/* Header Section */}
          <div className="text-center space-y-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                We're at Capacity! 🎉
              </h2>
              <p className="text-sm text-orange-600/80 dark:text-orange-400/80 mt-2">
                Our community has reached its current limit of 4 users
              </p>
            </div>
          </div>
          
          {/* Embedded Waitlist Form */}
          <div className="max-w-md mx-auto">
            {status === "success" ? (
              <div className="text-center p-6 bg-white/70 dark:bg-slate-800/50 rounded-xl border border-green-200/30 dark:border-green-800/30">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  You're on the list!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {message}
                </p>
                <Button
                  onClick={resetStatus}
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/20"
                >
                  Join Another Email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Join our waitlist
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className={`w-full pr-10 ${
                        status === "error"
                          ? "border-red-500 focus:border-red-500"
                          : "border-orange-300 focus:border-orange-500"
                      }`}
                      disabled={status === "loading"}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {status === "error" && message && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-500">{message}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600 hover:from-purple-600 hover:via-violet-600 hover:to-purple-700 text-white shadow-lg"
                >
                  {status === "loading" ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Joining...
                    </div>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Join Waitlist
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    🔒 We respect your privacy. No spam, unsubscribe anytime.
                  </p>
                </div>
              </form>
            )}
          </div>
          
          {/* Footer Note */}
          <div className="text-center pt-4 border-t border-orange-200/30 dark:border-orange-800/30 mt-6">
            <p className="text-xs text-orange-600/70 dark:text-orange-400/70">
              Thank you for your interest in joining our wellness community! 🌱
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
