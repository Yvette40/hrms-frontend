import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ApprovalRequestsPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPendingPayrolls();
  }, []);

  const fetchPendingPayrolls = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:5000/payrolls', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter only pending payrolls
      const pending = (res.data || []).filter(p => p.status === 'Pending');
      setPayrolls(pending);
    } catch (err) {
      console.error('Error fetching payrolls:', err);
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (payrollId) => {
    try {
      await axios.post(
        `http://127.0.0.1:5000/payroll/approve/${payrollId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Payroll approved successfully!');
      fetchPendingPayrolls();
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to approve payroll';
      if (err.response?.data?.violation) {
        alert(`⛔ SEPARATION OF DUTIES VIOLATION!\n\n${errorMsg}`);
      } else {
        alert(`❌ ${errorMsg}`);
      }
    }
  };

  if (loading) {
    return <div className="page-container">Loading...</div>;
  }

  return (
    <div className="page-container">
      <h1>📋 Pending Approvals</h1>
      
      {payrolls.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: '#f0f9ff',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <h3>✅ No pending approvals</h3>
          <p>All payrolls have been processed.</p>
        </div>
      ) : (
        <>
          <div style={{
            background: '#fff3cd',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            borderLeft: '4px solid #ffc107'
          }}>
            <strong>⚠️ Note:</strong> You cannot approve payrolls that you prepared yourself (Separation of Duties).
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Period</th>
                <th>Gross Salary</th>
                <th>Status</th>
                <th>Anomaly</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.employee}</td>
                  <td>{p.period_start} to {p.period_end}</td>
                  <td>KSh {p.gross_salary?.toLocaleString() || 0}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: '#f59e0b',
                      color: 'white',
                      fontSize: '0.8rem'
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td>{p.anomaly_flag ? '⚠️ Yes' : '✅ No'}</td>
                  <td>
                    <button 
                      className="primary-btn"
                      onClick={() => handleApprove(p.id)}
                      style={{ marginRight: '5px' }}
                    >
                      ✅ Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="summary">
            <h3>Summary</h3>
            <p><b>Pending Approvals:</b> {payrolls.length}</p>
            <p><b>Total Amount:</b> KSh {payrolls.reduce((sum, p) => sum + (p.gross_salary || 0), 0).toLocaleString()}</p>
          </div>
        </>
      )}
    </div>
  );
}