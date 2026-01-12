/**
 * Axios Interceptors Setup
 * Handles authentication, error handling, and token management
 * 
 * Create this file as: src/axiosConfig.js
 * Then import it in your App.js: import './axiosConfig';
 */

import axios from 'axios';

// Set default base URL from config
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';
axios.defaults.baseURL = API_BASE_URL;

// Set default headers
axios.defaults.headers.common['Content-Type'] = 'application/json';

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================
// Add authentication token to all requests
axios.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR
// ============================================================================
// Handle responses and errors globally
axios.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.status);
    }
    
    return response;
  },
  (error) => {
    // Handle different error scenarios
    
    if (!error.response) {
      // Network error (no response from server)
      console.error('❌ Network Error: Unable to connect to server');
      
      // Show user-friendly message
      if (window.showNotification) {
        window.showNotification('error', 'Network error. Please check your connection.');
      }
      
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        type: 'network_error'
      });
    }
    
    const { status, data } = error.response;
    
    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        // Bad Request
        console.error('❌ Bad Request:', data?.msg || data?.message);
        break;
        
      case 401:
        // Unauthorized - Token expired or invalid
        console.error('❌ Unauthorized: Token expired or invalid');
        
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Show notification
        if (window.showNotification) {
          window.showNotification('error', 'Session expired. Please login again.');
        }
        
        // Redirect to login (only if not already on login page)
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        break;
        
      case 403:
        // Forbidden - Insufficient permissions
        console.error('❌ Forbidden: Insufficient permissions');
        
        if (window.showNotification) {
          window.showNotification('error', 'You do not have permission to perform this action.');
        }
        break;
        
      case 404:
        // Not Found
        console.error('❌ Not Found:', error.config.url);
        
        if (window.showNotification) {
          window.showNotification('error', 'Resource not found.');
        }
        break;
        
      case 429:
        // Too Many Requests - Rate limit exceeded
        console.error('❌ Rate Limit Exceeded');
        
        if (window.showNotification) {
          window.showNotification('error', 'Too many requests. Please try again later.');
        }
        break;
        
      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        console.error('❌ Server Error:', status);
        
        if (window.showNotification) {
          window.showNotification('error', 'Server error. Please try again later.');
        }
        break;
        
      default:
        console.error('❌ Error:', status, data?.msg || data?.message);
    }
    
    // Return a structured error object
    return Promise.reject({
      status,
      message: data?.msg || data?.message || 'An error occurred',
      data: data,
      originalError: error
    });
  }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Get current user data
 */
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

/**
 * Make authenticated API request with error handling
 * 
 * @param {string} method - HTTP method (get, post, put, delete)
 * @param {string} url - API endpoint
 * @param {object} data - Request data (for post/put)
 * @param {object} config - Additional axios config
 * @returns {Promise} - Axios promise
 */
export const apiRequest = async (method, url, data = null, config = {}) => {
  try {
    const response = await axios({
      method,
      url,
      data,
      ...config
    });
    return response.data;
  } catch (error) {
    // Error already handled by interceptor
    throw error;
  }
};

// Export configured axios instance
export default axios;

/**
 * USAGE IN COMPONENTS:
 * 
 * // Option 1: Use configured axios directly
 * import axios from './axiosConfig';
 * 
 * const fetchData = async () => {
 *   try {
 *     const response = await axios.get('/employees');
 *     setEmployees(response.data);
 *   } catch (error) {
 *     // Error already handled by interceptor
 *     console.error('Failed to fetch employees');
 *   }
 * };
 * 
 * // Option 2: Use helper function
 * import { apiRequest } from './axiosConfig';
 * 
 * const createEmployee = async (employeeData) => {
 *   try {
 *     const data = await apiRequest('post', '/employees', employeeData);
 *     console.log('Employee created:', data);
 *   } catch (error) {
 *     console.error('Failed to create employee');
 *   }
 * };
 */
