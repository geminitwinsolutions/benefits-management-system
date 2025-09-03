import React, { useState, useEffect } from 'react';
import { getReconciliationItems, addReconciliationItem, updateReconciliationItemStatus, deleteReconciliationItem } from '../services/benefitService';
import Modal from '../components/Modal';

const planTypes = ['Medical', 'Dental', 'Vision', 'Life Insurance', 'Disability'];

function BenefitsReconciliation() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ employeeName: '', planType: '', discrepancy: '' });

  async function fetchItems() {
    setLoading(true);
    const fetchedItems = await getReconciliationItems();
    setItems(fetchedItems);
    setLoading(false);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const addedItem = await addReconciliationItem(newItem);
    if (addedItem) {
      setItems(prevItems => [...prevItems, addedItem]);
      setShowAddForm(false);
      setNewItem({ employeeName: '', planType: '', discrepancy: '' });
    }
  };

  const handleApprove = async (itemId) => {
    const updatedItem = await updateReconciliationItemStatus(itemId, 'Approved');
    if (updatedItem) {
      setItems(prevItems => prevItems.map(item => item.id === updatedItem.id ? updatedItem : item));
    }
  };

  const handleFlag = async (itemId) => {
    const updatedItem = await updateReconciliationItemStatus(itemId, 'Flagged');
    if (updatedItem) {
      setItems(prevItems => prevItems.map(item => item.id === updatedItem.id ? updatedItem : item));
    }
  };
  
  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const success = await deleteReconciliationItem(itemId);
      if (success) {
        setItems(prevItems => prevItems.filter(item => item.id !== itemId));
      }
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading Reconciliation Items...</h1>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Benefit Reconciliation</h1>
        <button className="add-button" onClick={() => setShowAddForm(true)}>
          Add New Discrepancy
        </button>
      </div>
      <p>Review and resolve discrepancies between enrollment data and carrier invoices.</p>
      <table className="employees-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Plan Type</th>
            <th>Discrepancy</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.employeeName}</td>
              <td>{item.planType}</td>
              <td>{item.discrepancy}</td>
              <td>
                <span className={`status-badge status-${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </td>
              <td className="action-buttons-cell">
                {item.status === 'Pending' && (
                  <>
                    <button onClick={() => handleApprove(item.id)} className="action-button-approve">Approve</button>
                    <button onClick={() => handleFlag(item.id)} className="action-button-flag">Flag</button>
                  </>
                )}
                <button onClick={() => handleDelete(item.id)} className="action-button-delete">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {showAddForm && (
        <Modal onClose={() => setShowAddForm(false)}>
          <h3>Add New Discrepancy</h3>
          <form className="add-employee-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Employee Name</label>
              <input type="text" name="employeeName" value={newItem.employeeName} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Plan Type</label>
              <select name="planType" value={newItem.planType} onChange={handleInputChange} required>
                <option value="" disabled>Select Plan Type</option>
                {planTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Discrepancy</label>
              <textarea name="discrepancy" value={newItem.discrepancy} onChange={handleInputChange} required />
            </div>
            <button type="submit" className="submit-button">Save Discrepancy</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default BenefitsReconciliation;
