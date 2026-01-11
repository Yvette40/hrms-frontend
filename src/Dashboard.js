import React, { useState, useEffect } from "react";
import { useRole } from "./RoleContext";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const { userRole, username } = useRole();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalEmployees: 0,
      recentEmployees: [],
      presentToday: 0,
      onLeave: 0,
      pendingApprovals: 0,
      pendingPayroll: 0,
      leaveRequests: 0,
      attendanceRate: 0
    },
    employeeData: {
      employeeId: '',
      department: '',
      position: '',
      joinDate: '',
      daysPresent: 0,
      leaveBalance: 0,
      lastPayslip: '',
      myAttendanceRate: 0,
      leaveHistory: []
    },
    recentActivity: [],
    tasks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDashboardData();
  }, [userRole]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch general stats
      const statsRes = await axios.get("http://127.0.0.1:5000/dashboard-stats", {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch role-specific data
      let roleSpecificData = {};
      
      if (userRole === 'Employee') {
        // Fetch employee's personal data
        try {
          const empRes = await axios.get("http://127.0.0.1:5000/my-info", {
            headers: { Authorization: `Bearer ${token}` }
          });
          roleSpecificData.employeeData = empRes.data;
        } catch (err) {
          console.error("Error fetching employee data:", err);
        }
      }

      if (userRole === 'Admin' || userRole === 'HR Officer') {
        // Fetch recent activity/audit logs
        try {
          const activityRes = await axios.get("http://127.0.0.1:5000/recent-activity", {
            headers: { Authorization: `Bearer ${token}` }
          });
          roleSpecificData.recentActivity = activityRes.data;
        } catch (err) {
          console.error("Error fetching activity:", err);
          roleSpecificData.recentActivity = [];
        }
      }

      setDashboardData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          ...statsRes.data
        },
        ...roleSpecificData
      }));
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError("Failed to load dashboard data. Please try again.");
      setLoading(false);
    }
  };

  // Render different dashboards based on role
  const renderDashboard = () => {
    if (loading) {
      return React.createElement(LoadingState);
    }

    if (error) {
      return React.createElement(ErrorState, { message: error, onRetry: fetchDashboardData });
    }

    switch (userRole) {
      case 'Admin':
        return React.createElement(AdminDashboard, { data: dashboardData });
      case 'HR Officer':
        return React.createElement(HROfficerDashboard, { data: dashboardData });
      case 'Department Manager':
        return React.createElement(DeptManagerDashboard, { data: dashboardData });
      case 'Employee':
        return React.createElement(EmployeeDashboard, { data: dashboardData, username: username });
      default:
        return React.createElement(DefaultDashboard);
    }
  };

  return React.createElement(
    'div',
    { className: 'dashboard-container' },
    React.createElement(
      'div',
      { className: 'dashboard-header' },
      React.createElement('h1', null, `Welcome back, ${username}!`),
      React.createElement('p', { className: 'role-subtitle' }, `Role: ${userRole}`)
    ),
    renderDashboard()
  );
}

// ===================================================
// LOADING & ERROR STATES
// ===================================================
function LoadingState() {
  return React.createElement(
    'div',
    { className: 'default-dashboard' },
    React.createElement('div', { className: 'loading-spinner' }, '⏳'),
    React.createElement('h2', null, 'Loading Dashboard...'),
    React.createElement('p', null, 'Please wait while we fetch your data.')
  );
}

function ErrorState({ message, onRetry }) {
  return React.createElement(
    'div',
    { className: 'default-dashboard' },
    React.createElement('div', { className: 'error-icon' }, '⚠️'),
    React.createElement('h2', null, 'Error Loading Dashboard'),
    React.createElement('p', null, message),
    React.createElement(
      'button',
      { onClick: onRetry, className: 'retry-btn' },
      '🔄 Retry'
    )
  );
}

