import { supabase } from '../supabase';
import { openaiService } from './openai';
import { saveAntiTodoList } from './database';

export const getAntiTodoList = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('anti_todo_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting anti-todo list:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error getting anti-todo list:', error);
    return [];
  }
};

export const addAntiTodoItem = async (userId, content, source = 'user') => {
  try {
    const { data, error } = await supabase
      .from('anti_todo_items')
      .insert([{ 
        user_id: userId, 
        content, 
        source,
        status: 'not started',
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Error adding anti-todo item:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Unexpected error adding anti-todo item:', error);
    return null;
  }
};

export const updateAntiTodoItemStatus = async (itemId, status) => {
  try {
    const updateData = { 
      status,
      updated_at: new Date().toISOString()
    };

    // Add completion timestamp if marking as completed
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('anti_todo_items')
      .update(updateData)
      .eq('id', itemId)
      .select();

    if (error) {
      console.error('Error updating anti-todo item status:', error);
      return null;
    }

    const updatedItem = data?.[0];

    // If activity was completed, update analytics and check achievements
    if (status === 'completed' && updatedItem) {
      try {
        const { updateUserAnalytics, awardPoints, getUserPlant, updatePlantGrowth, checkAndUnlockAchievements } = await import('./database');
        const { supabase } = await import('../supabase');
        
        // Update user analytics (includes anti-todo stats)
        await updateUserAnalytics(updatedItem.user_id);
        
        // Check for new achievements using the proper function
        await checkAndUnlockAchievements(updatedItem.user_id);
        
        // Award points for anti-todo completion
        try {
          const activityPoints = 10; // Simple 10 points for activity completion

          const pointsResult = await awardPoints(
            updatedItem.user_id, 
            activityPoints, 
            'anti_todo', 
            updatedItem.id, 
            'Activity completed'
          );
          
          if (pointsResult.success) {
            console.log(`Awarded ${activityPoints} points for anti-todo completion`);
            
            // Update plant growth with earned points
            let plantXp = 0;
            try {
              const plantResult = await getUserPlant(updatedItem.user_id);
              if (plantResult.success && plantResult.data) {
                plantXp = Math.floor(activityPoints / 2); // 1 XP per 2 points
                await updatePlantGrowth(plantResult.data.id, plantXp);
                console.log(`Added ${plantXp} XP to user's plant`);
              }
            } catch (plantError) {
              console.error("Failed to update plant growth:", plantError);
            }
            
            // Return updated item with points information
            return {
              ...updatedItem,
              pointsEarned: {
                total: activityPoints,
                plantXp: plantXp
              }
            };
          }
        } catch (pointsError) {
          console.error("Failed to award points for anti-todo completion:", pointsError);
        }
        
        console.log('✅ Analytics, achievements, and gamification updated after anti-todo completion');
      } catch (achievementError) {
        console.error('Error updating analytics/achievements after anti-todo completion:', achievementError);
        // Don't fail the status update if achievement check fails
      }
    }

    return updatedItem;
  } catch (error) {
    console.error('Unexpected error updating anti-todo item status:', error);
    return null;
  }
};

export const deleteAntiTodoItem = async (itemId) => {
  try {
    const { data, error } = await supabase
      .from('anti_todo_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting anti-todo item:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error deleting anti-todo item:', error);
    return null;
  }
};

/**
 * Check if user has any anti-todo items
 */
export const hasAntiTodoItems = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('anti_todo_items')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      console.error('Error checking anti-todo items:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Unexpected error checking anti-todo items:', error);
    return false;
  }
};

/**
 * Generate initial anti-todo items for new users
 */
export const generateInitialAntiTodos = async (userId) => {
  try {
    console.log('Generating initial anti-todos for user:', userId);

    // Check if user already has anti-todo items
    const hasItems = await hasAntiTodoItems(userId);
    if (hasItems) {
      console.log('User already has anti-todo items, skipping initial generation');
      return { success: true, data: [], message: 'User already has items' };
    }

    // Get user preferences (hobbies)
    const { data: userProfile, error: userProfileError } = await supabase
      .from('users')
      .select('hobbies, username, full_name')
      .eq('id', userId)
      .single();

    if (userProfileError) {
      console.error('Error fetching user profile for initial generation:', userProfileError);
      // Continue with default generation even if profile fetch fails
    }

    const userHobbies = userProfile?.hobbies || [];
    const userName = userProfile?.username || userProfile?.full_name || 'User';

    console.log('User hobbies for initial generation:', userHobbies);

    // Generate initial activities with AI
    const aiResult = await openaiService.generateAntiToDoActivities(
      { 
        hobbies: userHobbies,
        username: userName,
        isInitial: true 
      },
      [], // No previous activities for new users
      5   // Generate 5 initial activities
    );

    if (!aiResult.success || !aiResult.activities || aiResult.activities.length === 0) {
      console.error('AI failed to generate initial activities:', aiResult.error);
      
      // Fallback to default activities if AI fails
      const defaultActivities = [
        { content: "Take a 10-minute walk outside and notice three beautiful things" },
        { content: "Call a friend or family member you haven't spoken to in a while" },
        { content: "Try cooking a new recipe or experimenting with ingredients" },
        { content: "Spend 15 minutes doing something creative (draw, write, sing, dance)" },
        { content: "Practice gratitude by writing down three things you're thankful for" }
      ];
      
      // Add default items to database
      const newItems = [];
      for (const activity of defaultActivities) {
        const item = await addAntiTodoItem(userId, activity.content, 'ai');
        if (item) newItems.push(item);
      }
      
      console.log('Added default anti-todo items:', newItems.length);
      return { success: true, data: newItems, message: 'Generated default activities' };
    }

    // Add AI-generated items to database
    const newItems = [];
    for (const activity of aiResult.activities) {
      const item = await addAntiTodoItem(userId, activity.content, 'ai');
      if (item) newItems.push(item);
    }

    console.log('Added AI-generated anti-todo items:', newItems.length);
    return { success: true, data: newItems, message: 'Generated AI activities' };

  } catch (error) {
    console.error('Unexpected error during initial anti-todo generation:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Smart regeneration that considers user preferences and protects ongoing activities
 */
export const regenerateAntiTodoList = async (userId) => {
  try {
    console.log('Regenerating anti-todo list for user:', userId);

    // 1. Get current items to identify ongoing ones
    const currentItems = await getAntiTodoList(userId);
    const ongoingItems = currentItems.filter(item => item.status === 'ongoing');
    
    console.log(`Found ${ongoingItems.length} ongoing items to protect`);

    // 2. Fetch user preferences (hobbies)
    const { data: userProfile, error: userProfileError } = await supabase
      .from('users')
      .select('hobbies, username, full_name')
      .eq('id', userId)
      .single();

    if (userProfileError) {
      console.error('Error fetching user profile for regeneration:', userProfileError);
      return { success: false, error: 'Failed to fetch user preferences' };
    }

    const userHobbies = userProfile?.hobbies || [];
    const userName = userProfile?.username || userProfile?.full_name || 'User';

    console.log('User hobbies for regeneration:', userHobbies);

    // 3. Fetch completed activities for AI context
    const { data: completedItems, error: completedItemsError } = await supabase
      .from('anti_todo_items')
      .select('content, completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(20); // Get last 20 completed activities

    if (completedItemsError) {
      console.error('Error fetching completed anti-todo items:', completedItemsError);
      // Continue without completed activities context
    }

    const completedActivities = completedItems?.map(item => item.content) || [];
    console.log(`Found ${completedActivities.length} completed activities for context`);

    // 4. Get ongoing activities to avoid duplicates
    const ongoingActivities = ongoingItems.map(item => item.content);

    // 5. Generate new activities with AI
    const aiResult = await openaiService.generateAntiToDoActivities(
      { 
        hobbies: userHobbies,
        username: userName,
        isRegeneration: true 
      },
      [...completedActivities, ...ongoingActivities], // Avoid duplicating completed or ongoing
      5 // Number of new activities to generate
    );

    if (!aiResult.success || !aiResult.activities || aiResult.activities.length === 0) {
      console.error('AI failed to generate activities during regeneration:', aiResult.error);
      return { success: false, error: 'Failed to generate new activities' };
    }

    // 6. Get current completion count before deleting items
    const currentCompletionCount = completedItems?.length || 0;
    console.log(`Current completion count before regeneration: ${currentCompletionCount}`);
    
    // 6. Delete ONLY "not started" and "completed" items (preserve ongoing)
    const { error: deleteError } = await supabase
      .from('anti_todo_items')
      .delete()
      .eq('user_id', userId)
      .in('status', ['not started', 'completed'])
      .eq('source', 'ai'); // Only delete AI-generated items

    if (deleteError) {
      console.error('Error deleting old anti-todo items:', deleteError);
      // Continue even if deletion fails, as adding new items is more critical
    } else {
      console.log('Deleted old "not started" and "completed" AI items');
    }

    // 7. Update user analytics to preserve the completion count
    try {
      const { updateUserAnalytics } = await import('./database');
      await updateUserAnalytics(userId);
    } catch (analyticsError) {
      console.error('Error updating analytics after regeneration:', analyticsError);
    }

    // 7. Add new AI-generated items
    const newItems = [];
    for (const activity of aiResult.activities) {
      const item = await addAntiTodoItem(userId, activity.content, 'ai');
      if (item) newItems.push(item);
    }

    console.log(`Regeneration complete: Added ${newItems.length} new items, preserved ${ongoingItems.length} ongoing items`);

    return { 
      success: true, 
      data: newItems,
      message: `Generated ${newItems.length} new activities, preserved ${ongoingItems.length} ongoing activities`
    };

  } catch (error) {
    console.error('Unexpected error during anti-todo regeneration:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get anti-todo statistics for a user
 */
export const getAntiTodoStats = async (userId) => {
  try {
    const items = await getAntiTodoList(userId);
    
    return {
      total: items.length,
      notStarted: items.filter(item => item.status === 'not started').length,
      ongoing: items.filter(item => item.status === 'ongoing').length,
      completed: items.filter(item => item.status === 'completed').length,
      aiGenerated: items.filter(item => item.source === 'ai').length,
      userCreated: items.filter(item => item.source === 'user').length,
    };
  } catch (error) {
    console.error('Error getting anti-todo stats:', error);
    return {
      total: 0,
      notStarted: 0,
      ongoing: 0,
      completed: 0,
      aiGenerated: 0,
      userCreated: 0,
    };
  }
};