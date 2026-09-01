const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const apiKey = process.env.GEMINI_INSIGHTS_API_KEY || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Simple File-Based Cache to save AI Tokens across nodemon restarts
const CACHE_FILE = path.join(__dirname, '../../data/ai_cache.json');
const CACHE_TTL = 1000 * 60 * 60 * 2; // 2 hours
const FALLBACK_TTL = 1000 * 60 * 15;  // 15 mins

// Ensure data dir exists
if (!fs.existsSync(path.join(__dirname, '../../data'))) {
  fs.mkdirSync(path.join(__dirname, '../../data'), { recursive: true });
}

let cache = {};
try {
  if (fs.existsSync(CACHE_FILE)) {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  }
} catch (e) {
  console.error('Failed to load cache:', e);
}

function saveCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
  } catch (e) {
    console.error('Failed to save cache:', e);
  }
}

function cleanAiJson(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  return cleaned;
}

// Static mock data (replace with live DB/API in production)
const yearlyData = [
  { label: '2021', wheat: 1975, paddy: 1940, sugarcane: 290, potato: 1200, tomato: 2000, onion: 1800, maize: 1700 },
  { label: '2022', wheat: 2015, paddy: 2040, sugarcane: 305, potato: 1350, tomato: 2200, onion: 2000, maize: 1850 },
  { label: '2023', wheat: 2125, paddy: 2183, sugarcane: 315, potato: 1250, tomato: 2500, onion: 1700, maize: 1900 },
  { label: '2024', wheat: 2275, paddy: 2203, sugarcane: 340, potato: 1400, tomato: 2800, onion: 2400, maize: 2050 },
  { label: '2025', wheat: 2425, paddy: 2300, sugarcane: 360, potato: 1550, tomato: 3100, onion: 2200, maize: 2150 },
  { label: '2026', wheat: 2500, paddy: 2450, sugarcane: 380, potato: 1600, tomato: 3400, onion: 2500, maize: 2300 },
];

const monthlyData = [
  { label: 'Jan', wheat: 2400, paddy: 2350, sugarcane: 350, potato: 1300, tomato: 2800, onion: 2000, maize: 2050 },
  { label: 'Feb', wheat: 2420, paddy: 2340, sugarcane: 355, potato: 1250, tomato: 2600, onion: 1900, maize: 2080 },
  { label: 'Mar', wheat: 2380, paddy: 2360, sugarcane: 350, potato: 1200, tomato: 2400, onion: 1850, maize: 2100 },
  { label: 'Apr', wheat: 2300, paddy: 2380, sugarcane: 360, potato: 1350, tomato: 2500, onion: 1950, maize: 2150 },
  { label: 'May', wheat: 2250, paddy: 2400, sugarcane: 365, potato: 1400, tomato: 2800, onion: 2100, maize: 2200 },
  { label: 'Jun', wheat: 2320, paddy: 2410, sugarcane: 360, potato: 1450, tomato: 3000, onion: 2300, maize: 2250 },
  { label: 'Jul', wheat: 2350, paddy: 2430, sugarcane: 370, potato: 1500, tomato: 3300, onion: 2400, maize: 2280 },
  { label: 'Aug', wheat: 2410, paddy: 2450, sugarcane: 375, potato: 1550, tomato: 3500, onion: 2600, maize: 2320 },
  { label: 'Sep', wheat: 2450, paddy: 2420, sugarcane: 380, potato: 1600, tomato: 3600, onion: 2700, maize: 2350 },
  { label: 'Oct', wheat: 2480, paddy: 2400, sugarcane: 375, potato: 1550, tomato: 3400, onion: 2500, maize: 2300 },
  { label: 'Nov', wheat: 2510, paddy: 2380, sugarcane: 370, potato: 1450, tomato: 3000, onion: 2200, maize: 2250 },
  { label: 'Dec', wheat: 2500, paddy: 2390, sugarcane: 365, potato: 1400, tomato: 2900, onion: 2100, maize: 2200 },
];

class InsightsService {
  getChartData(timeframe) {
    return timeframe === 'yearly' ? yearlyData : monthlyData;
  }