// ===================================================
// ADMIN DASHBOARD
// ===================================================
function AdminDashboard({ data }) {
  const { stats, recentActivity = [] } = data;

  return React.createElement(
    'div',
    { className: 'dashboard-grid' },
    React.createElement(
      'div',
      { className: 'welcome-card' },
      React.createElement('h2', null, '🔐 Administrator Dashboard'),
      React.createElement('p', null, 'System control, user management, and oversight')
    ),

    // Key Metrics
    React.createElement(
      'div',
      { className: 'metrics-row' },
      React.createElement(MetricCard, {
        title: 'Total Employees',
        value: stats.totalEmployees || 0,
        icon: '👥',
        color: '#3b82f6'
      }),
      React.createElement(MetricCard, {
        title: 'Pending Approvals',
        value: stats.pendingApprovals || 0,
        icon: '✅',
        color: '#f59e0b'
      }),
      React.createElement(MetricCard, {
        title: 'Leave Requests',
        value: stats.leaveRequests || 0,
        icon: '📅',
        color: '#10b981'
      }),
      React.createElement(MetricCard, {
        title: 'Attendance Rate',
        value: `${stats.attendanceRate || 0}%`,
        icon: '📊',
        color: '#ef4444'
      })
    ),

    // Quick Actions
    React.createElement(
      'div',
      { className: 'quick-actions' },
      React.createElement('h3', null, '⚡ Quick Actions'),
      React.createElement(
        'div',
        { className: 'action-buttons' },
        React.createElement(ActionButton, { label: 'Manage Employees', icon: '👥', link: '/employees' }),
        React.createElement(ActionButton, { label: 'Process Payroll', icon: '💰', link: '/payroll' }),
        React.createElement(ActionButton, { label: 'View Reports', icon: '📊', link: '/reports' }),
        React.createElement(ActionButton, { label: 'Manage Users', icon: '👤', link: '/users' }),
        React.createElement(ActionButton, { label: 'View Attendance', icon: '✓', link: '/attendance' }),
        React.createElement(ActionButton, { label: 'Leave Management', icon: '📅', link: '/leave' })
      )
    ),

    // Recent Activity
    React.createElement(
      'div',
      { className: 'recent-activity' },
      React.createElement('h3', null, '📈 Recent System Activity'),
      recentActivity.length > 0
        ? React.createElement(ActivityList, { items: recentActivity })
        : React.createElement('p', {
            style: { color: '#64748b', textAlign: 'center', padding: '20px' }
          }, 'No recent activity to display')
    ),

    // Recent Employees
    React.createElement(
      'div',
      { className: 'recent-employees' },
      React.createElement('h3', null, '👥 Recently Added Employees'),
      stats.recentEmployees && stats.recentEmployees.length > 0
        ? stats.recentEmployees.map((emp, idx) =>
            React.createElement(
              'div',
              { key: idx, className: 'employee-item' },
              React.createElement('span', { className: 'employee-name' }, emp.name),
              React.createElement('span', { className: 'employee-id' }, `ID: ${emp.national_id || emp.employee_id}`)
            )
          )
        : React.createElement('p', {
            style: { color: '#64748b', textAlign: 'center', padding: '20px' }
          }, 'No recent employees')
    )
  );
}

