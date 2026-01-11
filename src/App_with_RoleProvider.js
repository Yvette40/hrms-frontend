import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { RoleProvider } from "./RoleContext"; // Import RoleProvider
import Navbar from "./Navbar";
import Login from "./Login";
import Dashboard from "./Dashboard";
import EmployeePage from "./EmployeePage";
import Attendance from "./Attendance";
import Payroll from "./Payroll";
import ProtectedRoute from "./ProtectedRoute";
import AuditTrailPage from "./pages/AuditTrailPage";
import "./App.css";

function App() {
  return (
    <RoleProvider> {/* Wrap entire app with RoleProvider */}
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <EmployeePage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/payroll"
              element={
                <ProtectedRoute>
                  <Payroll />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/audit-trail"
              element={
                <ProtectedRoute>
                  <AuditTrailPage />
                </ProtectedRoute>
              }
            />
            
            {/* Add Approvals route if you have the component */}
            {/* <Route
              path="/approvals"
              element={
                <ProtectedRoute>
                  <ApprovalsPage />
                </ProtectedRoute>
              }
            /> */}
          </Routes>
        </div>
      </Router>
    </RoleProvider>
  );
}

export default App;
