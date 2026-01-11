// src/pages/EmployeeSelfService.js
import React, { useState, useEffect } from 'react';
import { useRole } from '../RoleContext';
import { DownloadPayslipButton } from '../components/PayslipPDF';
import './EmployeeSelfService.css';

/**
 * Employee Self-Service Portal
 * Allows employees to view their own payslips, attendance, and personal information
 */

function EmployeeSelfService() {
  const { username } = useRole();
  const [employeeData, setEmployeeData] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('payslips');

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // In a real system, you'd have an endpoint to get employee by username
      // For now, we'll use employee ID 1 as an example
      const employeeId = 1; // TODO: Get actual employee ID from user account
      
      // Fetch payslips
      const payslipsResponse = await fetch(
        `http://127.0.0.1:5000/payroll/employee/${employeeId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (payslipsResponse.ok) {
        const payslipsData = await payslipsResponse.json();
        setPayslips(payslipsData);
      }
      
      // Fetch employee info (you'll need to create this endpoint)
      // const employeeResponse = await fetch(`http://127.0.0.1:5000/employees/${employeeId}`);
      // const employeeInfo = await employeeResponse.json();
      // setEmployeeData(employeeInfo);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setLoading(false);
    }
  };

  const calculateYTDTotals = () => {
    const currentYear = new Date().getFullYear();
    const ytdPayslips = payslips.filter(p => 
      new Date(p.period_start).getFullYear() === currentYear
    );
    
    return {
      grossSalary: ytdPayslips.reduce((sum, p) => sum + parseFloat(p.gross_salary), 0),
      deductions: ytdPayslips.reduce((sum, p) => sum + parseFloat(p.total_deductions), 0),
      netSalary: ytdPayslips.reduce((sum, p) => sum + parseFloat(p.net_salary), 0)
    };
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const ytdTotals = calculateYTDTotals();

  return (
    <div className="container-fluid employee-portal">
      <div className="row">
        {/* Header */}
        <div className="col-12">
          <div className="portal-header">
            <h2>👤 Employee Self-Service Portal</h2>
            <p className="text-muted">Welcome, {username}</p>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="col-12">
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card stat-card bg-primary text-white">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2">YTD Gross Salary</h6>
                  <h3 className="card-title">KES {ytdTotals.grossSalary.toLocaleString()}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card stat-card bg-danger text-white">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2">YTD Deductions</h6>
                  <h3 className="card-title">KES {ytdTotals.deductions.toLocaleString()}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card stat-card bg-success text-white">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2">YTD Net Salary</h6>
                  <h3 className="card-title">KES {ytdTotals.netSalary.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="col-12">
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'payslips' ? 'active' : ''}`}
                onClick={() => setActiveTab('payslips')}
              >
                📄 My Payslips
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                👤 My Profile
              </button>
            </li>
          </ul>
        </div>

        {/* Tab Content */}
        <div className="col-12">
          {activeTab === 'payslips' && (
            <div className="card">
              <div className="card-header">
                <h5>📄 My Payslips</h5>
              </div>
              <div className="card-body">
                {payslips.length === 0 ? (
                  <div className="alert alert-info">
                    No payslips available yet.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Period</th>
                          <th>Gross Salary</th>
                          <th>Deductions</th>
                          <th>Net Salary</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payslips.map((payslip) => (
                          <tr key={payslip.id}>
                            <td>
                              {payslip.period_start} to {payslip.period_end}
                            </td>
                            <td>KES {parseFloat(payslip.gross_salary).toLocaleString()}</td>
                            <td>KES {parseFloat(payslip.total_deductions).toLocaleString()}</td>
                            <td className="text-success fw-bold">
                              KES {parseFloat(payslip.net_salary).toLocaleString()}
                            </td>
                            <td>
                              <span className="badge bg-success">{payslip.status}</span>
                            </td>
                            <td>
                              <DownloadPayslipButton 
                                payrollId={payslip.id}
                                employeeName={username}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header">
                <h5>👤 My Profile</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Username</label>
                      <p className="form-control-plaintext">{username}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Role</label>
                      <p className="form-control-plaintext">Employee</p>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="alert alert-info">
                      <strong>Note:</strong> To update your personal information, please contact HR.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeSelfService;
