// src/pages/ClientDetails.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  getClients, addClient, updateClient, deleteClient,
  getLocationsForClient, addLocation, updateLocation, deleteLocation,
  getClientStats // Import the new function
} from '../services/benefitService';
import Modal from '../components/Modal';

// ... (usStates constant remains the same) ...
const serviceGroups = ['REIN Client', 'EIN Client', 'Payroll Only'];
const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
    'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
    'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
    'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
    'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

// --- UPDATED: Collapsible Glossary Component ---
const ServiceGroupGlossary = () => { /* ... no changes needed here ... */ };

// --- Location Manager (No changes needed here) ---
const LocationManager = ({ client }) => { /* ... no changes needed here ... */ };

// --- NEW: Stat Card Component ---
const StatCard = ({ title, value, colorClass }) => (
  <div className={`kpi-card ${colorClass}`}>
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
    
    if (!expandedClientId && fetchedClients.length > 0) {
      setExpandedClientId(fetchedClients[0].id);
    }
    setLoading(false);
  }, [expandedClientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers remain the same ---
  const handleInputChange = (e) => { /* ... no change ... */ };
  const handleOpenForm = (client = null) => { /* ... no change ... */ };
  const handleCloseForm = () => { /* ... no change ... */ };
  const handleSubmit = async (e) => { /* ... no change ... */ };
  const handleDelete = async (id) => { /* ... no change ... */ };
  const handleToggleAccordion = (clientId) => { /* ... no change ... */ };

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

      <div className="client-dashboard-layout">
        {/* --- LEFT SIDE: STATS & GLOSSARY --- */}
        <div className="left-column">
          <div className="kpi-container">
            <StatCard title="Total Clients" value={stats.total_clients || 0} />
            <StatCard title="Total Locations" value={stats.total_locations || 0} />
            <StatCard title="REIN Clients" value={stats.rein_clients || 0} />
            <StatCard title="EIN Clients" value={stats.ein_clients || 0} />
          </div>
          <ServiceGroupGlossary />
        </div>

        {/* --- RIGHT SIDE: ACCORDION --- */}
        <div className="right-column">
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
                  {/* --- UPDATED: Full client details here --- */}
                  <div className="client-details-grid">
                    <div>
                      <strong>Franchisee/Owner:</strong>
                      <p>{client.franchisee_owner || 'N/A'}</p>
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
                  <LocationManager client={client} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <Modal onClose={handleCloseForm}>
          {/* ... Modal content is unchanged ... */}
        </Modal>
      )}
    </div>
  );
}

export default ClientDetails;