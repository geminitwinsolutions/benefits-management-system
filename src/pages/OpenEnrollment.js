import React, { useState, useEffect } from 'react';
import { getEnrollmentPeriods, addEnrollmentPeriod, updateEnrollmentPeriod } from '../services/benefitService';
import Modal from '../components/Modal';

function OpenEnrollment() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newPeriod, setNewPeriod] = useState({ 
    projected_start_date: '', 
    status: 'Upcoming' 
  });
  const [isDetailView, setIsDetailView] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false); // Fix: Added missing state for the add form

  useEffect(() => {
    async function fetchPeriods() {
      const fetchedPeriods = await getEnrollmentPeriods();
      setPeriods(fetchedPeriods);
      setLoading(false);
    }
    fetchPeriods();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewPeriod(prev => ({ ...prev, [name]: value }));
  };

  const handleStartEnrollment = async (periodId) => {
    const updatedPeriod = await updateEnrollmentPeriod(periodId, { 
      status: 'Active', 
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0]
    });
    if (updatedPeriod) {
      setPeriods(periods.map(p => p.id === updatedPeriod.id ? updatedPeriod : p));
      alert("Enrollment has been successfully activated!");
    }
  };
  
  const handleEndEnrollment = async (periodId) => {
    const updatedPeriod = await updateEnrollmentPeriod(periodId, { status: 'Completed' });
    if (updatedPeriod) {
      setPeriods(periods.map(p => p.id === updatedPeriod.id ? updatedPeriod : p));
      alert("Enrollment has been successfully ended.");
    }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      const addedPeriod = await addEnrollmentPeriod(newPeriod);
      if (addedPeriod) {
        setPeriods(prevPeriods => [...prevPeriods, addedPeriod]);
        setShowAddForm(false);
        setNewPeriod({ projected_start_date: '', status: 'Upcoming' });
      }
    };

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading Enrollment Periods...</h1>
      </div>
    );
  }

  const activeEnrollment = periods.find(p => p.status === 'Active');
  const upcomingEnrollments = periods.filter(p => p.status === 'Upcoming');

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Enrollment Periods</h1>
        <button className="add-button" onClick={() => setShowAddForm(true)} disabled={!!activeEnrollment}>
          Create New Enrollment
        </button>
      </div>

      <div className="open-enrollment-layout">
        <div className="card">
          <div className="card-header blue">
            <h2>Upcoming Enrollment Periods</h2>
          </div>
          <div className="card-body">
            <p className="text-gray-600 mb-6">These are future enrollments you can begin planning and tracking.</p>
            <div className="card-list-container">
              {upcomingEnrollments.map(period => (
                <div className="info-card" key={period.id}>
                  <h3>{period.status} Enrollment</h3>
                  <p><strong>Projected Start:</strong> {period.projected_start_date || 'N/A'}</p>
                  <p><strong>Status:</strong> <span className={`status-badge status-${period.status.toLowerCase()}`}>{period.status}</span></p>
                  <p><strong>Progress:</strong> {period.enrollment_progress}%</p>
                  {period.status === 'Upcoming' && (
                    <button className="submit-button mt-4" onClick={() => handleStartEnrollment(period.id)}>
                      Activate Enrollment
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header blue">
            <h2>Past Enrollment Periods</h2>
          </div>
          <div className="card-body">
            <div className="card-list-container">
              {periods.filter(p => p.status === 'Completed').map(period => (
                <div className="info-card" key={period.id}>
                  <h3>{period.status} Enrollment</h3>
                  <p><strong>Start Date:</strong> {period.start_date || 'N/A'}</p>
                  <p><strong>End Date:</strong> {period.end_date || 'N/A'}</p>
                  <p><strong>Status:</strong> <span className={`status-badge status-${period.status.toLowerCase()}`}>{period.status}</span></p>
                  <p><strong>Progress:</strong> {period.enrollment_progress}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {activeEnrollment && (
          <div className="card active-enrollment-card">
            <div className="card-header green">
              <h3>Active Enrollment</h3>
            </div>
            <div className="card-body">
              <p><strong>Start Date:</strong> {activeEnrollment.start_date || 'N/A'}</p>
              <p><strong>End Date:</strong> {activeEnrollment.end_date || 'N/A'}</p>
              <button className="action-button-flag" onClick={() => handleEndEnrollment(activeEnrollment.id)}>
                End Enrollment
              </button>
            </div>
          </div>
        )}
      </div>
      
      {showAddForm && (
        <Modal onClose={() => setShowAddForm(false)}>
          <h3>Add New Enrollment</h3>
          <form className="add-employee-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Projected Start Date</label>
              <input type="date" name="projected_start_date" value={newPeriod.projected_start_date} onChange={handleFormChange} required />
            </div>
            <button type="submit" className="submit-button">
              Save Enrollment Period
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default OpenEnrollment;