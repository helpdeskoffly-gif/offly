# Offly - AI-Powered Mood Tracking & Wellness Platform

## 🌟 Overview

Offly is a comprehensive mood tracking and wellness application that combines AI-powered sentiment analysis, gamification, and community features to help users improve their mental well-being. The platform uses advanced AI to generate personalized nudges, activities, and insights based on user mood patterns and preferences.

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 19 with Vite
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **AI Services**: OpenAI GPT-4o-mini for sentiment analysis and content generation
- **Styling**: Tailwind CSS with custom gradients and animations
- **UI Components**: Radix UI primitives with custom styling
- **Animations**: GSAP for premium user experience
- **Charts**: Chart.js and Recharts for data visualization
- **Deployment**: Vercel

### Core Technologies

- **Authentication**: Supabase Auth with Google OAuth
- **Database**: PostgreSQL with optimized indexes and RLS policies
- **Real-time**: Supabase real-time subscriptions for live updates
- **AI Integration**: OpenAI API for personalized content generation
- **Gamification**: Custom points system with achievements and plant growth

## 🗄️ Database Schema

### Core Tables

#### Users & Analytics

- **`users`**: User profiles with preferences, hobbies, and settings
- **`user_analytics`**: Comprehensive analytics including streaks, mood averages, and activity stats
- **`user_preferences`**: User customization settings

#### Mood Tracking

- **`checkins`**: Daily mood check-ins with sentiment analysis
- **`point_transactions`**: Gamification point system transactions
- **`user_points`**: User point balances and statistics

#### Wellness Activities

- **`anti_todo_items`**: AI-generated wellness activities
- **`anti_todo_lists`**: Organized activity lists
- **`activities`**: User-created activities and tasks

#### Gamification

- **`achievements`**: User achievement progress and unlocks
- **`achievement_definitions`**: Achievement definitions and criteria
- **`user_plants`**: Virtual plant growth system
- **`plant_history`**: Completed plant growth records
- **`plant_store_items`**: Store items for plant customization
- **`user_store_purchases`**: User inventory and purchases

#### Community Features

- **`community_posts`**: User-generated community content
- **`community_likes`**: Post interaction tracking
- **`user_relationships`**: User following/follower relationships

#### System Tables

- **`notifications`**: System notifications and alerts
- **`landing_page_views`**: Analytics tracking
- **`waitlist`**: User waitlist management

## 🤖 AI Integration

### OpenAI Service (`src/services/openai.js`)

The AI system provides multiple intelligent features:

#### 1. Sentiment Analysis

```javascript
// Enhanced sentiment analysis using emoji + text
async analyzeCustomerSentiment(emoji, text, userProfile = null)
```

- Analyzes user mood using emoji and text input
- Provides detailed sentiment scoring (1-5 scale)
- Identifies emotional states and support needs
- Falls back to keyword-based analysis if AI unavailable

#### 2. Personalized Nudges

```javascript
// Generate personalized AI nudges based on sentiment analysis
async generatePersonalizedNudge(sentimentAnalysis, userProfile, recentCheckins)
```

- Creates contextual, supportive messages
- Considers user streak, recent moods, and emotional state
- Generates actionable, gentle suggestions
- Includes relevant emojis and warm language

#### 3. Anti-Todo Activity Generation

```javascript
// Generate personalized wellness activities
async generateAntiToDoActivities(userPreferences, completedActivities = [], count = 5)
```

- Creates personalized wellness activities based on user hobbies
- Avoids suggesting recently completed activities
- Categorizes activities (physical, creative, social, mindfulness, learning, fun)
- Provides detailed descriptions with time estimates

#### 4. Achievement Celebrations

```javascript
// Generate streak celebration messages
async generateStreakCelebration(streakDays)
```

- Creates motivational messages for user achievements
- Celebrates milestones and progress
- Includes relevant emojis and encouraging language

### AI Prompt Engineering

The system uses carefully crafted prompts for consistent, high-quality outputs:

#### Sentiment Analysis Prompt

