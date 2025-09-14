// src/pages/PlanManagement.js
import React, { useState, useEffect, useCallback } from 'react';
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
        if (isEditing) {
            await updateCarrier(currentCarrier.id, currentCarrier);
        } else {
            await addCarrier(currentCarrier);
        }
        onUpdate();
        handleCloseForm();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this carrier? This may affect associated benefit plans.')) {
            await deleteCarrier(id);
            onUpdate();
            handleCloseForm();
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
            setCurrentRates(rates.map(({ id, benefit_id, ...rate }) => rate));
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
        if (name === 'rate_model') {
            if (value === 'FLAT') setCurrentRates([{ coverage_level: '', carrier_rate: '' }]);
            if (value === 'AGE_BANDED') setCurrentRates([{ min_age: '', max_age: '', carrier_rate: '' }]);
            if (value === 'COVERAGE_TIER') setCurrentRates([{ min_age: '', max_age: '', carrier_rate: '', rate_per_thousand: false }]);
        }
    };

    const handleRateChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const newRates = [...currentRates];
        newRates[index][name] = type === 'checkbox' ? checked : value;
        setCurrentRates(newRates);
    };

    const addRateRow = () => {
        if (currentPlan.rate_model === 'FLAT') setCurrentRates([...currentRates, { coverage_level: '', carrier_rate: '' }]);
        if (currentPlan.rate_model === 'AGE_BANDED') setCurrentRates([...currentRates, { min_age: '', max_age: '', carrier_rate: '' }]);
        if (currentPlan.rate_model === 'COVERAGE_TIER') setCurrentRates([...currentRates, { min_age: '', max_age: '', carrier_rate: '', rate_per_thousand: false }]);
    };
    
    const removeRateRow = (index) => {
        setCurrentRates(currentRates.filter((_, i) => i !== index));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const planData = { ...currentPlan };
        delete planData.id;

        if (isEditing) {
            await updateBenefitPlanWithRates(currentPlan.id, planData, currentRates);
        } else {
            await addBenefitPlanWithRates(planData, currentRates);
        }
        onUpdate();
        handleCloseForm();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this benefit plan?')) {
            await deleteBenefitPlan(id);
            onUpdate();
            handleCloseForm();
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
            case 'COVERAGE_TIER':
                return 'By Age & Coverage';
            default:
                return 'N/A';
        }
    };
    
    const renderRateInputs = () => {
        const model = currentPlan?.rate_model;
        if (!model) return null;

        return (
            <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '6px' }}>
                {currentRates.map((rate, index) => (
                    <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                        {model === 'FLAT' && (
                            <>
                                <input name="coverage_level" placeholder="Coverage Level" value={rate.coverage_level || ''} onChange={(e) => handleRateChange(index, e)} />
                                <input name="carrier_rate" type="number" placeholder="Carrier Rate" value={rate.carrier_rate || ''} onChange={(e) => handleRateChange(index, e)} />
                            </>
                        )}
                        {model === 'AGE_BANDED' && (
                            <>
                                <input name="min_age" type="number" placeholder="Min Age" value={rate.min_age || ''} onChange={(e) => handleRateChange(index, e)} style={{width: '80px'}}/>
                                <input name="max_age" type="number" placeholder="Max Age" value={rate.max_age || ''} onChange={(e) => handleRateChange(index, e)} style={{width: '80px'}}/>
                                <input name="carrier_rate" type="number" placeholder="Carrier Rate" value={rate.carrier_rate || ''} onChange={(e) => handleRateChange(index, e)} />
                            </>
                        )}
                        {model === 'COVERAGE_TIER' && (
                             <>
                                <input name="min_age" type="number" placeholder="Min Age" value={rate.min_age || ''} onChange={(e) => handleRateChange(index, e)} style={{width: '80px'}}/>
                                <input name="max_age" type="number" placeholder="Max Age" value={rate.max_age || ''} onChange={(e) => handleRateChange(index, e)} style={{width: '80px'}}/>
                                <input name="carrier_rate" type="number" placeholder="Rate" value={rate.carrier_rate || ''} onChange={(e) => handleRateChange(index, e)} style={{width: '80px'}}/>
                                <label><input type="checkbox" name="rate_per_thousand" checked={!!rate.rate_per_thousand} onChange={(e) => handleRateChange(index, e)} /> Per $1k</label>
                            </>
                        )}
                        <button type="button" onClick={() => removeRateRow(index)} className="action-button-delete action-button-small">X</button>
                    </div>
                ))}
                <button type="button" onClick={addRateRow} className="action-button-small">Add Row</button>
            </div>
        );
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
                                <option>Medical</option><option>Dental</option><option>Vision</option><option>Life</option><option>Disability</option><option>Critical Illness</option><option>Other</option>
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
                            <label>Rate Model</label>
                            <select name="rate_model" value={currentPlan?.rate_model || 'FLAT'} onChange={handlePlanChange}>
                                <option value="FLAT">Flat Rate (by coverage level)</option>
                                <option value="AGE_BANDED">Age-Banded Rate</option>
                                <option value="COVERAGE_TIER">Coverage Tier Rate (by age & amount)</option>
                            </select>
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
function PlanManagement() {
    const [carriers, setCarriers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEnrollmentActive, setIsEnrollmentActive] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [carrierData, planData, enrollmentPeriods] = await Promise.all([getCarriers(), getBenefitPlans(), getEnrollmentPeriods()]);
        
        setCarriers(carrierData);
        setPlans(planData);
        
        const activePeriod = enrollmentPeriods.find(p => p.status === 'Active');
        setIsEnrollmentActive(!!activePeriod);
        
        setLoading(false);
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
}

export default PlanManagement;