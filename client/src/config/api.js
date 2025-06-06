// API Configuration
// This file centralizes all API-related configuration

// Default API base URL
const DEFAULT_API_BASE = 'http://todo.tesmo.my.id';

// Get API base URL from environment variable or use default
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE;

// API endpoints
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    USER: `${API_BASE_URL}/api/auth/user`,
    GOOGLE: `${API_BASE_URL}/api/auth/google`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`
  },
  // Tasks endpoints
  TASKS: `${API_BASE_URL}/api/tasks`,
  // Users endpoints
  USERS: {
    PROFILE: `${API_BASE_URL}/api/users/profile`
  }
};

// Legacy API_BASE export for backward compatibility
export const API_BASE = `${API_BASE_URL}/api`;

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  API_BASE
};