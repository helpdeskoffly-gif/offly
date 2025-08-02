import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import {
  Coins,
  Sprout,
  Sparkles,
  Droplets,
  Zap,
  Target,
  Star,
  Award,
  Flame,
  Heart,
  Calendar,
  Users,
  CheckCircle,
  Lock,
  TrendingUp,
  Clock,
  Gift,
  Medal,
  Crown,
  Coffee,
  Book,
  Music,
  Camera,
  Headphones,
  MapPin,
  Sun,
  Moon,
  Wind,
  Umbrella,
  ArrowRight,
  Palette,
} from "lucide-react";
import { usePoints } from "../contexts/PointsContext.jsx";
import { 
  getUserPlant, 
  getStoreItems, 
  getUserInventory, 
  spendPoints, 
  updatePlantGrowth,
  resetPlantToLevel1,
  purchaseStoreItem,
  useInventoryItem
} from "../services/database.js";

export function PlantGarden() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { points, updatePoints, fetchUserPoints } = usePoints();
  
  // Add CSS animations as a style tag
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes scale-in {
        from { opacity: 0; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1); }
      }
      
      @keyframes bounce-in {
        from { opacity: 0; transform: scale(0) rotate(180deg); }
        to { opacity: 1; transform: scale(1) rotate(0deg); }
      }
      
      .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
      .animate-scale-in { animation: scale-in 0.6s ease-out forwards; }
      .animate-bounce-in { animation: bounce-in 0.6s ease-out forwards; }
      .animate-fade-in-delayed { animation: fade-in 0.6s ease-out 0.3s both; }
    `;
    document.head.appendChild(style);
    
    return () => document.head.removeChild(style);
  }, []);
  
  // State management
  
  const [userPlant, setUserPlant] = useState(null);
  const [isPlantLoaded, setIsPlantLoaded] = useState(false);
  const [storeItems, setStoreItems] = useState([]);
  const [cosmeticItems, setCosmeticItems] = useState([]);
  const [userInventory, setUserInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Theme colors matching the existing app
  const themeColors = {
    text: {
      primary: theme === "dark" ? "text-slate-200" : "text-slate-800",
      secondary: theme === "dark" ? "text-slate-400" : "text-slate-600",
      muted: theme === "dark" ? "text-slate-500" : "text-slate-500",
    },
  };

  // Plant growth stages with 4-stage gamification (matches database progression)
  const plantStages = {
    1: { name: 'Seedling', icon: '🌱', xpRequired: 100, description: 'Your journey begins with a tiny seedling' },
    2: { name: 'Sprout', icon: '🌿', xpRequired: 150, description: 'Growing stronger with each check-in' },
    3: { name: 'Small Tree', icon: '🌳', xpRequired: 225, description: 'A young tree reaching for the sky' },
    4: { name: 'Mature Tree', icon: '🌲', xpRequired: 337, description: 'A magnificent tree in full bloom' }
  };

  // Tree lifecycle completion
  const [showLifecycleComplete, setShowLifecycleComplete] = useState(false);
  const [treesPlanted, setTreesPlanted] = useState(0);
  const [achievementBadges, setAchievementBadges] = useState([]);

  const currentStage = plantStages[userPlant?.growth_level || 1] || plantStages[1];
  const xpPercentage = userPlant && currentStage?.xpRequired ? (userPlant.growth_xp / currentStage.xpRequired) * 100 : 0;

  // Check if tree has reached maturity
  const isTreeMature = userPlant?.growth_level === 4 && userPlant?.growth_xp >= (currentStage?.xpRequired || 337);

  // Handle tree lifecycle completion
  const handleTreeCompletion = async () => {
    if (!isTreeMature) return;

    try {
      // Add to trees planted count
      const newTreesPlanted = treesPlanted + 1;
      setTreesPlanted(newTreesPlanted);
      localStorage.setItem(`trees_planted_${user.id}`, newTreesPlanted.toString());

      // Check for achievement badges
      const newBadges = [];
      if (newTreesPlanted >= 5 && !achievementBadges.includes('5_trees')) {
        newBadges.push('5_trees');
      }
      if (newTreesPlanted >= 10 && !achievementBadges.includes('10_trees')) {
        newBadges.push('10_trees');
      }
      if (newTreesPlanted >= 25 && !achievementBadges.includes('25_trees')) {
        newBadges.push('25_trees');
      }

      if (newBadges.length > 0) {
        const updatedBadges = [...achievementBadges, ...newBadges];
        setAchievementBadges(updatedBadges);
        localStorage.setItem(`achievement_badges_${user.id}`, JSON.stringify(updatedBadges));
      }

      // Reset plant to seedling
      if (userPlant) {
        await resetPlantToLevel1(user.id);
        setUserPlant({ ...userPlant, growth_level: 1, growth_xp: 0, growth_xp_required: 100 });
      }

      setShowLifecycleComplete(false);
      showToast(`🌳 Tree planted! You've grown ${newTreesPlanted} trees!`);
    } catch (error) {
      console.error('Error completing tree lifecycle:', error);
    }
  };

  

  // Load all data
  useEffect(() => {
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;

    setLoading(true);
    console.log("PlantGarden: Starting loadAllData for user:", user.id);
    try {
      const [plantResult, storeResult, inventoryResult] = await Promise.all([
        getUserPlant(user.id),
        getStoreItems(),
        getUserInventory(user.id),
      ]);

      console.log("PlantGarden: getUserPlant result:", plantResult);
      // Points are now managed by context, just fetch them
      fetchUserPoints();
      setUserPlant(plantResult.data);
      console.log("PlantGarden: userPlant state set to:", plantResult.data);
      setIsPlantLoaded(true);
      
      // Load trees planted count and achievements
      const treesPlantedCount = localStorage.getItem(`trees_planted_${user.id}`) || 0;
      setTreesPlanted(parseInt(treesPlantedCount));
      
      const savedBadges = localStorage.getItem(`achievement_badges_${user.id}`) || '[]';
      setAchievementBadges(JSON.parse(savedBadges));
      
      const careItems = storeResult.data?.filter(item => 
        ['Basic Water', 'Organic Fertilizer', 'Super Fertilizer'].includes(item.name)
      ) || [];
      const cosmetics = storeResult.data?.filter(item => 
        item.category === 'decoration' || ['Flower Crown', 'Rainbow Pot', 'Golden Leaves', 'Fairy Lights'].includes(item.name)
      ) || [];
      
      setStoreItems(careItems);
      setCosmeticItems(cosmetics);
      setUserInventory(inventoryResult.data || []);

      // Check if tree is mature and show completion modal
      if (plantResult.data?.growth_level === 4 && plantResult.data?.growth_xp >= (plantStages[4]?.xpRequired || 1000)) {
        setShowLifecycleComplete(true);
      }
    } catch (error) {
      console.error("PlantGarden: Error loading plant data:", error);
    } finally {
      setLoading(false);
      console.log("PlantGarden: loadAllData finished.");
    }
  };

  // Plant care handlers
  const handleWaterPlant = async () => {
    console.log("PlantGarden: handleWaterPlant called. Current userPlant:", userPlant);
    if (!isPlantLoaded || !userPlant || !userPlant.id) {
      showToast("❌ Could not find your plant. Please refresh.");
      return;
    }
    const waterCost = 5;
    if (points < waterCost) {
      showToast("❌ Not enough points to water!");
      return;
    }

    try {
      const spendResult = await spendPoints(user.id, waterCost, 'plant_care', userPlant.id, 'Watered plant');
      if (spendResult.success) {
        console.log(`✅ Spent ${waterCost} points for watering plant. New balance: ${spendResult.data.new_total}`);
        updatePoints(spendResult.data.new_total);
        
        const growthResult = await updatePlantGrowth(userPlant.id, 5);
        if (growthResult.success) {
          setUserPlant(growthResult.data);
          showToast("💧 Plant watered! +5 XP");
        }

        // Track plant care action for achievements
        try {
          const { supabase } = await import('../supabase');
          const { updateAchievementProgress } = await import('../services/database');
          
          // Record plant care action
          await supabase
            .from('plant_care_actions')
            .insert({
              user_id: user.id,
              plant_id: userPlant.id,
              action_type: 'water',
              created_at: new Date().toISOString()
            });
          
          // Check for achievements using the proper function
          await updateAchievementProgress(user.id);
          
          // Refresh points after checking achievements (in case new ones were unlocked)
          fetchUserPoints();
        } catch (achievementError) {
          console.error("Error tracking plant care:", achievementError);
        }
      } else {
        console.error('Failed to spend points for watering:', spendResult.error);
        showToast("❌ Failed to water plant - insufficient points");
      }
    } catch (error) {
      console.error("Error in handleWaterPlant:", error);
      showToast("❌ Failed to water plant");
    }
  };

  const handleFertilizePlant = async () => {
    if (!isPlantLoaded || !userPlant || !userPlant.id) {
      showToast("❌ Could not find your plant. Please refresh.");
      return;
    }
    const fertilizeCost = 15;
    if (points < fertilizeCost) {
      showToast("❌ Not enough points to fertilize!");
      return;
    }

    try {
      const spendResult = await spendPoints(user.id, fertilizeCost, 'plant_care', userPlant.id, 'Fertilized plant');
      if (spendResult.success) {
        console.log(`✅ Spent ${fertilizeCost} points for fertilizing plant. New balance: ${spendResult.data.new_total}`);
        updatePoints(spendResult.data.new_total);
        
        const growthResult = await updatePlantGrowth(userPlant.id, 25);
        if (growthResult.success) {
          setUserPlant(growthResult.data);
          showToast("🌱 Plant fertilized! +25 XP");
        }

        // Track plant care action for achievements
        try {
          const { supabase } = await import('../supabase');
          const { updateAchievementProgress } = await import('../services/database');
          
          // Record plant care action
          await supabase
            .from('plant_care_actions')
            .insert({
              user_id: user.id,
              plant_id: userPlant.id,
              action_type: 'fertilize',
              created_at: new Date().toISOString()
            });
          
          // Check for achievements using the proper function
          await updateAchievementProgress(user.id);
          
          // Refresh points after checking achievements (in case new ones were unlocked)
          fetchUserPoints();
        } catch (achievementError) {
          console.error("Error tracking plant care:", achievementError);
        }
      } else {
        console.error('Failed to spend points for fertilizing:', spendResult.error);
        showToast("❌ Failed to fertilize plant - insufficient points");
      }
    } catch (error) {
      console.error("Error in handleFertilizePlant:", error);
      showToast("❌ Failed to fertilize plant");
    }
  };

  const handleSuperFertilize = async () => {
    if (!isPlantLoaded || !userPlant || !userPlant.id) {
      showToast("❌ Could not find your plant. Please refresh.");
      return;
    }
    const superCost = 50;
    if (points < superCost) {
      showToast("❌ Not enough points!");
      return;
    }

    try {
      const spendResult = await spendPoints(user.id, superCost, 'plant_care', userPlant.id, 'Super fertilized plant');
      if (spendResult.success) {
        console.log(`✅ Spent ${superCost} points for super fertilizing plant. New balance: ${spendResult.data.new_total}`);
        updatePoints(spendResult.data.new_total);
        
        const growthResult = await updatePlantGrowth(userPlant.id, 100);
        if (growthResult.success) {
          setUserPlant(growthResult.data);
          showToast("⚡ Super fertilized! +100 XP");
        }

        // Track plant care action for achievements
        try {
          const { supabase } = await import('../supabase');
          const { updateAchievementProgress } = await import('../services/database');
          
          // Record plant care action
          await supabase
            .from('plant_care_actions')
            .insert({
              user_id: user.id,
              plant_id: userPlant.id,
              action_type: 'super_fertilize',
              created_at: new Date().toISOString()
            });
          
          // Check for achievements using the proper function
          await updateAchievementProgress(user.id);
          
          // Refresh points after checking achievements (in case new ones were unlocked)
          fetchUserPoints();
        } catch (achievementError) {
          console.error("Error tracking plant care:", achievementError);
        }
      } else {
        console.error('Failed to spend points for super fertilizing:', spendResult.error);
        showToast("❌ Failed to super fertilize plant - insufficient points");
      }
    } catch (error) {
      console.error("Error in handleSuperFertilize:", error);
      showToast("❌ Failed to super fertilize");
    }
  };

  const handleStorePurchase = async (item) => {
    try {
      console.log(`🛍️ Attempting to purchase ${item.name} for ${item.price} points`);
      const result = await purchaseStoreItem(user.id, item.id);
      if (result.success) {
        console.log(`✅ Successfully purchased ${item.name}. New balance: ${result.data.remainingPoints}`);
        updatePoints(result.data.remainingPoints);
        showToast(`✅ Purchased ${item.name}!`);
        
        const inventoryResult = await getUserInventory(user.id);
        setUserInventory(inventoryResult.data || []);
        
        if (inventoryResult.data?.length > 0) {
          const newItem = inventoryResult.data.find(inv => inv.item_id === item.id && inv.used_quantity < inv.quantity);
          if (newItem) {
            handleUseItem(newItem.id, item);
          }
        }
        
        // Refresh points to ensure UI is synced
        fetchUserPoints();
      } else {
        console.error('Purchase failed:', result.error);
        showToast(`❌ Purchase failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      showToast("❌ Purchase failed!");
    }
  };

  const handleUseItem = async (purchaseId, item) => {
    if (!isPlantLoaded || !userPlant || !userPlant.id) {
      showToast("❌ Could not find your plant. Please refresh.");
      return;
    }
    try {
      const result = await useInventoryItem(user.id, purchaseId, userPlant.id);
      if (result.success) {
        setUserPlant(result.data);
        showToast(`✅ Used ${item.name}!`);
        
        const inventoryResult = await getUserInventory(user.id);
        setUserInventory(inventoryResult.data || []);
        
        // Refresh points from database to ensure accuracy
        fetchUserPoints();
      }
    } catch (error) {
      console.error("Failed to use item:", error);
    }
  };

  const showToast = (message) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const canAfford = (price) => points >= price;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8 p-3 sm:p-6">
      
      {/* Mobile-Optimized Stats HUD */}
      <div className="relative">
        {/* Mobile: Compact horizontal stats */}
        <div className="flex justify-between items-center gap-2 sm:hidden">
          {/* Points Display - Mobile */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${theme === 'dark' ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white/80 border border-slate-200/50'} backdrop-blur-sm`}>
            <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center">
              <Coins className="w-3 h-3 text-white" />
            </div>
            <span className={`text-lg font-bold ${themeColors.text.primary}`}>{points}</span>
            <span className={`text-xs ${themeColors.text.muted}`}>pts</span>
          </div>

          {/* Level Display - Mobile */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${theme === 'dark' ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white/80 border border-slate-200/50'} backdrop-blur-sm`}>
            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{userPlant?.growth_level || 1}</span>
            </div>
            <span className={`text-sm font-semibold ${themeColors.text.primary}`}>Lv.{userPlant?.growth_level || 1}</span>
          </div>
        </div>

        {/* Desktop: Original floating badges */}
        <div className="hidden sm:block">
          {/* Points Display - Desktop */}
          <div className="absolute top-0 left-0 z-10">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${theme === 'dark' ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white/80 border border-slate-200/50'} backdrop-blur-sm`}>
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <span className={`text-2xl font-bold ${themeColors.text.primary}`}>{points}</span>
              <span className={`text-sm ${themeColors.text.muted}`}>points</span>
            </div>
          </div>

          {/* Level Display - Desktop */}
          <div className="absolute top-0 right-0 z-10">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${theme === 'dark' ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white/80 border border-slate-200/50'} backdrop-blur-sm`}>
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className={`text-lg font-semibold ${themeColors.text.primary}`}>Level {userPlant?.growth_level || 1}</span>
              <span className={`text-sm ${themeColors.text.muted}`}>({currentStage.name})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 mt-4 sm:mt-20">
        
        {/* Plant Display Section */}
        <div className="flex flex-col items-center order-1 lg:order-1">
          {/* Title - Responsive */}
          <div className="mb-4 sm:mb-8">
            <h1 className={`text-2xl sm:text-4xl font-bold ${themeColors.text.primary} mb-2 sm:mb-3 text-center tracking-wide`}>
              {userPlant?.plant_name || 'My Wellness Plant'}
            </h1>
            
            {/* Stage indicator - More compact on mobile */}
            <div className={`text-center mb-3 sm:mb-6`}>
              <div className={`inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/70 border border-slate-200/60'} backdrop-blur-sm shadow-lg`}>
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{userPlant?.growth_level || 1}</span>
                </div>
                <span className={`text-base sm:text-xl font-semibold ${themeColors.text.primary}`}>
                  {currentStage.name}
                </span>
              </div>
            </div>
          </div>
          
          {/* Plant Visualization - Mobile Optimized */}
          <div className="mb-6 sm:mb-8">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto">
              {/* Plant Container - Scaled for mobile */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-100/30 via-emerald-200/20 to-blue-100/10 animate-pulse"></div>
              <div className="absolute inset-3 sm:inset-4 rounded-full bg-gradient-to-br from-green-50/50 via-emerald-100/30 to-teal-50/20"></div>
              <div className="absolute inset-6 sm:inset-8 rounded-full bg-gradient-to-br from-white/70 via-green-50/50 to-emerald-50/40 backdrop-blur-sm border-2 border-white/40"></div>
              
              {/* Plant Emoji - Mobile responsive sizes */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className={`drop-shadow-2xl filter hover:scale-110 transition-transform duration-500 cursor-pointer ${
                    userPlant?.growth_level >= 8 ? 'text-5xl sm:text-8xl' : 
                    userPlant?.growth_level >= 5 ? 'text-4xl sm:text-7xl' : 
                    userPlant?.growth_level >= 3 ? 'text-3xl sm:text-6xl' : 'text-2xl sm:text-5xl'
                  }`}>
                    {currentStage.icon}
                  </div>
                  
                  {/* Glow effect for higher levels */}
                  {userPlant?.growth_level >= 7 && (
                    <div className={`absolute inset-0 blur-sm opacity-30 -z-10 ${
                      userPlant?.growth_level >= 8 ? 'text-5xl sm:text-8xl' : 
                      userPlant?.growth_level >= 5 ? 'text-4xl sm:text-7xl' : 
                      userPlant?.growth_level >= 3 ? 'text-3xl sm:text-6xl' : 'text-2xl sm:text-5xl'
                    }`}>
                      {currentStage.icon}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Floating particles - Smaller on mobile */}
              <div className="absolute -top-1 sm:-top-2 left-1/4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute top-1/4 -right-1 sm:-right-2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full animate-bounce delay-300"></div>
              <div className="absolute bottom-1/4 -left-0.5 sm:-left-1 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-blue-400 rounded-full animate-pulse delay-700"></div>
              <div className="absolute -bottom-0.5 sm:-bottom-1 right-1/3 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-purple-400 rounded-full animate-ping delay-1000"></div>
              
              {/* Special orbiting effect for max level - Responsive */}
              {userPlant?.growth_level === 10 && (
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
                  <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 text-sm sm:text-xl opacity-70">✨</div>
                  <div className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 text-xs sm:text-lg opacity-60">💫</div>
                  <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 text-sm sm:text-xl opacity-70">⭐</div>
                  <div className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 text-xs sm:text-lg opacity-60">🌟</div>
                </div>
              )}
            </div>
          </div>
          
          {/* XP Progress - Mobile Optimized */}
          <div className="w-full max-w-xs sm:max-w-md">
            <div className="flex justify-between items-center mb-2 sm:mb-3">
              <span className={`text-xs sm:text-sm font-medium ${themeColors.text.secondary}`}>Growth Journey</span>
              <span className={`text-xs sm:text-sm font-bold ${themeColors.text.primary}`}>
                {userPlant?.growth_xp || 0} / {currentStage?.xpRequired || 100} XP
              </span>
            </div>
            
            <div className="relative">
              <div className={`w-full h-3 sm:h-4 rounded-full ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-200/70'} shadow-inner overflow-hidden`}>
                <div 
                  className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{ width: `${Math.min(100, xpPercentage)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse delay-300"></div>
                </div>
              </div>
              
              <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2">
                <div className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold ${theme === 'dark' ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-700'} shadow-lg border border-white/20`}>
                  {Math.round(xpPercentage)}%
                </div>
              </div>
            </div>
            
            {userPlant?.growth_level < 4 && (
              <div className="mt-2 sm:mt-4 text-center">
                <span className={`text-xs ${themeColors.text.muted}`}>
                  Next: {plantStages[userPlant?.growth_level + 1]?.name || 'Unknown'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Care Actions Section - Mobile Optimized */}
        <div className="flex flex-col justify-center order-2 lg:order-2">
          <h2 className={`text-xl sm:text-2xl font-bold ${themeColors.text.primary} mb-4 sm:mb-8 text-center`}>
            Plant Care
          </h2>
          
          <div className="space-y-3 sm:space-y-6">
            {/* Water - Mobile Optimized */}
            <button
              onClick={handleWaterPlant}
              disabled={points < 5}
              className={`w-full p-4 sm:p-6 rounded-xl transition-all duration-300 ${
                points >= 5 
                  ? `${theme === 'dark' ? 'bg-slate-800/40 hover:bg-slate-700/60 border border-blue-500/30 hover:border-blue-400/60' : 'bg-white/40 hover:bg-white/80 border border-blue-300/50 hover:border-blue-400/80'} hover:scale-105 hover:shadow-xl cursor-pointer` 
                  : `${theme === 'dark' ? 'bg-slate-800/20 border border-gray-600/30' : 'bg-gray-100/20 border border-gray-300/30'} opacity-60 cursor-not-allowed`
              } backdrop-blur-sm`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${points >= 5 ? 'bg-gradient-to-br from-blue-400 to-cyan-500' : 'bg-gray-400'}`}>
                  <Droplets className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className={`text-base sm:text-lg font-semibold ${themeColors.text.primary}`}>Water Plant</h3>
                  <p className={`text-xs sm:text-sm ${themeColors.text.muted}`}>Gives +5 XP to your plant</p>
                  <div className="flex items-center gap-1 mt-1 sm:mt-2">
                    <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                    <span className={`text-sm font-bold ${themeColors.text.primary}`}>5 points</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Fertilize - Mobile Optimized */}
            <button
              onClick={handleFertilizePlant}
              disabled={points < 15}
              className={`w-full p-4 sm:p-6 rounded-xl transition-all duration-300 ${
                points >= 15 
                  ? `${theme === 'dark' ? 'bg-slate-800/40 hover:bg-slate-700/60 border border-green-500/30 hover:border-green-400/60' : 'bg-white/40 hover:bg-white/80 border border-green-300/50 hover:border-green-400/80'} hover:scale-105 hover:shadow-xl cursor-pointer` 
                  : `${theme === 'dark' ? 'bg-slate-800/20 border border-gray-600/30' : 'bg-gray-100/20 border border-gray-300/30'} opacity-60 cursor-not-allowed`
              } backdrop-blur-sm`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${points >= 15 ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gray-400'}`}>
                  <Sprout className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className={`text-base sm:text-lg font-semibold ${themeColors.text.primary}`}>Fertilize Plant</h3>
                  <p className={`text-xs sm:text-sm ${themeColors.text.muted}`}>Gives +25 XP to your plant</p>
                  <div className="flex items-center gap-1 mt-1 sm:mt-2">
                    <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                    <span className={`text-sm font-bold ${themeColors.text.primary}`}>15 points</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Super Fertilize - Mobile Optimized */}
            <button
              onClick={handleSuperFertilize}
              disabled={points < 50}
              className={`w-full p-4 sm:p-6 rounded-xl transition-all duration-300 ${
                points >= 50 
                  ? `${theme === 'dark' ? 'bg-slate-800/40 hover:bg-slate-700/60 border border-purple-500/30 hover:border-purple-400/60' : 'bg-white/40 hover:bg-white/80 border border-purple-300/50 hover:border-purple-400/80'} hover:scale-105 hover:shadow-xl cursor-pointer` 
                  : `${theme === 'dark' ? 'bg-slate-800/20 border border-gray-600/30' : 'bg-gray-100/20 border border-gray-300/30'} opacity-60 cursor-not-allowed`
              } backdrop-blur-sm`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${points >= 50 ? 'bg-gradient-to-br from-purple-400 to-pink-500' : 'bg-gray-400'}`}>
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className={`text-base sm:text-lg font-semibold ${themeColors.text.primary}`}>Super Boost</h3>
                  <p className={`text-xs sm:text-sm ${themeColors.text.muted}`}>Gives +100 XP to your plant</p>
                  <div className="flex items-center gap-1 mt-1 sm:mt-2">
                    <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                    <span className={`text-sm font-bold ${themeColors.text.primary}`}>50 points</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Trees Planted Card */}
      <div className={`p-4 sm:p-6 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/70 border border-slate-200/60'} backdrop-blur-sm shadow-lg animate-fade-in`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg sm:text-xl font-semibold ${themeColors.text.primary}`}>🌳 Trees Planted</h3>
          <div className="flex items-center gap-2">
            {achievementBadges.map((badge, index) => (
              <div 
                key={index} 
                className="relative animate-bounce-in"
                style={{ animationDelay: `${0.2 * index}s` }}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-bold">
                    {badge === '5_trees' ? '5' : badge === '10_trees' ? '10' : '25'}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-4xl sm:text-6xl font-bold mb-2 animate-scale-in">
            <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              {treesPlanted}
            </span>
          </div>
          <p className={`text-sm sm:text-base ${themeColors.text.secondary} animate-fade-in-delayed`}>
            {treesPlanted === 0 ? 'Start your journey!' : 
             treesPlanted === 1 ? 'First tree planted!' :
             `${treesPlanted} trees planted so far!`}
          </p>
        </div>
      </div>

      {/* Lifecycle Completion Modal */}
      {showLifecycleComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLifecycleComplete(false)}></div>
          <div className={`relative w-full max-w-md p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'} shadow-2xl animate-scale-in`}>
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce-in">
                🌳
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${themeColors.text.primary} animate-fade-in-delayed`}>
                Tree Lifecycle Complete!
              </h2>
              <p className={`text-sm mb-6 ${themeColors.text.secondary} animate-fade-in-delayed`}>
                Congratulations! Your tree has reached maturity. Plant it and start a new seedling!
              </p>
              
              <div className="flex gap-3 animate-fade-in-delayed"
                style={{ animationDelay: '0.4s' }}>
                <Button
                  onClick={handleTreeCompletion}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:scale-105 transition-transform duration-300"
                >
                  🌱 Plant Tree & Start New
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowLifecycleComplete(false)}
                  className="flex-1 hover:scale-105 transition-transform duration-300"
                >
                  Later
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast - Mobile Positioned */}
      {showSuccessToast && (
        <div className="fixed top-4 sm:top-6 right-3 sm:right-6 left-3 sm:left-auto z-50">
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-xl shadow-xl p-3 sm:p-4 max-w-sm sm:max-w-none backdrop-blur-sm`}>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${themeColors.text.primary} break-words`}>{successMessage}</p>
              </div>
              <button
                onClick={() => setShowSuccessToast(false)}
                className={`${themeColors.text.muted} hover:${themeColors.text.primary} transition-colors flex-shrink-0`}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlantGarden; 