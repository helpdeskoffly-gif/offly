# Offly Technical Documentation

## 🗄️ Database Schema

### Core Tables

#### Users & Analytics
- **`users`**: User profiles with hobbies, preferences
- **`user_analytics`**: Comprehensive stats (streaks, mood averages, activity counts)
- **`checkins`**: Daily mood check-ins with AI sentiment analysis
- **`point_transactions`**: Gamification point system
- **`user_points`**: Point balances and statistics

#### Wellness System
- **`anti_todo_items`**: AI-generated wellness activities
- **`anti_todo_lists`**: Organized activity lists
- **`achievements`**: User achievement progress and unlocks
- **`achievement_definitions`**: Achievement criteria and rewards

#### Gamification
- **`user_plants`**: Virtual plant growth system (levels 1-4)
- **`plant_history`**: Completed plant records
- **`plant_store_items`**: Store items for customization
- **`user_store_purchases`**: User inventory

#### Community
- **`community_posts`**: User-generated content
- **`community_likes`**: Post interactions
- **`user_relationships`**: Following/follower system

## 🤖 AI Integration

### OpenAI Service (`src/services/openai.js`)

#### 1. Sentiment Analysis
```javascript
async analyzeCustomerSentiment(emoji, text, userProfile = null)
```
- Analyzes mood using emoji + text input
- Provides 1-5 sentiment scoring
- Identifies emotional states and support needs
- Falls back to keyword analysis if AI unavailable

#### 2. Personalized Nudges
```javascript
async generatePersonalizedNudge(sentimentAnalysis, userProfile, recentCheckins)
```
- Creates contextual, supportive messages
- Considers user streak, recent moods, emotional state
- Generates actionable suggestions with emojis

#### 3. Anti-Todo Generation
```javascript
async generateAntiToDoActivities(userPreferences, completedActivities = [], count = 5)
```
- Creates personalized wellness activities
- Avoids recently completed activities
- Categorizes: physical, creative, social, mindfulness, learning, fun
- Provides detailed descriptions with time estimates

### AI Prompt Engineering

#### Sentiment Analysis Prompt
```
Analyze customer sentiment based on:
- Emoji: ${emoji} (mood score: ${emojiScore}/10)
- User text: "${text}"
- User context: Streak: ${userProfile.currentStreak} days

GUIDELINES:
- POSITIVE: joy, happiness, satisfaction, pride, achievement, love, care, helping others
- NEGATIVE: sadness, anger, frustration, stress, anxiety, depression, loneliness
- NEUTRAL: routine activities, factual statements

Provide JSON response with sentiment_score, emotional_state, support_needs
```

#### Activity Generation Prompt
```
Generate ${count} personalized activities for user with:
- Hobbies: ${userPreferences.hobbies.join(", ")}
- Goals: ${userPreferences.goals.join(", ")}

GUIDELINES:
- Make activities specific and actionable
- Include detailed descriptions explaining "why" and "how"
- Mix different types: physical, creative, social, mindfulness, learning, fun
- Include duration and specific details
- Avoid recently completed activities: ${completedActivities.join(", ")}

Generate JSON array with description, time, category, icon
```

## 🌱 Anti-Todo System

### Activity Generation Process

#### 1. Initial Generation (`generateInitialAntiTodos`)
```javascript
// For new users
const aiResult = await openaiService.generateAntiToDoActivities(
  { hobbies: userHobbies, username: userName },
  [], // No previous activities
  5   // Generate 5 activities
);

// Insert AI-generated activities
for (const activity of aiResult.activities) {
  await addAntiTodoItem(userId, activity.content, 'ai');
}
```

#### 2. Smart Regeneration (`regenerateAntiTodoList`)
```javascript
// Protect ongoing activities
const ongoingItems = currentItems.filter(item => item.status === 'ongoing');

// Get completed activities for context
const completedActivities = await getCompletedActivities(userId);

// Generate new activities avoiding duplicates
const aiResult = await openaiService.generateAntiToDoActivities(
  userPreferences,
  [...completedActivities, ...ongoingActivities],
  5
);

// Delete old items (preserve ongoing)
await deleteOldItems(userId, ['not started', 'completed']);

// Add new items
for (const activity of aiResult.activities) {
  await addAntiTodoItem(userId, activity.content, 'ai');
}
```

### Activity States
- **Not Started**: Available for user to begin
- **Ongoing**: Currently in progress
- **Completed**: Successfully finished (awards 10 points + 5 plant XP)
- **Stopped**: Paused or abandoned

### Completion Rewards
```javascript
// When activity completed
await updateUserAnalytics(updatedItem.user_id);
await awardPoints(updatedItem.user_id, 10, 'anti_todo', updatedItem.id);
await updatePlantGrowth(plantResult.data.id, 5); // 5 XP
await checkAndUnlockAchievements(updatedItem.user_id);
```

## 🎮 Gamification System

### Points System
```javascript
// Earning points
await awardPoints(userId, 5, 'checkin', checkinId, 'Daily check-in');
await awardPoints(userId, 10, 'anti_todo', activityId, 'Activity completed');
await awardPoints(userId, achievement.points_reward, 'achievement', achievementId);

// Spending points
await spendPoints(userId, itemPrice, 'store_purchase', itemId, `Purchased ${itemName}`);
```

### Achievement System
```javascript
const ACHIEVEMENT_DEFINITIONS = {
  first_checkin: { target: 1, points_reward: 10 },
  streak_7: { target: 7, points_reward: 25 },
  antitodo_15: { target: 15, points_reward: 40 },
  wellness_week: { target: 3, points_reward: 20 }
};
```

