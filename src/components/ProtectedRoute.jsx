import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './Loader';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, userData, loading, isAdmin } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Wait for userData to load before checking admin
  if (adminOnly && userData && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Still loading user data
  if (!userData) {
    return <PageLoader />;
  }

  return children;
};

export default ProtectedRoute;
