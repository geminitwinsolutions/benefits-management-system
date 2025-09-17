import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
    getCarriers, addCarrier, updateCarrier, deleteCarrier,
    getBenefitPlans, addBenefitPlanWithRates, updateBenefitPlanWithRates, deleteBenefitPlan,
    getEnrollmentPeriods
} from '../services/benefitService';
import Modal from '../components/Modal';

// --- Carrier Management Component ---
const CarrierManager = ({ carriers, onUpdate, isEnrollmentActive }) => {
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
                <table className="employees-table">
                    <thead><tr><th>Name</th><th>Contact</th><th>Actions</th></tr></thead>
                    <tbody>
                        {carriers.map(carrier => (
                            <tr key={carrier.id}>
                                <td>{carrier.name}</td>
                                <td>{carrier.contact_info}</td>
                                <td className="action-buttons-cell">
                                    <button
                                        className="action-button-small"
                                        onClick={() => handleOpenForm(carrier)}
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

// --- Benefit Plan Management Component (Refactored) ---
const PlanManager = ({ plans, carriers, onUpdate, isEnrollmentActive }) => {
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
            const rates = Array.isArray(plan.benefit_rates) ? plan.benefit_rates : [];
            // Rates are stored as a single JSON object in the database to be flexible
            setCurrentRates(rates);
        } else {
            setCurrentPlan({
                plan_name: '',
                plan_type: 'Medical',
                carrier_id: carriers[0]?.id || '',
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
        // Initialize new rate structure based on plan type
        if (name === 'plan_type') {
            switch (value) {
                case 'Life':
                case 'Disability':
                    // This is a more complex nested structure for life and disability plans
                    // It will handle age bands and benefit amounts.
                    const initialRates = [
                        { age_band: '18-24', rates: [{ amount: 10000, premium: 1.12 }] },
                        { age_band: '25-29', rates: [{ amount: 10000, premium: 1.28 }] },
                    ];
                    setCurrentRates(initialRates);
                    setCurrentPlan(prev => ({ ...prev, rate_model: 'AGE_BANDED_TIER' }));
                    break;
                case 'Medical':
                case 'Dental':
                case 'Vision':
                    setCurrentRates([{ coverage_level: 'Employee Only', carrier_rate: 0 }]);
                    setCurrentPlan(prev => ({ ...prev, rate_model: 'FLAT' }));
                    break;
                default:
                    setCurrentRates([{ min_age: '', max_age: '', carrier_rate: '' }]);
                    setCurrentPlan(prev => ({ ...prev, rate_model: 'AGE_BANDED' }));
                    break;
            }
        }
    };
    
    // Reworked handler for the new rate structure
    const handleRateChange = (bandIndex, rateIndex, e) => {
        const { name, value, type, checked } = e.target;
        const newRates = [...currentRates];
        // Ensure the nested structure exists
        if (!newRates[bandIndex].rates[rateIndex]) {
            newRates[bandIndex].rates[rateIndex] = {};
        }
        newRates[bandIndex].rates[rateIndex][name] = type === 'checkbox' ? checked : parseFloat(value);
        setCurrentRates(newRates);
    };
    
    const addRateBand = () => {
        setCurrentRates([...currentRates, { age_band: '', rates: [{ amount: '', premium: '' }] }]);
    };

    const addRateToBand = (bandIndex) => {
        const newRates = [...currentRates];
        newRates[bandIndex].rates.push({ amount: '', premium: '' });
        setCurrentRates(newRates);
    };

    const removeRateBand = (bandIndex) => {
        setCurrentRates(currentRates.filter((_, i) => i !== bandIndex));
    };

    const removeRateFromBand = (bandIndex, rateIndex) => {
        const newRates = [...currentRates];
        newRates[bandIndex].rates.splice(rateIndex, 1);
        setCurrentRates(newRates);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Saving plan...');
        try {
            const planData = { ...currentPlan };
            delete planData.id;
            
            // Convert rates to a format suitable for DB storage (e.g., JSON string)
            const ratesDataForDb = currentRates;

            if (isEditing) {
                await updateBenefitPlanWithRates(currentPlan.id, planData, ratesDataForDb);
            } else {
                await addBenefitPlanWithRates(planData, ratesDataForDb);
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

    // Reworked render function to handle new nested rate structure
    const renderRateInputs = () => {
        const model = currentPlan?.rate_model;
        if (!model) return null;
        
        switch(model) {
            case 'FLAT':
                return (
                    <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '6px' }}>
                        {currentRates.map((rate, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                <input name="coverage_level" placeholder="Coverage Level" value={rate.coverage_level || ''} onChange={(e) => {
                                    const newRates = [...currentRates];
                                    newRates[index].coverage_level = e.target.value;
                                    setCurrentRates(newRates);
                                }} />
                                <input name="carrier_rate" type="number" placeholder="Carrier Rate" value={rate.carrier_rate || ''} onChange={(e) => {
                                    const newRates = [...currentRates];
                                    newRates[index].carrier_rate = parseFloat(e.target.value);
                                    setCurrentRates(newRates);
                                }} />
                                <button type="button" onClick={() => setCurrentRates(currentRates.filter((_, i) => i !== index))} className="action-button-delete action-button-small">X</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => setCurrentRates([...currentRates, { coverage_level: '', carrier_rate: '' }])} className="action-button-small">Add Row</button>
                    </div>
                );
            case 'AGE_BANDED':
                return (
                    <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '6px' }}>
                        {currentRates.map((rate, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                <input name="min_age" type="number" placeholder="Min Age" value={rate.min_age || ''} onChange={(e) => {
                                    const newRates = [...currentRates];
                                    newRates[index].min_age = parseFloat(e.target.value);
                                    setCurrentRates(newRates);
                                }} style={{width: '80px'}}/>
                                <input name="max_age" type="number" placeholder="Max Age" value={rate.max_age || ''} onChange={(e) => {
                                    const newRates = [...currentRates];
                                    newRates[index].max_age = parseFloat(e.target.value);
                                    setCurrentRates(newRates);
                                }} style={{width: '80px'}}/>
                                <input name="carrier_rate" type="number" placeholder="Carrier Rate" value={rate.carrier_rate || ''} onChange={(e) => {
                                    const newRates = [...currentRates];
                                    newRates[index].carrier_rate = parseFloat(e.target.value);
                                    setCurrentRates(newRates);
                                }} />
                                <button type="button" onClick={() => setCurrentRates(currentRates.filter((_, i) => i !== index))} className="action-button-delete action-button-small">X</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => setCurrentRates([...currentRates, { min_age: '', max_age: '', carrier_rate: '' }])} className="action-button-small">Add Row</button>
                    </div>
                );
            case 'AGE_BANDED_TIER':
                return (
                    <div className="rate-input-grid">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-sm text-gray-500">Age Bands</h4>
                            <button type="button" onClick={addRateBand} className="action-button-small">Add Age Band</button>
                        </div>
                        {currentRates.map((band, bandIndex) => (
                            <div key={bandIndex} className="bg-gray-100 p-4 rounded-md mb-4 border border-gray-300">
                                <div className="flex items-center mb-2">
                                    <label className="font-medium mr-2">Age Range:</label>
                                    <input type="text" placeholder="e.g., 18-24" value={band.age_band || ''} onChange={(e) => {
                                        const newRates = [...currentRates];
                                        newRates[bandIndex].age_band = e.target.value;
                                        setCurrentRates(newRates);
                                    }} className="w-full text-sm" />
                                    <button type="button" onClick={() => removeRateBand(bandIndex)} className="action-button-delete action-button-small ml-2">X</button>
                                </div>
                                <div className="flex justify-between items-center mt-2 mb-2">
                                    <h5 className="font-bold text-xs text-gray-400 uppercase">Rates</h5>
                                    <button type="button" onClick={() => addRateToBand(bandIndex)} className="action-button-small">Add Rate</button>
                                </div>
                                {band.rates.map((rate, rateIndex) => (
                                    <div key={rateIndex} className="flex gap-2 items-center mb-2">
                                        <input
                                            type="number"
                                            name="amount"
                                            placeholder="Benefit Amount (e.g., 10000)"
                                            value={rate.amount || ''}
                                            onChange={(e) => handleRateChange(bandIndex, rateIndex, e)}
                                        />
                                        <input
                                            type="number"
                                            name="premium"
                                            placeholder="Premium (e.g., 1.12)"
                                            value={rate.premium || ''}
                                            onChange={(e) => handleRateChange(bandIndex, rateIndex, e)}
                                        />
                                        <label className="text-sm flex items-center">
                                            <input
                                                type="checkbox"
                                                name="rate_per_thousand"
                                                checked={!!rate.rate_per_thousand}
                                                onChange={(e) => handleRateChange(bandIndex, rateIndex, e)}
                                                className="mr-1"
                                            />
                                            Per $1k
                                        </label>
                                        <button type="button" onClick={() => removeRateFromBand(bandIndex, rateIndex)} className="action-button-delete action-button-small">X</button>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                );
            case 'COVERAGE_TIER':
                return (
                    <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '6px' }}>
                        {currentRates.map((rate, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                <input name="min_age" type="number" placeholder="Min Age" value={rate.min_age || ''} onChange={(e) => {
                                    const newRates = [...currentRates];
                                    newRates[index].min_age = parseFloat(e.target.value);
                                    setCurrentRates(newRates);
                                }} style={{width: '80px'}}/>
                                <input name="max_age" type="number" placeholder="Max Age" value={rate.max_age || ''} onChange={(e) => {
                                    const newRates = [...currentRates];
                                    newRates[index].max_age = parseFloat(e.target.value);
                                    setCurrentRates(newRates);
                                }} style={{width: '80px'}}/>
                                <input type="number" name="carrier_rate" placeholder="Rate" value={rate.carrier_rate || ''} onChange={(e) => {
                                    const newRates = [...currentRates];
                                    newRates[index].carrier_rate = parseFloat(e.target.value);
                                    setCurrentRates(newRates);
                                }} style={{width: '80px'}}/>
                                <label><input type="checkbox" name="rate_per_thousand" checked={!!rate.rate_per_thousand} onChange={(e) => {
                                    const newRates = [...currentRates];
                                    newRates[index].rate_per_thousand = e.target.checked;
                                    setCurrentRates(newRates);
                                }} /> Per $1k</label>
                                <button type="button" onClick={() => setCurrentRates(currentRates.filter((_, i) => i !== index))} className="action-button-delete action-button-small">X</button>
                            </div>
                        ))}
                        <button type="button" onClick={() => setCurrentRates([...currentRates, { min_age: '', max_age: '', carrier_rate: '', rate_per_thousand: false }])} className="action-button-small">Add Row</button>
                    </div>
                );
            default:
                return null;
        }
    };
    
    const getPlanCostDisplay = (plan) => {
        if (!plan.benefit_rates || plan.benefit_rates.length === 0) return 'N/A';
        const rates = Array.isArray(plan.benefit_rates) ? plan.benefit_rates : [];
        if (rates.length === 0) return 'N/A';

        switch (plan.rate_model) {
            case 'FLAT':
                const firstRate = parseFloat(rates[0].carrier_rate) * (1 + (parseFloat(plan.client_margin) / 100));
                return `$${firstRate.toFixed(2)} ...`;
            case 'AGE_BANDED':
                return 'Age-Banded';
            case 'AGE_BANDED_TIER':
                return 'Age-Banded & Tiered';
            case 'COVERAGE_TIER':
                return 'By Age & Coverage';
            default:
                return 'N/A';
        }
    };
    
    return (
        <div className="card">
            <div className="page-header card-header blue">
                <h2>Benefit Plans</h2>
                <button className="add-button action-button-small" onClick={() => handleOpenForm()} disabled={isEnrollmentActive}>Add Plan</button>
            </div>
            <div className="card-body">
                <table className="employees-table">
                    <thead><tr><th>Plan Name</th><th>Type</th><th>Carrier</th><th>Cost Model</th><th>Actions</th></tr></thead>
                    <tbody>
                        {plans.map(plan => (
                            <tr key={plan.id}>
                                <td>{plan.plan_name}</td>
                                <td>{plan.plan_type}</td>
                                <td>{carriers.find(c => c.id === plan.carrier_id)?.name || 'N/A'}</td>
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
                <Modal onClose={handleCloseForm}>
                    <h3>{isEditing ? 'Edit Benefit Plan' : 'Add Benefit Plan'}</h3>
                    <form className="add-employee-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Plan Name</label>
                            <input type="text" name="plan_name" value={currentPlan?.plan_name || ''} onChange={handlePlanChange} required />
                        </div>
                        <div className="form-group">
                            <label>Plan Type</label>
                            <select name="plan_type" value={currentPlan?.plan_type || ''} onChange={handlePlanChange}>
                                <option>Medical</option>
                                <option>Dental</option>
                                <option>Vision</option>
                                <option>Life</option>
                                <option>Disability</option>
                                <option>Critical Illness</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Carrier</label>
                            <select name="carrier_id" value={currentPlan?.carrier_id || ''} onChange={handlePlanChange} required>
                                <option value="" disabled>Select a carrier</option>
                                {carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
    const [isEnrollmentActive, setIsEnrollmentActive] = useState(true);

    const fetchData = useCallback(async () => {
        const toastId = toast.loading('Fetching data...');
        try {
            const [carrierData, planData, enrollmentPeriods] = await Promise.all([getCarriers(), getBenefitPlans(), getEnrollmentPeriods()]);
            
            setCarriers(carrierData);
            setPlans(planData);
            
            const activePeriod = enrollmentPeriods.find(p => p.status === 'Active');
            setIsEnrollmentActive(!!activePeriod);
            
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
              <div className="mt-4 p-4 text-center text-orange-700 bg-orange-100 border-l-4 border-orange-500">
                <p className="font-bold">Plan management is locked.</p>
                <p>Please end the active Open Enrollment period to add or edit plans and carriers.</p>
              </div>
            )}
            <div className="plan-management-layout">
                <CarrierManager carriers={carriers} onUpdate={fetchData} isEnrollmentActive={!isEnrollmentActive} />
                <PlanManager plans={plans} carriers={carriers} onUpdate={fetchData} isEnrollmentActive={!isEnrollmentActive} />
            </div>
        </div>
    );
};

export default PlanManagement;
