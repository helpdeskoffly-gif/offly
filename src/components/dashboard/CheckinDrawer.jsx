import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { X, Sparkles, Send } from "lucide-react";

const CheckinDrawer = ({
  showCheckinDrawer,
  setShowCheckinDrawer,
  handleCheckinSubmit,
  theme,
  isSubmitting,
}) => {
  const [selectedMood, setSelectedMood] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState("");

  const contentRef = useRef(null);

  // 10 emojis in a horizontal row
  const moods = ["😢", "😔", "😐", "🙂", "😊", "😄", "🥰", "😎", "🤗", "🥳"];

  // Dynamic suggestions based on selected mood (limited to 3 for compact design)
  const moodSuggestions = {
    "😢": [
      "Feeling sad about something specific",
      "Need some comfort today",
      "Going through a tough time",
    ],
    "😔": [
      "Having a rough day",
      "Feeling a bit down",
      "Could use some support",
    ],
    "😐": [
      "Just an ordinary day",
      "Nothing special happening",
      "Feeling neutral about things",
    ],
    "🙂": [
      "Things are looking up",
      "Small victories today",
      "Feeling optimistic",
    ],
    "😊": ["Good vibes today", "Feeling grateful", "Happy about something"],
    "😄": [
      "Really excited about today",
      "Can't stop smiling",
      "Everything feels great",
    ],
    "🥰": [
      "Feeling loved and appreciated",
      "Heart is full",
      "Surrounded by warmth",
    ],
    "😎": [
      "Feeling confident and cool",
      "Got everything under control",
      "On top of my game",
    ],
    "🤗": [
      "Feeling warm and fuzzy",
      "Want to spread the love",
      "Grateful for good people",
    ],
    "🥳": [
      "Celebrating something special",
      "Party mood activated",
      "Achievement unlocked",
    ],
  };

  const themeColors = {
    background: theme === "dark" ? "bg-slate-900/95" : "bg-white/95",
    text: {
      primary: theme === "dark" ? "text-white" : "text-gray-900",
      secondary: theme === "dark" ? "text-slate-300" : "text-gray-600",
      muted: theme === "dark" ? "text-slate-400" : "text-gray-500",
    },
    border: theme === "dark" ? "border-slate-700" : "border-gray-200",
    card:
      theme === "dark"
        ? "bg-slate-800/50 border-slate-700/50"
        : "bg-gray-50/50 border-gray-200/50",
    hover: theme === "dark" ? "hover:bg-slate-700/50" : "hover:bg-gray-100/50",
  };

  // Get suggestions for selected mood
  const currentSuggestions = selectedMood
    ? moodSuggestions[selectedMood] || []
    : [];

  // Animate content when drawer opens
  useEffect(() => {
    if (showCheckinDrawer && contentRef.current) {
      gsap.fromTo(
        contentRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
      );
    }
  }, [showCheckinDrawer]);

  const handleSubmit = async () => {
    if (!selectedMood && !notes.trim() && !selectedSuggestion) {
      return; // Don't submit if nothing is selected
    }

    const finalNotes = notes.trim() || selectedSuggestion;

    await handleCheckinSubmit({
      emoji: selectedMood,
      notes: finalNotes,
      hashtags: [],
    });

    // Reset form
    setSelectedMood("");
    setNotes("");
    setSelectedSuggestion("");
  };

  const handleClose = () => {
    setShowCheckinDrawer(false);
    setSelectedMood("");
    setNotes("");
    setSelectedSuggestion("");
  };

  const selectSuggestion = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setNotes(""); // Clear custom notes when suggestion is selected
  };

  const clearSuggestion = () => {
    setSelectedSuggestion("");
  };

  return (
    <Drawer open={showCheckinDrawer} onOpenChange={setShowCheckinDrawer}>
      <DrawerContent
        className={`${themeColors.background} ${themeColors.border} border-t-2 max-h-[90vh]`}
      >
        <div className="max-w-2xl mx-auto w-full">
          <DrawerHeader className="text-center pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <DrawerTitle
                  className={`text-xl font-semibold ${themeColors.text.primary}`}
                >
                  Daily Check-in
                </DrawerTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className={`text-sm mt-2 ${themeColors.text.secondary}`}>
              How are you feeling today?
            </p>
          </DrawerHeader>

          <div ref={contentRef} className="px-6 pb-4 space-y-6">
            {/* Mood Selection - More spacious layout */}
            <div className="space-y-3">
              <h3 className={`text-sm font-medium ${themeColors.text.primary}`}>
                Select your mood
              </h3>

              <div className="grid grid-cols-5 gap-3 sm:flex sm:justify-between sm:gap-2">
                {moods.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedMood(emoji)}
                    className={`
                      w-14 h-14 sm:w-12 sm:h-12 rounded-xl text-2xl transition-all duration-200 flex items-center justify-center
                      ${
                        selectedMood === emoji
                          ? "bg-purple-500 scale-105 shadow-lg transform ring-2 ring-purple-300"
                          : `${themeColors.card} ${themeColors.hover} hover:scale-105 hover:shadow-md`
                      }
                    `}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {selectedMood && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <span className="text-lg">{selectedMood}</span>
                  <span className={`text-sm ${themeColors.text.secondary}`}>
                    Selected mood
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMood("")}
                    className="ml-auto h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Two Column Layout for Suggestions and Input */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Suggestions */}
              {currentSuggestions.length > 0 && (
                <div className="space-y-3">
                  <h3
                    className={`text-sm font-medium ${themeColors.text.primary}`}
                  >
                    Quick suggestions for {selectedMood}
                  </h3>
                  <div className="space-y-2">
                    {currentSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => selectSuggestion(suggestion)}
                        className={`
                          w-full p-3 text-left rounded-lg transition-all duration-200 text-sm
                          ${
                            selectedSuggestion === suggestion
                              ? "bg-purple-500 text-white"
                              : `${themeColors.card} ${themeColors.hover} ${themeColors.text.secondary}`
                          }
                        `}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Message */}
              <div className="space-y-3">
                <h3
                  className={`text-sm font-medium ${themeColors.text.primary}`}
                >
                  {selectedSuggestion
                    ? "Or write your own message"
                    : "Write your message"}
                </h3>

                {selectedSuggestion && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <span
                      className={`text-sm ${themeColors.text.primary} truncate flex-1`}
                    >
                      Using: "{selectedSuggestion}"
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSuggestion}
                      className="h-6 w-6 p-0 flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      selectedSuggestion
                        ? "Or write your own message..."
                        : "How are you feeling? What's on your mind?"
                    }
                    className={`min-h-[100px] resize-none ${themeColors.background} ${themeColors.border}`}
                    disabled={!!selectedSuggestion}
                    maxLength={300}
                  />

                  <p className={`text-xs ${themeColors.text.muted} text-right`}>
                    {notes.length}/300 characters
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DrawerFooter className="pt-4 pb-6">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  (!selectedMood && !notes.trim() && !selectedSuggestion)
                }
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Complete Check-in
                  </div>
                )}
              </Button>
            </div>

            {/* Compact Summary */}
            {(selectedMood || selectedSuggestion || notes.trim()) && (
              <div className="text-center mt-3">
                <p
                  className={`text-xs ${themeColors.text.muted} bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg inline-block`}
                >
                  {selectedMood && `Mood: ${selectedMood}`}
                  {selectedMood &&
                    (selectedSuggestion || notes.trim()) &&
                    " • "}
                  {selectedSuggestion && "Using quick suggestion"}
                  {notes.trim() && !selectedSuggestion && "Custom message"}
                </p>
              </div>
            )}
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CheckinDrawer;
