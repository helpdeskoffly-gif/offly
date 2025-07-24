import { supabase } from "../supabase";

// Random avatar collection - using diverse, colorful avatars
const RANDOM_AVATARS = [
  // Geometric/Abstract avatars
  "https://api.dicebear.com/7.x/shapes/svg?seed=1&backgroundColor=3b82f6",
  "https://api.dicebear.com/7.x/shapes/svg?seed=2&backgroundColor=ef4444", 
  "https://api.dicebear.com/7.x/shapes/svg?seed=3&backgroundColor=10b981",
  "https://api.dicebear.com/7.x/shapes/svg?seed=4&backgroundColor=f59e0b",
  "https://api.dicebear.com/7.x/shapes/svg?seed=5&backgroundColor=8b5cf6",
  "https://api.dicebear.com/7.x/shapes/svg?seed=6&backgroundColor=06b6d4",
  "https://api.dicebear.com/7.x/shapes/svg?seed=7&backgroundColor=f97316",
  "https://api.dicebear.com/7.x/shapes/svg?seed=8&backgroundColor=ec4899",
  
  // Identicon style avatars
  "https://api.dicebear.com/7.x/identicon/svg?seed=user1&backgroundColor=6366f1",
  "https://api.dicebear.com/7.x/identicon/svg?seed=user2&backgroundColor=8b5cf6",
  "https://api.dicebear.com/7.x/identicon/svg?seed=user3&backgroundColor=06b6d4",
  "https://api.dicebear.com/7.x/identicon/svg?seed=user4&backgroundColor=10b981",
  "https://api.dicebear.com/7.x/identicon/svg?seed=user5&backgroundColor=f59e0b",
  "https://api.dicebear.com/7.x/identicon/svg?seed=user6&backgroundColor=ef4444",
  
  // Bottts style (robot avatars)
  "https://api.dicebear.com/7.x/bottts/svg?seed=robot1&backgroundColor=1f2937",
  "https://api.dicebear.com/7.x/bottts/svg?seed=robot2&backgroundColor=374151",
  "https://api.dicebear.com/7.x/bottts/svg?seed=robot3&backgroundColor=4b5563",
  "https://api.dicebear.com/7.x/bottts/svg?seed=robot4&backgroundColor=6b7280",
  
  // Avataaars style (human-like)
  "https://api.dicebear.com/7.x/avataaars/svg?seed=person1",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=person2",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=person3",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=person4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=person5",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=person6",
  
  // Big Smile style
  "https://api.dicebear.com/7.x/big-smile/svg?seed=happy1&backgroundColor=fbbf24",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=happy2&backgroundColor=34d399",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=happy3&backgroundColor=60a5fa",
  "https://api.dicebear.com/7.x/big-smile/svg?seed=happy4&backgroundColor=a78bfa",
  
  // Additional diverse options
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=fun1",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=fun2", 
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=fun3",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=fun4"
];

/**
 * Get a random avatar URL from the predefined collection
 * @returns {string} Random avatar URL
 */
export const getRandomAvatar = () => {
  const randomIndex = Math.floor(Math.random() * RANDOM_AVATARS.length);
  return RANDOM_AVATARS[randomIndex];
};

/**
 * Get avatar URL for a user - priority: custom upload > saved random avatar > fallback
 * @param {Object} user - User object from auth
 * @param {Object} userProfile - User profile from database
 * @returns {string} Avatar URL
 */
export const getUserAvatarUrl = (user, userProfile) => {
  // 1. Check if user has uploaded custom avatar (stored in database)
  // Custom uploads will be Supabase storage URLs
  if (userProfile?.avatar_url && userProfile.avatar_url.includes('supabase')) {
    return userProfile.avatar_url;
  }
  
  // 2. Check if user has assigned random avatar saved in database
  // Random avatars will be DiceBear URLs - use the saved one
  if (userProfile?.avatar_url && userProfile.avatar_url.includes('dicebear')) {
    return userProfile.avatar_url;
  }
  
  // 3. Fallback - return a consistent placeholder while avatar is being assigned
  // Use the first avatar in our collection as a stable fallback
  return RANDOM_AVATARS[0];
};

/**
 * Upload avatar file to Supabase storage
 * @param {File} file - Avatar image file
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadAvatar = async (file, userId) => {
  try {
    console.log('🔄 Starting avatar upload for user:', userId);
    
    // Validate file
    if (!file) {
      return { success: false, error: "No file provided" };
    }
    
    console.log('📁 File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "File size must be less than 5MB" };
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: "File must be an image" };
    }
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = fileName; // Remove the 'avatars/' prefix since bucket is already 'avatars'
    
    console.log('📝 Upload details:', {
      fileName,
      filePath,
      bucket: 'avatars'
    });
    
    // First check if bucket exists
    try {
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      console.log('🪣 Available buckets:', buckets?.map(b => b.name));
      
      if (bucketError) {
        console.error('❌ Error checking buckets:', bucketError);
      }
      
      const avatarBucket = buckets?.find(b => b.name === 'avatars');
      if (!avatarBucket) {
        console.error('❌ Avatars bucket not found!');
        return { success: false, error: "Storage bucket 'avatars' does not exist. Please create it in your Supabase dashboard." };
      }
      
      console.log('✅ Avatars bucket found:', avatarBucket);
    } catch (bucketCheckError) {
      console.error('❌ Failed to check buckets:', bucketCheckError);
    }
    
    // Upload to Supabase storage
    console.log('🚀 Uploading file...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }
    
    console.log('✅ Upload successful:', uploadData);
    
    // Get public URL
    console.log('🔗 Getting public URL...');
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    console.log('🔗 Public URL data:', urlData);
    
    if (!urlData?.publicUrl) {
      return { success: false, error: "Failed to get public URL" };
    }
    
    console.log('✅ Avatar upload complete:', urlData.publicUrl);
    return { success: true, url: urlData.publicUrl };
    
  } catch (error) {
    console.error('❌ Avatar upload error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete avatar from Supabase storage
 * @param {string} avatarUrl - Avatar URL to delete
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteAvatar = async (avatarUrl) => {
  try {
    console.log('🗑️ Starting avatar deletion for URL:', avatarUrl);
    
    // Extract file path from URL
    if (!avatarUrl || !avatarUrl.includes('supabase')) {
      console.log('ℹ️ Not a Supabase storage file, skipping deletion');
      return { success: true }; // Not a Supabase storage file, nothing to delete
    }
    
    // Extract path from URL
    const urlParts = avatarUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = fileName; // Use just the filename, not avatars/filename
    
    console.log('🗑️ Deleting file:', { fileName, filePath });
    
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);
    
    if (error) {
      console.error('❌ Delete error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Avatar deleted successfully');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Avatar delete error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update user's avatar URL in database
 * @param {string} userId - User ID
 * @param {string} avatarUrl - New avatar URL
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const updateUserAvatar = async (userId, avatarUrl) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ 
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Database update error:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Avatar update error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Assign a random avatar to a new user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, avatarUrl?: string, error?: string}>}
 */
export const assignRandomAvatar = async (userId) => {
  try {
    const randomAvatarUrl = getRandomAvatar();
    const result = await updateUserAvatar(userId, randomAvatarUrl);
    
    if (result.success) {
      return { success: true, avatarUrl: randomAvatarUrl };
    } else {
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('Random avatar assignment error:', error);
    return { success: false, error: error.message };
  }
}; 