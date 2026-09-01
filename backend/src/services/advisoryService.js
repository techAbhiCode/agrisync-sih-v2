const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const redisClient = require('../config/redis');
const advisoryRepository = require('../repositories/advisoryRepository');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const cropRecGenAI = new GoogleGenerativeAI(process.env.GEMINI_CROP_REC_API_KEY || process.env.GEMINI_API_KEY);

class AdvisoryService {
  async getAdvisoryHistory(userId) {
    const history = await advisoryRepository.findAdvisoryHistoryByUserId(userId);
    return history ? history.messages : [];
  }

  async askQuestion(userId, question) {
    let historyDoc = await advisoryRepository.findAdvisoryHistoryByUserId(userId);
    if (!historyDoc) {
      historyDoc = await advisoryRepository.createAdvisoryHistory(userId);
    }

    const geminiHistory = historyDoc.messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    historyDoc.messages.push({
      id: Date.now().toString(),
      sender: 'user',
      text: question,
      timestamp: new Date()
    });

    const cacheKey = `advisory_chat_${question.toLowerCase().trim()}`;
    if (redisClient.isReady) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        console.log(`[Cache Hit] Serving AI response for question`);
        const answer = cachedData;
        
        historyDoc.messages.push({
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: answer,
          timestamp: new Date()
        });
        await advisoryRepository.saveAdvisoryHistory(historyDoc);

        return answer;
      }
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const chat = model.startChat({
      history: geminiHistory,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 350,
      },
    });

    const promptToSend = geminiHistory.length === 0 
      ? `You are AgriGenius, an expert virtual agronomist. Keep your advice practical, concise and brief, and focused on crops, fertilizers, pests, diseases, and farming. Question: ${question}`
      : question;

    const result = await chat.sendMessage(promptToSend);
    const answer = result.response.text();

    historyDoc.messages.push({
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: answer,
      timestamp: new Date()
    });

    await advisoryRepository.saveAdvisoryHistory(historyDoc);

    if (redisClient.isReady) {
      await redisClient.setEx(cacheKey, 86400, answer);
    }

    return answer;
  }

  async getCropRecommendations(userId, location) {
    const normalizedLocation = location.toLowerCase().trim();
    const cacheKey = `crop_rec_${normalizedLocation}`;

    if (redisClient.isReady) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        console.log(`[Cache Hit] Serving crop recommendations for ${normalizedLocation}`);
        const parsed = JSON.parse(cachedData);
        
        await advisoryRepository.saveCropRecommendation({
          userId,
          location: parsed.location,
          weather: parsed.weather,
          recommendations: parsed.recommendations,
          expertAdvice: parsed.expertAdvice
        });

        return { cached: true, ...parsed };
      }
    }

    console.log(`[Cache Miss] Fetching fresh data for ${normalizedLocation}`);

    const weatherApiKey = process.env.WEATHER_API_KEY;
    let weatherData = null;
    let weatherString = 'Weather data unavailable.';

    if (weatherApiKey) {
      try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${weatherApiKey}&units=metric`;
        const weatherResponse = await axios.get(weatherUrl, { timeout: 5000 });
        const data = weatherResponse.data;
        weatherData = {
          temp: data.main.temp,
          humidity: data.main.humidity,
          condition: data.weather[0].description,
          city: data.name
        };
        weatherString = `Temperature: ${weatherData.temp}°C, Humidity: ${weatherData.humidity}%, Condition: ${weatherData.condition}`;
      } catch (err) {
        console.error('Weather API Error:', err.message);
      }
    }

    const model = cropRecGenAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const prompt = `Act as an expert agronomist. 
Location: ${location}. 
Current Weather: ${weatherString}.

Please recommend 3 to 4 best crops to plant in this location right now, considering the current weather, general climate of this region, and soil conditions typically found there.

Format your response as a valid JSON object with the following structure exactly (no markdown formatting like \`\`\`json):
{
  "crops": [
    {
      "name": "Crop Name",
      "reason": "Why this crop is suitable here and now",
      "icon": "A suitable emoji for this crop (e.g., 🌾, 🍅, 🥔)"
    }
  ],
  "expertAdvice": "A paragraph of expert advice regarding farming in this location right now, considering the weather."
}`;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();
    
    let jsonString = aiResponse.trim();
    if (jsonString.startsWith('```json')) jsonString = jsonString.slice(7);
    if (jsonString.startsWith('```')) jsonString = jsonString.slice(3);
    if (jsonString.endsWith('```')) jsonString = jsonString.slice(0, -3);
    
    const parsedRecommendation = JSON.parse(jsonString.trim());

    const responsePayload = {
      location: weatherData ? weatherData.city : location,
      weather: weatherData,
      recommendations: parsedRecommendation.crops,
      expertAdvice: parsedRecommendation.expertAdvice
    };

    if (redisClient.isReady) {
      await redisClient.setEx(cacheKey, 43200, JSON.stringify(responsePayload));
    }

    await advisoryRepository.saveCropRecommendation({
      userId,
      location: responsePayload.location,
      weather: responsePayload.weather,
      recommendations: responsePayload.recommendations,
      expertAdvice: responsePayload.expertAdvice
    });

    return { cached: false, ...responsePayload };
  }
}

module.exports = new AdvisoryService();
