# Offly Technical Documentation

## 🗄️ Database Schema & Architecture

### Database Overview

The application uses Supabase (PostgreSQL) with the following key design principles:
- **Row Level Security (RLS)**: User-specific data access
- **Optimized Indexes**: Fast query performance
- **Real-time Subscriptions**: Live updates across the application
- **Normalized Design**: Proper data relationships and constraints

### Core Tables Structure

#### 1. Users & Authentication (`users`)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  hobbies TEXT[],
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Store user profiles and preferences
**Key Features**:
- Links to Supabase Auth users
- Stores user hobbies for AI personalization
- Tracks profile completion status

#### 2. User Analytics (`user_analytics`)

```sql
CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  username TEXT,
  total_checkins INTEGER DEFAULT 0,
  average_mood_score DECIMAL(3,2) DEFAULT 0,
  overall_average_sentiment DECIMAL(3,2) DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  weekly_unique_checkin_days INTEGER DEFAULT 0,
  weekly_score INTEGER DEFAULT 0,
  completedantitodos INTEGER DEFAULT 0,
  weeklyantitodos INTEGER DEFAULT 0,
  last_checkin_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Comprehensive user statistics and progress tracking
**Key Features**:
- Real-time streak calculation
- Weekly activity tracking
- Mood score averaging
- Anti-todo completion statistics

#### 3. Mood Check-ins (`checkins`)

```sql
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  mood_text TEXT,
  mood_emoji TEXT,
  sentiment_score DECIMAL(2,1) CHECK (sentiment_score >= 1 AND sentiment_score <= 5),
  ai_score DECIMAL(3,2),
  checkin_date DATE NOT NULL,
  checkin_time TIME,
  hashtags TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Store daily mood check-ins with AI analysis
**Key Features**:
- 4-hour cooldown between check-ins
- AI sentiment analysis integration
- Emoji and text mood tracking
- Hashtag support for categorization

#### 4. Anti-Todo System (`anti_todo_items`)

```sql
CREATE TABLE anti_todo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  list_id UUID REFERENCES anti_todo_lists(id),
  content TEXT NOT NULL,
  status TEXT CHECK (status IN ('not started', 'ongoing', 'completed', 'stopped')) DEFAULT 'not started',
  source TEXT CHECK (source IN ('user', 'ai')) DEFAULT 'ai',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
```

**Purpose**: AI-generated wellness activities
**Key Features**:
- AI-generated personalized activities
- Status tracking (not started, ongoing, completed, stopped)
- Source tracking (user vs AI generated)
- Completion timestamps

#### 5. Gamification System

##### Points System (`user_points`)
```sql
CREATE TABLE user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  total_points INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

##### Point Transactions (`point_transactions`)
```sql
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  points INTEGER NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('earned', 'spent')),
  source_type TEXT,
  source_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

##### Achievements (`achievements`)
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  achievement_icon TEXT,
  achievement_category TEXT,
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  points_reward INTEGER DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

#### 6. Plant Growth System

##### User Plants (`user_plants`)
```sql
CREATE TABLE user_plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  plant_name TEXT NOT NULL,
  plant_type TEXT DEFAULT 'basic_seed',
  growth_level INTEGER DEFAULT 1 CHECK (growth_level >= 1 AND growth_level <= 4),
  growth_xp INTEGER DEFAULT 0,
  growth_xp_required INTEGER DEFAULT 100,
  decorations JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, is_active) WHERE is_active = TRUE
);
```

##### Plant History (`plant_history`)
```sql
CREATE TABLE plant_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  plant_name TEXT NOT NULL,
  plant_type TEXT,
  final_growth_level INTEGER,
  final_decorations JSONB,
  growth_duration BIGINT,
  total_care_actions INTEGER DEFAULT 0,
  completion_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

##### Plant Store (`plant_store_items`)
```sql
CREATE TABLE plant_store_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  item_type TEXT CHECK (item_type IN ('water', 'fertilizer', 'decoration')),
  effect_value INTEGER,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 7. Community Features

##### Community Posts (`community_posts`)
```sql
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  hashtags TEXT[],
  is_public BOOLEAN DEFAULT TRUE,
  source_type TEXT,
  source_id UUID,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

##### Community Likes (`community_likes`)
```sql
CREATE TABLE community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  post_id UUID REFERENCES community_posts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);
```

## 🔄 Data Flow & Processes

### 1. User Onboarding Process

```javascript
// 1. User signs up via Supabase Auth
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: userData }
});

