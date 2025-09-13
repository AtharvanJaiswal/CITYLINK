const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  updateReportStatus,
  assignReport,
  getUsers,
  updateUserStatus,
  getReportsAnalytics
} = require('../controllers/adminController');

const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics', getReportsAnalytics);

// Report management routes
router.put('/reports/:id/status', updateReportStatus);
router.put('/reports/:reportId/assign', assignReport);

// User management routes
router.get('/users', getUsers);
router.put('/users/:userId/status', updateUserStatus);

module.exports = router;