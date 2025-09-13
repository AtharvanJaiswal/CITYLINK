const express = require('express');
const router = express.Router();

const {
  createReport,
  getReports,
  getReportById,
  getReportsByCategory,
  getReportsStats,
  searchReports,
  createReportValidation
} = require('../controllers/reportController');

const { uploadMultiple, handleUploadError } = require('../middleware/upload');
const { optionalAuth } = require('../middleware/auth');

// Public routes
router.post('/', uploadMultiple, handleUploadError, createReportValidation, createReport);
router.get('/', optionalAuth, getReports);
router.get('/stats', getReportsStats);
router.get('/search', searchReports);
router.get('/category/:category', getReportsByCategory);
router.get('/:id', getReportById);

module.exports = router;