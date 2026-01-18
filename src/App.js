// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import Dashboard from "./Dashboard";
import Attendance from "./Attendance";
import Payroll from "./Payroll";
import AuditTrailPage from "./pages/AuditTrailPage";
import Login from "./Login";
import EmployeePage from "./EmployeePage";
import ProtectedRoute from "./ProtectedRoute";
import ApprovalRequestsPage from "./ApprovalRequestsPage";
import { RoleProvider } from "./RoleContext";
import EmployeeSelfService from './pages/EmployeeSelfService';
import PayrollReports from './pages/PayrollReports';
import Notifications from './Notifications';
import Profile from './Profile';
import Settings from './Settings';
import Leave from './Leave';  // Admin/HR version
import Users from './Users';
import Payslips from './Payslips';
import MyAttendance from "./MyAttendance";
import './axiosConfig';
import EmployeeList from "./EmployeeList";
import AddEmployee from "./AddEmployee";
import SchedulerDashboard from './SchedulerDashboard';
import DepartmentManagement from './DepartmentManagement';
import './GlobalStyles.css';
import './App.css';
import EmployeeLogin from './EmployeeLogin';
import LeaveRequests from './LeaveRequests';  // Employee version
import LeaveRouter from './LeaveRouter';  // NEW - we'll create this


function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <RoleProvider>
      <Router>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/employee-login" element={<EmployeeLogin />} />

          {/* PROTECTED ROUTES */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/audit-trail" element={<AuditTrailPage />} />
            <Route path="/approvals" element={<ApprovalRequestsPage />} />
            <Route path="/employee-portal" element={<EmployeeSelfService />} />
            <Route path="/reports" element={<PayrollReports />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* LEAVE ROUTE - Smart router that shows correct page based on role */}
            <Route path="/leave" element={<LeaveRouter />} />
            
            <Route path="/users" element={<Users />} />
            <Route path="/payslips" element={<Payslips />} />
            <Route path="/my-attendance" element={<MyAttendance />} /> 
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/add" element={<AddEmployee />} />
            <Route path="/scheduler" element={<SchedulerDashboard />} />
            <Route path="/departments" element={<DepartmentManagement />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </RoleProvider>
  );
}

export default App;