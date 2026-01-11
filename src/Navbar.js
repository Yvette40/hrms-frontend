import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useRole } from "./RoleContext";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, username } = useRole();
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const quickActionsRef = useRef(null);
  const searchRef = useRef(null);

  const [notifications] = useState([
    {
      id: 1,
      type: 'approval',
      title: 'Leave Request Approved',
      message: 'Your leave request has been approved.',
      time: '2h ago',
      read: false,
      icon: '✅'
    },
    {
      id: 2,
      type: 'info',
      title: 'Payroll Processed',
      message: 'December salary processed.',
      time: '1d ago',
      read: false,
      icon: '💰'
    },
    {
      id: 3,
      type: 'reminder',
      title: 'Attendance Reminder',
      message: 'Mark your attendance today.',
      time: '3d ago',
      read: true,
      icon: '📅'
    }
  ]);

  const notificationCount = notifications.filter(n => !n.read).length;

  // Scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target)) {
        setQuickActionsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      // Escape to close dropdowns
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setProfileDropdownOpen(false);
        setNotificationDropdownOpen(false);
        setQuickActionsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Theme toggle
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (location.pathname === "/login") return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    navigate("/login", { replace: true });
  };

  const isActive = (path) => (location.pathname === path ? "active" : "");

  const getRoleBadgeStyle = () => {
    const baseStyle = {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '600',
      marginLeft: '12px',
      display: 'inline-block'
    };

    switch(userRole) {
      case 'Admin':
        return { ...baseStyle, background: '#ef4444', color: 'white' };
      case 'HR Officer':
        return { ...baseStyle, background: '#3b82f6', color: 'white' };
      case 'Department Manager':
        return { ...baseStyle, background: '#10b981', color: 'white' };
      case 'Employee':
        return { ...baseStyle, background: '#f59e0b', color: 'white' };
      default:
        return { ...baseStyle, background: '#6b7280', color: 'white' };
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Breadcrumbs
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    return paths.map((path, index) => ({
      name: path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' '),
      path: '/' + paths.slice(0, index + 1).join('/')
    }));
  };

  const breadcrumbs = getBreadcrumbs();

  // Search suggestions
  const searchSuggestions = [
    { title: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { title: 'Employees', path: '/employees', icon: '👥' },
    { title: 'Attendance', path: '/attendance', icon: '📅' },
    { title: 'Payroll', path: '/payroll', icon: '💰' },
    { title: 'Reports', path: '/reports', icon: '📊' },
    { title: 'Profile', path: '/profile', icon: '👤' },
    { title: 'Settings', path: '/settings', icon: '⚙️' },
  ].filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSelect = (path) => {
    navigate(path);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="nav-container">
        <div className="logo-section">
          <div className="logo">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="logo-text">HRMS</span>
            {userRole && (
              <span style={getRoleBadgeStyle()}>
                {userRole}
              </span>
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links desktop-nav">
          <Link className={`nav-link ${isActive("/dashboard")}`} to="/dashboard">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="14" y="3" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="14" y="14" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="14" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-text">Dashboard</span>
          </Link>

          {userRole === 'Employee' && (
            <Link className={`nav-link ${isActive("/employee-portal")}`} to="/employee-portal">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="nav-text">My Portal</span>
            </Link>
          )}

          {['Admin', 'HR Officer', 'Department Manager'].includes(userRole) && (
            <Link className={`nav-link ${isActive("/employees")}`} to="/employees">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="nav-text">Employees</span>
            </Link>
          )}

          {['Admin', 'HR Officer', 'Department Manager'].includes(userRole) && (
            <Link className={`nav-link ${isActive("/attendance")}`} to="/attendance">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="nav-text">Attendance</span>
            </Link>
          )}

          {['Admin', 'HR Officer'].includes(userRole) && (
            <Link className={`nav-link ${isActive("/payroll")}`} to="/payroll">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="1" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="nav-text">Payroll</span>
            </Link>
          )}

          {['Admin'].includes(userRole) && (
            <Link className={`nav-link ${isActive("/approvals")}`} to="/approvals">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="nav-text">Approvals</span>
            </Link>
          )}

          {['Admin'].includes(userRole) && (
            <Link className={`nav-link ${isActive("/scheduler")}`} to="/scheduler">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="nav-text">Scheduler</span>
            </Link>
          )}

          {['Admin', 'HR Officer'].includes(userRole) && (
            <Link className={`nav-link ${isActive("/audit-trail")}`} to="/audit-trail">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="14 2 14 8 20 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="13" x2="8" y2="13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="17" x2="8" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="10 9 9 9 8 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="nav-text">Audit Trail</span>
            </Link>
          )}

          {['Admin', 'HR Officer', 'Department Manager'].includes(userRole) && (
            <Link className={`nav-link ${isActive("/reports")}`} to="/reports">
              <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="20" x2="18" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="20" x2="12" y2="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="6" y1="20" x2="6" y2="14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="nav-text">Reports</span>
            </Link>
          )}
        </div>

        {/* Right Actions */}
        <div className="nav-actions">
          {/* Search */}
          <div className="search-container" ref={searchRef}>
            <button 
              className="search-trigger"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
              title="Search (Ctrl+K)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {searchOpen && (
              <div className="search-dropdown">
                <div className="search-input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8" strokeWidth="2"/>
                    <path d="m21 21-4.35-4.35" strokeWidth="2"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <kbd>ESC</kbd>
                </div>
                <div className="search-results">
                  {searchSuggestions.length > 0 ? (
                    searchSuggestions.map((item, index) => (
                      <div
                        key={index}
                        className="search-item"
                        onClick={() => handleSearchSelect(item.path)}
                      >
                        <span className="search-icon">{item.icon}</span>
                        <span>{item.title}</span>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">No results found</div>
                  )}
                </div>
                <div className="search-footer">
                  <span>Press <kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
                  <span><kbd>Enter</kbd> to select</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-container" ref={quickActionsRef}>
            <button
              className="quick-actions-trigger"
              onClick={() => setQuickActionsOpen(!quickActionsOpen)}
              aria-label="Quick Actions"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {quickActionsOpen && (
              <div className="quick-actions-dropdown">
                <div className="dropdown-header">Quick Actions</div>
                {userRole === 'Admin' && (
                  <div className="dropdown-item" onClick={() => { navigate('/employees'); setQuickActionsOpen(false); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2"/>
                      <circle cx="8.5" cy="7" r="4" strokeWidth="2"/>
                      <line x1="20" y1="8" x2="20" y2="14" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="23" y1="11" x2="17" y2="11" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>Add Employee</span>
                  </div>
                )}
                <div className="dropdown-item" onClick={() => { navigate('/attendance'); setQuickActionsOpen(false); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/>
                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
                    <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
                  </svg>
                  <span>Mark Attendance</span>
                </div>
                <div className="dropdown-item" onClick={() => { navigate('/reports'); setQuickActionsOpen(false); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="20" x2="18" y2="10" strokeWidth="2"/>
                    <line x1="12" y1="20" x2="12" y2="4" strokeWidth="2"/>
                    <line x1="6" y1="20" x2="6" y2="14" strokeWidth="2"/>
                  </svg>
                  <span>Generate Report</span>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            title="Toggle Dark/Light Mode"
          >
            {theme === 'light' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="notification-container" ref={notificationRef}>
            <button
              className="notification-bell"
              onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
              aria-label="Notifications"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {notificationCount > 0 && (
                <span className="notification-badge">{notificationCount}</span>
              )}
            </button>

            {notificationDropdownOpen && (
              <div className="notification-dropdown">
                <div className="dropdown-header">
                  <span>Notifications</span>
                  <Link to="/notifications" onClick={() => setNotificationDropdownOpen(false)}>View All</Link>
                </div>
                <div className="notification-list">
                  {notifications.slice(0, 3).map(notif => (
                    <div key={notif.id} className={`notification-item-mini ${!notif.read ? 'unread' : ''}`}>
                      <span className="notif-icon">{notif.icon}</span>
                      <div className="notif-content">
                        <h4>{notif.title}</h4>
                        <p>{notif.message}</p>
                        <span className="notif-time">{notif.time}</span>
                      </div>
                      {!notif.read && <div className="unread-dot"></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="profile-section" ref={profileRef}>
            <button 
              className="profile-button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              aria-label="Profile Menu"
            >
              <div className="profile-avatar">
                {getInitials(username)}
              </div>
              <div className="profile-info">
                <span className="profile-name">{username || 'User'}</span>
                <span className="profile-role">{userRole}</span>
              </div>
              <svg className={`dropdown-arrow ${profileDropdownOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="6 9 12 15 18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {profileDropdownOpen && (
              <div className="profile-dropdown">
                <Link to="/profile" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Profile</span>
                </Link>
                <Link to="/settings" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Settings</span>
                </Link>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item logout-item" onClick={handleLogout}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="16 17 21 12 16 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="breadcrumbs">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="breadcrumb-separator">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="breadcrumb-current">{crumb.name}</span>
              ) : (
                <Link to={crumb.path}>{crumb.name}</Link>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        <Link className={`nav-link ${isActive("/dashboard")}`} to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="14" y="3" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="14" y="14" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="3" y="14" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="nav-text">Dashboard</span>
        </Link>

        {userRole === 'Employee' && (
          <Link className={`nav-link ${isActive("/employee-portal")}`} to="/employee-portal" onClick={() => setMobileMenuOpen(false)}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-text">My Portal</span>
          </Link>
        )}

        {['Admin', 'HR Officer', 'Department Manager'].includes(userRole) && (
          <Link className={`nav-link ${isActive("/employees")}`} to="/employees" onClick={() => setMobileMenuOpen(false)}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-text">Employees</span>
          </Link>
        )}

        {['Admin', 'HR Officer', 'Department Manager'].includes(userRole) && (
          <Link className={`nav-link ${isActive("/attendance")}`} to="/attendance" onClick={() => setMobileMenuOpen(false)}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-text">Attendance</span>
          </Link>
        )}

        {['Admin', 'HR Officer'].includes(userRole) && (
          <Link className={`nav-link ${isActive("/payroll")}`} to="/payroll" onClick={() => setMobileMenuOpen(false)}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="1" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-text">Payroll</span>
          </Link>
        )}

        {['Admin'].includes(userRole) && (
          <Link className={`nav-link ${isActive("/approvals")}`} to="/approvals" onClick={() => setMobileMenuOpen(false)}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-text">Approvals</span>
          </Link>
        )}

        {['Admin'].includes(userRole) && (
          <Link className={`nav-link ${isActive("/scheduler")}`} to="/scheduler" onClick={() => setMobileMenuOpen(false)}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-text">Scheduler</span>
          </Link>
        )}

        {['HR Officer'].includes(userRole) && (
          <Link className={`nav-link ${isActive("/audit-trail")}`} to="/audit-trail" onClick={() => setMobileMenuOpen(false)}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="14 2 14 8 20 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="16" y1="13" x2="8" y2="13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="16" y1="17" x2="8" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="10 9 9 9 8 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-text">Audit Trail</span>
          </Link>
        )}

        {['Admin', 'HR Officer', 'Department Manager'].includes(userRole) && (
          <Link className={`nav-link ${isActive("/reports")}`} to="/reports" onClick={() => setMobileMenuOpen(false)}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="20" x2="18" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="20" x2="12" y2="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="6" y1="20" x2="6" y2="14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="nav-text">Reports</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;