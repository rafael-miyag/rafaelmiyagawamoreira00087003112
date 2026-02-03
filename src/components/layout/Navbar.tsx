import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PawPrint, Users, Menu, X, LogOut, Activity } from 'lucide-react';
import { authFacade } from '../../services/facades/AuthFacade';
import { healthFacade } from '../../services/facades/HealthFacade';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiStatus, setApiStatus] = useState<'UP' | 'DOWN' | 'UNKNOWN' | 'CHECKING'>('CHECKING');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const subscription = authFacade.getState$().subscribe(state => {
      setIsAuthenticated(state.isAuthenticated);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check API status
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const status = await healthFacade.checkHealth();
        setApiStatus(status.status);
      } catch {
        setApiStatus('DOWN');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    authFacade.logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/pets" className="flex items-center space-x-2 font-bold text-xl">
            <PawPrint className="w-8 h-8" />
            <span>Patrulha dos Pets</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/pets"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                isActive('/pets') ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <PawPrint className="w-5 h-5" />
              <span>Pets</span>
            </Link>
            <Link
              to="/tutores"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                isActive('/tutores') ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Tutores</span>
            </Link>

            {/* API Status */}
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-900/50 rounded-md">
              <Activity 
                className={`w-4 h-4 ${
                  apiStatus === 'UP' ? 'text-green-400' : 
                  apiStatus === 'DOWN' ? 'text-red-400' : 
                  apiStatus === 'UNKNOWN' ? 'text-gray-400' :
                  'text-yellow-400'
                }`} 
              />
              <span className="text-sm text-blue-200">
                API: {apiStatus === 'CHECKING' || apiStatus === 'UNKNOWN' ? '...' : apiStatus}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link
              to="/pets"
              className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                isActive('/pets') ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <PawPrint className="w-5 h-5" />
              <span>Pets</span>
            </Link>
            <Link
              to="/tutores"
              className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                isActive('/tutores') ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Users className="w-5 h-5" />
              <span>Tutores</span>
            </Link>

            {/* API Status Mobile */}
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-900/50 rounded-md mx-2">
              <Activity 
                className={`w-4 h-4 ${
                  apiStatus === 'UP' ? 'text-green-400' : 
                  apiStatus === 'DOWN' ? 'text-red-400' : 
                  apiStatus === 'UNKNOWN' ? 'text-gray-400' :
                  'text-yellow-400'
                }`} 
              />
              <span className="text-sm text-blue-200">
                API: {apiStatus === 'CHECKING' || apiStatus === 'UNKNOWN' ? '...' : apiStatus}
              </span>
            </div>

            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-red-600 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