### Plant Growth System
```javascript
// Growth calculation
let newXp = plant.growth_xp + xpGain;
let newLevel = plant.growth_level;
let newXpRequired = plant.growth_xp_required;

// Level up logic
while (newXp >= newXpRequired && newLevel < 10) {
  newXp -= newXpRequired;
  newLevel++;
  newXpRequired = Math.floor(newXpRequired * 1.5); // 50% increase
}

// Cap at level 4 for display
const displayLevel = Math.min(newLevel, 4);
```

## 📊 Analytics & Tracking

### User Analytics (`user_analytics` table)
```javascript
{
  total_checkins: number,
  average_mood_score: number,
  current_streak: number,
  weekly_unique_checkin_days: number,
  completedantitodos: number,
  weeklyantitodos: number,
  last_checkin_date: string
}
```

### Analytics Update Process
```javascript
export const updateUserAnalytics = async (uid) => {
  // Get all user checkins
  const { data: checkins } = await supabase
    .from("checkins")
    .select("*")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });

  // Calculate basic stats
  const totalCheckins = checkins.length;
  const averageMoodScore = checkins.reduce((sum, c) => sum + c.mood_score, 0) / totalCheckins;
  
  // Calculate streak
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
  
  // Calculate weekly stats
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekAgoDateStr = weekAgo.toISOString().split("T")[0];
  
  const recentCheckins = checkins.filter(c => c.checkin_date >= weekAgoDateStr);
  const weeklyCheckinDates = [...new Set(recentCheckins.map(c => c.checkin_date))];
  const weeklyUniqueCheckinDays = weeklyCheckinDates.length;
  
  // Update analytics
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

## 🔄 Real-time Features

### Supabase Real-time Subscriptions
```javascript
subscribe(table, callback, filters = {}) {
  let channel = supabase
    .channel(`${table}_changes`)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: table,
      ...filters,
    }, callback)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
```

### Live Updates
- **Points**: Real-time point balance updates
- **Achievements**: Instant achievement unlocks
- **Plant Growth**: Live plant level progression
- **Community**: Real-time post interactions

## 🔐 Security Implementation

### Row Level Security (RLS)
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own checkins" ON checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins" ON checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Input Validation
```javascript
// Validate mood score (1-10)
const validateMoodScore = (score) => {
  return typeof score === 'number' && score >= 1 && score <= 10;
};

// Validate sentiment score (1-5)
const validateSentimentScore = (score) => {
  return typeof score === 'number' && score >= 1 && score <= 5;
};

// Sanitize text input
const sanitizeText = (text) => {
  return text.trim().substring(0, 1000);
};
```

## 📈 Performance Optimizations

### Database Indexes
```sql
-- Optimized for common queries
CREATE INDEX idx_checkins_user_date ON checkins(user_id, checkin_date);
CREATE INDEX idx_anti_todo_items_user_status ON anti_todo_items(user_id, status, created_at DESC);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
```

### Query Optimization
```javascript
// Batch updates instead of individual updates
const batchUpdateAnalytics = async (updates) => {
  const { data, error } = await supabase
    .from('user_analytics')
    .upsert(updates, { onConflict: 'user_id' });
  
  return { success: !error, data };
};
```

## 🚀 Deployment

### Environment Variables
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

### Build Process
```bash
npm run build  # Production build
npm run dev    # Development server
npm run preview # Preview production build
```

## 🔧 Development Workflow

### Code Organization
```
src/
├── components/          # React components
│   ├── ui/            # Reusable UI components
│   └── dashboard/     # Dashboard-specific components
├── services/          # Business logic and API calls
├── contexts/          # React context providers
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
└── optimized/        # Performance-optimized components
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run lighthouse   # Run performance audit
```

## 📚 Key Processes

### 1. User Onboarding
```javascript
// 1. User signs up
await supabase.auth.signUp({ email, password });

// 2. Create user profile
await createSignupUser(uid, email, displayName);

// 3. Initialize analytics
await initializeUserAnalytics(uid);

// 4. Assign random avatar
await assignRandomAvatar(uid);

// 5. Generate initial activities
await generateInitialAntiTodos(uid);
```

### 2. Mood Check-in Process
```javascript
// 1. Validate cooldown (4 hours)
const cooldownResult = await canUserCheckin(uid);

// 2. AI sentiment analysis
const sentimentAnalysis = await openaiService.analyzeCustomerSentiment(
  moodEmoji, moodText, userProfile
);

// 3. Create check-in record
await submitCheckin(uid, {
  moodScore, moodText, moodEmoji, sentimentScore
});

// 4. Update analytics
await updateUserAnalytics(uid);

// 5. Check achievements
await checkAndUnlockAchievements(uid);

// 6. Generate AI nudge
const nudge = await openaiService.generatePersonalizedNudge(
  sentimentAnalysis, userProfile, recentCheckins
);
```

### 3. Activity Completion
```javascript
// 1. Update activity status
await updateAntiTodoItemStatus(itemId, 'completed');

// 2. Update analytics
await updateUserAnalytics(userId);

// 3. Award points
await awardPoints(userId, 10, 'anti_todo', itemId);

// 4. Update plant growth
await updatePlantGrowth(plantId, 5);

// 5. Check achievements
await checkAndUnlockAchievements(userId);
```

---

This technical documentation covers the core architecture, AI integration, gamification system, and key processes of the Offly platform. For detailed implementation, refer to the individual service files in `src/services/`. 