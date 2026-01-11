// src/components/PayslipPDF.js
import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePayslipPDF = (payslipData) => {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('GLIMMER LIMITED', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text('Human Resource Management System', 105, 28, { align: 'center' });
  doc.text('PAYSLIP', 105, 35, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  
  // Employee Information
  doc.setFillColor(240, 240, 240);
  doc.rect(10, 45, 190, 35, 'F');
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('EMPLOYEE INFORMATION', 15, 52);
  
  doc.setFont(undefined, 'normal');
  doc.text(`Name: ${payslipData.employee.name}`, 15, 60);
  doc.text(`Employee ID: ${payslipData.employee.id}`, 15, 67);
  doc.text(`National ID: ${payslipData.employee.national_id}`, 15, 74);
  
  doc.text(`Pay Period: ${payslipData.period.start} to ${payslipData.period.end}`, 120, 60);
  doc.text(`Payment Date: ${new Date().toLocaleDateString()}`, 120, 67);
  doc.text(`Payslip ID: #${payslipData.payslip_id}`, 120, 74);
  
  // Earnings Table
  doc.setFont(undefined, 'bold');
  doc.text('EARNINGS', 15, 92);
  
  const earningsData = [
    ['Description', 'Amount (KES)'],
    ['Basic Salary', formatCurrency(payslipData.earnings.gross_salary)],
    ['', ''],
    ['GROSS SALARY', formatCurrency(payslipData.earnings.gross_salary)]
  ];
  
  doc.autoTable({
    startY: 95,
    head: [earningsData[0]],
    body: earningsData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 15, right: 105 },
    tableWidth: 90,
    styles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' }
    }
  });
  
  // Deductions Table
  const deductionsData = [
    ['Description', 'Amount (KES)'],
    ['NSSF', formatCurrency(payslipData.deductions.nssf)],
    ['NHIF', formatCurrency(payslipData.deductions.nhif)],
    ['PAYE', formatCurrency(payslipData.deductions.paye)],
    ['Housing Levy', formatCurrency(payslipData.deductions.housing_levy)],
    ['', ''],
    ['TOTAL DEDUCTIONS', formatCurrency(payslipData.deductions.total)]
  ];
  
  doc.autoTable({
    startY: 95,
    head: [deductionsData[0]],
    body: deductionsData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [231, 76, 60], textColor: 255 },
    margin: { left: 108, right: 15 },
    tableWidth: 90,
    styles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' }
    }
  });
  
  // Net Salary Box
  const netY = doc.lastAutoTable.finalY + 10;
  doc.setFillColor(46, 204, 113);
  doc.rect(10, netY, 190, 15, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('NET SALARY:', 15, netY + 10);
  doc.text(`KES ${formatCurrency(payslipData.net_salary)}`, 195, netY + 10, { align: 'right' });
  
  // Footer
  doc.setTextColor(128, 128, 128);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('This is a computer-generated payslip and does not require a signature.', 105, 280, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });
  
  doc.save(`Payslip_${payslipData.employee.name}_${payslipData.period.start}.pdf`);
};

const formatCurrency = (amount) => {
  return parseFloat(amount).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const DownloadPayslipButton = ({ payrollId, employeeName }) => {
  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/payroll/payslip/${payrollId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const payslipData = await response.json();
        generatePayslipPDF(payslipData);
      } else {
        alert('Failed to fetch payslip data');
      }
    } catch (error) {
      console.error('Error downloading payslip:', error);
      alert('Error downloading payslip');
    }
  };
  
  return (
    <button 
      onClick={handleDownload}
      className="btn btn-sm btn-success"
      title={`Download payslip for ${employeeName}`}
    >
      📄 Download PDF
    </button>
  );
};

export default { generatePayslipPDF, DownloadPayslipButton };
