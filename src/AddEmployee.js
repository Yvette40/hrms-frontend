// src/AddEmployee.js - ENHANCED VERSION with User Account Creation
import React, { useState } from "react";
import axios from "axios";
import "./AddEmployee.css";

function AddEmployee() {
  const [formData, setFormData] = useState({
    name: "",
    national_id: "",
    email: "",
    phone_number: "",
    department: "",
    position: "",
    base_salary: "",
    hire_date: new Date().toISOString().split('T')[0],
  });

  const [createUserAccount, setCreateUserAccount] = useState(true);
  const [userRole, setUserRole] = useState("Employee");
  const [tempPassword, setTempPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState(null);

  const token = localStorage.getItem("token");

  const departments = [
    "Engineering",
    "Finance",
    "Sales",
    "Marketing",
    "Human Resources",
    "Operations",
    "IT",
    "Customer Service",
    "Administration",
    "Other",
  ];

  // Generate temporary password
  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Generate username from name
  const generateUsername = (fullName) => {
    const parts = fullName.toLowerCase().split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1]; // First letter + last name
    }
    return parts[0]; // Just first name if only one word
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setCreatedEmployee(null);

    try {
      // Step 1: Create Employee
      const empResponse = await axios.post("http://127.0.0.1:5000/employees", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newEmployee = empResponse.data.employee || { id: empResponse.data.id };
      
      let userCreated = false;
      let username = "";
      let password = "";

      // Step 2: Create User Account (if checked)
      if (createUserAccount && formData.email) {
        username = generateUsername(formData.name);
        password = generateTempPassword();

        try {
          await axios.post(
            "http://127.0.0.1:5000/users",
            {
              username: username,
              password: password,
              role: userRole,
              email: formData.email,
              phone: formData.phone_number,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          userCreated = true;
          setTempPassword(password);

          // Step 3: Send Email with Login Credentials
          try {
            await axios.post(
              "http://127.0.0.1:5000/send-welcome-email",
              {
                email: formData.email,
                name: formData.name,
                username: username,
                password: password,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (emailErr) {
            console.log("Email sending failed, but account created");
          }
        } catch (userErr) {
          console.error("User account creation failed:", userErr);
          setMessage(
            `✅ Employee added successfully, but user account creation failed: ${
              userErr.response?.data?.msg || "Unknown error"
            }`
          );
        }
      }

      // Show success message
      if (userCreated) {
        setMessage("✅ Employee and user account created successfully!");
        setCreatedEmployee({
          ...formData,
          username: username,
          password: password,
        });
      } else {
        setMessage("✅ Employee added successfully!");
      }

      // Reset form
      setFormData({
        name: "",
        national_id: "",
        email: "",
        phone_number: "",
        department: "",
        position: "",
        base_salary: "",
        hire_date: new Date().toISOString().split('T')[0],
      });

      setLoading(false);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Failed to add employee";
      setMessage(`❌ ${errorMsg}`);
      setLoading(false);
    }
  };

  return (
    <div className="add-employee-page">
      <div className="page-header">
        <h1>➕ Add New Employee</h1>
        <p className="subtitle">Enter employee details to add to the system</p>
      </div>

      {message && (
        <div className={`message-box ${message.includes("❌") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      {/* Show Created Credentials */}
      {createdEmployee && (
        <div className="credentials-box">
          <h3>🔐 Login Credentials Created</h3>
          <div className="credentials-content">
            <div className="cred-row">
              <strong>Username:</strong>
              <span className="cred-value">{createdEmployee.username}</span>
              <button
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(createdEmployee.username);
                  alert("Username copied!");
                }}
              >
                📋 Copy
              </button>
            </div>
            <div className="cred-row">
              <strong>Temporary Password:</strong>
              <span className="cred-value">{createdEmployee.password}</span>
              <button
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(createdEmployee.password);
                  alert("Password copied!");
                }}
              >
                📋 Copy
              </button>
            </div>
          </div>
          <p className="cred-note">
            ⚠️ <strong>Important:</strong> Save these credentials! An email has been sent to{" "}
            <strong>{createdEmployee.email}</strong> with login instructions.
          </p>
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit} className="employee-form">
          {/* Personal Information */}
          <div className="form-section">
            <h3 className="section-title">📋 Personal Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="national_id">
                  National ID <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="national_id"
                  name="national_id"
                  value={formData.national_id}
                  onChange={handleChange}
                  required
                  placeholder="12345678"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h3 className="section-title">📞 Contact Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john.doe@glimmer.com"
                  className="form-input"
                />
                <small>Required for user account creation</small>
              </div>

              <div className="form-group">
                <label htmlFor="phone_number">Phone Number</label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+254712345678"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="form-section">
            <h3 className="section-title">💼 Employment Details</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department">
                  Department <span className="required">*</span>
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="form-select"
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="position">Position</label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="Software Engineer"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="base_salary">
                  Base Salary (KSh) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="base_salary"
                  name="base_salary"
                  value={formData.base_salary}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="50000"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="hire_date">Hire Date</label>
                <input
                  type="date"
                  id="hire_date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* User Account Settings */}
          <div className="form-section user-account-section">
            <h3 className="section-title">🔐 User Account Settings</h3>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={createUserAccount}
                  onChange={(e) => setCreateUserAccount(e.target.checked)}
                />
                <span>Create user account for system access</span>
              </label>
            </div>

            {createUserAccount && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="userRole">System Role</label>
                  <select
                    id="userRole"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="form-select"
                  >
                    <option value="Employee">Employee</option>
                    <option value="HR Officer">HR Officer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <div className="info-box">
                    <p>
                      ✨ <strong>Auto-generated:</strong>
                    </p>
                    <ul>
                      <li>Username: First letter + Last name</li>
                      <li>Temp Password: Random 10 characters</li>
                      <li>Email: Login credentials sent automatically</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setFormData({
                  name: "",
                  national_id: "",
                  email: "",
                  phone_number: "",
                  department: "",
                  position: "",
                  base_salary: "",
                  hire_date: new Date().toISOString().split('T')[0],
                });
                setCreatedEmployee(null);
                setMessage("");
              }}
              disabled={loading}
            >
              🔄 Reset Form
            </button>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "⏳ Creating..." : "✅ Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEmployee;