import React, { useState } from 'react';
import './Notifications.css';

function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'approval',
      title: 'Leave Request Approved',
      message: 'Your leave request for Jan 15-17 has been approved.',
      time: '2 hours ago',
      read: false,
      icon: '✅'
    },
    {
      id: 2,
      type: 'info',
      title: 'Payroll Processed',
      message: 'Your salary for December has been processed.',
      time: '1 day ago',
      read: false,
      icon: '💰'
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Attendance Reminder',
      message: 'Don\'t forget to mark your attendance today.',
      time: '3 days ago',
      read: true,
      icon: '📅'
    },
    {
      id: 4,
      type: 'alert',
      title: 'Document Upload Required',
      message: 'Please upload your updated ID documents.',
      time: '5 days ago',
      read: true,
      icon: '📄'
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="mark-all-btn">
            Mark all as read
          </button>
        )}
      </div>

      <div className="notifications-stats">
        <div className="stat-card">
          <span className="stat-number">{notifications.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{unreadCount}</span>
          <span className="stat-label">Unread</span>
        </div>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`notification-item ${!notif.read ? 'unread' : ''}`}
              onClick={() => markAsRead(notif.id)}
            >
              <div className="notification-icon">{notif.icon}</div>
              <div className="notification-content">
                <h3>{notif.title}</h3>
                <p>{notif.message}</p>
                <span className="notification-time">{notif.time}</span>
              </div>
              <button 
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notif.id);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {!notif.read && <div className="unread-indicator"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;
