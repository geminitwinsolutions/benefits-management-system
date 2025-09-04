import React, { useState, useEffect } from 'react';
import { getClients, addClient } from '../services/benefitService';
import Modal from '../components/Modal';

const serviceGroups = ['REIN Client', 'EIN Client', 'Payroll Only'];

function ClientDetails() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState({ 
    company_name: '', 
    ein: '', 
    tax_info: '', 
    service_group: '', 
    notes: '' 
  });

  async function fetchClients() {
    setLoading(true);
    const fetchedClients = await getClients();
    setClients(fetchedClients);
    setLoading(false);
  }

  useEffect(() => {
    fetchClients();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const addedClient = await addClient(newClient);
    if (addedClient) {
      setClients(prevClients => [...prevClients, addedClient]);
      setShowAddForm(false);
      setNewClient({ company_name: '', ein: '', tax_info: '', service_group: '', notes: '' });
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading Clients...</h1>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Client Management</h1>
        <button className="add-button" onClick={() => setShowAddForm(true)}>
          Add New Client
        </button>
      </div>
      <p>Manage all client information, including tax and service details.</p>

      <div className="card">
        <div className="card-header blue">
          <h2>Client List</h2>
        </div>
        <div className="card-body" style={{padding: '0'}}>
          <table className="employees-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>EIN</th>
                <th>Service Group</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id}>
                  <td>{client.company_name}</td>
                  <td>{client.ein}</td>
                  <td>{client.service_group}</td>
                  <td>{client.notes}</td>
                  <td>
                    <button className="action-button">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {showAddForm && (
        <Modal onClose={() => setShowAddForm(false)}>
          <h3>Add New Client</h3>
          <form className="add-employee-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" name="company_name" value={newClient.company_name} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>EIN</label>
              <input type="text" name="ein" value={newClient.ein} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Service Group</label>
              <select name="service_group" value={newClient.service_group} onChange={handleInputChange} required>
                <option value="" disabled>Select Service Group</option>
                {serviceGroups.map(group => <option key={group} value={group}>{group}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Tax Information</label>
              <textarea name="tax_info" value={newClient.tax_info} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea name="notes" value={newClient.notes} onChange={handleInputChange} />
            </div>
            <button type="submit" className="submit-button">Save Client</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ClientDetails;