import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRole } from "./RoleContext";
import "./Payroll.css";
import { DownloadPayslipButton } from './components/PayslipPDF';
import { ExportButton } from './utils/ExcelExport';

function Payroll() {
  const { userRole } = useRole();
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [payrollPreview, setPayrollPreview] = useState(null);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("process"); // process, records

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPayrollRecords();
  }, []);

  const fetchPayrollRecords = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/payrolls", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayrollRecords(res.data || []);
    } catch (err) {
      console.error("Error fetching payroll:", err);
    }
  };

  const handleCalculatePreview = async (e) => {
    e.preventDefault();
    
    if (!periodStart || !periodEnd) {
      setMessage("⚠️ Please select both start and end dates");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/payroll/calculate",
        {
          period_start: periodStart,
          period_end: periodEnd
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPayrollPreview(res.data);
      setMessage("✅ Payroll calculated successfully! Review below.");
    } catch (err) {
      setMessage(err.response?.data?.msg || "❌ Failed to calculate payroll");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayroll = async () => {
    if (!payrollPreview) {
      setMessage("⚠️ Please calculate payroll first");
      return;
    }

    if (!window.confirm(`Submit payroll for ${payrollPreview.summary.total_employees} employees?`)) {
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/payroll/submit",
        {
          period_start: periodStart,
          period_end: periodEnd
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(`✅ ${res.data.msg} - Awaiting Admin approval`);
      setPayrollPreview(null);
      setPeriodStart("");
      setPeriodEnd("");
      fetchPayrollRecords();
      setActiveTab("records");
    } catch (err) {
      setMessage(err.response?.data?.msg || "❌ Failed to submit payroll");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayroll = async (payrollId) => {
    if (!window.confirm('Are you sure you want to approve this payroll record?')) {
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `http://127.0.0.1:5000/payroll/${payrollId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage(`✅ ${res.data.msg || 'Payroll approved successfully'}`);
      fetchPayrollRecords();
    } catch (err) {
      setMessage(err.response?.data?.msg || "❌ Failed to approve payroll");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `KES ${parseFloat(amount).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Check permissions
  const canProcess = ['HR Officer', 'Admin'].includes(userRole);
  const canApprove = userRole === 'Admin';
  const canView = ['HR Officer', 'Admin', 'Department Manager'].includes(userRole);

  if (!canView) {
    return (
      <div className="payroll-container">
        <h1>💰 Payroll Management</h1>
        <div className="access-denied">
          <p>⚠️ You do not have permission to view payroll information.</p>
          <p>Only HR Officer, Admin, and Department Manager can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payroll-container">
      <div className="payroll-header">
        <h1>💰 Payroll Management</h1>
        <p className="role-info">Role: {userRole}</p>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="payroll-tabs">
        {canProcess && (
          <button
            className={`tab ${activeTab === 'process' ? 'active' : ''}`}
            onClick={() => setActiveTab('process')}
          >
            🧮 Process Payroll
          </button>
        )}
        <button
          className={`tab ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          📋 Payroll Records
        </button>
      </div>

      {/* Process Payroll Tab */}
      {activeTab === 'process' && canProcess && (
        <div className="tab-content">
          <div className="process-section">
            <h2>Calculate Payroll</h2>
            <form onSubmit={handleCalculatePreview} className="payroll-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Period Start Date:</label>
                  <input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Period End Date:</label>
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-calculate" disabled={loading}>
                {loading ? "Calculating..." : "🧮 Calculate Payroll"}
              </button>
            </form>
          </div>

          {/* Payroll Preview */}
          {payrollPreview && (
            <div className="preview-section">
              <div className="preview-header">
                <h2>Payroll Preview</h2>
                <div className="preview-period">
                  Period: {payrollPreview.period.start} to {payrollPreview.period.end}
                </div>
              </div>

              {/* Summary Cards */}
              <div className="summary-cards">
                <div className="summary-card">
                  <div className="card-icon">👥</div>
                  <div className="card-info">
                    <h3>Total Employees</h3>
                    <p className="card-value">{payrollPreview.summary.total_employees}</p>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="card-icon">💰</div>
                  <div className="card-info">
                    <h3>Total Gross</h3>
                    <p className="card-value">{formatCurrency(payrollPreview.summary.total_gross)}</p>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="card-icon">📉</div>
                  <div className="card-info">
                    <h3>Total Deductions</h3>
                    <p className="card-value">{formatCurrency(payrollPreview.summary.total_deductions)}</p>
                  </div>
                </div>
                <div className="summary-card success">
                  <div className="card-icon">✓</div>
                  <div className="card-info">
                    <h3>Total Net Pay</h3>
                    <p className="card-value">{formatCurrency(payrollPreview.summary.total_net)}</p>
                  </div>
                </div>
              </div>

              {payrollPreview.summary.anomalies > 0 && (
                <div className="anomaly-alert">
                  ⚠️ {payrollPreview.summary.anomalies} employee(s) have anomalies (no attendance)
                </div>
              )}

              {/* Detailed Table */}
              <div className="preview-table-container">
                <table className="payroll-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Attendance</th>
                      <th>Gross Salary</th>
                      <th>NSSF</th>
                      <th>NHIF</th>
                      <th>PAYE</th>
                      <th>Housing</th>
                      <th>Deductions</th>
                      <th>Net Salary</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollPreview.preview.map((p, idx) => (
                      <tr key={idx} className={p.anomaly_flag ? 'anomaly-row' : ''}>
                        <td>{p.employee_name}</td>
                        <td>{p.attendance_days} days</td>
                        <td>{formatCurrency(p.gross_salary)}</td>
                        <td>{formatCurrency(p.nssf)}</td>
                        <td>{formatCurrency(p.nhif)}</td>
                        <td>{formatCurrency(p.paye)}</td>
                        <td>{formatCurrency(p.housing_levy)}</td>
                        <td className="deductions">{formatCurrency(p.total_deductions)}</td>
                        <td className="net-salary">{formatCurrency(p.net_salary)}</td>
                        <td>
                          {p.anomaly_flag ? (
                            <span className="badge anomaly">⚠️ Anomaly</span>
                          ) : (
                            <span className="badge ok">✓ OK</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="preview-actions">
                <button
                  onClick={handleSubmitPayroll}
                  className="btn-submit"
                  disabled={loading}
                >
                  ✅ Submit for Admin Approval
                </button>
                <button
                  onClick={() => {
                    setPayrollPreview(null);
                    setMessage("");
                  }}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payroll Records Tab */}
      {activeTab === 'records' && (
        <div className="tab-content">
          <div className="records-header">
            <h2>All Payroll Records</h2>
            <div className="records-header-actions">
              <ExportButton payrolls={payrollRecords} type="detailed" />
              <button onClick={fetchPayrollRecords} className="btn-refresh">
                🔄 Refresh
              </button>
            </div>
          </div>

          {payrollRecords.length === 0 ? (
            <p className="no-records">No payroll records found.</p>
          ) : (
            <div className="records-table-container">
              <table className="payroll-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Period</th>
                    <th>Gross</th>
                    <th>Deductions</th>
                    <th>Net Pay</th>
                    <th>Status</th>
                    <th>Anomaly</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollRecords.map((record) => (
                    <tr key={record.id}>
                      <td>{record.id}</td>
                      <td>{record.employee}</td>
                      <td>
                        {record.period_start} to {record.period_end}
                      </td>
                      <td>{formatCurrency(record.gross_salary)}</td>
                      <td>{formatCurrency(record.total_deductions || 0)}</td>
                      <td className="net-salary">{formatCurrency(record.net_salary || record.gross_salary)}</td>
                      <td>
                        <span className={`badge status-${record.status.toLowerCase()}`}>
                          {record.status}
                        </span>
                      </td>
                      <td>
                        {record.anomaly_flag ? (
                          <span className="badge anomaly">⚠️ Yes</span>
                        ) : (
                          <span className="badge ok">No</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <DownloadPayslipButton 
                            payrollId={record.id} 
                            employeeName={record.employee} 
                          />
                          {canApprove && record.status === 'Pending' && (
                            <button 
                              className="btn-approve-small"
                              onClick={() => handleApprovePayroll(record.id)}
                              disabled={loading}
                            >
                              ✓ Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Payroll;