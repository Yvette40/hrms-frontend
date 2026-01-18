// src/pages/PayrollReports.js - FIXED for actual API
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PayrollReports.css';

function PayrollReports() {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [viewMode, setViewMode] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch payrolls - API returns array directly
      const payrollRes = await axios.get('http://127.0.0.1:5000/payrolls', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch employees
      const empRes = await axios.get('http://127.0.0.1:5000/employees?per_page=1000', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Payroll data:', payrollRes.data);
      console.log('First payroll:', payrollRes.data[0]);

      // API returns array directly, not {payrolls: [...]}
      setPayrolls(Array.isArray(payrollRes.data) ? payrollRes.data : []);
      setEmployees(empRes.data.employees || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load reports data');
      setLoading(false);
    }
  };

  // Helper Functions
  const calculateNHIF = (salary) => {
    if (salary <= 5999) return 150;
    if (salary <= 7999) return 300;
    if (salary <= 11999) return 400;
    if (salary <= 14999) return 500;
    if (salary <= 19999) return 600;
    if (salary <= 24999) return 750;
    if (salary <= 29999) return 850;
    if (salary <= 34999) return 900;
    if (salary <= 39999) return 950;
    if (salary <= 44999) return 1000;
    if (salary <= 49999) return 1100;
    if (salary <= 59999) return 1200;
    if (salary <= 69999) return 1300;
    if (salary <= 79999) return 1400;
    if (salary <= 89999) return 1500;
    if (salary <= 99999) return 1600;
    return 1700;
  };

  const calculateNSSF = (salary) => {
    return Math.min(salary * 0.06, 1080);
  };

  const calculatePAYE = (salary) => {
    const nssf = calculateNSSF(salary);
    const taxable = salary - nssf;
    let paye = 0;

    if (taxable <= 24000) {
      paye = taxable * 0.10;
    } else if (taxable <= 32333) {
      paye = 2400 + (taxable - 24000) * 0.25;
    } else {
      paye = 4483.25 + (taxable - 32333) * 0.30;
    }

    return Math.max(0, paye);
  };

  const calculateHousingLevy = (salary) => {
    return salary * 0.015;
  };

  const calculateDeductions = (grossSalary) => {
    const nssf = calculateNSSF(grossSalary);
    const nhif = calculateNHIF(grossSalary);
    const paye = calculatePAYE(grossSalary);
    const housing = calculateHousingLevy(grossSalary);
    const total = nssf + nhif + paye + housing;
    const net = grossSalary - total;

    return { nssf, nhif, paye, housing, total, net };
  };

  // Filter payrolls
  const filteredPayrolls = payrolls.filter(p => {
    const monthMatch = filterMonth === 'all' || 
      new Date(p.period_start).toISOString().slice(0, 7) === filterMonth;
    
    const emp = employees.find(e => e.id === p.employee_id);
    const deptMatch = filterDepartment === 'all' || emp?.department === filterDepartment;
    
    return monthMatch && deptMatch;
  });

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentPayrolls = filteredPayrolls.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage);

  // Calculate Statistics
  const stats = {
    totalEmployees: new Set(filteredPayrolls.map(p => p.employee_id)).size,
    totalGross: filteredPayrolls.reduce((sum, p) => sum + parseFloat(p.gross_salary || 0), 0),
  };

  // Calculate deductions for all payrolls
  let totalNSSF = 0, totalNHIF = 0, totalPAYE = 0, totalHousing = 0, totalNet = 0;
  
  filteredPayrolls.forEach(p => {
    const deductions = calculateDeductions(parseFloat(p.gross_salary || 0));
    totalNSSF += deductions.nssf;
    totalNHIF += deductions.nhif;
    totalPAYE += deductions.paye;
    totalHousing += deductions.housing;
    totalNet += deductions.net;
  });

  stats.totalDeductions = totalNSSF + totalNHIF + totalPAYE + totalHousing;
  stats.totalPayroll = totalNet;
  stats.avgSalary = stats.totalEmployees > 0 ? totalNet / stats.totalEmployees : 0;
  stats.totalNSSF = totalNSSF;
  stats.totalNHIF = totalNHIF;
  stats.totalPAYE = totalPAYE;
  stats.totalHousingLevy = totalHousing;

  // Department breakdown
  const departmentStats = {};
  filteredPayrolls.forEach(p => {
    const emp = employees.find(e => e.id === p.employee_id);
    const dept = emp?.department || 'Unknown';
    const deductions = calculateDeductions(parseFloat(p.gross_salary || 0));
    
    if (!departmentStats[dept]) {
      departmentStats[dept] = {
        count: 0,
        totalSalary: 0,
        totalDeductions: 0
      };
    }
    
    departmentStats[dept].count++;
    departmentStats[dept].totalSalary += deductions.net;
    departmentStats[dept].totalDeductions += deductions.total;
  });

  // Get unique months and departments
  const months = [...new Set(payrolls.map(p => 
    new Date(p.period_start).toISOString().slice(0, 7)
  ))].sort().reverse();

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Employee', 'Period', 'Gross Salary', 'NSSF', 'NHIF', 'PAYE', 'Housing Levy', 'Total Deductions', 'Net Salary', 'Status'];
    const rows = filteredPayrolls.map(p => {
      const emp = employees.find(e => e.id === p.employee_id);
      const deductions = calculateDeductions(parseFloat(p.gross_salary || 0));
      return [
        p.employee || emp?.name || 'Unknown',
        `${p.period_start} to ${p.period_end}`,
        p.gross_salary,
        deductions.nssf.toFixed(2),
        deductions.nhif.toFixed(2),
        deductions.paye.toFixed(2),
        deductions.housing.toFixed(2),
        deductions.total.toFixed(2),
        deductions.net.toFixed(2),
        p.status || 'Pending'
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payroll_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="reports-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-page">
        <div className="error-message">
          <h2>❌ Error Loading Reports</h2>
          <p>{error}</p>
          <button onClick={fetchData}>🔄 Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>📊 Payroll Reports & Analytics</h1>
          <p className="subtitle">Comprehensive payroll insights and statistics</p>
        </div>
        <button className="btn-export" onClick={exportToCSV}>
          📥 Export CSV
        </button>
      </div>

      {/* View Mode Tabs */}
      <div className="view-tabs">
        <button 
          className={`tab ${viewMode === 'overview' ? 'active' : ''}`}
          onClick={() => setViewMode('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${viewMode === 'details' ? 'active' : ''}`}
          onClick={() => setViewMode('details')}
        >
          📋 Details
        </button>
        <button 
          className={`tab ${viewMode === 'charts' ? 'active' : ''}`}
          onClick={() => setViewMode('charts')}
        >
          📈 Analytics
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>📅 Month:</label>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
            <option value="all">All Months</option>
            {months.map(month => (
              <option key={month} value={month}>
                {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>🏢 Department:</label>
          <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className="filter-info">
          Showing {filteredPayrolls.length} of {payrolls.length} records
        </div>
      </div>

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalEmployees}</div>
                <div className="stat-label">Total Employees</div>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-value">KSh {stats.totalPayroll.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                <div className="stat-label">Total Net Payroll</div>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">KSh {stats.avgSalary.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                <div className="stat-label">Average Salary</div>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">📉</div>
              <div className="stat-content">
                <div className="stat-value">KSh {stats.totalDeductions.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                <div className="stat-label">Total Deductions</div>
              </div>
            </div>
          </div>

          {/* Deductions Breakdown */}
          <div className="deductions-section">
            <h2>💸 Deductions Breakdown</h2>
            <div className="deductions-grid">
              <div className="deduction-card nssf">
                <div className="deduction-icon">🏦</div>
                <div className="deduction-content">
                  <div className="deduction-label">NSSF</div>
                  <div className="deduction-value">KSh {stats.totalNSSF.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                  <div className="deduction-percent">
                    {((stats.totalNSSF / stats.totalGross) * 100).toFixed(1)}% of gross
                  </div>
                </div>
              </div>

              <div className="deduction-card nhif">
                <div className="deduction-icon">🏥</div>
                <div className="deduction-content">
                  <div className="deduction-label">NHIF</div>
                  <div className="deduction-value">KSh {stats.totalNHIF.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                  <div className="deduction-percent">
                    {((stats.totalNHIF / stats.totalGross) * 100).toFixed(1)}% of gross
                  </div>
                </div>
              </div>

              <div className="deduction-card paye">
                <div className="deduction-icon">📋</div>
                <div className="deduction-content">
                  <div className="deduction-label">PAYE</div>
                  <div className="deduction-value">KSh {stats.totalPAYE.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                  <div className="deduction-percent">
                    {((stats.totalPAYE / stats.totalGross) * 100).toFixed(1)}% of gross
                  </div>
                </div>
              </div>

              <div className="deduction-card housing">
                <div className="deduction-icon">🏠</div>
                <div className="deduction-content">
                  <div className="deduction-label">Housing Levy</div>
                  <div className="deduction-value">KSh {stats.totalHousingLevy.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                  <div className="deduction-percent">
                    {((stats.totalHousingLevy / stats.totalGross) * 100).toFixed(1)}% of gross
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="department-section">
            <h2>🏢 Department Breakdown</h2>
            <div className="department-grid">
              {Object.entries(departmentStats).map(([dept, data]) => (
                <div key={dept} className="dept-card-report">
                  <div className="dept-header-report">
                    <h3>{dept}</h3>
                    <span className="dept-count">{data.count} employees</span>
                  </div>
                  <div className="dept-stats-report">
                    <div className="dept-stat-item">
                      <span className="dept-stat-label">Total Salary:</span>
                      <span className="dept-stat-value">KSh {data.totalSalary.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                    </div>
                    <div className="dept-stat-item">
                      <span className="dept-stat-label">Avg Salary:</span>
                      <span className="dept-stat-value">
                        KSh {(data.totalSalary / data.count).toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </span>
                    </div>
                    <div className="dept-stat-item">
                      <span className="dept-stat-label">Deductions:</span>
                      <span className="dept-stat-value">KSh {data.totalDeductions.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Details Mode */}
      {viewMode === 'details' && (
        <div className="details-section">
          <div className="table-info">
            Showing {indexOfFirst + 1} - {Math.min(indexOfLast, filteredPayrolls.length)} of {filteredPayrolls.length} payrolls
          </div>

          <div className="table-container">
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Period</th>
                  <th>Gross Salary</th>
                  <th>NSSF</th>
                  <th>NHIF</th>
                  <th>PAYE</th>
                  <th>Housing Levy</th>
                  <th>Total Deductions</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentPayrolls.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={{ textAlign: 'center', padding: '40px' }}>
                      No payroll records found
                    </td>
                  </tr>
                ) : (
                  currentPayrolls.map((p, idx) => {
                    const emp = employees.find(e => e.id === p.employee_id);
                    const deductions = calculateDeductions(parseFloat(p.gross_salary || 0));
                    
                    return (
                      <tr key={idx}>
                        <td className="emp-name">{p.employee || emp?.name || 'Unknown'}</td>
                        <td>
                          <span className="dept-badge">{emp?.department || 'N/A'}</span>
                        </td>
                        <td>{new Date(p.period_start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</td>
                        <td className="money">KSh {parseFloat(p.gross_salary || 0).toLocaleString()}</td>
                        <td className="money">KSh {deductions.nssf.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                        <td className="money">KSh {deductions.nhif.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                        <td className="money">KSh {deductions.paye.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                        <td className="money">KSh {deductions.housing.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                        <td className="money deduction">KSh {deductions.total.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                        <td className="money net">KSh {deductions.net.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                        <td>
                          <span className={`status-badge ${(p.status || 'pending').toLowerCase()}`}>
                            {p.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                « First
              </button>
              <button
                className="page-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                ‹ Prev
              </button>

              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="page-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next ›
              </button>
              <button
                className="page-btn"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last »
              </button>
            </div>
          )}
        </div>
      )}

      {/* Charts Mode */}

      {/* Charts Mode - WITH REAL CHARTS */}
      {viewMode === 'charts' && (
        <div className="charts-section">
          {/* Salary Distribution by Department - Bar Chart */}
          <div className="chart-card">
            <h3>📊 Salary Distribution by Department</h3>
            <div className="chart-wrapper">
              <svg viewBox="0 0 800 400" className="bar-chart">
                {Object.entries(departmentStats).map(([dept, data], idx) => {
                  const maxSalary = Math.max(...Object.values(departmentStats).map(d => d.totalSalary));
                  const barHeight = (data.totalSalary / maxSalary) * 300;
                  const x = 50 + (idx * 120);
                  
                  return (
                    <g key={dept}>
                      <rect
                        x={x}
                        y={350 - barHeight}
                        width="80"
                        height={barHeight}
                        fill={`hsl(${idx * 40}, 70%, 60%)`}
                        className="bar-animated"
                      />
                      <text
                        x={x + 40}
                        y={340 - barHeight}
                        textAnchor="middle"
                        fill="#2c3e50"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        KSh {(data.totalSalary / 1000).toFixed(0)}K
                      </text>
                      <text
                        x={x + 40}
                        y={375}
                        textAnchor="middle"
                        fill="#7f8c8d"
                        fontSize="11"
                      >
                        {dept.length > 10 ? dept.substring(0, 10) + '...' : dept}
                      </text>
                      <text
                        x={x + 40}
                        y={390}
                        textAnchor="middle"
                        fill="#95a5a6"
                        fontSize="10"
                      >
                        ({data.count} emp)
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Deductions Breakdown - Pie Chart */}
          <div className="chart-card">
            <h3>🥧 Deductions Breakdown</h3>
            <div className="chart-wrapper">
              <svg viewBox="0 0 400 300" className="pie-chart">
                {(() => {
                  const total = stats.totalNSSF + stats.totalNHIF + stats.totalPAYE + stats.totalHousingLevy;
                  const deductions = [
                    { label: 'NSSF', value: stats.totalNSSF, color: '#3498db' },
                    { label: 'NHIF', value: stats.totalNHIF, color: '#27ae60' },
                    { label: 'PAYE', value: stats.totalPAYE, color: '#e74c3c' },
                    { label: 'Housing', value: stats.totalHousingLevy, color: '#f39c12' }
                  ];
                  
                  let currentAngle = 0;
                  const cx = 150;
                  const cy = 150;
                  const radius = 100;
                  
                  return (
                    <>
                      {deductions.map((d, idx) => {
                        const percentage = (d.value / total) * 100;
                        const angle = (d.value / total) * 360;
                        const startAngle = currentAngle;
                        const endAngle = currentAngle + angle;
                        
                        const startRad = (startAngle - 90) * (Math.PI / 180);
                        const endRad = (endAngle - 90) * (Math.PI / 180);
                        
                        const x1 = cx + radius * Math.cos(startRad);
                        const y1 = cy + radius * Math.sin(startRad);
                        const x2 = cx + radius * Math.cos(endRad);
                        const y2 = cy + radius * Math.sin(endRad);
                        
                        const largeArc = angle > 180 ? 1 : 0;
                        
                        const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                        
                        const midAngle = (startAngle + endAngle) / 2;
                        const midRad = (midAngle - 90) * (Math.PI / 180);
                        const labelX = cx + (radius * 0.7) * Math.cos(midRad);
                        const labelY = cy + (radius * 0.7) * Math.sin(midRad);
                        
                        currentAngle += angle;
                        
                        return (
                          <g key={idx}>
                            <path d={path} fill={d.color} className="pie-slice" />
                            <text
                              x={labelX}
                              y={labelY}
                              textAnchor="middle"
                              fill="white"
                              fontSize="12"
                              fontWeight="bold"
                            >
                              {percentage.toFixed(1)}%
                            </text>
                          </g>
                        );
                      })}
                      
                      {deductions.map((d, idx) => (
                        <g key={`legend-${idx}`}>
                          <rect
                            x={320}
                            y={50 + idx * 30}
                            width="15"
                            height="15"
                            fill={d.color}
                          />
                          <text
                            x={340}
                            y={62 + idx * 30}
                            fill="#2c3e50"
                            fontSize="12"
                          >
                            {d.label}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* Payroll Trends - Line Chart */}
          <div className="chart-card">
            <h3>📈 Payroll Trends Over Time</h3>
            <div className="chart-wrapper">
              <svg viewBox="0 0 800 300" className="line-chart">
                {(() => {
                  const monthlyData = {};
                  payrolls.forEach(p => {
                    const month = new Date(p.period_start).toISOString().slice(0, 7);
                    const deductions = calculateDeductions(parseFloat(p.gross_salary || 0));
                    
                    if (!monthlyData[month]) {
                      monthlyData[month] = { gross: 0, net: 0, count: 0 };
                    }
                    monthlyData[month].gross += parseFloat(p.gross_salary || 0);
                    monthlyData[month].net += deductions.net;
                    monthlyData[month].count += 1;
                  });
                  
                  const sortedMonths = Object.keys(monthlyData).sort();
                  const maxValue = Math.max(...sortedMonths.map(m => monthlyData[m].gross));
                  
                  const points = sortedMonths.map((month, idx) => {
                    const x = 50 + (idx / (sortedMonths.length - 1)) * 700;
                    const yGross = 250 - (monthlyData[month].gross / maxValue) * 200;
                    const yNet = 250 - (monthlyData[month].net / maxValue) * 200;
                    return { x, yGross, yNet, month };
                  });
                  
                  const grossPath = points.map((p, i) => 
                    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yGross}`
                  ).join(' ');
                  
                  const netPath = points.map((p, i) => 
                    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yNet}`
                  ).join(' ');
                  
                  return (
                    <>
                      {[0, 1, 2, 3, 4].map(i => (
                        <line
                          key={i}
                          x1="50"
                          y1={50 + i * 50}
                          x2="750"
                          y2={50 + i * 50}
                          stroke="#ecf0f1"
                          strokeWidth="1"
                        />
                      ))}
                      
                      <path
                        d={grossPath}
                        fill="none"
                        stroke="#3498db"
                        strokeWidth="3"
                        className="line-animated"
                      />
                      
                      <path
                        d={netPath}
                        fill="none"
                        stroke="#27ae60"
                        strokeWidth="3"
                        className="line-animated"
                      />
                      
                      {points.map((p, idx) => (
                        <g key={idx}>
                          <circle cx={p.x} cy={p.yGross} r="5" fill="#3498db" />
                          <circle cx={p.x} cy={p.yNet} r="5" fill="#27ae60" />
                          
                          <text
                            x={p.x}
                            y={275}
                            textAnchor="middle"
                            fill="#7f8c8d"
                            fontSize="10"
                          >
                            {new Date(p.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                          </text>
                        </g>
                      ))}
                      
                      <g>
                        <line x1="600" y1="20" x2="640" y2="20" stroke="#3498db" strokeWidth="3" />
                        <text x="645" y="25" fill="#2c3e50" fontSize="12">Gross Salary</text>
                        
                        <line x1="600" y1="40" x2="640" y2="40" stroke="#27ae60" strokeWidth="3" />
                        <text x="645" y="45" fill="#2c3e50" fontSize="12">Net Salary</text>
                      </g>
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* Department Comparison - Horizontal Bars */}
          <div className="chart-card">
            <h3>📉 Average Salary by Department</h3>
            <div className="chart-wrapper">
              <svg viewBox="0 0 800 400" className="horizontal-bar-chart">
                {Object.entries(departmentStats).map(([dept, data], idx) => {
                  const avgSalary = data.totalSalary / data.count;
                  const maxAvg = Math.max(...Object.values(departmentStats).map(d => d.totalSalary / d.count));
                  const barWidth = (avgSalary / maxAvg) * 600;
                  const y = 30 + (idx * 50);
                  
                  return (
                    <g key={dept}>
                      <text
                        x="10"
                        y={y + 15}
                        fill="#2c3e50"
                        fontSize="13"
                        fontWeight="500"
                      >
                        {dept}
                      </text>
                      
                      <rect
                        x="150"
                        y={y}
                        width={barWidth}
                        height="30"
                        fill={`hsl(${idx * 45}, 65%, 55%)`}
                        rx="5"
                        className="bar-animated"
                      />
                      
                      <text
                        x={160 + barWidth}
                        y={y + 20}
                        fill="#2c3e50"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        KSh {avgSalary.toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PayrollReports;