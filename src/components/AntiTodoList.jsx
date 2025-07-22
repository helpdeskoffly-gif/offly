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
  MoreHorizontal
} from 'lucide-react';
import { getAntiTodoList, updateAntiTodoItemStatus, regenerateAntiTodoList, generateInitialAntiTodos } from '../services/antiTodo';

export const AntiTodoList = ({ userId }) => {
  const { theme } = useTheme();
  const [antiTodoList, setAntiTodoList] = useState([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [loadingItems, setLoadingItems] = useState(new Set());
  
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
      : "from-slate-200 via-slate-300 to-slate-400",
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
      : "bg-white/80 border-slate-200/50 backdrop-blur-xl",
    cardHover: theme === "dark"
      ? "hover:bg-slate-800/70 hover:border-slate-700/60"
      : "hover:bg-white/90 hover:border-slate-300/60",
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
    const keywords = {
      'Mindfulness': ['breathe', 'meditate', 'mindful', 'present', 'awareness', 'reflect', 'observe'],
      'Movement': ['walk', 'dance', 'stretch', 'move', 'exercise', 'body'],
      'Creativity': ['create', 'draw', 'write', 'color', 'art', 'express', 'creative'],
      'Connection': ['call', 'friend', 'family', 'connect', 'share', 'together'],
      'Learning': ['read', 'learn', 'study', 'explore', 'discover'],
      'Nature': ['outside', 'nature', 'garden', 'sky', 'trees', 'sun'],
      'Music': ['music', 'sing', 'listen', 'sound', 'rhythm'],
      'Visual': ['watch', 'see', 'look', 'observe', 'photo', 'image']
    };

    const lowerContent = content.toLowerCase();
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => lowerContent.includes(word))) {
        return activityCategories.find(cat => cat.name === category);
      }
    }
    
    return activityCategories[index % activityCategories.length];
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
      }
    };

    if (userId) {
      fetchAndInitializeAntiTodos();
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

  const handleShare = async (item) => {
    const shareText = `${item.content}\n\nFrom my wellness journey with Offly`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Wellness Activity',
          text: shareText,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Copied to clipboard');
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  const stats = {
    total: antiTodoList.length,
    available: antiTodoList.filter(item => item.status === 'not started').length,
    inProgress: antiTodoList.filter(item => item.status === 'ongoing').length,
    completed: antiTodoList.filter(item => item.status === 'completed').length,
  };

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Premium Header Section */}
      <div ref={headerRef} className={`${themeColors.card} rounded-3xl border-0 shadow-xl overflow-hidden relative`}>
        {/* Background gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${premiumGradients.accent} opacity-5`} />
        <div className="absolute inset-0 bg-white/5 dark:bg-black/10" />
        
        <div className="relative z-10 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center space-x-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${premiumGradients.accent} rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/25`}>
                <Target className="w-8 h-8 text-white drop-shadow-lg" />
                <div className="absolute -inset-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl -z-10 animate-pulse"></div>
              </div>
              <div>
                <h2 className={`text-3xl lg:text-4xl font-bold ${themeColors.text.primary} mb-2`}>
                  Anti-Todo Activities
                </h2>
                <p className={`text-lg ${themeColors.text.secondary}`}>
                  Joyful activities designed to spark happiness
                </p>
              </div>
            </div>

            {/* Enhanced Stats */}
            <div className="flex flex-wrap items-center gap-4">
              {Object.entries(statusConfig).map(([status, config]) => {
                const count = stats[status.replace(' ', '') === 'notstarted' ? 'available' : status.replace(' ', '').toLowerCase()] || 0;
                return (
                  <Badge key={status} className={`${config.color} px-4 py-2 text-sm font-medium border backdrop-blur-sm rounded-full`}>
                    {count} {config.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className={`bg-gradient-to-r ${premiumGradients.secondary} hover:shadow-xl hover:scale-105 text-white h-12 px-8 rounded-2xl font-semibold transition-all duration-300`}
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-3" />
                  Generate New
                </>
              )}
            </Button>

            <Button
              onClick={handleClearAll}
              className={`bg-gradient-to-r ${premiumGradients.tertiary} hover:shadow-xl hover:scale-105 text-white h-12 px-8 rounded-2xl font-semibold transition-all duration-300`}
            >
              <Zap className="w-5 h-5 mr-3" />
              Clear Completed
            </Button>
          </div>
        </div>
      </div>

      {/* Premium Activities List */}
      {antiTodoList.length === 0 ? (
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
              className={`bg-gradient-to-r ${premiumGradients.primary} hover:shadow-xl hover:scale-105 text-white h-14 px-8 rounded-2xl font-semibold text-lg transition-all duration-300`}
            >
              <Sparkles className="w-6 h-6 mr-3" />
              Generate Activities
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {antiTodoList.map((item, index) => {
            const category = getActivityCategory(item.content, index);
            const config = statusConfig[item.status] || statusConfig['not started'];
            const IconComponent = category.icon;
            
            return (
              <Card
                key={item.id}
                data-card-id={item.id}
                className={`anti-todo-card group ${themeColors.card} ${themeColors.cardHover} border-0 shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden relative rounded-3xl`}
              >
                {/* Gradient border effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} opacity-2 rounded-3xl`}></div>
                <div className={`absolute inset-[1px] ${themeColors.card} rounded-3xl`}></div>
                
                <CardContent className="relative z-10 p-8">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Icon and Content Section */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start gap-4">
                        {/* Activity Icon */}
                        <div className={`w-14 h-14 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center shadow-lg shadow-current/20 flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                          <IconComponent className="w-7 h-7 text-white drop-shadow-sm" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {/* Status Badge */}
                          <div className="flex items-center justify-between mb-3">
                            <Badge className={`${config.color} px-4 py-2 text-sm font-semibold border backdrop-blur-sm rounded-xl`}>
                              {config.label}
                            </Badge>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShare(item)}
                              className={`${themeColors.text.muted} hover:${themeColors.text.primary} opacity-0 group-hover:opacity-100 transition-all duration-300 h-10 w-10 rounded-xl backdrop-blur-sm hover:bg-white/10`}
                            >
                              <Share2 className="w-5 h-5" />
                            </Button>
                          </div>

                          {/* Activity Content */}
                          <div className="space-y-3">
                            <h3 className={`text-xl font-semibold ${themeColors.text.primary} leading-relaxed group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300`}>
                              {item.content}
                            </h3>
                            
                            {/* Category and timing */}
                            <div className="flex items-center gap-4 text-sm">
                              <Badge className={`bg-gradient-to-r ${category.gradient} text-white px-3 py-1 rounded-lg font-medium shadow-sm`}>
                                {category.name}
                              </Badge>
                              <div className={`flex items-center gap-2 ${themeColors.text.muted} px-3 py-1 rounded-lg bg-white/5`}>
                                <Clock className="w-4 h-4" />
                                15 min
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div className="flex flex-row lg:flex-col gap-3 lg:w-auto w-full lg:min-w-[180px]">
                      {item.status === 'not started' && (
                        <Button
                          onClick={() => handleItemAction(item.id, 'ongoing')}
                          disabled={loadingItems.has(item.id)}
                          className={`bg-gradient-to-r ${config.buttonGradient} hover:shadow-sm hover:scale-102 text-white flex-1 lg:w-full h-6 px-3 rounded-md font-medium text-xs transition-all duration-300`}
                        >
                          {loadingItems.has(item.id) ? (
                            <>
                              <Zap className="w-2 h-2 mr-1 animate-pulse" />
                              Starting...
                            </>
                          ) : (
                            <>
                              <Play className="w-2 h-2 mr-1" />
                              Start
                            </>
                          )}
                        </Button>
                      )}

                      {item.status === 'ongoing' && (
                        <>
                          <Button
                            onClick={() => handleItemAction(item.id, 'completed')}
                            disabled={loadingItems.has(item.id)}
                            className={`bg-gradient-to-r ${config.buttonGradient} hover:shadow-lg hover:scale-105 text-white flex-1 lg:w-full h-10 rounded-lg font-medium transition-all duration-300`}
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
                            className={`bg-gradient-to-r ${premiumGradients.tertiary} hover:shadow-lg hover:scale-105 text-white flex-1 lg:w-full h-10 rounded-lg font-medium transition-all duration-300`}
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
                        </>
                      )}

                      {(item.status === 'completed' || item.status === 'stopped') && (
                        <div className="flex flex-1 lg:w-full gap-3">
                          <div className={`bg-gradient-to-r ${premiumGradients.tertiary} px-4 py-3 rounded-lg flex items-center justify-center flex-1 h-10 font-medium text-white shadow-lg`}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {item.status === 'completed' ? 'Completed' : 'Stopped'}
                          </div>
                          
                          {item.status === 'stopped' && (
                            <Button
                              onClick={() => handleItemAction(item.id, 'ongoing')}
                              disabled={loadingItems.has(item.id)}
                              className={`bg-gradient-to-r ${config.buttonGradient} hover:shadow-lg hover:scale-105 text-white h-10 px-4 rounded-lg transition-all duration-300`}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
