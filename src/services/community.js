import { supabase } from '../supabase';

const safeCommunityOperation = async (operation) => {
  try {
    return await operation();
  } catch (error) {
    console.error('Community operation failed:', error);
    return { success: false, error: error.message };
  }
};

// Create a community post
export const createCommunityPost = async (userId, postData) => {
  console.log('createCommunityPost called with:', { userId, postData });
  
  return safeCommunityOperation(async () => {
    const { content, title, contentType = 'text', sourceType = 'manual', sourceId, hashtags = [] } = postData;
    
    const insertData = {
      user_id: userId,
      content: content,
      title: title,
      content_type: contentType,
      source_type: sourceType,
      source_id: sourceId,
      hashtags: hashtags,
      is_public: true,
      created_at: new Date().toISOString()
    };
    
    console.log('Inserting into community_posts:', insertData);
    
    const { data, error } = await supabase
      .from('community_posts')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      throw error;
    }
    
    console.log('Successfully created community post:', data);
    return { data };
  });
};

// Toggle like on a post
export const togglePostLike = async (userId, postId, currentLikeStatus) => {
  return safeCommunityOperation(async () => {
    if (currentLikeStatus) {
      // Unlike
      const { error } = await supabase
        .from('community_likes')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);
      
      if (error) throw error;
      return { success: true, liked: false };
    } else {
      // Like
      const { error } = await supabase
        .from('community_likes')
        .insert([{
          user_id: userId,
          post_id: postId
        }]);
      
      if (error) throw error;
      return { success: true, liked: true };
    }
  });
};

// Share plant completion or other gamification content to community
export const shareTooCommunity = async (userId, shareData) => {
  console.log('shareTooCommunity called with:', { userId, shareData });
  
  return safeCommunityOperation(async () => {
    const { type, plantData, content, hashtags = [] } = shareData;
    
    let postContent = content;
    let postTitle = '';
    let contentType = 'text';
    let sourceType = 'manual';
    let sourceId = null;
    let postHashtags = [...hashtags, 'wellness', 'plantgarden'];
    
    // Handle different sharing types
    switch (type) {
      case 'plant_completion':
        postTitle = `🌟 Plant Completed - Level ${plantData.final_growth_level}!`;
        postContent = content || `Just completed growing my ${plantData.plant_name}! Reached level ${plantData.final_growth_level} after ${Math.round((new Date(plantData.completion_date) - new Date(plantData.created_at)) / (1000 * 60 * 60 * 24))} days of care. 🌱✨`;
        contentType = 'plant_completion';
        sourceType = 'plant_completion';
        sourceId = plantData.id;
        postHashtags.push('achievement', 'growth', 'completed');
        break;
      case 'checkin_share':
        postTitle = '💭 Wellness Check-in';
        contentType = 'checkin';
        sourceType = 'checkin';
        sourceId = shareData.checkinId;
        postHashtags.push('checkin', 'mood', 'wellness');
        break;
      case 'anti_todo_share':
        postTitle = '✅ Anti-Todo Completed';
        contentType = 'anti_todo';
        sourceType = 'anti_todo';
        sourceId = shareData.antiTodoId;
        postHashtags.push('antitodo', 'productivity', 'wellness');
        break;
      default:
        postTitle = 'Wellness Update';
        postHashtags.push('general');
    }
    
    const insertData = {
      user_id: userId,
      content: postContent,
      title: postTitle,
      content_type: contentType,
      source_type: sourceType,
      source_id: sourceId,
      hashtags: postHashtags,
      is_public: true,
      created_at: new Date().toISOString()
    };
    
    console.log('Inserting community share:', insertData);
    
    const { data, error } = await supabase
      .from('community_posts')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      throw error;
    }
    
    console.log('Successfully shared to community:', data);
    return { data };
  });
};

