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
import './axiosConfig';  // Add this line
import EmployeeList from "./EmployeeList";
import AddEmployee from "./AddEmployee";
import LeaveManagement from './LeaveManagement';
import DepartmentManagement from './DepartmentManagement';



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
            
            <Route path="/approvals" element={<ApprovalRequestsPage />} />
            <Route path="/employee-portal" element={<EmployeeSelfService />} />
            <Route path="/reports" element={<PayrollReports />} />
            <Route path="/scheduler" element={<SchedulerDashboard />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/users" element={<Users />} />
            <Route path="/payslips" element={<Payslips />} />
            <Route path="/my-attendance" element={<MyAttendance />} /> 
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/add" element={<AddEmployee />} />
            <Route path="/leave" element={<LeaveManagement />} />
            <Route path="/departments" element={<DepartmentManagement />} />

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