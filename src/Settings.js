import React, { useState } from 'react';
import './Settings.css';

function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    leaveRequests: true,
    payrollAlerts: true,
    attendanceReminders: true,
    twoFactorAuth: false,
    sessionTimeout: '30',
    theme: 'light',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [saveMessage, setSaveMessage] = useState('');

  const handleToggle = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
  };

  const handleSelectChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value
    });
  };

  const handleSaveSettings = () => {
    // Here you would typically make an API call to save settings
    setSaveMessage('Settings saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    // Here you would typically make an API call to change password
    alert('Password changed successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <button onClick={handleSaveSettings} className="save-settings-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="17 21 17 13 7 13 7 21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="7 3 7 8 15 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Save All Changes
        </button>
      </div>

      {saveMessage && (
        <div className="save-message">
          {saveMessage}
        </div>
      )}

      <div className="settings-content">
        {/* Notifications Settings */}
        <div className="settings-section">
          <h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Notifications
          </h2>
          
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h3>Email Notifications</h3>
                <p>Receive notifications via email</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Push Notifications</h3>
                <p>Receive push notifications in browser</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>SMS Notifications</h3>
                <p>Receive notifications via SMS</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.smsNotifications}
                  onChange={() => handleToggle('smsNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <h3 className="subsection-title">Notification Types</h3>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h3>Leave Requests</h3>
                <p>Notifications about leave request status</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.leaveRequests}
                  onChange={() => handleToggle('leaveRequests')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Payroll Alerts</h3>
                <p>Notifications about salary processing</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.payrollAlerts}
                  onChange={() => handleToggle('payrollAlerts')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Attendance Reminders</h3>
                <p>Daily attendance marking reminders</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.attendanceReminders}
                  onChange={() => handleToggle('attendanceReminders')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="settings-section">
          <h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Security
          </h2>
          
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h3>Two-Factor Authentication</h3>
                <p>Add an extra layer of security to your account</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.twoFactorAuth}
                  onChange={() => handleToggle('twoFactorAuth')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Session Timeout</h3>
                <p>Automatically log out after inactivity</p>
              </div>
              <select 
                value={settings.sessionTimeout}
                onChange={(e) => handleSelectChange('sessionTimeout', e.target.value)}
                className="setting-select"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>

          {/* Change Password */}
          <h3 className="subsection-title">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="password-form">
            <div className="form-group">
              <label>Current Password</label>
              <input 
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input 
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="change-password-btn">
              Change Password
            </button>
          </form>
        </div>

        {/* Preferences */}
        <div className="settings-section">
          <h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Preferences
          </h2>
          
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h3>Language</h3>
                <p>Choose your preferred language</p>
              </div>
              <select 
                value={settings.language}
                onChange={(e) => handleSelectChange('language', e.target.value)}
                className="setting-select"
              >
                <option value="en">English</option>
                <option value="sw">Swahili</option>
                <option value="fr">French</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Date Format</h3>
                <p>Choose how dates are displayed</p>
              </div>
              <select 
                value={settings.dateFormat}
                onChange={(e) => handleSelectChange('dateFormat', e.target.value)}
                className="setting-select"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>Time Format</h3>
                <p>Choose 12-hour or 24-hour format</p>
              </div>
              <select 
                value={settings.timeFormat}
                onChange={(e) => handleSelectChange('timeFormat', e.target.value)}
                className="setting-select"
              >
                <option value="12h">12 Hour</option>
                <option value="24h">24 Hour</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
