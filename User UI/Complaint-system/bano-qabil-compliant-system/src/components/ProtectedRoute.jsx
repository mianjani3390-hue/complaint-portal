import { Navigate } from 'react-router-dom';
import { useUserAuth } from '../contexts/UserAuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useUserAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="mt-4 text-blue-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
