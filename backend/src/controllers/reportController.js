const { body, validationResult } = require('express-validator');
const Report = require('../models/Report');

// Validation rules for report creation
const createReportValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('category')
    .isIn(['pothole', 'streetlight', 'waste_management', 'water_leak', 'traffic_signal', 'road_damage', 'public_safety', 'noise_complaint', 'other'])
    .withMessage('Invalid category'),
  body('issueType')
    .isIn(['emergency', 'high', 'medium', 'low'])
    .withMessage('Invalid issue type'),
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('location.coordinates.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('location.coordinates.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('reportedBy.name')
    .trim()
    .notEmpty()
    .withMessage('Reporter name is required'),
  body('reportedBy.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('reportedBy.phone')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be 10 digits')
];

// Create new report
const createReport = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const reportData = req.body;

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      reportData.images = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size
      }));
    }

    // Create new report
    const report = new Report(reportData);
    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: {
        report
      }
    });

  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create report',
      error: error.message
    });
  }
};

// Get all reports with filtering and pagination
const getReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      issueType,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (issueType) filter.issueType = issueType;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const reports = await Report.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('assignedTo', 'name email');

    // Get total count for pagination
    const totalReports = await Report.countDocuments(filter);
    const totalPages = Math.ceil(totalReports / parseInt(limit));

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalReports,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
};

// Get single report by ID
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id).populate('assignedTo', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: {
        report
      }
    });

  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error.message
    });
  }
};

// Get reports by category
const getReportsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;

    const reports = await Report.getByCategory(category, parseInt(limit));

    res.json({
      success: true,
      data: {
        category,
        reports,
        count: reports.length
      }
    });

  } catch (error) {
    console.error('Get reports by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports by category',
      error: error.message
    });
  }
};

// Get reports statistics
const getReportsStats = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0]
            }
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0]
            }
          },
          resolved: {
            $sum: {
              $cond: [{ $eq: ["$status", "resolved"] }, 1, 0]
            }
          },
          rejected: {
            $sum: {
              $cond: [{ $eq: ["$status", "rejected"] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Get category breakdown
    const categoryStats = await Report.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          pending: 0,
          inProgress: 0,
          resolved: 0,
          rejected: 0
        },
        categoryBreakdown: categoryStats
      }
    });

  } catch (error) {
    console.error('Get reports stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports statistics',
      error: error.message
    });
  }
};

// Search reports
const searchReports = async (req, res) => {
  try {
    const { q, category, status, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Build search filter
    const filter = {
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'location.address': { $regex: q, $options: 'i' } }
      ]
    };

    // Add additional filters
    if (category) filter.category = category;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('assignedTo', 'name email');

    const totalResults = await Report.countDocuments(filter);

    res.json({
      success: true,
      data: {
        query: q,
        reports,
        totalResults,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalResults / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Search reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  getReportsByCategory,
  getReportsStats,
  searchReports,
  createReportValidation
};