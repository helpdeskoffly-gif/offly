# 🚀 Offly API Documentation

> **Complete API reference for the Offly AI-powered mood tracking and wellness platform**

## 📋 Table of Contents

- [Overview](#-overview)
- [Authentication](#-authentication)
- [Base URLs & Headers](#-base-urls--headers)
- [User Management](#-user-management)
- [Mood Tracking](#-mood-tracking)
- [Anti-Todo System](#-anti-todo-system)
- [Gamification](#-gamification)
- [Analytics](#-analytics)
- [AI Services](#-ai-services)
- [Email System](#-email-system)
- [Error Handling](#-error-handling)
- [Rate Limits](#-rate-limits)
- [SDK Examples](#-sdk-examples)

---

## 🌟 Overview

The Offly API provides comprehensive endpoints for:

- **User authentication** and profile management
- **Mood tracking** with AI sentiment analysis
- **Anti-todo activities** generation and management
- **Gamification** with points and achievements
- **Real-time analytics** and insights
- **AI-powered** content generation

### 🔧 **Technical Specs**
- **Protocol**: REST API over HTTPS
- **Authentication**: JWT tokens via Supabase Auth
- **Data Format**: JSON
- **Real-time**: WebSocket subscriptions
- **Rate Limiting**: 1000 requests/hour per user

---

## 🔐 Authentication

### **Supabase Authentication**

All API endpoints require authentication via Supabase JWT tokens.

#### **Google OAuth Sign-in**
```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
});
```

#### **Sign Out**
```javascript
const { error } = await supabase.auth.signOut();
```

#### **Get Current Session**
```javascript
const { data: { session } } = await supabase.auth.getSession();
```

### **Headers**
All authenticated requests must include:

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 🌐 Base URLs & Headers

### **Development**
```
https://mgiqsvjmgongmspyauxa.supabase.co
```

### **Required Headers**
```http
Authorization: Bearer <supabase_jwt_token>
apikey: <supabase_anon_key>
Content-Type: application/json
```

---

## 👤 User Management

### **Get Current User Profile**

```javascript
// Get user with analytics
const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      user_analytics (*)
    `)
    .eq('id', userId)
    .single();
    
  return { data, error };
};
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "username",
  "hobbies": ["reading", "cooking"],
  "preferred_activities": ["meditation", "exercise"],
  "avatar_url": "https://...",
  "timezone": "UTC",
  "onboarding_completed": true,
  "created_at": "2025-01-01T00:00:00Z",
  "user_analytics": {
    "level": 5,
    "xp": 2500,
    "current_streak": 14,
    "overall_average": 7.2
  }
}
```

### **Update User Profile**

```javascript
const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update({
      username: updates.username,
      hobbies: updates.hobbies,
      preferred_activities: updates.preferred_activities,
      timezone: updates.timezone,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();
    
  return { data, error };
};
```

### **Get User Analytics**

```javascript
const getUserAnalytics = async (userId) => {
  const { data, error } = await supabase
    .from('user_analytics')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  return { data, error };
};
```

---

## 📝 Mood Tracking

### **Create Daily Check-in**

```javascript
const createCheckin = async (checkinData) => {
  const { data, error } = await supabase
    .from('checkins')
    .insert({
      user_id: checkinData.userId,
      mood_score: checkinData.moodScore,
      notes: checkinData.notes,
      activities: checkinData.activities,
      energy_level: checkinData.energyLevel,
      sleep_hours: checkinData.sleepHours,
      weather: checkinData.weather,
      checkin_date: new Date().toISOString().split('T')[0]
    })
    .select()
    .single();
    
  return { data, error };
};
```

**Request Body:**
```json
{
  "userId": "uuid",
  "moodScore": 8,
  "notes": "Great day at work! Finished a big project.",
  "activities": ["work", "exercise", "socializing"],
  "energyLevel": 4,
  "sleepHours": 7.5,
  "weather": "sunny"
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "mood_score": 8,
  "notes": "Great day at work!",
  "ai_sentiment_score": 0.85,
  "ai_confidence": 0.92,
  "ai_insights": {
    "sentiment": "positive",
    "key_phrases": ["great day", "finished project"],
    "mood_factors": ["work_success", "accomplishment"]
  },
  "activities": ["work", "exercise", "socializing"],
  "energy_level": 4,
  "sleep_hours": 7.5,
  "created_at": "2025-01-01T12:00:00Z",
  "checkin_date": "2025-01-01"
}
```

### **Get User Check-ins**

```javascript
const getUserCheckins = async (userId, options = {}) => {
  let query = supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .order('checkin_date', { ascending: false });
    
  if (options.limit) {
    query = query.limit(options.limit);
  }
  
  if (options.startDate) {
    query = query.gte('checkin_date', options.startDate);
  }
  
  if (options.endDate) {
    query = query.lte('checkin_date', options.endDate);
  }
  
  const { data, error } = await query;
  return { data, error };
};
```

### **Get Mood Analytics**

```javascript
const getMoodAnalytics = async (userId, period = '30days') => {
  const { data, error } = await supabase
    .from('checkins')
    .select('mood_score, energy_level, checkin_date, ai_sentiment_score')
    .eq('user_id', userId)
    .gte('checkin_date', getDateNDaysAgo(30))
    .order('checkin_date', { ascending: true });
    
  return { data, error };
};
```

---

## 🎯 Anti-Todo System

### **Generate AI Activities**

```javascript
const generateAntiTodoItems = async (params) => {
  // This calls the OpenAI service internally
  const activities = await openAIService.generateAntiTodoActivities({
    userMood: params.mood,
    hobbies: params.hobbies,
    difficulty: params.difficulty || 'medium',
    count: params.count || 5,
    timeAvailable: params.timeAvailable
  });
  
  // Store in database
  const { data, error } = await supabase
    .from('anti_todo_items')
    .insert(
      activities.map(activity => ({
        user_id: params.userId,
        title: activity.title,
        description: activity.description,
        category: activity.category,
        difficulty: activity.difficulty,
        estimated_duration: activity.duration,
        hobbies_matched: activity.matchedHobbies,
        mood_context: params.mood,
        completion_points: activity.points
      }))
    )
    .select();
    
  return { data, error };
};
```

**Request:**
```json
{
  "userId": "uuid",
  "mood": "happy",
  "hobbies": ["reading", "cooking", "gaming"],
  "difficulty": "medium",
  "count": 5,
  "timeAvailable": 60
}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Try a new recipe from your favorite cuisine",
    "description": "Since you enjoy cooking, explore a dish you've never made before...",
    "category": "creativity",
    "difficulty": "medium", 
    "estimated_duration": 45,
    "hobbies_matched": ["cooking"],
    "completion_points": 25,
    "ai_generated": true
  }
]
```

### **Complete Activity**

```javascript
const completeAntiTodoItem = async (itemId, userId) => {
  const { data, error } = await supabase
    .from('anti_todo_items')
    .update({
      completed: true,
      completed_at: new Date().toISOString()
    })
    .eq('id', itemId)
    .eq('user_id', userId)
    .select()
    .single();
    
  return { data, error };
};
```

### **Get User Activities**

```javascript
const getUserAntiTodoItems = async (userId, filters = {}) => {
  let query = supabase
    .from('anti_todo_items')
    .select('*')
    .eq('user_id', userId);
    
  if (filters.completed !== undefined) {
    query = query.eq('completed', filters.completed);
  }
  
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  return { data, error };
};
```

---

## 🏆 Gamification

### **Get User Achievements**

```javascript
const getUserAchievements = async (userId) => {
  const { data, error } = await supabase
    .from('user_achievements_with_details')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });
    
  return { data, error };
};
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "achievement_id": "streak_7",
    "name": "Weekly Warrior",
    "description": "Maintain a 7-day check-in streak",
    "category": "streak",
    "icon": "Flame",
    "rarity": "common",
    "progress": 7,
    "completed": true,
    "completed_at": "2025-01-01T00:00:00Z",
    "points_awarded": 100
  }
]
```

### **Award Achievement**

```javascript
const awardAchievement = async (userId, achievementId) => {
  // Check if already earned
  const { data: existing } = await supabase
    .from('user_achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('achievement_id', achievementId)
    .single();
    
  if (existing) {
    return { error: 'Achievement already earned' };
  }
  
  // Get achievement details
  const { data: achievement } = await supabase
    .from('achievement_definitions')
    .select('points_reward')
    .eq('id', achievementId)
    .single();
    
  // Award achievement
  const { data, error } = await supabase
    .from('user_achievements')
    .insert({
      user_id: userId,
      achievement_id: achievementId,
      progress: achievement.target,
      completed: true,
      completed_at: new Date().toISOString(),
      points_awarded: achievement.points_reward
    })
    .select()
    .single();
    
  return { data, error };
};
```

### **Get User Points**

```javascript
const getUserPoints = async (userId) => {
  const { data, error } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  return { data, error };
};
```

### **Award Points**

```javascript
const awardPoints = async (userId, pointsData) => {
  // Add to user_points
  const { data, error } = await supabase.rpc('award_user_points', {
    p_user_id: userId,
    p_points: pointsData.amount,
    p_reason: pointsData.reason,
    p_category: pointsData.category
  });
  
  return { data, error };
};
```

---

## 📊 Analytics

### **Get Dashboard Analytics**

```javascript
const getDashboardAnalytics = async (userId) => {
  // Get comprehensive analytics
  const [analytics, recentCheckins, achievements, activities] = await Promise.all([
    getUserAnalytics(userId),
    getUserCheckins(userId, { limit: 30 }),
    getUserAchievements(userId),
    getUserAntiTodoItems(userId, { completed: true })
  ]);
  
  return {
    analytics: analytics.data,
    recentCheckins: recentCheckins.data,
    achievements: achievements.data,
    completedActivities: activities.data
  };
};
```

### **Get Mood Trends**

```javascript
const getMoodTrends = async (userId, period = '7days') => {
  const days = period === '7days' ? 7 : period === '30days' ? 30 : 90;
  
  const { data, error } = await supabase
    .from('checkins')
    .select('mood_score, energy_level, checkin_date, ai_sentiment_score')
    .eq('user_id', userId)
    .gte('checkin_date', getDateNDaysAgo(days))
    .order('checkin_date', { ascending: true });
    
  // Process data for charts
  const processedData = data?.map(item => ({
    date: item.checkin_date,
    mood: item.mood_score,
    energy: item.energy_level,
    aiSentiment: item.ai_sentiment_score
  }));
  
  return { data: processedData, error };
};
```

### **Get Weekly Summary**

```javascript
const getWeeklySummary = async (userId) => {
  const { data, error } = await supabase.rpc('get_weekly_mood_summary', {
    p_user_id: userId
  });
  
  return { data, error };
};
```

---

## 🤖 AI Services

### **Analyze Mood Check-in**

```javascript
const analyzeCheckin = async (checkinData) => {
  const analysis = await openAIService.analyzeMoodCheckin({
    text: checkinData.notes,
    moodScore: checkinData.moodScore,
    activities: checkinData.activities,
    context: {
      recentMoods: checkinData.recentMoods,
      userPreferences: checkinData.userPreferences
    }
  });
  
  return {
    sentiment_score: analysis.sentiment,
    confidence: analysis.confidence,
    insights: analysis.insights,
    recommendations: analysis.recommendations
  };
};
```

### **Generate AI Nudge**

```javascript
const generateAINudge = async (userId, context) => {
  const nudge = await openAIService.generatePersonalizedNudge({
    userId,
    moodTrend: context.moodTrend,
    streakDays: context.streakDays,
    recentAchievements: context.recentAchievements,
    timeOfDay: context.timeOfDay
  });
  
  return {
    message: nudge.message,
    type: nudge.type,
    actionable: nudge.actionable,
    expires_at: nudge.expiresAt
  };
};
```

---

## 📧 Email System

### **Send Feedback Email**

```javascript
const sendFeedbackEmail = async (feedbackData) => {
  const result = await emailService.sendFeedbackEmail({
    message: feedbackData.message,
    userEmail: feedbackData.userEmail,
    userName: feedbackData.userName,
    type: feedbackData.type,
    attachment: feedbackData.attachment
  });
  
  return result;
};
```

**Request:**
```json
{
  "message": "Love the new AI features!",
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "type": "General Feedback",
  "attachment": {
    "name": "screenshot.png",
    "size": 1024,
    "type": "image/png"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback sent successfully!",
  "method": "emailjs"
}
```

---

## ❌ Error Handling

### **Standard Error Response**

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Mood score must be between 1 and 10",
    "details": {
      "field": "mood_score",
      "provided": 15,
      "expected": "1-10"
    }
  }
}
```

### **Common Error Codes**

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `UNAUTHORIZED` | Invalid or missing authentication | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `INVALID_REQUEST` | Validation error | 400 |
| `RATE_LIMITED` | Too many requests | 429 |
| `SERVER_ERROR` | Internal server error | 500 |

### **Error Handling Example**

```javascript
try {
  const result = await createCheckin(checkinData);
  if (result.error) {
    console.error('API Error:', result.error.message);
    // Handle specific error types
    switch (result.error.code) {
      case 'INVALID_REQUEST':
        showValidationError(result.error.details);
        break;
      case 'UNAUTHORIZED':
        redirectToLogin();
        break;
      default:
        showGenericError();
    }
  }
} catch (error) {
  console.error('Network Error:', error);
  showNetworkError();
}
```

---

## ⚡ Rate Limits

### **Limits by Endpoint Type**

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 10 requests | 5 minutes |
| Check-ins | 20 requests | 1 hour |
| AI Generation | 50 requests | 1 hour |
| General API | 1000 requests | 1 hour |
| File Upload | 10 requests | 1 hour |

### **Rate Limit Headers**

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## 💻 SDK Examples

### **React Hook Example**

```javascript
// Custom hook for mood check-ins
const useCheckins = (userId) => {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const createCheckin = async (checkinData) => {
    setLoading(true);
    try {
      const result = await createCheckin({
        ...checkinData,
        userId
      });
      
      if (result.data) {
        setCheckins(prev => [result.data, ...prev]);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to create check-in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCheckins = async () => {
    try {
      const result = await getUserCheckins(userId);
      if (result.data) {
        setCheckins(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch check-ins:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (userId) {
      fetchCheckins();
    }
  }, [userId]);
  
  return {
    checkins,
    loading,
    createCheckin,
    refetch: fetchCheckins
  };
};
```

### **Real-time Subscriptions**

```javascript
// Subscribe to user achievements
const subscribeToAchievements = (userId, callback) => {
  const subscription = supabase
    .channel('user_achievements')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'user_achievements',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
    
  return () => subscription.unsubscribe();
};

// Usage
useEffect(() => {
  const unsubscribe = subscribeToAchievements(userId, (payload) => {
    console.log('New achievement!', payload.new);
    showAchievementNotification(payload.new);
  });
  
  return unsubscribe;
}, [userId]);
```

---

## 🔧 Utilities & Helpers

### **Date Utilities**

```javascript
const getDateNDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

const formatDateForAPI = (date) => {
  return date.toISOString().split('T')[0];
};
```

### **Validation Helpers**

```javascript
const validateMoodScore = (score) => {
  return score >= 1 && score <= 10;
};

const validateEnergyLevel = (level) => {
  return level >= 1 && level <= 5;
};
```

---

*📋 This API documentation is automatically updated with new features*

**Last Updated**: January 2025  
**API Version**: v2.1.0  
**Base URL**: `https://mgiqsvjmgongmspyauxa.supabase.co`
