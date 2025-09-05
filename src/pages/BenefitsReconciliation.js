import React, { useState, useEffect, useMemo } from 'react';
import { getEnrollmentsWithEmployeeData, getInvoicesForMonth, updateInvoiceStatus } from '../services/benefitService';

function BenefitsReconciliation() {
  const [enrollments, setEnrollments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7) + '-01');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [enrollmentData, invoiceData] = await Promise.all([
        getEnrollmentsWithEmployeeData(),
        getInvoicesForMonth(selectedMonth)
      ]);
      setEnrollments(enrollmentData);
      setInvoices(invoiceData);
      setLoading(false);
    }
    fetchData();
  }, [selectedMonth]);

  const reconciliationData = useMemo(() => {
    const dataMap = new Map();

    enrollments.forEach(enrollment => {
      // --- THIS IS THE FIX ---
      // Safely skip any enrollment record if the linked employee has been deleted.
      if (!enrollment.employees) {
        console.warn(`Skipping enrollment ID ${enrollment.id} because it has no linked employee.`);
        return;
      }

      const employeeName = enrollment.employees.name;
      Object.entries(enrollment.selections).forEach(([planType, planDetails]) => {
        const key = `${enrollment.employee_id}-${planType}`;
        dataMap.set(key, {
          invoiceId: null, // Will be populated from invoices
          employeeName,
          planType,
          enrolledAmount: planDetails.cost,
          billedAmount: null,
          status: 'Missing from Invoice',
        });
      });
    });

    invoices.forEach(invoice => {
      const key = `${invoice.employee_id}-${invoice.plan_type}`;
      const existing = dataMap.get(key);

      if (existing) {
        existing.invoiceId = invoice.id;
        existing.billedAmount = invoice.billed_amount;
        
        if (invoice.status === 'Approved' || invoice.status === 'Flagged') {
            existing.status = invoice.status;
        } else if (Math.abs(existing.enrolledAmount - invoice.billed_amount) < 0.01) {
            existing.status = 'Matched';
        } else {
            existing.status = 'Discrepancy';
        }
      } else {
        dataMap.set(key, {
          invoiceId: invoice.id,
          employeeName: 'Unknown Employee',
          planType: invoice.plan_type,
          enrolledAmount: null,
          billedAmount: invoice.billed_amount,
          status: 'Unexpected Charge',
        });
      }
    });

    return Array.from(dataMap.values());
  }, [enrollments, invoices]);
  
  const handleUpdateStatus = async (invoiceId, newStatus) => {
    if (!invoiceId) {
        alert("Cannot update status for an item that is missing from the invoice.");
        return;
    }
    const updatedInvoice = await updateInvoiceStatus(invoiceId, newStatus);
    if (updatedInvoice) {
      setInvoices(currentInvoices =>
        currentInvoices.map(inv =>
          inv.id === updatedInvoice.id ? updatedInvoice : inv
        )
      );
    } else {
      alert(`Failed to update status to "${newStatus}".`);
    }
  };

  const handleMonthChange = (e) => {
    const date = new Date(e.target.value + '-02');
    setSelectedMonth(date.toISOString().slice(0, 10));
  };

  if (loading) {
    return <div className="page-container"><h1>Loading Reconciliation Data...</h1></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Benefit Reconciliation</h1>
        <div>
          <label htmlFor="month-select" style={{ marginRight: '1rem' }}>Select Billing Month:</label>
          <input 
            type="month" 
            id="month-select"
            value={selectedMonth.slice(0, 7)}
            onChange={handleMonthChange}
          />
        </div>
      </div>
      <p>Compare monthly carrier invoices against employee enrollment data to find discrepancies.</p>
      
      <div className="card">
        <div className="card-header green">
          <h2>Reconciliation Grid for {new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</h2>
        </div>
        <div className="card-body">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Plan Type</th>
                <th>Enrolled Cost</th>
                <th>Billed Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reconciliationData.map((item, index) => (
                <tr key={`${item.employeeName}-${item.planType}-${index}`} className={item.status !== 'Matched' && item.status !== 'Approved' ? 'row-error' : ''}>
                  <td>{item.employeeName}</td>
                  <td>{item.planType}</td>
                  <td>{item.enrolledAmount !== null ? `$${item.enrolledAmount.toFixed(2)}` : 'N/A'}</td>
                  <td>{item.billedAmount !== null ? `$${item.billedAmount.toFixed(2)}` : 'N/A'}</td>
                  <td>
                    <span className={`status-badge status-${item.status.toLowerCase().replace(/ /g, '-')}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="action-buttons-cell">
                    {item.status === 'Matched' && (
                      <button onClick={() => handleUpdateStatus(item.invoiceId, 'Approved')} className="action-button-approve">
                        Accept
                      </button>
                    )}
                    {(item.status === 'Discrepancy' || item.status === 'Unexpected Charge') && (
                      <button onClick={() => handleUpdateStatus(item.invoiceId, 'Flagged')} className="action-button-flag">
                        Flag
                      </button>
                    )}
                    {item.status === 'Approved' && '✓ Approved'}
                    {item.status === 'Flagged' && '⚐ Flagged for Review'}
                    {item.status === 'Missing from Invoice' && <button className="action-button-flag">Investigate</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BenefitsReconciliation;

