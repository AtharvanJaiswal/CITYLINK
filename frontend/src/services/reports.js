import apiService from './api';

const reportsService = {
  // Create new report
  createReport: (reportData, files) => {
    const formData = new FormData();
    
    // Append report data
    Object.keys(reportData).forEach(key => {
      if (key === 'location') {
        formData.append('location[address]', reportData.location.address);
        formData.append('location[coordinates][latitude]', reportData.location.coordinates.latitude);
        formData.append('location[coordinates][longitude]', reportData.location.coordinates.longitude);
      } else if (key === 'reportedBy') {
        formData.append('reportedBy[name]', reportData.reportedBy.name);
        formData.append('reportedBy[email]', reportData.reportedBy.email);
        if (reportData.reportedBy.phone) {
          formData.append('reportedBy[phone]', reportData.reportedBy.phone);
        }
      } else {
        formData.append(key, reportData[key]);
      }
    });
    
    // Append files
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('images', file);
      });
    }
    
    return apiService.uploadFile('/reports', formData);
  },

  // Get all reports with filters
  getReports: (params = {}) => {
    return apiService.get('/reports', { params });
  },

  // Get single report by ID
  getReportById: (id) => {
    return apiService.get(`/reports/${id}`);
  },

  // Get reports by category
  getReportsByCategory: (category, limit = 10) => {
    return apiService.get(`/reports/category/${category}`, {
      params: { limit }
    });
  },

  // Search reports
  searchReports: (query, filters = {}) => {
    return apiService.get('/reports/search', {
      params: { q: query, ...filters }
    });
  },

  // Get reports statistics
  getReportsStats: () => {
    return apiService.get('/reports/stats');
  },
};

export default reportsService;