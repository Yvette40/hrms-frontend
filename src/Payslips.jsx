import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Payslips.css';

function Payslips() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/my-payslips', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayslips(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching payslips:', err);
      setLoading(false);
    }
  };

  const viewPayslip = async (payslipId) => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/payroll/payslip/${payslipId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedPayslip(res.data);
      setShowModal(true);
    } catch (err) {
      alert('Error loading payslip details');
      console.error(err);
    }
  };

 const downloadPayslip = async (payslip) => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:5000/payroll/payslip/${payslip.id}/pdf`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      }
    );
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    const date = new Date(payslip.period_start);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    link.setAttribute('download', `Payslip_${month}_${year}.pdf`);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    alert('✅ Payslip downloaded successfully!');
  } catch (err) {
    alert('❌ Failed to download payslip PDF');
    console.error('Download error:', err);
  }
};

  if (loading) {
    return <div className="loading">Loading your payslips...</div>;
  }

  return (
    <div className="payslips-container">
      <div className="payslips-header">
        <h1>💰 My Payslips</h1>
        <p>View and download your salary statements</p>
      </div>

      <div className="payslips-stats">
        <div className="stat-card">
          <h3>Total Payslips</h3>
          <p className="stat-number">{payslips.length}</p>
        </div>
        <div className="stat-card">
          <h3>Latest Pay</h3>
          <p className="stat-number">
            {payslips[0] ? `KES ${payslips[0].net_salary.toLocaleString()}` : 'N/A'}
          </p>
        </div>
        <div className="stat-card">
          <h3>YTD Gross</h3>
          <p className="stat-number">
            KES {payslips.reduce((sum, p) => sum + p.gross_salary, 0).toLocaleString()}
          </p>
        </div>
        <div className="stat-card">
          <h3>YTD Deductions</h3>
          <p className="stat-number danger">
            KES {payslips.reduce((sum, p) => sum + p.total_deductions, 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="payslips-list">
        <h2>Salary History</h2>
        {payslips.length === 0 ? (
          <div className="no-data">
            <p>📄 No payslips available yet</p>
            <p className="text-muted">Your payslips will appear here once processed</p>
          </div>
        ) : (
          <div className="payslip-cards">
            {payslips.map(payslip => (
              <div key={payslip.id} className="payslip-card">
                <div className="payslip-header">
                  <div>
                    <h3>{payslip.period_start} - {payslip.period_end}</h3>
                    <p className="text-muted">Payment Period</p>
                  </div>
                  <span className="status-badge">{payslip.status}</span>
                </div>
                
                <div className="payslip-amounts">
                  <div className="amount-row">
                    <span>Gross Salary:</span>
                    <span className="amount">KES {payslip.gross_salary.toLocaleString()}</span>
                  </div>
                  <div className="amount-row danger">
                    <span>Deductions:</span>
                    <span className="amount">- KES {payslip.total_deductions.toLocaleString()}</span>
                  </div>
                  <div className="amount-row net">
                    <span>Net Salary:</span>
                    <span className="amount">KES {payslip.net_salary.toLocaleString()}</span>
                  </div>
                </div>

                <div className="payslip-actions">
                  <button 
                    className="btn-view"
                    onClick={() => viewPayslip(payslip.id)}
                  >
                    👁️ View Details
                  </button>
                  <button 
                    className="btn-download"
                    onClick={() => downloadPayslip(payslip)}
                  >
                    📥 Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payslip Detail Modal */}
      {showModal && selectedPayslip && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content payslip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💰 Payslip Details</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="payslip-details">
              <div className="detail-section">
                <h3>Employee Information</h3>
                <div className="detail-row">
                  <span>Name:</span>
                  <span>{selectedPayslip.employee.name}</span>
                </div>
                <div className="detail-row">
                  <span>ID:</span>
                  <span>{selectedPayslip.employee.national_id}</span>
                </div>
                <div className="detail-row">
                  <span>Period:</span>
                  <span>{selectedPayslip.period.start} to {selectedPayslip.period.end}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Earnings</h3>
                <div className="detail-row">
                  <span>Gross Salary:</span>
                  <span className="amount">KES {selectedPayslip.earnings.gross_salary.toLocaleString()}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Deductions</h3>
                <div className="detail-row">
                  <span>NSSF:</span>
                  <span className="amount danger">KES {selectedPayslip.deductions.nssf.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>NHIF:</span>
                  <span className="amount danger">KES {selectedPayslip.deductions.nhif.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>PAYE:</span>
                  <span className="amount danger">KES {selectedPayslip.deductions.paye.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>Housing Levy:</span>
                  <span className="amount danger">KES {selectedPayslip.deductions.housing_levy.toLocaleString()}</span>
                </div>
                <div className="detail-row total">
                  <span><strong>Total Deductions:</strong></span>
                  <span className="amount danger"><strong>KES {selectedPayslip.deductions.total.toLocaleString()}</strong></span>
                </div>
              </div>

              <div className="detail-section net-pay">
                <div className="detail-row">
                  <span><strong>NET SALARY:</strong></span>
                  <span className="amount success"><strong>KES {selectedPayslip.net_salary.toLocaleString()}</strong></span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Additional Information</h3>
                <div className="detail-row">
                  <span>Days Worked:</span>
                  <span>{selectedPayslip.attendance_days}</span>
                </div>
                <div className="detail-row">
                  <span>Status:</span>
                  <span className="status-badge">{selectedPayslip.status}</span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-download" onClick={() => downloadPayslip(selectedPayslip)}>
                📥 Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payslips;
