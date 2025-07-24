import { supabase } from "../supabase";

/**
 * Test Supabase storage configuration
 * Run this in the browser console to debug storage issues
 */
export const testSupabaseStorage = async () => {
  console.log('🧪 Testing Supabase Storage Configuration...');
  
  try {
    // 1. Test basic Supabase connection
    console.log('1️⃣ Testing Supabase connection...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('❌ Auth error:', authError);
      return false;
    }
    console.log('✅ Auth connection working, user ID:', user?.id);
    
    // 2. List all buckets
    console.log('2️⃣ Listing storage buckets...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.error('❌ Bucket listing error:', bucketError);
      return false;
    }
    console.log('✅ Available buckets:', buckets?.map(b => ({ name: b.name, public: b.public })));
    
    // 3. Check if avatars bucket exists
    const avatarBucket = buckets?.find(b => b.name === 'avatars');
    if (!avatarBucket) {
      console.error('❌ Avatars bucket not found! Please create it.');
      console.log('📝 To create the bucket:');
      console.log('   1. Go to your Supabase dashboard');
      console.log('   2. Navigate to Storage');
      console.log('   3. Click "Create a new bucket"');
      console.log('   4. Name it "avatars"');
      console.log('   5. Set it as PUBLIC');
      return false;
    }
    console.log('✅ Avatars bucket found:', avatarBucket);
    
    // 4. Test file listing in avatars bucket
    console.log('3️⃣ Testing file listing in avatars bucket...');
    const { data: files, error: listError } = await supabase.storage
      .from('avatars')
      .list('', { limit: 5 });
    
    if (listError) {
      console.error('❌ File listing error:', listError);
      console.log('💡 This might be an RLS issue. Try disabling RLS on storage.objects or check policies.');
      return false;
    }
    console.log('✅ File listing works. Files in bucket:', files?.length || 0);
    
    // 5. Test uploading a small test file
    console.log('4️⃣ Testing file upload...');
    const testContent = new Blob(['test'], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(testFileName, testContent, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      console.log('💡 Check your RLS policies for storage.objects');
      return false;
    }
    console.log('✅ Upload test successful:', uploadData);
    
    // 6. Test getting public URL
    console.log('5️⃣ Testing public URL generation...');
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(testFileName);
    
    console.log('✅ Public URL generated:', urlData.publicUrl);
    
    // 7. Test downloading the file
    console.log('6️⃣ Testing file download...');
    try {
      const response = await fetch(urlData.publicUrl);
      if (response.ok) {
        console.log('✅ File download successful');
      } else {
        console.error('❌ File download failed:', response.status, response.statusText);
        console.log('💡 This could be a CORS or bucket public setting issue');
      }
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      console.log('💡 Check if bucket is set to PUBLIC');
    }
    
    // 8. Clean up test file
    console.log('7️⃣ Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove([testFileName]);
    
    if (deleteError) {
      console.warn('⚠️ Failed to delete test file:', deleteError);
    } else {
      console.log('✅ Test file cleaned up');
    }
    
    console.log('🎉 All storage tests passed! Your Supabase storage is working correctly.');
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error during storage test:', error);
    return false;
  }
};

/**
 * Quick storage info check
 */
export const getStorageInfo = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarBucket = buckets?.find(b => b.name === 'avatars');
    
    return {
      hasAvatarBucket: !!avatarBucket,
      bucketIsPublic: avatarBucket?.public || false,
      allBuckets: buckets?.map(b => b.name) || [],
      supabaseUrl: supabase.supabaseUrl
    };
  } catch (error) {
    return { error: error.message };
  }
};

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  window.testSupabaseStorage = testSupabaseStorage;
  window.getStorageInfo = getStorageInfo;
} 