import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { setTokenHandlers } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Store access token in memory (not localStorage for security)
  const accessTokenRef = useRef(null);

  const setAccessToken = (token) => {
    accessTokenRef.current = token;
  };

  const getAccessToken = useCallback(() => accessTokenRef.current, []);

  const refreshSession = useCallback(async () => {
    try {
      const result = await authService.refresh();
      setAccessToken(result.data.accessToken);
      setUser(result.data.user);
      return result.data.accessToken;
    } catch {
      setUser(null);
      setAccessToken(null);
      return null;
    }
  }, []);

  // Wire token handlers to Axios interceptors
  useEffect(() => {
    setTokenHandlers(getAccessToken, refreshSession);
  }, [getAccessToken, refreshSession]);

  // Try to restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const result = await authService.refresh();
        setAccessToken(result.data.accessToken);
        setUser(result.data.user);
      } catch {
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await authService.login(credentials);
    setAccessToken(result.data.accessToken);
    setUser(result.data.user);
    return result;
  }, []);

  const register = useCallback(async (data) => {
    const result = await authService.register(data);
    setAccessToken(result.data.accessToken);
    setUser(result.data.user);
    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Logout even if API call fails
    } finally {
      setUser(null);
      setAccessToken(null);
      navigate('/login');
    }
  }, [navigate]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshSession,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
