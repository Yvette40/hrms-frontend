import React, { useEffect, useState, useCallback } from "react";
import { RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import "./AuditTrailPage.css";

export default function AuditTrailPage() {
  const [logs, setLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    user_id: "",
    module: "",
    dateFrom: "",
    dateTo: "",
  });
  const [filtersVisible, setFiltersVisible] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      setRefreshing(true);
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ""))
      ).toString();

      const response = await fetch(`http://127.0.0.1:5000/audit_trail?${query}`);
      if (!response.ok) throw new Error("Failed to fetch audit logs");

      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      alert("Failed to load audit logs");
      setLogs([]);
    } finally {
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleFilterSubmit = () => {
    fetchLogs();
  };

  return (
    <div className="audit-page">
      <h2 className="page-title">Audit Trail</h2>

      {/* Toggle Filters Button */}
      <button
        className="toggle-filters-btn"
        onClick={() => setFiltersVisible((prev) => !prev)}
      >
        {filtersVisible ? (
          <>
            Hide Filters <ChevronUp size={16} />
          </>
        ) : (
          <>
            Show Filters <ChevronDown size={16} />
          </>
        )}
      </button>

      {/* Filters Section */}
      {filtersVisible && (
        <div className="filters-container">
          <input
            type="text"
            placeholder="Search by user..."
            value={filters.user_id}
            onChange={(e) => handleFilterChange("user_id", e.target.value)}
          />

          <select
            value={filters.module}
            onChange={(e) => handleFilterChange("module", e.target.value)}
          >
            <option value="">All Modules</option>
            <option value="AUTH">Authentication</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="PAYROLL">Payroll</option>
            <option value="ATTENDANCE">Attendance</option>
            <option value="TEST_MODULE">Test Module</option>
          </select>

          <div className="date-filters">
            <label>From:</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            />
            <label>To:</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            />
          </div>

          <button className="apply-btn" onClick={handleFilterSubmit}>
            Apply Filters
          </button>

          <button className="refresh-btn" onClick={fetchLogs}>
            <RefreshCw size={16} />
            {refreshing ? " Refreshing..." : " Refresh"}
          </button>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>Description</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-logs">
                  No audit logs available
                </td>
              </tr>
            ) : (
              logs.map((log, index) => (
                <tr key={log.id || index}>
                  <td data-label="#">{index + 1}</td>
                  <td data-label="Timestamp">{log.timestamp}</td>
                  <td data-label="User">{log.user_id}</td>
                  <td data-label="Action">{log.action}</td>
                  <td data-label="Module">{log.module}</td>
                  <td data-label="Description">{log.details}</td>
                  <td data-label="IP Address">{log.ip_address || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
