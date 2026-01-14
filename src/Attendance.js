// src/Attendance.js - IMPROVED VERSION
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Attendance.css"; // We'll create this too

function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage, setEmployeesPerPage] = useState(25);
  const [statusFilter, setStatusFilter] = useState("all");
  
  const token = localStorage.getItem("token");

  // Fetch employees from backend
  const fetchEmployees = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://127.0.0.1:5000/employees?per_page=1000", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const empArray = res.data.employees || [];
      setEmployees(empArray);
      setFilteredEmployees(empArray);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
      setMessage("❌ Failed to load employees.");
    }
  }, [token]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Filter and search employees
  useEffect(() => {
    let filtered = employees;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.national_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.id.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((emp) => attendance[emp.id] === statusFilter);
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, statusFilter, employees, attendance]);

  // Pagination
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee
  );
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  // Handle attendance status selection
  const handleStatusChange = (employee_id, status) => {
    setAttendance((prev) => ({ ...prev, [employee_id]: status }));
  };

  // Bulk actions
  const handleBulkAction = (status) => {
    const newAttendance = {};
    currentEmployees.forEach((emp) => {
      newAttendance[emp.id] = status;
    });
    setAttendance((prev) => ({ ...prev, ...newAttendance }));
    setMessage(`✅ Marked ${currentEmployees.length} employees as ${status}`);
  };

  const handleMarkAllOnPage = (status) => {
    const newAttendance = {};
    currentEmployees.forEach((emp) => {
      newAttendance[emp.id] = status;
    });
    setAttendance((prev) => ({ ...prev, ...newAttendance }));
  };

  const handleMarkAllEmployees = (status) => {
    const newAttendance = {};
    filteredEmployees.forEach((emp) => {
      newAttendance[emp.id] = status;
    });
    setAttendance(newAttendance);
    setMessage(`✅ Marked ALL ${filteredEmployees.length} employees as ${status}`);
  };

  // Clear all selections
  const handleClearAll = () => {
    setAttendance({});
    setMessage("🔄 Cleared all attendance selections");
  };

  // Submit attendance to backend
  const handleMarkAttendance = async () => {
    if (Object.keys(attendance).length === 0) {
      setMessage("⚠️ Please mark attendance for at least one employee.");
      return;
    }

    if (!window.confirm(`Submit attendance for ${Object.keys(attendance).length} employees?`)) {
      return;
    }

    setLoading(true);
    setMessage("⏳ Submitting attendance...");

    let successCount = 0;
    let failCount = 0;

    for (let [employee_id, status] of Object.entries(attendance)) {
      try {
        await axios.post(
          "http://127.0.0.1:5000/attendance",
          { employee_id, status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        successCount++;
      } catch (err) {
        console.error(`Failed attendance for employee ID ${employee_id}`, err);
        failCount++;
      }
    }

    setMessage(
      `✅ ${successCount} recorded successfully${failCount > 0 ? `, ❌ ${failCount} failed` : ""}`
    );
    setAttendance({});
    setLoading(false);
  };

  // Get stats
  const markedCount = Object.keys(attendance).length;
  const presentCount = Object.values(attendance).filter(s => s === "Present").length;
  const absentCount = Object.values(attendance).filter(s => s === "Absent").length;
  const leaveCount = Object.values(attendance).filter(s => s === "Leave").length;

  return (
    <div className="attendance-page">
      <div className="page-header">
        <h1>📅 Attendance Management</h1>
        <p className="subtitle">Mark attendance for {new Date().toLocaleDateString()}</p>
      </div>

      {message && (
        <div className={`message-box ${message.includes("❌") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-card">
          <span className="stat-label">Total Employees</span>
          <span className="stat-value">{employees.length}</span>
        </div>
        <div className="stat-card marked">
          <span className="stat-label">Marked</span>
          <span className="stat-value">{markedCount}</span>
        </div>
        <div className="stat-card present">
          <span className="stat-label">Present</span>
          <span className="stat-value">{presentCount}</span>
        </div>
        <div className="stat-card absent">
          <span className="stat-label">Absent</span>
          <span className="stat-value">{absentCount}</span>
        </div>
        <div className="stat-card leave">
          <span className="stat-label">On Leave</span>
          <span className="stat-value">{leaveCount}</span>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        {/* Search */}
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by name, ID, or national ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search-btn" 
              onClick={() => setSearchTerm("")}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="filter-box">
          <label>Filter: </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Employees</option>
            <option value="Present">✅ Marked Present</option>
            <option value="Absent">❌ Marked Absent</option>
            <option value="Leave">🏖️ Marked Leave</option>
          </select>
        </div>

        {/* Rows per page */}
        <div className="rows-per-page">
          <label>Show: </label>
          <select
            value={employeesPerPage}
            onChange={(e) => {
              setEmployeesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rows-select"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={9999}>All</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bulk-actions">
        <div className="bulk-actions-group">
          <span className="bulk-label">Quick Actions (Current Page):</span>
          <button
            className="bulk-btn present-btn"
            onClick={() => handleMarkAllOnPage("Present")}
            disabled={loading}
          >
            ✅ Mark All Present
          </button>
          <button
            className="bulk-btn absent-btn"
            onClick={() => handleMarkAllOnPage("Absent")}
            disabled={loading}
          >
            ❌ Mark All Absent
          </button>
          <button
            className="bulk-btn leave-btn"
            onClick={() => handleMarkAllOnPage("Leave")}
            disabled={loading}
          >
            🏖️ Mark All Leave
          </button>
        </div>

        <div className="bulk-actions-group">
          <span className="bulk-label">For ALL Employees:</span>
          <button
            className="bulk-btn-all present-btn"
            onClick={() => handleMarkAllEmployees("Present")}
            disabled={loading}
          >
            ✅ All Present ({filteredEmployees.length})
          </button>
          <button
            className="bulk-btn-all clear-btn"
            onClick={handleClearAll}
            disabled={loading}
          >
            🔄 Clear All
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      {filteredEmployees.length === 0 ? (
        <div className="no-data">
          <p>No employees found.</p>
        </div>
      ) : (
        <>
          <div className="table-info">
            Showing {indexOfFirstEmployee + 1} - {Math.min(indexOfLastEmployee, filteredEmployees.length)} of {filteredEmployees.length} employees
          </div>

          <div className="table-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>National ID</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEmployees.map((emp) => (
                  <tr key={emp.id} className={attendance[emp.id] ? `marked-${attendance[emp.id].toLowerCase()}` : ""}>
                    <td>{emp.id}</td>
                    <td className="emp-name">{emp.name}</td>
                    <td>{emp.national_id}</td>
                    <td>{emp.department || "N/A"}</td>
                    <td>
                      <select
                        value={attendance[emp.id] || ""}
                        onChange={(e) => handleStatusChange(emp.id, e.target.value)}
                        disabled={loading}
                        className={`status-select ${attendance[emp.id] ? attendance[emp.id].toLowerCase() : ""}`}
                      >
                        <option value="">-- Select --</option>
                        <option value="Present">✅ Present</option>
                        <option value="Absent">❌ Absent</option>
                        <option value="Leave">🏖️ Leave</option>
                      </select>
                    </td>
                    <td className="quick-actions">
                      <button
                        className="quick-btn present"
                        onClick={() => handleStatusChange(emp.id, "Present")}
                        disabled={loading}
                        title="Mark Present"
                      >
                        ✅
                      </button>
                      <button
                        className="quick-btn absent"
                        onClick={() => handleStatusChange(emp.id, "Absent")}
                        disabled={loading}
                        title="Mark Absent"
                      >
                        ❌
                      </button>
                      <button
                        className="quick-btn leave"
                        onClick={() => handleStatusChange(emp.id, "Leave")}
                        disabled={loading}
                        title="Mark Leave"
                      >
                        🏖️
                      </button>
                    </td>
                  </tr>
                ))}
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

      {/* Submit Section */}
      <div className="submit-section">
        <div className="submit-info">
          <p>
            <strong>{markedCount}</strong> employee(s) marked for submission
          </p>
        </div>
        <button
          className="submit-btn"
          onClick={handleMarkAttendance}
          disabled={loading || markedCount === 0}
        >
          {loading ? "⏳ Submitting..." : `📤 Submit Attendance (${markedCount})`}
        </button>
      </div>
    </div>
  );
}

export default AttendancePage;