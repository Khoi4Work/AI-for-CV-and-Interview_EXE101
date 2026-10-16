import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/contexts/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isLoading, sessionExpired } = useAuth();
  const location = useLocation();

  if (isLoading) return <p role="status" className="p-8">Đang tải thông tin tài khoản…</p>;
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location, sessionExpired }} replace />;
  }
  return children;
};

export default ProtectedRoute;
