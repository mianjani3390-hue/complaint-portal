import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function SuperAdminRoute({ children }) {
  const { isSuperAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isSuperAdmin) return <Navigate to="/" replace />;
  return children;
}
