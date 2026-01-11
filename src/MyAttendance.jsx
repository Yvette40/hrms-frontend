// MyAttendance.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MyAttendance() {
  const [attendance, setAttendance] = useState({
    records: [],
    stats: {
      total_days: 0,
      present_days: 0,
      absent_days: 0,
      attendance_rate: 0
    }
  });

  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/my-attendance', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAttendance({
        records: res.data.records || [],
        stats: res.data.stats || {
          total_days: 0,
          present_days: 0,
          absent_days: 0,
          attendance_rate: 0
        }
      });

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>📊 My Attendance</h1>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
          <h3>Total Days</h3>
          <p style={{ fontSize: '2rem', margin: 0 }}>
            {attendance.stats?.total_days}
          </p>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
          <h3>Present</h3>
          <p style={{ fontSize: '2rem', margin: 0, color: '#10b981' }}>
            {attendance.stats?.present_days}
          </p>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
          <h3>Absent</h3>
          <p style={{ fontSize: '2rem', margin: 0, color: '#ef4444' }}>
            {attendance.stats?.absent_days}
          </p>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
          <h3>Rate</h3>
          <p style={{ fontSize: '2rem', margin: 0, color: '#3b82f6' }}>
            {attendance.stats?.attendance_rate}%
          </p>
        </div>
      </div>

      {/* Records Table */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '10px' }}>
        <h2>Attendance Records (Last 30 Days)</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Day</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(attendance.records || []).map((record, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px' }}>{record.date}</td>
                <td style={{ padding: '12px' }}>{record.day_of_week}</td>
                <td style={{ padding: '12px' }}>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      background: record.status === 'Present' ? '#d1fae5' : '#fee2e2',
                      color: record.status === 'Present' ? '#065f46' : '#991b1b',
                      fontWeight: 600
                    }}
                  >
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MyAttendance;
