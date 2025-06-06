import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Settings, LogOut } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import './Login.css';

// Token management utilities
const getToken = () => localStorage.getItem('jwt_token');
const removeToken = () => localStorage.removeItem('jwt_token');

// Axios interceptor to add token to requests
axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const Login = ({ onLogin }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = getToken();
    
    try {
      // Only check auth if we have a token
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await axios.get(API_ENDPOINTS.AUTH.USER);
      
      setUser(response.data.user);
      onLogin(response.data.user);
    } catch (error) {
      removeToken(); // Clear invalid token
      onLogin(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = API_ENDPOINTS.AUTH.GOOGLE;
  };

  const handleLogout = () => {
    removeToken();
    setUser(null);
    onLogin(null);
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="loading-spinner"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <UserDropdown user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Tesmo Todo</h1>
          <p>Organize your tasks with AI-powered intelligence</p>
        </div>
        
        <div className="login-content">
          <button onClick={handleGoogleLogin} className="google-login-btn">
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
        
        <div className="login-footer">
          <p>Secure authentication powered by Google</p>
        </div>
      </div>
    </div>
  );
};

const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSettingsClick = () => {
    setIsOpen(false);
    // Trigger settings tab - we'll need to pass this up to App
    const event = new CustomEvent('openSettings');
    window.dispatchEvent(event);
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="user-dropdown" ref={dropdownRef}>
      <button 
        className="user-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img src={user.picture} alt={user.name} className="user-avatar" />
      </button>
      
      {isOpen && (
        <div className="user-dropdown-menu">
          <div className="dropdown-header">
            <img src={user.picture} alt={user.name} className="dropdown-avatar" />
            <div className="dropdown-user-info">
              <div className="dropdown-user-name">{user.name}</div>
              <div className="dropdown-user-email">{user.email}</div>
            </div>
          </div>
          
          <div className="dropdown-divider"></div>
          
          <button className="dropdown-item" onClick={handleSettingsClick}>
            <Settings size={16} />
            <span>Settings</span>
          </button>
          
          <div className="dropdown-divider"></div>
          
          <button className="dropdown-item logout-item" onClick={handleLogoutClick}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;