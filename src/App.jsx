import React, { Component } from 'react'; // Add React import
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import FacultyDashboard from './pages/FacultyDashboard';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import StudentDashboard from './pages/StudentDashboard';
import Signup from './components/auth/Signup';

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-blue-600 py-2 px-4 text-white hover:bg-blue-700"
              aria-label="Reload page"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Layout Component
const Layout = ({ children }) => {
  const { user } = useAuth(); // Line 10 (from error stack)
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar hideSidebar={false} />
      <div className="flex flex-1">
        {user && <Sidebar role={user.role} />}
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
};

// App Component
const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={
          <Layout>
            <Login />
          </Layout>
        } />
        <Route path="/signup" element={
          <Layout>
            <Signup />
          </Layout>
        } />
        <Route
          path="/faculty/dashboard"
          element={
            user && user.role === 'faculty' ? (
              <Layout>
                <FacultyDashboard />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/student/dashboard"
          element={
            user && user.role === 'student' ? (
              <Layout>
                <StudentDashboard />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;