const adminService = require('../services/adminService');

class AdminController {
  async submitMandiRequest(req, res) {
    try {
      const request = await adminService.submitMandiRequest(req.user.uid, req.body);
      res.status(201).json({ success: true, message: 'Request submitted successfully!', request });
    } catch (error) {
      if (error.message.startsWith('VALIDATION:')) {
        return res.status(400).json({ error: error.message.replace('VALIDATION: ', '') });
      }
      if (error.message.startsWith('DUPLICATE:')) {
        return res.status(400).json({ error: error.message.replace('DUPLICATE: ', '') });
      }
      console.error('Error submitting mandi request:', error);
      res.status(500).json({ error: 'Failed to submit request.' });
    }
  }

  async getPendingRequests(req, res) {
    try {
      const requests = await adminService.getPendingRequests();
      res.status(200).json({ success: true, requests });
    } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({ error: 'Failed to fetch requests.' });
    }
  }

  async approveRequest(req, res) {
    try {
      await adminService.approveRequest(req.params.id);
      res.status(200).json({ success: true, message: 'Request approved successfully.' });
    } catch (error) {
      if (error.message.startsWith('NOT_FOUND:')) {
        return res.status(404).json({ error: error.message.replace('NOT_FOUND: ', '') });
      }
      console.error('Error approving request:', error);
      res.status(500).json({ error: 'Failed to approve request.' });
    }
  }

  async rejectRequest(req, res) {
    try {
      await adminService.rejectRequest(req.params.id, req.body.comment);
      res.status(200).json({ success: true, message: 'Request rejected successfully.' });
    } catch (error) {
      if (error.message.startsWith('NOT_FOUND:')) {
        return res.status(404).json({ error: error.message.replace('NOT_FOUND: ', '') });
      }
      console.error('Error rejecting request:', error);
      res.status(500).json({ error: 'Failed to reject request.' });
    }
  }
}

module.exports = new AdminController();
