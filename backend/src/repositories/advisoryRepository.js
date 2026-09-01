const AdvisoryHistory = require('../models/AdvisoryHistory');
const CropRecHistory = require('../models/CropRecHistory');

class AdvisoryRepository {
  async findAdvisoryHistoryByUserId(userId) {
    return await AdvisoryHistory.findOne({ userId });
  }

  async createAdvisoryHistory(userId) {
    const historyDoc = new AdvisoryHistory({ userId, messages: [] });
    return await historyDoc.save();
  }

  async saveAdvisoryHistory(historyDoc) {
    return await historyDoc.save();
  }

  async saveCropRecommendation(data) {
    return await CropRecHistory.create(data);
  }
}

module.exports = new AdvisoryRepository();
