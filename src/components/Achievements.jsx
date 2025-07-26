import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { Button } from "./ui/Button";
import {
  Coins,
  Sprout,
  Sparkles,
  Droplets,
  X,
  Zap,
} from "lucide-react";
import {
  getUserPoints,
  getUserPlant,
  getStoreItems,
  purchaseStoreItem,
  getUserInventory,
  useInventoryItem,
  spendPoints,
} from "../services/database";

export function PlantGarden() {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  // State management
  const [userPoints, setUserPoints] = useState(0);
  const [userPlant, setUserPlant] = useState(null);
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

  // Plant growth stages with visual indicators
  const plantStages = {
    1: { name: 'Seedling', icon: '🌱' },
    2: { name: 'Sprout', icon: '🌿' },
    3: { name: 'Young Plant', icon: '🪴' },
    4: { name: 'Bush', icon: '🌳' },
    5: { name: 'Tree', icon: '🌲' },
    6: { name: 'Mature Tree', icon: '🌴' },
    7: { name: 'Flowering', icon: '🌸' },
    8: { name: 'Blooming', icon: '🌺' },
    9: { name: 'Garden', icon: '🌹' },
    10: { name: 'Paradise', icon: '🌟' }
  };

  const currentStage = plantStages[userPlant?.growth_level || 1];
  const xpPercentage = userPlant ? (userPlant.growth_xp / userPlant.growth_xp_required) * 100 : 0;

  // Load all data
  useEffect(() => {
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [pointsResult, plantResult, storeResult, inventoryResult] = await Promise.all([
        getUserPoints(user.id),
        getUserPlant(user.id),
        getStoreItems(),
        getUserInventory(user.id),
      ]);

      setUserPoints(pointsResult.data?.total_points || 0);
      setUserPlant(plantResult.data);
      
      const careItems = storeResult.data?.filter(item => 
        ['Basic Water', 'Organic Fertilizer', 'Super Fertilizer'].includes(item.name)
      ) || [];
      const cosmetics = storeResult.data?.filter(item => 
        item.category === 'decoration' || ['Flower Crown', 'Rainbow Pot', 'Golden Leaves', 'Fairy Lights'].includes(item.name)
      ) || [];
      
      setStoreItems(careItems);
      setCosmeticItems(cosmetics);
      setUserInventory(inventoryResult.data || []);
    } catch (error) {
      console.error("Error loading plant data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Plant care handlers
  const handleWaterPlant = async () => {
    const waterCost = 5;
    if (userPoints < waterCost) {
      showToast("❌ Not enough points to water!");
      return;
    }

    try {
      const spendResult = await spendPoints(user.id, waterCost, 'plant_care', userPlant.id, 'Watered plant');
      if (spendResult.success) {
        setUserPoints(spendResult.data.new_total);
        const updatedPlant = { ...userPlant, growth_xp: userPlant.growth_xp + 5 };
        setUserPlant(updatedPlant);
        showToast("💧 Plant watered! +5 XP");
      }
    } catch (error) {
      showToast("❌ Failed to water plant");
    }
  };

  const handleFertilizePlant = async () => {
    const fertilizeCost = 15;
    if (userPoints < fertilizeCost) {
      showToast("❌ Not enough points to fertilize!");
      return;
    }

    try {
      const spendResult = await spendPoints(user.id, fertilizeCost, 'plant_care', userPlant.id, 'Fertilized plant');
      if (spendResult.success) {
        setUserPoints(spendResult.data.new_total);
        const updatedPlant = { ...userPlant, growth_xp: userPlant.growth_xp + 25 };
        setUserPlant(updatedPlant);
        showToast("🌱 Plant fertilized! +25 XP");
      }
    } catch (error) {
      showToast("❌ Failed to fertilize plant");
    }
  };

  const handleSuperFertilize = async () => {
    const superCost = 50;
    if (userPoints < superCost) {
      showToast("❌ Not enough points!");
      return;
    }

    try {
      const spendResult = await spendPoints(user.id, superCost, 'plant_care', userPlant.id, 'Super fertilized plant');
      if (spendResult.success) {
        setUserPoints(spendResult.data.new_total);
        const updatedPlant = { ...userPlant, growth_xp: userPlant.growth_xp + 100 };
        setUserPlant(updatedPlant);
        showToast("⚡ Super fertilized! +100 XP");
      }
    } catch (error) {
      showToast("❌ Failed to super fertilize");
    }
  };

  const handleStorePurchase = async (item) => {
    try {
      const result = await purchaseStoreItem(user.id, item.id, 1);
      if (result.success) {
        setUserPoints(result.data.remainingPoints);
        showToast(`✅ Purchased ${item.name}!`);
        
        const inventoryResult = await getUserInventory(user.id);
        setUserInventory(inventoryResult.data || []);
        
        if (inventoryResult.data?.length > 0) {
          const newItem = inventoryResult.data.find(inv => inv.item_id === item.id && inv.used_quantity < inv.quantity);
          if (newItem) {
            handleUseItem(newItem.id, item);
          }
        }
      }
    } catch (error) {
      showToast("❌ Purchase failed!");
    }
  };

  const handleUseItem = async (purchaseId, item) => {
    try {
      const result = await useInventoryItem(user.id, purchaseId, userPlant.id);
      if (result.success) {
        setUserPlant(result.data);
        showToast(`✅ Used ${item.name}!`);
        
        const inventoryResult = await getUserInventory(user.id);
        setUserInventory(inventoryResult.data || []);
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

  const canAfford = (price) => userPoints >= price;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      
      {/* Floating Stats HUD */}
      <div className="relative">
        {/* Points Display - Floating Badge */}
        <div className="absolute top-0 left-0 z-10">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${theme === 'dark' ? 'bg-slate-800/80 border border-slate-700/50' : 'bg-white/80 border border-slate-200/50'} backdrop-blur-sm`}>
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className={`text-2xl font-bold ${themeColors.text.primary}`}>{userPoints}</span>
            <span className={`text-sm ${themeColors.text.muted}`}>points</span>
          </div>
        </div>

        {/* Level Display - Floating Badge */}
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

      {/* Main Content - Left to Right Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-20">
        
        {/* Left Side - Plant Display */}
        <div className="flex flex-col items-center">
          <div className="mb-8">
            <h1 className={`text-4xl font-bold ${themeColors.text.primary} mb-3 text-center tracking-wide`}>
              {userPlant?.plant_name || 'My Wellness Plant'}
            </h1>
            <div className={`text-center mb-6`}>
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${theme === 'dark' ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/70 border border-slate-200/60'} backdrop-blur-sm shadow-lg`}>
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{userPlant?.growth_level || 1}</span>
                </div>
                <span className={`text-xl font-semibold ${themeColors.text.primary}`}>
                  {currentStage.name}
                </span>
              </div>
            </div>
          </div>
          
          {/* Plant Visualization */}
          <div className="mb-8">
            <div className="relative w-64 h-64 mx-auto">
              {/* Plant Container with beautiful styling */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-100/30 via-emerald-200/20 to-blue-100/10 animate-pulse"></div>
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-green-50/50 via-emerald-100/30 to-teal-50/20"></div>
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-white/70 via-green-50/50 to-emerald-50/40 backdrop-blur-sm border-2 border-white/40"></div>
              
              {/* Plant Emoji - scales with level */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className={`drop-shadow-2xl filter hover:scale-110 transition-transform duration-500 cursor-pointer ${
                    userPlant?.growth_level >= 8 ? 'text-8xl' : 
                    userPlant?.growth_level >= 5 ? 'text-7xl' : 
                    userPlant?.growth_level >= 3 ? 'text-6xl' : 'text-5xl'
                  }`}>
                    {currentStage.icon}
                  </div>
                  
                  {/* Glow effect for higher levels */}
                  {userPlant?.growth_level >= 7 && (
                    <div className={`absolute inset-0 blur-sm opacity-30 -z-10 ${
                      userPlant?.growth_level >= 8 ? 'text-8xl' : 
                      userPlant?.growth_level >= 5 ? 'text-7xl' : 
                      userPlant?.growth_level >= 3 ? 'text-6xl' : 'text-5xl'
                    }`}>
                      {currentStage.icon}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Floating particles */}
              <div className="absolute -top-2 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute top-1/4 -right-2 w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce delay-300"></div>
              <div className="absolute bottom-1/4 -left-1 w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-700"></div>
              <div className="absolute -bottom-1 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping delay-1000"></div>
              
              {/* Special orbiting effect for max level */}
              {userPlant?.growth_level === 10 && (
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xl opacity-70">✨</div>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-lg opacity-60">💫</div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xl opacity-70">⭐</div>
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg opacity-60">🌟</div>
                </div>
              )}
            </div>
          </div>
          
          {/* XP Progress */}
          <div className="w-full max-w-md">
            <div className="flex justify-between items-center mb-3">
              <span className={`text-sm font-medium ${themeColors.text.secondary}`}>Growth Journey</span>
              <span className={`text-sm font-bold ${themeColors.text.primary}`}>
                {userPlant?.growth_xp || 0} / {userPlant?.growth_xp_required || 100} XP
              </span>
            </div>
            
            <div className="relative">
              <div className={`w-full h-4 rounded-full ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-200/70'} shadow-inner overflow-hidden`}>
                <div 
                  className="h-full bg-gradient-to-r from-green-400 via-emerald-500 via-teal-500 to-blue-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{ width: `${Math.min(100, xpPercentage)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse delay-300"></div>
                </div>
              </div>
              
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${theme === 'dark' ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-700'} shadow-lg border border-white/20`}>
                  {Math.round(xpPercentage)}%
                </div>
              </div>
            </div>
            
            {userPlant?.growth_level < 10 && (
              <div className="mt-4 text-center">
                <span className={`text-xs ${themeColors.text.muted}`}>
                  Next: {plantStages[userPlant?.growth_level + 1]?.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Care Actions */}
        <div className="flex flex-col justify-center">
          <h2 className={`text-2xl font-bold ${themeColors.text.primary} mb-8 text-center`}>
            Plant Care
          </h2>
          
          <div className="space-y-6">
            {/* Water */}
            <button
              onClick={handleWaterPlant}
              disabled={userPoints < 5}
              className={`w-full p-6 rounded-xl transition-all duration-300 ${
                userPoints >= 5 
                  ? `${theme === 'dark' ? 'bg-slate-800/40 hover:bg-slate-700/60 border border-blue-500/30 hover:border-blue-400/60' : 'bg-white/40 hover:bg-white/80 border border-blue-300/50 hover:border-blue-400/80'} hover:scale-105 hover:shadow-xl cursor-pointer` 
                  : `${theme === 'dark' ? 'bg-slate-800/20 border border-gray-600/30' : 'bg-gray-100/20 border border-gray-300/30'} opacity-60 cursor-not-allowed`
              } backdrop-blur-sm`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${userPoints >= 5 ? 'bg-gradient-to-br from-blue-400 to-cyan-500' : 'bg-gray-400'}`}>
                  <Droplets className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className={`text-lg font-semibold ${themeColors.text.primary}`}>Water Plant</h3>
                  <p className={`text-sm ${themeColors.text.muted}`}>Gives +5 XP to your plant</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className={`font-bold ${themeColors.text.primary}`}>5 points</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Fertilize */}
            <button
              onClick={handleFertilizePlant}
              disabled={userPoints < 15}
              className={`w-full p-6 rounded-xl transition-all duration-300 ${
                userPoints >= 15 
                  ? `${theme === 'dark' ? 'bg-slate-800/40 hover:bg-slate-700/60 border border-green-500/30 hover:border-green-400/60' : 'bg-white/40 hover:bg-white/80 border border-green-300/50 hover:border-green-400/80'} hover:scale-105 hover:shadow-xl cursor-pointer` 
                  : `${theme === 'dark' ? 'bg-slate-800/20 border border-gray-600/30' : 'bg-gray-100/20 border border-gray-300/30'} opacity-60 cursor-not-allowed`
              } backdrop-blur-sm`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${userPoints >= 15 ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gray-400'}`}>
                  <Sprout className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className={`text-lg font-semibold ${themeColors.text.primary}`}>Fertilize Plant</h3>
                  <p className={`text-sm ${themeColors.text.muted}`}>Gives +25 XP to your plant</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className={`font-bold ${themeColors.text.primary}`}>15 points</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Super Fertilize */}
            <button
              onClick={handleSuperFertilize}
              disabled={userPoints < 50}
              className={`w-full p-6 rounded-xl transition-all duration-300 ${
                userPoints >= 50 
                  ? `${theme === 'dark' ? 'bg-slate-800/40 hover:bg-slate-700/60 border border-purple-500/30 hover:border-purple-400/60' : 'bg-white/40 hover:bg-white/80 border border-purple-300/50 hover:border-purple-400/80'} hover:scale-105 hover:shadow-xl cursor-pointer` 
                  : `${theme === 'dark' ? 'bg-slate-800/20 border border-gray-600/30' : 'bg-gray-100/20 border border-gray-300/30'} opacity-60 cursor-not-allowed`
              } backdrop-blur-sm`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${userPoints >= 50 ? 'bg-gradient-to-br from-purple-400 to-pink-500' : 'bg-gray-400'}`}>
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className={`text-lg font-semibold ${themeColors.text.primary}`}>Super Boost</h3>
                  <p className={`text-sm ${themeColors.text.muted}`}>Gives +100 XP to your plant</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className={`font-bold ${themeColors.text.primary}`}>50 points</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50">
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-xl shadow-xl p-4 max-w-sm backdrop-blur-sm`}>
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className={`text-sm font-medium ${themeColors.text.primary}`}>{successMessage}</p>
              </div>
              <button
                onClick={() => setShowSuccessToast(false)}
                className={`${themeColors.text.muted} hover:${themeColors.text.primary} transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlantGarden;
