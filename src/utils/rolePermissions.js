// src/utils/rolePermissions.js
// Document-Aligned Role Permissions
// Based on Use Case Diagram (Section 3.7.1)

export const ROLES = {
  ADMIN: 'Admin',
  HR_OFFICER: 'HR Officer',
  DEPT_MANAGER: 'Department Manager',
  EMPLOYEE: 'Employee'
};

export const PERMISSIONS = {
  // Dashboard - All roles
  VIEW_DASHBOARD: [ROLES.ADMIN, ROLES.HR_OFFICER, ROLES.DEPT_MANAGER, ROLES.EMPLOYEE],
  
  // Employee Management
  VIEW_EMPLOYEES: [ROLES.ADMIN, ROLES.HR_OFFICER, ROLES.DEPT_MANAGER],
  ADD_EMPLOYEE: [ROLES.ADMIN, ROLES.HR_OFFICER],
  EDIT_EMPLOYEE: [ROLES.ADMIN, ROLES.HR_OFFICER],
  DELETE_EMPLOYEE: [ROLES.ADMIN],
  
  // Attendance
  VIEW_ATTENDANCE: [ROLES.ADMIN, ROLES.HR_OFFICER, ROLES.DEPT_MANAGER, ROLES.EMPLOYEE],
  MARK_ATTENDANCE: [ROLES.ADMIN, ROLES.HR_OFFICER],
  VIEW_OWN_ATTENDANCE: [ROLES.EMPLOYEE],
  
  // Payroll (As per document - HR Officer processes, Admin approves)
  VIEW_PAYROLL: [ROLES.ADMIN, ROLES.HR_OFFICER],
  PROCESS_PAYROLL: [ROLES.HR_OFFICER],
  APPROVE_PAYROLL: [ROLES.ADMIN],
  VIEW_OWN_PAYSLIP: [ROLES.EMPLOYEE],
  
  // Leave Management
  APPROVE_LEAVE: [ROLES.HR_OFFICER],
  SUBMIT_LEAVE: [ROLES.EMPLOYEE],
  VIEW_LEAVE_REQUESTS: [ROLES.ADMIN, ROLES.HR_OFFICER],
  
  // Audit Trail
  VIEW_AUDIT_TRAIL: [ROLES.ADMIN, ROLES.HR_OFFICER],
  
  // Reports
  VIEW_REPORTS: [ROLES.ADMIN, ROLES.HR_OFFICER, ROLES.DEPT_MANAGER],
  VIEW_DEPT_REPORTS: [ROLES.DEPT_MANAGER],
  
  // User Management
  MANAGE_USERS: [ROLES.ADMIN],
  VERIFY_ROLES: [ROLES.ADMIN],
  
  // Department Management
  VIEW_DEPT_EMPLOYEES: [ROLES.DEPT_MANAGER],
  MONITOR_DEPT_ATTENDANCE: [ROLES.DEPT_MANAGER]
};

// Helper function to check if user has permission
export const hasPermission = (userRole, permission) => {
  if (!PERMISSIONS[permission]) return false;
  return PERMISSIONS[permission].includes(userRole);
};

// Helper function to get all permissions for a role
export const getRolePermissions = (userRole) => {
  const rolePermissions = {};
  Object.keys(PERMISSIONS).forEach(permission => {
    rolePermissions[permission] = PERMISSIONS[permission].includes(userRole);
  });
  return rolePermissions;
};

// Role descriptions (from document)
export const ROLE_DESCRIPTIONS = {
  [ROLES.ADMIN]: {
    title: "Administrator",
    description: "System control, user management, role verification",
    color: "#ef4444",
    responsibilities: [
      "Manage user accounts",
      "Verify roles",
      "Approve payroll (SOD)",
      "System configuration"
    ]
  },
  [ROLES.HR_OFFICER]: {
    title: "HR Officer",
    description: "Employee records, attendance, payroll processing, leave approvals, audit trails",
    color: "#3b82f6",
    responsibilities: [
      "Process payroll",
      "Manage employee records",
      "Track attendance",
      "Approve leave requests",
      "Review audit trails"
    ]
  },
  [ROLES.DEPT_MANAGER]: {
    title: "Department Manager",
    description: "View department employees, monitor attendance, departmental reports",
    color: "#10b981",
    responsibilities: [
      "View department employees",
      "Monitor department attendance",
      "Access departmental reports",
      "Department oversight"
    ]
  },
  [ROLES.EMPLOYEE]: {
    title: "Employee",
    description: "View profile, attendance, payslips, submit leave requests",
    color: "#f59e0b",
    responsibilities: [
      "View personal profile",
      "Check attendance records",
      "View payslips",
      "Submit leave requests"
    ]
  }
};

export default {
  ROLES,
  PERMISSIONS,
  hasPermission,
  getRolePermissions,
  ROLE_DESCRIPTIONS
};