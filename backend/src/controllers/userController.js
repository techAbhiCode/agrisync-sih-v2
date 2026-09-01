const userService = require('../services/userService');

class UserController {
  async sync(req, res) {
    try {
      const { uid, email, name } = req.user;
      
      const { user, isNew } = await userService.syncUser(uid, email, name, req.body);

      if (!isNew) {
        return res.status(200).json({ success: true, message: 'User already synced', user });
      }

      res.status(201).json({
        success: true,
        message: 'User synced successfully to database',
        user
      });
    } catch (error) {
      console.error('Error syncing user:', error);
      res.status(500).json({ error: 'Failed to sync user profile' });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await userService.getProfile(req.user.uid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({ success: true, user });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  async updateProfile(req, res) {
    try {
      const user = await userService.updateProfile(req.user.uid, req.body);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ success: true, message: 'Profile updated successfully', user });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
}

module.exports = new UserController();
