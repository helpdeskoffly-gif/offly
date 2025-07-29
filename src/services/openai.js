const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

class OpenAIService {
  constructor() {
    if (!OPENAI_API_KEY) {
      console.warn("OpenAI API key not found. AI features will be disabled.");
    }
  }

  // Enhanced sentiment analysis using emoji + text
  async analyzeCustomerSentiment(emoji, text, userProfile = null) {
    if (!OPENAI_API_KEY) {
      return this.getFallbackSentimentAnalysis(emoji, text);
    }

    try {
      // Convert emoji to mood score for context
      const emojiScore = this.convertEmojiToScore(emoji);
      
      const prompt = `Analyze the customer sentiment based on:
- Emoji: ${emoji} (mood score: ${emojiScore}/10)
- User text: "${text || 'No text provided'}"
- User context: ${userProfile ? `Streak: ${userProfile.currentStreak} days, Total checkins: ${userProfile.totalCheckins}` : 'No profile data'}

IMPORTANT GUIDELINES FOR SENTIMENT ANALYSIS:
- POSITIVE indicators: joy, happiness, satisfaction, pride, achievement, love, care, helping others, feeling powerful/strong, gratitude, excitement, contentment
- NEGATIVE indicators: sadness, anger, frustration, stress, anxiety, depression, loneliness, disappointment, fear, helplessness
- NEUTRAL indicators: routine activities, factual statements without emotional content, simple observations

Pay special attention to:
- Words like "enjoying", "powerful", "love", "care", "helping" = POSITIVE
- Words like "stressing myself" can be complex - if they're doing it willingly and feeling good about it = POSITIVE
- Achievement language = POSITIVE
- Caregiving/helping others language = POSITIVE

Provide a detailed sentiment analysis in JSON format:
{
  "sentiment_score": 1-5 (1=very negative, 5=very positive),
  "sentiment_label": "very_negative|negative|neutral|positive|very_positive",
  "emotional_state": "brief description of emotional state",
  "key_emotions": ["array", "of", "primary", "emotions"],
  "context_insights": "what the sentiment reveals about their current situation",
  "support_needs": "what kind of support they might need"
}

Respond with only valid JSON.`;

      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are an expert in emotional intelligence and sentiment analysis. Your role is to accurately identify and classify user emotions.

KEY PRINCIPLES:
1. POSITIVE emotions include: joy, happiness, satisfaction, pride, achievement, love, care, helping others, feeling powerful/strong, gratitude, excitement, contentment
2. NEGATIVE emotions include: sadness, anger, frustration, stress, anxiety, depression, loneliness, disappointment, fear, helplessness
3. Pay special attention to achievement language, caregiving language, and expressions of personal strength
4. When someone mentions "stressing myself" but follows with positive outcomes like "feeling powerful" or "enjoying helping others", this is POSITIVE
5. Helping others and feeling good about it is POSITIVE, even if it involves some stress
6. Personal growth and achievement language is POSITIVE

Analyze user emotions accurately and provide actionable insights.`
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 300,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.choices[0].message.content.trim();
      
      try {
        const sentimentData = JSON.parse(responseText);
        return {
          success: true,
          sentiment_score: sentimentData.sentiment_score,
          sentiment_label: sentimentData.sentiment_label,
          emotional_state: sentimentData.emotional_state,
          key_emotions: sentimentData.key_emotions,
          context_insights: sentimentData.context_insights,
          support_needs: sentimentData.support_needs,
          type: "ai_analyzed"
        };
      } catch (parseError) {
        console.error("Error parsing sentiment response:", parseError);
        return this.getFallbackSentimentAnalysis(emoji, text);
      }
    } catch (error) {
      console.error("Error analyzing customer sentiment:", error);
      return this.getFallbackSentimentAnalysis(emoji, text);
    }
  }

  // Generate personalized AI nudges based on sentiment analysis
  async generatePersonalizedNudge(sentimentAnalysis, userProfile, recentCheckins) {
    if (!OPENAI_API_KEY) {
      return this.getFallbackNudge(sentimentAnalysis.sentiment_label);
    }

    try {
      const prompt = `Generate a personalized, supportive nudge based on this sentiment analysis:

SENTIMENT DATA:
- Score: ${sentimentAnalysis.sentiment_score}/5
- Label: ${sentimentAnalysis.sentiment_label}
- Emotional State: ${sentimentAnalysis.emotional_state}
- Key Emotions: ${sentimentAnalysis.key_emotions.join(', ')}
- Context: ${sentimentAnalysis.context_insights}
- Support Needs: ${sentimentAnalysis.support_needs}

USER CONTEXT:
- Username: ${userProfile?.username || 'User'}
- Current Streak: ${userProfile?.currentStreak || 0} days
- Total Checkins: ${userProfile?.totalCheckins || 0}
- Recent Moods: ${recentCheckins?.slice(0, 3).map(c => c.mood_emoji).join(', ') || 'None'}

GUIDELINES:
- Keep response under 120 characters
- Be empathetic and supportive
- Provide actionable, gentle suggestions
- Acknowledge their emotional state
- Use warm, encouraging language
- Include 1-2 relevant emojis
- Focus on small, achievable actions
- Don't be preachy or dismissive

Generate a personalized nudge that addresses their specific emotional needs.`;

      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are Offly's empathetic AI companion. Generate supportive, personalized nudges that help users feel understood and encouraged."
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        nudge: data.choices[0].message.content.trim(),
        type: "ai_generated",
        sentiment_based: true,
        emotional_context: sentimentAnalysis.emotional_state
      };
    } catch (error) {
      console.error("Error generating personalized nudge:", error);
      return this.getFallbackNudge(sentimentAnalysis.sentiment_label);
    }
  }

  // Legacy method for backward compatibility
  async generateAINudge(userProfile, recentCheckins, currentMood) {
    // Use the new personalized approach
    const sentimentAnalysis = await this.analyzeCustomerSentiment(currentMood, "", userProfile);
    return this.generatePersonalizedNudge(sentimentAnalysis, userProfile, recentCheckins);
  }

  // Legacy sentiment analysis for backward compatibility
  async analyzeSentiment(text) {
    const sentimentAnalysis = await this.analyzeCustomerSentiment("🙂", text);
    return {
      success: sentimentAnalysis.success,
      score: sentimentAnalysis.sentiment_score,
      type: sentimentAnalysis.type
    };
  }

  // Helper method to convert emoji to score
  convertEmojiToScore(emoji) {
    const emojiScoreMap = {
      '😭': 1, '😢': 2, '😔': 3, '😐': 4, '🙂': 5,
      '😊': 6, '😄': 7, '😁': 8, '🤩': 9, '🥳': 10,
      '😢': 2, '😔': 3, '😐': 4, '🙂': 5, '😊': 6,
      '😄': 7, '🥰': 8, '😎': 7, '🤗': 8, '🥳': 10
    };
    return emojiScoreMap[emoji] || 5;
  }

  // Enhanced fallback sentiment analysis
  getFallbackSentimentAnalysis(emoji, text) {
    const emojiScore = this.convertEmojiToScore(emoji);
    let textScore = 3; // Neutral base
    
    if (text) {
      const positiveWords = [
        'good', 'great', 'happy', 'amazing', 'wonderful', 'love', 'perfect', 'awesome',
        'enjoying', 'enjoy', 'powerful', 'strong', 'care', 'helping', 'help', 'achieve',
        'achievement', 'proud', 'pride', 'satisfied', 'content', 'grateful', 'excited',
        'thrilled', 'blessed', 'fulfilled', 'accomplished', 'successful', 'victory'
      ];
      const negativeWords = [
        'bad', 'terrible', 'sad', 'awful', 'hate', 'horrible', 'depressed', 'angry',
        'frustrated', 'lonely', 'scared', 'fear', 'worried', 'anxious', 'stressed',
        'overwhelmed', 'hopeless', 'miserable', 'disappointed', 'upset'
      ];
      
      const lowerText = text.toLowerCase();
      let positiveCount = 0;
      let negativeCount = 0;
      
      positiveWords.forEach(word => {
        if (lowerText.includes(word)) positiveCount++;
      });
      
      negativeWords.forEach(word => {
        if (lowerText.includes(word)) negativeCount++;
      });
      
      // Special handling for complex positive statements
      if (lowerText.includes('enjoying') && lowerText.includes('powerful')) {
        positiveCount += 2; // Boost for achievement language
      }
      if (lowerText.includes('care') && lowerText.includes('people')) {
        positiveCount += 2; // Boost for caregiving language
      }
      if (lowerText.includes('stressing') && lowerText.includes('enjoying')) {
        positiveCount += 1; // Positive if they enjoy the stress
      }
      
      if (positiveCount > negativeCount) {
        textScore = 4;
      } else if (negativeCount > positiveCount) {
        textScore = 2;
      }
    }
    
    // Combine emoji and text scores
    const combinedScore = Math.round((emojiScore * 0.6 + textScore * 0.4) / 2);
    
    const sentimentLabels = {
      1: 'very_negative',
      2: 'negative', 
      3: 'neutral',
      4: 'positive',
      5: 'very_positive'
    };
    
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

  buildNudgePrompt(userProfile, recentCheckins, currentMood) {
    const {
      username,
      current_streak,
      today_average_sentiment,
      overall_average_sentiment,
    } = userProfile;

    let prompt = `User ${username} just checked in with mood: ${currentMood}. `;

    if (current_streak > 0) {
      prompt += `They have a ${current_streak}-day streak. `;
    }

    if (today_average_sentiment) {
      prompt += `Today's average mood: ${today_average_sentiment}/5. `;
    }

    if (overall_average_sentiment) {
      prompt += `Overall average: ${overall_average_sentiment}/5. `;
    }

    if (recentCheckins && recentCheckins.length > 0) {
      const recentMoods = recentCheckins
        .slice(0, 3)
        .map((c) => c.mood_emoji)
        .join(", ");
      prompt += `Recent moods: ${recentMoods}. `;
    }

    prompt += "Generate a supportive, personalized nudge or encouragement.";

    return prompt;
  }

