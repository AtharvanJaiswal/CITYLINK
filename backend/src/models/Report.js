const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be longer than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot be longer than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'pothole',
      'streetlight',
      'waste_management',
      'water_leak',
      'traffic_signal',
      'road_damage',
      'public_safety',
      'noise_complaint',
      'other'
    ]
  },
  issueType: {
    type: String,
    required: [true, 'Issue type is required'],
    enum: ['emergency', 'high', 'medium', 'low'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Invalid latitude'],
        max: [90, 'Invalid latitude']
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Invalid longitude'],
        max: [180, 'Invalid longitude']
      }
    }
  },
  images: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reportedBy: {
    name: {
      type: String,
      required: [true, 'Reporter name is required']
    },
    email: {
      type: String,
      required: [true, 'Reporter email is required'],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    phone: {
      type: String,
      match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number']
    }
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot be longer than 500 characters']
  },
  resolvedAt: {
    type: Date
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  tags: [{
    type: String,
    trim: true
  }],
  votes: {
    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
reportSchema.index({ category: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ priority: -1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });

// Geospatial index for location-based queries
reportSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for days since created
reportSchema.virtual('daysSinceCreated').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Instance method to update status
reportSchema.methods.updateStatus = function(newStatus, adminNotes = '') {
  this.status = newStatus;
  if (adminNotes) {
    this.adminNotes = adminNotes;
  }
  if (newStatus === 'resolved') {
    this.resolvedAt = new Date();
  }
  return this.save();
};

// Static method to get reports by category
reportSchema.statics.getByCategory = function(category, limit = 10) {
  return this.find({ category })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get pending reports
reportSchema.statics.getPendingReports = function() {
  return this.find({ status: 'pending' })
    .sort({ priority: -1, createdAt: 1 });
};

// Pre-save middleware to update priority based on category
reportSchema.pre('save', function(next) {
  if (this.isNew) {
    const highPriorityCategories = ['emergency', 'water_leak', 'public_safety'];
    if (highPriorityCategories.includes(this.category)) {
      this.priority = 5;
    }
  }
  next();
});

module.exports = mongoose.model('Report', reportSchema);