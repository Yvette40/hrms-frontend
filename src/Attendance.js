// src/AttendancePage.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch employees from backend
  const fetchEmployees = useCallback(async () => {
    if (!token) return;

    try {
      const res = await axios.get("http://127.0.0.1:5000/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const empArray = res.data.employees || [];
      setEmployees(empArray);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
      setMessage("❌ Failed to load employees.");
    }
  }, [token]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Handle attendance status selection
  const handleStatusChange = (employee_id, status) => {
    setAttendance((prev) => ({ ...prev, [employee_id]: status }));
  };

  // Submit attendance to backend
  const handleMarkAttendance = async () => {
    if (Object.keys(attendance).length === 0) {
      setMessage("⚠️ Please mark attendance for at least one employee.");
      return;
    }

    setLoading(true);
    setMessage("");

    let successCount = 0;
    let failCount = 0;

    for (let [employee_id, status] of Object.entries(attendance)) {
      try {
        await axios.post(
          "http://127.0.0.1:5000/attendance",
          { employee_id, status }, // backend will set date automatically
          { headers: { Authorization: `Bearer ${token}` } }
        );
        successCount++;
      } catch (err) {
        console.error(`Failed attendance for employee ID ${employee_id}`, err);
        failCount++;
      }
    }

    setMessage(`✅ ${successCount} recorded, ❌ ${failCount} failed.`);
    setAttendance({});
    setLoading(false);
  };

  return (
    <div className="page-container">
      <h1>Attendance Management</h1>

      {message && (
        <div
          style={{
            margin: "10px 0",
            padding: "10px",
            border: "1px solid",
            borderColor: message.includes("✅") ? "green" : "red",
            color: message.includes("✅") ? "green" : "red",
          }}
        >
          {message}
        </div>
      )}

      {employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>National ID</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td>{emp.name}</td>
                <td>{emp.national_id}</td>
                <td>
                  <select
                    value={attendance[emp.id] || ""}
                    onChange={(e) => handleStatusChange(emp.id, e.target.value)}
                    disabled={loading}
                  >
                    <option value="">-- Select --</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="form-section" style={{ marginTop: "20px" }}>
        <button
          className="primary-btn"
          onClick={handleMarkAttendance}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Attendance"}
        </button>
      </div>
    </div>
  );
}

export default AttendancePage;
