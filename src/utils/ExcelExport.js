// src/utils/ExcelExport.js
import * as XLSX from 'xlsx';

/**
 * Excel Export Utility
 * Provides functions to export payroll data to Excel format
 */

export const exportPayrollToExcel = (payrolls) => {
  // Prepare data for export
  const data = payrolls.map(payroll => ({
    'Employee ID': payroll.employee_id,
    'Employee Name': payroll.employee,
    'Period Start': payroll.period_start,
    'Period End': payroll.period_end,
    'Gross Salary': parseFloat(payroll.gross_salary).toFixed(2),
    'NSSF': calculateNSSF(payroll.gross_salary).toFixed(2),
    'NHIF': calculateNHIF(payroll.gross_salary).toFixed(2),
    'PAYE': calculatePAYE(payroll.gross_salary).toFixed(2),
    'Housing Levy': calculateHousingLevy(payroll.gross_salary).toFixed(2),
    'Total Deductions': calculateTotalDeductions(payroll.gross_salary).toFixed(2),
    'Net Salary': calculateNetSalary(payroll.gross_salary).toFixed(2),
    'Status': payroll.status,
    'Attendance Days': payroll.attendance_days || 'N/A'
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const colWidths = [
    { wch: 12 }, // Employee ID
    { wch: 25 }, // Employee Name
    { wch: 12 }, // Period Start
    { wch: 12 }, // Period End
    { wch: 15 }, // Gross Salary
    { wch: 12 }, // NSSF
    { wch: 12 }, // NHIF
    { wch: 12 }, // PAYE
    { wch: 15 }, // Housing Levy
    { wch: 18 }, // Total Deductions
    { wch: 15 }, // Net Salary
    { wch: 12 }, // Status
    { wch: 15 }  // Attendance Days
  ];
  worksheet['!cols'] = colWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll Data');

  // Add summary sheet
  const summary = createSummarySheet(payrolls);
  const summaryWorksheet = XLSX.utils.json_to_sheet(summary);
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

  // Generate file name with timestamp
  const fileName = `Payroll_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

  // Save file
  XLSX.writeFile(workbook, fileName);
};

export const exportPayslipsToExcel = (payslips, employeeName) => {
  const data = payslips.map(payslip => ({
    'Period Start': payslip.period_start,
    'Period End': payslip.period_end,
    'Gross Salary': parseFloat(payslip.gross_salary).toFixed(2),
    'NSSF': calculateNSSF(payslip.gross_salary).toFixed(2),
    'NHIF': calculateNHIF(payslip.gross_salary).toFixed(2),
    'PAYE': calculatePAYE(payslip.gross_salary).toFixed(2),
    'Housing Levy': calculateHousingLevy(payslip.gross_salary).toFixed(2),
    'Total Deductions': calculateTotalDeductions(payslip.gross_salary).toFixed(2),
    'Net Salary': calculateNetSalary(payslip.gross_salary).toFixed(2),
    'Status': payslip.status
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'My Payslips');

  const fileName = `${employeeName.replace(/ /g, '_')}_Payslips_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportDetailedPayrollReport = (payrolls) => {
  const workbook = XLSX.utils.book_new();

  // Main payroll data
  const mainData = payrolls.map(p => ({
    'Employee ID': p.employee_id,
    'Employee Name': p.employee,
    'Period Start': p.period_start,
    'Period End': p.period_end,
    'Gross Salary': parseFloat(p.gross_salary).toFixed(2),
    'Net Salary': calculateNetSalary(p.gross_salary).toFixed(2),
    'Status': p.status
  }));
  const mainSheet = XLSX.utils.json_to_sheet(mainData);
  XLSX.utils.book_append_sheet(workbook, mainSheet, 'Payroll Summary');

  // Deductions breakdown
  const deductionsData = payrolls.map(p => ({
    'Employee': p.employee,
    'NSSF': calculateNSSF(p.gross_salary).toFixed(2),
    'NHIF': calculateNHIF(p.gross_salary).toFixed(2),
    'PAYE': calculatePAYE(p.gross_salary).toFixed(2),
    'Housing Levy': calculateHousingLevy(p.gross_salary).toFixed(2),
    'Total': calculateTotalDeductions(p.gross_salary).toFixed(2)
  }));
  const deductionsSheet = XLSX.utils.json_to_sheet(deductionsData);
  XLSX.utils.book_append_sheet(workbook, deductionsSheet, 'Deductions');

  // Statistical summary
  const stats = calculateStatistics(payrolls);
  const statsSheet = XLSX.utils.json_to_sheet([stats]);
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics');

  const fileName = `Detailed_Payroll_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// Helper functions for calculations
const calculateNSSF = (grossSalary) => {
  return Math.min(parseFloat(grossSalary) * 0.06, 1080);
};

const calculateNHIF = (grossSalary) => {
  const salary = parseFloat(grossSalary);
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

const calculatePAYE = (grossSalary) => {
  const salary = parseFloat(grossSalary);
  const nssf = calculateNSSF(salary);
  const taxableIncome = salary - nssf;
  
  let paye = 0;
  if (taxableIncome <= 24000) {
    paye = taxableIncome * 0.10;
  } else if (taxableIncome <= 32333) {
    paye = 2400 + (taxableIncome - 24000) * 0.25;
  } else {
    paye = 4483.25 + (taxableIncome - 32333) * 0.30;
  }
  
  const personalRelief = 2400;
  return Math.max(paye - personalRelief, 0);
};

const calculateHousingLevy = (grossSalary) => {
  return parseFloat(grossSalary) * 0.015;
};

const calculateTotalDeductions = (grossSalary) => {
  return calculateNSSF(grossSalary) + 
         calculateNHIF(grossSalary) + 
         calculatePAYE(grossSalary) + 
         calculateHousingLevy(grossSalary);
};

const calculateNetSalary = (grossSalary) => {
  return parseFloat(grossSalary) - calculateTotalDeductions(grossSalary);
};

const createSummarySheet = (payrolls) => {
  const totalGross = payrolls.reduce((sum, p) => sum + parseFloat(p.gross_salary), 0);
  const totalNet = payrolls.reduce((sum, p) => sum + calculateNetSalary(p.gross_salary), 0);
  const totalDeductions = payrolls.reduce((sum, p) => sum + calculateTotalDeductions(p.gross_salary), 0);

  return [
    { 'Metric': 'Total Employees', 'Value': payrolls.length },
    { 'Metric': 'Total Gross Salary', 'Value': totalGross.toFixed(2) },
    { 'Metric': 'Total Deductions', 'Value': totalDeductions.toFixed(2) },
    { 'Metric': 'Total Net Salary', 'Value': totalNet.toFixed(2) },
    { 'Metric': 'Average Gross Salary', 'Value': (totalGross / payrolls.length).toFixed(2) },
    { 'Metric': 'Average Net Salary', 'Value': (totalNet / payrolls.length).toFixed(2) }
  ];
};

const calculateStatistics = (payrolls) => {
  const grossSalaries = payrolls.map(p => parseFloat(p.gross_salary));
  const netSalaries = payrolls.map(p => calculateNetSalary(p.gross_salary));

  return {
    'Total Employees': payrolls.length,
    'Total Gross': grossSalaries.reduce((a, b) => a + b, 0).toFixed(2),
    'Total Net': netSalaries.reduce((a, b) => a + b, 0).toFixed(2),
    'Average Gross': (grossSalaries.reduce((a, b) => a + b, 0) / payrolls.length).toFixed(2),
    'Average Net': (netSalaries.reduce((a, b) => a + b, 0) / payrolls.length).toFixed(2),
    'Min Salary': Math.min(...grossSalaries).toFixed(2),
    'Max Salary': Math.max(...grossSalaries).toFixed(2)
  };
};

// Export Button Component
export const ExportButton = ({ payrolls, type = 'basic' }) => {
  const handleExport = () => {
    if (type === 'detailed') {
      exportDetailedPayrollReport(payrolls);
    } else {
      exportPayrollToExcel(payrolls);
    }
  };

  return (
    <button 
      onClick={handleExport}
      className="btn btn-success"
      disabled={!payrolls || payrolls.length === 0}
    >
      📊 Export to Excel
    </button>
  );
};

export default {
  exportPayrollToExcel,
  exportPayslipsToExcel,
  exportDetailedPayrollReport,
  ExportButton
};
