// src/pages/AuditTrailPage.jsx - UPGRADED BEAUTIFUL VERSION
import React, { useEffect, useState, useCallback } from "react";
import { RefreshCw, ChevronDown, ChevronUp, Download, Search, Calendar, User, Shield } from "lucide-react";
import "./AuditTrailPage.css";

export default function AuditTrailPage() {
  const [logs, setLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    user_id: "",
    module: "",
    action_type: "",
    dateFrom: "",
    dateTo: "",
  });
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    critical: 0,
    byModule: {},
    byAction: {}
  });

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
      calculateStats(data);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      alert("Failed to load audit logs");
      setLogs([]);
    } finally {
      setRefreshing(false);
    }
  }, [filters]);

  const calculateStats = (data) => {
    const today = new Date().toDateString();
    const todayLogs = data.filter(log => new Date(log.timestamp).toDateString() === today);
    const criticalLogs = data.filter(log => 
      log.action?.includes('DELETE') || 
      log.action?.includes('ROLE_CHANGE') ||
      log.details?.toLowerCase().includes('failed')
    );

    const byModule = {};
    const byAction = {};

    data.forEach(log => {
      byModule[log.module] = (byModule[log.module] || 0) + 1;
      const action = log.action?.split('_')[0] || 'OTHER';
      byAction[action] = (byAction[action] || 0) + 1;
    });

    setStats({
      total: data.length,
      today: todayLogs.length,
      critical: criticalLogs.length,
      byModule,
      byAction
    });
  };

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleFilterSubmit = () => {
    fetchLogs();
  };

  const clearFilters = () => {
    setFilters({
      user_id: "",
      module: "",
      action_type: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const exportToCSV = () => {
    if (logs.length === 0) {
      alert('No logs to export');
      return;
    }

    const headers = ['#', 'Timestamp', 'User ID', 'Action', 'Module', 'Description', 'IP Address'];
    const csvContent = [
      headers.join(','),
      ...logs.map((log, index) => 
        [
          index + 1,
          log.timestamp,
          log.user_id,
          log.action,
          log.module,
          `"${log.details?.replace(/"/g, '""')}"`,
          log.ip_address || '-'
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getActionColor = (action) => {
    if (!action) return 'default';
    const actionUpper = action.toUpperCase();
    if (actionUpper.includes('CREATE') || actionUpper.includes('ADD')) return 'green';
    if (actionUpper.includes('UPDATE') || actionUpper.includes('EDIT')) return 'blue';
    if (actionUpper.includes('DELETE') || actionUpper.includes('REMOVE')) return 'red';
    if (actionUpper.includes('VIEW') || actionUpper.includes('READ')) return 'gray';
    if (actionUpper.includes('LOGIN') || actionUpper.includes('LOGOUT')) return 'purple';
    if (actionUpper.includes('APPROVE')) return 'orange';
    return 'default';
  };

  const getModuleIcon = (module) => {
    const icons = {
      'AUTH': '🔐',
      'EMPLOYEE': '👥',
      'PAYROLL': '💰',
      'ATTENDANCE': '📅',
      'LEAVE': '🏖️',
      'USER': '👤',
      'SETTINGS': '⚙️',
      'REPORT': '📊'
    };
    return icons[module] || '📋';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="audit-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>🔍 Audit Trail</h1>
          <p className="subtitle">System activity monitoring and security logs</p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={exportToCSV}>
            <Download size={18} />
            Export CSV
          </button>
          <button className="btn-refresh" onClick={fetchLogs} disabled={refreshing}>
            <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Logs</div>
          </div>
        </div>

        <div className="stat-card today">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.today}</div>
            <div className="stat-label">Today's Activity</div>
          </div>
        </div>

        <div className="stat-card critical">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.critical}</div>
            <div className="stat-label">Critical Actions</div>
          </div>
        </div>

        <div className="stat-card modules">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{Object.keys(stats.byModule).length}</div>
            <div className="stat-label">Active Modules</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <button
          className="toggle-filters-btn"
          onClick={() => setFiltersVisible((prev) => !prev)}
        >
          {filtersVisible ? (
            <>
              <ChevronUp size={18} />
              Hide Filters
            </>
          ) : (
            <>
              <ChevronDown size={18} />
              Show Filters
            </>
          )}
        </button>

        {filtersVisible && (
          <div className="filters-container">
            <div className="filter-group">
              <label>
                <Search size={16} />
                Search User
              </label>
              <input
                type="text"
                placeholder="Enter user ID or name..."
                value={filters.user_id}
                onChange={(e) => handleFilterChange("user_id", e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>
                <Shield size={16} />
                Module
              </label>
              <select
                value={filters.module}
                onChange={(e) => handleFilterChange("module", e.target.value)}
              >
                <option value="">All Modules</option>
                <option value="AUTH">🔐 Authentication</option>
                <option value="EMPLOYEE">👥 Employee</option>
                <option value="PAYROLL">💰 Payroll</option>
                <option value="ATTENDANCE">📅 Attendance</option>
                <option value="LEAVE">🏖️ Leave</option>
                <option value="USER">👤 User Management</option>
                <option value="SETTINGS">⚙️ Settings</option>
              </select>
            </div>

            <div className="filter-group">
              <label>
                <User size={16} />
                Action Type
              </label>
              <select
                value={filters.action_type}
                onChange={(e) => handleFilterChange("action_type", e.target.value)}
              >
                <option value="">All Actions</option>
                <option value="CREATE">✅ Create</option>
                <option value="UPDATE">📝 Update</option>
                <option value="DELETE">❌ Delete</option>
                <option value="VIEW">👁️ View</option>
                <option value="LOGIN">🔐 Login</option>
                <option value="APPROVE">✔️ Approve</option>
              </select>
            </div>

            <div className="filter-group date-range">
              <label>
                <Calendar size={16} />
                Date Range
              </label>
              <div className="date-inputs">
                <input
                  type="date"
                  placeholder="From"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                />
                <span className="date-separator">to</span>
                <input
                  type="date"
                  placeholder="To"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                />
              </div>
            </div>

            <div className="filter-actions">
              <button className="btn-apply" onClick={handleFilterSubmit}>
                Apply Filters
              </button>
              <button className="btn-clear" onClick={clearFilters}>
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Audit Logs Timeline */}
      <div className="logs-section">
        <div className="section-header">
          <h2>Activity Timeline</h2>
          <span className="log-count">{logs.length} entries</span>
        </div>

        {logs.length === 0 ? (
          <div className="no-logs">
            <div className="empty-icon">📭</div>
            <h3>No Audit Logs Found</h3>
            <p>Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="timeline">
            {logs.map((log, index) => (
              <div key={log.id || index} className="timeline-item">
                <div className="timeline-marker">
                  <div className={`timeline-dot ${getActionColor(log.action)}`}></div>
                  <div className="timeline-line"></div>
                </div>

                <div className="log-card">
                  <div className="log-header">
                    <div className="log-title">
                      <span className="module-icon">{getModuleIcon(log.module)}</span>
                      <span className={`action-badge ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="module-badge">{log.module}</span>
                    </div>
                    <span className="log-time">{formatTimestamp(log.timestamp)}</span>
                  </div>

                  <div className="log-body">
                    <p className="log-description">{log.details}</p>
                  </div>

                  <div className="log-footer">
                    <div className="log-meta">
                      <span className="meta-item">
                        <User size={14} />
                        User ID: {log.user_id}
                      </span>
                      {log.ip_address && (
                        <span className="meta-item">
                          🌐 {log.ip_address}
                        </span>
                      )}
                    </div>
                    <span className="log-timestamp">{log.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
