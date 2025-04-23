import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const StudentRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.role === 'student' ? children : <Navigate to="/" />;
};

export default StudentRoute;