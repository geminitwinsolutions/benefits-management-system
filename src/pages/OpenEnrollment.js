import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getEnrollmentPeriods,
  addEnrollmentPeriod,
  updateEnrollmentPeriod,
  getBenefitPlans,
  setPlansForEnrollmentPeriod,
  getPlansForEnrollmentPeriod
} from '../services/benefitService';
import Modal from '../components/Modal';
import OpenEnrollmentForm from '../components/OpenEnrollmentForm'; // Import the form
import toast from 'react-hot-toast';

// A sample employee for previewing the enrollment form
const sampleEmployee = {
  fullName: 'John Doe (Sample)',
  employeeId: 'PREVIEW-123',
  date_of_birth: '1988-01-15', // This makes the sample employee 37 years old
};

function OpenEnrollment() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [allBenefitPlans, setAllBenefitPlans] = useState([]);
  const [selectedBenefitIds, setSelectedBenefitIds] = useState([]);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [previewingPeriodId, setPreviewingPeriodId] = useState(null); // State for preview
  const [newPeriod, setNewPeriod] = useState({
    projected_start_date: '',
    status: 'Upcoming',
    waiting_period_days: '60'
  });

  const fetchData = useCallback(async () => {
    // ... (This function is unchanged)
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Functions for the main form (unchanged) ---
  const handleOpenForm = async (period = null) => { /* ... */ };
  const handleCloseForm = () => { /* ... */ };
  const handlePlanSelectionChange = (planId) => { /* ... */ };
  const handleFormChange = (e) => { /* ... */ };
  const handleSubmit = async (e) => { /* ... */ };
  const handleStartEnrollment = async (periodId) => { /* ... */ };
  const handleEndEnrollment = async (periodId) => { /* ... */ };
  // --- End of unchanged functions ---

  const { activePeriod, upcomingPeriods, completedPeriods } = useMemo(() => {
    // ... (This function is unchanged)
  }, [periods]);

  // Function to handle the preview submit (it just shows a message)
  const handlePreviewSubmit = () => {
    toast.success('This is a preview. No data was submitted.');
    setPreviewingPeriodId(null);
  };

  if (loading) {
    return <div className="page-container"><h1>Loading Enrollment Periods...</h1></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Enrollment Periods</h1>
        <button className="add-button" onClick={() => handleOpenForm()} disabled={!!activePeriod}>
          {activePeriod ? 'An Enrollment is Active' : 'Create New Enrollment'}
        </button>
      </div>

      {/* Active Period Card (unchanged) */}
      
      <div className="open-enrollment-layout">
        <div className="card">
          <div className="card-header blue">
            <h2>Upcoming Periods</h2>
          </div>
          <div className="card-body">
            {upcomingPeriods.length > 0 ? (
              <div className="card-list-container">
                {upcomingPeriods.map(period => (
                  <div className="info-card" key={period.id}>
                    <h3>Projected Start: {period.projected_start_date || 'N/A'}</h3>
                    <p><strong>Status:</strong> <span className={`status-badge status-${period.status.toLowerCase()}`}>{period.status}</span></p>
                    {/* ADDED PREVIEW BUTTON */}
                    <button className="action-button-small" onClick={() => setPreviewingPeriodId(period.id)} style={{marginRight: '0.5rem'}}>Preview</button>
                    <button className="action-button-small" onClick={() => handleOpenForm(period)}>Edit</button>
                    <button className="submit-button mt-4" onClick={() => handleStartEnrollment(period.id)} disabled={!!activePeriod}>
                      Activate Enrollment
                    </button>
                  </div>
                ))}
              </div>
            ) : <p>No upcoming enrollment periods scheduled.</p>}
          </div>
        </div>

        {/* Past Periods Card (unchanged) */}
      </div>
      
      {/* Modal for adding/editing a period (unchanged) */}

      {/* ADDED: Modal for the preview */}
      {previewingPeriodId && (
        <OpenEnrollmentForm
          employeeInfo={sampleEmployee}
          onClose={() => setPreviewingPeriodId(null)}
          onSubmit={handlePreviewSubmit}
          periodId={previewingPeriodId}
          isPreview={true}
        />
      )}
    </div>
  );
}

export default OpenEnrollment;