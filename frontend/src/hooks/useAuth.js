import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '@services/auth';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Initialize auth state
      initialize: () => {
        const isAuth = authService.isAuthenticated();
        const user = authService.getCurrentUser();
        
        set({
          isAuthenticated: isAuth,
          user: user,
        });
      },

      // Login action
      login: async (credentials) => {
        set({ isLoading: true });
        
        try {
          const response = await authService.login(credentials);
          
          if (response.success) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
            
            toast.success('Login successful!');
            return { success: true, user: response.data.user };
          }
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Login failed';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      // Register action
      register: async (userData) => {
        set({ isLoading: true });
        
        try {
          const response = await authService.register(userData);
          
          if (response.success) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
            
            toast.success('Registration successful!');
            return { success: true, user: response.data.user };
          }
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Registration failed';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      // Logout action
      logout: () => {
        authService.logout();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        toast.success('Logged out successfully');
      },

      // Update profile action
      updateProfile: async (profileData) => {
        set({ isLoading: true });
        
        try {
          const response = await authService.updateProfile(profileData);
          
          if (response.data.success) {
            const updatedUser = response.data.data.user;
            
            // Update localStorage
            localStorage.setItem('citylink_user', JSON.stringify(updatedUser));
            
            set({
              user: updatedUser,
              isLoading: false,
            });
            
            toast.success('Profile updated successfully!');
            return { success: true, user: updatedUser };
          }
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Update failed';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      // Change password action
      changePassword: async (passwordData) => {
        set({ isLoading: true });
        
        try {
          const response = await authService.changePassword(passwordData);
          
          if (response.data.success) {
            set({ isLoading: false });
            toast.success('Password changed successfully!');
            return { success: true };
          }
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.message || 'Password change failed';
          toast.error(message);
          return { success: false, error: message };
        }
      },

      // Check if user is admin
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },
    }),
    {
      name: 'citylink-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Custom hook
export const useAuth = () => {
  const store = useAuthStore();
  
  // Initialize on first use
  if (typeof window !== 'undefined' && !store.user && authService.isAuthenticated()) {
    store.initialize();
  }
  
  return store;
};