import React, { useState } from 'react';
import { useRole } from './RoleContext';
import './Profile.css';

function Profile() {
  const { userRole, username } = useRole();
  
  const [profileData, setProfileData] = useState({
    firstName: username?.split(' ')[0] || 'John',
    lastName: username?.split(' ')[1] || 'Doe',
    email: 'john.doe@company.com',
    phone: '+254 712 345 678',
    department: 'Engineering',
    // RIGHT:
    position: 'Software Engineer',  // Job title
    role: userRole || 'Employee',    // System role
    employeeId: 'EMP-2024-001',
    dateJoined: 'January 15, 2024',
    address: 'Nairobi, Kenya',
    emergencyContact: '+254 722 111 222',
    emergencyName: 'Jane Doe'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(profileData);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(profileData);
  };

  const handleSave = () => {
    setProfileData(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(profileData);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditedData({
      ...editedData,
      [field]: value
    });
  };

  const getInitials = () => {
    return `${profileData.firstName[0]}${profileData.lastName[0]}`.toUpperCase();
  };

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
