// src/pages/CompanySettings.js
import React, { useState, useEffect, useCallback } from 'react';
import { getCompany, updateCompany } from '../services/benefitService'; // Using benefitService now
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';
import { supabase } from '../supabase';

function CompanySettings() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCompany = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCompany();
      setCompany(data || { name: '', tier: 'Gold', phone: '', address: '' }); // Provide a default structure
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
        const formattedValue = formatPhoneNumber(value);
        setCompany(prev => ({ ...prev, [name]: formattedValue }));
    } else {
        setCompany(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Updating settings...');
    
    try {
        let updatedCompany;
        if (company.id) {
            updatedCompany = await updateCompany(company);
        } else {
            // If there's no ID, it's a new record
            const { data, error } = await supabase.from('company').insert([company]).select().single();
            if (error) throw error;
            updatedCompany = data;
        }
      setCompany(updatedCompany);
      toast.success('Settings updated successfully!', { id: toastId });
    } catch (error) {
      toast.error('Failed to update settings.', { id: toastId });
      console.error('Error updating company details:', error);
    }
  };

  if (loading) {
    return <SkeletonLoader type="form" />;
  }

  return (
    <div className="card">
      <div className="card-header violet">
        <h2>Company Settings</h2>
      </div>
      <div className="card-body">
        <form className="add-employee-form" onSubmit={handleSubmit}>
          <div className="settings-form-grid">
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" name="name" value={company.name || ''} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Tier</label>
              <input type="text" name="tier" value={company.tier || ''} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                value={company.phone || ''} 
                onChange={handleInputChange} 
                maxLength="14"
                placeholder="(XXX) XXX-XXXX"
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input type="text" name="address" value={company.address || ''} onChange={handleInputChange} />
            </div>
          </div>
          <button type="submit" className="submit-button" style={{ marginTop: '1rem' }}>Save Changes</button>
        </form>
      </div>
    </div>
  );
}

export default CompanySettings;