// ===================================================
// HR OFFICER DASHBOARD
// ===================================================
function HROfficerDashboard({ data }) {
  const { stats, recentActivity = [] } = data;

  return React.createElement(
    'div',
    { className: 'dashboard-grid' },
    React.createElement(
      'div',
      { className: 'welcome-card' },
      React.createElement('h2', null, '💼 HR Officer Dashboard'),
      React.createElement('p', null, 'Employee management, payroll processing, and HR operations')
    ),

    // Key Metrics
    React.createElement(
      'div',
      { className: 'metrics-row' },
      React.createElement(MetricCard, {
        title: 'Total Employees',
        value: stats.totalEmployees || 0,
        icon: '👥',
        color: '#3b82f6'
      }),
      React.createElement(MetricCard, {
        title: 'Pending Payroll',
        value: stats.pendingPayroll || 0,
        icon: '💰',
        color: '#f59e0b'
      }),
      React.createElement(MetricCard, {
        title: 'Leave Requests',
        value: stats.leaveRequests || 0,
        icon: '📅',
        color: '#10b981'
      }),
      React.createElement(MetricCard, {
        title: 'Attendance Today',
        value: `${stats.attendanceRate || 0}%`,
        icon: '✓',
        color: '#8b5cf6'
      })
    ),

    // Quick Actions
    React.createElement(
      'div',
      { className: 'quick-actions' },
      React.createElement('h3', null, '⚡ Quick Actions'),
      React.createElement(
        'div',
        { className: 'action-buttons' },
        React.createElement(ActionButton, { label: 'Process Payroll', icon: '💰', link: '/payroll' }),
        React.createElement(ActionButton, { label: 'Add Employee', icon: '➕', link: '/employees' }),
        React.createElement(ActionButton, { label: 'Mark Attendance', icon: '✓', link: '/attendance' }),
        React.createElement(ActionButton, { label: 'Review Leave', icon: '📅', link: '/leave' }),
        React.createElement(ActionButton, { label: 'Generate Reports', icon: '📊', link: '/reports' }),
        React.createElement(ActionButton, { label: 'Employee Records', icon: '📋', link: '/employees' })
      )
    ),

    // Recent Activity
    React.createElement(
      'div',
      { className: 'recent-activity' },
      React.createElement('h3', null, '📈 Recent HR Activity'),
      recentActivity.length > 0
        ? React.createElement(ActivityList, { items: recentActivity })
        : React.createElement('p', {
            style: { color: '#64748b', textAlign: 'center', padding: '20px' }
          }, 'No recent activity to display')
    ),

    // Recent Employees
    React.createElement(
      'div',
      { className: 'recent-employees' },
      React.createElement('h3', null, '👥 Recently Added Employees'),
      stats.recentEmployees && stats.recentEmployees.length > 0
        ? stats.recentEmployees.map((emp, idx) =>
            React.createElement(
              'div',
              { key: idx, className: 'employee-item' },
              React.createElement('span', { className: 'employee-name' }, emp.name),
              React.createElement('span', { className: 'employee-id' }, `ID: ${emp.national_id || emp.employee_id}`)
            )
          )
        : React.createElement('p', {
            style: { color: '#64748b', textAlign: 'center', padding: '20px' }
          }, 'No recent employees')
    )
  );
}

