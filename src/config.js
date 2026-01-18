/**
 * API Configuration for HRMS Frontend
 * Centralized API endpoint management
 */

// Get API base URL from environment variable or use default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

const config = {
  // Base URL for all API requests
  API_BASE_URL,

  // Authentication endpoints
  auth: {
    login: `${API_BASE_URL}/login`,
    logout: `${API_BASE_URL}/logout`,
    verifyToken: `${API_BASE_URL}/verify-token`,
  },

  // Dashboard endpoints
  dashboard: {
    stats: `${API_BASE_URL}/dashboard-stats`,
    recentActivity: `${API_BASE_URL}/recent-activity`,
  },

  // Employee management endpoints
  employees: {
    list: `${API_BASE_URL}/employees`,
    create: `${API_BASE_URL}/employees`,
    update: (id) => `${API_BASE_URL}/employees/${id}`,
    delete: (id) => `${API_BASE_URL}/employees/${id}`,
    myInfo: `${API_BASE_URL}/my-info`,
    // 🆕 Employee profile endpoints
    profile: `${API_BASE_URL}/api/employee/profile`,
  },

  // Attendance endpoints
  attendance: {
    list: `${API_BASE_URL}/attendance`,
    create: `${API_BASE_URL}/attendance`,
    update: (id) => `${API_BASE_URL}/attendance/${id}`,
    myAttendance: `${API_BASE_URL}/my-attendance`,
  },

  // Payroll endpoints
  payroll: {
    list: `${API_BASE_URL}/payrolls`,
    calculate: `${API_BASE_URL}/payroll/calculate`,
    approve: (id) => `${API_BASE_URL}/payroll/approve/${id}`,
    myPayslips: `${API_BASE_URL}/my-payslips`,
  },

  // Leave management endpoints
  leave: {
    list: `${API_BASE_URL}/leaves`,
    create: `${API_BASE_URL}/leaves`,
    approve: (id) => `${API_BASE_URL}/leaves/${id}/approve`,
    reject: (id) => `${API_BASE_URL}/leaves/${id}/reject`,
    myLeaves: `${API_BASE_URL}/my-leaves`,
  },

  // User management endpoints
  users: {
    list: `${API_BASE_URL}/users`,
    create: `${API_BASE_URL}/users`,
    update: (id) => `${API_BASE_URL}/users/${id}`,
    delete: (id) => `${API_BASE_URL}/users/${id}`,
  },

  // Approval endpoints
  approvals: {
    list: `${API_BASE_URL}/approval-requests`,
    approve: (id) => `${API_BASE_URL}/approvals/${id}/approve`,
    reject: (id) => `${API_BASE_URL}/approvals/${id}/reject`,
  },

  // Anomaly detection endpoints
  anomalies: {
    list: `${API_BASE_URL}/anomalies`,
    detect: `${API_BASE_URL}/anomalies/detect`,
    resolve: (id) => `${API_BASE_URL}/anomalies/${id}/resolve`,
  },

  // Audit trail endpoints
  audit: {
    list: `${API_BASE_URL}/audit_trail`,
    export: `${API_BASE_URL}/audit_trail/export`,
  },

  // Notifications endpoints
  notifications: {
    list: `${API_BASE_URL}/notifications`,
    markRead: (id) => `${API_BASE_URL}/notifications/${id}/read`,
    markAllRead: `${API_BASE_URL}/notifications/mark-all-read`,
  },

  // Settings endpoints
  settings: {
    profile: `${API_BASE_URL}/profile`,
    updatePassword: `${API_BASE_URL}/update-password`,
    preferences: `${API_BASE_URL}/preferences`,
  },

  // Testing endpoints (remove in production)
  test: {
    email: `${API_BASE_URL}/test-email-html`,
    sms: `${API_BASE_URL}/test-sms`,
  },

  // Scheduler endpoints
  scheduler: {
    status: `${API_BASE_URL}/scheduler/status`,
    triggerReminders: `${API_BASE_URL}/scheduler/trigger-reminders`,
  },
};

export default config;

/**
 * Usage Example:
 * 
 * import config from './config';
 * import axios from 'axios';
 * 
 * // Login
 * axios.post(config.auth.login, { username, password });
 * 
 * // Get employees
 * axios.get(config.employees.list, {
 *   headers: { Authorization: `Bearer ${token}` }
 * });
 * 
 * // Update employee
 * axios.put(config.employees.update(employeeId), data, {
 *   headers: { Authorization: `Bearer ${token}` }
 * });
 * 
 * // Get employee profile (NEW)
 * axios.get(config.employees.profile, {
 *   headers: { Authorization: `Bearer ${token}` }
 * });
 */