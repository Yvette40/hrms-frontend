import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LeaveRequests.css';

function LeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://127.0.0.1:5000/my-leaves', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaveRequests(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.leave_type || !formData.start_date || !formData.end_date || !formData.reason) {
      setMessage('⚠️ Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      setMessage('');
      
      await axios.post('http://127.0.0.1:5000/leaves', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form
      setFormData({
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: ''
      });
      setShowModal(false);
      setSubmitting(false);
      setMessage('✅ Leave request submitted successfully!');
      
      // Refresh leave requests
      fetchLeaveRequests();
    } catch (err) {
      console.error('Error submitting leave request:', err);
      setMessage('❌ Failed to submit leave request. Please try again.');
      setSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'pending') return 'pending';
    if (statusLower === 'approved') return 'approved';
    if (statusLower === 'rejected') return 'rejected';
    return 'default';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const pendingCount = leaveRequests.filter(l => l.status?.toLowerCase() === 'pending').length;
  const approvedCount = leaveRequests.filter(l => l.status?.toLowerCase() === 'approved').length;
  const rejectedCount = leaveRequests.filter(l => l.status?.toLowerCase() === 'rejected').length;

  if (loading) {
    return <div className="loading">Loading your leave requests...</div>;
  }

  return (
    <div className="leave-requests-container">
      <div className="leave-header">
        <div>
          <h1>🏖️ My Leave Requests</h1>
          <p>View and manage your leave applications</p>
        </div>
        <button className="btn-request-leave" onClick={() => setShowModal(true)}>
          ➕ Request Leave
        </button>
      </div>

      {message && (
        <div className={`message-box ${message.includes('❌') || message.includes('⚠️') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Stats */}
      <div className="leave-stats">
        <div className="stat-card pending">
          <h3>Pending</h3>
          <p className="stat-number">{pendingCount}</p>
        </div>
        <div className="stat-card approved">
          <h3>Approved</h3>
          <p className="stat-number success">{approvedCount}</p>
        </div>
        <div className="stat-card rejected">
          <h3>Rejected</h3>
          <p className="stat-number danger">{rejectedCount}</p>
        </div>
        <div className="stat-card total">
          <h3>Total Requests</h3>
          <p className="stat-number">{leaveRequests.length}</p>
        </div>
      </div>

      {/* Leave Requests List */}
      <div className="leave-list">
        <h2>Leave History</h2>
        {leaveRequests.length === 0 ? (
          <div className="no-data">
            <p>📋 No leave requests yet</p>
            <p className="text-muted">Click "Request Leave" to submit your first request</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              Request Leave
            </button>
          </div>
        ) : (
          <div className="leave-cards">
            {leaveRequests.map((leave) => (
              <div key={leave.id} className={`leave-card status-${getStatusClass(leave.status)}`}>
                <div className="leave-card-header">
                  <div className="leave-type">
                    <span className="type-icon">
                      {leave.leave_type?.toLowerCase() === 'annual' && '🏖️'}
                      {leave.leave_type?.toLowerCase() === 'sick' && '🏥'}
                      {leave.leave_type?.toLowerCase() === 'personal' && '👤'}
                      {leave.leave_type?.toLowerCase() === 'emergency' && '🚨'}
                      {!['annual', 'sick', 'personal', 'emergency'].includes(leave.leave_type?.toLowerCase()) && '📅'}
                    </span>
                    <span className="type-name">{leave.leave_type || 'Leave'}</span>
                  </div>
                  <span className={`status-badge ${getStatusClass(leave.status)}`}>
                    {leave.status || 'Pending'}
                  </span>
                </div>

                <div className="leave-card-body">
                  <div className="leave-dates">
                    <div className="date-item">
                      <span className="date-label">From</span>
                      <span className="date-value">{formatDate(leave.start_date)}</span>
                    </div>
                    <div className="date-separator">→</div>
                    <div className="date-item">
                      <span className="date-label">To</span>
                      <span className="date-value">{formatDate(leave.end_date)}</span>
                    </div>
                  </div>

                  <div className="leave-duration">
                    📅 <span>{leave.days_requested || calculateDays(leave.start_date, leave.end_date)} days</span>
                  </div>

                  <div className="leave-reason">
                    <span className="reason-label">Reason:</span>
                    <p>{leave.reason || 'No reason provided'}</p>
                  </div>

                  {leave.response_note && (
                    <div className="leave-response">
                      <span className="response-label">
                        {leave.status?.toLowerCase() === 'approved' ? '✓ Approved' : '✗ Rejected'}:
                      </span>
                      <p>{leave.response_note}</p>
                    </div>
                  )}
                </div>

                <div className="leave-card-footer">
                  <span className="submitted-date">
                    Submitted: {formatDate(leave.created_at || leave.request_date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Leave Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Leave</h2>
              <button 
                className="btn-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Leave Type *</label>
                  <select
                    name="leave_type"
                    value={formData.leave_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select leave type</option>
                    <option value="annual">🏖️ Annual Leave</option>
                    <option value="sick">🏥 Sick Leave</option>
                    <option value="personal">👤 Personal Leave</option>
                    <option value="emergency">🚨 Emergency Leave</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="form-group">
                    <label>End Date *</label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      required
                      min={formData.start_date || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {formData.start_date && formData.end_date && (
                  <div className="days-info">
                    Total Days: <strong>{calculateDays(formData.start_date, formData.end_date)}</strong>
                  </div>
                )}

                <div className="form-group">
                  <label>Reason *</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Please provide a reason for your leave request..."
                    rows="4"
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? '⏳ Submitting...' : '✓ Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveRequests;
