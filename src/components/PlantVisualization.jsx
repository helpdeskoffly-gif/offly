import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Heart, Droplets, Sprout, Crown, Sparkles } from 'lucide-react';

const PlantVisualization = ({ 
  plant, 
  theme, 
  onWater, 
  onFertilize, 
  className = "",
  showControls = true 
}) => {
  const plantRef = useRef(null);
  const containerRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Improved plant stage configurations with better visuals
  const plantStages = {
    1: {
      image: '🌱',
      name: 'Tiny Seedling',
      color: 'from-green-300 to-green-500',
      size: 'w-16 h-16',
      description: 'A tiny sprout just beginning its journey',
      bgGlow: 'shadow-green-300/50'
    },
    2: {
      image: '🌿',
      name: 'Young Sprout',
      color: 'from-green-400 to-green-600',
      size: 'w-20 h-20',
      description: 'Growing stronger with each passing day',
      bgGlow: 'shadow-green-400/50'
    },
    3: {
      image: '🪴',
      name: 'Healthy Plant',
      color: 'from-green-500 to-emerald-600',
      size: 'w-24 h-24',
      description: 'Thriving beautifully with your care',
      bgGlow: 'shadow-emerald-500/50'
    },
    4: {
      image: '🌳',
      name: 'Small Tree',
      color: 'from-emerald-500 to-green-700',
      size: 'w-28 h-28',
      description: 'Growing tall and reaching for the sky',
      bgGlow: 'shadow-emerald-600/50'
    },
    5: {
      image: '🌲',
      name: 'Strong Tree',
      color: 'from-green-600 to-emerald-700',
      size: 'w-32 h-32',
      description: 'Standing strong and resilient',
      bgGlow: 'shadow-green-600/50'
    },
    6: {
      image: '🌴',
      name: 'Majestic Tree',
      color: 'from-emerald-600 to-green-800',
      size: 'w-36 h-36',
      description: 'A magnificent sight to behold',
      bgGlow: 'shadow-emerald-700/50'
    },
    7: {
      image: '🌸',
      name: 'Flowering Beauty',
      color: 'from-pink-400 to-rose-500',
      size: 'w-40 h-40',
      description: 'Blooming with incredible beauty',
      bgGlow: 'shadow-pink-500/50'
    },
    8: {
      image: '🌺',
      name: 'Tropical Paradise',
      color: 'from-pink-500 to-fuchsia-600',
      size: 'w-44 h-44',
      description: 'A tropical paradise in full bloom',
      bgGlow: 'shadow-fuchsia-500/50'
    },
    9: {
      image: '🌹',
      name: 'Elegant Garden',
      color: 'from-rose-500 to-purple-600',
      size: 'w-48 h-48',
      description: 'Elegant and absolutely stunning',
      bgGlow: 'shadow-purple-500/50'
    },
    10: {
      image: '🌟',
      name: 'Legendary Plant',
      color: 'from-yellow-400 to-amber-500',
      size: 'w-52 h-52',
      description: 'The ultimate achievement - a legendary plant!',
      bgGlow: 'shadow-yellow-500/50'
    }
  };

  const currentStage = plantStages[plant?.growth_level || 1];
  const healthPercentage = plant?.health || 100;
  const xpPercentage = plant ? (plant.growth_xp / plant.growth_xp_required) * 100 : 0;

  const themeColors = {
    background: theme === "dark" 
      ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      : "bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50",
    text: {
      primary: theme === "dark" ? "text-slate-200" : "text-slate-800",
      secondary: theme === "dark" ? "text-slate-400" : "text-slate-600",
      muted: theme === "dark" ? "text-slate-500" : "text-slate-500",
    },
    card: theme === "dark"
      ? "bg-slate-800/60 border-slate-700/50 backdrop-blur-xl"
      : "bg-white/80 border-green-200/50 backdrop-blur-xl shadow-lg",
  };

  // Animations
  useEffect(() => {
    if (!plantRef.current) return;

    const tl = gsap.timeline({ repeat: -1 });
    
    // Gentle breathing/pulsing animation
    tl.to(plantRef.current, {
      scale: 1.05,
      duration: 3,
      ease: "power2.inOut"
    })
    .to(plantRef.current, {
      scale: 1,
      duration: 3,
      ease: "power2.inOut"
    });

    // Floating animation for the container
    gsap.to(containerRef.current, {
      y: -8,
      duration: 4,
      ease: "power2.inOut",
      repeat: -1,
      yoyo: true
    });

    return () => {
      tl.kill();
      gsap.killTweensOf(containerRef.current);
    };
  }, [plant?.growth_level]);

  // Growth animation when level changes
  useEffect(() => {
    if (!plantRef.current || isAnimating) return;

    setIsAnimating(true);
    
    const growthTl = gsap.timeline({
      onComplete: () => setIsAnimating(false)
    });

    growthTl
      .to(plantRef.current, {
        scale: 1.3,
        rotation: 10,
        duration: 0.4,
        ease: "back.out(1.7)"
      })
      .to(plantRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.5,
        ease: "bounce.out"
      });

  }, [plant?.growth_level]);

  const handleWater = () => {
    if (!plantRef.current || !onWater) return;
    
    // Water droplet animation
    const waterTl = gsap.timeline();
    waterTl
      .to(plantRef.current, {
        scale: 1.15,
        y: -5,
        duration: 0.3,
        ease: "power2.out"
      })
      .to(plantRef.current, {
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: "bounce.out"
      });

    onWater();
  };

  const handleFertilize = () => {
    if (!plantRef.current || !onFertilize) return;
    
    // Sparkle/growth animation
    const fertilizeTl = gsap.timeline();
    fertilizeTl
      .to(plantRef.current, {
        scale: 1.2,
        rotation: 5,
        duration: 0.2,
        ease: "power2.out"
      })
      .to(plantRef.current, {
        scale: 1.1,
        rotation: -5,
        duration: 0.2,
        ease: "power2.out"
      })
      .to(plantRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: "bounce.out"
      });

    onFertilize();
  };

  return (
    <div className={`relative ${themeColors.card} rounded-3xl p-8 ${className} border-2`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className={`absolute top-4 right-4 w-24 h-24 bg-gradient-to-br ${currentStage.color} opacity-10 rounded-full blur-2xl`} />
        <div className={`absolute bottom-4 left-4 w-20 h-20 bg-gradient-to-br ${currentStage.color} opacity-15 rounded-full blur-xl`} />
      </div>

      {/* Plant container */}
      <div ref={containerRef} className="relative z-10 flex flex-col items-center">
        {/* Plant name and level */}
        <div className="text-center mb-8">
          <h3 className={`text-2xl font-bold ${themeColors.text.primary} mb-2`}>
            {plant?.plant_name || 'My Plant'}
          </h3>
          <div className="flex items-center justify-center gap-3">
            <span className={`text-lg font-semibold ${themeColors.text.secondary}`}>
              Level {plant?.growth_level || 1}
            </span>
            <span className={`text-sm px-3 py-1 rounded-full bg-gradient-to-r ${currentStage.color} text-white font-medium shadow-lg`}>
              {currentStage.name}
            </span>
          </div>
        </div>

        {/* Plant visualization */}
        <div className="relative mb-8">
          {/* Decorative pot */}
          <div className="w-32 h-20 bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 rounded-t-full mx-auto border-4 border-amber-800 shadow-xl relative">
            <div className="absolute inset-2 bg-gradient-to-b from-amber-500 to-amber-600 rounded-t-full"></div>
          </div>
          
          {/* Plant */}
          <div ref={plantRef} className="absolute -top-12 left-1/2 transform -translate-x-1/2">
            <div className={`${currentStage.size} flex items-center justify-center rounded-full bg-gradient-to-br ${currentStage.color} shadow-2xl border-4 border-white/30 backdrop-blur-sm ${currentStage.bgGlow} relative overflow-hidden`}>
              {/* Inner glow effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent rounded-full"></div>
              
              <span className="text-5xl filter drop-shadow-lg relative z-10">
                {currentStage.image}
              </span>
            </div>
            
            {/* Sparkle effects for higher levels */}
            {plant?.growth_level >= 6 && (
              <div className="absolute -inset-4 pointer-events-none">
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
                <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-pink-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <Sparkles className="absolute top-1/2 -left-4 w-5 h-5 text-purple-400 animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
            )}

            {/* Crown for max level */}
            {plant?.growth_level === 10 && (
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                <Crown className="w-12 h-12 text-yellow-500 animate-bounce drop-shadow-lg" />
              </div>
            )}
          </div>

          {/* Decorations */}
          {plant?.decorations && plant.decorations.length > 0 && (
            <div className="absolute -inset-6 pointer-events-none">
              {plant.decorations.map((decoration, index) => (
                <div
                  key={decoration.id}
                  className="absolute animate-pulse"
                  style={{
                    top: `${25 + (index * 20) % 50}%`,
                    left: `${15 + (index * 30) % 70}%`,
                    animationDelay: `${index * 0.7}s`
                  }}
                >
                  <span className="text-2xl filter drop-shadow-md">
                    {decoration.icon}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Plant status bars */}
        <div className="w-full max-w-sm space-y-6">
          {/* Health bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className={`w-5 h-5 ${healthPercentage > 70 ? 'text-red-500' : healthPercentage > 40 ? 'text-orange-500' : 'text-gray-500'}`} />
                <span className={`text-sm font-semibold ${themeColors.text.secondary}`}>
                  Health
                </span>
              </div>
              <span className={`text-sm font-bold ${themeColors.text.primary}`}>
                {healthPercentage}%
              </span>
            </div>
            <div className={`w-full ${theme === "dark" ? "bg-slate-700" : "bg-slate-200"} rounded-full h-3 overflow-hidden`}>
              <div
                className={`h-3 rounded-full transition-all duration-700 ${
                  healthPercentage > 70
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                    : healthPercentage > 40
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    : 'bg-gradient-to-r from-red-400 to-red-600'
                } shadow-lg`}
                style={{ width: `${healthPercentage}%` }}
              />
            </div>
          </div>

          {/* XP bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-green-500" />
                <span className={`text-sm font-semibold ${themeColors.text.secondary}`}>
                  Growth Progress
                </span>
              </div>
              <span className={`text-sm font-bold ${themeColors.text.primary}`}>
                {plant?.growth_xp || 0}/{plant?.growth_xp_required || 100} XP
              </span>
            </div>
            <div className={`w-full ${theme === "dark" ? "bg-slate-700" : "bg-slate-200"} rounded-full h-3 overflow-hidden`}>
              <div
                className="h-3 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full transition-all duration-700 shadow-lg"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <p className={`text-center text-sm ${themeColors.text.muted} mt-6 italic font-medium`}>
          {currentStage.description}
        </p>

        {/* Care actions */}
        {showControls && (
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleWater}
              className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${theme === "dark" ? "shadow-blue-500/25" : "shadow-blue-300/40"}`}
            >
              <Droplets className="w-5 h-5" />
              Water Plant
            </button>
            <button
              onClick={handleFertilize}
              className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${theme === "dark" ? "shadow-green-500/25" : "shadow-green-300/40"}`}
            >
              <Sprout className="w-5 h-5" />
              Fertilize
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantVisualization; 