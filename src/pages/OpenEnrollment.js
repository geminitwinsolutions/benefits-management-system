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
import OpenEnrollmentForm from '../components/OpenEnrollmentForm';
import toast from 'react-hot-toast';

const sampleEmployee = {
  fullName: 'John Doe (Sample)',
  employeeId: 'PREVIEW-123',
  date_of_birth: '1988-01-15',
};

function OpenEnrollment() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [allBenefitPlans, setAllBenefitPlans] = useState([]);
  const [selectedBenefitIds, setSelectedBenefitIds] = useState([]);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [previewingPeriodId, setPreviewingPeriodId] = useState(null);
  const [newPeriod, setNewPeriod] = useState({
    projected_start_date: '',
    status: 'Upcoming',
    waiting_period_days: '60'
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedPeriods, allPlans] = await Promise.all([
        getEnrollmentPeriods(),
        getBenefitPlans()
      ]);
      setPeriods(fetchedPeriods);
      setAllBenefitPlans(allPlans);
    } catch (error) {
        toast.error('Failed to load enrollment data.');
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenForm = async (period = null) => {
    setShowAddForm(true);
    if (period) {
      setEditingPeriod(period);
      setNewPeriod({
        projected_start_date: period.projected_start_date,
        status: period.status,
        waiting_period_days: period.waiting_period_days
      });
      const existingPlans = await getPlansForEnrollmentPeriod(period.id);
      setSelectedBenefitIds(existingPlans.map(p => p.id));
    } else {
      setEditingPeriod(null);
      setNewPeriod({
        projected_start_date: '',
        status: 'Upcoming',
        waiting_period_days: '60'
      });
      setSelectedBenefitIds([]);
    }
  };
  
  const handleCloseForm = () => {
      setShowAddForm(false);
      setEditingPeriod(null);
      setSelectedBenefitIds([]);
  }

  const handlePlanSelectionChange = (planId) => {
    setSelectedBenefitIds(prev =>
      prev.includes(planId)
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    );
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewPeriod(prev => ({ ...prev, [name]: value }));
  };

  // CORRECTED FUNCTION
  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Saving enrollment period...');
    
    try {
        let periodResponse;
        if (editingPeriod) {
          const { id, ...updateData } = { ...editingPeriod, ...newPeriod };
          periodResponse = await updateEnrollmentPeriod(id, updateData);
        } else {
          periodResponse = await addEnrollmentPeriod(newPeriod);
        }

        if (periodResponse && periodResponse.id) {
            // Corrected from periodResponse[0].id
            await setPlansForEnrollmentPeriod(periodResponse.id, selectedBenefitIds);
            toast.success('Enrollment period saved!', { id: toastId });
            fetchData();
            handleCloseForm();
        } else {
            throw new Error('Failed to create or update the enrollment period.');
        }
    } catch(error) {
        toast.error(`Error: ${error.message}`, { id: toastId });
    }
  };
  
  const handleStartEnrollment = async (periodId) => {
    if (window.confirm("Are you sure you want to activate this enrollment period? This will set its start and end dates and make it the active period.")) {
      const updatedPeriod = await updateEnrollmentPeriod(periodId, { 
        status: 'Active', 
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
      });
      if (updatedPeriod) {
        setPeriods(periods.map(p => p.id === updatedPeriod.id ? updatedPeriod : p));
        toast.success("Enrollment has been successfully activated!");
      }
    }
  };
  
  const handleEndEnrollment = async (periodId) => {
    if (window.confirm("Are you sure you want to end this enrollment period? This action cannot be undone.")) {
      const updatedPeriod = await updateEnrollmentPeriod(periodId, { status: 'Completed' });
      if (updatedPeriod) {
        setPeriods(periods.map(p => p.id === updatedPeriod.id ? updatedPeriod : p));
        toast.success("Enrollment has been successfully ended.");
      }
    }
  };

  const { activePeriod, upcomingPeriods, completedPeriods } = useMemo(() => {
    const active = periods.find(p => p.status === 'Active') || null;
    const upcoming = periods.filter(p => p.status === 'Upcoming').sort((a, b) => new Date(a.projected_start_date) - new Date(b.projected_start_date));
    const completed = periods.filter(p => p.status === 'Completed').sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    return { activePeriod: active, upcomingPeriods: upcoming, completedPeriods: completed };
  }, [periods]);

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

      {activePeriod && (
        <div className="card active-enrollment-card">
          <div className="card-header green">
            <h3>Active Enrollment Period</h3>
          </div>
          <div className="card-body">
            <p><strong>Start Date:</strong> {activePeriod.start_date || 'N/A'}</p>
            <p><strong>End Date:</strong> {activePeriod.end_date || 'N/A'}</p>
            <p><strong>Progress:</strong> {activePeriod.enrollment_progress || 0}%</p>
            <button className="action-button-delete mt-4" onClick={() => handleEndEnrollment(activePeriod.id)}>
              End Enrollment Period
            </button>
          </div>
        </div>
      )}

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
                    <p><strong>Status:</strong> <span className={`status-badge status-${(period.status || '').toLowerCase()}`}>{period.status || 'N/A'}</span></p>
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

        <div className="card">
          <div className="card-header">
            <h2>Past Periods</h2>
          </div>
          <div className="card-body">
            {completedPeriods.length > 0 ? (
              <div className="card-list-container">
                {completedPeriods.map(period => (
                  <div className="info-card" key={period.id}>
                    <h3>{new Date(period.start_date).getFullYear()} Enrollment</h3>
                    <p><strong>Period:</strong> {period.start_date || 'N/A'} to {period.end_date || 'N/A'}</p>
                    <p><strong>Status:</strong> <span className={`status-badge status-${(period.status || '').toLowerCase()}`}>{period.status || 'N/A'}</span></p>
                    <p><strong>Final Progress:</strong> {period.enrollment_progress || 0}%</p>
                  </div>
                ))}
              </div>
            ) : <p>No completed enrollment periods.</p>}
          </div>
        </div>
      </div>
      
      {showAddForm && (
        <Modal onClose={handleCloseForm} size="large">
          <h3>{editingPeriod ? 'Edit' : 'Create'} Enrollment Period</h3>
          <form className="add-employee-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Projected Start Date</label>
              <input type="date" name="projected_start_date" value={newPeriod.projected_start_date} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label>Waiting Period (in days)</label>
              <input 
                type="number" 
                name="waiting_period_days" 
                value={newPeriod.waiting_period_days} 
                onChange={handleFormChange} 
                required 
                placeholder="e.g., 60"
              />
            </div>
             <div className="form-group">
                <label>Benefit Plans for this Period</label>
                <p className="form-note">Select all benefit plans that should be available to employees during this enrollment period.</p>
                <div className="permissions-grid">
                    {allBenefitPlans.map(plan => (
                        <label key={plan.id}>
                            <input
                                type="checkbox"
                                checked={selectedBenefitIds.includes(plan.id)}
                                onChange={() => handlePlanSelectionChange(plan.id)}
                            />
                            {plan.plan_name} ({plan.plan_type})
                        </label>
                    ))}
                </div>
            </div>
            <button type="submit" className="submit-button">
              Save Period
            </button>
          </form>
        </Modal>
      )}

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