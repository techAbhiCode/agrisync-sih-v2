const User = require('../models/User');

class UserRepository {
  async findByUid(uid) {
    return await User.findOne({ uid });
  }

  async save(user) {
    return await user.save();
  }

  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }
}

module.exports = new UserRepository();
