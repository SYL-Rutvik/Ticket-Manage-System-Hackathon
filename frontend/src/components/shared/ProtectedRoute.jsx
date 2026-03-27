import { Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/context/AuthContext';
import { ROLE_HOME } from '@/shared/utils/constants';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-base">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={ROLE_HOME[user.role] ?? '/login'} replace />;
  return children;
};

export default ProtectedRoute;
