// src/DepartmentManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DepartmentManagement.css';

function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager: '',
    budget: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch employees to calculate department stats
      const empRes = await axios.get('http://127.0.0.1:5000/employees?per_page=1000', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(empRes.data.employees || []);

      // Calculate department data from employees
      const deptMap = {};
      empRes.data.employees.forEach(emp => {
        const dept = emp.department || 'Unassigned';
        if (!deptMap[dept]) {
          deptMap[dept] = {
            name: dept,
            employeeCount: 0,
            totalSalary: 0,
            employees: []
          };
        }
        deptMap[dept].employeeCount++;
        deptMap[dept].totalSalary += parseFloat(emp.base_salary || 0);
        deptMap[dept].employees.push(emp);
      });

      setDepartments(Object.values(deptMap));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just show alert since backend doesn't have department CRUD
    alert('Department management requires backend API updates');
    setShowModal(false);
    resetForm();
  };

  const handleEdit = (dept) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      description: '',
      manager: '',
      budget: ''
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = (deptName) => {
    if (!window.confirm(`Delete department "${deptName}"?`)) return;
    alert('Department deletion requires backend API updates');
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', manager: '', budget: '' });
    setEditMode(false);
    setSelectedDept(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading">⏳ Loading departments...</div>;
  }

  return (
    <div className="department-management-page">
      <div className="page-header">
        <div>
          <h1>🏢 Department Management</h1>
          <p className="subtitle">Manage departments and team structure</p>
        </div>
        <button className="btn-add" onClick={openAddModal}>
          ➕ Add Department
        </button>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-card">
          <span className="stat-label">Total Departments</span>
          <span className="stat-value">{departments.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Employees</span>
          <span className="stat-value">{employees.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Payroll</span>
          <span className="stat-value">
            KSh {departments.reduce((sum, d) => sum + d.totalSalary, 0).toLocaleString()}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg per Dept</span>
          <span className="stat-value">
            {departments.length > 0 ? Math.round(employees.length / departments.length) : 0}
          </span>
        </div>
      </div>

      {/* Department Cards */}
      <div className="departments-grid">
        {departments.map((dept, index) => (
          <div key={index} className="dept-card">
            <div className="dept-header">
              <h3>{dept.name}</h3>
              <div className="dept-actions">
                <button className="btn-icon" onClick={() => handleEdit(dept)} title="Edit">
                  ✏️
                </button>
                <button className="btn-icon" onClick={() => handleDelete(dept.name)} title="Delete">
                  🗑️
                </button>
              </div>
            </div>

            <div className="dept-stats">
              <div className="dept-stat">
                <span className="stat-icon">👥</span>
                <div>
                  <div className="stat-number">{dept.employeeCount}</div>
                  <div className="stat-text">Employees</div>
                </div>
              </div>

              <div className="dept-stat">
                <span className="stat-icon">💰</span>
                <div>
                  <div className="stat-number">
                    KSh {dept.totalSalary.toLocaleString()}
                  </div>
                  <div className="stat-text">Total Salary</div>
                </div>
              </div>

              <div className="dept-stat">
                <span className="stat-icon">📊</span>
                <div>
                  <div className="stat-number">
                    KSh {dept.employeeCount > 0 ? Math.round(dept.totalSalary / dept.employeeCount).toLocaleString() : 0}
                  </div>
                  <div className="stat-text">Avg Salary</div>
                </div>
              </div>
            </div>

            <div className="dept-employees">
              <h4>Team Members ({dept.employeeCount})</h4>
              <div className="employee-list">
                {dept.employees.slice(0, 5).map(emp => (
                  <div key={emp.id} className="employee-item">
                    <span className="emp-avatar">👤</span>
                    <div className="emp-info">
                      <div className="emp-name">{emp.name}</div>
                      <div className="emp-position">{emp.position || 'Employee'}</div>
                    </div>
                  </div>
                ))}
                {dept.employeeCount > 5 && (
                  <div className="more-employees">
                    + {dept.employeeCount - 5} more...
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editMode ? 'Edit Department' : 'Add New Department'}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Department Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Engineering"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the department..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Department Manager</label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) => setFormData({...formData, manager: e.target.value})}
                  placeholder="Manager name"
                />
              </div>

              <div className="form-group">
                <label>Annual Budget (KSh)</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="modal-buttons">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editMode ? 'Update' : 'Create'} Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartmentManagement;
