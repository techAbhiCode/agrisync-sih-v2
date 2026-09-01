const insightsService = require('../services/insightsService');

class InsightsController {
  async getMarket(req, res) {
    try {
      const timeframe = req.query.timeframe || 'monthly';
      const result = await insightsService.getMarketInsights(timeframe);
      res.status(200).json({
        success: true,
        data: result.chartData,
        insights: result.insights,
        cached: result.cached,
        ...(result.fallback && { fallback: true })
      });
    } catch (error) {
      console.error('Insights market error:', error);
      res.status(500).json({ error: 'Failed to fetch market insights' });
    }
  }

  async getMandiPrices(req, res) {
    const { state, district } = req.query;
    try {
      if (!state || !district) {
        return res.status(400).json({ error: 'State and district are required' });
      }

      const result = await insightsService.getMandiPrices(state, district);
      res.status(200).json({
        success: true,
        data: result.data,
        cached: result.cached,
        ...(result.fallback && { fallback: true })
      });
    } catch (error) {
      if (error.message.startsWith('PARSE_ERROR:')) {
        return res.status(500).json({ error: 'Failed to parse AI response' });
      }
      console.error('Mandi prices error:', error);
      res.status(500).json({ error: 'Failed to fetch mandi prices' });
    }
  }
}

module.exports = new InsightsController();
