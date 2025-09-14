// src/components/CompanyDetails.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

function CompanyDetails() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompany() {
      setLoading(true);
      const { data, error } = await supabase.from('company').select('*').single();
      if (error) {
        console.error('Error fetching company details:', error);
        toast.error('Could not fetch company details.');
      } else if (data) {
        setCompany(data);
      }
      setLoading(false);
    }
    fetchCompany();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="card-header"><h2>Premier Pride Details</h2></div>
        <div className="card-body"><p>Loading...</p></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="card">
        <div className="card-header"><h2>Premier Pride Details</h2></div>
        <div className="card-body"><p>Could not load company information.</p></div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Premier Pride Details</h2>
      </div>
      <div className="card-body">
        <p><strong>Name:</strong> {company.name || 'N/A'}</p>
        <p><strong>Tier:</strong> <span className="tier-badge tier-gold">{company.tier || 'N/A'}</span></p>
        <p><strong>Last Login:</strong> {company.last_login ? new Date(company.last_login).toLocaleDateString() : 'N/A'}</p>
      </div>
    </div>
  );
}

export default CompanyDetails;