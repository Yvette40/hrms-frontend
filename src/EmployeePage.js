// src/EmployeePage.js - Unified Employee Management with Tabs
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EmployeePage.css";

function EmployeePage() {
  const [activeTab, setActiveTab] = useState("view"); // "view" or "add"
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(25);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form data for adding employee
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

  // Fetch employees
  useEffect(() => {
    if (activeTab === "view") {
      fetchEmployees();
    }
  }, [activeTab]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://127.0.0.1:5000/employees?per_page=1000", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const empList = res.data.employees || [];
      setEmployees(empList);
      setFilteredEmployees(empList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setMessage("❌ Failed to load employees");
      setLoading(false);
    }
  };

  // Filter employees
  useEffect(() => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter(
        (emp) =>
          emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.national_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.id?.toString().includes(searchTerm)
      );
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter((emp) => emp.department === departmentFilter);
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, employees]);

  // Pagination
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  // Get unique departments
  const availableDepartments = [...new Set(employees.map((e) => e.department).filter(Boolean))];

  // Handle form change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await axios.post("http://127.0.0.1:5000/employees", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("✅ Employee added successfully!");

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
      
      // Refresh employee list
      fetchEmployees();
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Failed to add employee";
      setMessage(`❌ ${errorMsg}`);
      setLoading(false);
    }
  };

  // View employee details
  const handleViewDetails = async (empId) => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/employees/${empId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedEmployee(res.data);
      setShowModal(true);
    } catch (err) {
      setMessage("❌ Failed to load employee details");
    }
  };

  // Delete employee
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      await axios.delete(`http://127.0.0.1:5000/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ Employee deleted successfully");
      fetchEmployees();
    } catch (err) {
      setMessage("❌ Failed to delete employee");
    }
  };

  return (
    <div className="employee-page">
      {/* Header */}
      <div className="page-header-gradient">
        <h1>👥 Employee Management</h1>
        <p className="subtitle-white">Role: Admin</p>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === "view" ? "active" : ""}`}
          onClick={() => setActiveTab("view")}
        >
          📋 View Employees
        </button>
        <button
          className={`tab-btn ${activeTab === "add" ? "active" : ""}`}
          onClick={() => setActiveTab("add")}
        >
          ➕ Add Employee
        </button>
      </div>

      {message && (
        <div className={`message-box ${message.includes("❌") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      {/* View Employees Tab */}
      {activeTab === "view" && (
        <div className="view-employees-section">
          {/* Stats */}
          <div className="stats-bar">
            <div className="stat-card">
              <span className="stat-label">Total Employees</span>
              <span className="stat-value">{employees.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Active</span>
              <span className="stat-value">
                {employees.filter((e) => e.active !== false).length}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Departments</span>
              <span className="stat-value">{availableDepartments.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Filtered Results</span>
              <span className="stat-value">{filteredEmployees.length}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="controls-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Search by name, ID, email, or national ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button className="clear-btn" onClick={() => setSearchTerm("")}>
                  ✕
                </button>
              )}
            </div>

            <div className="filter-box">
              <label>Department:</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Departments ({employees.length})</option>
                {availableDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept} ({employees.filter((e) => e.department === dept).length})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">⏳ Loading employees...</div>
          ) : (
            <>
              <div className="table-info">
                Showing {indexOfFirstEmployee + 1} - {Math.min(indexOfLastEmployee, filteredEmployees.length)} of {filteredEmployees.length} employees
              </div>

              <div className="table-container">
                <table className="employee-table">
                  <thead style={{color: 'white'}}>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>National ID</th>
                      <th>Department</th>
                      <th>Position</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Base Salary</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: "center", padding: "40px" }}>
                          No employees found
                        </td>
                      </tr>
                    ) : (
                      currentEmployees.map((emp) => (
                        <tr key={emp.id}>
                          <td>{emp.id}</td>
                          <td className="emp-name">{emp.name}</td>
                          <td>{emp.national_id}</td>
                          <td>
                            <span className="dept-badge">{emp.department || "N/A"}</span>
                          </td>
                          <td>{emp.position || "Employee"}</td>
                          <td className="email-col">{emp.email || "N/A"}</td>
                          <td>{emp.phone_number || "N/A"}</td>
                          <td className="salary-col">
                            KSh {parseFloat(emp.base_salary || 0).toLocaleString()}
                          </td>
                          <td>
                            <span className={`status-badge ${emp.active !== false ? "active" : "inactive"}`}>
                              {emp.active !== false ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="actions-col">
                            <button 
                              className="btn-view" 
                              title="View Details"
                              onClick={() => handleViewDetails(emp.id)}
                            >
                              👁️
                            </button>
                            <button className="btn-edit" title="Edit Employee">
                              ✏️
                            </button>
                            <button
                              className="btn-delete"
                              title="Delete Employee"
                              onClick={() => handleDelete(emp.id)}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    « First
                  </button>
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    ‹ Prev
                  </button>

                  <span className="page-info">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next ›
                  </button>
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    Last »
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Add Employee Tab */}
      {activeTab === "add" && (
        <div className="add-employee-section">
          <h2 className="section-heading">Add New Employee</h2>

          <div className="form-container-white">
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
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john.doe@glimmer.com"
                      className="form-input"
                    />
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

              {/* Buttons */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() =>
                    setFormData({
                      name: "",
                      national_id: "",
                      email: "",
                      phone_number: "",
                      department: "",
                      position: "",
                      base_salary: "",
                      hire_date: new Date().toISOString().split('T')[0],
                    })
                  }
                  disabled={loading}
                >
                  🔄 Reset Form
                </button>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? "⏳ Adding Employee..." : "✅ Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👤 Employee Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">{selectedEmployee.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedEmployee.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">National ID:</span>
                  <span className="detail-value">{selectedEmployee.national_id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Department:</span>
                  <span className="detail-value">{selectedEmployee.department || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Position:</span>
                  <span className="detail-value">{selectedEmployee.position || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedEmployee.email || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{selectedEmployee.phone_number || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Base Salary:</span>
                  <span className="detail-value">
                    KSh {parseFloat(selectedEmployee.base_salary || 0).toLocaleString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge ${selectedEmployee.active !== false ? "active" : "inactive"}`}>
                    {selectedEmployee.active !== false ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-modal-close" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeePage;