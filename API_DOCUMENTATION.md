# Offly API Documentation

## 📋 Overview

This document provides comprehensive API documentation for the Offly mood tracking and wellness platform. The application uses Supabase as the backend with custom services for AI integration and business logic.

## 🔐 Authentication

### Supabase Auth Integration

All API calls require authentication via Supabase Auth. The client automatically handles token management.

```javascript
// Initialize Supabase client
import { supabase } from '../supabase';

// Sign up with email/password
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'John Doe',
      username: 'johndoe'
    }
  }
});

// Sign in with email/password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Sign in with Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/dashboard`
  }
});

// Get current user
const { data: { user }, error } = await supabase.auth.getUser();

// Sign out
const { error } = await supabase.auth.signOut();
```

## 🗄️ Database Services

### User Management

#### Create Signup User
```javascript
// src/services/database.js
export const createSignupUser = async (uid, email, displayName, additionalData = {}) => {
  // Creates user profile, analytics record, assigns avatar, generates initial activities
  return {
    success: true,
    data: { user: userResult[0], analytics: analyticsResult[0] }
  };
};
```

**Parameters:**
- `uid` (string): User ID from Supabase Auth
- `email` (string): User email address
- `displayName` (string): User's display name
- `additionalData` (object): Additional user data

**Returns:**
- `success` (boolean): Operation success status
- `data` (object): Created user and analytics data

#### Update User Profile
```javascript
export const updateUserProfile = async (uid, profileData) => {
  // Updates user profile and analytics username
  return { success: true, data: updatedUser };
};
```

**Parameters:**
- `uid` (string): User ID
- `profileData` (object): Profile data to update

#### Mark Profile as Completed
```javascript
export const markProfileAsCompleted = async (userId, profileData) => {
  // Marks user profile as complete with hobbies and username
  return { success: true, data: updatedUser };
};
```

### Mood Tracking

#### Submit Check-in
```javascript
export const submitCheckin = async (uid, checkinData) => {
  // Validates cooldown, creates check-in, updates analytics, checks achievements
  return { success: true, data: checkinRecord };
};
```

**Parameters:**
- `uid` (string): User ID
- `checkinData` (object):
  - `moodScore` (number): 1-10 mood score
  - `moodText` (string): Optional mood description
  - `moodEmoji` (string): Mood emoji
  - `sentimentScore` (number): AI-analyzed sentiment (1-5)
  - `hashtags` (array): Optional hashtags

**Returns:**
- `success` (boolean): Operation success status
- `data` (object): Created check-in record
- `cooldownActive` (boolean): If cooldown is active
- `waitTime` (number): Remaining wait time

#### Check Cooldown
```javascript
export const canUserCheckin = async (uid) => {
  // Checks if user can check-in (4-hour cooldown)
  return {
    success: true,
    canCheckin: boolean,
    lastCheckinTime: string,
    waitTimeHours: number
  };
};
```

#### Get User Check-ins
```javascript
export const getUserCheckins = async (uid, startDate = null, endDate = null, limit = 50) => {
  // Retrieves user check-ins with optional date filtering
  return { success: true, data: checkinsArray };
};
```

**Parameters:**
- `uid` (string): User ID
- `startDate` (string): Optional start date (YYYY-MM-DD)
- `endDate` (string): Optional end date (YYYY-MM-DD)
- `limit` (number): Maximum number of records to return

### Analytics

#### Get User Analytics
```javascript
export const getUserAnalytics = async (uid) => {
  // Retrieves comprehensive user analytics
  return {
    success: true,
    data: {
      total_checkins: number,
      average_mood_score: number,
      current_streak: number,
      weekly_unique_checkin_days: number,
      completedantitodos: number,
      weeklyantitodos: number,
      last_checkin_date: string
    }
  };
};
```

#### Update User Analytics
```javascript
export const updateUserAnalytics = async (uid) => {
  // Calculates and updates all user analytics
  return { success: true, data: analyticsData };
};
```

## 🌱 Anti-Todo System

### Activity Management

#### Get Anti-Todo List
```javascript
// src/services/antiTodo.js
export const getAntiTodoList = async (userId) => {
  // Retrieves user's anti-todo activities
  return activitiesArray;
};
```

#### Add Anti-Todo Item
```javascript
export const addAntiTodoItem = async (userId, content, source = 'user') => {
  // Adds new anti-todo activity
  return createdItem;
};
```

**Parameters:**
- `userId` (string): User ID
- `content` (string): Activity description
- `source` (string): 'user' or 'ai'

#### Update Activity Status
```javascript
export const updateAntiTodoItemStatus = async (itemId, status) => {
  // Updates activity status and awards rewards if completed
  return {
    ...updatedItem,
    pointsEarned: {
      total: number,
      plantXp: number
    }
  };
};
```

**Parameters:**
- `itemId` (string): Activity ID
- `status` (string): 'not started', 'ongoing', 'completed', 'stopped'

#### Generate Initial Activities
```javascript
export const generateInitialAntiTodos = async (userId) => {
  // Generates initial AI activities for new users
  return {
    success: true,
    data: activitiesArray,
    message: string
  };
};
```

#### Regenerate Activities
```javascript
export const regenerateAntiTodoList = async (userId) => {
  // Smart regeneration preserving ongoing activities
  return {
    success: true,
    data: newActivitiesArray,
    message: string
  };
};
```

#### Get Anti-Todo Stats
```javascript
export const getAntiTodoStats = async (userId) => {
  // Returns activity statistics
  return {
    total: number,
    notStarted: number,
    ongoing: number,
    completed: number,
    aiGenerated: number,
    userCreated: number
  };
};
```

## 🎮 Gamification System

### Points System

#### Get User Points
```javascript
// src/services/database.js
export const getUserPoints = async (userId) => {
  // Retrieves user's point balance
  return {
    success: true,
    data: {
      total_points: number,
      total_earned: number,
      total_spent: number
    }
  };
};
```

#### Award Points
```javascript
export const awardPoints = async (userId, points, sourceType, sourceId = null, description = null) => {
  // Awards points to user
  return { success: true, data: transactionRecord };
};
```

**Parameters:**
- `userId` (string): User ID
- `points` (number): Points to award
- `sourceType` (string): Source type ('checkin', 'anti_todo', 'achievement')
- `sourceId` (string): Optional source ID
- `description` (string): Optional description

#### Spend Points
```javascript
export const spendPoints = async (userId, points, sourceType, sourceId = null, description = null) => {
  // Spends user points
  return { success: true, data: transactionRecord };
};
```

#### Get Point Transactions
```javascript
export const getPointTransactions = async (userId, limit = 20) => {
  // Retrieves user's point transaction history
  return { success: true, data: transactionsArray };
};
```

### Achievement System

#### Get User Achievements
```javascript
export const getUserAchievements = async (uid) => {
  // Retrieves user's achievements with progress
  return { success: true, data: achievementsArray };
};
```

#### Check and Unlock Achievements
```javascript
export const checkAndUnlockAchievements = async (uid) => {
  // Checks and unlocks achievements based on current stats
  return { success: true, newAchievements: achievementsArray };
};
```

#### Get Achievement Stats
```javascript
export const getAchievementStats = async (uid) => {
  // Returns achievement statistics
  return {
    success: true,
    data: {
      total: number,
      unlocked: number,
      locked: number,
      completionRate: number,
      recentlyUnlocked: array
    }
  };
};
```

### Plant Growth System

#### Get User Plant
```javascript
export const getUserPlant = async (userId) => {
  // Retrieves user's active plant
  return { success: true, data: plantData };
};
```

#### Create New Plant
```javascript
export const createNewPlant = async (userId, plantName = "My Plant", plantType = "basic_seed") => {
  // Creates new plant for user
  return { success: true, data: plantData };
};
```

#### Update Plant Growth
```javascript
export const updatePlantGrowth = async (plantId, xpGain) => {
  // Updates plant growth and handles level ups
  return {
    success: true,
    data: plantData,
    leveledUp: boolean,
    oldLevel: number,
    newLevel: number,
    completedPlant: object
  };
};
```

#### Water Plant
```javascript
export const waterPlant = async (plantId) => {
  // Waters plant (adds 10 XP)
  return { success: true, data: plantData };
};
```

#### Fertilize Plant
```javascript
export const fertilizePlant = async (plantId, fertilizerValue = 25) => {
  // Fertilizes plant (adds specified XP)
  return { success: true, data: plantData };
};
```

### Plant Store

#### Get Store Items
```javascript
export const getStoreItems = async () => {
  // Retrieves available store items
  return { success: true, data: itemsArray };
};
```

#### Purchase Store Item
```javascript
export const purchaseStoreItem = async (userId, itemId) => {
  // Purchases store item with points
  return {
    success: true,
    data: {
      purchase: purchaseRecord,
      item: itemData,
      remainingPoints: number
    }
  };
};
```

#### Get User Inventory
```javascript
export const getUserInventory = async (userId) => {
  // Retrieves user's unused inventory items
  return { success: true, data: inventoryArray };
};
```

#### Use Inventory Item
```javascript
export const useInventoryItem = async (userId, purchaseId, plantId) => {
  // Uses inventory item on plant
  return { success: true, data: resultData };
};
```

## 🤖 AI Services

### OpenAI Integration

#### Analyze Customer Sentiment
```javascript
// src/services/openai.js
async analyzeCustomerSentiment(emoji, text, userProfile = null) => {
  // Analyzes sentiment using AI
  return {
    success: true,
    sentiment_score: number, // 1-5
    sentiment_label: string, // 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive'
    emotional_state: string,
    key_emotions: array,
    context_insights: string,
    support_needs: string,
    type: string // 'ai_analyzed' | 'fallback'
  };
};
```

#### Generate Personalized Nudge
```javascript
async generatePersonalizedNudge(sentimentAnalysis, userProfile, recentCheckins) => {
  // Generates personalized AI nudge
  return {
    success: true,
    nudge: string,
    type: string, // 'ai_generated' | 'fallback'
    sentiment_based: boolean,
    emotional_context: string
  };
};
```

#### Generate Anti-Todo Activities
```javascript
async generateAntiToDoActivities(userPreferences, completedActivities = [], count = 5) => {
  // Generates personalized wellness activities
  return {
    success: true,
    activities: [
      {
        description: string,
        time: string,
        category: string, // 'physical' | 'creative' | 'social' | 'mindfulness' | 'learning' | 'fun'
        icon: string
      }
    ],
    type: string // 'ai_generated' | 'fallback'
  };
};
```

#### Generate Streak Celebration
```javascript
async generateStreakCelebration(streakDays) => {
  // Generates celebration message for streaks
  return {
    success: true,
    message: string,
    type: string // 'ai_generated' | 'fallback'
  };
};
```

## 🔄 Real-time Subscriptions

### Supabase Real-time

#### Subscribe to Changes
```javascript
// src/supabase.js
subscribe(table, callback, filters = {}) => {
  // Subscribes to real-time database changes
  return unsubscribeFunction;
};
```

**Parameters:**
- `table` (string): Table name to subscribe to
- `callback` (function): Callback function for changes
- `filters` (object): Optional filters

**Example Usage:**
```javascript
// Subscribe to user points changes
const unsubscribe = subscribe('user_points', (payload) => {
  if (payload.new.user_id === currentUser.id) {
    setUserPoints(payload.new.total_points);
  }
}, { user_id: currentUser.id });

// Subscribe to achievements
const unsubscribeAchievements = subscribe('achievements', (payload) => {
  if (payload.new.user_id === currentUser.id && payload.new.is_unlocked) {
    showAchievementUnlock(payload.new);
  }
}, { user_id: currentUser.id });
```

## 📊 Analytics & Tracking

### Landing Page Analytics

#### Track Landing Page View
```javascript
export const trackLandingPageView = async (viewData = {}) => {
  // Tracks landing page views
  return { success: true, data: viewRecord };
};
```

#### Get Landing Page Stats
```javascript
export const getLandingPageStats = async () => {
  // Retrieves landing page analytics
  return { success: true, data: statsArray };
};
```

### Waitlist Management

#### Add to Waitlist
```javascript
export const addToWaitlist = async (email, name = "", referralSource = "") => {
  // Adds user to waitlist
  return { success: true, data: waitlistRecord };
};
```

## 🔐 Security & Validation

### Input Validation

#### Mood Score Validation
```javascript
const validateMoodScore = (score) => {
  return typeof score === 'number' && score >= 1 && score <= 10;
};
```

#### Sentiment Score Validation
```javascript
const validateSentimentScore = (score) => {
  return typeof score === 'number' && score >= 1 && score <= 5;
};
```

#### Text Sanitization
```javascript
const sanitizeText = (text) => {
  return text.trim().substring(0, 1000); // Limit to 1000 characters
};
```

### Error Handling

#### Safe Supabase Operation
```javascript
const safeSupabaseOperation = async (operation, fallback = null) => {
  try {
    validateSupabase();
    return await operation();
  } catch (error) {
    console.error("Supabase operation failed:", error);
    return {
      success: false,
      error: errorMessage,
      code: error.code,
      data: fallback,
    };
  }
};
```

## 📈 Performance & Monitoring

### Database Indexes

The application uses optimized indexes for common queries:

```sql
-- Check-ins by user and date
CREATE INDEX idx_checkins_user_date ON checkins(user_id, checkin_date);

