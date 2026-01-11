// src/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const rememberMe = localStorage.getItem("rememberMe");

  // If token exists AND either rememberMe is true or not set, allow access
  if (token && (rememberMe === "true" || rememberMe === null)) {
    return children;
  } else {
    // Clear any lingering tokens if rememberMe is false
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    return <Navigate to="/login" replace />;
  }
}

export default ProtectedRoute;
