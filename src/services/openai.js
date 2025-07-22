const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

class OpenAIService {
  constructor() {
    if (!OPENAI_API_KEY) {
      console.warn("OpenAI API key not found. AI features will be disabled.");
    }
  }

  async generateAINudge(userProfile, recentCheckins, currentMood) {
    if (!OPENAI_API_KEY) {
      return this.getFallbackNudge(currentMood);
    }

    try {
      const prompt = this.buildNudgePrompt(
        userProfile,
        recentCheckins,
        currentMood,
      );

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
              content: `You are Offly's AI companion, a supportive and empathetic assistant designed to help users improve their emotional well-being. Your role is to provide personalized nudges, encouragement, and actionable suggestions based on their mood and check-in patterns.

Key guidelines:
- Keep responses brief (1-2 sentences, max 150 characters)
- Be supportive, not preachy
- Use warm, friendly language
- Provide actionable suggestions when appropriate
- Acknowledge their current emotional state
- Encourage consistency in check-ins
- Use emojis sparingly but effectively
- Focus on small, achievable actions`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 100,
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
      };
    } catch (error) {
      console.error("Error generating AI nudge:", error);
      return this.getFallbackNudge(currentMood);
    }
  }

  async analyzeSentiment(text) {
    if (!OPENAI_API_KEY || !text) {
      return this.getFallbackSentiment(text);
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
              content:
                "You are a sentiment analysis expert. Analyze the emotional tone of the given text and return a sentiment score between 1.0 (very negative) and 5.0 (very positive). Respond with only a number between 1.0 and 5.0.",
            },
            {
              role: "user",
              content: `Analyze the sentiment of this text: "${text}"`,
            },
          ],
          max_tokens: 10,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const scoreText = data.choices[0].message.content.trim();
      const score = parseFloat(scoreText);

      if (isNaN(score) || score < 1.0 || score > 5.0) {
        return this.getFallbackSentiment(text);
      }

      return {
        success: true,
        score: Math.round(score * 10) / 10,
        type: "ai_analyzed",
      };
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      return this.getFallbackSentiment(text);
    }
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

  // Generate motivational content for streaks
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
              content:
                "You are celebrating a user's check-in streak. Generate a brief, enthusiastic message (max 100 characters) that acknowledges their consistency and motivates them to continue.",
            },
            {
              role: "user",
              content: `The user has maintained a ${streakDays}-day check-in streak. Generate a celebratory message.`,
            },
          ],
          max_tokens: 50,
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
    if (streakDays === 1) {
      return {
        success: true,
        message: "Great start! Day 1 of your journey! 🌟",
        type: "fallback",
      };
    } else if (streakDays <= 7) {
      return {
        success: true,
        message: `${streakDays} days strong! You're building momentum! 🔥`,
        type: "fallback",
      };
    } else if (streakDays <= 30) {
      return {
        success: true,
        message: `${streakDays} days! You're creating a beautiful habit! ✨`,
        type: "fallback",
      };
    } else {
      return {
        success: true,
        message: `${streakDays} days! You're an inspiration! Keep going! 🏆`,
        type: "fallback",
      };
    }
  }

  // Generate personalized anti-to-do activities
  async generateAntiToDoActivities(userPreferences, completedActivities = [], count = 5) {
    if (!OPENAI_API_KEY) {
      return this.getFallbackAntiTodoActivities(userPreferences);
    }

    try {
      const prompt = this.buildAntiToDoPrompt(
        userPreferences,
        completedActivities,
        count,
      );

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
              content: `You are Offly's anti-todo activity generator. Generate mindful, experience-focused activities that help users break away from productivity culture and focus on present-moment awareness and joy.

Response format: Return ONLY a JSON array without any markdown formatting:
[
  {"content": "Activity description here"},
  {"content": "Another activity description"},
  ...
]

Guidelines:
- Activities should be about BEING, not DOING
- Focus on mindfulness, presence, and sensory experiences
- NO productivity, tasks, or goal-oriented activities
- Activities should be simple and immediately doable
- Use warm, inviting language
- Consider user's hobbies and preferences when relevant
- Avoid activities they've recently completed
- Examples: "Notice 5 different sounds around you right now", "Feel the texture of 3 different objects", "Watch clouds move for 10 minutes"`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 600,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      let activitiesText = data.choices[0].message.content.trim();
      
      // Remove markdown formatting if present
      activitiesText = activitiesText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      // Parse JSON response
      let activities;
      try {
        activities = JSON.parse(activitiesText);
      } catch (parseError) {
        console.error("Failed to parse AI activities:", parseError);
        console.error("Raw AI response:", activitiesText);
        return this.getFallbackAntiTodoActivities(userPreferences);
      }

      // Ensure we have the right format
      if (!Array.isArray(activities)) {
        console.error("AI response is not an array:", activities);
        return this.getFallbackAntiTodoActivities(userPreferences);
      }

      // Format activities for our system
      const formattedActivities = activities.slice(0, count).map((activity) => ({
        content: activity.content || activity.title || activity.description || activity,
      }));

      return {
        success: true,
        activities: formattedActivities,
        type: "ai_generated",
      };
    } catch (error) {
      console.error("Error generating anti-todo activities:", error);
      return this.getFallbackAntiTodoActivities(userPreferences);
    }
  }

  buildAntiToDoPrompt(userPreferences, completedActivities, count) {
    const { hobbies = [], username = 'User', isInitial = false, isRegeneration = false } = userPreferences;
    
    let prompt = `Generate ${count} personalized anti-todo activities for ${username}. `;

    if (isInitial) {
      prompt += `This is their first set of activities. `;
    } else if (isRegeneration) {
      prompt += `This is a regeneration - create fresh, different activities. `;
    }

    if (hobbies && hobbies.length > 0) {
      prompt += `User's interests include: ${hobbies.join(', ')}. `;
      prompt += `Incorporate these interests into mindful, present-moment activities. `;
    }

    if (completedActivities && completedActivities.length > 0) {
      prompt += `They have previously completed these activities, so generate completely different ones: ${completedActivities.slice(0, 10).join('; ')}. `;
    }

    prompt += `Generate ${count} unique anti-todo activities focused on mindful presence and sensory awareness. `;
    prompt += `Each activity should help them slow down and connect with the present moment. `;
    prompt += `Avoid any goal-oriented or productive activities.`;

    return prompt;
  }

  getIconFromName(iconName) {
    // Import statements should be at component level, so we'll just return the icon name
    // The Dashboard component will handle the actual icon mapping
    return iconName || "Sparkles";
  }

  getFallbackAntiTodoActivities(userPreferences = {}) {
    const fallbackActivities = [
      { content: "Feel the temperature of the air on your skin for 2 minutes" },
      { content: "Listen to the sounds around you without trying to identify them" },
      { content: "Notice 5 different textures within arm's reach" },
      { content: "Watch your breath naturally flow in and out for 10 breaths" },
      { content: "Look out a window and simply observe what you see" },
      { content: "Feel your feet touching the ground or floor" },
      { content: "Notice the weight of your body in your current position" },
      { content: "Observe the play of light and shadow in your space" },
      { content: "Count backward from 100 without rushing" },
      { content: "Hold an object and explore its temperature, weight, and texture" },
    ];

    // Shuffle and select a subset
    const shuffled = fallbackActivities.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    return {
      success: true,
      activities: selected,
      type: "fallback",
    };
  }
}

export const openaiService = new OpenAIService();
export default openaiService;
