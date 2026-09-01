const advisoryService = require('../services/advisoryService');

class AdvisoryController {
  async getHistory(req, res) {
    try {
      const userId = req.user.uid;
      const messages = await advisoryService.getAdvisoryHistory(userId);
      res.status(200).json({ messages });
    } catch (error) {
      console.error('Fetch Advisory History Error:', error);
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  }

  async askAdvisory(req, res) {
    try {
      const userId = req.user.uid;
      const { question } = req.body;
      
      if (!question || question.trim().length === 0) {
        return res.status(400).json({ error: 'Question cannot be empty' });
      }

      const answer = await advisoryService.askQuestion(userId, question);

      res.status(200).json({
        success: true,
        answer: answer
      });
    } catch (error) {
      console.error('Advisory API Error:', error);
      res.status(500).json({ error: 'Failed to process your request with AI.' });
    }
  }

  async recommendCrops(req, res) {
    try {
      const { location } = req.query;
      if (!location) {
        return res.status(400).json({ success: false, error: 'Location is required' });
      }

      const userId = req.user.uid;
      const responsePayload = await advisoryService.getCropRecommendations(userId, location);

      res.status(200).json({
        success: true,
        ...responsePayload
      });
    } catch (error) {
      console.error('Crop Recommendation API Error:', error);
      res.status(500).json({ success: false, error: 'Failed to generate recommendations.' });
    }
  }
}

module.exports = new AdvisoryController();