  getFallbackNudge(currentMood) {
    const fallbackNudges = {
      "😢": "It's okay to feel sad sometimes. Take a deep breath and know that this feeling will pass. 💙",
      "😔": "Tough moments don't last, but resilient people like you do. You're stronger than you know! 💪",
      "😐": "Neutral days are part of life's rhythm. Maybe try something small that usually brings you joy? 🌱",
      "🙂": "A gentle smile can be the start of something beautiful. Keep that positive energy flowing! ✨",
      "😊": "Your happiness is contagious! Share that beautiful energy with the world today. 🌟",
      "😭": "Let those tears flow - they're healing. Remember, you're not alone in this journey. 🤗",
      "😞": "Every sunset leads to a sunrise. Tomorrow holds new possibilities for you. 🌅",
      "😕": "Feeling a bit off? That's totally normal. Maybe a walk or your favorite song could help? 🎵",
      "😌": "There's something peaceful about your vibe today. Enjoy this moment of calm. 🍃",
      "😄": "Your joy is absolutely radiant today! Keep spreading those good vibes. 🌈",
      "😡": "Strong feelings deserve to be acknowledged. Take some deep breaths and be gentle with yourself. 🌊",
      "😤": "Feeling frustrated? Channel that energy into something positive for yourself today. ⚡",
      "😎": "Looking cool and confident! Your self-assurance is inspiring. Keep shining! 😎",
      "🤗": "Your warmth brightens the world around you. That caring heart of yours is a gift. 💕",
      "🥳": "Celebration mode activated! Your excitement is absolutely infectious. Enjoy every moment! 🎉",
    };

    const defaultNudge =
      "Thanks for checking in! Every moment of self-awareness is a step toward growth. 🌱";

    return {
      success: true,
      nudge: fallbackNudges[currentMood] || defaultNudge,
      type: "fallback",
    };
  }

