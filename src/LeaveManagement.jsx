// src/LeaveManagement.jsx - ENHANCED VERSION
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LeaveManagement.css';

function LeaveManagement() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // Filter requests
  useEffect(() => {
    let filtered = leaveRequests;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.leave_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [statusFilter, searchTerm, leaveRequests]);

  const fetchLeaveRequests = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/leave-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaveRequests(res.data);
      setFilteredRequests(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId) => {
    if (!window.confirm('Approve this leave request?')) return;

    try {
      await axios.post(
        `http://127.0.0.1:5000/leave-requests/${leaveId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Leave request approved!');
      fetchLeaveRequests();
    } catch (err) {
      alert('❌ Error approving leave request');
      console.error(err);
    }
  };

  const handleRejectClick = (leave) => {
    setSelectedLeave(leave);
    setShowModal(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      await axios.post(
        `http://127.0.0.1:5000/leave-requests/${selectedLeave.id}/reject`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Leave request rejected');
      setShowModal(false);
      setRejectionReason('');
      fetchLeaveRequests();
    } catch (err) {
      alert('❌ Error rejecting leave request');
      console.error(err);
    }
  };

  // Calculate stats
  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter(r => r.status === 'Pending').length,
    approved: leaveRequests.filter(r => r.status === 'Approved').length,
    rejected: leaveRequests.filter(r => r.status === 'Rejected').length,
  };

  if (loading) {
    return <div className="loading">⏳ Loading leave requests...</div>;
  }

  return (
    <div className="leave-management-page">
      <div className="page-header">
        <h1>🏖️ Leave Management</h1>
        <p className="subtitle">Review and manage employee leave requests</p>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-card">
          <span className="stat-label">Total Requests</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-label">Pending</span>
          <span className="stat-value">{stats.pending}</span>
        </div>
        <div className="stat-card approved">
          <span className="stat-label">Approved</span>
          <span className="stat-value">{stats.approved}</span>
        </div>
        <div className="stat-card rejected">
          <span className="stat-label">Rejected</span>
          <span className="stat-value">{stats.rejected}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by employee name or leave type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-box">
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Requests ({leaveRequests.length})</option>
            <option value="Pending">Pending ({stats.pending})</option>
            <option value="Approved">Approved ({stats.approved})</option>
            <option value="Rejected">Rejected ({stats.rejected})</option>
          </select>
        </div>
      </div>

      {/* Leave Requests Table */}
      {filteredRequests.length === 0 ? (
        <div className="no-data">
          <p>No leave requests found</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="leave-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((leave) => (
                <tr key={leave.id}>
                  <td>{leave.id}</td>
                  <td className="emp-name">{leave.employee_name || 'N/A'}</td>
                  <td>
                    <span className="leave-type-badge">{leave.leave_type || 'Annual'}</span>
                  </td>
                  <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                  <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                  <td className="days-col">{leave.days || '-'}</td>
                  <td className="reason-col">{leave.reason || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${leave.status.toLowerCase()}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="actions-col">
                    {leave.status === 'Pending' && (
                      <>
                        <button
                          className="btn-approve"
                          onClick={() => handleApprove(leave.id)}
                        >
                          ✅
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleRejectClick(leave)}
                        >
                          ❌
                        </button>
                      </>
                    )}
                    {leave.status !== 'Pending' && (
                      <span className="no-action">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection Modal */}
      {showModal && selectedLeave && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>❌ Reject Leave Request</h2>
            <p className="modal-info">
              <strong>Employee:</strong> {selectedLeave.employee_name}<br />
              <strong>Leave Type:</strong> {selectedLeave.leave_type}<br />
              <strong>Dates:</strong> {new Date(selectedLeave.start_date).toLocaleDateString()} - {new Date(selectedLeave.end_date).toLocaleDateString()}
            </p>

            <div className="form-group">
              <label>Rejection Reason <span className="required">*</span></label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows="4"
                className="form-textarea"
                required
              />
            </div>

            <div className="modal-buttons">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowModal(false);
                  setRejectionReason('');
                }}
              >
                Cancel
              </button>
              <button className="btn-submit" onClick={handleReject}>
                Reject Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveManagement;