  async getMarketInsights(timeframe) {
    const chartData = this.getChartData(timeframe);
    const cacheKey = `market_insights_${timeframe}`;

    if (cache[cacheKey]) {
      const cachedEntry = cache[cacheKey];
      if (Date.now() - cachedEntry.timestamp < (cachedEntry.isFallback ? FALLBACK_TTL : CACHE_TTL)) {
        console.log(`[CACHE HIT] Returning cached market insights for: ${timeframe}`);
        return { chartData, insights: cachedEntry.insights, cached: true };
      }
    }

    console.log(`[CACHE MISS] Fetching new market insights for: ${timeframe}`);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
      const prompt = `
        You are an expert agricultural market analyst AI. 
        Analyze the following recent market price data (in INR per quintal) for Wheat, Paddy, and Sugarcane.
        
        Timeframe: ${timeframe}
        Data: ${JSON.stringify(chartData)}
        
        Based on this data, provide two short insights:
        1. A "Market Prediction" explaining which crop is most profitable right now and why prices might be shifting.
        2. A "Spoilage Alert / Logistics Advice" suggesting which crop needs to be sold fastest to prevent loss, based on seasonal trends or price dips.
        
        Format your response strictly as JSON with this structure:
        {
          "prediction": "Your market prediction text here",
          "alert": "Your spoilage alert text here"
        }
        Do not include markdown code blocks like \`\`\`json. Return ONLY valid JSON.
      `;

      const result = await model.generateContent(prompt);
      const aiResponseText = cleanAiJson(result.response.text());

      let aiInsights = {
        prediction: 'Market data analysis is currently unavailable.',
        alert: 'No urgent spoilage alerts.'
      };

      try {
        aiInsights = JSON.parse(aiResponseText);
      } catch (parseError) {
        console.error('Failed to parse AI Insights JSON:', parseError);
      }

      cache[cacheKey] = { timestamp: Date.now(), insights: aiInsights, isFallback: false };
      saveCache();

      return { chartData, insights: aiInsights, cached: false };
    } catch (error) {
      console.error('Insights API Error (Possibly Token Limit Reached)');
      const fallbackInsights = {
        prediction: 'Our AI is currently taking a break due to high traffic. Market seems stable overall based on historical trends.',
        alert: 'No urgent spoilage alerts at the moment. Standard storage practices recommended.'
      };

      cache[cacheKey] = { timestamp: Date.now(), insights: fallbackInsights, isFallback: true };
      saveCache();

      return { chartData, insights: fallbackInsights, cached: true, fallback: true };
    }
  }

  async getMandiPrices(state, district) {
    const cacheKey = `mandi_prices_${state}_${district}`;

    if (cache[cacheKey]) {
      const cachedEntry = cache[cacheKey];
      if (Date.now() - cachedEntry.timestamp < (cachedEntry.isFallback ? FALLBACK_TTL : CACHE_TTL)) {
        console.log(`[CACHE HIT] Returning cached mandi prices for: ${district}, ${state}`);
        return { data: cachedEntry.data, cached: true };
      }
    }

    console.log(`[CACHE MISS] Fetching new mandi prices for: ${district}, ${state}`);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
      const prompt = `
        You are a real-time agricultural data assistant for India.
        Generate a realistic, up-to-date list of the latest Mandi prices for various crops in the district of ${district}, ${state}.
        Return 10-15 different crops commonly grown or sold in this region, ensuring a good mix of grains, vegetables, and fruits (e.g., Potato, Tomato, Onion, Wheat, Paddy, Apple, etc.).
        
        Format your response strictly as a JSON array of objects with this exact structure:
        [
          {
            "crop": "Crop Name (e.g., Wheat, Potato, Bhindi)",
            "mandi": "Realistic Mandi Name in ${district}",
            "price": 2500,
            "unit": "Quintal",
            "trend": "up"
          }
        ]
        
        Ensure the prices reflect realistic current market rates in INR.
        Do not include markdown code blocks like \`\`\`json. Return ONLY valid JSON.
      `;

      const result = await model.generateContent(prompt);
      const aiResponseText = cleanAiJson(result.response.text());

      let pricesData = [];
      try {
        pricesData = JSON.parse(aiResponseText);
      } catch (parseError) {
        console.error('Failed to parse Mandi Prices JSON:', parseError);
        throw new Error('PARSE_ERROR: Failed to parse AI response');
      }

      cache[cacheKey] = { timestamp: Date.now(), data: pricesData, isFallback: false };
      saveCache();

      return { data: pricesData, cached: false };
    } catch (error) {
      console.error('Mandi Prices API Error (Possibly Token Limit Reached)');
      const fallbackData = [
        { crop: 'Wheat', mandi: `Local Mandi, ${district}`, price: 2350, unit: 'Quintal', trend: 'stable' },
        { crop: 'Paddy', mandi: `Local Mandi, ${district}`, price: 2420, unit: 'Quintal', trend: 'up' },
        { crop: 'Potato', mandi: `Local Mandi, ${district}`, price: 1500, unit: 'Quintal', trend: 'down' },
        { crop: 'Tomato', mandi: `Local Mandi, ${district}`, price: 3200, unit: 'Quintal', trend: 'stable' },
        { crop: 'Onion', mandi: `Local Mandi, ${district}`, price: 2100, unit: 'Quintal', trend: 'up' }
      ];

      cache[cacheKey] = { timestamp: Date.now(), data: fallbackData, isFallback: true };
      saveCache();

      return { data: fallbackData, cached: true, fallback: true };
    }
  }
}

module.exports = new InsightsService();
