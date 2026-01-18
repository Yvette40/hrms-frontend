import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useRole } from './RoleContext';
import './Navbar.css';

function Navbar() {
  const { userRole, username } = useRole();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Define navigation items based on user role
  const getNavigationItems = () => {
    const commonItems = [
      { path: '/dashboard', label: 'Dashboard', icon: '🏠' }
    ];

    const roleSpecificItems = {
      employee: [
        { path: '/my-attendance', label: 'My Attendance', icon: '📅' },
        { path: '/payslips', label: 'My Payslips', icon: '💰' },
        { path: '/leave', label: 'Leave Requests', icon: '🌴' },
        { path: '/profile', label: 'My Profile', icon: '👤' },
      ],
      
      admin: [
        { path: '/employees', label: 'Employees', icon: '👥' },
        { path: '/attendance', label: 'Attendance', icon: '📋' },
        { path: '/payroll', label: 'Payroll', icon: '💵' },
        { path: '/leave', label: 'Leave Management', icon: '🌴' },
        { path: '/users', label: 'User Management', icon: '👤' },
        { path: '/departments', label: 'Departments', icon: '🏢' },
        { path: '/audit-trail', label: 'Audit Trail', icon: '🔍' },
        { path: '/approvals', label: 'Approvals', icon: '✓' },
      ],
      
      hr_officer: [
        { path: '/employees', label: 'Employees', icon: '👥' },
        { path: '/attendance', label: 'Attendance', icon: '📋' },
        { path: '/payroll', label: 'Payroll', icon: '💵' },
        { path: '/leave', label: 'Leave Management', icon: '🌴' },
        { path: '/approvals', label: 'Approvals', icon: '✓' },
        { path: '/reports', label: 'Reports', icon: '📊' },
      ],
      
      dept_manager: [
        { path: '/employees', label: 'My Team', icon: '👥' },
        { path: '/attendance', label: 'Team Attendance', icon: '📋' },
        { path: '/leave', label: 'Leave Approvals', icon: '🌴' },
        { path: '/approvals', label: 'Approvals', icon: '✓' },
        { path: '/my-attendance', label: 'My Attendance', icon: '📅' },
      ],
    };

    const settingsItem = { path: '/settings', label: 'Settings', icon: '⚙️' };

    return [
      ...commonItems,
      ...(roleSpecificItems[userRole] || []),
      settingsItem
    ];
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className={`navbar navbar-${userRole}`} data-role={userRole}>
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="navbar-brand">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <span className="brand-text">GLIMMER HRMS</span>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <div className={`navbar-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* User Info & Logout */}
        <div className="navbar-user">
          <div className="user-info">
            <div className="user-avatar">
              {username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{username}</span>
              <span className="user-role">{userRole?.replace('_', ' ')}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2"/>
              <polyline points="16 17 21 12 16 7" strokeWidth="2"/>
              <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
