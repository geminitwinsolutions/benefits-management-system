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
        setShowForm(false);
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
    <div className={`page-container ${isDetailView ? 'open-enrollment-grid-detail' : 'open-enrollment-grid'}`}>
      <div className="open-enrollment-main">
        {isDetailView ? (
          <div>
            {/* The main content area is empty in detail view */}
          </div>
        ) : (
          <>
            <h1 class="text-3xl font-bold text-primary mb-6">Upcoming Enrollment Periods</h1>
            <p class="text-gray-600 mb-6">These are future enrollments you can begin planning and tracking.</p>

            <div className="client-details-layout">
              {upcomingEnrollments.map(period => (
                <div className="info-card" key={period.id}>
                  <h2>{period.status} Enrollment</h2>
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
            
            <h1 class="text-3xl font-bold text-primary mt-8 mb-6">Past Enrollment Periods</h1>
            <div className="client-details-layout">
              {periods.filter(p => p.status === 'Completed').map(period => (
                <div className="info-card" key={period.id}>
                  <h2>{period.status} Enrollment</h2>
                  <p><strong>Start Date:</strong> {period.start_date || 'N/A'}</p>
                  <p><strong>End Date:</strong> {period.end_date || 'N/A'}</p>
                  <p><strong>Status:</strong> <span className={`status-badge status-${period.status.toLowerCase()}`}>{period.status}</span></p>
                  <p><strong>Progress:</strong> {period.enrollment_progress}%</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="open-enrollment-sidebar">
        {activeEnrollment && (
          <div className="info-card">
            {isDetailView ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Active Enrollment Details</h2>
                  <button onClick={() => setIsDetailView(false)} className="text-gray-500 hover:text-primary transition-colors">
                    &larr; Return to Overview
                  </button>
                </div>
                {/* Detailed view content */}
                <p><strong>Start Date:</strong> {activeEnrollment.start_date || 'N/A'}</p>
                <p><strong>End Date:</strong> {activeEnrollment.end_date || 'N/A'}</p>
                <p><strong>Status:</strong> <span className={`status-badge status-${activeEnrollment.status.toLowerCase()}`}>{activeEnrollment.status}</span></p>
                <p><strong>Progress:</strong> {activeEnrollment.enrollment_progress}%</p>
                <button className="add-button w-full mt-4 bg-red-500 hover:bg-red-600" onClick={() => handleEndEnrollment(activeEnrollment.id)}>
                  End Enrollment
                </button>
              </>
            ) : (
              <>
                <h2>Active Enrollment</h2>
                <p><strong>Start Date:</strong> {activeEnrollment.start_date || 'N/A'}</p>
                <p><strong>End Date:</strong> {activeEnrollment.end_date || 'N/A'}</p>
                <button onClick={() => setIsDetailView(true)} className="add-button w-full mt-4">
                  Show Details
                </button>
              </>
            )}
          </div>
        )}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Enrollment Setup</h2>
          <button className="add-button w-full" onClick={() => setShowForm(true)} disabled={!!activeEnrollment}>
            Create New Enrollment
          </button>
        </div>
      </div>
      
      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h3>Set Enrollment Dates</h3>
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
