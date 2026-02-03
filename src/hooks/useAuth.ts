import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authFacade } from '../services/facades/AuthFacade';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const subscription = authFacade.getState$().subscribe(state => {
      setIsAuthenticated(state.isAuthenticated);
      setUser(state.user);
      setLoading(state.loading);
      setError(state.error);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const success = await authFacade.login(username, password);
    
    if (success) {
      const from = (location.state as { from?: string })?.from || '/pets';
      navigate(from, { replace: true });
    }
    
    return success;
  }, [navigate, location]);

  const logout = useCallback(() => {
    authFacade.logout();
    navigate('/login');
  }, [navigate]);

  const clearError = useCallback(() => {
    authFacade.clearError();
  }, []);

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout,
    clearError,
  };
}
