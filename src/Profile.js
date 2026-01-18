import React, { useState, useEffect } from 'react';
import { useRole } from './RoleContext';
import axios from './axiosConfig';
import config from './config';
import './Profile.css';

function Profile() {
  const { userRole, username } = useRole();
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    role: userRole || 'Employee',
    employeeId: '',
    dateJoined: '',
    address: '',
    emergencyContact: '',
    emergencyName: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(profileData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch employee profile data when component mounts
  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // ✅ FIXED: Use config.API_BASE_URL instead of config.apiBaseUrl
      const response = await axios.get(`${config.API_BASE_URL}/api/employee/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = response.data;
      
      const formattedData = {
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        department: data.department || '',
        position: data.position || data.job_title || '',
        role: userRole || 'Employee',
        employeeId: data.employee_id || data.id || '',
        dateJoined: data.date_joined || data.hire_date || '',
        address: data.address || '',
        emergencyContact: data.emergency_contact || data.emergency_phone || '',
        emergencyName: data.emergency_name || data.emergency_contact_name || ''
      };

      setProfileData(formattedData);
      setEditedData(formattedData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
      setLoading(false);
      
      // Fallback to default data if API fails
      const fallbackData = {
        firstName: username?.split(' ')[0] || 'John',
        lastName: username?.split(' ')[1] || 'Doe',
        email: 'john.doe@company.com',
        phone: '+254 712 345 678',
        department: 'Engineering',
        position: 'Software Engineer',
        role: userRole || 'Employee',
        employeeId: 'EMP-2024-001',
        dateJoined: 'January 15, 2024',
        address: 'Nairobi, Kenya',
        emergencyContact: '+254 722 111 222',
        emergencyName: 'Jane Doe'
      };
      setProfileData(fallbackData);
      setEditedData(fallbackData);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(profileData);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Send updated data to backend
      const updatePayload = {
        first_name: editedData.firstName,
        last_name: editedData.lastName,
        email: editedData.email,
        phone: editedData.phone,
        address: editedData.address,
        emergency_contact: editedData.emergencyContact,
        emergency_name: editedData.emergencyName
      };

      // ✅ FIXED: Use config.API_BASE_URL instead of config.apiBaseUrl
      await axios.put(`${config.API_BASE_URL}/api/employee/profile`, updatePayload, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setProfileData(editedData);
      setIsEditing(false);
      setError('');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditedData(profileData);
    setIsEditing(false);
    setError('');
  };

  const handleChange = (field, value) => {
    setEditedData({
      ...editedData,
      [field]: value
    });
  };

  const getInitials = () => {
    const first = profileData.firstName?.[0] || 'J';
    const last = profileData.lastName?.[0] || 'D';
    return `${first}${last}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        {!isEditing ? (
          <button onClick={handleEdit} className="edit-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Edit Profile
          </button>
        ) : (
          <div className="edit-actions">
            <button onClick={handleCancel} className="cancel-btn">Cancel</button>
            <button onClick={handleSave} className="save-btn">Save Changes</button>
          </div>
        )}
      </div>

      {error && (
        <div className="alert-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      <div className="profile-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-large">
            {getInitials()}
          </div>
          <h2>{profileData.firstName} {profileData.lastName}</h2>
          <p className="profile-position">{profileData.position}</p>
          <p className="profile-department">{profileData.department}</p>
          <div className="profile-badges">
            <span className="badge">{profileData.employeeId}</span>
            <span className="badge">Active</span>
          </div>
        </div>

        {/* Personal Information */}
        <div className="info-section">
          <h3>Personal Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>First Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editedData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                />
              ) : (
                <p>{profileData.firstName}</p>
              )}
            </div>
            <div className="info-item">
              <label>Last Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editedData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                />
              ) : (
                <p>{profileData.lastName}</p>
              )}
            </div>
            <div className="info-item">
              <label>Email</label>
              {isEditing ? (
                <input 
                  type="email" 
                  value={editedData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              ) : (
                <p>{profileData.email}</p>
              )}
            </div>
            <div className="info-item">
              <label>Phone</label>
              {isEditing ? (
                <input 
                  type="tel" 
                  value={editedData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              ) : (
                <p>{profileData.phone}</p>
              )}
            </div>
            <div className="info-item">
              <label>Address</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editedData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              ) : (
                <p>{profileData.address}</p>
              )}
            </div>
            <div className="info-item">
              <label>Date Joined</label>
              <p>{profileData.dateJoined}</p>
            </div>
          </div>
        </div>

        {/* Work Information */}
        <div className="info-section">
          <h3>Work Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Employee ID</label>
              <p>{profileData.employeeId}</p>
            </div>
            <div className="info-item">
              <label>Position</label>
              <p>{profileData.position}</p>
            </div>
            <div className="info-item">
              <label>Department</label>
              <p>{profileData.department}</p>
            </div>
            <div className="info-item">
              <label>System Role</label>
              <p>{profileData.role}</p>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="info-section">
          <h3>Emergency Contact</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Contact Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editedData.emergencyName}
                  onChange={(e) => handleChange('emergencyName', e.target.value)}
                />
              ) : (
                <p>{profileData.emergencyName}</p>
              )}
            </div>
            <div className="info-item">
              <label>Contact Number</label>
              {isEditing ? (
                <input 
                  type="tel" 
                  value={editedData.emergencyContact}
                  onChange={(e) => handleChange('emergencyContact', e.target.value)}
                />
              ) : (
                <p>{profileData.emergencyContact}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;