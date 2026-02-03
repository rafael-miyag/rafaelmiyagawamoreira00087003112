import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { stateManager } from '@/services';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(stateManager.getState().isAuthenticated);

  useEffect(() => {
    const subscription = stateManager.getState$().subscribe((state) => {
      setIsAuthenticated(state.isAuthenticated);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
