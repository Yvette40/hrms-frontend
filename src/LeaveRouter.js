// src/LeaveRouter.js
import React from 'react';
import { useRole } from './RoleContext';
import LeaveRequests from './LeaveRequests';  // Employee version
import Leave from './Leave';  // Admin/HR version

function LeaveRouter() {
  const { userRole } = useRole();
  
  // If employee, show LeaveRequests (request leave page)
  if (userRole === 'Employee' || userRole === 'employee') {
    return <LeaveRequests />;
  }
  
  // If admin/HR, show Leave (manage all leaves page)
  return <Leave />;
}

export default LeaveRouter;