```
Analyze the customer sentiment based on:
- Emoji: ${emoji} (mood score: ${emojiScore}/10)
- User text: "${text || 'No text provided'}"
- User context: ${userProfile ? `Streak: ${userProfile.currentStreak} days, Total checkins: ${userProfile.totalCheckins}` : 'No profile data'}

IMPORTANT GUIDELINES FOR SENTIMENT ANALYSIS:
- POSITIVE indicators: joy, happiness, satisfaction, pride, achievement, love, care, helping others, feeling powerful/strong, gratitude, excitement, contentment
- NEGATIVE indicators: sadness, anger, frustration, stress, anxiety, depression, loneliness, disappointment, fear, helplessness
- NEUTRAL indicators: routine activities, factual statements without emotional content, simple observations
```

#### Activity Generation Prompt

```
Generate ${count} personalized, detailed activity suggestions for a user with these preferences:
- Hobbies: ${userPreferences.hobbies.join(", ")}
- Goals: ${userPreferences.goals.join(", ")}

IMPORTANT GUIDELINES:
- Make activities specific and actionable (not generic)
- Include 1-2 lines of detailed description explaining the "why" and "how"
- Consider the user's hobbies and interests when relevant
- Mix different types: physical, creative, social, mindfulness, learning, fun
- Make activities feel personal and achievable
- Include specific details like duration, location, or method when helpful
```

## 🎮 Gamification System

### Points System

- **Earning Points**: Check-ins (5 points), activities (10 points), achievements (10-75 points)
- **Spending Points**: Plant store items, decorations, fertilizers
- **Point Tracking**: Real-time balance updates with transaction history

### Achievement System

```javascript
const ACHIEVEMENT_DEFINITIONS = {
  first_checkin: { target: 1, points_reward: 10 },
  streak_7: { target: 7, points_reward: 25 },
  antitodo_15: { target: 15, points_reward: 40 },
  // ... more achievements
};
```

#### Achievement Categories

- **Milestone**: First check-in, total check-ins (10, 50, 100)
- **Streak**: Consecutive days (3, 7, 30 days)
- **Wellness**: Anti-todo completions (1, 5, 15, 30 activities)
- **Weekly**: Weekly wellness goals

### Plant Growth System

- **Growth Levels**: 1-4 levels with increasing XP requirements
- **Care Actions**: Watering (10 XP), fertilizing (25 XP)
- **Completion**: Plants reach level 4 and create new plants
- **History**: Completed plants are preserved in history

## 🌱 Anti-Todo Wellness System

### Activity Generation Process

1. **Initial Generation** (`generateInitialAntiTodos`)

   - Triggered for new users
   - Uses AI to create 5 personalized activities
   - Considers user hobbies and preferences
   - Falls back to default activities if AI fails
2. **Smart Regeneration** (`regenerateAntiTodoList`)

   - Protects ongoing activities from deletion
   - Considers completed activities to avoid duplicates
   - Uses AI to generate fresh, personalized activities
   - Preserves cumulative completion counts
3. **Activity Categories**

   - **Physical**: Walking, exercise, stretching, yoga
   - **Creative**: Drawing, writing, crafting, design
   - **Social**: Calling friends, meeting people, connecting
   - **Mindfulness**: Meditation, journaling, gratitude
   - **Learning**: Reading, studying, new skills
   - **Fun**: Music, games, entertainment

### Activity States

- **Not Started**: Available for user to begin
- **Ongoing**: Currently in progress
- **Completed**: Successfully finished
- **Stopped**: Paused or abandoned

### Completion Rewards

- **Points**: 10 points per completed activity
- **Plant XP**: 5 XP for plant growth
- **Achievements**: Unlock wellness-related achievements
- **Analytics**: Update completion statistics

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

### Real-time Updates

- **Check-in Analytics**: Updated after each mood check-in
- **Activity Analytics**: Updated when activities are completed
- **Streak Calculation**: Real-time streak tracking
- **Weekly Stats**: Rolling 7-day statistics

### Data Processing

```javascript
// Update user analytics after checkin
export const updateUserAnalytics = async (uid) => {
  // Calculate total checkins, averages, streaks
  // Update anti-todo completion counts
  // Calculate weekly statistics
  // Store in user_analytics table
};
```

## 🔄 Real-time Features

### Supabase Real-time Subscriptions

```javascript
// Subscribe to real-time updates
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
}
```

### Live Updates

- **Points**: Real-time point balance updates
- **Achievements**: Instant achievement unlocks
- **Plant Growth**: Live plant level progression
- **Community**: Real-time post interactions

## 🎨 UI/UX Features

### Premium Design System

