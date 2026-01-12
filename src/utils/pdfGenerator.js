// ====================================
// PAYROLL PDF GENERATION
// ====================================
// File: src/utils/pdfGenerator.js
// Add this to your frontend

import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePayslipPDF = (payrollData, employeeData) => {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('GLIMMER LIMITED', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Employee Payslip', 105, 28, { align: 'center' });
  
  // Draw header line
  doc.setDrawColor(100, 100, 255);
  doc.setLineWidth(0.5);
  doc.line(20, 32, 190, 32);
  
  // Employee Information
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  
  const startY = 40;
  
  // Left column
  doc.text(`Employee Name: ${employeeData.name}`, 20, startY);
  doc.text(`Employee ID: ${employeeData.id}`, 20, startY + 6);
  doc.text(`Department: ${employeeData.department || 'N/A'}`, 20, startY + 12);
  doc.text(`Position: ${employeeData.position || 'N/A'}`, 20, startY + 18);
  
  // Right column
  doc.text(`Period: ${payrollData.period_start} to ${payrollData.period_end}`, 120, startY);
  doc.text(`Payment Date: ${payrollData.payment_date || 'Pending'}`, 120, startY + 6);
  doc.text(`Status: ${payrollData.status}`, 120, startY + 12);
  doc.text(`Payslip ID: ${payrollData.id}`, 120, startY + 18);
  
  // Earnings Table
  const earningsY = startY + 30;
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('EARNINGS', 20, earningsY);
  
  doc.autoTable({
    startY: earningsY + 5,
    head: [['Description', 'Amount (KES)']],
    body: [
      ['Gross Salary', payrollData.gross_salary.toLocaleString('en-KE', { minimumFractionDigits: 2 })],
      ['Attendance Days', `${payrollData.attendance_days} days`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [100, 100, 255], textColor: 255 },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 70, halign: 'right' }
    }
  });
  
  // Deductions Table
  const deductionsY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text('DEDUCTIONS', 20, deductionsY);
  
  doc.autoTable({
    startY: deductionsY + 5,
    head: [['Description', 'Amount (KES)']],
    body: [
      ['NSSF', payrollData.nssf.toLocaleString('en-KE', { minimumFractionDigits: 2 })],
      ['NHIF', payrollData.nhif.toLocaleString('en-KE', { minimumFractionDigits: 2 })],
      ['PAYE (Tax)', payrollData.paye.toLocaleString('en-KE', { minimumFractionDigits: 2 })],
      ['Housing Levy', payrollData.housing_levy.toLocaleString('en-KE', { minimumFractionDigits: 2 })],
      ['TOTAL DEDUCTIONS', payrollData.total_deductions.toLocaleString('en-KE', { minimumFractionDigits: 2 })],
    ],
    theme: 'grid',
    headStyles: { fillColor: [255, 100, 100], textColor: 255 },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 70, halign: 'right' }
    },
    didParseCell: (data) => {
      // Bold the total row
      if (data.row.index === 4 && data.section === 'body') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
      }
    }
  });
  
  // Net Salary Box
  const netSalaryY = doc.lastAutoTable.finalY + 15;
  
  // Draw background box
  doc.setFillColor(100, 255, 100);
  doc.setDrawColor(60, 200, 60);
  doc.roundedRect(20, netSalaryY - 5, 170, 20, 3, 3, 'FD');
  
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('NET SALARY:', 25, netSalaryY + 5);
  
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(
    `KES ${payrollData.net_salary.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`,
    185,
    netSalaryY + 5,
    { align: 'right' }
  );
  
  // Footer
  const footerY = netSalaryY + 30;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  
  doc.text('This is a computer-generated payslip and does not require a signature.', 105, footerY, { align: 'center' });
  doc.text('For queries, please contact HR Department at hr@glimmerlimited.com', 105, footerY + 5, { align: 'center' });
  
  // Page border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(15, 15, 180, 267);
  
  // Save the PDF
  const fileName = `Payslip_${employeeData.name.replace(/\s+/g, '_')}_${payrollData.period_end}.pdf`;
  doc.save(fileName);
};


// ====================================
// BULK PDF GENERATION
// ====================================
export const generateBulkPayslips = async (payrollRecords, employees) => {
  for (const payroll of payrollRecords) {
    const employee = employees.find(emp => emp.id === payroll.employee_id);
    if (employee) {
      generatePayslipPDF(payroll, employee);
      // Add small delay to prevent browser freeze
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
};


// ====================================
// USAGE EXAMPLE
// ====================================
/*
// In your Payroll component:

import { generatePayslipPDF } from './utils/pdfGenerator';

const handleDownloadPayslip = (payrollId) => {
  const payroll = payrolls.find(p => p.id === payrollId);
  const employee = employees.find(e => e.id === payroll.employee_id);
  
  generatePayslipPDF(payroll, employee);
};

// In your JSX:
<button onClick={() => handleDownloadPayslip(payroll.id)}>
  Download PDF
</button>
*/