  getFallbackSentiment(text) {
    if (!text) return { success: true, score: 3.0, type: "fallback" };

    // Simple keyword-based sentiment analysis
    const positiveWords = [
      "good",
      "great",
      "happy",
      "amazing",
      "wonderful",
      "excellent",
      "love",
      "perfect",
      "awesome",
      "fantastic",
      "brilliant",
      "outstanding",
      "incredible",
      "marvelous",
      "superb",
    ];
    const negativeWords = [
      "bad",
      "terrible",
      "sad",
      "awful",
      "hate",
      "horrible",
      "worst",
      "depressed",
      "angry",
      "frustrated",
      "disappointed",
      "miserable",
      "devastating",
      "dreadful",
      "pathetic",
    ];
    const neutralWords = [
      "okay",
      "fine",
      "alright",
      "normal",
      "average",
      "regular",
      "usual",
      "typical",
    ];

    const lowerText = text.toLowerCase();

    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    positiveWords.forEach((word) => {
      if (lowerText.includes(word)) positiveCount++;
    });

    negativeWords.forEach((word) => {
      if (lowerText.includes(word)) negativeCount++;
    });

    neutralWords.forEach((word) => {
      if (lowerText.includes(word)) neutralCount++;
    });

    let score = 3.0; // Base neutral score

    if (positiveCount > negativeCount) {
      score = 3.5 + positiveCount * 0.3;
    } else if (negativeCount > positiveCount) {
      score = 2.5 - negativeCount * 0.3;
    } else if (neutralCount > 0) {
      score = 3.0;
    }

    // Ensure score stays within bounds
    score = Math.max(1.0, Math.min(5.0, score));

    return {
      success: true,
      score: Math.round(score * 10) / 10,
      type: "fallback",
    };
  }

