const userRepository = require('../repositories/userRepository');

class UserService {
  async syncUser(uid, email, name, reqBody) {
    let user = await userRepository.findByUid(uid);

    if (user) {
      let isUpdated = false;
      if (reqBody.name && reqBody.name !== user.name) {
        user.name = reqBody.name;
        isUpdated = true;
      }
      if (reqBody.profileData) {
        user.profileData = { ...user.profileData, ...reqBody.profileData };
        isUpdated = true;
      }
      if (reqBody.role && user.role !== reqBody.role) {
        const allowedInitialRoles = ['FARMER', 'BUYER', 'LOGISTICS'];
        if (allowedInitialRoles.includes(reqBody.role.toUpperCase())) {
          user.role = reqBody.role.toUpperCase();
          isUpdated = true;
        }
      }

      if (isUpdated) {
        await userRepository.save(user);
      }
      return { user, isNew: false };
    }

    // Create new user
    const { email: reqEmail, name: reqName, role, mandiId, profileData } = reqBody;
    
    const allowedInitialRoles = ['FARMER', 'BUYER', 'LOGISTICS'];
    let finalRole = 'FARMER';
    if (role && allowedInitialRoles.includes(role.toUpperCase())) {
      finalRole = role.toUpperCase();
    }

    const userData = {
      uid,
      email: email || reqEmail,
      name: reqName || name || 'Farmer',
      role: finalRole,
      mandiId: finalRole === 'MANDI_ADMIN' ? mandiId : undefined,
      profileData: profileData || {}
    };

    user = await userRepository.create(userData);
    return { user, isNew: true };
  }

  async getProfile(uid) {
    return await userRepository.findByUid(uid);
  }

  async updateProfile(uid, profileUpdates) {
    const user = await userRepository.findByUid(uid);
    if (!user) {
      return null;
    }

    const { name, phone, location, cropType, category, aadharNumber, bankAccount, upiId, role, mandiId } = profileUpdates;
    
    if (name) user.name = name;
    
    // Secure Role Update: Prevent users from making themselves admins
    if (role && ['farmer', 'buyer', 'guest'].includes(role)) {
      user.role = role;
    }
    // Only allow mandiId to be set if they are actually a mandi admin (assigned by super admin)
    if (mandiId !== undefined && user.role === 'mandi_admin') {
      user.mandiId = mandiId;
    }
    
    if (!user.profileData) {
      user.profileData = {};
    }
    
    if (phone !== undefined) user.profileData.phone = phone;
    if (location !== undefined) user.profileData.location = location;
    if (cropType !== undefined) user.profileData.cropType = cropType;
    if (category !== undefined) user.profileData.category = category;
    if (aadharNumber !== undefined) user.profileData.aadharNumber = aadharNumber;
    if (bankAccount !== undefined) user.profileData.bankAccount = bankAccount;
    if (upiId !== undefined) user.profileData.upiId = upiId;

    user.markModified('profileData');
    
    await userRepository.save(user);
    return user;
  }
}

module.exports = new UserService();
