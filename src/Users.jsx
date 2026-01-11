import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Employee'
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const token = localStorage.getItem('token');
  const roles = ['Admin', 'HR Officer', 'Department Manager', 'Employee'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      if (editMode) {
        await axios.put(
          `http://127.0.0.1:5000/users/${selectedUser.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('User updated successfully!');
      } else {
        await axios.post(
          'http://127.0.0.1:5000/users',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('User created successfully!');
      }
      
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error saving user');
      console.error(err);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: '',
      role: user.role
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      await axios.delete(`http://127.0.0.1:5000/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User deleted successfully!');
      fetchUsers();
    } catch (err) {
      alert('Error deleting user');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', role: 'Employee' });
    setEditMode(false);
    setSelectedUser(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <div>
          <h1>👤 User Management</h1>
          <p>Manage system users and roles</p>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          ➕ Add New User
        </button>
      </div>

      <div className="users-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{users.length}</p>
        </div>
        <div className="stat-card">
          <h3>Admins</h3>
          <p className="stat-number">{users.filter(u => u.role === 'Admin').length}</p>
        </div>
        <div className="stat-card">
          <h3>HR Officers</h3>
          <p className="stat-number">{users.filter(u => u.role === 'HR Officer').length}</p>
        </div>
        <div className="stat-card">
          <h3>Employees</h3>
          <p className="stat-number">{users.filter(u => u.role === 'Employee').length}</p>
        </div>
      </div>

      <div className="users-list">
        <h2>All Users</h2>
        {users.length === 0 ? (
          <p className="no-data">No users found</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase().replace(' ', '-')}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(user)}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(user.id, user.username)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editMode ? 'Edit User' : 'Add New User'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password {editMode && '(leave blank to keep current)'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!editMode}
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="modal-buttons">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editMode ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
