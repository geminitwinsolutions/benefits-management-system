import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getClients, addClient, updateClient, deleteClient,
  getLocationsForClient, addLocation, updateLocation, deleteLocation,
  getEmployees, getAllLocations
} from '../services/benefitService';
import Modal from '../components/Modal';
import { usStates } from '../utils/constants';

// --- CONSTANTS ---
const serviceGroups = ['REIN Client', 'EIN Client', 'Payroll Only'];
const clientStatuses = ['Active', 'Pending Active', 'Pending Close', 'Inactive'];
const locationStatuses = ['Active', 'Inactive'];
const payPeriods = ['Weekly', 'Bi-Weekly 1', 'Bi-Weekly 2', 'Semi-Monthly', 'Monthly'];

// --- HELPER COMPONENTS ---

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
    const [clientEmployees, setClientEmployees] = useState([]);

    const fetchLocationsAndEmployees = useCallback(async () => {
      if (client) {
        const [clientLocations, allEmployees] = await Promise.all([
          getLocationsForClient(client.id),
          getEmployees(),
        ]);
        setLocations(clientLocations);
        setClientEmployees(allEmployees.filter(emp => emp.client_id === client.id));
      }
    }, [client]);

    useEffect(() => {
      fetchLocationsAndEmployees();
    }, [fetchLocationsAndEmployees]);
    
    const formatAddress = (loc) => {
        const parts = [loc.address_1, loc.address_2, loc.city, loc.state, loc.zip_code].filter(Boolean);
        return parts.join(', ');
    };

    const managerOptions = useMemo(() => {
        const activeManagers = clientEmployees.filter(emp => emp.status === 'Active');
        
        if (isEditing && currentLocation?.store_manager) {
            const currentManagerIsActive = activeManagers.some(
                emp => emp.name === currentLocation.store_manager
            );
            
            if (!currentManagerIsActive) {
                const currentManagerObject = clientEmployees.find(
                    emp => emp.name === currentLocation.store_manager
                );
                if (currentManagerObject) {
                    return [currentManagerObject, ...activeManagers];
                }
            }
        }
        return activeManagers;
    }, [clientEmployees, isEditing, currentLocation]);


    const handleOpenForm = (location = null) => {
      setIsEditing(!!location);
      setCurrentLocation(location || {
          location_number: '',
          location_name: '',
          store_id: '',
          client_id: client.id,
          store_manager: '',
          status: 'Active',
          store_phone_number: '',
          store_fax_number: '',
          address_1: '',
          address_2: '',
          city: '',
          state: '',
          zip_code: ''
      });
      setShowForm(true);
    };

    const handleCloseForm = () => {
      setShowForm(false);
      setCurrentLocation(null);
    };
    
    const formatPhoneNumber = (value) => {
        if (!value) return value;
        const phoneNumber = value.replace(/[^\d]/g, '');
        const phoneNumberLength = phoneNumber.length;
        if (phoneNumberLength < 4) return phoneNumber;
        if (phoneNumberLength < 7) {
            return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        }
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    };

    const handleLocationInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'store_phone_number' || name === 'store_fax_number') {
            const formattedValue = formatPhoneNumber(value);
            setCurrentLocation(prev => ({ ...prev, [name]: formattedValue }));
        } else {
            setCurrentLocation(prev => ({...prev, [name]: value}));
        }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (isEditing) {
        await updateLocation(currentLocation.id, currentLocation);
      } else {
        await addLocation(currentLocation);
      }
      fetchLocationsAndEmployees();
      onLocationsUpdate();
      handleCloseForm();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this location?')) {
            await deleteLocation(id);
            fetchLocationsAndEmployees();
            onLocationsUpdate();
            handleCloseForm();
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
                <th>Store Manager</th>
                <th>Status</th>
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
                  <td>{loc.store_manager}</td>
                  <td><span className={`status-badge status-${(loc.status || '').toLowerCase()}`}>{loc.status}</span></td>
                  <td>{formatAddress(loc)}</td>
                  <td className="action-buttons-cell">
                    <button className="action-button action-button-small" onClick={() => handleOpenForm(loc)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showForm && (
          <Modal onClose={handleCloseForm} size="large">
            <h3>{isEditing ? 'Edit Location' : 'Add Location'}</h3>
            <form className="add-employee-form" onSubmit={handleSubmit}>
              <div className="settings-form-grid">
                <div className="form-group">
                  <label>Location Number</label>
                  <input type="text" name="location_number" value={currentLocation.location_number || ''} onChange={handleLocationInputChange} required />
                </div>
                <div className="form-group">
                  <label>Store ID</label>
                  <input type="text" name="store_id" value={currentLocation.store_id || ''} onChange={handleLocationInputChange} required />
                </div>
                <div className="form-group">
                  <label>Location Name</label>
                  <input type="text" name="location_name" value={currentLocation.location_name || ''} onChange={handleLocationInputChange} />
                </div>
                <div className="form-group">
                    <label>Store Manager</label>
                    <select
                        name="store_manager"
                        value={currentLocation.store_manager || ''}
                        onChange={handleLocationInputChange}
                    >
                        <option value="">Select a Manager</option>
                        {managerOptions.map(employee => (
                            <option key={employee.id} value={employee.name}>
                                {employee.name}{employee.status !== 'Active' ? ' (Inactive)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Store Phone</label>
                    <input 
                      type="tel" 
                      name="store_phone_number" 
                      value={currentLocation.store_phone_number || ''} 
                      onChange={handleLocationInputChange} 
                      autoComplete="tel"
                      maxLength="14"
                      placeholder="(XXX) XXX-XXXX"
                    />
                </div>
                <div className="form-group">
                    <label>Store Fax</label>
                    <input 
                      type="tel" 
                      name="store_fax_number" 
                      value={currentLocation.store_fax_number || ''} 
                      onChange={handleLocationInputChange}
                      maxLength="14"
                      placeholder="(XXX) XXX-XXXX"
                    />
                </div>
                <div className="form-group">
                  <label>Address 1</label>
                  <input type="text" name="address_1" value={currentLocation.address_1 || ''} onChange={handleLocationInputChange} autoComplete="address-line1" />
                </div>
                <div className="form-group">
                  <label>Address 2</label>
                  <input type="text" name="address_2" value={currentLocation.address_2 || ''} onChange={handleLocationInputChange} autoComplete="address-line2" />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input type="text" name="city" value={currentLocation.city || ''} onChange={handleLocationInputChange} autoComplete="address-level2" />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <select name="state" value={currentLocation.state || ''} onChange={handleLocationInputChange} autoComplete="address-level1">
                    <option value="" disabled>Select a State</option>
                    {usStates.map(state => <option key={state.abbreviation} value={state.name}>{`${state.name} (${state.abbreviation})`}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Zip Code</label>
                  <input type="text" name="zip_code" value={currentLocation.zip_code || ''} onChange={handleLocationInputChange} autoComplete="postal-code" />
                </div>
                 <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={currentLocation.status || ''} onChange={handleLocationInputChange}>
                        {locationStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                    <button type="submit" className="submit-button">Save Location</button>
                    {isEditing && (
                        <button type="button" className="action-button-delete" onClick={() => handleDelete(currentLocation.id)}>
                            Delete Location
                        </button>
                    )}
                </div>
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

// --- MAIN COMPONENT ---

function ClientDetails() {
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);
  const [canDelete, setCanDelete] = useState(false);
  const [activeTab, setActiveTab] = useState('REIN Client');
  const [locationCounts, setLocationCounts] = useState({});

  const tabs = ['REIN Client', 'EIN Client', 'Payroll Only', 'Other Statuses'];

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [fetchedClients, allLocations] = await Promise.all([
        getClients(),
        getAllLocations()
    ]);

    const counts = allLocations.reduce((acc, loc) => {
        acc[loc.client_id] = (acc[loc.client_id] || 0) + 1;
        return acc;
    }, {});
    setLocationCounts(counts);

    setClients(fetchedClients);

    const totalClients = fetchedClients.length;
    const totalLocations = allLocations.length;
    const activeClients = fetchedClients.filter(c => c.status === 'Active');
    const reinClients = activeClients.filter(c => c.service_group === 'REIN Client').length;
    const einClients = activeClients.filter(c => c.service_group === 'EIN Client').length;
    const payrollClients = activeClients.filter(c => c.service_group === 'Payroll Only').length;

    let activeReinLocations = 0;
    let activeEinLocations = 0;

    activeClients.forEach(client => {
      const count = counts[client.id] || 0;
      if (client.service_group === 'REIN Client') activeReinLocations += count;
      if (client.service_group === 'EIN Client') activeEinLocations += count;
    });

    let biWeekly1Locations = 0;
    let biWeekly2Locations = 0;

    fetchedClients.forEach(client => {
      const count = counts[client.id] || 0;
      if (client.pay_period === 'Weekly') {
        biWeekly1Locations += count;
        biWeekly2Locations += count;
      } else if (client.pay_period === 'Bi-Weekly 1') {
        biWeekly1Locations += count;
      } else if (client.pay_period === 'Bi-Weekly 2') {
        biWeekly2Locations += count;
      }
    });

    setStats({ totalClients, totalLocations, activeReinLocations, activeEinLocations, rein_clients: reinClients, ein_clients: einClients, payroll_clients: payrollClients, biWeekly1Locations, biWeekly2Locations });

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredClients = useMemo(() => {
    const sortedClients = [...clients].sort((a, b) => a.company_name.localeCompare(b.company_name));
    if (activeTab === 'Other Statuses') {
      return sortedClients.filter(client => client.status !== 'Active');
    }
    return sortedClients.filter(client => client.service_group === activeTab && client.status === 'Active');
  }, [clients, activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('tax_')) {
      const field = name.substring(4); // Correctly gets the rest of the string after "tax_"
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
    setCurrentClient(prev => ({ ...prev, franchisee_owner: [...(currentClient.franchisee_owner || []), ''] }));
  };

  const removeOwnerField = (index) => {
    const updatedOwners = (currentClient.franchisee_owner || []).filter((_, i) => i !== index);
    setCurrentClient(prev => ({ ...prev, franchisee_owner: updatedOwners }));
  };

  const handleOpenForm = async (client = null) => {
    setIsEditing(!!client);

    if (client) {
      let ownerArray = Array.isArray(client.franchisee_owner)
        ? client.franchisee_owner
        : [client.franchisee_owner || ''];

      if (ownerArray.length === 0 || (ownerArray.length === 1 && !ownerArray[0])) {
        ownerArray = [''];
      }
      setCurrentClient({ ...client, franchisee_owner: ownerArray });
      const locations = await getLocationsForClient(client.id);
      const employees = await getEmployees();
      const clientEmployees = employees.filter(employee => employee.client_id === client.id);
      setCanDelete(locations.length === 0 && clientEmployees.length === 0);

    } else {
      setCurrentClient({
        company_name: '', ein: '', service_group: 'REIN Client', notes: '', franchisee_owner: [''], company_email: '', website: '', status: 'Active',
        pay_period: 'Weekly',
        tax_info: { 
            state: '', sui_number: '', local_tax: '', 
            futa_rate: '', suta_account_number: '', suta_wage_limit: '', suta_rate: '', sitw_account_number: '' 
        }
      });
      setCanDelete(false);
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
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
        if (window.confirm('This will permanently delete the client and all associated data. Are you absolutely sure?')) {
            const success = await deleteClient(id);
            if (success) {
                setViewingClient(null);
                fetchData();
                handleCloseForm();
            } else {
                alert("Failed to delete client.");
            }
        }
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
              <StatCard title="Total Clients" value={stats.totalClients || 0} />
              <StatCard title="Total Locations" value={stats.totalLocations || 0} />
              <StatCard title="Active REIN Locations" value={stats.activeReinLocations || 0} />
              <StatCard title="Active EIN Locations" value={stats.activeEinLocations || 0} />
              <StatCard title="Bi-Weekly 1 Locations" value={stats.biWeekly1Locations || 0} />
              <StatCard title="Bi-Weekly 2 Locations" value={stats.biWeekly2Locations || 0} />
          </div>
          <ServiceGroupGlossary />
        </div>
        <div>
          <div className="tabs-container">
            {tabs.map(tab => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="client-cards-container">
            {filteredClients.map(client => (
              <div key={client.id} className="client-card">
                <h3>{client.company_name}</h3>
                <p>
                  <strong>Owner(s): </strong>
                  {(client.franchisee_owner && client.franchisee_owner.length > 0) ? client.franchisee_owner.join(', ') : 'N/A'}
                </p>
                <p><strong>Locations:</strong> {locationCounts[client.id] || 0}</p>
                <button className="action-button-small" onClick={() => setViewingClient(client)}>
                  View Details
                </button>
              </div>
            ))}
            {filteredClients.length === 0 && (
              <p>No clients match the current filter.</p>
            )}
          </div>
        </div>
      </div>

      {viewingClient && (
        <Modal onClose={() => setViewingClient(null)} size="large">
          <div className="client-details-header">
              <h4>{viewingClient.company_name}</h4>
              <button className="action-button action-button-small" onClick={() => {
                setViewingClient(null);
                handleOpenForm(viewingClient);
              }}>Edit Client</button>
          </div>
          <div className="client-details-grid">
            <div>
              <strong>Service Group:</strong>
              <p>{viewingClient.service_group || 'N/A'}</p>
            </div>
            <div>
              <strong>EIN:</strong>
              <p>{viewingClient.ein || 'N/A'}</p>
            </div>
            <div>
              <strong>Status:</strong>
              <p>{viewingClient.status || 'N/A'}</p>
            </div>
            <div>
              <strong>State:</strong>
              <p>{viewingClient.tax_info?.state || 'N/A'}</p>
            </div>
            <div>
              <strong>SUI Number:</strong>
              <p>{viewingClient.tax_info?.sui_number || 'N/A'}</p>
            </div>
            <div>
              <strong>Pay Period:</strong>
              <p>{viewingClient.pay_period || 'N/A'}</p>
            </div>
          </div>
          <LocationManager client={viewingClient} onLocationsUpdate={fetchData} />
        </Modal>
      )}

      {showForm && currentClient && (
        <Modal onClose={handleCloseForm} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{isEditing ? 'Edit Client' : 'Add New Client'}</h3>
            {isEditing && canDelete && (
                <button
                  className="action-button-delete"
                  onClick={() => handleDelete(currentClient.id)}
                  style={{ marginLeft: 'auto' }}
                >
                  Delete Client
                </button>
            )}
          </div>
          <form className="add-employee-form" onSubmit={handleSubmit}>
            <div className="settings-form-grid">
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
                <label>Status</label>
                <select name="status" value={currentClient.status || ''} onChange={handleInputChange} required>
                  <option value="" disabled>Select Status</option>
                  {clientStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Service Group</label>
                <select name="service_group" value={currentClient.service_group || ''} onChange={handleInputChange} required>
                  <option value="" disabled>Select Service Group</option>
                  {serviceGroups.map(group => <option key={group} value={group}>{group}</option>)}
                </select>
              </div>
              <div className="form-group">
                  <label>Pay Period</label>
                  <select name="pay_period" value={currentClient.pay_period || ''} onChange={handleInputChange} required>
                      {payPeriods.map(period => <option key={period} value={period}>{period}</option>)}
                  </select>
              </div>
              <div className="form-group">
                <label>State</label>
                <select name="tax_state" value={currentClient.tax_info?.state || ''} onChange={handleInputChange}>
                  <option value="" disabled>Select a State</option>
                  {usStates.map(state => <option key={state.abbreviation} value={state.name}>{`${state.name} (${state.abbreviation})`}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>State Unemployment (SUI) Number</label>
                <input type="text" name="tax_sui_number" value={currentClient.tax_info?.sui_number || ''} onChange={handleInputChange} autoComplete="off" />
              </div>
               <div className="form-group">
                <label>FUTA Rate</label>
                <input type="text" name="tax_futa_rate" value={currentClient.tax_info?.futa_rate || ''} onChange={handleInputChange} autoComplete="off" />
              </div>
              <div className="form-group">
                <label>SUTA Account Number</label>
                <input type="text" name="tax_suta_account_number" value={currentClient.tax_info?.suta_account_number || ''} onChange={handleInputChange} autoComplete="off" />
              </div>
              <div className="form-group">
                <label>SUTA Wage Limit</label>
                <input type="text" name="tax_suta_wage_limit" value={currentClient.tax_info?.suta_wage_limit || ''} onChange={handleInputChange} autoComplete="off" />
              </div>
              <div className="form-group">
                <label>SUTA Rate</label>
                <input type="text" name="tax_suta_rate" value={currentClient.tax_info?.suta_rate || ''} onChange={handleInputChange} autoComplete="off" />
              </div>
               <div className="form-group">
                <label>SITW Account Number</label>
                <input type="text" name="tax_sitw_account_number" value={currentClient.tax_info?.sitw_account_number || ''} onChange={handleInputChange} autoComplete="off" />
              </div>
              <div className="form-group">
                <label>Local Tax Details</label>
                <input type="text" name="tax_local_tax" placeholder="e.g., specific county or city tax info" value={currentClient.tax_info?.local_tax || ''} onChange={handleInputChange} autoComplete="off" />
              </div>
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
