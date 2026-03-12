import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfileSetup from './pages/ProfileSetup';
import SwipeDeck from './pages/SwipeDeck';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-dark"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/swipe" replace />;
};

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-dark">
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/profile-setup" element={<PrivateRoute><ProfileSetup /></PrivateRoute>} />
        <Route path="/swipe" element={<PrivateRoute><SwipeDeck /></PrivateRoute>} />
        <Route path="/matches" element={<PrivateRoute><Matches /></PrivateRoute>} />
        <Route path="/chat/:matchId" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
