export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const REPORT_CATEGORIES = {
  pothole: 'Pothole',
  streetlight: 'Streetlight',
  waste_management: 'Waste Management',
  water_leak: 'Water Leak',
  traffic_signal: 'Traffic Signal',
  road_damage: 'Road Damage',
  public_safety: 'Public Safety',
  noise_complaint: 'Noise Complaint',
  other: 'Other'
};

export const ISSUE_TYPES = {
  emergency: 'Emergency',
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

export const REPORT_STATUS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected'
};

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

export const PRIORITY_COLORS = {
  1: 'bg-gray-100 text-gray-800',
  2: 'bg-blue-100 text-blue-800',
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-orange-100 text-orange-800',
  5: 'bg-red-100 text-red-800'
};

export const DEFAULT_MAP_CENTER = [28.6139, 77.2090]; // Delhi coordinates
export const DEFAULT_MAP_ZOOM = 11;

export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/signin',
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_USERS: '/admin/users',
  REPORT: '/report',
  REPORTS: '/reports'
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'citylink_token',
  REFRESH_TOKEN: 'citylink_refresh_token',
  USER: 'citylink_user'
};

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 5,
  ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50
};