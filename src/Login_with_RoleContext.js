import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "./RoleContext"; // Import useRole
import axios from "axios";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUserRole, setUsername: setContextUsername } = useRole(); // Get setters from context

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedRememberMe = localStorage.getItem("rememberMe");

    if (savedRememberMe === "true" && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUsername(userData.username || "");
        setRememberMe(true);
      } catch (error) {
        console.error("Error parsing saved user:", error);
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:5000/login", {
        username,
        password,
      });

      const token = response.data.access_token;
      localStorage.setItem("token", token);

      // Get user info from backend or decode from token
      // For now, we'll create a simple user object
      const userInfo = {
        username: username,
        role: getUserRole(username) // Helper function to determine role
      };

      localStorage.setItem("user", JSON.stringify(userInfo));

      // Set role context
      setUserRole(userInfo.role);
      setContextUsername(userInfo.username);

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      navigate("/dashboard");
    } catch (err) {
      setError("❌ Login failed. Please check your credentials.");
      console.error("Login error:", err);
    }
  };

  // Helper function to determine user role based on username
  // In production, this should come from the backend
  const getUserRole = (username) => {
    if (username === "admin") return "Admin";
    if (username === "manager") return "Manager";
    if (username === "employee") return "Employee";
    // Default role
    return "Employee";
  };

  // Quick demo login handlers
  const quickLogin = (demoUsername, demoPassword) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>🔐 HRMS Login</h2>
          <p className="text-muted">Glimmer Limited - Secure Access</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="form-control"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="rememberMe">
              Remember me
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Sign In
          </button>
        </form>

        {/* Quick Demo Login Buttons */}
        <div className="demo-accounts mt-4">
          <p className="text-muted small">Quick Demo Login:</p>
          <div className="btn-group btn-group-sm d-flex gap-2" role="group">
            <button
              type="button"
              className="btn btn-outline-danger flex-fill"
              onClick={() => quickLogin("admin", "admin123")}
            >
              🔴 Admin
            </button>
            <button
              type="button"
              className="btn btn-outline-primary flex-fill"
              onClick={() => quickLogin("manager", "manager123")}
            >
              🔵 Manager
            </button>
            <button
              type="button"
              className="btn btn-outline-warning flex-fill"
              onClick={() => quickLogin("employee", "employee123")}
            >
              🟠 Employee
            </button>
          </div>
          <p className="text-muted small mt-2">
            Click a role button to auto-fill credentials
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
