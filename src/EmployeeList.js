// src/EmployeeList.js - ENHANCED with View Details Modal
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EmployeeList.css";

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(25);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    national_id: "",
    email: "",
    phone_number: "",
    department: "",
    position: "",
    base_salary: "",
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

  useEffect(() => {
    fetchEmployees();
  }, []);

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

  const departmentsList = [...new Set(employees.map((e) => e.department).filter(Boolean))];

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  // View Details
  const handleViewClick = (emp) => {
    setSelectedEmployee(emp);
    setShowViewModal(true);
  };

  // Edit
  const handleEditClick = (emp) => {
    setSelectedEmployee(emp);
    setEditFormData({
      name: emp.name || "",
      national_id: emp.national_id || "",
      email: emp.email || "",
      phone_number: emp.phone_number || "",
      department: emp.department || "",
      position: emp.position || "",
      base_salary: emp.base_salary || "",
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.put(
        `http://127.0.0.1:5000/employees/${selectedEmployee.id}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage("✅ Employee updated successfully!");
      setShowEditModal(false);
      fetchEmployees();
    } catch (err) {
      setMessage("❌ Failed to update employee: " + (err.response?.data?.msg || "Unknown error"));
    }
  };

  // Delete
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
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

  if (loading) {
    return <div className="loading">⏳ Loading employees...</div>;
  }

  return (
    <div className="employee-list-page">
      <div className="page-header">
        <h1>👥 Employee Management</h1>
        <p className="subtitle">View and manage all employees</p>
      </div>

      {message && (
        <div className={`message-box ${message.includes("❌") ? "error" : "success"}`}>
          {message}
        </div>
      )}

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
          <span className="stat-value">{departmentsList.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Filtered Results</span>
          <span className="stat-value">{filteredEmployees.length}</span>
        </div>
      </div>

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
            {departmentsList.map((dept) => (
              <option key={dept} value={dept}>
                {dept} ({employees.filter((e) => e.department === dept).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-info">
        Showing {indexOfFirstEmployee + 1} - {Math.min(indexOfLastEmployee, filteredEmployees.length)} of {filteredEmployees.length} employees
      </div>

      <div className="table-container">
        <table className="employee-table">
          <thead>
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
                      onClick={() => handleViewClick(emp)}
                    >
                      👁️
                    </button>
                    <button
                      className="btn-edit"
                      title="Edit Employee"
                      onClick={() => handleEditClick(emp)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      title="Delete Employee"
                      onClick={() => handleDelete(emp.id, emp.name)}
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

      {/* View Details Modal */}
      {showViewModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <h2>👁️ Employee Details</h2>
            
            <div className="detail-section">
              <h3>Personal Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Employee ID:</span>
                  <span className="detail-value">{selectedEmployee.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Full Name:</span>
                  <span className="detail-value">{selectedEmployee.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">National ID:</span>
                  <span className="detail-value">{selectedEmployee.national_id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge ${selectedEmployee.active !== false ? "active" : "inactive"}`}>
                    {selectedEmployee.active !== false ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Contact Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedEmployee.email || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{selectedEmployee.phone_number || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Employment Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Department:</span>
                  <span className="detail-value dept-badge">{selectedEmployee.department || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Position:</span>
                  <span className="detail-value">{selectedEmployee.position || "Employee"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Base Salary:</span>
                  <span className="detail-value salary-highlight">
                    KSh {parseFloat(selectedEmployee.base_salary || 0).toLocaleString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Hire Date:</span>
                  <span className="detail-value">
                    {selectedEmployee.hire_date 
                      ? new Date(selectedEmployee.hire_date).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-buttons">
              <button
                className="btn-cancel"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
              <button
                className="btn-edit"
                onClick={() => {
                  setShowViewModal(false);
                  handleEditClick(selectedEmployee);
                }}
              >
                ✏️ Edit Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>✏️ Edit Employee</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>National ID <span className="required">*</span></label>
                  <input
                    type="text"
                    name="national_id"
                    value={editFormData.national_id}
                    onChange={handleEditChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={editFormData.phone_number}
                    onChange={handleEditChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <select
                    name="department"
                    value={editFormData.department}
                    onChange={handleEditChange}
                    className="form-select"
                  >
                    <option value="">-- Select --</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    name="position"
                    value={editFormData.position}
                    onChange={handleEditChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Base Salary (KSh)</label>
                  <input
                    type="number"
                    name="base_salary"
                    value={editFormData.base_salary}
                    onChange={handleEditChange}
                    min="0"
                    step="0.01"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  💾 Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeList;