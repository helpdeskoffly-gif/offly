import { supabase } from '../supabase';

// Helper for safe operations
const safeCommunityOperation = async (operation) => {
  try {
    const result = await operation();
    return { success: true, ...result };
  } catch (error) {
    console.error('Community operation error:', error);
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

// Share an anti-todo item to community
export const shareAntiTodoToCommunity = async (userId, antiTodoItem, additionalText = '') => {
  console.log('shareAntiTodoToCommunity called with:', { userId, antiTodoItem, additionalText });
  
  return safeCommunityOperation(async () => {
    const content = additionalText 
      ? `${additionalText}\n\n🎯 ${antiTodoItem.content}` 
      : `🎯 ${antiTodoItem.content}`;
    
    const hashtags = ['wellness', 'antitodo', 'mindfulness'];
    
    console.log('Creating community post with data:', {
      content,
      title: 'Wellness Activity Completed! 🌟',
      contentType: 'anti_todo',
      sourceType: 'anti_todo',
      sourceId: antiTodoItem.id,
      hashtags
    });
    
    const result = await createCommunityPost(userId, {
      content: content,
      title: 'Wellness Activity Completed! 🌟',
      contentType: 'anti_todo',
      sourceType: 'anti_todo',
      sourceId: antiTodoItem.id,
      hashtags: hashtags
    });
    
    console.log('createCommunityPost result:', result);
    return result;
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

// Share checkin to community (specific function for checkins)
export const shareCheckinToCommunity = async (userId, checkinData) => {
  return shareTooCommunity(userId, {
    type: 'checkin_share',
    checkinId: checkinData.id,
    content: `Feeling ${checkinData.mood_emoji} today! ${checkinData.mood_text ? `"${checkinData.mood_text}"` : ''}`,
    hashtags: ['mood', 'checkin']
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

// Follow/unfollow a user
export const toggleUserFollow = async (followerId, followingId) => {
  return safeCommunityOperation(async () => {
    // Check if relationship already exists
    const { data: existingRelation, error: checkError } = await supabase
      .from('user_relationships')
      .select('id, status')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingRelation) {
      // Unfollow
      const { error: deleteError } = await supabase
        .from('user_relationships')
        .delete()
        .eq('id', existingRelation.id);
      
      if (deleteError) throw deleteError;
      return { action: 'unfollowed', following: false };
    } else {
      // Follow
      const { data, error: insertError } = await supabase
        .from('user_relationships')
        .insert([{
          follower_id: followerId,
          following_id: followingId,
          status: 'accepted', // Auto-accept for now, can be changed to 'pending' for friend requests
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      return { action: 'followed', following: true, data };
    }
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

// Get user's friends/following
export const getUserFriends = async (userId, type = 'following') => {
  return safeCommunityOperation(async () => {
    let query = supabase
      .from('user_relationships')
      .select(`
        *,
        following:users!following_id (
          id,
          username,
          full_name,
          avatar_url,
          bio
        ),
        follower:users!follower_id (
          id,
          username,
          full_name,
          avatar_url,
          bio
        )
      `)
      .eq('status', 'accepted');
    
    if (type === 'following') {
      query = query.eq('follower_id', userId);
    } else {
      query = query.eq('following_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return { data };
  });
};

// Check if user is following another user
export const isUserFollowing = async (followerId, followingId) => {
  return safeCommunityOperation(async () => {
    const { data, error } = await supabase
      .from('user_relationships')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .eq('status', 'accepted')
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return { following: !!data };
  });
};

// Toggle like on a post
export const togglePostLike = async (userId, postId) => {
  return safeCommunityOperation(async () => {
    // Check if user already liked the post
    const { data: existingLike, error: checkError } = await supabase
      .from('community_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingLike) {
      // Unlike the post
      const { error: deleteError } = await supabase
        .from('community_likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (deleteError) throw deleteError;
      return { action: 'unliked', liked: false };
    } else {
      // Like the post
      const { data, error: insertError } = await supabase
        .from('community_likes')
        .insert([{
          user_id: userId,
          post_id: postId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      return { action: 'liked', liked: true, data };
    }
  });
};

// Get user's own posts
export const getUserPosts = async (userId, options = {}) => {
  return safeCommunityOperation(async () => {
    const { limit = 20, offset = 0 } = options;
    
    const { data, error } = await supabase
      .from('community_post_stats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return { data, hasMore: data.length === limit };
  });
};

// Delete a post (only by the author)
export const deletePost = async (userId, postId) => {
  return safeCommunityOperation(async () => {
    const { data, error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId) // Ensure only the author can delete
      .select()
      .single();
    
    if (error) throw error;
    return { data };
  });
};

// Get or create user preferences
export const getUserPreferences = async (userId) => {
  return safeCommunityOperation(async () => {
    let { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // Create default preferences if none exist
      const { data: newPrefs, error: createError } = await supabase
        .from('user_preferences')
        .insert([{
          user_id: userId,
          preferred_content_types: ['text', 'anti_todo', 'checkin'],
          preferred_hashtags: ['wellness', 'mindfulness'],
          feed_algorithm: 'recent'
        }])
        .select()
        .single();
      
      if (createError) throw createError;
      return { data: newPrefs };
    }
    
    if (error) throw error;
    return { data };
  });
};

// Update user preferences
export const updateUserPreferences = async (userId, preferences) => {
  return safeCommunityOperation(async () => {
    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return { data };
  });
};

// Ensure user has preferences (helper function)
const ensureUserPreferences = async (userId) => {
  return safeCommunityOperation(async () => {
    // Check if user preferences exist
    const { data: existingPrefs, error: fetchError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      // Get user's hobbies to create smart defaults
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('hobbies')
        .eq('id', userId)
        .single();

      const userHobbies = userProfile?.hobbies || [];
      
      // Create default preferences based on user's hobbies
      const defaultHashtags = ['wellness', 'mindfulness'];
      if (userHobbies.includes('fitness')) defaultHashtags.push('fitness');
      if (userHobbies.includes('meditation')) defaultHashtags.push('meditation');
      if (userHobbies.includes('reading')) defaultHashtags.push('reading');
      if (userHobbies.includes('cooking')) defaultHashtags.push('cooking');
      if (userHobbies.includes('music')) defaultHashtags.push('music');
      
      const { data: newPrefs, error: createError } = await supabase
        .from('user_preferences')
        .insert([{
          user_id: userId,
          preferred_content_types: ['anti_todo', 'checkin'],
          preferred_hashtags: defaultHashtags,
          feed_algorithm: 'personalized'
        }])
        .select()
        .single();

      if (createError) throw createError;
      return { data: newPrefs };
    }

    if (fetchError) throw fetchError;
    return { data: existingPrefs };
  });
};

// Search posts by hashtags or content
export const searchPosts = async (query, options = {}) => {
  return safeCommunityOperation(async () => {
    const { limit = 20, offset = 0 } = options;
    
    let dbQuery = supabase
      .from('community_post_stats')
      .select('*');
    
    // Search in content or hashtags
    if (query) {
      dbQuery = dbQuery.or(`content.ilike.%${query}%,hashtags.cs.{${query}}`);
    }
    
    dbQuery = dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, error } = await dbQuery;
    if (error) throw error;
    
    return { data, hasMore: data.length === limit };
  });
};

// Get trending hashtags
export const getTrendingHashtags = async (limit = 10) => {
  return safeCommunityOperation(async () => {
    // This would ideally be a more sophisticated query that counts hashtag usage over time
    const { data, error } = await supabase
      .from('community_posts')
      .select('hashtags')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .limit(100);
    
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
    const trending = Object.entries(hashtagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
    
    return { data: trending };
  });
}; 