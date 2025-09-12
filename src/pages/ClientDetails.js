// src/pages/ClientDetails.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  getClients, addClient, updateClient, deleteClient,
  getLocationsForClient, addLocation, updateLocation, deleteLocation,
  getClientStats
} from '../services/benefitService';
import Modal from '../components/Modal';

const serviceGroups = ['REIN Client', 'EIN Client', 'Payroll Only'];
const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
    'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
    'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
    'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const ServiceGroupGlossary = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="collapsible-header" onClick={() => setIsOpen(!isOpen)}>
        <h3>{isOpen ? '▼' : '►'} Service Group Glossary</h3>
      </div>
      {isOpen && (
        <div className="collapsible-content">
          <p><strong>REIN Client:</strong> Companies that operate directly under Premiere Pride's EIN. They are eligible for the full range of benefits.</p>
          <p><strong>EIN Client:</strong> Companies that operate under their own EIN. They have access to ancillary plans but not major medical.</p>
          <p><strong>Payroll Only:</strong> Companies that use Premiere Pride for payroll services only and are not offered any benefits.</p>
        </div>
      )}
    </>
  );
};

const LocationManager = ({ client, onLocationsUpdate }) => {
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
    setCurrentLocation(location || { location_number: '', location_name: '', address: '', store_id: '', client_id: client.id });
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
    fetchLocations();
    onLocationsUpdate();
    handleCloseForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      await deleteLocation(id);
      fetchLocations();
      onLocationsUpdate();
    }
  };

  if (!client) return null;

  return (
    <div className="location-manager-container">
      <div className="location-manager-header">
        <h4>Locations for {client.company_name}</h4>
        <button className="add-button action-button-small" onClick={() => handleOpenForm()}>Add Location</button>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        <table className="employees-table">
          <thead>
            <tr>
              <th>Store ID</th>
              <th>Location #</th>
              <th>Location Name</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map(loc => (
              <tr key={loc.id}>
                <td>{loc.store_id}</td>
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
              <input type="text" name="location_number" value={currentLocation.location_number || ''} onChange={(e) => setCurrentLocation(prev => ({ ...prev, location_number: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Store ID</label>
              <input type="text" name="store_id" value={currentLocation.store_id || ''} onChange={(e) => setCurrentLocation(prev => ({ ...prev, store_id: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Location Name</label>
              <input type="text" name="location_name" value={currentLocation.location_name || ''} onChange={(e) => setCurrentLocation(prev => ({ ...prev, location_name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea name="address" value={currentLocation.address || ''} onChange={(e) => setCurrentLocation(prev => ({ ...prev, address: e.target.value }))} autoComplete="street-address" />
            </div>
            <button type="submit" className="submit-button">Save Location</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

const StatCard = ({ title, value }) => (
    <div className="kpi-card">
      <h4>{title}</h4>
      <p>{value}</p>
    </div>
);

function ClientDetails() {
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [expandedClientId, setExpandedClientId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [fetchedClients, fetchedStats] = await Promise.all([
      getClients(),
      getClientStats()
    ]);
    setClients(fetchedClients);
    setStats(fetchedStats);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('tax_')) {
      const field = name.split('_')[1];
      setCurrentClient(prev => ({
        ...prev,
        tax_info: {
          ...(prev.tax_info || {}),
          [field]: value
        }
      }));
    } else {
      setCurrentClient(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOwnerChange = (index, value) => {
    const updatedOwners = [...(currentClient.franchisee_owner || [])];
    updatedOwners[index] = value;
    setCurrentClient(prev => ({ ...prev, franchisee_owner: updatedOwners }));
  };

  const addOwnerField = () => {
    setCurrentClient(prev => ({ ...prev, franchisee_owner: [...(prev.franchisee_owner || []), ''] }));
  };

  const removeOwnerField = (index) => {
    const updatedOwners = (currentClient.franchisee_owner || []).filter((_, i) => i !== index);
    setCurrentClient(prev => ({ ...prev, franchisee_owner: updatedOwners }));
  };

  const handleOpenForm = (client = null) => {
    setIsEditing(!!client);

    if (client) {
      let ownerArray = Array.isArray(client.franchisee_owner)
        ? client.franchisee_owner
        : [client.franchisee_owner || ''];
      
      if (ownerArray.length === 0 || (ownerArray.length === 1 && !ownerArray[0])) {
        ownerArray = [''];
      }
      setCurrentClient({ ...client, franchisee_owner: ownerArray });
    } else {
      setCurrentClient({
        company_name: '', ein: '', service_group: '', notes: '', franchisee_owner: [''], company_email: '', website: '',
        tax_info: { state: '', sui_number: '', local_tax: '' }
      });
    }
    
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentClient(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientToSubmit = {
      ...currentClient,
      franchisee_owner: (currentClient.franchisee_owner || []).filter(owner => owner && owner.trim() !== '')
    };

    if (isEditing) {
      await updateClient(clientToSubmit.id, clientToSubmit);
    } else {
      await addClient(clientToSubmit);
    }
    fetchData();
    handleCloseForm();
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      await deleteClient(id);
      if (expandedClientId === id) {
        setExpandedClientId(null);
      }
      fetchData();
    }
  };

  const handleToggleAccordion = (clientId) => {
    if (expandedClientId === clientId) {
      setExpandedClientId(null);
    } else {
      setExpandedClientId(clientId);
    }
  };

  if (loading) {
    return <div className="page-container"><h1>Loading Clients...</h1></div>;
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

      <div className="client-dashboard-layout">
        <div>
          <div className="kpi-container">
              <StatCard title="Total Clients" value={stats.total_clients || 0} />
              <StatCard title="Total Locations" value={stats.total_locations || 0} />
              <StatCard title="REIN Clients" value={stats.rein_clients || 0} />
              <StatCard title="EIN Clients" value={stats.ein_clients || 0} />
          </div>
        </div>
        <div>
          <ServiceGroupGlossary />
          <div className="client-accordion-container">
            {clients.map(client => (
              <div key={client.id} className="client-accordion-item">
                <div className="client-header" onClick={() => handleToggleAccordion(client.id)}>
                  <strong>{client.company_name}</strong>
                  <span>{client.ein}</span>
                  <span>{client.service_group}</span>
                  <div className="action-buttons-cell" style={{ justifyContent: 'flex-end' }}>
                    <button className="action-button-small" onClick={(e) => { e.stopPropagation(); handleOpenForm(client); }}>Edit</button>
                    <button className="action-button-delete action-button-small" onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }}>Delete</button>
                  </div>
                </div>
                {expandedClientId === client.id && (
                  <div className="client-details-content">
                    <div className="client-details-grid">
                      <div>
                        <strong>Franchisee/Owner(s):</strong>
                        {Array.isArray(client.franchisee_owner) && client.franchisee_owner.filter(o => o).length > 0 ? (
                            client.franchisee_owner.map((owner, index) => <p key={index}>{owner}</p>)
                        ) : <p>N/A</p>}
                      </div>
                      <div>
                        <strong>Company Email:</strong>
                        <p>{client.company_email || 'N/A'}</p>
                      </div>
                      <div>
                        <strong>Website:</strong>
                        <p><a href={client.website} target="_blank" rel="noopener noreferrer">{client.website || 'N/A'}</a></p>
                      </div>
                      <div>
                        <strong>State:</strong>
                        <p>{client.tax_info?.state || 'N/A'}</p>
                      </div>
                      <div>
                        <strong>SUI Number:</strong>
                        <p>{client.tax_info?.sui_number || 'N/A'}</p>
                      </div>
                      <div>
                        <strong>Local Tax Info:</strong>
                        <p>{client.tax_info?.local_tax || 'N/A'}</p>
                      </div>
                    </div>
                    <LocationManager client={client} onLocationsUpdate={fetchData} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showForm && currentClient && (
        <Modal onClose={handleCloseForm}>
          <h3>{isEditing ? 'Edit Client' : 'Add New Client'}</h3>
          <form className="add-employee-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" name="company_name" value={currentClient.company_name || ''} onChange={handleInputChange} required autoComplete="organization" />
            </div>
            <div className="form-group">
                <label>Franchisee / Owner(s)</label>
                {Array.isArray(currentClient.franchisee_owner) && currentClient.franchisee_owner.map((owner, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                        <input
                            type="text"
                            value={owner}
                            onChange={(e) => handleOwnerChange(index, e.target.value)}
                            style={{ flexGrow: 1, marginRight: '5px' }}
                        />
                        {currentClient.franchisee_owner.length > 1 && (
                            <button type="button" onClick={() => removeOwnerField(index)} className="action-button-delete action-button-small">-</button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={addOwnerField} className="action-button-small" style={{ marginTop: '5px' }}>+ Add Owner</button>
            </div>
            <div className="form-group">
              <label>Company Email</label>
              <input type="email" name="company_email" value={currentClient.company_email || ''} onChange={handleInputChange} autoComplete="email" />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input type="text" name="website" value={currentClient.website || ''} onChange={handleInputChange} autoComplete="url" />
            </div>
            <div className="form-group">
              <label>EIN</label>
              <input type="text" name="ein" value={currentClient.ein || ''} onChange={handleInputChange} required autoComplete="off" />
            </div>
            <div className="form-group">
              <label>Service Group</label>
              <select name="service_group" value={currentClient.service_group || ''} onChange={handleInputChange} required>
                <option value="" disabled>Select Service Group</option>
                {serviceGroups.map(group => <option key={group} value={group}>{group}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>State</label>
              <select name="tax_state" value={currentClient.tax_info?.state || ''} onChange={handleInputChange}>
                <option value="" disabled>Select a State</option>
                {usStates.map(state => <option key={state} value={state}>{state}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>State Unemployment (SUI) Number</label>
              <input type="text" name="tax_sui_number" value={currentClient.tax_info?.sui_number || ''} onChange={handleInputChange} autoComplete="off" />
            </div>
            <div className="form-group">
              <label>Local Tax Details</label>
              <input type="text" name="tax_local_tax" placeholder="e.g., specific county or city tax info" value={currentClient.tax_info?.local_tax || ''} onChange={handleInputChange} autoComplete="off" />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea name="notes" value={currentClient.notes || ''} onChange={handleInputChange} />
            </div>
            <button type="submit" className="submit-button">Save Client</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ClientDetails;