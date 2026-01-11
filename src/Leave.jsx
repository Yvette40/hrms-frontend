import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Leave.css';

function Leave() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/leave-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaveRequests(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId) => {
    try {
      await axios.post(
        `http://127.0.0.1:5000/leave-requests/${leaveId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Leave request approved!');
      fetchLeaveRequests();
    } catch (err) {
      alert('Error approving leave request');
      console.error(err);
    }
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
      alert('Leave request rejected');
      setShowModal(false);
      setRejectionReason('');
      fetchLeaveRequests();
    } catch (err) {
      alert('Error rejecting leave request');
      console.error(err);
    }
  };

  const openRejectModal = (leave) => {
    setSelectedLeave(leave);
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading">Loading leave requests...</div>;
  }

  return (
    <div className="leave-container">
      <div className="leave-header">
        <h1>📅 Leave Management</h1>
        <p>Review and manage employee leave requests</p>
      </div>

      <div className="leave-stats">
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number">{leaveRequests.filter(l => l.status === 'Pending').length}</p>
        </div>
        <div className="stat-card">
          <h3>Approved</h3>
          <p className="stat-number success">{leaveRequests.filter(l => l.status === 'Approved').length}</p>
        </div>
        <div className="stat-card">
          <h3>Rejected</h3>
          <p className="stat-number danger">{leaveRequests.filter(l => l.status === 'Rejected').length}</p>
        </div>
      </div>

      <div className="leave-list">
        <h2>Leave Requests</h2>
        {leaveRequests.length === 0 ? (
          <p className="no-data">No leave requests found</p>
        ) : (
          <table className="leave-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map(leave => (
                <tr key={leave.id} className={`status-${leave.status.toLowerCase()}`}>
                  <td>{leave.employee_name}</td>
                  <td>{leave.leave_type}</td>
                  <td>{leave.start_date}</td>
                  <td>{leave.end_date}</td>
                  <td>{leave.days_requested}</td>
                  <td>{leave.reason || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${leave.status.toLowerCase()}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td>
                    {leave.status === 'Pending' && (
                      <div className="action-buttons">
                        <button 
                          className="btn-approve"
                          onClick={() => handleApprove(leave.id)}
                        >
                          ✓ Approve
                        </button>
                        <button 
                          className="btn-reject"
                          onClick={() => openRejectModal(leave)}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                    {leave.status !== 'Pending' && (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Rejection Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Reject Leave Request</h2>
            <p>Employee: {selectedLeave?.employee_name}</p>
            <p>Period: {selectedLeave?.start_date} to {selectedLeave?.end_date}</p>
            
            <textarea
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows="4"
            />
            
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={handleReject}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leave;
