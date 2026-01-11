import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRole } from "./RoleContext";
import "./EmployeePage.css";

function EmployeePage() {
  const { userRole } = useRole();
  const [employees, setEmployees] = useState([]);
  
  // Form fields
  const [name, setName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [baseSalary, setBaseSalary] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [position, setPosition] = useState("");
  const [createUserAccount, setCreateUserAccount] = useState(true);
  const [username, setUsername] = useState("");
  const [tempPassword, setTempPassword] = useState("TempPass123");
  
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showCredentials, setShowCredentials] = useState(null);

  // Filter states
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("token");

  // Department list matching the generated employee data
  const DEPARTMENTS = [
    "Engineering",
    "Finance", 
    "Sales",
    "Marketing",
    "HR",
    "Operations",
    "IT",
    "Customer Service",
    "Legal",
    "Procurement",
    "Admin",
    "Logistics"
  ];

  const fetchEmployees = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://127.0.0.1:5000/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data.employees || res.data || []);
    } catch (err) {
      console.error(err);
      setMessage("❌ Could not load employees. Make sure you are logged in.");
    }
  }, [token]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Auto-generate username from name
  useEffect(() => {
    if (name && createUserAccount && !editingId) {
      const nameParts = name.toLowerCase().trim().split(" ");
      if (nameParts.length >= 2) {
        const generatedUsername = nameParts[0][0] + nameParts[nameParts.length - 1];
        setUsername(generatedUsername);
      } else if (nameParts.length === 1) {
        setUsername(nameParts[0]);
      }
    }
  }, [name, createUserAccount, editingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !nationalId || !baseSalary) {
      setMessage("⚠️ Please fill all required fields");
      return;
    }

    setLoading(true);
    setMessage("");
    setShowCredentials(null);

    try {
      if (editingId) {
        await axios.put(
          `http://127.0.0.1:5000/employees/${editingId}`,
          {
            name,
            national_id: nationalId,
            base_salary: parseFloat(baseSalary),
            email,
            phone_number: phoneNumber,
            department,
            position,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("✅ Employee updated successfully!");
        setEditingId(null);
      } else {
        const response = await axios.post(
          "http://127.0.0.1:5000/employees",
          {
            name,
            national_id: nationalId,
            base_salary: parseFloat(baseSalary),
            email,
            phone_number: phoneNumber,
            department,
            position,
            create_user_account: createUserAccount,
            username: username,
            temp_password: tempPassword,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setMessage("✅ Employee added successfully!");
        
        // Show credentials if user account was created
        if (response.data.user_credentials) {
          setShowCredentials(response.data.user_credentials);
        }
      }

      // Reset form
      setName("");
      setNationalId("");
      setBaseSalary("");
      setEmail("");
      setPhoneNumber("");
      setDepartment("Engineering");
      setPosition("");
      setUsername("");
      setTempPassword("TempPass123");
      setCreateUserAccount(true);
      
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.msg || "❌ Failed to save employee. Check console."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (emp) => {
    setEditingId(emp.id);
    setName(emp.name);
    setNationalId(emp.national_id);
    setBaseSalary(emp.base_salary);
    setEmail(emp.email || "");
    setPhoneNumber(emp.phone_number || "");
    setDepartment(emp.department || "Engineering");
    setPosition(emp.position || "");
    setCreateUserAccount(false);
    setMessage("✏️ Editing employee. Update fields and click Save.");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await axios.delete(`http://127.0.0.1:5000/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("🗑️ Employee deleted successfully!");
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to delete employee.");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Filter and search employees
  const filteredEmployees = employees.filter(emp => {
    const matchesDepartment = filterDepartment === "All" || emp.department === filterDepartment;
    const matchesSearch = searchQuery === "" || 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.national_id.includes(searchQuery) ||
      (emp.position && emp.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (emp.email && emp.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesDepartment && matchesSearch;
  });

  // Department statistics
  const departmentStats = employees.reduce((acc, emp) => {
    const dept = emp.department || "Unassigned";
    if (!acc[dept]) {
      acc[dept] = { count: 0, totalSalary: 0 };
    }
    acc[dept].count++;
    acc[dept].totalSalary += parseFloat(emp.base_salary || 0);
    return acc;
  }, {});

  const canAdd = ['Admin', 'HR Officer'].includes(userRole);
  const canEdit = ['Admin', 'HR Officer'].includes(userRole);
  const canDelete = ['Admin'].includes(userRole);
  const canView = ['Admin', 'HR Officer', 'Department Manager'].includes(userRole);

  if (!canView) {
    return (
      <div className="employee-page">
        <div className="page-header">
          <h1>Employee Management</h1>
        </div>
        <div className="alert alert-error">
          ⚠️ You do not have permission to view this page. Only Admin, HR Officer, and Department Manager can access employee management.
        </div>
      </div>
    );
  }

  return (
    <div className="employee-page">
      <div className="page-header">
        <h1>👥 Employee Management</h1>
        <p>Add, edit, and manage employee records</p>
      </div>

      {userRole === 'Department Manager' && (
        <div className="alert alert-info">
          ℹ️ As Department Manager, you can view all employees. Contact HR Officer to add or edit employee records.
        </div>
      )}

      {message && (
        <div className={`alert ${message.includes("✅") ? "alert-success" : message.includes("⚠️") ? "alert-info" : "alert-error"}`}>
          {message}
        </div>
      )}

      {/* Credentials Display */}
      {showCredentials && (
        <div className="credentials-card">
          <div className="credentials-header">
            <h3>🔐 Employee Login Credentials Created</h3>
            <button onClick={() => setShowCredentials(null)}>✕</button>
          </div>
          <div className="credentials-body">
            <p className="credentials-warning">
              ⚠️ <strong>Important:</strong> Save these credentials and send them to the employee. They won't be shown again!
            </p>
            <div className="credential-item">
              <label>Username:</label>
              <div className="credential-value">
                <code>{showCredentials.username}</code>
                <button onClick={() => copyToClipboard(showCredentials.username)}>📋 Copy</button>
              </div>
            </div>
            <div className="credential-item">
              <label>Temporary Password:</label>
              <div className="credential-value">
                <code>{showCredentials.temp_password}</code>
                <button onClick={() => copyToClipboard(showCredentials.temp_password)}>📋 Copy</button>
              </div>
            </div>
            <p className="credentials-note">
              💡 The employee will be required to change their password on first login.
            </p>
          </div>
        </div>
      )}

      {/* Department Statistics */}
      {employees.length > 0 && (
        <div className="form-card" style={{ marginBottom: '24px' }}>
          <h2>📊 Department Overview</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
            gap: '12px',
            marginTop: '16px'
          }}>
            {Object.entries(departmentStats)
              .sort((a, b) => b[1].count - a[1].count)
              .map(([dept, stats]) => (
                <div key={dept} style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', opacity: 0.9 }}>
                    {dept}
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '4px' }}>
                    {stats.count}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    Avg: KES {Math.round(stats.totalSalary / stats.count).toLocaleString()}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {canAdd && (
        <div className="form-card">
          <h2>{editingId ? "✏️ Edit Employee" : "➕ Add New Employee"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g., John Mwangi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label>National ID *</label>
                <input
                  type="text"
                  placeholder="e.g., 12345678"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="e.g., john@glimmer.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g., +254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Department *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={loading}
                  required
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Position</label>
                <input
                  type="text"
                  placeholder="e.g., Software Engineer"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Base Salary (KES) *</label>
                <input
                  type="number"
                  placeholder="e.g., 50000"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {!editingId && (
              <>
                <div className="form-divider">
                  <span>User Account Settings</span>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={createUserAccount}
                      onChange={(e) => setCreateUserAccount(e.target.checked)}
                      disabled={loading}
                    />
                    <span>Create login account for this employee</span>
                  </label>
                  <p className="help-text">
                    If checked, a user account will be created so the employee can log in to the system.
                  </p>
                </div>

                {createUserAccount && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Username (auto-generated)</label>
                      <input
                        type="text"
                        placeholder="Will be auto-generated"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                      />
                      <p className="help-text">Auto-generated from name. You can change it if needed.</p>
                    </div>

                    <div className="form-group">
                      <label>Temporary Password</label>
                      <input
                        type="text"
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        disabled={loading}
                      />
                      <p className="help-text">Employee must change this on first login.</p>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Saving..." : editingId ? "💾 Save Changes" : "➕ Add Employee"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingId(null);
                    setName("");
                    setNationalId("");
                    setBaseSalary("");
                    setEmail("");
                    setPhoneNumber("");
                    setDepartment("Engineering");
                    setPosition("");
                    setUsername("");
                    setTempPassword("TempPass123");
                    setCreateUserAccount(true);
                    setMessage("");
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div style={{ marginBottom: '20px' }}>
          <h2>📋 Current Employees ({filteredEmployees.length} {filterDepartment !== "All" ? `in ${filterDepartment}` : 'total'})</h2>
          
          {/* Filters */}
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            flexWrap: 'wrap',
            marginTop: '16px',
            alignItems: 'center'
          }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <input
                type="text"
                placeholder="🔍 Search by name, ID, position, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.95rem'
                }}
              />
            </div>
            
            <div style={{ minWidth: '200px' }}>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.95rem'
                }}
              >
                <option value="All">All Departments ({employees.length})</option>
                {DEPARTMENTS.map(dept => {
                  const count = departmentStats[dept]?.count || 0;
                  return count > 0 ? (
                    <option key={dept} value={dept}>{dept} ({count})</option>
                  ) : null;
                })}
              </select>
            </div>
          </div>
        </div>

        {filteredEmployees.length === 0 ? (
          <p className="no-data">
            {searchQuery || filterDepartment !== "All" 
              ? "No employees match your search criteria." 
              : "No employees found. Add your first employee above!"}
          </p>
        ) : (
          <div className="table-wrapper">
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
                  {(canEdit || canDelete) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((e) => (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td style={{ fontWeight: '600' }}>{e.name}</td>
                    <td>{e.national_id}</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        background: '#2563eb',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {e.department || "Unassigned"}
                      </span>
                    </td>
                    <td>{e.position || "Employee"}</td>
                    <td style={{ fontSize: '0.85rem', color: '#2563eb' }}>{e.email || "-"}</td>
                    <td style={{ fontSize: '0.85rem' }}>{e.phone_number || "-"}</td>
                    <td style={{ fontWeight: '600', color: '#059669' }}>
                      KES {Number(e.base_salary).toLocaleString()}
                    </td>
                    {(canEdit || canDelete) && (
                      <td className="actions-cell">
                        {canEdit && (
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleEdit(e)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                        )}
                        {canDelete && (
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(e.id)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeePage;