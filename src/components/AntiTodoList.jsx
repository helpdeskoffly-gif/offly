import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/badge';
import { 
  RefreshCw, 
  Play, 
  Pause, 
  Square,
  Share2, 
  Sparkles, 
  Clock, 
  CheckCircle,
  Target,
  Zap,
  Heart,
  Brain,
  Palette,
  Music,
  Camera,
  BookOpen,
  Mountain,
  Coffee,
  MoreHorizontal,
  Users,
  MessageCircle,
  ThumbsUp
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { getAntiTodoList, updateAntiTodoItemStatus, regenerateAntiTodoList, generateInitialAntiTodos } from '../services/antiTodo';
import { supabase } from '../supabase';

export const AntiTodoList = ({ userId }) => {
  const { theme } = useTheme();
  const [antiTodoList, setAntiTodoList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [loadingItems, setLoadingItems] = useState(new Set());
  const [shareDialog, setShareDialog] = useState({ open: false, item: null });
  const [isSharing, setIsSharing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [totalCompletedCount, setTotalCompletedCount] = useState(0); // Track total completions from analytics
  
  const containerRef = useRef(null);
  const headerRef = useRef(null);

  // Premium gradients matching the project
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
    tertiary: theme === "dark"
      ? "from-slate-600 via-slate-700 to-slate-800"
      : "from-teal-500 via-cyan-500 to-blue-500",
  };

  const themeColors = {
    background: theme === "dark"
      ? "bg-gradient-to-br from-slate-950 via-gray-950 to-slate-950"
      : "bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100",
    text: {
      primary: theme === "dark" ? "text-slate-200" : "text-gray-900",
      secondary: theme === "dark" ? "text-slate-400" : "text-gray-600",
      muted: theme === "dark" ? "text-slate-500" : "text-gray-500",
    },
    card: theme === "dark"
      ? "bg-slate-900/60 border-slate-800/50 backdrop-blur-xl"
      : "bg-gradient-to-br from-emerald-50/90 via-white/95 to-green-50/80 border-emerald-200/50 backdrop-blur-xl",
    cardHover: theme === "dark"
      ? "hover:bg-slate-800/70 hover:border-slate-700/60"
      : "hover:bg-gradient-to-br hover:from-emerald-100/95 hover:via-white/100 hover:to-green-100/95 hover:border-emerald-300/60",
    cardVariants: {
      muted: theme === "dark"
        ? "bg-slate-800/40 border-slate-700/40"
        : "bg-gradient-to-br from-emerald-50/90 via-white/95 to-green-50/80 border-emerald-200/40",
      success: theme === "dark"
        ? "bg-emerald-900/20 border-emerald-700/40"
        : "bg-gradient-to-br from-emerald-50/90 via-white/95 to-green-50/80 border-emerald-200/40",
      destructive: theme === "dark"
        ? "bg-red-900/20 border-red-700/40"
        : "bg-gradient-to-br from-red-50/90 via-white/95 to-pink-50/80 border-red-200/40",
      secondary: theme === "dark"
        ? "bg-slate-800/60 border-slate-700/50"
        : "bg-gradient-to-br from-emerald-50/90 via-white/95 to-green-50/80 border-emerald-300/50",
    }
  };

  // Premium activity categories with unique gradients
  const activityCategories = [
    { name: 'Mindfulness', icon: Brain, gradient: premiumGradients.secondary },
    { name: 'Movement', icon: Heart, gradient: premiumGradients.accent },
    { name: 'Creativity', icon: Palette, gradient: premiumGradients.primary },
    { name: 'Connection', icon: Coffee, gradient: premiumGradients.tertiary },
    { name: 'Learning', icon: BookOpen, gradient: premiumGradients.secondary },
    { name: 'Nature', icon: Mountain, gradient: premiumGradients.accent },
    { name: 'Music', icon: Music, gradient: premiumGradients.primary },
    { name: 'Visual', icon: Camera, gradient: premiumGradients.secondary }
  ];

  // Get category for activity
  const getActivityCategory = (content, index) => {
    // Enhanced categorization with more specific patterns
    const lowerContent = content.toLowerCase();
    
    // Physical activities
    if (lowerContent.includes('walk') || lowerContent.includes('run') || lowerContent.includes('exercise') || 
        lowerContent.includes('stretch') || lowerContent.includes('dance') || lowerContent.includes('yoga')) {
      return {
        icon: Heart,
        gradient: 'from-red-500 to-pink-500',
        name: 'Physical'
      };
    }
    
    // Mental/learning activities
    if (lowerContent.includes('read') || lowerContent.includes('learn') || lowerContent.includes('study') || 
        lowerContent.includes('practice') || lowerContent.includes('meditate') || lowerContent.includes('journal')) {
      return {
        icon: Brain,
        gradient: 'from-blue-500 to-indigo-500',
        name: 'Mental'
      };
    }
    
    // Creative activities
    if (lowerContent.includes('draw') || lowerContent.includes('paint') || lowerContent.includes('write') || 
        lowerContent.includes('create') || lowerContent.includes('craft') || lowerContent.includes('design')) {
      return {
        icon: Palette,
        gradient: 'from-purple-500 to-violet-500',
        name: 'Creative'
      };
    }
    
    // Social activities
    if (lowerContent.includes('call') || lowerContent.includes('meet') || lowerContent.includes('visit') || 
        lowerContent.includes('talk') || lowerContent.includes('share') || lowerContent.includes('connect')) {
      return {
        icon: Users,
        gradient: 'from-green-500 to-emerald-500',
        name: 'Social'
      };
    }
    
    // Music/audio activities
    if (lowerContent.includes('music') || lowerContent.includes('listen') || lowerContent.includes('play') || 
        lowerContent.includes('sing') || lowerContent.includes('podcast')) {
      return {
        icon: Music,
        gradient: 'from-orange-500 to-amber-500',
        name: 'Audio'
      };
    }
    
    // Nature/outdoor activities
    if (lowerContent.includes('nature') || lowerContent.includes('outdoor') || lowerContent.includes('park') || 
        lowerContent.includes('garden') || lowerContent.includes('hike') || lowerContent.includes('fresh air')) {
      return {
        icon: Mountain,
        gradient: 'from-emerald-500 to-teal-500',
        name: 'Nature'
      };
    }
    
    // Default category
    return {
      icon: Target,
      gradient: 'from-slate-500 to-gray-500',
      name: 'General'
    };
  };

  const fetchTotalCompletionCount = async () => {
    try {
      const { data, error } = await supabase
        .from('user_analytics')
        .select('completedantitodos')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        // If no analytics record exists, set to 0
        if (error.code === 'PGRST116') {
          setTotalCompletedCount(0);
        }
      } else if (data) {
        setTotalCompletedCount(data.completedantitodos || 0);
      } else {
        setTotalCompletedCount(0);
      }
    } catch (error) {
      console.error('Error fetching total completion count:', error);
      setTotalCompletedCount(0);
    }
  };

  // Premium status configurations
  const statusConfig = {
    'not started': {
      label: 'Available',
      color: theme === "dark" 
        ? 'bg-slate-600/30 text-slate-300 border-slate-500/20' 
        : 'bg-slate-100/80 text-slate-700 border-slate-300/40',
      buttonGradient: premiumGradients.secondary,
      action: 'Start'
    },
    'ongoing': {
      label: 'In Progress',
      color: theme === "dark" 
        ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' 
        : 'bg-amber-100/80 text-amber-700 border-amber-300/40',
      buttonGradient: premiumGradients.accent,
      action: 'Complete'
    },
    'completed': {
      label: 'Completed',
      color: theme === "dark" 
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' 
        : 'bg-emerald-100/80 text-emerald-700 border-emerald-300/40',
      buttonGradient: premiumGradients.tertiary,
      action: 'Done'
    },
    'stopped': {
      label: 'Stopped',
      color: theme === "dark" 
        ? 'bg-slate-500/20 text-slate-300 border-slate-400/30' 
        : 'bg-slate-100/80 text-slate-600 border-slate-300/40',
      buttonGradient: premiumGradients.secondary,
      action: 'Resume'
    }
  };

  // Animations matching your app style
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }

    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1, ease: "back.out(1.7)", delay: 0.2 }
      );
    }
  }, []);

  useEffect(() => {
    const fetchAndInitializeAntiTodos = async () => {
      try {
        setIsLoading(true);
        const list = await getAntiTodoList(userId);
        
        if (!list || list.length === 0) {
          const initialResult = await generateInitialAntiTodos(userId);
          
          if (initialResult.success && initialResult.data.length > 0) {
            setAntiTodoList(initialResult.data);
          } else {
            const updatedList = await getAntiTodoList(userId);
            setAntiTodoList(updatedList || []);
          }
        } else {
          setAntiTodoList(list);
        }
        
        // Always refresh completion count to ensure accuracy
        await fetchTotalCompletionCount();
        
        // Enhanced card entrance animation
        setTimeout(() => {
          gsap.fromTo(
            ".anti-todo-card",
            { 
              opacity: 0, 
              y: 30, 
              scale: 0.95
            },
            { 
              opacity: 1, 
              y: 0, 
              scale: 1,
              duration: 0.6, 
              stagger: 0.1, 
              ease: "power3.out" 
            }
          );
        }, 100);
      } catch (error) {
        console.error('Error fetching/initializing anti-todo list:', error);
        setAntiTodoList([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchAndInitializeAntiTodos();
      fetchTotalCompletionCount(); // Fetch total completion count on load
    }
  }, [userId]);

  const handleItemAction = async (itemId, action) => {
    setLoadingItems(prev => new Set([...prev, itemId]));
    
    try {
      const result = await updateAntiTodoItemStatus(itemId, action);
      
      if (result) {
        setAntiTodoList(prev => 
          prev.map(item => 
            item.id === itemId 
              ? { ...item, status: action, updated_at: result.updated_at }
              : item
          )
        );
        
        // Refresh total completion count if item was completed
        if (action === 'completed') {
          await fetchTotalCompletionCount();
          setToastMessage(`🎉 Anti-todo completed!`);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 4000);
          
          // Refresh achievements UI after a small delay to ensure analytics are updated
          if (typeof window !== 'undefined' && window.refreshAchievements) {
            setTimeout(() => {
              window.refreshAchievements();
            }, 1000);
          }
        }
        
        // Elegant feedback animation
        gsap.to(`[data-card-id="${itemId}"]`, {
          scale: 1.02,
          boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        });
      }
    } catch (error) {
      console.error('Error updating item status:', error);
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    
    try {
      const result = await regenerateAntiTodoList(userId);
      
      if (result.success) {
        const newList = await getAntiTodoList(userId);
        setAntiTodoList(newList || []);
        
        // Refresh total completion count after regeneration to get latest count
        await fetchTotalCompletionCount();
        
        setTimeout(() => {
          gsap.fromTo(
            ".anti-todo-card",
            { opacity: 0, x: -30, rotationY: 20 },
            { 
              opacity: 1, 
              x: 0, 
              rotationY: 0,
              duration: 0.8, 
              stagger: 0.1, 
              ease: "power3.out" 
            }
          );
        }, 100);
      }
    } catch (error) {
      console.error('Error regenerating anti-todo list:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleClearAll = async () => {
    try {
      const itemsToDelete = antiTodoList.filter(item => 
        item.status === 'completed' || item.status === 'stopped'
      );
      
      for (const item of itemsToDelete) {
        await updateAntiTodoItemStatus(item.id, 'deleted');
      }
      
      setAntiTodoList(prev => 
        prev.filter(item => item.status !== 'completed' && item.status !== 'stopped')
      );
    } catch (error) {
      console.error('Error clearing completed activities:', error);
    }
  };

  const handleShare = (item) => {
    console.log('Opening share dialog for item:', item);
    setShareDialog({ open: true, item });
  };

  const confirmShare = async () => {
    if (!shareDialog.item) return;
    
    setIsSharing(true);
    
    try {
      // Import the community service
      const { shareAntiTodoToCommunity } = await import('../services/community');
      
      console.log('Calling shareAntiTodoToCommunity with userId:', userId);
      const result = await shareAntiTodoToCommunity(userId, shareDialog.item);
      console.log('Share result:', result);
      
      if (result.success) {
        // Close dialog
        setShareDialog({ open: false, item: null });
        
        // Show success notification with GSAP animation
        const successElement = document.createElement('div');
        successElement.className = `fixed top-4 right-4 z-50 ${themeColors.cardVariants.success} border rounded-2xl p-4 shadow-xl backdrop-blur-xl opacity-0 scale-75`;
        successElement.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <p class="${themeColors.text.primary} font-semibold">Shared to Community! 🌟</p>
              <p class="${themeColors.text.secondary} text-sm">Your wellness activity is now visible to others</p>
            </div>
          </div>
        `;
        
        document.body.appendChild(successElement);
        
        // Animate in with GSAP
        gsap.to(successElement, {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.7)"
        });
        
        // Animate out and remove after 4 seconds
        setTimeout(() => {
          gsap.to(successElement, {
            opacity: 0,
            scale: 0.8,
            y: -20,
            duration: 0.3,
            onComplete: () => successElement.remove()
          });
        }, 4000);
        
        // Update item to show it has been shared
        setAntiTodoList(prev => 
          prev.map(listItem => 
            listItem.id === shareDialog.item.id 
              ? { ...listItem, shared_to_community: true }
              : listItem
          )
        );
      } else {
        // Show error
        const errorElement = document.createElement('div');
        errorElement.className = `fixed top-4 right-4 z-50 ${themeColors.cardVariants.destructive} border rounded-2xl p-4 shadow-xl backdrop-blur-xl opacity-0 scale-75`;
        errorElement.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <div>
              <p class="${themeColors.text.primary} font-semibold">Failed to Share</p>
              <p class="${themeColors.text.secondary} text-sm">Please try again later</p>
            </div>
          </div>
        `;
        
        document.body.appendChild(errorElement);
        gsap.to(errorElement, { opacity: 1, scale: 1, duration: 0.3 });
        setTimeout(() => {
          gsap.to(errorElement, {
            opacity: 0,
            onComplete: () => errorElement.remove()
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Error sharing to community:', error);
      // Show similar error notification
    } finally {
      setIsSharing(false);
    }
  };

  const stats = {
    total: antiTodoList.length,
    available: antiTodoList.filter(item => item.status === 'not started').length,
    inprogress: antiTodoList.filter(item => item.status === 'ongoing').length,
    completed: totalCompletedCount, // Use total completion count from analytics
    stopped: antiTodoList.filter(item => item.status === 'stopped').length,
  };

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Premium Header Section */}
      <div ref={headerRef} className={`${themeColors.card} rounded-2xl sm:rounded-3xl border-0 shadow-xl overflow-hidden relative`}>
        {/* Background gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${premiumGradients.accent} opacity-5`} />
        <div className="absolute inset-0 bg-blue-100/5 dark:bg-black/10" />
        
        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          {/* Header with Title and Icon */}
          <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6 mb-4 sm:mb-6">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br ${premiumGradients.accent} rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/25`}>
              <Target className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white drop-shadow-lg" />
              <div className="absolute -inset-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl sm:rounded-3xl blur-xl -z-10 animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h2 className={`text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold ${themeColors.text.primary} mb-1 sm:mb-2`}>
                Anti-Todo Activities
              </h2>
              <p className={`text-sm sm:text-base lg:text-lg ${themeColors.text.secondary}`}>
                Joyful activities designed to spark happiness
              </p>
            </div>
          </div>

          {/* Enhanced Stats - All Cards in One Row */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
            {Object.entries(statusConfig).map(([status, config]) => {
              // Simple mapping logic for each status
              let count = 0;
              if (status === 'not started') {
                count = stats.available;
              } else if (status === 'ongoing') {
                count = stats.inprogress;
              } else if (status === 'completed') {
                count = stats.completed;
              } else if (status === 'stopped') {
                count = stats.stopped;
              }
              
              return (
                <div key={status} className={`${config.color} px-2 py-3 sm:px-3 sm:py-4 text-center border backdrop-blur-sm rounded-lg`}>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">{count}</div>
                  <div className="text-xs sm:text-sm font-medium">{config.label}</div>
                </div>
              );
            })}
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className={`bg-gradient-to-r ${premiumGradients.secondary} hover:shadow-xl hover:scale-105 text-white h-10 sm:h-11 lg:h-12 px-4 sm:px-6 lg:px-8 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base`}
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  Generate New
                </>
              )}
            </Button>

            <Button
              onClick={handleClearAll}
              className={`bg-gradient-to-r ${premiumGradients.tertiary} hover:shadow-xl hover:scale-105 text-white h-10 sm:h-11 lg:h-12 px-4 sm:px-6 lg:px-8 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base`}
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              Clear Completed
            </Button>
          </div>
        </div>
      </div>

      {/* Premium Activities List */}
      {isLoading ? (
        <div className={`${themeColors.card} rounded-3xl border-0 shadow-xl overflow-hidden relative`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${premiumGradients.primary} opacity-5`} />
          <div className="relative z-10 p-16 text-center">
            <div className={`w-20 h-20 bg-gradient-to-br ${premiumGradients.primary} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-violet-500/25 animate-pulse`}>
              <Target className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
            <h3 className={`text-2xl font-bold ${themeColors.text.primary} mb-4`}>
              Loading Your Activities
            </h3>
            <p className={`text-lg ${themeColors.text.secondary} mb-8 max-w-md mx-auto leading-relaxed`}>
              Preparing your personalized wellness activities...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
            </div>
          </div>
        </div>
      ) : antiTodoList.length === 0 ? (
        <div className={`${themeColors.card} rounded-3xl border-0 shadow-xl overflow-hidden relative`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${premiumGradients.primary} opacity-5`} />
          <div className="relative z-10 p-16 text-center">
            <div className={`w-20 h-20 bg-gradient-to-br ${premiumGradients.primary} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-violet-500/25`}>
              <Target className="w-10 h-10 text-white drop-shadow-lg" />
              <div className="absolute -inset-2 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-3xl blur-xl -z-10 animate-pulse"></div>
            </div>
            <h3 className={`text-2xl font-bold ${themeColors.text.primary} mb-4`}>
              No Activities Available
            </h3>
            <p className={`text-lg ${themeColors.text.secondary} mb-8 max-w-md mx-auto leading-relaxed`}>
              Generate your first set of mindful wellness activities
            </p>
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className={`bg-gradient-to-r ${premiumGradients.primary} hover:shadow-xl hover:scale-105 text-white h-10 px-8 rounded-2xl font-semibold transition-all duration-300`}
            >
              <Sparkles className="w-6 h-6 mr-3" />
              Generate Activities
            </Button> d
          </div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          {antiTodoList.map((item, index) => {
            const category = getActivityCategory(item.content, index);
            const config = statusConfig[item.status] || statusConfig['not started'];
            const IconComponent = category.icon;
            
            return (
              <Card
                key={item.id}
                data-card-id={item.id}
                className={`anti-todo-card group ${themeColors.card} ${themeColors.cardHover} border-0 shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden relative rounded-2xl sm:rounded-3xl`}
              >
                {/* Gradient border effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} opacity-2 rounded-2xl sm:rounded-3xl`}></div>
                <div className={`absolute inset-[1px] ${themeColors.card} rounded-2xl sm:rounded-3xl`}></div>
                
                <CardContent className="relative z-10 p-4 sm:p-5 lg:p-6">
                  {/* Mobile Layout - Complete Redesign */}
                  <div className="lg:hidden">
                    {/* Header Section with Icon and Title */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center shadow-lg shadow-current/20 flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                        <IconComponent className="w-7 h-7 text-white drop-shadow-sm" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-bold ${themeColors.text.primary} leading-tight mb-2 line-clamp-2`}>
                          {item.content.replace(/\(.*?\)\s*/, '')}
                        </h3>
                        
                        {/* Meta Information - All badges in same row */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <Badge className={`bg-gradient-to-r ${category.gradient} text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm`}>
                            {category.name}
                          </Badge>
                          <Badge className={`${config.color} px-3 py-1 text-xs font-semibold border-0 rounded-lg shadow-sm`}>
                            {config.label}
                          </Badge>
                          <div className={`flex items-center gap-1 ${themeColors.text.muted} text-xs`}>
                            <Clock className="w-3 h-3" />
                            <span>{item.content.match(/\((.*?)\)/)?.[1] || '15 min'}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Share button for completed items */}
                      {item.status === 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(item)}
                          className={`${themeColors.text.muted} hover:${themeColors.text.primary} transition-all duration-300 h-10 w-10 rounded-xl backdrop-blur-sm hover:bg-blue-100/10 hover:scale-110 flex-shrink-0`}
                          title="Share to Community"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Action Buttons - Mobile */}
                    <div className="flex flex-col gap-2">
                      {item.status === 'not started' && (
                        <Button
                          onClick={() => handleItemAction(item.id, 'ongoing')}
                          disabled={loadingItems.has(item.id)}
                          className={`bg-gradient-to-r ${config.buttonGradient} hover:shadow-lg hover:scale-[1.02] text-white h-12 rounded-xl font-semibold transition-all duration-300 w-full text-sm shadow-md`}
                        >
                          {loadingItems.has(item.id) ? (
                            <>
                              <Zap className="w-4 h-4 mr-2 animate-pulse" />
                              Starting...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Start Activity
                            </>
                          )}
                        </Button>
                      )}

                      {item.status === 'ongoing' && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={() => handleItemAction(item.id, 'completed')}
                            disabled={loadingItems.has(item.id)}
                            className={`bg-gradient-to-r ${config.buttonGradient} hover:shadow-lg hover:scale-[1.02] text-white h-12 rounded-xl font-semibold transition-all duration-300 text-sm shadow-md`}
                          >
                            {loadingItems.has(item.id) ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1 animate-pulse" />
                                <span className="hidden sm:inline">Completing...</span>
                                <span className="sm:hidden">...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Complete</span>
                                <span className="sm:hidden">Done</span>
                              </>
                            )}
                          </Button>
                          
                          <Button
                            onClick={() => handleItemAction(item.id, 'stopped')}
                            disabled={loadingItems.has(item.id)}
                            className={`bg-gradient-to-r ${premiumGradients.tertiary} hover:shadow-lg hover:scale-[1.02] text-white h-12 rounded-xl font-semibold transition-all duration-300 text-sm shadow-md`}
                          >
                            {loadingItems.has(item.id) ? (
                              <>
                                <Square className="w-4 h-4 mr-1 animate-pulse" />
                                <span className="hidden sm:inline">Stopping...</span>
                                <span className="sm:hidden">...</span>
                              </>
                            ) : (
                              <>
                                <Square className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Stop</span>
                                <span className="sm:hidden">Stop</span>
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {(item.status === 'completed' || item.status === 'stopped') && (
                        <div className="space-y-2">
                          <div className={`bg-gradient-to-r ${premiumGradients.tertiary} px-4 py-3 rounded-xl flex items-center justify-center h-12 font-semibold text-white shadow-lg text-sm`}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {item.status === 'completed' ? 'Completed' : 'Stopped'}
                          </div>
                          
                          {item.status === 'stopped' && (
                            <Button
                              onClick={() => handleItemAction(item.id, 'ongoing')}
                              disabled={loadingItems.has(item.id)}
                              className={`bg-gradient-to-r ${config.buttonGradient} hover:shadow-lg hover:scale-[1.02] text-white h-12 rounded-xl transition-all duration-300 w-full text-sm font-semibold shadow-md`}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Resume Activity
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Desktop Layout - Complete Redesign */}
                  <div className="hidden lg:block">
                    <div className="flex items-start gap-6">
                      {/* Left Section - Icon and Content */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          {/* Activity Icon */}
                          <div className={`w-16 h-16 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center shadow-lg shadow-current/20 flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                            <IconComponent className="w-8 h-8 text-white drop-shadow-sm" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {/* Title */}
                            <h3 className={`text-xl font-bold ${themeColors.text.primary} leading-tight mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300`}>
                              {item.content.replace(/\(.*?\)\s*/, '')}
                            </h3>
                            
                            {/* Meta Information Row - All badges in same row */}
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <Badge className={`bg-gradient-to-r ${category.gradient} text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm`}>
                                {category.name}
                              </Badge>
                              <Badge className={`${config.color} px-4 py-2 text-sm font-semibold border-0 rounded-lg shadow-sm`}>
                                {config.label}
                              </Badge>
                              <div className={`flex items-center gap-2 ${themeColors.text.muted} text-sm`}>
                                <Clock className="w-4 h-4" />
                                <span>{item.content.match(/\((.*?)\)/)?.[1] || '15 min'}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Share button for completed items */}
                          {item.status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShare(item)}
                              className={`${themeColors.text.muted} hover:${themeColors.text.primary} transition-all duration-300 h-12 w-12 rounded-xl backdrop-blur-sm hover:bg-blue-100/10 hover:scale-110 flex-shrink-0`}
                              title="Share to Community"
                            >
                              <Share2 className="w-5 h-5" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Right Section - Action Buttons */}
                      <div className="flex flex-col gap-3 min-w-[160px]">
                        {item.status === 'not started' && (
                          <Button
                            onClick={() => handleItemAction(item.id, 'ongoing')}
                            disabled={loadingItems.has(item.id)}
                            className={`bg-gradient-to-r ${config.buttonGradient} hover:shadow-lg hover:scale-[1.02] text-white h-12 rounded-xl font-semibold transition-all duration-300 w-full shadow-md`}
                          >
                            {loadingItems.has(item.id) ? (
                              <>
                                <Zap className="w-4 h-4 mr-2 animate-pulse" />
                                Starting...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Start Activity
                              </>
                            )}
                          </Button>
                        )}

                        {item.status === 'ongoing' && (
                          <div className="space-y-3">
                            <Button
                              onClick={() => handleItemAction(item.id, 'completed')}
                              disabled={loadingItems.has(item.id)}
                              className={`bg-gradient-to-r ${config.buttonGradient} hover:shadow-lg hover:scale-[1.02] text-white h-12 rounded-xl font-semibold transition-all duration-300 w-full shadow-md`}
                            >
                              {loadingItems.has(item.id) ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2 animate-pulse" />
                                  Completing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Complete
                                </>
                              )}
                            </Button>
                            
                            <Button
                              onClick={() => handleItemAction(item.id, 'stopped')}
                              disabled={loadingItems.has(item.id)}
                              className={`bg-gradient-to-r ${premiumGradients.tertiary} hover:shadow-lg hover:scale-[1.02] text-white h-12 rounded-xl font-semibold transition-all duration-300 w-full shadow-md`}
                            >
                              {loadingItems.has(item.id) ? (
                                <>
                                  <Square className="w-4 h-4 mr-2 animate-pulse" />
                                  Stopping...
                                </>
                              ) : (
                                <>
                                  <Square className="w-4 h-4 mr-2" />
                                  Stop
                                </>
                              )}
                            </Button>
                          </div>
                        )}

                        {(item.status === 'completed' || item.status === 'stopped') && (
                          <div className="space-y-3">
                            <div className={`bg-gradient-to-r ${premiumGradients.tertiary} px-4 py-3 rounded-xl flex items-center justify-center h-12 font-semibold text-white shadow-lg`}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              {item.status === 'completed' ? 'Completed' : 'Stopped'}
                            </div>
                            
                            {item.status === 'stopped' && (
                              <Button
                                onClick={() => handleItemAction(item.id, 'ongoing')}
                                disabled={loadingItems.has(item.id)}
                                className={`bg-gradient-to-r ${config.buttonGradient} hover:shadow-lg hover:scale-[1.02] text-white h-12 rounded-xl font-semibold transition-all duration-300 w-full shadow-md`}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Resume
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Custom Share Dialog */}
      <Dialog open={shareDialog.open} onOpenChange={(open) => setShareDialog({ open, item: null })}>
        <DialogContent className={`${themeColors.card} border-0 shadow-2xl max-w-md backdrop-blur-xl`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${premiumGradients.accent} opacity-5 rounded-lg`} />
          <div className="relative">
            <DialogHeader className="space-y-4">
              <DialogTitle className={`${themeColors.text.primary} text-xl font-bold flex items-center gap-3`}>
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${premiumGradients.primary} flex items-center justify-center`}>
                  <Users className="w-5 h-5 text-white" />
                </div>
                Share to Community
              </DialogTitle>
              <DialogDescription className={`${themeColors.text.secondary} text-sm leading-relaxed`}>
                Your wellness activity will be visible to other community members who can like and comment on your post.
              </DialogDescription>
            </DialogHeader>

            {/* Activity Preview */}
            {shareDialog.item && (
              <div className={`my-6 p-4 rounded-2xl ${themeColors.cardVariants.muted} border backdrop-blur-sm`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${premiumGradients.secondary} flex items-center justify-center flex-shrink-0`}>
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`${themeColors.text.primary} font-semibold mb-1`}>
                      Wellness Activity Completed! 🌟
                    </h4>
                    <p className={`${themeColors.text.secondary} text-sm leading-relaxed`}>
                      🎯 {shareDialog.item.content}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs">
                      <div className={`flex items-center gap-1 ${themeColors.text.muted}`}>
                        <ThumbsUp className="w-3 h-3" />
                        <span>Likes</span>
                      </div>
                      <div className={`flex items-center gap-1 ${themeColors.text.muted}`}>
                        <MessageCircle className="w-3 h-3" />
                        <span>Comments</span>
                      </div>
                      <div className={`flex items-center gap-1 ${themeColors.text.muted}`}>
                        <Users className="w-3 h-3" />
                        <span>Community</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setShareDialog({ open: false, item: null })}
                className={`flex-1 h-11 rounded-xl ${themeColors.text.secondary} border-2 hover:${themeColors.text.primary} transition-all duration-300`}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmShare}
                disabled={isSharing}
                className={`flex-1 h-11 rounded-xl bg-gradient-to-r ${premiumGradients.primary} hover:shadow-lg hover:scale-105 text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:scale-100`}
              >
                {isSharing ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Now
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Points Toast */}
      {showToast && (
        <div className="fixed top-4 right-3 left-3 sm:left-auto sm:right-6 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-br from-blue-50/90 via-white/95 to-indigo-50/80 border-blue-200'} border rounded-xl shadow-xl p-3 sm:p-4 max-w-sm backdrop-blur-sm`}>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'} break-words`}>
                  {toastMessage}
                </p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'} transition-colors flex-shrink-0`}
              >
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
