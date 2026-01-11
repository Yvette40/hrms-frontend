// src/pages/SchedulerDashboard.js
import React, { useState, useEffect } from 'react';
import './SchedulerDashboard.css';

/**
 * Scheduler Dashboard
 * Admin interface to manage automated payroll scheduling and SMS notifications
 */

function SchedulerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testPhone, setTestPhone] = useState('+254');
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetchScheduledJobs();
  }, []);

  const fetchScheduledJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/scheduler/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setLoading(false);
    }
  };

  const runJobNow = async (jobId) => {
    if (!window.confirm(`Run job "${jobId}" immediately?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/scheduler/run/${jobId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(data.msg);
        fetchScheduledJobs();
      } else {
        alert(`Error: ${data.msg}`);
      }
    } catch (error) {
      console.error('Error running job:', error);
      alert('Failed to run job');
    }
  };

  const testSMS = async (e) => {
    e.preventDefault();
    setTestResult(null);
    
    if (!testPhone || testPhone.length < 12) {
      alert('Please enter a valid phone number (e.g., +254712345678)');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/scheduler/test-sms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone_number: testPhone })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTestResult({ success: true, message: data.msg });
      } else {
        setTestResult({ success: false, message: data.msg || 'Failed to send SMS' });
      }
    } catch (error) {
      console.error('Error testing SMS:', error);
      setTestResult({ success: false, message: 'Network error' });
    }
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

  return (
    <div className="container-fluid scheduler-dashboard">
      <div className="row">
        {/* Header */}
        <div className="col-12">
          <div className="dashboard-header">
            <h2>⏰ Payroll Scheduler & SMS Management</h2>
            <p className="text-muted">Automated payroll processing and notifications</p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="col-12">
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card info-card bg-primary text-white">
                <div className="card-body">
                  <h6 className="card-subtitle">Scheduled Jobs</h6>
                  <h3 className="card-title">{jobs.length}</h3>
                  <p className="card-text">Active automation tasks</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card info-card bg-success text-white">
                <div className="card-body">
                  <h6 className="card-subtitle">Auto Payroll</h6>
                  <h3 className="card-title">Monthly</h3>
                  <p className="card-text">Runs on last day of month</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card info-card bg-info text-white">
                <div className="card-body">
                  <h6 className="card-subtitle">SMS Notifications</h6>
                  <h3 className="card-title">Active</h3>
                  <p className="card-text">Automatic employee alerts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled Jobs */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5>📅 Scheduled Jobs</h5>
            </div>
            <div className="card-body">
              {jobs.length === 0 ? (
                <div className="alert alert-info">
                  No scheduled jobs found. The scheduler may not be running.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Job Name</th>
                        <th>Next Run</th>
                        <th>Schedule</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => (
                        <tr key={job.id}>
                          <td>
                            <strong>{job.name}</strong>
                            <br />
                            <small className="text-muted">ID: {job.id}</small>
                          </td>
                          <td>
                            {new Date(job.next_run).toLocaleString()}
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              {job.trigger}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => runJobNow(job.id)}
                            >
                              ▶️ Run Now
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* How It Works */}
          <div className="card mt-4">
            <div className="card-header">
              <h5>ℹ️ How Automatic Payroll Works</h5>
            </div>
            <div className="card-body">
              <ol className="how-it-works">
                <li>
                  <strong>Monthly Processing:</strong> On the last day of each month at 11:59 PM, 
                  the system automatically calculates payroll for all active employees.
                </li>
                <li>
                  <strong>Attendance Check:</strong> The system pulls attendance records from the 
                  previous month and flags any anomalies (e.g., zero attendance).
                </li>
                <li>
                  <strong>Deduction Calculation:</strong> NSSF, NHIF, PAYE, and Housing Levy are 
                  automatically calculated based on Kenyan tax regulations.
                </li>
                <li>
                  <strong>Auto-Approval:</strong> Scheduled payrolls are automatically approved 
                  and marked as "Processed" in the system.
                </li>
                <li>
                  <strong>SMS Notifications:</strong> All employees with registered phone numbers 
                  receive SMS notifications about their payroll within minutes.
                </li>
                <li>
                  <strong>Payday Reminders:</strong> 3 days before payday (28th of each month), 
                  employees receive reminder SMS messages.
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* SMS Testing */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>📱 Test SMS Service</h5>
            </div>
            <div className="card-body">
              <form onSubmit={testSMS}>
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+254712345678"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    required
                  />
                  <small className="form-text text-muted">
                    Format: +254XXXXXXXXX (Kenyan)
                  </small>
                </div>
                
                <button type="submit" className="btn btn-primary w-100">
                  📤 Send Test SMS
                </button>
              </form>

              {testResult && (
                <div className={`alert mt-3 ${testResult.success ? 'alert-success' : 'alert-danger'}`}>
                  {testResult.success ? '✅' : '❌'} {testResult.message}
                </div>
              )}
            </div>
          </div>

          {/* Configuration Info */}
          <div className="card mt-4">
            <div className="card-header">
              <h5>⚙️ Configuration</h5>
            </div>
            <div className="card-body">
              <div className="config-item">
                <strong>SMS Provider:</strong>
                <p>Africa's Talking API</p>
              </div>
              <div className="config-item">
                <strong>Scheduler:</strong>
                <p>APScheduler (Background)</p>
              </div>
              <div className="config-item">
                <strong>Timezone:</strong>
                <p>EAT (East Africa Time)</p>
              </div>
              <div className="config-item">
                <strong>Auto-Approval:</strong>
                <p>Enabled for scheduled jobs</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card mt-4">
            <div className="card-header">
              <h5>⚡ Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-success"
                  onClick={() => runJobNow('monthly_payroll')}
                >
                  💰 Run Monthly Payroll Now
                </button>
                <button 
                  className="btn btn-info"
                  onClick={() => runJobNow('payday_reminders')}
                >
                  📢 Send Payday Reminders
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={fetchScheduledJobs}
                >
                  🔄 Refresh Jobs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SchedulerDashboard;