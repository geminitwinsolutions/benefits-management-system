import React, { useState, useEffect } from 'react';
import { getClients, addClient, updateClient, deleteClient } from '../services/benefitService';
import Modal from '../components/Modal';

const serviceGroups = ['REIN Client', 'EIN Client', 'Payroll Only'];

function ClientDetails() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);

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
    setCurrentClient(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenForm = (client = null) => {
    setIsEditing(!!client);
    setCurrentClient(client || { company_name: '', ein: '', tax_info: '', service_group: '', notes: '' });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentClient(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await updateClient(currentClient.id, currentClient);
    } else {
      await addClient(currentClient);
    }
    fetchClients();
    handleCloseForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      await deleteClient(id);
      fetchClients();
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
        <button className="add-button" onClick={() => handleOpenForm()}>
          Add New Client
        </button>
      </div>
      <p>Manage all client information, including tax and service details.</p>

      <div className="card">
        <div className="card-header blue">
          <h2>Client List</h2>
        </div>
        <div className="card-body">
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
                  <td className="action-buttons-cell">
                    <button className="action-button-small" onClick={() => handleOpenForm(client)}>Edit</button>
                    <button className="action-button-delete action-button-small" onClick={() => handleDelete(client.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <Modal onClose={handleCloseForm}>
          <h3>{isEditing ? 'Edit Client' : 'Add New Client'}</h3>
          <form className="add-employee-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" name="company_name" value={currentClient.company_name} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>EIN</label>
              <input type="text" name="ein" value={currentClient.ein} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Service Group</label>
              <select name="service_group" value={currentClient.service_group} onChange={handleInputChange} required>
                <option value="" disabled>Select Service Group</option>
                {serviceGroups.map(group => <option key={group} value={group}>{group}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Tax Information</label>
              <textarea name="tax_info" value={currentClient.tax_info} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea name="notes" value={currentClient.notes} onChange={handleInputChange} />
            </div>
            <button type="submit" className="submit-button">Save Client</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ClientDetails;