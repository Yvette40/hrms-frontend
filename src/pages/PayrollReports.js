// src/pages/PayrollReports.js - CORRECTED VERSION
import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './PayrollReports.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function PayrollReports() {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch payrolls
      const payrollResponse = await fetch('http://127.0.0.1:5000/payrolls', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch employees
      const employeeResponse = await fetch('http://127.0.0.1:5000/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (payrollResponse.ok && employeeResponse.ok) {
        const payrollData = await payrollResponse.json();
        const employeeData = await employeeResponse.json();
        
        setPayrolls(payrollData);
        setEmployees(employeeData.employees || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTotals = {};
    
    months.forEach(month => {
      monthlyTotals[month] = { gross: 0, net: 0, count: 0 };
    });

    payrolls.forEach(payroll => {
      const date = new Date(payroll.period_start);
      if (date.getFullYear() === selectedYear) {
        const month = months[date.getMonth()];
        monthlyTotals[month].gross += parseFloat(payroll.gross_salary);
        monthlyTotals[month].net += parseFloat(payroll.gross_salary) * 0.7; // Approximate net
        monthlyTotals[month].count++;
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Gross Salary',
          data: months.map(m => monthlyTotals[m].gross),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
        },
        {
          label: 'Net Salary',
          data: months.map(m => monthlyTotals[m].net),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
        },
      ],
    };
  };

  const getDeductionsBreakdown = () => {
    let totalNSSF = 0;
    let totalNHIF = 0;
    let totalPAYE = 0;
    let totalHousingLevy = 0;

    payrolls.forEach(payroll => {
      const gross = parseFloat(payroll.gross_salary);
      // Calculate based on Kenyan rates
      totalNSSF += Math.min(gross * 0.06, 1080);
      totalNHIF += calculateNHIF(gross);
      totalPAYE += calculatePAYE(gross);
      totalHousingLevy += gross * 0.015;
    });

    return {
      labels: ['NSSF', 'NHIF', 'PAYE', 'Housing Levy'],
      datasets: [
        {
          data: [totalNSSF, totalNHIF, totalPAYE, totalHousingLevy],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

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

  const calculatePAYE = (salary) => {
    const nssf = Math.min(salary * 0.06, 1080);
    const taxable = salary - nssf;
    let paye = 0;
    
    if (taxable <= 24000) {
      paye = taxable * 0.10;
    } else if (taxable <= 32333) {
      paye = 2400 + (taxable - 24000) * 0.25;
    } else {
      paye = 4483.25 + (taxable - 32333) * 0.30;
    }
    
    return Math.max(paye - 2400, 0); // Personal relief
  };

  const getSalaryDistribution = () => {
    const ranges = {
      '0-30k': 0,
      '30k-50k': 0,
      '50k-70k': 0,
      '70k+': 0,
    };

    employees.forEach(employee => {
      const salary = parseFloat(employee.base_salary);
      if (salary < 30000) ranges['0-30k']++;
      else if (salary < 50000) ranges['30k-50k']++;
      else if (salary < 70000) ranges['50k-70k']++;
      else ranges['70k+']++;
    });

    return {
      labels: Object.keys(ranges),
      datasets: [
        {
          label: 'Number of Employees',
          data: Object.values(ranges),
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 2,
        },
      ],
    };
  };

  const calculateSummaryStats = () => {
    const totalGross = payrolls.reduce((sum, p) => sum + parseFloat(p.gross_salary), 0);
    const totalNet = payrolls.reduce((sum, p) => sum + (parseFloat(p.gross_salary) * 0.7), 0);
    const uniqueEmployees = employees.length;
    const avgSalary = uniqueEmployees > 0 ? (employees.reduce((sum, e) => sum + parseFloat(e.base_salary), 0) / uniqueEmployees) : 0;

    return {
      totalGross,
      totalNet,
      avgSalary,
      employees: uniqueEmployees,
    };
  };

  const exportToCSV = () => {
    const headers = ['Employee', 'Period Start', 'Period End', 'Gross Salary', 'Net Salary', 'Status'];
    const rows = payrolls.map(p => [
      p.employee,
      p.period_start,
      p.period_end,
      p.gross_salary,
      (parseFloat(p.gross_salary) * 0.7).toFixed(2),
      p.status,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const stats = calculateSummaryStats();

  return (
    <div className="container-fluid payroll-reports">
      <div className="row">
        <div className="col-12">
          <div className="reports-header">
            <h2>📊 Payroll Reports & Analytics</h2>
            <div className="header-controls">
              <select
                className="form-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
              <button className="btn btn-success" onClick={exportToCSV}>
                📥 Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="col-12">
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card stat-card">
                <div className="card-body">
                  <h6 className="card-subtitle text-muted">Total Employees</h6>
                  <h3 className="card-title text-primary">{stats.employees}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card stat-card">
                <div className="card-body">
                  <h6 className="card-subtitle text-muted">Total Gross Salary</h6>
                  <h3 className="card-title text-info">KES {stats.totalGross.toLocaleString(undefined, {maximumFractionDigits: 0})}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card stat-card">
                <div className="card-body">
                  <h6 className="card-subtitle text-muted">Total Net Salary</h6>
                  <h3 className="card-title text-success">KES {stats.totalNet.toLocaleString(undefined, {maximumFractionDigits: 0})}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card stat-card">
                <div className="card-body">
                  <h6 className="card-subtitle text-muted">Average Salary</h6>
                  <h3 className="card-title text-warning">KES {stats.avgSalary.toLocaleString(undefined, {maximumFractionDigits: 0})}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5>📈 Monthly Payroll Trend ({selectedYear})</h5>
            </div>
            <div className="card-body">
              <Bar data={getMonthlyData()} options={{ responsive: true, maintainAspectRatio: true }} />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5>🥧 Deductions Breakdown</h5>
            </div>
            <div className="card-body">
              <Pie data={getDeductionsBreakdown()} options={{ responsive: true, maintainAspectRatio: true }} />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>📊 Salary Distribution</h5>
            </div>
            <div className="card-body">
              <Bar data={getSalaryDistribution()} options={{ responsive: true, maintainAspectRatio: true }} />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>📋 Recent Payroll Records</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="table table-sm table-hover">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Period</th>
                      <th>Salary</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrolls.slice(0, 10).map((p, idx) => (
                      <tr key={idx}>
                        <td>{p.employee}</td>
                        <td>{p.period_start}</td>
                        <td>KES {parseFloat(p.gross_salary).toLocaleString()}</td>
                        <td>
                          <span className={`badge bg-${p.status === 'Approved' ? 'success' : 'warning'}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PayrollReports;