// Get community feed with different tabs support
export const getCommunityFeed = async (userId, options = {}) => {
  return safeCommunityOperation(async () => {
    const { 
      limit = 20, 
      offset = 0, 
      algorithm = 'all_posts', // 'all_posts', 'friends', 'my_posts'
      hashtags = []
    } = options;

    let query;
    
    if (algorithm === 'friends') {
      // Get posts from friends only
      const { data, error } = await supabase.rpc('get_friends_feed', {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset
      });
      
      if (error) {
        console.warn('Friends feed failed, falling back to all posts:', error);
        return await getCommunityFeed(userId, { ...options, algorithm: 'all_posts' });
      }
      
      // Check if user has liked each post
      const postIds = data.map(post => post.post_id);
      if (postIds.length > 0) {
        const { data: userLikes, error: likesError } = await supabase
          .from('community_likes')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', postIds);
        
        if (!likesError) {
          const likedPostIds = new Set(userLikes.map(like => like.post_id));
          const postsWithLikeStatus = data.map(post => ({
            ...post,
            user_has_liked: likedPostIds.has(post.post_id)
          }));
          return { data: postsWithLikeStatus, hasMore: data.length === limit };
        }
      }
      
      return { data, hasMore: data.length === limit };
    } else if (algorithm === 'my_posts') {
      // Get user's own posts
      query = supabase
        .from('community_post_stats')
        .select('*')
        .eq('user_id', userId);
    } else {
      // All posts except user's own (original behavior for "For You" tab)
      // Use personalized feed if available, otherwise recent
      await ensureUserPreferences(userId);
      
      const { data, error } = await supabase.rpc('get_personalized_feed', {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset
      });
      
      if (error) {
        console.warn('Personalized feed failed, falling back to recent:', error);
        // Fallback to recent if personalized fails
        query = supabase
          .from('community_post_stats')
          .select('*')
          .neq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);
      } else {
        // Check if user has liked each post
        const postIds = data.map(post => post.post_id);
        if (postIds.length > 0) {
          const { data: userLikes, error: likesError } = await supabase
            .from('community_likes')
            .select('post_id')
            .eq('user_id', userId)
            .in('post_id', postIds);
          
          if (!likesError) {
            const likedPostIds = new Set(userLikes.map(like => like.post_id));
            const postsWithLikeStatus = data.map(post => ({
              ...post,
              user_has_liked: likedPostIds.has(post.post_id)
            }));
            return { data: postsWithLikeStatus, hasMore: data.length === limit };
          }
        }
        
        return { data, hasMore: data.length === limit };
      }
    }
    
    // For non-personalized queries
    if (query) {
      // Filter by hashtags if provided
      if (hashtags.length > 0) {
        query = query.overlaps('hashtags', hashtags);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Check if user has liked each post
      const postIds = data.map(post => post.post_id);
      if (postIds.length > 0) {
        const { data: userLikes, error: likesError } = await supabase
          .from('community_likes')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', postIds);
        
        if (likesError) throw likesError;
        
        const likedPostIds = new Set(userLikes.map(like => like.post_id));
        
        const postsWithLikeStatus = data.map(post => ({
          ...post,
          user_has_liked: likedPostIds.has(post.post_id)
        }));
        
        return { data: postsWithLikeStatus, hasMore: data.length === limit };
      }
      
      return { data, hasMore: data.length === limit };
    }
  });
};

// Get trending hashtags
export const getTrendingHashtags = async (limit = 10) => {
  return safeCommunityOperation(async () => {
    const { data, error } = await supabase
      .from('community_posts')
      .select('hashtags')
      .eq('is_public', true)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days
    
    if (error) throw error;
    
    // Count hashtag frequency
    const hashtagCounts = {};
    data.forEach(post => {
      if (post.hashtags) {
        post.hashtags.forEach(tag => {
          hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
        });
      }
    });
    
    // Sort by frequency and return top hashtags
    const sortedHashtags = Object.entries(hashtagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([tag]) => tag);
    
    return { data: sortedHashtags };
  });
};

// Search posts by content or hashtags
export const searchPosts = async (query, userId, limit = 20, offset = 0) => {
  return safeCommunityOperation(async () => {
    const { data, error } = await supabase
      .from('community_post_stats')
      .select('*')
      .or(`content.ilike.%${query}%,title.ilike.%${query}%`)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    // Check if user has liked each post
    const postIds = data.map(post => post.post_id);
    if (postIds.length > 0) {
      const { data: userLikes, error: likesError } = await supabase
        .from('community_likes')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postIds);
      
      if (!likesError) {
        const likedPostIds = new Set(userLikes.map(like => like.post_id));
        const postsWithLikeStatus = data.map(post => ({
          ...post,
          user_has_liked: likedPostIds.has(post.post_id)
        }));
        return { data: postsWithLikeStatus, hasMore: data.length === limit };
      }
    }
    
    return { data, hasMore: data.length === limit };
  });
};

// Delete a post
export const deletePost = async (userId, postId) => {
  return safeCommunityOperation(async () => {
    // First check if user owns the post
    const { data: post, error: fetchError } = await supabase
      .from('community_posts')
      .select('user_id')
      .eq('id', postId)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (post.user_id !== userId) {
      throw new Error('Unauthorized to delete this post');
    }
    
    // Delete the post (cascade will handle likes and comments)
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
    return { success: true };
  });
};

// Get suggested friends
export const getSuggestedFriends = async (userId, limit = 10) => {
  return safeCommunityOperation(async () => {
    const { data, error } = await supabase.rpc('get_suggested_friends', {
      p_user_id: userId,
      p_limit: limit
    });
    
    if (error) throw error;
    return { data };
  });
};

// Toggle follow/unfollow user
export const toggleUserFollow = async (followerId, followingId) => {
  return safeCommunityOperation(async () => {
    // Check if already following
    const { data: existing, error: checkError } = await supabase
      .from('user_relationships')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    
    if (existing) {
      // Unfollow
      const { error } = await supabase
        .from('user_relationships')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);
      
      if (error) throw error;
      return { success: true, following: false };
    } else {
      // Follow
      const { error } = await supabase
        .from('user_relationships')
        .insert([{
          follower_id: followerId,
          following_id: followingId,
          status: 'accepted' // Auto-accept for now
        }]);
      
      if (error) throw error;
      return { success: true, following: true };
    }
  });
};

// Check if user is following another user
export const isUserFollowing = async (followerId, followingId) => {
  return safeCommunityOperation(async () => {
    const { data, error } = await supabase
      .from('user_relationships')
      .select('status')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    return { 
      data: data ? data.status === 'accepted' : false 
    };
  });
};

// Helper function to ensure user preferences exist
const ensureUserPreferences = async (userId) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code === 'PGRST116') {
    // Create default preferences
    await supabase
      .from('user_preferences')
      .insert([{
        user_id: userId,
        preferred_content_types: ['text', 'anti_todo', 'checkin'],
        preferred_hashtags: ['wellness', 'mindfulness'],
        feed_algorithm: 'personalized'
      }]);
  }
}; 