-- Anti-todo items by user and status
CREATE INDEX idx_anti_todo_items_user_status ON anti_todo_items(user_id, status, created_at DESC);

-- Achievements by user
CREATE INDEX idx_achievements_user_id ON achievements(user_id);

-- Community posts by creation date
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
```

### Query Optimization

#### Batch Updates
```javascript
const batchUpdateAnalytics = async (updates) => {
  const { data, error } = await supabase
    .from('user_analytics')
    .upsert(updates, { onConflict: 'user_id' });
  
  return { success: !error, data };
};
```

## 🚀 Deployment

### Environment Variables

Required environment variables for deployment:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key

# Optional Analytics
VITE_ANALYTICS_ID=your_analytics_id
```

### Build Commands

```bash
npm run build  # Production build
npm run dev    # Development server
npm run preview # Preview production build
npm run lint   # Run ESLint
npm run lighthouse # Performance audit
```

## 📚 Response Formats

### Standard Response Format
```javascript
{
  success: boolean,
  data?: any,
  error?: string,
  code?: string
}
```

### Error Response Format
```javascript
{
  success: false,
  error: string,
  code: string,
  data: null
}
```

### Pagination Format
```javascript
{
  success: true,
  data: array,
  pagination: {
    page: number,
    limit: number,
    total: number,
    hasMore: boolean
  }
}
```

## 🔧 Development

### Code Organization
```
src/
├── services/          # API services
│   ├── database.js   # Database operations
│   ├── openai.js     # AI integration
│   ├── antiTodo.js   # Anti-todo system
│   ├── community.js  # Community features
│   └── avatars.js    # Avatar management
├── supabase.js       # Supabase client configuration
└── contexts/         # React context providers
```

### Testing API Endpoints

#### Example: Submit Check-in
```javascript
// Test check-in submission
const testCheckin = async () => {
  const result = await submitCheckin(userId, {
    moodScore: 8,
    moodText: "Feeling great today!",
    moodEmoji: "😊",
    sentimentScore: 4.5
  });
  
  console.log('Check-in result:', result);
};
```

#### Example: Generate Activities
```javascript
// Test activity generation
const testActivityGeneration = async () => {
  const result = await generateInitialAntiTodos(userId);
  console.log('Generated activities:', result);
};
```

---

This API documentation provides comprehensive coverage of all services, endpoints, and data flows in the Offly platform. For implementation details, refer to the individual service files in the `src/services/` directory. 