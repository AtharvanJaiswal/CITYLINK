import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@hooks/useAuth';
import { useEffect } from 'react';

// Pages
import Home from '@pages/Home';
import SignInPage from '@pages/SignInPage';
import AdminPage from '@pages/AdminPage';
import ReportPage from '@pages/ReportPage';

// Components
import ProtectedRoute from '@components/auth/ProtectedRoute';
import LoadingSpinner from '@components/common/LoadingSpinner';

// Styles
import './index.css';

function App() {
  const { initialize, isLoading } = useAuth();

  useEffect(() => {
    // Initialize auth state when app loads
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/report" element={<ReportPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-8">Page not found</p>
              <a href="/" className="text-primary-600 hover:text-primary-700 font-medium">
                Go back home
              </a>
            </div>
          </div>} />
        </Routes>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'font-medium',
            success: {
              style: {
                background: '#10b981',
                color: 'white',
              },
            },
            error: {
              style: {
                background: '#ef4444',
                color: 'white',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;