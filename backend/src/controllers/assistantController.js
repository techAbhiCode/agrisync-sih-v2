const { GoogleGenAI } = require('@google/genai');
const AiHistory = require('../models/AiHistory');
const UserPreference = require('../models/UserPreference');

// Initialize the Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_VOICE_KEY });

const processCommand = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // We expect the user to be authenticated, yielding req.user
    // If testing without full auth, you might use a fallback or ensure req.user exists
    const userId = req.user ? (req.user.uid || req.user.id || req.user._id) : 'anonymous';

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Fetch user preferences
    let prefs = null;
    if (userId !== 'anonymous') {
      prefs = await UserPreference.findOne({ userId });
    }

    // Fetch the last 10 interactions for context
    let history = [];
    if (userId !== 'anonymous') {
      history = await AiHistory.find({ userId })
        .sort({ timestamp: -1 })
        .limit(10);
      history.reverse(); // chronological order
    }

    // Format history for Gemini contents array
    const contents = history.map((item) => ({
      role: item.role,
      parts: [{ text: item.message }]
    }));
    
    // Append the new prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const prefString = prefs ? JSON.stringify(prefs) : 'No specific preferences recorded yet.';

    const systemInstruction = `
      You are AgriSync AI, a highly advanced J.A.R.V.I.S-like agricultural voice assistant for India's smartest agricultural management platform.
      Your primary role is to assist farmers, hub managers, and logistics personnel by navigating them through the platform or answering their agricultural queries.

      The current user's preferences (learned over time) are: ${prefString}.
      Use these preferences to anticipate their needs and personalize your responses.

      You MUST ALWAYS respond with a structured JSON object exactly matching one of these schema types depending on the user's intent:

      1. If the user wants to navigate to a page (e.g., "book a slot", "show me market trends", "go to dashboard", "open logistics map"), return:
         { "action": "NAVIGATE", "route": "<react_router_path>", "message": "<short conversational response to speak aloud>" }
         Valid routes: "/dashboard", "/booking", "/market-trends", "/advisory", "/logistics", "/virtual-token".

      2. If the user explicitly states a preference (e.g., "I only grow Wheat", "Always book at Kanpur Hub", "I speak Hindi"), return:
         { "action": "LEARN", "data": { "<preference_key>": "<preference_value>" }, "message": "<acknowledgment to speak aloud>" }
         Example data keys: "preferredCrops", "frequentMandis", "languagePreference".

      3. If the user is reporting a delay for their current booking (e.g., "I'm stuck in traffic", "It's raining heavily", "I will be late"), return:
         { "action": "REPORT_DELAY", "reason": "<extracted reason>", "message": "<acknowledgment to speak aloud>" }

      4. If the user is just asking a question (e.g., "What is the price of wheat?", "How's the weather?"), return:
         { "action": "SPEAK", "message": "<conversational answer to speak aloud>" }

      Rules:
      - Do NOT output any markdown, code blocks, or text outside the JSON object.
      - Ensure valid JSON format.
      - Keep the "message" concise, friendly, and helpful.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text;
    
    let aiResponseObj;
    try {
      aiResponseObj = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Gemini JSON output:', responseText);
      aiResponseObj = { action: 'SPEAK', message: 'I encountered an error understanding that command.' };
    }

    // Handle LEARN action silently
    if (aiResponseObj.action === 'LEARN' && userId !== 'anonymous') {
      try {
        const updateData = {};
        for (const [key, value] of Object.entries(aiResponseObj.data)) {
          if (['preferredCrops', 'frequentMandis'].includes(key)) {
            // Push to array if it's an array field
            if (!updateData.$addToSet) updateData.$addToSet = {};
            updateData.$addToSet[key] = value;
          } else {
            if (!updateData.$set) updateData.$set = {};
            updateData.$set[key] = value;
          }
        }
        
        await UserPreference.findOneAndUpdate(
          { userId },
          updateData,
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error('Failed to update UserPreference', err);
      }
      
      // Override the action so the frontend just speaks the message without knowing about LEARN
      aiResponseObj.action = 'SPEAK';
    }

    // Save to history
    if (userId !== 'anonymous') {
      await AiHistory.create({ userId, role: 'user', message: prompt });
      await AiHistory.create({ userId, role: 'model', message: JSON.stringify(aiResponseObj) });
    }

    res.json(aiResponseObj);

  } catch (error) {
    console.error('Error in assistantController processCommand:', error);
    res.status(500).json({ error: 'Internal Server Error processing command' });
  }
};

module.exports = {
  processCommand
};