// ===================================================
// DEPARTMENT MANAGER DASHBOARD
// ===================================================
function DeptManagerDashboard({ data }) {
  const { stats } = data;
  const deptEmployees = stats.deptEmployees || 12;
  const presentToday = stats.presentToday || 10;
  const onLeave = stats.onLeave || 2;
  const deptAttendanceRate = stats.deptAttendanceRate || 83;

  return React.createElement(
    'div',
    { className: 'dashboard-grid' },
    React.createElement(
      'div',
      { className: 'welcome-card' },
      React.createElement('h2', null, '📊 Department Manager Dashboard'),
      React.createElement('p', null, 'Department oversight, attendance monitoring, and reports')
    ),

    // Department Metrics
    React.createElement(
      'div',
      { className: 'metrics-row' },
      React.createElement(MetricCard, {
        title: 'Dept Employees',
        value: deptEmployees,
        icon: '👥',
        color: '#3b82f6'
      }),
      React.createElement(MetricCard, {
        title: 'Present Today',
        value: presentToday,
        icon: '✓',
        color: '#10b981'
      }),
      React.createElement(MetricCard, {
        title: 'On Leave',
        value: onLeave,
        icon: '📅',
        color: '#f59e0b'
      }),
      React.createElement(MetricCard, {
        title: 'Attendance Rate',
        value: `${deptAttendanceRate}%`,
        icon: '📈',
        color: '#8b5cf6'
      })
    ),

    // Quick Actions
    React.createElement(
      'div',
      { className: 'quick-actions' },
      React.createElement('h3', null, '⚡ Quick Actions'),
      React.createElement(
        'div',
        { className: 'action-buttons' },
        React.createElement(ActionButton, { label: 'View My Team', icon: '👥', link: '/employees' }),
        React.createElement(ActionButton, { label: 'Attendance Report', icon: '📊', link: '/reports' }),
        React.createElement(ActionButton, { label: 'Mark Attendance', icon: '✓', link: '/attendance' }),
        React.createElement(ActionButton, { label: 'Department Stats', icon: '📈', link: '/reports' })
      )
    ),

    // Department Performance
    React.createElement(
      'div',
      { className: 'performance-card' },
      React.createElement('h3', null, '📈 Department Performance'),
      React.createElement(
        'div',
        { className: 'performance-stats' },
        React.createElement(
          'div',
          { className: 'stat-item' },
          React.createElement('span', { className: 'stat-label' }, 'Avg Attendance:'),
          React.createElement('span', {
            className: `stat-value ${deptAttendanceRate >= 80 ? 'success' : 'warning'}`
          }, `${deptAttendanceRate}%`)
        ),
        React.createElement(
          'div',
          { className: 'stat-item' },
          React.createElement('span', { className: 'stat-label' }, 'Team Size:'),
          React.createElement('span', { className: 'stat-value success' }, `${deptEmployees} employees`)
        ),
        React.createElement(
          'div',
          { className: 'stat-item' },
          React.createElement('span', { className: 'stat-label' }, 'Leave Requests:'),
          React.createElement('span', { className: 'stat-value warning' }, stats.leaveRequests || 0)
        )
      )
    ),

    // Department Alerts
    React.createElement(
      'div',
      { className: 'alerts-card' },
      React.createElement('h3', null, '⚠️ Department Alerts'),
      onLeave > 0 && React.createElement(
        'div',
        { className: 'alert-item warning' },
        React.createElement('span', null, '⚠️'),
        React.createElement('p', null, `${onLeave} employee${onLeave > 1 ? 's are' : ' is'} currently on leave`)
      ),
      deptAttendanceRate < 80 && React.createElement(
        'div',
        { className: 'alert-item warning' },
        React.createElement('span', null, '⚠️'),
        React.createElement('p', null, 'Department attendance is below target (80%)')
      ),
      (deptAttendanceRate >= 80 && onLeave === 0) && React.createElement(
        'div',
        { className: 'alert-item info' },
        React.createElement('span', null, 'ℹ️'),
        React.createElement('p', null, 'All systems running smoothly - no alerts at this time')
      )
    )
  );
}