  async generateStreakCelebration(streakDays) {
    if (!OPENAI_API_KEY) {
      return this.getFallbackStreakMessage(streakDays);
    }

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are Offly's celebration assistant. Generate exciting, motivational messages for user achievements and streaks. Keep messages under 100 characters and include relevant emojis.",
            },
            {
              role: "user",
              content: `Generate a celebration message for a ${streakDays}-day check-in streak. Make it exciting and motivating!`,
            },
          ],
          max_tokens: 100,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: data.choices[0].message.content.trim(),
        type: "ai_generated",
      };
    } catch (error) {
      console.error("Error generating streak celebration:", error);
      return this.getFallbackStreakMessage(streakDays);
    }
  }

  getFallbackStreakMessage(streakDays) {
    const messages = {
      1: "🎉 First day of your wellness journey! Keep going!",
      2: "🔥 Two days strong! You're building amazing habits!",
      3: "💪 Three days in a row! You're unstoppable!",
      4: "🌟 Four days of consistency! You're doing great!",
      5: "🏆 Five days! You're creating positive change!",
      7: "🎊 A full week! You're absolutely crushing it!",
      10: "🚀 Double digits! You're a wellness warrior!",
      14: "💎 Two weeks strong! You're building lasting habits!",
      21: "👑 Three weeks! You're forming incredible routines!",
      30: "🏅 A full month! You're absolutely incredible!",
    };

    return {
      success: true,
      message: messages[streakDays] || `🎉 ${streakDays} days strong! Keep up the amazing work!`,
      type: "fallback",
    };
  }

  async generateAntiToDoActivities(userPreferences, completedActivities = [], count = 5) {
    if (!OPENAI_API_KEY) {
      return this.getFallbackAntiTodoActivities(userPreferences);
    }

    try {
      const prompt = this.buildAntiToDoPrompt(userPreferences, completedActivities, count);

      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are Offly's activity suggestion assistant. Generate personalized, enjoyable activities that help users improve their well-being and mood.

Key guidelines:
- Suggest activities that are easy to start and complete
- Focus on activities that bring joy and relaxation
- Consider user preferences and interests
- Avoid suggesting activities they've recently completed
- Keep descriptions brief but engaging
- Include a variety of activity types (physical, creative, social, etc.)
- Make suggestions feel personal and achievable`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.choices[0].message.content.trim();

      // Parse the response to extract activities
      const activities = this.parseAntiToDoResponse(responseText, count);

      return {
        success: true,
        activities: activities,
        type: "ai_generated",
      };
    } catch (error) {
      console.error("Error generating anti-todo activities:", error);
      return this.getFallbackAntiTodoActivities(userPreferences);
    }
  }

  buildAntiToDoPrompt(userPreferences, completedActivities, count) {
    let prompt = `Generate ${count} personalized activity suggestions for a user with these preferences:`;

    if (userPreferences.hobbies && userPreferences.hobbies.length > 0) {
      prompt += `\n- Hobbies: ${userPreferences.hobbies.join(", ")}`;
    }

    if (userPreferences.goals && userPreferences.goals.length > 0) {
      prompt += `\n- Goals: ${userPreferences.goals.join(", ")}`;
    }

    if (completedActivities && completedActivities.length > 0) {
      prompt += `\n- Recently completed activities: ${completedActivities.join(", ")}`;
      prompt += `\n(Avoid suggesting these activities again)`;
    }

    prompt += `\n\nGenerate ${count} activities in this JSON format:
[
  {
    "title": "Activity name",
    "description": "Brief description",
    "category": "physical|creative|social|mindfulness|learning|fun",
    "icon": "Coffee|Book|Music|Camera|Heart|Palette|Sun|Lightbulb|Target|Smile|Sparkles"
  }
]`;

    return prompt;
  }

  parseAntiToDoResponse(responseText, expectedCount) {
    try {
      // Try to parse as JSON first
      const activities = JSON.parse(responseText);
      if (Array.isArray(activities)) {
        return activities.slice(0, expectedCount);
      }
    } catch (error) {
      // If JSON parsing fails, try to extract activities from text
      console.log("Failed to parse JSON, trying text extraction");
    }

    // Fallback: return default activities
    return this.getFallbackAntiTodoActivities().activities;
  }

  getIconFromName(iconName) {
    const iconMap = {
      Coffee: "☕",
      Book: "📚",
      Music: "🎵",
      Camera: "📸",
      Heart: "❤️",
      Palette: "🎨",
      Sun: "☀️",
      Lightbulb: "💡",
      Target: "🎯",
      Smile: "😊",
      Sparkles: "✨",
    };
    return iconMap[iconName] || "✨";
  }

  getFallbackAntiTodoActivities(userPreferences = {}) {
    const defaultActivities = [
      {
        title: "Take a mindful walk",
        description: "Step outside and notice the world around you",
        category: "physical",
        icon: "Sun",
      },
      {
        title: "Listen to your favorite music",
        description: "Put on some tunes that make you feel good",
        category: "fun",
        icon: "Music",
      },
      {
        title: "Write in a journal",
        description: "Express your thoughts and feelings on paper",
        category: "creative",
        icon: "Book",
      },
      {
        title: "Call a friend",
        description: "Reach out to someone you care about",
        category: "social",
        icon: "Heart",
      },
      {
        title: "Try a new hobby",
        description: "Explore something that interests you",
        category: "learning",
        icon: "Lightbulb",
      },
    ];

    return {
      success: true,
      activities: defaultActivities,
      type: "fallback",
    };
  }

  async generateResponse(prompt) {
    if (!OPENAI_API_KEY) {
      return { success: false, response: "AI features are currently unavailable." };
    }

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        response: data.choices[0].message.content.trim(),
      };
    } catch (error) {
      console.error("Error generating response:", error);
      return { success: false, response: "Sorry, I'm having trouble generating a response right now." };
    }
  }
}

export const openaiService = new OpenAIService();
export default openaiService;
