import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/landingpage";
import CreateComplaint from "./components/CreateComplaint";
import UserDashboard from "./components/UserDashboard";
import ComplaintDetail from "./components/ComplaintDetail";
import UserLogin from "./components/UserLogin";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserAuthProvider } from "./contexts/UserAuthContext";

function App() {
  return (
    <UserAuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/create-complaint" element={<CreateComplaint />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complaint/:id"
          element={
            <ProtectedRoute>
              <ComplaintDetail />
            </ProtectedRoute>
          }
        />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </UserAuthProvider>
  );
}

export default App;
