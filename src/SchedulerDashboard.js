// src/SchedulerDashboard.js - Beautiful Scheduler Management Dashboard
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SchedulerDashboard.css';

function SchedulerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [runningJob, setRunningJob] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchJobs();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/scheduler/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data.jobs || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setMessage('❌ Failed to load scheduled jobs');
      setLoading(false);
    }
  };

  const runJobNow = async (jobId) => {
    if (!window.confirm(`Run job "${jobId}" immediately?`)) return;

    setRunningJob(jobId);
    setMessage('');

    try {
      await axios.post(
        `http://127.0.0.1:5000/scheduler/jobs/${jobId}/run`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`✅ Job "${jobId}" executed successfully!`);
      setTimeout(() => setMessage(''), 5000);
      fetchJobs();
    } catch (err) {
      setMessage(`❌ Failed to run job: ${err.response?.data?.msg || 'Unknown error'}`);
    } finally {
      setRunningJob(null);
    }
  };

  const getJobIcon = (jobId) => {
    const icons = {
      'payroll_reminders': '💰',
      'attendance_reminders': '📅',
      'monthly_reports': '📊',
      'cleanup': '🧹'
    };
    return icons[jobId] || '⚙️';
  };

  const getJobColor = (jobId) => {
    const colors = {
      'payroll_reminders': 'green',
      'attendance_reminders': 'blue',
      'monthly_reports': 'purple',
      'cleanup': 'orange'
    };
    return colors[jobId] || 'gray';
  };

  const formatNextRun = (nextRun) => {
    if (!nextRun || nextRun === 'N/A') return 'Not scheduled';
    const date = new Date(nextRun);
    const now = new Date();
    const diff = date - now;
    
    if (diff < 0) return 'Overdue';
    if (diff < 3600000) return `In ${Math.floor(diff / 60000)} minutes`;
    if (diff < 86400000) return `In ${Math.floor(diff / 3600000)} hours`;
    
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScheduleDescription = (trigger) => {
    if (trigger.includes('cron')) {
      if (trigger.includes('mon')) return 'Every Monday at 9:00 AM';
      if (trigger.includes('mon-fri')) return 'Weekdays at 8:00 AM';
      if (trigger.includes('day=1')) return '1st of every month at 10:00 AM';
      if (trigger.includes('sun')) return 'Every Sunday at 2:00 AM';
    }
    return trigger;
  };

  if (loading) {
    return (
      <div className="scheduler-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading scheduler...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.next_run !== 'N/A').length,
    paused: jobs.filter(j => j.next_run === 'N/A').length
  };

  return (
    <div className="scheduler-page">
      <div className="page-header">
        <div>
          <h1>📅 Scheduler Dashboard</h1>
          <p className="subtitle">Automated Task Management & Monitoring</p>
        </div>
        <button className="btn-refresh" onClick={fetchJobs}>
          🔄 Refresh
        </button>
      </div>

      {message && (
        <div className={`message-banner ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Jobs</div>
          </div>
        </div>

        <div className="stat-card active">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active Jobs</div>
          </div>
        </div>

        <div className="stat-card paused">
          <div className="stat-icon">⏸️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.paused}</div>
            <div className="stat-label">Paused Jobs</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-value">Auto</div>
            <div className="stat-label">Execution Mode</div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="jobs-section">
        <div className="section-header">
          <h2>🔥 Scheduled Jobs</h2>
          <span className="job-count">{jobs.length} jobs configured</span>
        </div>

        {jobs.length === 0 ? (
          <div className="no-jobs">
            <div className="empty-icon">📭</div>
            <h3>No Scheduled Jobs</h3>
            <p>The scheduler is running but no jobs are configured.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div key={job.id} className={`job-card ${getJobColor(job.id)}`}>
                <div className="job-header">
                  <div className="job-title">
                    <span className="job-icon">{getJobIcon(job.id)}</span>
                    <div>
                      <h3>{job.name}</h3>
                      <span className="job-id">{job.id}</span>
                    </div>
                  </div>
                  <div className={`status-indicator ${job.next_run !== 'N/A' ? 'active' : 'paused'}`}>
                    <span className="status-dot"></span>
                    {job.next_run !== 'N/A' ? 'Active' : 'Paused'}
                  </div>
                </div>

                <div className="job-details">
                  <div className="detail-row">
                    <span className="detail-label">⏰ Next Run:</span>
                    <span className="detail-value next-run">
                      {formatNextRun(job.next_run)}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">📅 Schedule:</span>
                    <span className="detail-value">
                      {getScheduleDescription(job.trigger)}
                    </span>
                  </div>
                </div>

                <div className="job-actions">
                  <button
                    className="btn-action primary"
                    onClick={() => runJobNow(job.id)}
                    disabled={runningJob === job.id}
                  >
                    {runningJob === job.id ? (
                      <>
                        <span className="btn-spinner"></span>
                        Running...
                      </>
                    ) : (
                      <>▶️ Run Now</>
                    )}
                  </button>

                  <button className="btn-action secondary" title="View Logs">
                    📊 Logs
                  </button>

                  <button className="btn-action tertiary" title="Settings">
                    ⚙️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="info-section">
        <div className="info-card">
          <h3>ℹ️ About Scheduler</h3>
          <p>
            The scheduler runs automated tasks in the background to keep your HRMS running smoothly.
            Jobs execute automatically at their scheduled times, but you can also trigger them manually
            using the "Run Now" button.
          </p>
        </div>

        <div className="info-card tips">
          <h3>💡 Quick Tips</h3>
          <ul>
            <li>Jobs refresh automatically every 30 seconds</li>
            <li>Manual execution doesn't affect the regular schedule</li>
            <li>Check logs to monitor job execution history</li>
            <li>Active jobs show a green status indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SchedulerDashboard;
