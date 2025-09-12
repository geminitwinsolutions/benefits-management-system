import React, { useState, useEffect } from 'react';
import { getClients, addClient } from '../services/benefitService';
import Modal from '../components/Modal';

const serviceGroups = ['REIN Client', 'EIN Client', 'Payroll Only'];

// --- Location Manager Component (New) ---
const LocationManager = ({ client, onUpdate }) => {
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  const fetchLocations = useCallback(async () => {
    if (client) {
      const clientLocations = await getLocationsForClient(client.id);
      setLocations(clientLocations);
    }
  }, [client]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleOpenForm = (location = null) => {
    setIsEditing(!!location);
    setCurrentLocation(location || { location_number: '', location_name: '', address: '', client_id: client.id });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentLocation(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await updateLocation(currentLocation.id, currentLocation);
    } else {
      await addLocation(currentLocation);
    }
    fetchLocations(); // Refetch locations for the client
    handleCloseForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      await deleteLocation(id);
      fetchLocations();
    }
  };

  return (
    <div className="card mt-4">
      <div className="page-header">
        <h3>Locations for {client.company_name}</h3>
        <button className="add-button action-button-small" onClick={() => handleOpenForm()}>Add Location</button>
      </div>
      <div className="card-body">
        <table className="employees-table">
          <thead>
            <tr>
              <th>Location #</th>
              <th>Location Name</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map(loc => (
              <tr key={loc.id}>
                <td>{loc.location_number}</td>
                <td>{loc.location_name}</td>
                <td>{loc.address}</td>
                <td className="action-buttons-cell">
                  <button className="action-button-small" onClick={() => handleOpenForm(loc)}>Edit</button>
                  <button className="action-button-delete action-button-small" onClick={() => handleDelete(loc.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal onClose={handleCloseForm}>
          <h3>{isEditing ? 'Edit Location' : 'Add Location'}</h3>
          <form className="add-employee-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Location Number</label>
              <input type="text" name="location_number" value={currentLocation.location_number} onChange={(e) => setCurrentLocation(prev => ({ ...prev, location_number: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Location Name</label>
              <input type="text" name="location_name" value={currentLocation.location_name} onChange={(e) => setCurrentLocation(prev => ({ ...prev, location_name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea name="address" value={currentLocation.address} onChange={(e) => setCurrentLocation(prev => ({ ...prev, address: e.target.value }))} />
            </div>
            <button type="submit" className="submit-button">Save Location</button>
          </form>
        </Modal>
      )}
    </div>
  );
};


// --- Main Client Details Component (Updated) ---
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
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} onClick={() => setSelectedClient(client)} style={{ cursor: 'pointer', background: selectedClient?.id === client.id ? '#f3f4f6' : 'transparent' }}>
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