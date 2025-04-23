import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const FacultyRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.role === 'faculty' ? children : <Navigate to="/" />;
};

export default FacultyRoute;