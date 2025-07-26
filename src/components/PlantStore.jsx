import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  ShoppingCart, 
  Coins, 
  Droplets, 
  Sprout, 
  Sparkles, 
  Star,
  Crown,
  Package,
  Check,
  X
} from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/badge';

const PlantStore = ({ 
  userPoints, 
  storeItems, 
  onPurchase, 
  theme, 
  className = "",
  loading = false 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const storeRef = useRef(null);
  const modalRef = useRef(null);

  const themeColors = {
    background: theme === "dark" 
      ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      : "bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50",
    text: {
      primary: theme === "dark" ? "text-slate-200" : "text-slate-800",
      secondary: theme === "dark" ? "text-slate-400" : "text-slate-600",
      muted: theme === "dark" ? "text-slate-500" : "text-slate-500",
    },
    card: theme === "dark"
      ? "bg-slate-800/60 border-slate-700/50 backdrop-blur-xl"
      : "bg-white/80 border-purple-200/50 backdrop-blur-xl shadow-lg",
  };

  const categories = {
    all: {
      label: 'All Items',
      icon: Package,
      color: 'from-purple-500 to-indigo-500'
    },
    water: {
      label: 'Water',
      icon: Droplets,
      color: 'from-blue-500 to-cyan-500'
    },
    fertilizer: {
      label: 'Fertilizer',
      icon: Sprout,
      color: 'from-green-500 to-emerald-500'
    },
    decoration: {
      label: 'Decorations',
      icon: Sparkles,
      color: 'from-pink-500 to-rose-500'
    },
    seed: {
      label: 'Seeds',
      icon: Star,
      color: 'from-amber-500 to-orange-500'
    }
  };

  const rarityConfig = {
    common: {
      color: 'from-slate-400 to-slate-500',
      textColor: 'text-slate-600',
      bgColor: 'bg-slate-100/80',
      borderColor: 'border-slate-300'
    },
    rare: {
      color: 'from-blue-400 to-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-100/80',
      borderColor: 'border-blue-300'
    },
    epic: {
      color: 'from-purple-400 to-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-100/80',
      borderColor: 'border-purple-300'
    },
    legendary: {
      color: 'from-yellow-400 to-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100/80',
      borderColor: 'border-yellow-300'
    }
  };

  // Filter items by category
  const filteredItems = selectedCategory === 'all' 
    ? storeItems 
    : storeItems.filter(item => item.category === selectedCategory);

  // Sort items by price
  const sortedItems = filteredItems.sort((a, b) => a.price - b.price);

  // Animation on mount
  useEffect(() => {
    if (!storeRef.current) return;

    gsap.fromTo(storeRef.current.children, 
      { opacity: 0, y: 30, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)"
      }
    );
  }, [selectedCategory]);

  // Modal animation
  useEffect(() => {
    if (showPurchaseModal && modalRef.current) {
      gsap.fromTo(modalRef.current,
        { scale: 0.8, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [showPurchaseModal]);

  const handlePurchase = async () => {
    if (!selectedItem || !onPurchase) return;

    const totalCost = selectedItem.price * purchaseQuantity;
    if (userPoints < totalCost) return;

    setIsPurchasing(true);
    try {
      await onPurchase(selectedItem.id, purchaseQuantity);
      setShowPurchaseModal(false);
      setSelectedItem(null);
      setPurchaseQuantity(1);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const openPurchaseModal = (item) => {
    setSelectedItem(item);
    setPurchaseQuantity(1);
    setShowPurchaseModal(true);
  };

  const canAfford = (price, quantity = 1) => {
    return userPoints >= (price * quantity);
  };

  const renderStoreItem = (item) => {
    const rarity = rarityConfig[item.rarity] || rarityConfig.common;
    const affordable = canAfford(item.price);

    return (
      <Card 
        key={item.id}
        className={`${themeColors.card} border-2 ${rarity.borderColor} ${
          affordable ? 'hover:shadow-xl transform hover:scale-105' : 'opacity-60'
        } transition-all duration-300 cursor-pointer group overflow-hidden relative`}
        onClick={() => affordable && openPurchaseModal(item)}
      >
        {/* Rarity glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${rarity.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
        
        <CardContent className="p-6 relative z-10">
          {/* Item header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${categories[item.category]?.color || 'from-gray-400 to-gray-500'} shadow-sm`}>
                <span className="text-2xl">{item.icon}</span>
              </div>
              <div>
                <h3 className={`font-semibold ${themeColors.text.primary} text-lg`}>
                  {item.name}
                </h3>
                <Badge className={`${rarity.bgColor} ${rarity.textColor} border-0 text-xs font-medium capitalize`}>
                  {item.rarity}
                </Badge>
              </div>
            </div>
            
            {/* Price */}
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className={`font-bold ${themeColors.text.primary} text-lg`}>
                  {item.price}
                </span>
              </div>
              <span className={`text-xs ${themeColors.text.muted}`}>
                points
              </span>
            </div>
          </div>

          {/* Description */}
          <p className={`${themeColors.text.secondary} text-sm mb-4 leading-relaxed`}>
            {item.description}
          </p>

          {/* Effect info */}
          <div className={`${rarity.bgColor} rounded-lg p-3 mb-4 border ${rarity.borderColor}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium ${rarity.textColor} uppercase tracking-wide`}>
                Effect
              </span>
              <Badge className="bg-green-100 text-green-600 text-xs px-2 py-1">
                +{item.effect_value} {item.effect_type}
              </Badge>
            </div>
            <span className={`text-xs ${themeColors.text.muted}`}>
              {item.category === 'water' && 'Restores health and adds growth XP'}
              {item.category === 'fertilizer' && 'Boosts growth XP significantly'}
              {item.category === 'decoration' && 'Beautifies your plant permanently'}
              {item.category === 'seed' && 'Start a new plant type'}
            </span>
          </div>

          {/* Purchase button */}
          <Button
            disabled={!affordable}
            className={`w-full ${
              affordable 
                ? `bg-gradient-to-r ${categories[item.category]?.color || 'from-gray-400 to-gray-500'} text-white hover:shadow-lg` 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } rounded-xl font-medium transition-all duration-300`}
          >
            {affordable ? (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Purchase
              </>
            ) : (
              <>
                <X className="w-4 h-4 mr-2" />
                Can't Afford
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className={`${themeColors.card} rounded-3xl p-8 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${themeColors.card} rounded-3xl p-8 ${className}`}>
      {/* Store header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-sm">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${themeColors.text.primary} mb-1`}>
              Plant Store
            </h2>
            <p className={`${themeColors.text.secondary}`}>
              Enhance your plant's growth with premium items
            </p>
          </div>
        </div>
        
        {/* User points */}
        <div className={`${theme === "dark" ? "bg-slate-700/50" : "bg-white/60"} backdrop-blur-sm rounded-2xl px-6 py-3 border ${theme === "dark" ? "border-slate-600" : "border-slate-200"}`}>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className={`text-lg font-bold ${themeColors.text.primary}`}>
              {userPoints}
            </span>
            <span className={`text-sm ${themeColors.text.muted}`}>
              points
            </span>
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        {Object.entries(categories).map(([key, category]) => {
          const IconComponent = category.icon;
          const isActive = selectedCategory === key;
          
          return (
            <Button
              key={key}
              onClick={() => setSelectedCategory(key)}
              variant={isActive ? "default" : "outline"}
              className={`flex items-center gap-2 ${
                isActive 
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg` 
                  : `hover:bg-gradient-to-r hover:${category.color} hover:text-white`
              } rounded-xl font-medium transition-all duration-300`}
            >
              <IconComponent className="w-4 h-4" />
              {category.label}
            </Button>
          );
        })}
      </div>

      {/* Store items grid */}
      <div ref={storeRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedItems.map(renderStoreItem)}
      </div>

      {/* Empty state */}
      {sortedItems.length === 0 && (
        <div className="text-center py-12">
          <Package className={`w-16 h-16 mx-auto ${themeColors.text.muted} mb-4`} />
          <h3 className={`text-xl font-semibold ${themeColors.text.primary} mb-2`}>
            No items found
          </h3>
          <p className={`${themeColors.text.muted}`}>
            Try selecting a different category
          </p>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            ref={modalRef}
            className={`${themeColors.card} rounded-2xl p-8 max-w-md w-full relative overflow-hidden border-2 ${rarityConfig[selectedItem.rarity]?.borderColor || 'border-slate-300'}`}
          >
            {/* Rarity glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${rarityConfig[selectedItem.rarity]?.color || 'from-gray-400 to-gray-500'} opacity-5`} />
            
            <div className="relative z-10">
              {/* Modal header */}
              <div className="text-center mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${categories[selectedItem.category]?.color || 'from-gray-400 to-gray-500'} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <span className="text-3xl">{selectedItem.icon}</span>
                </div>
                <h3 className={`text-xl font-bold ${themeColors.text.primary} mb-2`}>
                  {selectedItem.name}
                </h3>
                <Badge className={`${rarityConfig[selectedItem.rarity]?.bgColor} ${rarityConfig[selectedItem.rarity]?.textColor} border-0 text-sm font-medium capitalize`}>
                  {selectedItem.rarity}
                </Badge>
              </div>

              {/* Quantity selector */}
              <div className="mb-6">
                <label className={`block text-sm font-medium ${themeColors.text.secondary} mb-3`}>
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                    className="w-10 h-10 rounded-full p-0"
                  >
                    -
                  </Button>
                  <span className={`text-lg font-semibold ${themeColors.text.primary} min-w-[3rem] text-center`}>
                    {purchaseQuantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPurchaseQuantity(purchaseQuantity + 1)}
                    className="w-10 h-10 rounded-full p-0"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Total cost */}
              <div className={`${theme === "dark" ? "bg-slate-700/50" : "bg-slate-100/80"} rounded-lg p-4 mb-6`}>
                <div className="flex items-center justify-between">
                  <span className={`${themeColors.text.secondary} font-medium`}>
                    Total Cost:
                  </span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <span className={`text-lg font-bold ${themeColors.text.primary}`}>
                      {selectedItem.price * purchaseQuantity}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-sm ${themeColors.text.muted}`}>
                    Your balance:
                  </span>
                  <span className={`text-sm ${canAfford(selectedItem.price, purchaseQuantity) ? 'text-green-500' : 'text-red-500'} font-medium`}>
                    {userPoints} points
                  </span>
                </div>
              </div>

              {/* Modal actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 rounded-xl"
                  disabled={isPurchasing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePurchase}
                  disabled={!canAfford(selectedItem.price, purchaseQuantity) || isPurchasing}
                  className={`flex-1 bg-gradient-to-r ${categories[selectedItem.category]?.color || 'from-gray-400 to-gray-500'} text-white rounded-xl font-medium`}
                >
                  {isPurchasing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Purchasing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Purchase
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantStore; 