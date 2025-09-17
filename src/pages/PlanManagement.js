import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
    getCarriers, addCarrier, updateCarrier, deleteCarrier,
    getBenefitPlans, addBenefitPlanWithRates, updateBenefitPlanWithRates, deleteBenefitPlan,
    getEnrollmentPeriods
} from '../services/benefitService';
import Modal from '../components/Modal';

// --- Carrier Management Component (No changes needed) ---
const CarrierManager = ({ carriers, onUpdate, isEnrollmentActive, selectedCarrier, onSelectCarrier }) => {
    // ... This component's code remains the same as the previous version ...
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCarrier, setCurrentCarrier] = useState(null);

    const handleOpenForm = (carrier = null) => {
        setIsEditing(!!carrier);
        setCurrentCarrier(carrier || { name: '', contact_info: '', billing_schedule: 'Cross-Month' });
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setCurrentCarrier(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Saving carrier...');
        try {
            if (isEditing) {
                await updateCarrier(currentCarrier.id, currentCarrier);
            } else {
                await addCarrier(currentCarrier);
            }
            toast.success('Carrier saved successfully.', { id: toastId });
            onUpdate();
            handleCloseForm();
        } catch (error) {
            toast.error(`Failed to save carrier: ${error.message}`, { id: toastId });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this carrier? This may affect associated benefit plans.')) {
            const toastId = toast.loading('Deleting carrier...');
            try {
                await deleteCarrier(id);
                toast.success('Carrier deleted successfully.', { id: toastId });
                onUpdate();
                handleCloseForm();
            } catch (error) {
                toast.error(`Failed to delete carrier: ${error.message}`, { id: toastId });
            }
        }
    };

    return (
        <div className="card">
            <div className="page-header card-header blue">
                <h2>Carriers</h2>
                <button
                    className="add-button action-button-small"
                    onClick={() => handleOpenForm()}
                    disabled={isEnrollmentActive}>
                    Add Carrier
                </button>
            </div>
            <div className="card-body">
                <p className="form-note">Select a carrier to view and manage their benefit plans.</p>
                <table className="employees-table carrier-table">
                    <thead><tr><th>Name</th><th>Contact</th><th>Actions</th></tr></thead>
                    <tbody>
                        {carriers.map(carrier => (
                            <tr
                                key={carrier.id}
                                onClick={() => onSelectCarrier(carrier)}
                                className={selectedCarrier?.id === carrier.id ? 'selected-row' : ''}
                            >
                                <td>{carrier.name}</td>
                                <td>{carrier.contact_info}</td>
                                <td className="action-buttons-cell">
                                    <button
                                        className="action-button-small"
                                        onClick={(e) => { e.stopPropagation(); handleOpenForm(carrier); }}
                                        disabled={isEnrollmentActive}>
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showForm && (
                <Modal onClose={handleCloseForm}>
                    <h3>{isEditing ? 'Edit Carrier' : 'Add Carrier'}</h3>
                    <form className="add-employee-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Carrier Name</label>
                            <input type="text" value={currentCarrier?.name || ''} onChange={(e) => setCurrentCarrier({ ...currentCarrier, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Contact Info</label>
                            <input type="text" value={currentCarrier?.contact_info || ''} onChange={(e) => setCurrentCarrier({ ...currentCarrier, contact_info: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Billing Schedule</label>
                            <select name="billing_schedule" value={currentCarrier?.billing_schedule || 'Cross-Month'} onChange={(e) => setCurrentCarrier({ ...currentCarrier, billing_schedule: e.target.value })}>
                                <option value="Cross-Month">Cross-Month</option>
                                <option value="Same-Month">Same-Month</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                            <button type="submit" className="submit-button">Save</button>
                            {isEditing && (
                                <button type="button" className="action-button-delete" onClick={() => handleDelete(currentCarrier.id)}>
                                    Delete
                                </button>
                            )}
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};


// --- Benefit Plan Management Component (Refactored for UI and Bug Fix) ---
const PlanManager = ({ plans, selectedCarrier, onUpdate, isEnrollmentActive }) => {
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [currentRates, setCurrentRates] = useState([]);

    const handleOpenForm = (plan = null) => {
        setIsEditing(!!plan);
        if (plan) {
            setCurrentPlan({
                id: plan.id,
                plan_name: plan.plan_name,
                plan_type: plan.plan_type,
                carrier_id: plan.carrier_id,
                description: plan.description,
                rate_model: plan.rate_model,
                client_margin: plan.client_margin,
            });
            setCurrentRates(plan.benefit_rates[0]?.rates || []);
        } else {
            setCurrentPlan({
                plan_name: '',
                plan_type: 'Medical',
                carrier_id: selectedCarrier?.id || '',
                description: '',
                rate_model: 'FLAT',
                client_margin: 0,
            });
            setCurrentRates([{ coverage_level: 'Employee Only', carrier_rate: 0 }]);
        }
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setCurrentPlan(null);
        setCurrentRates([]);
    };

    const handlePlanChange = (e) => {
        const { name, value } = e.target;
        setCurrentPlan(prev => ({ ...prev, [name]: value }));
        
        if (name === 'rate_model') {
            switch (value) {
                case 'AGE_BANDED_TIER':
                    setCurrentRates([{ age_band: '18-24', rates: [{ amount: 10000, premium: 0 }] }]);
                    break;
                case 'FLAT':
                    setCurrentRates([{ coverage_level: 'Employee Only', carrier_rate: 0 }]);
                    break;
                case 'AGE_BANDED':
                    setCurrentRates([{ min_age: 18, max_age: 24, carrier_rate: 0 }]);
                    break;
                default:
                    setCurrentRates([]);
                    break;
            }
        }
    };
    
    // --- BUG FIX ---
    // Handles changes for the complex AGE_BANDED_TIER model
    const handleTieredRateChange = (bandIndex, rateIndex, field, value) => {
        const newBands = [...currentRates];
        const numValue = parseFloat(value);
        newBands[bandIndex].rates[rateIndex][field] = isNaN(numValue) ? 0 : numValue;
        setCurrentRates(newBands);
    };

    const handleAgeBandChange = (bandIndex, value) => {
        const newBands = [...currentRates];
        newBands[bandIndex].age_band = value;
        setCurrentRates(newBands);
    };
    
    const addRateBand = () => setCurrentRates([...currentRates, { age_band: '', rates: [{ amount: 0, premium: 0 }] }]);
    const addRateToBand = (bandIndex) => {
        const newBands = [...currentRates];
        newBands[bandIndex].rates.push({ amount: 0, premium: 0 });
        setCurrentRates(newBands);
    };
    const removeRateBand = (bandIndex) => setCurrentRates(currentRates.filter((_, i) => i !== bandIndex));
    const removeRateFromBand = (bandIndex, rateIndex) => {
        const newBands = [...currentRates];
        newBands[bandIndex].rates = newBands[bandIndex].rates.filter((_, i) => i !== rateIndex);
        setCurrentRates(newBands);
    };
    // --- END BUG FIX & CHANGE ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Saving plan...');
        try {
            const planData = { ...currentPlan };
            delete planData.id;
            
            if (isEditing) {
                await updateBenefitPlanWithRates(currentPlan.id, planData, currentRates);
            } else {
                await addBenefitPlanWithRates(planData, currentRates);
            }
            toast.success('Plan saved successfully.', { id: toastId });
            onUpdate();
            handleCloseForm();
        } catch (error) {
            toast.error(`Failed to save plan: ${error.message}`, { id: toastId });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this benefit plan?')) {
            const toastId = toast.loading('Deleting plan...');
            try {
                await deleteBenefitPlan(id);
                toast.success('Plan deleted.', { id: toastId });
                onUpdate();
                handleCloseForm();
            } catch (error) {
                toast.error(`Failed to delete plan: ${error.message}`, { id: toastId });
            }
        }
    };

    const getPlanCostDisplay = (plan) => {
      if (!plan.rate_model) return 'N/A';
      return plan.rate_model.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    
    // --- UI REFACTOR ---
    // Renders a much cleaner, table-based UI for complex rate structures
    const renderRateInputs = () => {
        if (currentPlan?.rate_model !== 'AGE_BANDED_TIER') {
            // Logic for FLAT and AGE_BANDED can be simplified or kept as is
            return <p>Rate model not supported in this view yet.</p>;
        }

        return (
            <div className="rate-input-container">
                {currentRates.map((band, bandIndex) => (
                    <div key={bandIndex} className="age-band-group">
                        <div className="age-band-header">
                            <input
                                type="text"
                                placeholder="Age Band (e.g., 18-24)"
                                value={band.age_band || ''}
                                onChange={(e) => handleAgeBandChange(bandIndex, e.target.value)}
                            />
                            <button type="button" onClick={() => removeRateBand(bandIndex)} className="action-button-delete action-button-small">Remove Band</button>
                        </div>
                        <table className="simple-table">
                            <thead>
                                <tr>
                                    <th>Benefit Amount ($)</th>
                                    <th>Premium</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {band.rates.map((rate, rateIndex) => (
                                    <tr key={rateIndex}>
                                        <td>
                                            <input
                                                type="number"
                                                value={rate.amount || ''}
                                                onChange={(e) => handleTieredRateChange(bandIndex, rateIndex, 'amount', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={rate.premium || ''}
                                                onChange={(e) => handleTieredRateChange(bandIndex, rateIndex, 'premium', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <button type="button" onClick={() => removeRateFromBand(bandIndex, rateIndex)} className="action-button-delete action-button-small">X</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button type="button" onClick={() => addRateToBand(bandIndex)} className="action-button-small" style={{marginTop: '10px'}}>+ Add Rate</button>
                    </div>
                ))}
                <button type="button" onClick={addRateBand} className="action-button" style={{marginTop: '10px'}}>+ Add Age Band</button>
            </div>
        );
    };
    
    if (!selectedCarrier) {
        return null;
    }

    return (
        <div className="card" style={{marginTop: '1.5rem'}}>
            <div className="page-header card-header blue">
                <h2>Benefit Plans for {selectedCarrier.name}</h2>
                <button className="add-button action-button-small" onClick={() => handleOpenForm()} disabled={isEnrollmentActive}>Add Plan</button>
            </div>
            <div className="card-body">
                <table className="employees-table">
                    <thead><tr><th>Plan Name</th><th>Type</th><th>Cost Model</th><th>Actions</th></tr></thead>
                    <tbody>
                        {plans.map(plan => (
                            <tr key={plan.id}>
                                <td>{plan.plan_name}</td>
                                <td>{plan.plan_type}</td>
                                <td>{getPlanCostDisplay(plan)}</td>
                                <td className="action-buttons-cell">
                                    <button className="action-button-small" onClick={() => handleOpenForm(plan)} disabled={isEnrollmentActive}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showForm && (
                <Modal onClose={handleCloseForm} size="large">
                    <h3>{isEditing ? 'Edit Benefit Plan' : 'Add Benefit Plan'}</h3>
                    <form className="add-employee-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Plan Name</label>
                            <input type="text" name="plan_name" value={currentPlan?.plan_name || ''} onChange={handlePlanChange} required />
                        </div>
                        <div className="form-group">
                            <label>Plan Type</label>
                            <select name="plan_type" value={currentPlan?.plan_type || ''} onChange={handlePlanChange}>
                                <option>Medical</option><option>Dental</option><option>Vision</option><option>Life</option><option>Disability</option><option>Critical Illness</option><option>Other</option>
                            </select>
                        </div>
                         <div className="form-group">
                            <label>Rate Model</label>
                            <select name="rate_model" value={currentPlan?.rate_model || ''} onChange={handlePlanChange}>
                                <option value="FLAT">Flat Rate</option>
                                <option value="AGE_BANDED">Age-Banded</option>
                                <option value="AGE_BANDED_TIER">Age-Banded & Tiered</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Client Margin (%)</label>
                            <input type="number" step="0.01" name="client_margin" value={currentPlan?.client_margin || 0} onChange={handlePlanChange} required />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea name="description" value={currentPlan?.description || ''} onChange={handlePlanChange} />
                        </div>
                        <div className="form-group">
                            <label>Rates</label>
                            {renderRateInputs()}
                        </div>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                            <button type="submit" className="submit-button">Save Plan</button>
                            {isEditing && (
                                <button type="button" className="action-button-delete" onClick={() => handleDelete(currentPlan.id)}>
                                    Delete Plan
                                </button>
                            )}
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

// --- Main Page Component ---
const PlanManagement = () => {
    const [carriers, setCarriers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEnrollmentActive, setIsEnrollmentActive] = useState(false);
    const [selectedCarrier, setSelectedCarrier] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const toastId = toast.loading('Fetching data...');
        try {
            const [carrierData, planData, enrollmentPeriods] = await Promise.all([getCarriers(), getBenefitPlans(), getEnrollmentPeriods()]);
            
            setCarriers(carrierData);
            setPlans(planData);
            
            const activePeriod = enrollmentPeriods.find(p => p.status === 'Active');
            setIsEnrollmentActive(!!activePeriod);

            // If a carrier was selected, keep it selected after refetch
            if(selectedCarrier) {
                setSelectedCarrier(carrierData.find(c => c.id === selectedCarrier.id));
            }
            
            toast.dismiss(toastId);
        } catch (error) {
            toast.error('Failed to fetch data.', { id: toastId });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSelectCarrier = (carrier) => {
        setSelectedCarrier(carrier);
    };

    const plansForSelectedCarrier = selectedCarrier ? plans.filter(p => p.carrier_id === selectedCarrier.id) : [];

    if (loading) {
        return <div className="page-container"><h1>Loading...</h1></div>;
    }
    
    return (
        <div className="page-container">
            <h1>Plan & Carrier Management</h1>
            <p>
                Manage insurance carriers and the benefit plans they offer. This section is only editable 
                when an **Open Enrollment** period is not active.
            </p>
            {isEnrollmentActive && (
              <div className="form-note" style={{borderColor: 'var(--warning-color)', color: 'var(--warning-color)'}}>
                <p style={{margin: 0}}><b>Plan management is locked.</b> Please end the active Open Enrollment period to add or edit plans and carriers.</p>
              </div>
            )}
            <div style={{marginTop: '1.5rem'}}>
                <CarrierManager 
                    carriers={carriers} 
                    onUpdate={fetchData} 
                    isEnrollmentActive={isEnrollmentActive}
                    selectedCarrier={selectedCarrier}
                    onSelectCarrier={handleSelectCarrier}
                />
                <PlanManager 
                    plans={plansForSelectedCarrier} 
                    selectedCarrier={selectedCarrier}
                    carriers={carriers}
                    onUpdate={fetchData} 
                    isEnrollmentActive={isEnrollmentActive} 
                />
            </div>
        </div>
    );
};

export default PlanManagement;