// 2. Create user profile
await createSignupUser(uid, email, displayName, additionalData);

// 3. Initialize analytics
const analyticsData = {
  user_id: uid,
  username: displayName,
  daily_checkin_counter: 0,
  total_checkins: 0,
  // ... other default values
};

// 4. Assign random avatar
await assignRandomAvatar(uid);

// 5. Generate initial anti-todo activities
await generateInitialAntiTodos(uid);
```

### 2. Mood Check-in Process

```javascript
// 1. Validate cooldown period
const cooldownResult = await canUserCheckin(uid);
if (!cooldownResult.canCheckin) {
  return { error: "Please wait before next check-in" };
}

// 2. Analyze sentiment using AI
const sentimentAnalysis = await openaiService.analyzeCustomerSentiment(
  moodEmoji, 
  moodText, 
  userProfile
);

// 3. Create check-in record
const checkinRecord = {
  user_id: uid,
  mood_score: moodScore,
  mood_text: moodText,
  sentiment_score: sentimentAnalysis.sentiment_score,
  mood_emoji: moodEmoji,
  checkin_date: new Date().toISOString().split("T")[0],
  created_at: new Date().toISOString()
};

// 4. Insert check-in
const result = await supabaseHelpers.insert("checkins", checkinRecord);

// 5. Update analytics
await updateUserAnalytics(uid);

// 6. Check for achievements
await checkAndUnlockAchievements(uid);

// 7. Generate AI nudge
const nudge = await openaiService.generatePersonalizedNudge(
  sentimentAnalysis, 
  userProfile, 
  recentCheckins
);
```

### 3. Anti-Todo Activity Generation

#### Initial Generation
```javascript
// 1. Check if user has existing activities
const hasItems = await hasAntiTodoItems(userId);
if (hasItems) return { success: true, message: 'User already has items' };

// 2. Get user preferences
const { data: userProfile } = await supabase
  .from('users')
  .select('hobbies, username, full_name')
  .eq('id', userId)
  .single();

// 3. Generate AI activities
const aiResult = await openaiService.generateAntiToDoActivities(
  { hobbies: userProfile?.hobbies || [] },
  [], // No previous activities
  5   // Generate 5 activities
);

// 4. Insert activities
for (const activity of aiResult.activities) {
  await addAntiTodoItem(userId, activity.content, 'ai');
}
```

#### Smart Regeneration
```javascript
// 1. Get ongoing activities to protect
const ongoingItems = currentItems.filter(item => item.status === 'ongoing');

// 2. Get completed activities for context
const completedActivities = await getCompletedActivities(userId);

// 3. Generate new activities avoiding duplicates
const aiResult = await openaiService.generateAntiToDoActivities(
  userPreferences,
  [...completedActivities, ...ongoingActivities],
  5
);

// 4. Delete old items (preserve ongoing)
await deleteOldItems(userId, ['not started', 'completed']);

// 5. Add new items
for (const activity of aiResult.activities) {
  await addAntiTodoItem(userId, activity.content, 'ai');
}
```

### 4. Achievement System

#### Achievement Definitions
```javascript
const ACHIEVEMENT_DEFINITIONS = {
  first_checkin: {
    id: "first_checkin",
    name: "First Steps",
    description: "Complete your first mood check-in",
    target: 1,
    points_reward: 10,
    condition: (stats) => stats.total_checkins >= 1,
  },
  streak_7: {
    id: "streak_7",
    name: "Weekly Warrior",
    description: "Maintain a 7-day check-in streak",
    target: 7,
    points_reward: 25,
    condition: (stats) => stats.current_streak >= 7,
  },
  // ... more achievements
};
```

#### Achievement Checking Process
```javascript
// 1. Get user stats
const analyticsResult = await getUserAnalytics(uid);
const stats = analyticsResult.data;

