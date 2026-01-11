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
import SchedulerDashboard from './pages/SchedulerDashboard';
import Notifications from './Notifications';
import Profile from './Profile';
import Settings from './Settings';
import Leave from './Leave';
import Users from './Users';
import Payslips from './Payslips';
import MyAttendance from "./MyAttendance";



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
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/audit-trail" element={<AuditTrailPage />} />
            <Route path="/employees" element={<EmployeePage />} />
            <Route path="/approvals" element={<ApprovalRequestsPage />} />
            <Route path="/employee-portal" element={<EmployeeSelfService />} />
            <Route path="/reports" element={<PayrollReports />} />
            <Route path="/scheduler" element={<SchedulerDashboard />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/leave" element={<Leave />} />
            <Route path="/users" element={<Users />} />
            <Route path="/payslips" element={<Payslips />} />
            <Route path="/my-attendance" element={<MyAttendance />} /> 


          </Route>

          <Route 
  path="/" 
  element={<Navigate to="/login" replace />}  // Always go to login
/>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </RoleProvider>
  );
}

export default App;