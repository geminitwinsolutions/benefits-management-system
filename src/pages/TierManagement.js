import React, { useState, useEffect } from 'react';
import { getTiers, addTier } from '../services/benefitService';
import Modal from '../components/Modal';

function TierManagement() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTier, setNewTier] = useState({ name: '', level: '', benefits: '', features: '' });

  useEffect(() => {
    async function fetchTiers() {
      const tierData = await getTiers();
      setTiers(tierData);
      setLoading(false);
    }
    fetchTiers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTier(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Convert comma-separated strings to arrays
    const formattedData = {
      ...newTier,
      benefits: newTier.benefits.split(',').map(b => b.trim()),
      features: newTier.features.split(',').map(f => f.trim())
    };
    
    const addedTier = await addTier(formattedData);
    if (addedTier) {
      setTiers(prevTiers => [...prevTiers, addedTier]);
      setShowAddForm(false);
      setNewTier({ name: '', level: '', benefits: '', features: '' });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading Tiers...</h1>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Client Tier Management</h1>
        <button className="add-button" onClick={() => setShowAddForm(true)}>
          Add New Tier
        </button>
      </div>
      <p>Configure benefit and feature settings for each client tier.</p>
      
      <div className="tier-cards-container">
        {tiers.map(tier => (
          <div className="tier-card" key={tier.level}>
            <div className="card-header blue">
              <h3>{tier.name} Tier</h3>
            </div>
            <div className="card-body">
              <div className="tier-benefits">
                <h4>Included Benefits</h4>
                <ul>
                  {tier.benefits.map(benefit => <li key={benefit}>{benefit}</li>)}
                </ul>
              </div>
              <div className="tier-features">
                <h4>Plan Features</h4>
                <ul>
                  {tier.features.map(feature => <li key={feature}>{feature}</li>)}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <Modal onClose={() => setShowAddForm(false)}>
          <h3>Add New Tier</h3>
          <form className="add-employee-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tier Name</label>
              <input type="text" name="name" value={newTier.name} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Tier Level</label>
              <input type="number" name="level" value={newTier.level} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Included Benefits (comma-separated)</label>
              <textarea name="benefits" value={newTier.benefits} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Plan Features (comma-separated)</label>
              <textarea name="features" value={newTier.features} onChange={handleInputChange} required />
            </div>
            <button type="submit" className="submit-button">Save Tier</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default TierManagement;