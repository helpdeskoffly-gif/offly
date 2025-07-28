-- Missing database functions for community features

-- Function to get friends feed
CREATE OR REPLACE FUNCTION get_friends_feed(p_user_id UUID, p_limit INTEGER DEFAULT 20, p_offset INTEGER DEFAULT 0)
RETURNS TABLE (
  post_id UUID,
  user_id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  content TEXT,
  title TEXT,
  content_type TEXT,
  source_type TEXT,
  source_id UUID,
  hashtags TEXT[],
  is_public BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  like_count BIGINT,
  comment_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id as post_id,
    cp.user_id,
    u.username,
    u.full_name,
    u.avatar_url,
    cp.content,
    cp.title,
    cp.content_type,
    cp.source_type,
    cp.source_id,
    cp.hashtags,
    cp.is_public,
    cp.created_at,
    cp.updated_at,
    COALESCE(like_counts.like_count, 0) as like_count,
    0 as comment_count
  FROM community_posts cp
  JOIN users u ON cp.user_id = u.id
  JOIN user_relationships ur ON cp.user_id = ur.following_id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as like_count
    FROM community_likes
    GROUP BY post_id
  ) like_counts ON cp.id = like_counts.post_id
  WHERE ur.follower_id = p_user_id 
    AND ur.status = 'accepted'
    AND cp.is_public = true
  ORDER BY cp.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get personalized feed
CREATE OR REPLACE FUNCTION get_personalized_feed(p_user_id UUID, p_limit INTEGER DEFAULT 20, p_offset INTEGER DEFAULT 0)
RETURNS TABLE (
  post_id UUID,
  user_id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  content TEXT,
  title TEXT,
  content_type TEXT,
  source_type TEXT,
  source_id UUID,
  hashtags TEXT[],
  is_public BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  like_count BIGINT,
  comment_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id as post_id,
    cp.user_id,
    u.username,
    u.full_name,
    u.avatar_url,
    cp.content,
    cp.title,
    cp.content_type,
    cp.source_type,
    cp.source_id,
    cp.hashtags,
    cp.is_public,
    cp.created_at,
    cp.updated_at,
    COALESCE(like_counts.like_count, 0) as like_count,
    0 as comment_count
  FROM community_posts cp
  JOIN users u ON cp.user_id = u.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as like_count
    FROM community_likes
    GROUP BY post_id
  ) like_counts ON cp.id = like_counts.post_id
  WHERE cp.is_public = true
    AND cp.user_id != p_user_id
  ORDER BY cp.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get suggested friends
CREATE OR REPLACE FUNCTION get_suggested_friends(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  hobby_match_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.username,
    u.full_name,
    u.avatar_url,
    u.bio,
    COALESCE(hobby_matches.match_count, 0) as hobby_match_count
  FROM users u
  LEFT JOIN (
    SELECT 
      u2.id,
      COUNT(*) as match_count
    FROM users u1
    JOIN users u2 ON u1.hobbies && u2.hobbies
    WHERE u1.id = p_user_id 
      AND u2.id != p_user_id
      AND u2.hobbies IS NOT NULL
      AND array_length(u2.hobbies, 1) > 0
    GROUP BY u2.id
  ) hobby_matches ON u.id = hobby_matches.id
  WHERE u.id != p_user_id
    AND u.id NOT IN (
      SELECT following_id 
      FROM user_relationships 
      WHERE follower_id = p_user_id
    )
  ORDER BY hobby_match_count DESC, u.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create community_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID NULL,
  created_at TIMESTAMPTZ NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NULL DEFAULT NOW(),
  CONSTRAINT community_comments_pkey PRIMARY KEY (id),
  CONSTRAINT community_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT community_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  CONSTRAINT community_comments_parent_fkey FOREIGN KEY (parent_comment_id) REFERENCES community_comments(id) ON DELETE CASCADE
);

-- Create indexes for community_comments
CREATE INDEX IF NOT EXISTS idx_community_comments_user_id ON community_comments USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments USING btree (post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_parent_id ON community_comments USING btree (parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_created_at ON community_comments USING btree (created_at);

-- Add trigger for updated_at
CREATE TRIGGER update_community_comments_updated_at 
  BEFORE UPDATE ON community_comments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 