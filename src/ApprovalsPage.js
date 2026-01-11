import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRole } from "./RoleContext";
import "./ApprovalsPage.css";

function ApprovalsPage() {
  const { userRole } = useRole();
  const [approvals, setApprovals] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [payrollDetails, setPayrollDetails] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (userRole === 'Admin') {
      fetchApprovals();
    }
  }, [userRole]);

  const fetchApprovals = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/approval-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApprovals(res.data || []);
    } catch (err) {
      console.error("Error fetching approvals:", err);
    }
  };

  const fetchPayrollDetails = async (payrollId) => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/payrolls`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const period = res.data.filter(p => 
        p.id === payrollId || p.period_start === res.data[0]?.period_start
      );
      setPayrollDetails(period);
    } catch (err) {
      console.error("Error fetching payroll details:", err);
    }
  };

  const handleApprove = async (payrollId) => {
    if (!window.confirm("Are you sure you want to approve this payroll?")) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        `http://127.0.0.1:5000/payroll/approve/${payrollId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(`✅ ${res.data.msg}`);
      fetchApprovals();
      setSelectedApproval(null);
      setPayrollDetails(null);
    } catch (err) {
      if (err.response?.data?.violation) {
        setMessage(`❌ SEPARATION OF DUTIES VIOLATION: ${err.response.data.msg}`);
      } else {
        setMessage(err.response?.data?.msg || "❌ Failed to approve payroll");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (payrollId) => {
    if (!rejectionReason.trim()) {
      setMessage("⚠️ Please provide a reason for rejection");
      return;
    }

    if (!window.confirm("Are you sure you want to reject this payroll?")) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        `http://127.0.0.1:5000/payroll/reject/${payrollId}`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(`✅ ${res.data.msg}`);
      fetchApprovals();
      setSelectedApproval(null);
      setPayrollDetails(null);
      setRejectionReason("");
    } catch (err) {
      setMessage(err.response?.data?.msg || "❌ Failed to reject payroll");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `KES ${parseFloat(amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  if (userRole !== 'Admin') {
    return (
      <div className="approvals-container">
        <h1>✅ Approval Requests</h1>
        <div className="access-denied">
          <p>⚠️ Only Admin can access approval requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="approvals-container">
      <div className="approvals-header">
        <h1>✅ Payroll Approval Requests</h1>
        <p>Review and approve payroll submissions</p>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="approvals-content">
        {/* Pending Approvals List */}
        <div className="approvals-list">
          <h2>Pending Approvals ({approvals.length})</h2>
          
          {approvals.length === 0 ? (
            <div className="no-approvals">
              <p>🎉 No pending approvals</p>
              <p className="subtext">All payrolls are up to date!</p>
            </div>
          ) : (
            <div className="approval-cards">
              {approvals.map((approval) => (
                <div
                  key={approval.id}
                  className={`approval-card ${selectedApproval?.id === approval.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedApproval(approval);
                    fetchPayrollDetails(approval.reference_id);
                  }}
                >
                  <div className="approval-card-header">
                    <span className="approval-type">{approval.type}</span>
                    <span className="approval-date">{approval.requested_at}</span>
                  </div>
                  <div className="approval-card-body">
                    <p className="requester">
                      <strong>Requested by:</strong> {approval.requested_by}
                    </p>
                    <span className="badge pending">Pending Review</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approval Details */}
        {selectedApproval && payrollDetails && (
          <div className="approval-details">
            <div className="details-header">
              <h2>Payroll Details</h2>
              <button
                className="btn-close"
                onClick={() => {
                  setSelectedApproval(null);
                  setPayrollDetails(null);
                }}
              >
                ✕
              </button>
            </div>

            {/* Summary */}
            <div className="details-summary">
              <div className="summary-item">
                <span className="label">Total Employees:</span>
                <span className="value">{payrollDetails.length}</span>
              </div>
              <div className="summary-item">
                <span className="label">Total Amount:</span>
                <span className="value success">
                  {formatCurrency(payrollDetails.reduce((sum, p) => sum + (p.net_salary || p.gross_salary), 0))}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Submitted by:</span>
                <span className="value">{selectedApproval.requested_by}</span>
              </div>
            </div>

            {/* Payroll Table */}
            <div className="details-table">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Gross</th>
                    <th>Deductions</th>
                    <th>Net Pay</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollDetails.map((p) => (
                    <tr key={p.id} className={p.anomaly_flag ? 'anomaly-row' : ''}>
                      <td>{p.employee}</td>
                      <td>{formatCurrency(p.gross_salary)}</td>
                      <td className="deductions">{formatCurrency(p.total_deductions || 0)}</td>
                      <td className="net-salary">{formatCurrency(p.net_salary || p.gross_salary)}</td>
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

            {/* Actions */}
            <div className="approval-actions">
              <div className="rejection-section">
                <label>Rejection Reason (if rejecting):</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows="3"
                />
              </div>

              <div className="action-buttons">
                <button
                  className="btn-approve"
                  onClick={() => handleApprove(selectedApproval.reference_id)}
                  disabled={loading}
                >
                  ✅ Approve Payroll
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleReject(selectedApproval.reference_id)}
                  disabled={loading || !rejectionReason.trim()}
                >
                  ❌ Reject Payroll
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApprovalsPage;
