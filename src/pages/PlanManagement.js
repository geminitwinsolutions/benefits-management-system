import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
    getCarriers, addCarrier, updateCarrier, deleteCarrier,
    getBenefitPlans, addBenefitPlanWithRates, updateBenefitPlanWithRates, deleteBenefitPlan,
    getEnrollmentPeriods
} from '../services/benefitService';
import Modal from '../components/Modal';

// --- CarrierManager component is unchanged ---
const CarrierManager = ({ carriers, onUpdate, isEnrollmentActive, selectedCarrier, onSelectCarrier }) => {
    // ... (This component's code remains the same)
};

// --- CORRECTED PlanManager Component ---
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
                summary: plan.summary,
                rate_model: plan.rate_model,
                client_margin: plan.client_margin,
            });
            // Ensure benefit_rates exists and has data before accessing
            setCurrentRates(plan.benefit_rates && plan.benefit_rates.length > 0 ? plan.benefit_rates[0].rates : []);
        } else {
            setCurrentPlan({
                plan_name: '',
                plan_type: 'Medical',
                carrier_id: selectedCarrier?.id || '',
                summary: '',
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

    // --- NEW: Generic handler for simple rate changes (Flat and Age-Banded) ---
    const handleSimpleRateChange = (index, field, value) => {
        const newRates = [...currentRates];
        newRates[index][field] = value;
        setCurrentRates(newRates);
    };

    const addSimpleRateRow = (model) => {
        if (model === 'FLAT') {
            setCurrentRates([...currentRates, { coverage_level: '', carrier_rate: 0 }]);
        } else if (model === 'AGE_BANDED') {
            setCurrentRates([...currentRates, { min_age: 0, max_age: 0, carrier_rate: 0 }]);
        }
    };
    
    const removeSimpleRateRow = (index) => {
        setCurrentRates(currentRates.filter((_, i) => i !== index));
    };

    // --- Handlers for complex tiered rates ---
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
    
    // --- UPDATED: This function now renders UI for all three rate models ---
    const renderRateInputs = () => {
        if (!currentPlan) return null;

        switch (currentPlan.rate_model) {
            case 'FLAT':
                return (
                    <div className="rate-input-container">
                        <table className="simple-table">
                            <thead>
                                <tr>
                                    <th>Coverage Level</th>
                                    <th>Carrier Rate ($)</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRates.map((rate, index) => (
                                    <tr key={index}>
                                        <td><input type="text" value={rate.coverage_level || ''} onChange={(e) => handleSimpleRateChange(index, 'coverage_level', e.target.value)} /></td>
                                        <td><input type="number" step="0.01" value={rate.carrier_rate || ''} onChange={(e) => handleSimpleRateChange(index, 'carrier_rate', e.target.value)} /></td>
                                        <td><button type="button" onClick={() => removeSimpleRateRow(index)} className="action-button-delete action-button-small">X</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button type="button" onClick={() => addSimpleRateRow('FLAT')} className="action-button-small" style={{marginTop: '10px'}}>+ Add Rate</button>
                    </div>
                );

            case 'AGE_BANDED':
                return (
                    <div className="rate-input-container">
                        <table className="simple-table">
                            <thead>
                                <tr>
                                    <th>Min Age</th>
                                    <th>Max Age</th>
                                    <th>Carrier Rate ($)</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRates.map((rate, index) => (
                                    <tr key={index}>
                                        <td><input type="number" value={rate.min_age || ''} onChange={(e) => handleSimpleRateChange(index, 'min_age', e.target.value)} /></td>
                                        <td><input type="number" value={rate.max_age || ''} onChange={(e) => handleSimpleRateChange(index, 'max_age', e.target.value)} /></td>
                                        <td><input type="number" step="0.01" value={rate.carrier_rate || ''} onChange={(e) => handleSimpleRateChange(index, 'carrier_rate', e.target.value)} /></td>
                                        <td><button type="button" onClick={() => removeSimpleRateRow(index)} className="action-button-delete action-button-small">X</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button type="button" onClick={() => addSimpleRateRow('AGE_BANDED')} className="action-button-small" style={{marginTop: '10px'}}>+ Add Age Band</button>
                    </div>
                );

            case 'AGE_BANDED_TIER':
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
                                                <td><input type="number" value={rate.amount || ''} onChange={(e) => handleTieredRateChange(bandIndex, rateIndex, 'amount', e.target.value)} /></td>
                                                <td><input type="number" step="0.01" value={rate.premium || ''} onChange={(e) => handleTieredRateChange(bandIndex, rateIndex, 'premium', e.target.value)} /></td>
                                                <td><button type="button" onClick={() => removeRateFromBand(bandIndex, rateIndex)} className="action-button-delete action-button-small">X</button></td>
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

            default:
                return <p>Please select a rate model.</p>;
        }
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
                            <textarea name="summary" value={currentPlan?.summary || ''} onChange={handlePlanChange} />
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
    // ... (This component's code remains the same)
};

export default PlanManagement;