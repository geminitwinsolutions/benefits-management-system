// src/components/PrimaryClientDetails.js
import React, { useState, useEffect } from 'react';
import { getPrimaryOrganization } from '../services/benefitService';
import toast from 'react-hot-toast';

function PrimaryClientDetails() {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrimaryClient() {
      setLoading(true);
      const data = await getPrimaryOrganization();
      if (data) {
        setClient(data);
      } else {
        toast.error('No primary organization is set.');
      }
      setLoading(false);
    }
    fetchPrimaryClient();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="card-header"><h2>Company Details</h2></div>
        <div className="card-body"><p>Loading...</p></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="card">
        <div className="card-header"><h2>Company Details</h2></div>
        <div className="card-body"><p>Could not load company information. Please set a primary organization in the Clients tab.</p></div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>{client.company_name}</h2>
      </div>
      <div className="card-body">
        <p><strong>EIN:</strong> {client.ein || 'N/A'}</p>
        <p><strong>Status:</strong> <span className="status-badge status-active">{client.status || 'N/A'}</span></p>
        <p><strong>Address:</strong> {client.address || 'N/A'}</p>
      </div>
    </div>
  );
}

export default PrimaryClientDetails;