import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "./RoleContext";
import axios from "./axiosConfig";
import config from "./config";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUserRole, setUsername: setContextUsername } = useRole();

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

  const quickLoginAsAdmin = () => {
  setFormData({
    username: 'admin',
    password: 'admin123'
  });
};

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(config.auth.login, {        username,
        password,
      });

      const token = response.data.access_token;
      localStorage.setItem("token", token);

      const userInfo = {
        username: response.data.username,
        role: response.data.role,
      };

      localStorage.setItem("user", JSON.stringify(userInfo));
      setUserRole(userInfo.role);
      setContextUsername(userInfo.username);

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      navigate("/dashboard");
    } catch (err) {
      setError("Invalid username or password. Please try again.");
      setLoading(false);
    }
  };

  const quickLogin = (demoUsername, demoPassword) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          {/* Logo & Header */}
          <div className="login-brand">
            <div className="brand-logo">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1>GLIMMER HRMS</h1>
            <p>Human Resource Management System</p>
          </div>

          {/* Login Form */}
          <div className="login-content">
            <h2>Sign In</h2>
            <p className="login-subtitle">Enter your credentials to access your account</p>

            {error && (
              <div className="alert-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username</label>
                <div className="input-group">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2"/>
                    <circle cx="12" cy="7" r="4" strokeWidth="2"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-group">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="11" width="18" height="11" rx="2" strokeWidth="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2"/>
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="form-footer">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Demo Accounts */}
            <div className="demo-section">
              <div className="divider">
                <span>Demo Accounts</span>
              </div>

              <div className="demo-grid">
                <button
                  type="button"
                  className="demo-btn admin"
                  onClick={() => quickLogin("admin", "AdminPass123")}
                >
                  <div className="demo-icon">👤</div>
                  <div className="demo-text">
                    <strong>Admin</strong>
                    <span>Full Access</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="demo-btn hr"
                  onClick={() => quickLogin("hr_officer", "OfficerPass123")}
                >
                  <div className="demo-icon">💼</div>
                  <div className="demo-text">
                    <strong>HR Officer</strong>
                    <span>HR Operations</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="demo-btn manager"
                  onClick={() => quickLogin("dept_manager", "DeptPass123")}
                >
                  <div className="demo-icon">📊</div>
                  <div className="demo-text">
                    <strong>Manager</strong>
                    <span>Department</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="demo-btn employee"
                  onClick={() => quickLogin("jmwangi", "password123")}
                >
                  <div className="demo-icon">👨‍💻</div>
                  <div className="demo-text">
                    <strong>Employee</strong>
                    <span>John Mwangi</span>
                  </div>
                </button>
              </div>
<button
  type="button"
  className="quick-login-btn"
  onClick={quickLoginAsAdmin}
>
  🔑 Quick Login as Admin
</button>
              <p className="demo-note">Click any demo account to auto-fill credentials</p>
            </div>
          </div>

          {/* Footer */}
          <div className="login-footer">
            <p>© 2026 Glimmer Limited. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;