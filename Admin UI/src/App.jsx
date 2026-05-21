import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import AllComplaints from './components/AllComplaints/AllComplaints';
import ComplaintDetail from './components/ComplaintDetail/ComplaintDetail';
import Users from './components/Users/Users';
import SuperAdminRoute from './components/SuperAdminRoute/SuperAdminRoute';
import Settings from './components/Settings/Settings';

function PublicOnly({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-blue-50">
        <p className="font-medium text-blue-700">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="complaints" element={<AllComplaints />} />
        <Route path="complaints/:id" element={<ComplaintDetail />} />
        <Route
          path="users"
          element={
            <SuperAdminRoute>
              <Users />
            </SuperAdminRoute>
          }
        />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