// ===================================================
// EMPLOYEE DASHBOARD (Self-Service)
// ===================================================
function EmployeeDashboard({ data, username }) {
  const { employeeData = {}, stats } = data;
  
  const {
    employeeId = 'Loading...',
    department = 'Loading...',
    position = 'Loading...',
    joinDate = 'Loading...',
    daysPresent = 0,
    leaveBalance = 0,
    lastPayslip = 'N/A',
    myAttendanceRate = 0,
    leaveHistory = []
  } = employeeData;

  return React.createElement(
    'div',
    { className: 'dashboard-grid' },
    React.createElement(
      'div',
      { className: 'welcome-card' },
      React.createElement('h2', null, '👤 Employee Self-Service Portal'),
      React.createElement('p', null, 'View your information, attendance, and payslips')
    ),

    // Personal Metrics
    React.createElement(
      'div',
      { className: 'metrics-row' },
      React.createElement(MetricCard, {
        title: 'Days Present',
        value: daysPresent,
        icon: '✓',
        color: '#10b981'
      }),
      React.createElement(MetricCard, {
        title: 'Leave Balance',
        value: leaveBalance,
        icon: '📅',
        color: '#3b82f6'
      }),
      React.createElement(MetricCard, {
        title: 'Last Payslip',
        value: lastPayslip,
        icon: '💰',
        color: '#f59e0b'
      }),
      React.createElement(MetricCard, {
        title: 'Attendance %',
        value: `${myAttendanceRate}%`,
        icon: '📊',
        color: '#8b5cf6'
      })
    ),

    // Quick Actions
    React.createElement(
      'div',
      { className: 'quick-actions' },
      React.createElement('h3', null, '⚡ Quick Actions'),
      React.createElement(
        'div',
        { className: 'action-buttons' },
        React.createElement(ActionButton, { label: 'View Payslips', icon: '💰', link: '/payslips' }),
        React.createElement(ActionButton, { label: 'Request Leave', icon: '📅', link: '/leave' }),
        React.createElement(ActionButton, { label: 'My Attendance', icon: '✓', link: '/my-attendance' }),
        React.createElement(ActionButton, { label: 'Update Profile', icon: '👤', link: '/profile' })
      )
    ),

    // My Information
    React.createElement(
      'div',
      { className: 'info-card' },
      React.createElement('h3', null, '📋 My Information'),
      React.createElement(
        'div',
        { className: 'info-grid' },
        React.createElement(
          'div',
          { className: 'info-item' },
          React.createElement('span', { className: 'info-label' }, 'Employee ID:'),
          React.createElement('span', { className: 'info-value' }, employeeId)
        ),
        React.createElement(
          'div',
          { className: 'info-item' },
          React.createElement('span', { className: 'info-label' }, 'Department:'),
          React.createElement('span', { className: 'info-value' }, department)
        ),
        React.createElement(
          'div',
          { className: 'info-item' },
          React.createElement('span', { className: 'info-label' }, 'Position:'),
          React.createElement('span', { className: 'info-value' }, position)
        ),
        React.createElement(
          'div',
          { className: 'info-item' },
          React.createElement('span', { className: 'info-label' }, 'Join Date:'),
          React.createElement('span', { className: 'info-value' }, joinDate)
        )
      )
    ),

    // Leave History
    React.createElement(
      'div',
      { className: 'leave-card' },
      React.createElement('h3', null, '📅 My Leave Requests'),
      leaveHistory && leaveHistory.length > 0
        ? leaveHistory.map((leave, idx) =>
            React.createElement(
              'div',
              { key: idx, className: `leave-item ${leave.status.toLowerCase()}` },
              React.createElement('span', { className: 'leave-dates' }, `${leave.startDate} - ${leave.endDate}`),
              React.createElement('span', { className: 'leave-status' }, leave.status)
            )
          )
        : React.createElement('p', {
            style: { color: '#64748b', textAlign: 'center', padding: '20px' }
          }, 'No leave requests found')
    )
  );
}

// ===================================================
// SHARED COMPONENTS
// ===================================================
function MetricCard({ title, value, icon, color }) {
  return React.createElement(
    'div',
    { className: 'metric-card', style: { borderLeftColor: color } },
    React.createElement('div', { className: 'metric-icon', style: { color } }, icon),
    React.createElement(
      'div',
      { className: 'metric-info' },
      React.createElement('h4', null, title),
      React.createElement('p', { className: 'metric-value' }, value)
    )
  );
}

function ActionButton({ label, icon, link }) {
  return React.createElement(
    Link,
    { to: link, className: 'action-btn' },
    React.createElement('span', { className: 'action-icon' }, icon),
    React.createElement('span', { className: 'action-label' }, label)
  );
}

function ActivityList({ items }) {
  return React.createElement(
    'div',
    { className: 'activity-list' },
    items.map((item, idx) =>
      React.createElement(
        'div',
        { key: idx, className: `activity-item ${item.type || 'default'}` },
        React.createElement(
          'div',
          { className: 'activity-content' },
          React.createElement('p', { className: 'activity-action' }, item.action || item.description),
          React.createElement('span', { className: 'activity-time' }, item.time || item.timestamp)
        )
      )
    )
  );
}

function DefaultDashboard() {
  return React.createElement(
    'div',
    { className: 'default-dashboard' },
    React.createElement('h2', null, 'Welcome to HRMS'),
    React.createElement('p', null, 'Please contact administrator for role assignment.')
  );
}

export default Dashboard;