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
  Share2, 
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

  // Theme colors
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
    cardHover: theme === "dark"
      ? "hover:bg-slate-700/70 hover:border-slate-600/60"
      : "hover:bg-white/90 hover:border-purple-300/70",
    cardVariants: {
      neutral: theme === "dark" 
        ? "bg-slate-800/40 border-slate-700/30" 
        : "bg-white/60 border-slate-200/40",
    }
  };

  // Load initial data
  useEffect(() => {
    if (user) {
      loadFeed(true);
      loadTrendingHashtags();
      loadSuggestedFriends();
    }
  }, [user, activeTab]);

  // Infinite scroll
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
        setPosts([]);
        setHasMore(false);
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
    try {
      const result = await getSuggestedFriends(user.id, 5);
      if (result.success) {
        setSuggestedFriends(result.data);
        
        // Check which users the current user is following
        const followingChecks = result.data.map(friend => 
          isUserFollowing(user.id, friend.user_id)
        );
        
        const followingResults = await Promise.all(followingChecks);
        const followingSet = new Set();
        
        followingResults.forEach((result, index) => {
          if (result.success && result.data) {
            followingSet.add(result.data.user_id);
          }
        });
        
        setFollowingUsers(followingSet);
      }
    } catch (error) {
      console.error('Error loading suggested friends:', error);
    }
  };

  const handleLikePost = async (postId, currentLikeStatus) => {
    try {
      const result = await togglePostLike(user.id, postId, currentLikeStatus);
      
      if (result.success) {
        setPosts(prev => prev.map(post => {
          if (post.post_id === postId) {
            return {
              ...post,
              user_has_liked: result.liked,
              like_count: result.liked 
                ? parseInt(post.like_count) + 1 
                : Math.max(0, parseInt(post.like_count) - 1)
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleFollowUser = async (userId) => {
    if (loadingFollow.has(userId)) return;
    
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
      }
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setLoadingFollow(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleDeletePost = async (postId) => {
    if (deletingPosts.has(postId)) return;
    
    setDeletingPosts(prev => new Set([...prev, postId]));
    
    try {
      const result = await deletePost(user.id, postId);
      
      if (result.success) {
        setPosts(prev => prev.filter(post => post.post_id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setDeletingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const handleHashtagClick = (hashtag) => {
    setSearchQuery(`#${hashtag}`);
    setOffset(0);
    loadFeed(true);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const formatHashtags = (hashtags) => {
    if (!hashtags || hashtags.length === 0) return [];
    return hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`);
  };

  return (
    <div className={`min-h-screen ${themeColors.background} p-4 sm:p-6`}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div ref={headerRef} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl sm:text-4xl font-bold ${themeColors.text.primary} mb-2`}>
              Community
            </h1>
            <p className={`${themeColors.text.secondary} text-lg`}>
              Connect with others on your wellness journey
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {/* TODO: Add create post functionality */}}
              className={`bg-gradient-to-r ${premiumGradients.primary} text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg`}
            >
              <Plus className="w-5 h-5 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${themeColors.text.muted}`} />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 h-12 rounded-xl border-2 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-600' : 'bg-white/70 border-slate-300'}`}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className={`${themeColors.card} border-2 ${theme === 'dark' ? 'border-slate-600' : 'border-slate-300'} rounded-xl px-4 py-2`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Trending Hashtags */}
        {trendingHashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className={`text-sm font-medium ${themeColors.text.secondary} mr-2`}>
              Trending:
            </span>
            {trendingHashtags.slice(0, 6).map((hashtag, index) => (
              <button
                key={index}
                onClick={() => handleHashtagClick(hashtag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  theme === 'dark' 
                    ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/70' 
                    : 'bg-white/70 text-slate-700 hover:bg-white/90'
                }`}
              >
                #{hashtag}
              </button>
            ))}
          </div>
        )}

        {/* Friends Suggestions */}
        {suggestedFriends.length > 0 && (
          <Card className={`${themeColors.card} rounded-2xl border-0 shadow-xl`}>
            <CardHeader>
              <CardTitle className={`${themeColors.text.primary} flex items-center gap-2`}>
                <Users className="w-5 h-5" />
                Suggested Friends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {suggestedFriends.map((friend) => (
                  <div key={friend.user_id} className="flex-shrink-0">
                    <div className={`${themeColors.cardVariants.neutral} rounded-xl p-3 min-w-[120px]`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage 
                            src={getUserAvatarUrl({ id: friend.user_id }, { avatar_url: friend.avatar_url })} 
                            alt={friend.username || friend.full_name} 
                          />
                          <AvatarFallback className={`bg-gradient-to-br ${premiumGradients.secondary} text-white text-sm`}>
                            {(friend.username || friend.full_name || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${themeColors.text.primary} truncate`}>
                            {friend.username || friend.full_name || 'Anonymous'}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleFollowUser(friend.user_id)}
                        disabled={loadingFollow.has(friend.user_id)}
                        size="sm"
                        className={`w-full text-xs ${
                          followingUsers.has(friend.user_id)
                            ? 'bg-slate-600 text-white'
                            : `bg-gradient-to-r ${premiumGradients.secondary} text-white`
                        }`}
                      >
                        {loadingFollow.has(friend.user_id) ? (
                          <Sparkles className="w-3 h-3 animate-spin" />
                        ) : followingUsers.has(friend.user_id) ? (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3 mr-1" />
                            Follow
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feed Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full grid-cols-3 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/70'} rounded-xl p-1`}>
            <TabsTrigger value="all" className="rounded-lg">For You</TabsTrigger>
            <TabsTrigger value="friends" className="rounded-lg">Friends</TabsTrigger>
            <TabsTrigger value="my_posts" className="rounded-lg">My Posts</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post, index) => (
                <Card
                  key={post.post_id}
                  className={`community-post ${themeColors.card} ${themeColors.cardHover} rounded-2xl border-0 shadow-xl transition-all duration-300 transform hover:scale-[1.01] overflow-hidden`}
                >
                  <CardContent className="p-8">
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 border-2 border-white/20">
                          <AvatarImage 
                            src={getUserAvatarUrl({ id: post.user_id }, { avatar_url: post.avatar_url })} 
                            alt={post.username || post.full_name} 
                          />
                          <AvatarFallback className={`bg-gradient-to-br ${premiumGradients.secondary} text-white font-semibold`}>
                            {(post.username || post.full_name || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h3 className={`font-semibold ${themeColors.text.primary}`}>
                            {post.username || post.full_name || 'Anonymous'}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Clock className={`w-3 h-3 ${themeColors.text.muted}`} />
                            <span className={`text-sm ${themeColors.text.muted}`}>
                              {formatTimeAgo(post.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Post Menu */}
                      {post.user_id === user.id && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`${themeColors.text.muted} hover:${themeColors.text.primary}`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className={`${themeColors.card} border-0 shadow-xl`}>
                            <div className="space-y-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`w-full justify-start ${themeColors.text.primary}`}
                              >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePost(post.post_id)}
                                disabled={deletingPosts.has(post.post_id)}
                                className={`w-full justify-start text-red-500 hover:text-red-600`}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {deletingPosts.has(post.post_id) ? 'Deleting...' : 'Delete'}
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                    
                    {/* Post Content */}
                    <div className="mb-6">
                      {post.title && (
                        <h2 className={`text-xl font-semibold ${themeColors.text.primary} mb-3`}>
                          {post.title}
                        </h2>
                      )}
                      <p className={`${themeColors.text.primary} leading-relaxed whitespace-pre-wrap`}>
                        {post.content}
                      </p>
                    </div>
                    
                    {/* Hashtags */}
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {formatHashtags(post.hashtags).map((hashtag, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              theme === 'dark' 
                                ? 'bg-slate-700/50 text-slate-300' 
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-200/10">
                      <div className="flex items-center gap-6">
                        <Button
                          onClick={() => handleLikePost(post.post_id, post.user_has_liked)}
                          variant="ghost"
                          size="sm"
                          data-like-btn={post.post_id}
                          className={`flex items-center gap-2 h-10 px-4 rounded-xl transition-all duration-300 ${
                            post.user_has_liked
                              ? `text-red-500 bg-red-500/10 hover:bg-red-500/20`
                              : `${themeColors.text.muted} hover:${themeColors.text.primary} hover:bg-red-500/10`
                          }`}
                        >
                          <Heart 
                            className={`w-4 h-4 ${post.user_has_liked ? 'fill-current' : ''}`} 
                          />
                          <span className="font-medium">{post.like_count || 0}</span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`flex items-center gap-2 h-10 px-4 rounded-xl ${themeColors.text.muted} hover:${themeColors.text.primary} hover:bg-emerald-500/10 transition-all duration-300`}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
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
                  <Users className={`w-16 h-16 ${themeColors.text.muted} mx-auto mb-4`} />
                  <h3 className={`text-xl font-semibold ${themeColors.text.primary} mb-2`}>
                    {activeTab === 'friends' && 'No posts from friends yet'}
                    {activeTab === 'my_posts' && 'You haven\'t posted anything yet'}
                    {activeTab === 'all' && 'No posts yet'}
                  </h3>
                  <p className={`${themeColors.text.secondary} mb-6`}>
                    {activeTab === 'friends' && 'Follow some friends to see their posts here!'}
                    {activeTab === 'my_posts' && 'Complete activities or check-ins to share with the community!'}
                    {activeTab === 'all' && 'Be the first to share something with the community!'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}; 