- **Gradients**: Custom gradient combinations for different states
- **Animations**: GSAP-powered smooth transitions
- **Themes**: Dark/light mode with consistent theming
- **Responsive**: Mobile-first design with desktop optimization

### Component Architecture

```javascript
// Premium card component with gradients
const themeColors = {
  background: "bg-gradient-to-br from-slate-950 via-gray-950 to-slate-950",
  card: "bg-slate-900/60 border-slate-800/50 backdrop-blur-xl",
  text: { primary: "text-slate-200", secondary: "text-slate-400" }
};
```

### Animation System

```javascript
// GSAP animations for premium feel
gsap.fromTo(
  containerRef.current,
  { opacity: 0, y: 20 },
  { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
);
```

## 🔐 Security & Performance

### Database Security

- **Row Level Security (RLS)**: User-specific data access
- **Optimized Indexes**: Fast query performance
- **Connection Pooling**: Efficient database connections
- **Error Handling**: Graceful fallbacks and retries

### API Security

- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize all user inputs
- **Authentication**: Supabase Auth with session management
- **CORS**: Proper cross-origin resource sharing

### Performance Optimizations

- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Image Optimization**: Optimized assets and lazy loading
- **Bundle Splitting**: Code splitting for faster loads

## 🚀 Deployment

### Environment Setup

```bash
# Required environment variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

### Build Process

```bash
npm run build  # Production build
npm run dev    # Development server
npm run preview # Preview production build
```

### Vercel Deployment

- **Automatic Deployments**: Git-based deployment
- **Environment Variables**: Secure variable management
- **Edge Functions**: Serverless API endpoints
- **CDN**: Global content delivery

## 📈 Monitoring & Analytics

### Performance Monitoring

- **Lighthouse**: Automated performance audits
- **Error Tracking**: Comprehensive error logging
- **User Analytics**: Behavior tracking and insights
- **Database Monitoring**: Query performance tracking

### Analytics Integration

```javascript
// Track landing page views
export const trackLandingPageView = async (viewData = {}) => {
  return supabaseHelpers.insert("landing_page_views", {
    page_path: viewData.pagePath || window.location.pathname,
    user_agent: navigator.userAgent,
    referrer: document.referrer || null,
    created_at: new Date().toISOString(),
  });
};
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

## 🤝 Contributing

### Code Standards

- **ESLint**: Enforced code quality
- **Prettier**: Consistent code formatting
- **TypeScript**: Type safety (planned migration)
- **Testing**: Unit and integration tests (planned)

### Git Workflow

1. Create feature branch
2. Implement changes with tests
3. Submit pull request
4. Code review and approval
5. Merge to main branch

## 📚 API Documentation

### Core Endpoints

#### Authentication

```javascript
// Sign up with email/password
await supabase.auth.signUp({ email, password })

// Sign in with Google
await supabase.auth.signInWithOAuth({ provider: "google" })

// Get current user
await supabase.auth.getUser()
```

#### Mood Tracking

```javascript
// Submit check-in
await submitCheckin(userId, {
  moodScore: 8,
  moodText: "Feeling great today!",
  moodEmoji: "😊",
  sentimentScore: 4.5
})

// Get user check-ins
await getUserCheckins(userId, startDate, endDate, limit)
```

#### Wellness Activities

```javascript
// Get anti-todo list
await getAntiTodoList(userId)

// Update activity status
await updateAntiTodoItemStatus(itemId, 'completed')

// Regenerate activities
await regenerateAntiTodoList(userId)
```

#### Gamification

```javascript
// Award points
await awardPoints(userId, 10, 'activity', itemId, 'Activity completed')

// Get user points
await getUserPoints(userId)

// Update plant growth
await updatePlantGrowth(plantId, 10)
```

## 🎯 Future Roadmap

### Planned Features

- **Advanced AI**: More sophisticated sentiment analysis
- **Social Features**: Enhanced community interactions
- **Mobile App**: Native iOS/Android applications
- **API Access**: Public API for third-party integrations
- **Advanced Analytics**: Machine learning insights
- **Integration**: Calendar and productivity app connections

### Technical Improvements

- **TypeScript Migration**: Full type safety
- **Testing Suite**: Comprehensive test coverage
- **Performance**: Further optimization and caching
- **Accessibility**: Enhanced accessibility features
- **Internationalization**: Multi-language support

---

## 📄 License

This project is proprietary software. All rights reserved.
