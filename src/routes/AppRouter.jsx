import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import StudentDashboard from '../pages/StudentDashboard';
import FacultyDashboard from '../pages/FacultyDashboard';

const AppRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Prevent flash of login page
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={user.role === 'student' ? '/student/dashboard' : '/faculty/dashboard'} /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to={user.role === 'student' ? '/student/dashboard' : '/faculty/dashboard'} /> : <Signup />}
      />
      <Route
        path="/student/dashboard"
        element={user && user.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/faculty/dashboard"
        element={user && (user.role === 'faculty' || user.role === 'admin') ? <FacultyDashboard /> : <Navigate to="/login" />}
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRouter;