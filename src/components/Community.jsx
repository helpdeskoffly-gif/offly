import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Send, 
  Plus,
  Search,
  Filter,
  TrendingUp,
  Users,
  Sparkles,
  Hash,
  Clock,
  MoreVertical,
  Edit3,
  Trash2,
  UserPlus,
  UserCheck,
  Globe,
  User
} from 'lucide-react';
import {
  getCommunityFeed,
  createCommunityPost,
  togglePostLike,
  getTrendingHashtags,
  searchPosts,
  deletePost,
  getSuggestedFriends,
  toggleUserFollow,
  isUserFollowing
} from '../services/community';
import { getUserAvatarUrl } from '../services/avatars';

export const Community = () => {
  const { theme } = useTheme();
  const { user, userProfile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'friends', 'my_posts'
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingHashtags, setTrendingHashtags] = useState([]);

  
  // Friends suggestions state
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [loadingFollow, setLoadingFollow] = useState(new Set());
  
  // Post management state
  const [deletingPosts, setDeletingPosts] = useState(new Set());
  const [openMenus, setOpenMenus] = useState(new Set());
  const [showFriendsFallback, setShowFriendsFallback] = useState(false);
  

  
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const loadingRef = useRef(null);

  // Premium gradients matching the app
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
      ? "from-orange-400 via-pink-400 to-red-400"
      : "from-orange-500 via-pink-500 to-red-500",
  };

  const themeColors = {
    background: theme === "dark"
      ? "bg-gradient-to-br from-slate-950 via-gray-950 to-slate-950"
      : "bg-background", // Use the new calming background color
    text: {
      primary: theme === "dark" ? "text-slate-200" : "text-slate-800",
      secondary: theme === "dark" ? "text-slate-400" : "text-gray-600",
      muted: theme === "dark" ? "text-slate-500" : "text-gray-500",
    },
    card: theme === "dark"
      ? "bg-slate-900/60 border-slate-800/50 backdrop-blur-xl"
      : "bg-card border-border backdrop-blur-xl", // Use theme-consistent card colors
    cardHover: theme === "dark"
      ? "hover:bg-slate-800/70 hover:border-slate-700/60"
      : "hover:bg-accent/50 hover:border-border", // Use theme-consistent hover colors
    cardVariants: {
      neutral: theme === "dark"
        ? "bg-slate-800/40 border-slate-700/40"
        : "bg-muted/30 border-border",
      success: theme === "dark"
        ? "bg-emerald-900/20 border-emerald-700/40"
        : "bg-primary/5 border-primary/20",
    }
  };

  // Load initial feed and suggestions
  useEffect(() => {
    loadFeed(true);
    loadTrendingHashtags();
    if (user?.id) {
      loadSuggestedFriends();
    }
  }, [activeTab, user?.id]);

  // Enhanced animations on mount
  useEffect(() => {
    if (containerRef.current && headerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );

      gsap.fromTo(
        headerRef.current.querySelectorAll('.animate-stagger'),
        { opacity: 0, y: 20, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.8, 
          stagger: 0.15,
          ease: "back.out(1.7)",
          delay: 0.3
        }
      );
    }
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadingRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadFeed(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadingRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, offset]);

  const loadFeed = async (reset = false) => {
    if (loading && !reset) return;
    
    setLoading(true);
    console.log('Loading feed with tab:', activeTab);
    
    try {
      const currentOffset = reset ? 0 : offset;
      
      let algorithm = 'all_posts';
      if (activeTab === 'friends') algorithm = 'friends';
      if (activeTab === 'my_posts') algorithm = 'my_posts';
      
      const result = await getCommunityFeed(user.id, {
        limit: 20,
        offset: currentOffset,
        algorithm: algorithm
      });
      
      if (result && result.success) {
        if (reset) {
          setPosts(result.data || []);
          setOffset(20);
        } else {
          setPosts(prev => [...prev, ...(result.data || [])]);
          setOffset(prev => prev + 20);
        }
        setHasMore(result.hasMore);
      } else {
        console.error('Feed result not successful:', result);
        // Show user-friendly error message
        if (activeTab === 'friends') {
          console.log('Friends feed not available, showing all posts instead');
          setShowFriendsFallback(true);
          // Fallback to all posts for friends tab
          const fallbackResult = await getCommunityFeed(user.id, {
            limit: 20,
            offset: currentOffset,
            algorithm: 'all_posts'
          });
          if (fallbackResult && fallbackResult.success) {
            if (reset) {
              setPosts(fallbackResult.data || []);
              setOffset(20);
            } else {
              setPosts(prev => [...prev, ...(fallbackResult.data || [])]);
              setOffset(prev => prev + 20);
            }
            setHasMore(fallbackResult.hasMore);
          } else {
            setPosts([]);
            setHasMore(false);
          }
        } else {
          setPosts([]);
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error loading feed:', error);
      setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingHashtags = async () => {
    try {
      const result = await getTrendingHashtags(8);
      if (result.success) {
        setTrendingHashtags(result.data);
      }
    } catch (error) {
      console.error('Error loading trending hashtags:', error);
    }
  };

  const loadSuggestedFriends = async () => {
    console.log('🚀 Loading suggested friends for user:', user.id);
    try {
      const result = await getSuggestedFriends(user.id, 8);
      console.log('📊 Suggested friends result:', result);
      
      if (result.success) {
        console.log('✅ Friends data received:', result.data);
        setSuggestedFriends(result.data || []);
        
        // Check which users the current user is already following
        const followingStatuses = await Promise.all(
          (result.data || []).map(async (friend) => {
            const followResult = await isUserFollowing(user.id, friend.user_id);
            return { userId: friend.user_id, following: followResult.following };
          })
        );
        
        const followingSet = new Set(
          followingStatuses
            .filter(status => status.following)
            .map(status => status.userId)
        );
        setFollowingUsers(followingSet);
      } else {
        console.log('❌ Friends request failed:', result);
      }
    } catch (error) {
      console.error('💥 Error loading suggested friends:', error);
    }
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setOffset(0);
    setPosts([]);
    setHasMore(true);
    setShowFriendsFallback(false);
  };

  const handleFollowUser = async (userId) => {
    setLoadingFollow(prev => new Set([...prev, userId]));
    
    try {
      const result = await toggleUserFollow(user.id, userId);
      
      if (result.success) {
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          if (result.following) {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
        
        // Show success feedback
        const action = result.following ? 'followed' : 'unfollowed';
        console.log(`Successfully ${action} user`);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoadingFollow(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleLikePost = async (postId, currentlyLiked) => {
    try {
      const result = await togglePostLike(user.id, postId);
      
      if (result.success) {
        setPosts(prev => prev.map(post => {
          if (post.community_post_id === postId) {
            return {
              ...post,
              user_has_liked: result.liked,
              like_count: result.liked 
                ? parseInt(post.like_count) + 1 
                : parseInt(post.like_count) - 1
            };
          }
          return post;
        }));
        
        // Heart animation
        const heartElement = document.querySelector(`[data-like-btn="${postId}"]`);
        if (heartElement) {
          gsap.to(heartElement, {
            scale: result.liked ? 1.2 : 1,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut"
          });
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };



  const handleHashtagClick = (hashtag) => {
    setSearchQuery(`#${hashtag}`);
    setOffset(0);
    loadFeed(true);
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    // Close the menu
    setOpenMenus(prev => {
      const newSet = new Set(prev);
      newSet.delete(postId);
      return newSet;
    });

    setDeletingPosts(prev => new Set([...prev, postId]));
    
    try {
      const result = await deletePost(user.id, postId);
      
      if (result.success) {
        // Remove post from local state
        setPosts(prev => prev.filter(post => post.community_post_id !== postId));
        
        // Show success feedback with GSAP animation
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
              <p class="${themeColors.text.primary} font-semibold">Post Deleted! 🗑️</p>
              <p class="${themeColors.text.secondary} text-sm">Your post has been removed</p>
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
        
        // Animate out and remove after 3 seconds
        setTimeout(() => {
          gsap.to(successElement, {
            opacity: 0,
            scale: 0.8,
            y: -20,
            duration: 0.3,
            onComplete: () => successElement.remove()
          });
        }, 3000);
      } else {
        console.error('Failed to delete post:', result.error);
        alert('Failed to delete post. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setDeletingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const toggleMenu = (postId) => {
    setOpenMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  return (
    <div ref={containerRef} className="min-h-screen">
      {/* Header */}
      <div ref={headerRef} className={`${themeColors.card} rounded-2xl border shadow-lg mb-8`}>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="animate-stagger">
              <h2 className={`text-3xl font-bold ${themeColors.text.primary} mb-2`}>
                Community
              </h2>
              <p className={`${themeColors.text.secondary}`}>
                Share your wellness journey with others
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Instagram-style Layout: Main Content + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 justify-center max-w-6xl mx-auto">
        {/* Main Content Area - Posts Feed */}
        <div className="flex-1 max-w-2xl w-full">
                  {/* Mobile Friends Suggestions */}
        <div className="lg:hidden mb-6">
          <Card className={`${themeColors.card} rounded-2xl border shadow-lg`}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center gap-2 ${themeColors.text.primary} text-base`}>
                <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${premiumGradients.secondary} flex items-center justify-center`}>
                  <Heart className="w-2.5 h-2.5 text-white" />
                </div>
                <span>Suggested Friends</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {suggestedFriends.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {suggestedFriends.slice(0, 4).map((friend) => (
                    <div key={friend.user_id} className="flex flex-col items-center gap-1.5 min-w-[100px] p-2.5 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 flex-shrink-0">
                      <Avatar className="w-10 h-10">
                        <AvatarImage 
                          src={getUserAvatarUrl({ id: friend.user_id }, { avatar_url: friend.avatar_url })} 
                          alt={friend.username || friend.full_name} 
                        />
                        <AvatarFallback className={`bg-gradient-to-br ${premiumGradients.accent} text-white text-xs`}>
                          {(friend.username || friend.full_name || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="text-center min-w-0 w-full">
                        <h4 className={`font-medium ${themeColors.text.primary} text-xs truncate px-1`}>
                          {friend.username || friend.full_name || 'Anonymous'}
                        </h4>
                        {friend.hobby_match_count > 0 && (
                          <p className={`text-xs ${themeColors.text.muted} truncate px-1`}>
                            {friend.hobby_match_count} shared hobby{friend.hobby_match_count !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => handleFollowUser(friend.user_id)}
                        disabled={loadingFollow.has(friend.user_id)}
                        size="sm"
                        className={`h-5 px-2 text-xs ${
                          followingUsers.has(friend.user_id)
                            ? `bg-gradient-to-r ${premiumGradients.tertiary} text-white`
                            : `bg-gradient-to-r ${premiumGradients.secondary} text-white`
                        }`}
                      >
                        {loadingFollow.has(friend.user_id) ? (
                          <Sparkles className="w-2.5 h-2.5 animate-spin" />
                        ) : followingUsers.has(friend.user_id) ? (
                          'Following'
                        ) : (
                          'Follow'
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Users className={`w-6 h-6 ${themeColors.text.muted} mx-auto mb-2`} />
                  <p className={`text-xs ${themeColors.text.muted}`}>
                    Looking for friends...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Friends Fallback Notification */}
        {showFriendsFallback && activeTab === 'friends' && (
          <div className={`mb-4 p-4 rounded-xl border ${themeColors.cardVariants.neutral} ${themeColors.text.primary}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Friends feed temporarily unavailable</p>
                <p className={`text-sm ${themeColors.text.secondary}`}>
                  Showing all community posts instead. Follow some friends to see their posts here!
                </p>
              </div>
              <Button
                onClick={() => setShowFriendsFallback(false)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-slate-200"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {/* Community Tabs */}
        <div className="w-full overflow-hidden">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className={`grid w-full grid-cols-3 ${themeColors.card} p-1 rounded-xl`}>
              <TabsTrigger 
                value="all" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">All</span>
              </TabsTrigger>
              <TabsTrigger 
                value="friends"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Friends</span>
              </TabsTrigger>
              <TabsTrigger 
                value="my_posts"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Mine</span>
              </TabsTrigger>
            </TabsList>

        {/* Tab Content */}
        <TabsContent value={activeTab} className="mt-6">
          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.map((post, index) => (
              <Card
                key={post.community_post_id}
                className={`community-post ${themeColors.card} rounded-xl border-0 shadow-lg transition-all duration-200 overflow-hidden`}
              >
                <CardContent className="p-4 sm:p-5">
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white/20 flex-shrink-0">
                      <AvatarImage 
                        src={getUserAvatarUrl({ id: post.user_id }, { avatar_url: post.avatar_url })} 
                        alt={post.username || post.full_name} 
                      />
                      <AvatarFallback className={`bg-gradient-to-br ${premiumGradients.secondary} text-white font-semibold text-xs sm:text-sm`}>
                        {(post.username || post.full_name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold ${themeColors.text.primary} text-sm truncate`}>
                        {post.username || post.full_name || 'Anonymous'}
                      </h4>
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className={`w-3 h-3 ${themeColors.text.muted} flex-shrink-0`} />
                        <span className={`${themeColors.text.muted} truncate`}>
                          {formatTimeAgo(post.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className={`text-sm sm:text-base ${themeColors.text.primary} mb-4 leading-relaxed break-words`}>
                    {post.content}
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/10">
                    <div className="flex items-center gap-2">
                      {/* Hashtags (compact) */}
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.hashtags.slice(0, 2).map((hashtag, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-1 rounded-full ${themeColors.text.muted} bg-slate-100 dark:bg-slate-700/50`}
                            >
                              #{hashtag}
                            </span>
                          ))}
                          {post.hashtags.length > 2 && (
                            <span className={`text-xs ${themeColors.text.muted}`}>
                              +{post.hashtags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => handleLikePost(post.community_post_id, post.user_has_liked)}
                      variant="ghost"
                      size="sm"
                      data-like-btn={post.community_post_id}
                      className={`flex items-center gap-1 h-8 px-3 rounded-lg transition-all duration-300 ${
                        post.user_has_liked
                          ? `text-red-500 bg-red-500/10 hover:bg-red-500/20`
                          : `${themeColors.text.muted} hover:${themeColors.text.primary} hover:bg-red-500/10`
                      }`}
                    >
                      <Heart 
                        className={`w-4 h-4 ${post.user_has_liked ? 'fill-current' : ''}`} 
                      />
                      <span className="font-medium text-sm">{post.like_count || 0}</span>
                    </Button>
                  </div>


                </CardContent>
              </Card>
            ))}
          </div>

          {/* Loading Indicator */}
          {hasMore && (
            <div ref={loadingRef} className="flex justify-center py-8">
              <div className={`flex items-center gap-3 ${themeColors.text.secondary}`}>
                <Sparkles className="w-5 h-5 animate-spin" />
                Loading more posts...
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && posts.length === 0 && (
            <Card className={`${themeColors.cardVariants.neutral} rounded-2xl border-0 shadow-lg`}>
              <CardContent className="p-12 text-center">
                {activeTab === 'my_posts' ? (
                  <div>
                    <div className={`w-16 h-16 ${themeColors.text.muted} mx-auto mb-4 rounded-full bg-gradient-to-br ${premiumGradients.secondary} flex items-center justify-center`}>
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className={`text-xl font-semibold ${themeColors.text.primary} mb-2`}>
                      You haven't posted anything yet
                    </h3>
                    <p className={`${themeColors.text.secondary} mb-6`}>
                      Complete activities or check-ins to share with the community! Try completing an anti-todo or doing a mood check-in.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button 
                        onClick={() => window.location.href = '/dashboard'}
                        className={`bg-gradient-to-r ${premiumGradients.secondary} text-white`}
                      >
                        Go to Dashboard
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setActiveTab('all')}
                      >
                        Browse Community
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Users className={`w-16 h-16 ${themeColors.text.muted} mx-auto mb-4`} />
                    <h3 className={`text-xl font-semibold ${themeColors.text.primary} mb-2`}>
                      {activeTab === 'friends' && 'No posts from friends yet'}
                      {activeTab === 'all' && 'No posts yet'}
                    </h3>
                    <p className={`${themeColors.text.secondary} mb-6`}>
                      {activeTab === 'friends' && 'Follow some friends to see their posts here! You can find suggested friends in the sidebar.'}
                      {activeTab === 'all' && 'Be the first to share something with the community!'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
          </Tabs>
        </div>
        </div>

        {/* Sidebar - Friends Suggestions (Desktop only) */}
        <div className="w-full lg:w-80 hidden lg:block">
          <div className="sticky top-8">
            <Card className={`${themeColors.card} rounded-2xl border shadow-lg`}>
              <CardHeader className="pb-4">
                <CardTitle className={`flex items-center gap-3 ${themeColors.text.primary}`}>
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${premiumGradients.secondary} flex items-center justify-center`}>
                    <Heart className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-lg">Suggested Friends</span>
                </CardTitle>
                <p className={`text-sm ${themeColors.text.secondary}`}>
                  People you may know
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedFriends.length > 0 ? (
                  <>
                    {suggestedFriends.slice(0, 5).map((friend) => (
                      <div key={friend.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage 
                            src={getUserAvatarUrl({ id: friend.user_id }, { avatar_url: friend.avatar_url })} 
                            alt={friend.username || friend.full_name} 
                          />
                          <AvatarFallback className={`bg-gradient-to-br ${premiumGradients.accent} text-white text-sm`}>
                            {(friend.username || friend.full_name || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium ${themeColors.text.primary} text-sm truncate`}>
                            {friend.username || friend.full_name || 'Anonymous'}
                          </h4>
                          {friend.hobby_match_count > 0 && (
                            <p className={`text-xs ${themeColors.text.muted}`}>
                              {friend.hobby_match_count} shared hobby{friend.hobby_match_count !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                        
                        <Button
                          onClick={() => handleFollowUser(friend.user_id)}
                          disabled={loadingFollow.has(friend.user_id)}
                          size="sm"
                          className={`h-7 px-3 text-xs ${
                            followingUsers.has(friend.user_id)
                              ? `bg-gradient-to-r ${premiumGradients.tertiary} text-white`
                              : `bg-gradient-to-r ${premiumGradients.secondary} text-white`
                          }`}
                        >
                          {loadingFollow.has(friend.user_id) ? (
                            <Sparkles className="w-3 h-3 animate-spin" />
                          ) : followingUsers.has(friend.user_id) ? (
                            'Following'
                          ) : (
                            'Follow'
                          )}
                        </Button>
                      </div>
                    ))}
                    {suggestedFriends.length > 5 && (
                      <Button variant="ghost" className="w-full text-sm text-blue-500 hover:text-blue-600">
                        See all suggestions
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Users className={`w-8 h-8 ${themeColors.text.muted} mx-auto mb-2`} />
                    <p className={`text-sm ${themeColors.text.muted} mb-2`}>
                      🔍 Looking for friends...
                    </p>
                    <p className={`text-xs ${themeColors.text.muted}`}>
                      Debug: {user?.id ? 'User logged in' : 'No user'} 
                    </p>
                    <Button 
                      onClick={loadSuggestedFriends}
                      size="sm"
                      variant="outline"
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};