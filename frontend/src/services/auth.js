import apiService from './api';
import { LOCAL_STORAGE_KEYS } from '@utils/constants';

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await apiService.post('/auth/register', userData);
    
    if (response.data.success) {
      const { user, token, refreshToken } = response.data.data;
      
      // Store tokens and user data
      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
    }
    
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await apiService.post('/auth/login', credentials);
    
    if (response.data.success) {
      const { user, token, refreshToken } = response.data.data;
      
      // Store tokens and user data
      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
    }
    
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  },

  // Get current user profile
  getProfile: () => {
    return apiService.get('/auth/profile');
  },

  // Update user profile
  updateProfile: (profileData) => {
    return apiService.put('/auth/profile', profileData);
  },

  // Change password
  changePassword: (passwordData) => {
    return apiService.put('/auth/change-password', passwordData);
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    const user = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    return !!(token && user);
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if current user is admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'admin';
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
  },

  // Refresh token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiService.post('/auth/refresh', {
      refreshToken
    });

    if (response.data.success) {
      const { token } = response.data.data;
      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
    }

    return response.data;
  },
};

export default authService;