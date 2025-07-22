import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import {
  X,
  CheckCircle,
  Sparkles,
  Heart,
  Gamepad2,
  Book,
  Music,
  Camera,
  Coffee,
  Dumbbell,
  Palette,
  Code,
  Plane,
  Users,
  Star,
  Plus,
  ArrowRight,
  Clock,
  Zap,
} from "lucide-react";
import { markProfileAsCompleted } from "../services/database";

export function ProfileCompletionModal({ user, isOpen, onClose, onComplete }) {
  const { theme } = useTheme();

  // Modal animation refs
  const modalRef = useRef(null);
  const contentRef = useRef(null);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Hobbies state
  const [selectedHobbies, setSelectedHobbies] = useState([]);
  const [customHobby, setCustomHobby] = useState("");

  // Hobby categories for personalization
  const availableHobbies = [
    { id: "reading", label: "Reading", icon: Book, color: "text-blue-500", category: "Learning" },
    { id: "books", label: "Books", icon: Book, color: "text-blue-600", category: "Learning" },
    { id: "science", label: "Science", icon: Star, color: "text-blue-400", category: "Learning" },
    { id: "history", label: "History", icon: Book, color: "text-amber-600", category: "Learning" },
    { id: "philosophy", label: "Philosophy", icon: Book, color: "text-indigo-500", category: "Learning" },
    
    { id: "music", label: "Music", icon: Music, color: "text-purple-500", category: "Arts & Media" },
    { id: "movies", label: "Movies", icon: Star, color: "text-violet-500", category: "Arts & Media" },
    { id: "tv_shows", label: "TV Shows", icon: Star, color: "text-violet-400", category: "Arts & Media" },
    { id: "photography", label: "Photography", icon: Camera, color: "text-yellow-500", category: "Arts & Media" },
    { id: "art", label: "Art & Drawing", icon: Palette, color: "text-pink-500", category: "Arts & Media" },
    { id: "podcasts", label: "Podcasts", icon: Music, color: "text-purple-400", category: "Arts & Media" },
    
    { id: "gaming", label: "Gaming", icon: Gamepad2, color: "text-green-500", category: "Technology" },
    { id: "coding", label: "Programming", icon: Code, color: "text-indigo-500", category: "Technology" },
    { id: "tech", label: "Technology", icon: Code, color: "text-blue-500", category: "Technology" },
    { id: "crypto", label: "Cryptocurrency", icon: Code, color: "text-yellow-600", category: "Technology" },
    
    { id: "fitness", label: "Fitness", icon: Dumbbell, color: "text-red-500", category: "Health & Lifestyle" },
    { id: "cooking", label: "Cooking", icon: Coffee, color: "text-orange-500", category: "Health & Lifestyle" },
    { id: "meditation", label: "Meditation", icon: Heart, color: "text-rose-500", category: "Health & Lifestyle" },
    { id: "yoga", label: "Yoga", icon: Heart, color: "text-pink-400", category: "Health & Lifestyle" },
    { id: "nutrition", label: "Nutrition", icon: Heart, color: "text-green-600", category: "Health & Lifestyle" },
    
    { id: "travel", label: "Travel", icon: Plane, color: "text-cyan-500", category: "Adventure" },
    { id: "hiking", label: "Hiking", icon: Plane, color: "text-green-500", category: "Adventure" },
    { id: "outdoors", label: "Outdoors", icon: Plane, color: "text-emerald-500", category: "Adventure" },
    { id: "sports", label: "Sports", icon: Dumbbell, color: "text-blue-600", category: "Adventure" },
    
    { id: "socializing", label: "Socializing", icon: Users, color: "text-emerald-500", category: "Social" },
    { id: "dating", label: "Dating", icon: Heart, color: "text-red-400", category: "Social" },
    { id: "relationships", label: "Relationships", icon: Users, color: "text-pink-600", category: "Social" },
    { id: "networking", label: "Networking", icon: Users, color: "text-blue-500", category: "Social" },
    
    { id: "diy", label: "DIY & Crafts", icon: Palette, color: "text-orange-600", category: "Hobbies" },
    { id: "gardening", label: "Gardening", icon: Heart, color: "text-green-400", category: "Hobbies" },
    { id: "collecting", label: "Collecting", icon: Star, color: "text-purple-600", category: "Hobbies" },
    { id: "writing", label: "Writing", icon: Book, color: "text-indigo-400", category: "Hobbies" },
    
    { id: "investing", label: "Investing", icon: Star, color: "text-green-700", category: "Finance" },
    { id: "entrepreneurship", label: "Entrepreneurship", icon: Star, color: "text-orange-700", category: "Finance" },
    { id: "personal_finance", label: "Personal Finance", icon: Star, color: "text-blue-700", category: "Finance" },
  ];

  // Group hobbies by category
  const hobbiesByCategory = availableHobbies.reduce((acc, hobby) => {
    if (!acc[hobby.category]) {
      acc[hobby.category] = [];
    }
    acc[hobby.category].push(hobby);
    return acc;
  }, {});

  // Theme colors for hobby selection
  const themeColors = {
    background: theme === "dark"
      ? "bg-slate-950/95 backdrop-blur-xl"
      : "bg-white/95 backdrop-blur-xl",
    modal: theme === "dark"
      ? "bg-slate-900/95 border-slate-800/50 backdrop-blur-xl"
      : "bg-white/95 border-slate-200/50 backdrop-blur-xl",
    text: {
      primary: theme === "dark" ? "text-white" : "text-gray-900",
      secondary: theme === "dark" ? "text-slate-300" : "text-gray-700",
      muted: theme === "dark" ? "text-slate-400" : "text-gray-600",
    },
    card: theme === "dark"
      ? "bg-slate-800/50 border-slate-700/30 backdrop-blur-sm"
      : "bg-white/70 border-slate-200/50 backdrop-blur-sm",
    categoryHeader: theme === "dark"
      ? "bg-slate-800/80 border-slate-700/50"
      : "bg-slate-50/80 border-slate-200/50",
    button: {
      primary: theme === "dark"
        ? "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
        : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700",
      secondary: theme === "dark"
        ? "bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
        : "bg-slate-100 hover:bg-slate-200 text-gray-900 border-slate-300",
    },
  };

  // Animation effects
  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "power2.out" },
      );

      gsap.fromTo(
        ".hobby-category",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 },
      );
    }
  }, [isOpen]);

  // Handle hobby selection
  const toggleHobby = (hobbyId) => {
    setSelectedHobbies((prev) =>
      prev.includes(hobbyId)
        ? prev.filter((id) => id !== hobbyId)
        : [...prev, hobbyId],
    );
  };

  // Add custom hobby
  const addCustomHobby = () => {
    if (
      customHobby.trim() &&
      !selectedHobbies.includes(customHobby.trim().toLowerCase())
    ) {
      setSelectedHobbies((prev) => [...prev, customHobby.trim().toLowerCase()]);
      setCustomHobby("");
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      // Prepare the profile data
      const profileData = {
        username: user?.email?.split("@")[0] || "User",
        hobbies: selectedHobbies,
        full_name: user?.email?.split("@")[0] || "User",
      };

      // Mark profile as completed using database service
      const result = await markProfileAsCompleted(user.id, profileData);

      if (!result.success) {
        throw new Error(result.error || "Failed to update profile");
      }

      // Call completion callback
      onComplete?.(profileData);

      // Close modal
      onClose();
    } catch (err) {
      setError("Failed to save profile. Please try again.");
      console.error("Profile completion error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle "I'll do it later" option
  const handleDoLater = () => {
    console.log("User selected 'I'll do it later'");
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 ${themeColors.background}`}
        onClick={handleDoLater}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden ${themeColors.modal} shadow-2xl rounded-xl sm:rounded-2xl border`}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 ${themeColors.categoryHeader} border-b px-4 sm:px-6 lg:px-8 py-4 sm:py-6`}>
                      <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-xl sm:text-2xl font-bold ${themeColors.text.primary}`}>
                    Tell us about your hobbies
                  </h2>
                  <p className={`${themeColors.text.secondary} mt-1 text-sm sm:text-base hidden sm:block`}>
                    Select your hobbies and interests. This helps us personalize your wellness activities and recommendations.
                  </p>
                </div>
              </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDoLater}
              className={`${themeColors.text.muted} hover:${themeColors.text.primary} rounded-full p-2`}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content - Full width hobby selection */}
        <div className="overflow-y-auto max-h-[calc(95vh-200px)] sm:max-h-[calc(90vh-200px)]">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className={`${themeColors.text.secondary} font-medium`}>
                  Select your interests ({selectedHobbies.length} selected)
                </span>
                <span className={`${themeColors.text.muted}`}>
                  Choose as many as you like
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (selectedHobbies.length / 5) * 100)}%` }}
                />
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {Object.entries(hobbiesByCategory).map(([category, hobbies]) => (
                <div key={category} className="hobby-category">
                  <div className={`${themeColors.card} rounded-xl border p-6`}>
                    <h3 className={`text-lg font-semibold ${themeColors.text.primary} mb-4 flex items-center`}>
                      <div className="w-3 h-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full mr-3"></div>
                      {category}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {hobbies.map((hobby) => {
                        const Icon = hobby.icon;
                        const isSelected = selectedHobbies.includes(hobby.id);
                        return (
                          <button
                            key={hobby.id}
                            onClick={() => toggleHobby(hobby.id)}
                            className={`p-3 rounded-lg border-2 transition-all duration-200 text-left group hover:scale-105 ${
                              isSelected
                                ? "border-violet-500 bg-violet-500/10 shadow-lg"
                                : theme === "dark"
                                  ? "border-slate-600 hover:border-violet-400 hover:bg-slate-700/50"
                                  : "border-slate-200 hover:border-violet-400 hover:bg-violet-50/50"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon className={`w-5 h-5 ${isSelected ? "text-violet-500" : hobby.color} transition-colors`} />
                              <span className={`text-sm font-medium truncate ${
                                isSelected
                                  ? "text-violet-600 dark:text-violet-400"
                                  : themeColors.text.secondary
                              } transition-colors`}>
                                {hobby.label}
                              </span>
                              {isSelected && (
                                <CheckCircle className="w-4 h-4 text-violet-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom hobby input */}
            <div className={`mt-8 ${themeColors.card} rounded-xl border p-6`}>
              <h3 className={`text-lg font-semibold ${themeColors.text.primary} mb-4 flex items-center`}>
                <Plus className="w-5 h-5 mr-3 text-violet-500" />
                Add Custom Interest
              </h3>
              <div className="flex gap-3">
                <Input
                  value={customHobby}
                  onChange={(e) => setCustomHobby(e.target.value)}
                  placeholder="e.g., Astronomy, Woodworking, Baking..."
                  className="flex-1 h-12"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addCustomHobby();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addCustomHobby}
                  disabled={!customHobby.trim()}
                  className="h-12 px-6 bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {/* Selected hobbies preview */}
            {selectedHobbies.length > 0 && (
              <div className={`mt-6 ${themeColors.card} rounded-xl border p-6`}>
                <h3 className={`text-lg font-semibold ${themeColors.text.primary} mb-4 flex items-center`}>
                  <Heart className="w-5 h-5 mr-3 text-pink-500" />
                  Your Selected Hobbies ({selectedHobbies.length})
                </h3>
                <div className="flex flex-wrap gap-3">
                  {selectedHobbies.map((hobbyId) => {
                    const hobby = availableHobbies.find((h) => h.id === hobbyId);
                    return (
                      <div
                        key={hobbyId}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-700 dark:text-violet-300 rounded-full text-sm border border-violet-500/30"
                      >
                        <span className="font-medium">
                          {hobby?.label || hobbyId.replace("_", " ")}
                        </span>
                        <button
                          onClick={() => toggleHobby(hobbyId)}
                          className="hover:bg-violet-500/30 rounded-full p-1 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed bottom */}
        <div className={`sticky bottom-0 ${themeColors.categoryHeader} border-t px-4 sm:px-6 lg:px-8 py-4 sm:py-6`}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="flex items-center space-x-2 sm:space-x-3 order-2 sm:order-1">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              <span className={`text-xs sm:text-sm ${themeColors.text.muted} text-center sm:text-left`}>
                You can always change these later
              </span>
            </div>
            
            <div className="flex gap-3 sm:gap-4 w-full sm:w-auto order-1 sm:order-2">
              <Button
                variant="outline"
                onClick={handleDoLater}
                className={`h-10 sm:h-12 px-4 sm:px-6 ${themeColors.button.secondary} border-2 flex-1 sm:flex-none text-sm sm:text-base`}
              >
                I'll do it later
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || selectedHobbies.length === 0}
                className={`h-10 sm:h-12 px-6 sm:px-8 ${themeColors.button.primary} text-white font-medium shadow-lg flex-1 sm:flex-none text-sm sm:text-base`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
                    Saving Hobbies...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-3" />
                    Save {selectedHobbies.length} Hobbies
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