// 2. Check each achievement
for (const [achievementId, achievement] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
  const progress = calculateAchievementProgress(achievementId, stats);
  
  if (progress.isUnlocked && !existingAchievements.includes(achievementId)) {
    // 3. Unlock achievement
    await unlockAchievement(uid, achievementId, achievement);
    
    // 4. Award points
    await awardPoints(uid, achievement.points_reward, 'achievement', achievementId);
  }
}
```

### 5. Analytics Calculation

#### User Analytics Update
```javascript
export const updateUserAnalytics = async (uid) => {
  // 1. Get all user checkins
  const { data: checkins } = await supabase
    .from("checkins")
    .select("*")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });

  // 2. Calculate basic stats
  const totalCheckins = checkins.length;
  const averageMoodScore = checkins.reduce((sum, c) => sum + c.mood_score, 0) / totalCheckins;
  
  // 3. Calculate streak
  const today = new Date().toISOString().split("T")[0];
  const checkinDates = [...new Set(checkins.map(c => c.checkin_date))].sort().reverse();
  
  let currentStreak = 0;
  let checkDate = new Date();
  
  for (let i = 0; i < checkinDates.length; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (checkinDates.includes(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  // 4. Calculate weekly stats
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekAgoDateStr = weekAgo.toISOString().split("T")[0];
  
  const recentCheckins = checkins.filter(c => c.checkin_date >= weekAgoDateStr);
  const weeklyCheckinDates = [...new Set(recentCheckins.map(c => c.checkin_date))];
  const weeklyUniqueCheckinDays = weeklyCheckinDates.length;
  
  // 5. Update analytics
  const analyticsData = {
    user_id: uid,
    total_checkins: totalCheckins,
    average_mood_score: Math.round(averageMoodScore * 100) / 100,
    current_streak: currentStreak,
    weekly_unique_checkin_days: weeklyUniqueCheckinDays,
    // ... other calculated fields
  };
  
  await upsertUserAnalytics(uid, analyticsData);
};
```

## 🤖 AI Integration Details

### OpenAI Service Architecture

#### 1. Sentiment Analysis
```javascript
async analyzeCustomerSentiment(emoji, text, userProfile = null) {
  const prompt = `Analyze the customer sentiment based on:
- Emoji: ${emoji} (mood score: ${emojiScore}/10)
- User text: "${text || 'No text provided'}"
- User context: ${userProfile ? `Streak: ${userProfile.currentStreak} days` : 'No profile data'}

Provide a detailed sentiment analysis in JSON format:
{
  "sentiment_score": 1-5 (1=very negative, 5=very positive),
  "sentiment_label": "very_negative|negative|neutral|positive|very_positive",
  "emotional_state": "brief description of emotional state",
  "key_emotions": ["array", "of", "primary", "emotions"],
  "context_insights": "what the sentiment reveals about their current situation",
  "support_needs": "what kind of support they might need"
}`;

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert in emotional intelligence..." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.3,
    }),
  });
}
```

#### 2. Activity Generation
```javascript
async generateAntiToDoActivities(userPreferences, completedActivities = [], count = 5) {
  const prompt = `Generate ${count} personalized, detailed activity suggestions for a user with these preferences:
- Hobbies: ${userPreferences.hobbies.join(", ")}
- Goals: ${userPreferences.goals.join(", ")}

IMPORTANT GUIDELINES:
- Make activities specific and actionable (not generic)
- Include 1-2 lines of detailed description explaining the "why" and "how"
- Consider the user's hobbies and interests when relevant
- Mix different types: physical, creative, social, mindfulness, learning, fun
- Make activities feel personal and achievable
- Include specific details like duration, location, or method when helpful

Generate ${count} activities in this JSON format:
[
  {
    "description": "Detailed 2 line description...",
    "time": "e.g., 15 min",
    "category": "physical|creative|social|mindfulness|learning|fun",
    "icon": "Coffee|Book|Music|Camera|Heart|Palette|Sun|Lightbulb|Target|Smile|Sparkles"
  }
]`;

  // AI call with structured output
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are Offly's activity suggestion assistant..." },
        { role: "user", content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.7,
    }),
  });
}
```

### AI Fallback Systems

#### Sentiment Analysis Fallback
```javascript
getFallbackSentimentAnalysis(emoji, text) {
  const emojiScore = this.convertEmojiToScore(emoji);
  let textScore = 3; // Neutral base
  
  if (text) {
    const positiveWords = ['good', 'great', 'happy', 'amazing', 'wonderful', 'love'];
    const negativeWords = ['bad', 'terrible', 'sad', 'awful', 'hate', 'horrible'];
    
    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) {
      textScore = 4;
    } else if (negativeCount > positiveCount) {
      textScore = 2;
    }
  }
  
  const combinedScore = Math.round((emojiScore * 0.6 + textScore * 0.4) / 2);
  
  return {
    success: true,
    sentiment_score: combinedScore,
    sentiment_label: sentimentLabels[combinedScore] || 'neutral',
    emotional_state: `Based on ${emoji} emoji and text analysis`,
    key_emotions: ['analyzed'],
    context_insights: 'Fallback analysis based on emoji and text',
    support_needs: 'General support based on mood indicators',
    type: "fallback"
  };
}
```

## 🔄 Real-time System

### Supabase Real-time Subscriptions

#### Subscription Setup
```javascript
subscribe(table, callback, filters = {}) {
  let channel = supabase
    .channel(`${table}_changes`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: table,
        ...filters,
      },
      callback,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
```

#### Real-time Updates
```javascript
// Subscribe to user points changes
const unsubscribe = subscribe('user_points', (payload) => {
  if (payload.new.user_id === currentUser.id) {
    // Update UI with new points balance
    setUserPoints(payload.new.total_points);
  }
}, { user_id: currentUser.id });

// Subscribe to achievement unlocks
const unsubscribeAchievements = subscribe('achievements', (payload) => {
  if (payload.new.user_id === currentUser.id && payload.new.is_unlocked) {
    // Show achievement unlock notification
    showAchievementUnlock(payload.new);
  }
}, { user_id: currentUser.id });
```

## 🎮 Gamification Mechanics

### Points System

#### Earning Points
```javascript
// Check-in points
await awardPoints(userId, 5, 'checkin', checkinId, 'Daily check-in');

// Activity completion points
await awardPoints(userId, 10, 'anti_todo', activityId, 'Activity completed');

// Achievement points
await awardPoints(userId, achievement.points_reward, 'achievement', achievementId, `Achievement unlocked: ${achievement.name}`);
```

#### Spending Points
```javascript
// Store purchase
await spendPoints(userId, itemPrice, 'store_purchase', itemId, `Purchased ${itemName}`);

// Plant care actions
await spendPoints(userId, 5, 'plant_care', plantId, 'Watered plant');
```

### Plant Growth System

#### Growth Calculation
```javascript
export const updatePlantGrowth = async (plantId, xpGain) => {
  // Get current plant data
  const { data: plant } = await supabase
    .from("user_plants")
    .select("*")
    .eq("id", plantId)
    .single();

  let newXp = plant.growth_xp + xpGain;
  let newLevel = plant.growth_level;
  let newXpRequired = plant.growth_xp_required;

  // Check for level ups
  while (newXp >= newXpRequired && newLevel < 10) {
    newXp -= newXpRequired;
    newLevel++;
    newXpRequired = Math.floor(newXpRequired * 1.5); // 50% increase per level
  }
  
  // Cap level at 4 for display
  const displayLevel = Math.min(newLevel, 4);

  // Update plant
  await supabase
    .from("user_plants")
    .update({
      growth_xp: newXp,
      growth_level: displayLevel,
      growth_xp_required: newXpRequired,
      updated_at: new Date().toISOString()
    })
    .eq("id", plantId);

  // Check if plant is complete
  if (displayLevel === 4 && plant.growth_level < 4) {
    await completePlant(plant.user_id, plantData);
  }
};
```

## 🔐 Security Implementation

### Row Level Security (RLS)

#### User Data Protection
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Check-ins are user-specific
CREATE POLICY "Users can view own checkins" ON checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins" ON checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### Anti-Todo Security
```sql
-- Users can only access their own activities
CREATE POLICY "Users can view own anti-todo items" ON anti_todo_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own anti-todo items" ON anti_todo_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own anti-todo items" ON anti_todo_items
  FOR UPDATE USING (auth.uid() = user_id);
```

### Input Validation

#### Client-side Validation
```javascript
// Validate mood score
const validateMoodScore = (score) => {
  return typeof score === 'number' && score >= 1 && score <= 10;
};

// Validate sentiment score
const validateSentimentScore = (score) => {
  return typeof score === 'number' && score >= 1 && score <= 5;
};

// Sanitize text input
const sanitizeText = (text) => {
  return text.trim().substring(0, 1000); // Limit to 1000 characters
};
```

#### Server-side Validation
```sql
-- Database constraints
ALTER TABLE checkins ADD CONSTRAINT check_mood_score 
  CHECK (mood_score >= 1 AND mood_score <= 10);

ALTER TABLE checkins ADD CONSTRAINT check_sentiment_score 
  CHECK (sentiment_score >= 1 AND sentiment_score <= 5);

-- Anti-todo status validation
ALTER TABLE anti_todo_items ADD CONSTRAINT check_status 
  CHECK (status IN ('not started', 'ongoing', 'completed', 'stopped'));
```

## 📊 Performance Optimizations

### Database Indexes

#### Optimized Query Performance
```sql
-- Check-ins by user and date
CREATE INDEX idx_checkins_user_date ON checkins(user_id, checkin_date);

-- Anti-todo items by user and status
CREATE INDEX idx_anti_todo_items_user_status ON anti_todo_items(user_id, status, created_at DESC);

-- Achievements by user and unlock status
CREATE INDEX idx_achievements_user_id ON achievements(user_id);

-- Community posts by creation date
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
```

### Query Optimization

#### Efficient Analytics Calculation
```javascript
// Batch update analytics instead of individual updates
const batchUpdateAnalytics = async (updates) => {
  const { data, error } = await supabase
    .from('user_analytics')
    .upsert(updates, { onConflict: 'user_id' });
  
  return { success: !error, data };
};

// Use database functions for complex calculations
const calculateStreak = async (userId) => {
  const { data, error } = await supabase.rpc('calculate_user_streak', {
    p_user_id: userId
  });
  
  return data;
};
```

### Caching Strategy

#### React Query Integration
```javascript
// Cache user analytics
const { data: userAnalytics } = useQuery({
  queryKey: ['userAnalytics', userId],
  queryFn: () => getUserAnalytics(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});

// Cache anti-todo list
const { data: antiTodoList } = useQuery({
  queryKey: ['antiTodoList', userId],
  queryFn: () => getAntiTodoList(userId),
  staleTime: 2 * 60 * 1000, // 2 minutes
});
```

## 🚀 Deployment & Monitoring

### Environment Configuration

#### Required Environment Variables
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key

# Optional: Analytics
VITE_ANALYTICS_ID=your_analytics_id
```

#### Vercel Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "functions": {
    "api/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### Performance Monitoring

#### Lighthouse Integration
```javascript
// Automated performance audits
npm run lighthouse

// Generate performance reports
npm run lighthouse:json
```

#### Error Tracking
```javascript
// Global error boundary
class SupabaseErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Application error:', error, errorInfo);
    // Send to error tracking service
  }
}
```

## 🔧 Development Workflow

### Code Quality

#### ESLint Configuration
```javascript
// eslint.config.js
export default [
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        React: "readonly",
      },
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
```

#### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### Testing Strategy

#### Unit Tests (Planned)
```javascript
// Example test structure
describe('Anti-Todo System', () => {
  test('should generate initial activities for new user', async () => {
    const result = await generateInitialAntiTodos(userId);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(5);
  });

  test('should update activity status correctly', async () => {
    const result = await updateAntiTodoItemStatus(itemId, 'completed');
    expect(result.status).toBe('completed');
    expect(result.completed_at).toBeDefined();
  });
});
```

#### Integration Tests (Planned)
```javascript
// Example integration test
describe('User Onboarding Flow', () => {
  test('should complete full onboarding process', async () => {
    // 1. Create user
    const user = await createSignupUser(uid, email, displayName);
    
    // 2. Verify analytics initialized
    const analytics = await getUserAnalytics(uid);
    expect(analytics.total_checkins).toBe(0);
    
    // 3. Verify anti-todo activities generated
    const activities = await getAntiTodoList(uid);
    expect(activities).toHaveLength(5);
    
    // 4. Verify avatar assigned
    const avatar = await getUserAvatar(uid);
    expect(avatar).toBeDefined();
  });
});
```

---

This technical documentation provides a comprehensive overview of the Offly system architecture, database design, AI integration, and development processes. For specific implementation details, refer to the individual service files in the `src/services/` directory. 