# 🌟 Offly - AI-Powered Mood Tracking & Wellness Platform



![Offly Logo](public/offly-logo.svg)

> **Transform your daily mood tracking into a rewarding wellness journey with AI-powered insights, gamification, and personalized activities.**

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Environment Setup](#-environment-setup)
- [Authentication](#-authentication)
- [Database Schema](#-database-schema)
- [AI Integration](#-ai-integration)
- [Email System](#-email-system)
- [Security Features](#-security-features)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🌟 Overview

Offly is a comprehensive mood tracking and wellness application that combines:

- **AI-powered sentiment analysis** for intelligent mood insights
- **Gamification system** with points, achievements, and virtual plant growth
- **Anti-Todo Lists** - AI-generated wellness activities instead of stressful tasks
- **Community features** with shared achievements and social motivation
- **Real-time analytics** and mood pattern visualization
- **Personalized AI nudges** based on individual mood patterns

### 🎯 Core Mission
Help users build better mental wellness habits through positive reinforcement, AI-driven insights, and community support - making mood tracking feel rewarding rather than burdensome.

---

## ✨ Features

### 🧠 **AI-Powered Mood Analysis**
- **Smart Sentiment Detection**: OpenAI GPT-4o-mini analyzes mood check-ins
- **Personalized Insights**: AI generates custom wellness recommendations  
- **Mood Pattern Recognition**: Identifies trends and suggests improvements
- **Dynamic AI Nudges**: Context-aware motivational messages

### 🎮 **Gamification System**
- **Points & Rewards**: Earn points for daily check-ins and activities
- **Achievement System**: 50+ achievements across multiple categories
- **Plant Growth**: Virtual plant that grows with your wellness journey
- **Streak Tracking**: Daily check-in streaks with bonus rewards
- **Level Progression**: User levels with increasing rewards

### 📊 **Analytics & Insights**
- **Mood Trends**: Visual charts showing mood patterns over time
- **Weekly Reports**: AI-generated summaries of progress
- **Activity Correlation**: How activities affect your mood
- **Streak Analytics**: Detailed streak performance metrics

### 🏃‍♀️ **Anti-Todo System**  
- **AI-Generated Activities**: Personalized wellness tasks instead of stressful todos
- **Hobby Integration**: Activities based on user interests and hobbies
- **Difficulty Levels**: Tasks suited to current mood and energy
- **Smart Suggestions**: Context-aware activity recommendations

### 👥 **Community Features**
- **Shared Achievements**: Community achievement leaderboards
- **Social Motivation**: Anonymous peer support and encouragement
- **Community Challenges**: Group wellness activities and goals

### 🔐 **Security & Privacy**
- **24-Hour Session Timeout**: Automatic logout for security
- **Session Warning System**: 30-minute warning before expiry
- **Google OAuth Integration**: Secure authentication
- **Row-Level Security**: Database-level privacy protection

---

## 🛠 Tech Stack

### **Frontend**
```
React 19          - Modern UI framework
Vite             - Lightning-fast build tool
Tailwind CSS     - Utility-first styling
Radix UI         - Accessible component primitives
GSAP             - Premium animations
Lucide React     - Beautiful icons
Chart.js         - Data visualization
Recharts         - React-specific charts
```

### **Backend & Database**
```
Supabase         - PostgreSQL + Real-time + Auth
PostgreSQL       - Primary database
Real-time API    - Live updates and subscriptions  
Row Level Security - Database-level permissions
```

### **AI & External Services**
```
OpenAI GPT-4o-mini - Sentiment analysis & content generation
EmailJS           - Client-side email sending
Google OAuth      - Authentication provider
```

### **Development & Deployment**
```
ESLint           - Code linting
PostCSS          - CSS processing
Vercel           - Production deployment
Git              - Version control
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/offly-prod/Offly.git
   cd Offly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.template .env
   # Edit .env with your actual values
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## 🔧 Environment Setup

Create a `.env` file with the following variables:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key-here"

# OpenAI Configuration (Required for AI features)
VITE_OPENAI_API_KEY="sk-proj-your-openai-key-here"

# EmailJS Configuration (Optional - for feedback forms)
VITE_EMAILJS_SERVICE_ID="service_xxxxxxx"
VITE_EMAILJS_TEMPLATE_ID="template_xxxxxxx" 
VITE_EMAILJS_PUBLIC_KEY="your-public-key-here"
```

### 🔑 Getting API Keys

#### **Supabase Setup**
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → API
4. Copy Project URL and anon/public key

#### **OpenAI Setup**  
1. Create account at [platform.openai.com](https://platform.openai.com)
2. Go to API Keys section
3. Create new API key
4. Add billing information (required for API usage)

#### **EmailJS Setup** (Optional)
1. Create account at [emailjs.com](https://www.emailjs.com)
2. Create email service (Gmail, Outlook, etc.)
3. Create email template
4. Copy Service ID, Template ID, and Public Key

---

## 🔐 Authentication

### **Supported Methods**
- **Google OAuth** - Primary authentication method
- **Email/Password** - Traditional login (if enabled)

### **OAuth Configuration**

#### **Google OAuth Setup**
1. **Google Cloud Console**
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`

2. **Supabase Configuration**
   - Go to Authentication → Providers
   - Enable Google provider
   - Add Client ID and Client Secret from Google Cloud

#### **Session Management**
- **24-hour timeout** - Automatic logout for security
- **Session warnings** - 30-minute warning before expiry  
- **Token refresh** - Automatic token renewal
- **Secure storage** - Encrypted session storage

---

## 🗄 Database Schema

### **Core Tables**

#### **Users & Analytics**
```sql
users                    - User profiles and preferences
user_analytics          - Comprehensive analytics and metrics  
user_preferences        - Customization settings
user_points            - Gamification point balances
```

#### **Mood Tracking**
```sql  
checkins               - Daily mood check-ins with AI analysis
point_transactions     - Point system transaction history
mood_patterns         - AI-detected mood trends
```

#### **Activities & Wellness**
```sql
anti_todo_items       - AI-generated wellness activities
anti_todo_lists       - Organized activity collections
activities           - User-created tasks and goals
```

#### **Gamification**
```sql
achievement_definitions - Available achievements
user_achievements      - User achievement progress
plant_growth          - Virtual plant progression
streak_analytics      - Detailed streak tracking
```

#### **Community**
```sql
community_posts       - User-generated content
community_reactions   - Likes, comments, interactions
leaderboards         - Achievement rankings
```

### **Key Features**
- **Row Level Security (RLS)** - Database-level privacy protection
- **Real-time subscriptions** - Live updates for community features
- **Optimized indexes** - Fast query performance
- **Automatic timestamps** - Created/updated tracking
- **Foreign key constraints** - Data integrity enforcement

*📋 For detailed schema documentation, see [db.md](db.md)*

---

## 🤖 AI Integration

### **OpenAI GPT-4o-mini Integration**

#### **Sentiment Analysis**
```javascript
// Mood check-in analysis
const moodAnalysis = await analyzeCheckin({
  text: "Feeling great today, went for a run!",
  context: userPreferences,
  history: recentMoods
});

// Returns: mood_score, confidence, insights, recommendations
```

#### **Anti-Todo Generation**
```javascript
// AI-generated wellness activities
const activities = await generateAntiTodoItems({
  user_mood: currentMood,
  hobbies: userHobbies,
  difficulty: "easy",
  count: 5
});

// Returns: personalized activities based on mood and interests
```

#### **AI Nudges**
```javascript  
// Personalized motivational messages
const nudge = await generateAINudge({
  mood_trend: "declining",
  streak_days: 7,
  achievements: recentAchievements
});

// Returns: contextual encouragement and suggestions
```

### **AI Features**
- **Smart Mood Detection** - Analyzes text for emotional sentiment
- **Personalized Recommendations** - Activities based on individual patterns
- **Contextual Insights** - Mood correlations and trend analysis  
- **Dynamic Content** - Fresh activities and nudges daily
- **Privacy-First** - AI processing respects user privacy

---

## 📧 Email System

### **EmailJS Integration**

#### **Feedback Forms**
- **Navbar Feedback** - Quick feedback from any page
- **Dashboard Feedback** - Detailed feedback with file attachments
- **Automatic Routing** - Emails sent to helpdesk.offly@gmail.com

#### **Features**
```javascript
// Feedback with attachments
const result = await sendFeedbackEmail({
  message: feedbackText,
  userEmail: user.email,           // Uses logged-in user's email
  userName: userProfile.username,   // Uses actual username  
  type: 'Dashboard Feedback',
  attachment: selectedFile         // Optional file attachment
});
```

#### **Email Template**
- **Professional Design** - Branded email template with Offly styling
- **Attachment Support** - File information included in emails
- **User Context** - Sender details and browser information
- **Responsive Layout** - Looks great on all email clients

#### **Fallback System**
- **Primary**: EmailJS direct sending
- **Fallback**: mailto: client opening
- **Error Handling**: Graceful degradation with user feedback

---

## 🛡 Security Features

### **Session Management**
- **24-Hour Timeout** - Automatic logout after 24 hours
- **Warning System** - Visual warning 30 minutes before expiry
- **Session Tracking** - Secure session start time tracking
- **Clean Logout** - Complete session data cleanup

### **Authentication Security**
- **OAuth Integration** - Secure Google authentication
- **Token Refresh** - Automatic token renewal
- **Secure Storage** - Encrypted local storage
- **PKCE Flow** - Enhanced OAuth security

### **Database Security**
- **Row Level Security** - User data isolation
- **Prepared Statements** - SQL injection prevention
- **Input Validation** - Client and server-side validation
- **API Rate Limiting** - Supabase built-in protection

### **Privacy Protection**
- **Data Minimization** - Only collect necessary data
- **User Control** - Users own their data
- **Secure Transmission** - HTTPS everywhere
- **Regular Cleanup** - Automatic old data cleanup

---

## 📚 API Documentation

### **Authentication Endpoints**
```javascript
// Google OAuth sign-in
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: `${origin}/auth/callback` }
});

// Sign out
const { error } = await supabase.auth.signOut();
```

### **Mood Tracking**
```javascript
// Create check-in
const checkin = await createCheckin({
  mood_score: 7,
  notes: "Great day at work!",
  activities: ["exercise", "meditation"]
});

// Get mood analytics
const analytics = await getUserAnalytics(userId);
```

### **Activities**
```javascript
// Generate AI activities
const activities = await generateAntiTodoItems({
  mood: "happy",
  hobbies: ["reading", "cooking"],
  difficulty: "medium"
});

// Complete activity
const result = await completeActivity(activityId);
```

### **Gamification**
```javascript
// Award points
const transaction = await awardPoints(userId, {
  amount: 50,
  reason: "daily_checkin",
  category: "mood_tracking"
});

// Get achievements
const achievements = await getUserAchievements(userId);
```

*📋 For complete API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)*

---

## 💻 Development

### **Available Scripts**

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production  
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues

# Database
npm run db:generate  # Generate database types
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
```

### **Development Workflow**

1. **Feature Development**
   ```bash
   git checkout -b feature/new-feature
   npm run dev
   # Develop feature
   npm run lint
   git commit -m "Add new feature"
   ```

2. **Testing**
   ```bash
   npm run build      # Test production build
   npm run preview    # Test production locally
   ```

3. **Deployment**
   ```bash
   git push origin feature/new-feature
   # Create pull request
   # Merge to main triggers auto-deployment
   ```

### **Code Style**
- **ESLint Configuration** - Enforced code standards
- **Prettier Integration** - Automatic code formatting  
- **Component Structure** - Consistent file organization
- **Naming Conventions** - Clear, descriptive names

### **Performance Optimization**
- **Lazy Loading** - Code splitting for faster loads
- **Image Optimization** - WebP format with fallbacks
- **Bundle Analysis** - Regular bundle size monitoring
- **Caching Strategy** - Optimal cache headers

---

## 🚀 Deployment

### **Vercel Deployment** (Recommended)

1. **Connect Repository**
   ```bash
   # Push to GitHub
   git push origin main
   
   # Import to Vercel
   # vercel.com → Import Project → Select Repository
   ```

2. **Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Ensure production URLs for Supabase callbacks

3. **Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install"
   }
   ```

### **Custom Deployment**

```bash
# Build production version
npm run build

# Upload dist/ folder to your hosting provider
# Configure web server to serve index.html for all routes
```

### **Environment-Specific Configuration**

#### **Production**
- Use production Supabase project
- Enable all security features  
- Configure proper CORS settings
- Set up monitoring and logging

#### **Staging**
- Use separate Supabase project
- Test all integrations
- Validate email templates
- Performance testing

---

## 🤝 Contributing

### **Getting Started**

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/Offly.git
   ```
3. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make changes and commit**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push and create pull request**

### **Development Guidelines**

#### **Code Quality**
- Follow ESLint configuration
- Write descriptive commit messages
- Add comments for complex logic
- Test all features thoroughly

#### **UI/UX Standards**
- Mobile-first responsive design
- Accessible components (ARIA labels)
- Consistent color scheme and typography
- Smooth animations and transitions

#### **Performance Requirements**
- Lighthouse score > 90
- First Contentful Paint < 2s
- Cumulative Layout Shift < 0.1
- Bundle size optimization

### **Pull Request Process**

1. **Ensure all tests pass**
2. **Update documentation if needed**
3. **Add screenshots for UI changes**
4. **Request review from maintainers**
5. **Address review feedback**

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Contact

- **Email**: helpdesk.offly@gmail.com
- **Issues**: [GitHub Issues](https://github.com/offly-prod/Offly/issues)
- **Documentation**: [Full Documentation](docs/)
- **Community**: [Discord Server](https://discord.gg/offly)

---

## 🙏 Acknowledgments

- **OpenAI** - For powerful AI capabilities
- **Supabase** - For excellent backend infrastructure  
- **Vercel** - For seamless deployment
- **Contributors** - For making Offly better every day

---

*Built with ❤️ by the Offly team*

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

1. **Advanced AI**: More sophisticated sentiment analysis
1. **Social Features**: Enhanced community interactions
1. **Mobile App**: Native iOS/Android applications
1. **API Access**: Public API for third-party integrations
1. **Advanced Analytics**: Machine learning insights
1. **Integration**: Calendar and productivity app connections
1- Technical Improvements

- **TypeScript Migration**: Full type safety
- **Testing Suite**: Comprehensive test coverage
- **Performance**: Further optimization and caching
- **Accessibility**: Enhanced accessibility features
- **Internationalization**: Multi-language support

---

## 📄 License

This project is proprietary software. All rights reserved.
