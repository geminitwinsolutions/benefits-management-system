// src/pages/CompanySettings.js
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';

function CompanySettings() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCompany = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('company').select('*').single();
      if (error) throw error;
      setCompany(data);
    } catch (error) {
      toast.error('Could not fetch company settings.');
      console.error('Error fetching company details:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompany(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Updating settings...');
    const { id, ...updateData } = company;
    
    try {
      const { data, error } = await supabase.from('company').update(updateData).eq('id', id).select().single();
      if (error) throw error;
      setCompany(data);
      toast.success('Settings updated successfully!', { id: toastId });
    } catch (error) {
      toast.error('Failed to update settings.', { id: toastId });
      console.error('Error updating company details:', error);
    }
  };

  if (loading) {
    return <SkeletonLoader type="form" />;
  }

  // This check prevents the error. If company is null, don't render the form.
  if (!company) {
    return (
        <div className="card">
            <div className="card-header">
                <h2>Company Settings</h2>
            </div>
            <div className="card-body">
                <p>Could not load company information. Please try again.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Company Settings</h2>
      </div>
      <div className="card-body">
        <form className="add-employee-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Company Name</label>
            <input type="text" name="name" value={company.name || ''} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Tier</label>
            <input type="text" name="tier" value={company.tier || ''} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Last Login (Display Only)</label>
            <input type="text" value={company.last_login ? new Date(company.last_login).toLocaleString() : 'N/A'} readOnly disabled />
          </div>
          <button type="submit" className="submit-button">Save Changes</button>
        </form>
      </div>
    </div>
  );
}

export default CompanySettings;