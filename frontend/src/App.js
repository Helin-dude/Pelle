import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import AuthCallback from "./pages/AuthCallback";
import SettingsPage from "./pages/SettingsPage";
import { LocalConfigProvider } from "./contexts/LocalConfigContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    // AuthCallback will exchange the session_id and establish the session first.
    if (window.location.hash?.includes('session_id=')) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API}/auth/me`, {
        credentials: 'include'
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  };

  return { user, setUser, loading, logout, checkAuth };
};

// Protected Route component
const ProtectedRoute = ({ children, user, loading }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If we have user data passed from AuthCallback, we're authenticated
    if (location.state?.user) {
      return;
    }
    
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-500 font-mono text-sm">INITIALIZING...</div>
      </div>
    );
  }

  if (!user && !location.state?.user) {
    return null;
  }

  return children;
};

// App Router with session_id detection
function AppRouter() {
  const location = useLocation();
  const { user, setUser, loading, logout } = useAuth();

  // Check URL fragment for session_id synchronously during render
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback setUser={setUser} />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage user={user} />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute user={user} loading={loading}>
            <Dashboard user={user || location.state?.user} logout={logout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user} loading={loading}>
            <Dashboard user={user || location.state?.user} logout={logout} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <LocalConfigProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </LocalConfigProvider>
    </div>
  );
}

export default App;
