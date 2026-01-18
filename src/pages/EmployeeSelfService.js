import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import config from '../config';
import './EmployeeSelfService.css';

function EmployeeSelfService() {
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState(null);
  const [stats, setStats] = useState({
    daysPresent: 0,
    leaveBalance: 0,
    lastPayslip: 'N/A',
    attendancePercent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeData();
    fetchStats();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_BASE_URL}/api/employee/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEmployeeData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch attendance stats
      const attendanceResponse = await axios.get(`${config.API_BASE_URL}/my-attendance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const attendanceData = attendanceResponse.data || [];
      const presentDays = attendanceData.filter(a => a.status === 'present').length;
      const totalDays = attendanceData.length;
      const attendancePercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
      
      // Fetch leave balance (from employee profile)
      const leaveBalance = employeeData?.leave_balance || 0;
      
      setStats({
        daysPresent: presentDays,
        leaveBalance: leaveBalance,
        lastPayslip: 'N/A',
        attendancePercent: attendancePercent
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="employee-portal">
      {/* Header */}
      <div className="portal-header">
        <div className="header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2"/>
            <circle cx="12" cy="7" r="4" strokeWidth="2"/>
          </svg>
        </div>
        <div>
          <h1>Employee Self-Service Portal</h1>
          <p>View your information, attendance, and payslips</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <span className="stat-label">Days Present</span>
            <span className="stat-value">{stats.daysPresent}</span>
          </div>
        </div>

        <div className="stat-card blue">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <span className="stat-label">Leave Balance</span>
            <span className="stat-value">{stats.leaveBalance}</span>
          </div>
        </div>

        <div className="stat-card yellow">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <span className="stat-label">Last Payslip</span>
            <span className="stat-value">{stats.lastPayslip}</span>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-label">Attendance %</span>
            <span className="stat-value">{stats.attendancePercent}%</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>
          <span className="section-icon">⚡</span>
          Quick Actions
        </h2>
        <div className="quick-actions-grid">
          <button 
            className="quick-action-btn payslips"
            onClick={() => navigate('/payslips')}
          >
            <div className="action-icon">💰</div>
            <span>View Payslips</span>
          </button>

          <button 
            className="quick-action-btn leave"
            onClick={() => navigate('/leave')}
          >
            <div className="action-icon">📅</div>
            <span>Request Leave</span>
          </button>

          <button 
            className="quick-action-btn attendance"
            onClick={() => navigate('/my-attendance')}
          >
            <div className="action-icon">✓</div>
            <span>My Attendance</span>
          </button>

          <button 
            className="quick-action-btn profile"
            onClick={() => navigate('/profile')}
          >
            <div className="action-icon">👤</div>
            <span>Update Profile</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* My Information */}
        <div className="info-section">
          <h3>
            <span className="section-icon">📋</span>
            My Information
          </h3>
          
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your information...</p>
            </div>
          ) : employeeData ? (
            <div className="info-grid">
              <div className="info-card">
                <label>EMPLOYEE ID:</label>
                <p>{employeeData.employee_id || 'N/A'}</p>
              </div>

              <div className="info-card">
                <label>DEPARTMENT:</label>
                <p>{employeeData.department || 'Not Assigned'}</p>
              </div>

              <div className="info-card">
                <label>POSITION:</label>
                <p>{employeeData.position || 'Employee'}</p>
              </div>

              <div className="info-card">
                <label>JOIN DATE:</label>
                <p>{employeeData.date_joined || 'N/A'}</p>
              </div>

              <div className="info-card">
                <label>EMAIL:</label>
                <p>{employeeData.email || 'N/A'}</p>
              </div>

              <div className="info-card">
                <label>PHONE:</label>
                <p>{employeeData.phone || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div className="error-state">
              <p>Unable to load employee information</p>
              <button onClick={fetchEmployeeData}>Retry</button>
            </div>
          )}
        </div>

        {/* My Leave Requests */}
        <div className="leave-section">
          <h3>
            <span className="section-icon">📅</span>
            My Leave Requests
          </h3>
          <div className="leave-content">
            <p className="no-data">No leave requests found</p>
            <button 
              className="request-leave-btn"
              onClick={() => navigate('/leave')}
            >
              Request Leave
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeSelfService;
