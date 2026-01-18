import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MyAttendance.css';

function MyAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDays: 0,
    present: 0,
    absent: 0,
    late: 0,
    attendanceRate: 0
  });
  const [filter, setFilter] = useState('all');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://127.0.0.1:5000/my-attendance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const records = res.data || [];
      setAttendanceRecords(records);
      
      // Calculate stats
      const totalDays = records.length;
      const present = records.filter(r => r.status === 'Present' || r.status === 'present').length;
      const absent = records.filter(r => r.status === 'Absent' || r.status === 'absent').length;
      const late = records.filter(r => r.status === 'Late' || r.status === 'late').length;
      const attendanceRate = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;
      
      setStats({ totalDays, present, absent, late, attendanceRate });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'present') return 'status-present';
    if (statusLower === 'absent') return 'status-absent';
    if (statusLower === 'late') return 'status-late';
    if (statusLower === 'leave' || statusLower === 'on leave') return 'status-leave';
    return 'status-default';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const filteredRecords = attendanceRecords.filter(record => {
    if (filter === 'all') return true;
    return record.status?.toLowerCase() === filter.toLowerCase();
  });

  if (loading) {
    return <div className="loading">Loading attendance records...</div>;
  }

  return (
    <div className="my-attendance-container">
      <div className="attendance-header">
        <div>
          <h1>📅 My Attendance</h1>
          <p>Track your attendance history and records</p>
        </div>
        <button className="refresh-btn" onClick={fetchAttendance}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="attendance-stats">
        <div className="stat-card total">
          <h3>Total Days</h3>
          <p className="stat-number">{stats.totalDays}</p>
        </div>
        <div className="stat-card present">
          <h3>Present</h3>
          <p className="stat-number success">✓ {stats.present}</p>
        </div>
        <div className="stat-card absent">
          <h3>Absent</h3>
          <p className="stat-number danger">✗ {stats.absent}</p>
        </div>
        <div className="stat-card late">
          <h3>Late</h3>
          <p className="stat-number warning">⏰ {stats.late}</p>
        </div>
        <div className="stat-card rate">
          <h3>Attendance Rate</h3>
          <p className="stat-number">{stats.attendanceRate}%</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All ({attendanceRecords.length})
        </button>
        <button 
          className={filter === 'present' ? 'active' : ''}
          onClick={() => setFilter('present')}
        >
          Present ({stats.present})
        </button>
        <button 
          className={filter === 'absent' ? 'active' : ''}
          onClick={() => setFilter('absent')}
        >
          Absent ({stats.absent})
        </button>
        <button 
          className={filter === 'late' ? 'active' : ''}
          onClick={() => setFilter('late')}
        >
          Late ({stats.late})
        </button>
      </div>

      {/* Attendance Records */}
      <div className="attendance-records">
        <h2>Attendance History</h2>
        {filteredRecords.length === 0 ? (
          <div className="no-data">
            <p>📋 No attendance records found</p>
            <p className="text-muted">Your attendance records will appear here</p>
          </div>
        ) : (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, index) => (
                <tr key={record.id || index}>
                  <td>{formatDate(record.date || record.attendance_date)}</td>
                  <td>{new Date(record.date || record.attendance_date).toLocaleDateString('en-US', { weekday: 'long' })}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(record.status)}`}>
                      {record.status || 'Unknown'}
                    </span>
                  </td>
                  <td>{record.check_in_time || record.check_in || '-'}</td>
                  <td>{record.check_out_time || record.check_out || '-'}</td>
                  <td>{record.hours_worked || record.hours || '-'}</td>
                  <td className="notes-cell">{record.notes || record.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Attendance Policy */}
      <div className="policy-info">
        <h3>📋 Attendance Policy</h3>
        <ul>
          <li>Regular working hours: 9:00 AM - 5:00 PM</li>
          <li>Late arrival after 9:15 AM is marked as "Late"</li>
          <li>Contact HR for attendance corrections or discrepancies</li>
          <li>Attendance records are updated daily</li>
        </ul>
      </div>
    </div>
  );
}

export default MyAttendance;
